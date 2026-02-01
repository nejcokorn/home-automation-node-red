module.exports = function(RED) {
	function ListDelays(config) {
		RED.nodes.createNode(this, config);
		this.deviceId = config.deviceId;
		this.agent = config.agent;
		this.agentNode = RED.nodes.getNode(config.agent);

		this.on('input', async (msg, send, done) => {
			try {
				if (!this.agentNode) {
					return done(Error("Configure Home Automation agent."));
				}

				const response = await fetch(`${this.agentNode.url}/can/${this.agentNode.canbus}/device/${this.deviceId}/delay`);
				const json = await response.json();

				send({ payload: json.data });
			} catch (error) {
				done(error);
			}
		});
	}
	RED.nodes.registerType("ha-list-delays", ListDelays);
}