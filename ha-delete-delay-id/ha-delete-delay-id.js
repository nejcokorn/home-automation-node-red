module.exports = function(RED) {
	function DeleteDelayById(config) {
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

				const deviceId = resolveValue(config.deviceId, config.deviceIdMetadata, "num");
				const actionDelayId = resolveValue(config.actionDelayId, config.actionDelayIdMetadata, "num");

				const response = await fetch(`${agentNode.url}/can/${agentNode.canbus}/device/${deviceId}/delay/${actionDelayId}`,
					{
						method: "DELETE"
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
	RED.nodes.registerType("ha-delete-delay-id", DeleteDelayById);
}
