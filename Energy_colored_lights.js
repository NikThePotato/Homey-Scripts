const devices = await Homey.devices.getDevices();
powerMeasurer = <"YOUR OWN POWER MEASURING SYSTEM">
let powerDimmer = 0.0 
let standard = 0.4 // Green
let dividor = 3 // The amount to divide power by
// Change dividor to a higher number for a less sensitive reaction (3 will display fully red around 12kw power consumption)
// Change dividor to a lower number for a more sensitive reaction (1 will display fully red around 4kw power consumption)
// Color will be red at (4*dividor)kw power consumption

// Loop over all devices
for (const device of Object.values(devices)) {
  if (device.name == powerMeasurer) {
    powerDimmer = device.capabilitiesObj.measure_power.value / 10000
    if (powerDimmer / dividor < standard) { // Make sure the value does not go into negative
      log ("Pre:", powerDimmer)
      powerDimmer = 0.4 - powerDimmer 
    } else {
      powerDimmer = 0.0;
    }

    log("PowerDimmer:", powerDimmer)
  }

  if (device.name == args[0]) { // args[0] is the device you want to change the color of
    log(`\nChanging color of device: '${device.name}'...`);

    // Set all values to the correct amount to display a nice
    // color gradient for the energy consumption. (green to red)
    await device.setCapabilityValue('dim', 0.5)
      .then(() => log('OK'))
      .catch(error => log(`Error:`, error));
    
    await device.setCapabilityValue('light_hue', powerDimmer)
      .then(() => log('OK'))
      .catch(error => log(`Error:`, error));
    
    await device.setCapabilityValue('light_saturation', 1.0)
      .then(() => log('OK'))
      .catch(error => log(`Error:`, error));
  }
}