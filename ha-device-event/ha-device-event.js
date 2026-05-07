const mqtt = require("mqtt");

module.exports = function(RED) {
	function DeviceEvent(config) {
		RED.nodes.createNode(this, config);

		const node = this;
		const agentNode = RED.nodes.getNode(config.agent);
		if (!agentNode) {
			node.status({ fill: "red", shape: "ring", text: "missing agent" });
			node.error(Error("Configure Home Automation agent."));
			return;
		}

		const mqttUrl = agentNode.mqttUrl || process.env.MQTT_URL || "mqtt://localhost:1883";
		const deviceId = config.deviceId || "+";
		const topic = `can/${agentNode.canbus}/device/${deviceId}/+/+`;
		const inputPort = config.inputPort === undefined || config.inputPort === "" ? null : Number(config.inputPort);
		const outputPort = config.outputPort === undefined || config.outputPort === "" ? null : Number(config.outputPort);
		const listenInput = config.listenInput !== false;
		const listenOutput = config.listenOutput !== false;

		const options = {
			clientId: `ha-device-event-${node.id}`,
			username: agentNode.mqttUsername || undefined,
			password: agentNode.mqttPassword || undefined,
			reconnectPeriod: 5000,
			clean: true
		};

		node.status({ fill: "yellow", shape: "ring", text: "connecting" });
		node.client = mqtt.connect(mqttUrl, options);

		node.client.on("connect", () => {
			node.client.subscribe(topic, (error) => {
				if (error) {
					node.status({ fill: "red", shape: "ring", text: "subscribe failed" });
					node.error(error);
					return;
				}
				node.status({ fill: "green", shape: "dot", text: topic });
			});
		});

		node.client.on("message", (topic, payload) => {
			try {
				const parts = topic.split("/");
				const event = {
					iface: parts[1],
					deviceId: Number(parts[3]),
					direction: parts[4],
					port: Number(parts[5])
				};

				if (event.direction === "input") {
					if (!listenInput) return;
					if (inputPort !== null && event.port !== inputPort) return;
				} else if (event.direction === "output") {
					if (!listenOutput) return;
					if (outputPort !== null && event.port !== outputPort) return;
				} else {
					return;
				}

				const data = JSON.parse(payload.toString("utf8"));
				node.send({
					topic,
					payload: data,
					event
				});
			} catch (error) {
				node.error(error);
			}
		});

		node.client.on("reconnect", () => {
			node.status({ fill: "yellow", shape: "ring", text: "reconnecting" });
		});

		node.client.on("error", (error) => {
			node.status({ fill: "red", shape: "ring", text: "mqtt error" });
			node.error(error);
		});

		node.on("close", (removed, done) => {
			if (!node.client) {
				done();
				return;
			}
			node.client.end(true, {}, done);
		});
	}

	RED.nodes.registerType("ha-device-event", DeviceEvent);
}
