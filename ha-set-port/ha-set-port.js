module.exports = function(RED) {
	function SetPort(config) {
		RED.nodes.createNode(this, config);
		this.deviceId = config.deviceId;
		this.port = config.port;
		this.agent = config.agent;
		this.agentNode = RED.nodes.getNode(config.agent);

		this.on('input', async (msg, send, done) => {
			try {
				if (!this.agentNode) {
					return done(Error("Configure Home Automation agent."));
				}
				
				const response = await fetch(
					`${this.agentNode.url}/can/${this.agentNode.canbus}/device/${this.deviceId}/digital/output/${this.port}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							type: this.type,
							delay: this.delay
						})
					}
				);
				const json = await response.json();

				send({ payload: json.data });
			} catch (error) {
				done(error);
			}
		});
	}
	RED.nodes.registerType("ha-set-port", SetPort);
}