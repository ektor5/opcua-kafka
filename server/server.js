var opcua = require("node-opcua");

// Let's create an instance of OPCUAServer
var server = new opcua.OPCUAServer({port: 4334});
var siteName = 'site01';

var var1 = {nodeId: 'ns=4;s=hook_weight', browseName: 'hook_weight', dataType: 'Double'};
var var2 = {nodeId: 'ns=4;s=rpm', browseName: 'rpm', dataType: 'Double'};

function post_initialize(){
	console.log("server initialized");
	function construct_my_address_space(server) {
		//   server.engine.createFolder("RootFolder",{ browseName: siteName});
		// emulate variable1 changing every 500 ms
	}

	opcua.build_address_space_for_conformance_testing(server.engine.addressSpace);
	//opcua.install_optional_cpu_and_memory_usage_node(server);
	const addressSpace = server.engine.addressSpace;
	const rootFolder = addressSpace.findNode("RootFolder");
	//assert(rootFolder.browseName.toString() === "Root");
	const namespace = addressSpace.getOwnNamespace();
	const myDevices = namespace.addFolder(rootFolder.objects, {browseName: siteName});
	const Variant = opcua.Variant;
	const DataType = opcua.DataType;
	const DataValue = opcua.DataValue;
	
	let variable1 = 1;
	setInterval(function(){ variable1 += 1; }, 1000);

	server.var1 = namespace.addVariable({
		organizedBy: myDevices,
		browseName: siteName,
		nodeId: "ns=1;s=hook_weight",
		dataType: "Double",
		value: {
			get: function () {
				return new opcua.Variant({dataType: opcua.DataType.Double, value: variable1 });
			}
		}

	});

	server.var2 = namespace.addVariable({
		organizedBy: myDevices,
		browseName: siteName,
		nodeId: "ns=1;s=rpm",
		dataType: "Double",
		value: new Variant({dataType: DataType.Double, value: 10})
	});

	server.start(function() {
		console.log("Server is now listening ... ( press CTRL+C to stop)");
		console.log("port ", server.endpoints[0].port);
		var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
		console.log(" the primary server endpoint url is ", endpointUrl );
	});
}
server.initialize(post_initialize);
