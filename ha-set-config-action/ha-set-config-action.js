module.exports = function(RED) {
	function SetConfigAction(config) {
		RED.nodes.createNode(this, config);
		
		this.actionTrigger = config.actionTrigger;
		this.actionMode = config.actionMode;
		this.actionType = config.actionType;
		this.actionLongpress = config.actionLongpress;
		this.actionConfigSwitch = config.actionConfigSwitch;

		this.actionSkipWhenDelayDeviceId = config.actionSkipWhenDelayDeviceId;
		this.actionSkipWhenDelayPorts = config.actionSkipWhenDelayPorts;

		this.actionClearDelayDeviceId = config.actionClearDelayDeviceId;
		this.actionClearDelayPorts = config.actionClearDelayPorts;

		this.actionDeviceId = config.actionDeviceId;
		this.actionPorts = config.actionPorts;
		this.actionDelay = config.actionDelay;

		this.on('input', async (msg, send, done) => {
			if (!(msg.payload instanceof Array)) {
				msg.payload = [];
			}
			msg.payload.push({
				"trigger": this.actionTrigger,
				"mode": this.actionMode,
				"type": this.actionType,
				"longpress": this.actionLongpress && !Number.isNaN(Number(this.actionLongpress)) ? Number(this.actionLongpress) : 0,
				"configSwitch": this.actionConfigSwitch && !Number.isNaN(Number(this.actionConfigSwitch)) ? Number(this.actionConfigSwitch) : 0,
				"output": {
					"skipWhenDelayDeviceId": this.actionSkipWhenDelayDeviceId && !Number.isNaN(Number(this.actionSkipWhenDelayDeviceId)) ? Number(this.actionSkipWhenDelayDeviceId) : null,
					"skipWhenDelayPorts": this.actionSkipWhenDelayPorts ? this.actionSkipWhenDelayPorts : [],
					"clearDelayDeviceId": this.actionClearDelayDeviceId && !Number.isNaN(Number(this.actionClearDelayDeviceId)) ? Number(this.actionClearDelayDeviceId) : null,
					"clearDelayPorts": this.actionClearDelayPorts ? this.actionClearDelayPorts : [],
					"deviceId": this.actionDeviceId && !Number.isNaN(Number(this.actionDeviceId)) ? Number(this.actionDeviceId) : null,
					"ports": this.actionPorts ? this.actionPorts : [],
					"delay": this.actionDelay && !Number.isNaN(Number(this.actionDelay)) ? Number(this.actionDelay) : 0
				}
			})
			try {
				send(msg);
			} catch (error) {
				done(error);
			}
		});
	}
	RED.nodes.registerType("ha-set-config-action", SetConfigAction);
}