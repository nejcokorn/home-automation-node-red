module.exports = function(RED) {
	function GetPort(config) {
		RED.nodes.createNode(this, config);
		this.deviceId = config.deviceId;
		this.direction = config.direction;
		this.port = config.port;
		this.agent = config.agent;
		this.agentNode = RED.nodes.getNode(config.agent);

		this.on('input', async (msg, send, done) => {
			try {
				if (!this.agentNode) {
					return done(Error("Configure Home Automation agent."));
				}
				
				const response = await fetch(`${this.agentNode.url}/can/${this.agentNode.canbus}/device/${this.deviceId}/digital/${this.direction}/${this.port}`);
				const json = await response.json();

				send({ payload: json.data });
			} catch (error) {
				done(error);
			}
		});
	}
	RED.nodes.registerType("ha-get-port", GetPort);
}