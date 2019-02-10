var opcua = require("node-opcua");
var async = require("async");

const kafka = require('kafka-node');
const kclient = new kafka.KafkaClient({kafkaHost: '192.168.0.102:9092'});
const Producer = kafka.Producer;
const producer = new Producer(kclient);

producer.on('ready', function(){console.log('Connected to Kafka!');});
  

//var endpointUrl = "opc.tcp://" + require("os").hostname().toLowerCase() + ":4334/UA/SampleServer";
var endpointUrl = "opc.tcp://" + require("os").hostname().toLowerCase() + ":4334";

var session, subscription;
var tag = process.argv[2];


const securityMode = opcua.MessageSecurityMode.get("NONE");
if (!securityMode) {
    throw new Error("Invalid Security mode , should be " + opcua.MessageSecurityMode.enums.join(" "));
}

const securityPolicy = opcua.SecurityPolicy.get("None");
if (!securityPolicy) {
    throw new Error("Invalid securityPolicy , should be " + opcua.SecurityPolicy.enums.join(" "));
}
const options = {
	securityMode: securityMode,
	securityPolicy: securityPolicy,
	endpoint_must_exist: false,
	keepSessionAlive: true,
	connectionStrategy: {
		maxRetry: 10,
		initialDelay: 2000,
		maxDelay: 10*1000
	}
};

const client = new opcua.OPCUAClient(options);


console.log('ok');
async.series([
	function(callback)  {
		// step 1 : connect to
		client.connect(endpointUrl,function (err) {
			if(err) { console.log(" cannot connect to endpoint :" , endpointUrl ); }
			else { console.log("connected !"); }
			callback(err);
		});
	},

	// step 2 : createSession
	function(callback) {
		let userIdentity = null;
		client.createSession(function(err, _session) {
			if(!err) { session = _session; }
			callback(err);
		});
	},

	// step 5: install a subscription and install a monitored item for 10 seconds
	function(callback) {
		subscription=new opcua.ClientSubscription(session,{
			requestedPublishingInterval: 1000,
			requestedLifetimeCount: 10,
			requestedMaxKeepAliveCount: 2,
			maxNotificationsPerPublish: 10,
			publishingEnabled: true,
			priority: 10
		});

		subscription.on("started",function(){
			console.log("subscriptionId=", subscription.subscriptionId);
		}).on("keepalive",function(){ console.log("ka"); })
			.on("terminated",function(){ callback(); });

		console.log(opcua.AttributeIds.Value );
		// install monitored item
		var monitoredItem  = subscription.monitor(
			{nodeId: opcua.resolveNodeId(tag), attributeId: opcua.AttributeIds.Value },
			{samplingInterval: 100, discardOldest: true, queueSize: 10},
		);
		console.log("-------------------------------------");

		monitoredItem.on("changed",function(dataValue){
			console.log("ChangedVal:", JSON.stringify(dataValue));
			producer.send([
				{topic: 'test',
					messages:[JSON.stringify(dataValue.value.value)],
					partition: 0
				}], function(err, data){
					if (err){ console.log('Error sending: ', err); }
					else{ console.log('Successfully published: ' + new Date() + ', ' + data) }
				});
		});
	}
],
	function(err) {
		if (err) { console.log(" failure ",err); }
		else { console.log('done!'); }
		client.disconnect(function(){});
	});


