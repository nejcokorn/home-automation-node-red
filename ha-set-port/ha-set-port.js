module.exports = function(RED) {
	function SetPort(config) {
		RED.nodes.createNode(this, config);

		this.on('input', async (msg, send, done) => {
			try {
				const agentNode = RED.nodes.getNode(config.agent);
				if (!agentNode) {
					return done(Error("Configure Home Automation agent."));
				}
				const resolveValue = (value, meta, fallbackType) => {
					const type = (meta && typeof meta === "object" && meta.type) ? meta.type : (typeof meta === "string" ? meta : fallbackType);
					return RED.util.evaluateNodeProperty(value, type, this, msg);
				};

				// Resolve values with support for dynamic typedInput values (msg, flow, global, env, jsonata)
				const deviceId = resolveValue(config.deviceId, config.deviceIdMetadata, "num");
				const actionPort = resolveValue(config.actionPort, config.actionPortMetadata, "num");
				const actionType = resolveValue(config.actionType, config.actionTypeMetadata, "str");
				const actionDelay = resolveValue(config.actionDelay, config.actionDelayMetadata, "num");

				// HTTP request to agent to set the port state
				const response = await fetch(`${agentNode.url}/can/${agentNode.canbus}/device/${deviceId}/digital/output/${actionPort}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							type: actionType,
							delay: actionDelay
						})
					}
				);
				const json = await response.json();
				if (json.success == true) {
					send({ payload: json.data });
				} else {
					done(json.error);
				}
			} catch (error) {
				done(error);
			}
		});
	}
	RED.nodes.registerType("ha-set-port", SetPort);
}
