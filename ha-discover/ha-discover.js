module.exports = function(RED) {
	function Discover(config) {
		RED.nodes.createNode(this, config);

		this.on('input', async (msg, send, done) => {
			try {
				const agentNode = RED.nodes.getNode(config.agent);
				if (!agentNode) {
					return done(Error("Configure Home Automation agent."));
				}
				const response = await fetch(`${agentNode.url}/can/${agentNode.canbus}/device`);
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
	RED.nodes.registerType("ha-discover", Discover);
}
