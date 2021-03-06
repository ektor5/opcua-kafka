opcua-kafka
===========

Example of an OPCUA compliant server, and an OPCUA compliant client subscribing to the server and publishing tag readings to Kafka 0.8

After following the [Kafka quickstart](https://kafka.apache.org/documentation.html#quickstart), and [installing NodeJS](http://nodejs.org/download/):
```
git clone https://github.com/randerzander/opcua-kafka
cd opcua-kafka/server
npm install
cd ../client
npm install
cd ..
node server/server.js &
node client/client.js "ns=4;s=hook_weight"
```

**Note**: The above assumes an Apache Zookeeper instance is running on localhost:2181

A big **thank you** to the people at [node-opcua](https://github.com/node-opcua) and [kafka-node](https://github.com/SOHU-Co/kafka-node) who did all the heavy lifting already!
