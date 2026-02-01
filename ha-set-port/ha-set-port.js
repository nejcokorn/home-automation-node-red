module.exports = function(RED) {
	function SetPort(config) {
		RED.nodes.createNode(this, config);
		this.agent = config.agent;
		this.deviceId = config.deviceId;
		this.actionType = config.actionType;
		this.actionPort = config.actionPort;
		this.actionDelay = config.actionDelay;
		this.agentNode = RED.nodes.getNode(config.agent);

		this.on('input', async (msg, send, done) => {
			try {
				if (!this.agentNode) {
					return done(Error("Configure Home Automation agent."));
				}
				
				const response = await fetch(`${this.agentNode.url}/can/${this.agentNode.canbus}/device/${this.deviceId}/digital/output/${this.actionPort}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							type: this.actionType,
							delay: this.actionDelay && !Number.isNaN(Number(this.actionDelay)) ? Number(this.actionDelay) : 0
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