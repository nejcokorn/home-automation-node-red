module.exports = function(RED) {
	function Agent(config) {
		RED.nodes.createNode(this, config);
		this.url = config.url;
		this.canbus = config.canbus;
	}

	RED.nodes.registerType("ha-agent", Agent);
}