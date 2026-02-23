module.exports = function(RED) {
	function SetConfigAction(config) {
		RED.nodes.createNode(this, config);

		this.on('input', async (msg, send, done) => {
			if (!(msg.payload instanceof Array)) {
				msg.payload = [];
			}

			const resolveValue = (value, meta, fallbackType) => {
				const type = (meta && typeof meta === "object" && meta.type) ? meta.type : (typeof meta === "string" ? meta : fallbackType);
				return RED.util.evaluateNodeProperty(value, type, this, msg);
			};
			const toNumber = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : (fallback !== undefined ? fallback : null);

			const actionTrigger = resolveValue(config.actionTrigger, config.actionTriggerMetadata, "str");
			const actionMode = resolveValue(config.actionMode, config.actionModeMetadata, "str");
			const actionType = resolveValue(config.actionType, config.actionTypeMetadata, "str");
			const actionLongpress = resolveValue(config.actionLongpress, config.actionLongpressMetadata, "num");
			const actionConfigSwitch = resolveValue(config.actionConfigSwitch, config.actionConfigSwitchMetadata, "num");
			const actionSkipWhenDelayDeviceId = resolveValue(config.actionSkipWhenDelayDeviceId, config.actionSkipWhenDelayDeviceIdMetadata, "num");
			const actionClearDelayDeviceId = resolveValue(config.actionClearDelayDeviceId, config.actionClearDelayDeviceIdMetadata, "num");
			const actionDeviceId = resolveValue(config.actionDeviceId, config.actionDeviceIdMetadata, "num");
			const actionDelay = resolveValue(config.actionDelay, config.actionDelayMetadata, "num");

			const actionSkipWhenDelayPorts = Array.isArray(config.actionSkipWhenDelayPorts) ? config.actionSkipWhenDelayPorts : [];
			const actionClearDelayPorts = Array.isArray(config.actionClearDelayPorts) ? config.actionClearDelayPorts : [];
			const actionPorts = Array.isArray(config.actionPorts) ? config.actionPorts : [];

			msg.payload.push({
				trigger: actionTrigger,
				mode: actionMode,
				type: actionType,
				longpress: toNumber(actionLongpress, 0),
				configSwitch: toNumber(actionConfigSwitch, 0),
				output: {
					skipWhenDelayDeviceId: toNumber(actionSkipWhenDelayDeviceId),
					skipWhenDelayPorts: actionSkipWhenDelayPorts,
					clearDelayDeviceId: toNumber(actionClearDelayDeviceId),
					clearDelayPorts: actionClearDelayPorts,
					deviceId: toNumber(actionDeviceId),
					ports: actionPorts,
					delay: toNumber(actionDelay, 0)
				}
			})
			send(msg);
		});
	}
	RED.nodes.registerType("ha-set-config-action", SetConfigAction);
}
