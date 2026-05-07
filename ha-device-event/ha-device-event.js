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

		const resolveValue = (value, meta, fallbackType) => {
			const type = (meta && typeof meta === "object" && meta.type) ? meta.type : (typeof meta === "string" ? meta : fallbackType);
			return RED.util.evaluateNodeProperty(value, type, node, {});
		};

		let deviceId;
		let direction;
		let port;
		try {
			deviceId = resolveValue(config.deviceId, config.deviceIdMetadata, "num");
			direction = resolveValue(config.direction, config.directionMetadata, "str");
			port = resolveValue(config.port, config.portMetadata, "num");

			if (deviceId === undefined || deviceId === null || deviceId === "") {
				throw Error("Device ID is required.");
			}
			if (direction !== "input" && direction !== "output") {
				throw Error("Direction must be input or output.");
			}
			if (port === undefined || port === null || port === "" || Number.isNaN(Number(port))) {
				throw Error("Port must be a number.");
			}
		} catch (error) {
			node.status({ fill: "red", shape: "ring", text: "invalid config" });
			node.error(error);
			return;
		}

		const topic = `can/${agentNode.canbus}/device/${deviceId}/${direction}/${Number(port)}`;

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
