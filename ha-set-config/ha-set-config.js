module.exports = function(RED) {
	function SetConfig(config) {
		RED.nodes.createNode(this, config);

		this.on('input', async (msg, send, done) => {
			if (!(msg.payload instanceof Array)) {
				msg.payload = [];
			}
			try {
				const agentNode = RED.nodes.getNode(config.agent);
				if (!agentNode) {
					return done(Error("Configure Home Automation agent."));
				}

				const resolveValue = (value, meta, fallbackType) => {
					const type = (meta && typeof meta === "object" && meta.type) ? meta.type : (typeof meta === "string" ? meta : fallbackType);
					return RED.util.evaluateNodeProperty(value, type, this, msg);
				};
				const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

				const deviceId = toNumber(resolveValue(config.deviceId, config.deviceIdMetadata, "num"), 0);
				const inputPort = toNumber(resolveValue(config.inputPort, config.inputPortMetadata, "num"), 0);
				const debounce = toNumber(resolveValue(config.debounce, config.debounceMetadata, "num"), 0);
				const doubleclick = toNumber(resolveValue(config.doubleclick, config.doubleclickMetadata, "num"), 0);
				const bypassInstantly = toNumber(resolveValue(config.bypassInstantly, config.bypassInstantlyMetadata, "num"), 0) === 1 ? 1 : 0;
				const bypassOnDisconnect = toNumber(resolveValue(config.bypassOnDisconnect, config.bypassOnDisconnectMetadata, "num"), 0) === 1 ? 1 : 0;

				const response = await fetch(`${agentNode.url}/can/${agentNode.canbus}/device/${deviceId}/config`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify([{
							inputPort,
							debounce,
							doubleclick,
							actions: msg.payload,
							bypassInstantly,
							bypassOnDisconnect
						}])
					}
				);
				const json = await response.json();
				if (json.success == true) {
					send({ payload: json.data });
					if (done) {
						done();
					}
				} else {
					done(json.error);
				}
			} catch (error) {
				done(error);
			}
		});
	}
	RED.nodes.registerType("ha-set-config", SetConfig);
}
