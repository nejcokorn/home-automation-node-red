module.exports = function(RED) {
	function Agent(config) {
		RED.nodes.createNode(this, config);
		this.url = config.url;
		this.canbus = config.canbus;
		this.mqttUrl = config.mqttUrl;
		this.mqttUsername = this.credentials && this.credentials.mqttUsername;
		this.mqttPassword = this.credentials && this.credentials.mqttPassword;
	}

	RED.nodes.registerType("ha-agent", Agent, {
		credentials: {
			mqttUsername: { type: "text" },
			mqttPassword: { type: "password" }
		}
	});
}
