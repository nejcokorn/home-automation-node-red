# home-automation-node-red

Home Automation nodes for Node-RED that talk to the Home Automation Agent over HTTP.  
This contrib is designed to be used with the [Home Automation Agent](https://github.com/nejcokorn/home-automation-agent)

## Requirements

- Node-RED >= 2.0.0

## Install

Install via the Node-RED palette manager or npm:

```bash
npm install node-red-contrib-home-automation
```

## New Release

Create a tag (optional but recommended)
```bash
git tag v1.2.0
git push origin v1.2.0
```

Publish new version to npm and node-red
```bash
# Login
npm adduser
# Publish
npm publish --access public
```

## Nodes

- **ha-agent**: Configure the Home Automation Agent connection.
- **ha-ping**: Check connectivity to the agent/device.
- **ha-discover**: Discover devices on the CAN bus.
- **ha-get-port**: Read a digital output/input port state.
- **ha-set-port**: Set a digital output port state (with optional delay).
- **ha-list-delays**: List active delays on a device.
- **ha-delete-delay-id**: Clear a delay by delay ID.
- **ha-delete-delay-port**: Clear delays by port.
- **ha-set-config-action**: Build an action entry for device configuration.
- **ha-set-config**: Send configuration (actions + input settings) to a device.
- **ha-get-config**: Fetch a device configuration.
- **ha-save-eeprom**: Save the current configuration to device EEPROM.

## Basic usage

1. Add **ha-agent** and configure the agent URL/canbus.
2. Use **ha-discover** or **ha-ping** to validate connectivity.
3. Use **ha-set-config-action** to build actions, then feed into **ha-set-config**.
4. Use **ha-save-eeprom** to persist configuration on the device.

## Example flow

This module expects a Home Automation Agent compatible with the REST endpoints used by the nodes.
If you want a concrete flow example, share your agent base URL and a device ID and I can add one.

## License

MIT
