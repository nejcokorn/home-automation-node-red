module.exports = function(RED) {
	function SetConfig(config) {
		RED.nodes.createNode(this, config);
		
		this.agent = config.agent;
		this.agentNode = RED.nodes.getNode(config.agent);
		this.deviceId = config.deviceId;
		this.inputPort = config.inputPort;
		this.debounce = config.debounce;
		this.doubleclick = config.doubleclick;
		this.bypassInstantly = config.bypassInstantly;
		this.bypassOnDisconnect = config.bypassOnDisconnect;

		this.on('input', async (msg, send, done) => {
			if (!(msg.payload instanceof Array)) {
				msg.payload = [];
			}
			try {
				if (!this.agentNode) {
					return done(Error("Configure Home Automation agent."));
				}

				console.log(JSON.stringify([{
							inputPortIdx: this.inputPort && !Number.isNaN(Number(this.inputPort)) ? Number(this.inputPort) : 0,
							debounce: this.debounce && !Number.isNaN(Number(this.debounce)) ? Number(this.debounce) : 0,
							doubleclick: this.doubleclick && !Number.isNaN(Number(this.doubleclick)) ? Number(this.doubleclick) : 0,
							actions: msg.payload,
							bypassInstantly: this.bypassInstantly == 1 ? 1 : 0,
							bypassOnDisconnect: this.bypassOnDisconnect == 1 ? 1 : 0
						}]));
				

				const response = await fetch(`${this.agentNode.url}/can/${this.agentNode.canbus}/device/${this.deviceId}/config`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify([{
							inputPortIdx: this.inputPort && !Number.isNaN(Number(this.inputPort)) ? Number(this.inputPort) : 0,
							debounce: this.debounce && !Number.isNaN(Number(this.debounce)) ? Number(this.debounce) : 0,
							doubleclick: this.doubleclick && !Number.isNaN(Number(this.doubleclick)) ? Number(this.doubleclick) : 0,
							actions: msg.payload,
							bypassInstantly: this.bypassInstantly == 1 ? 1 : 0,
							bypassOnDisconnect: this.bypassOnDisconnect == 1 ? 1 : 0
						}])
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
	RED.nodes.registerType("ha-set-config", SetConfig);
}