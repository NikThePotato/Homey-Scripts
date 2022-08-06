//args[0] = "send niklas"

// Get all times since last reset
let msBetween = new Date() - new Date(global.get("time_of_reset"))
let secondsBetween = Math.round((msBetween / 1000) * 100) / 100
let minutesBetween = Math.round((secondsBetween / 60) * 100) / 100
let hoursBetween = Math.round((minutesBetween / 60) * 100) / 100
let powerMonitor = YOUR OWN ENERGY MONITORING SYSTEM

// All users are defined in a global variable which we can grab
users = global.get("users")

// Make sure args[0] is lowercase since variables are case sensitive
if (typeof args[0] == "string") {
  args[0] = args[0].toLowerCase();
  log(args[0])
  log(args[0].split(" ")[1])
}

// Define a function to send the flow to any user (userInfo)
function getCardAction(userInfo, textToSend) {
  action = {
    id: 'push_text',
    uri: 'homey:manager:mobile',
    group: 'then',
    delay: null,
    duration: null,
    args: {
      user: userInfo,
      text: textToSend
    }
  }
  return action; 
}


// If the user sends no arguments; update average energy
if (args[0] == null){
  log("Argument: null")
  // Define devices with Homey's built in getDevices() function
  const devices = await Homey.devices.getDevices()
  
  // Loop through all devices
  for (let device of Object.values(devices)) {
    // If device name is the name of wanted power-measuring device
    if (device.name == powerMonitor) {
      // Set energy variable to the energy the device has measured (measured in Watt)
      pulse_energy = device.capabilitiesObj.measure_power.value
    }
  }

  // Check if the value is a new daily highest
  if (pulse_energy > global.get("strøm_highest_24")) {
    // Set global value of daily highest power to current power
    global.set("strøm_highest_24", pulse_energy)

    // Set global value of when the highest value happened to current time
    global.set("time_of_highest", new Date())
  }

  // Set total strøm checks for the last day to be itself + 1
  global.set("total_strøm_checks_24", global.get("total_strøm_checks_24")+1)

  // Define energy as the value from your monitoring system for energy
  energy = pulse_energy
  // Old_energy grabs the last updated energy value
  old_energy = global.get("strøm_avg_24") 

  // New_energy is the old value + the current added value divided by total.
  new_energy = (energy + (old_energy * (global.get("total_strøm_checks_24") - 1))) / global.get("total_strøm_checks_24")
  // Set the global value to the new energy value
  global.set("strøm_avg_24", new_energy)

  log (Math.round(global.get("strøm_avg_24") * 100) / 100)
  log (global.get("total_strøm_checks_24"))
  

} else if (args[0] == "reset") {
  // If argument is "reset", reset all the values (Daily update)
  global.set("time_of_reset", new Date())
  global.set("time_of_highest", new Date())
  global.set("strøm_highest_24", 0)
  global.set("strøm_avg_24", 0)
  global.set("total_strøm_checks_24", 0)

} else if (args[0].split(" ")[0] == "send") {
  log(args[0].split(" ")[0], args[0].split(" ")[1])
  // If the argument is "send", send the average energy to user specified after "send". example: "send niklas" will send to user niklas

  // Send daily update to user specified after "send"
  await Homey.flow.runFlowCardAction(getCardAction(
    userInfo = users[args[0].split(" ")[1]],
    textToSend = ("Gjennomsnittlig strømbruk etter " + hoursBetween + " Timer: " + (Math.round(global.get("strøm_avg_24") * 100) / 100) + " Watt. \n(Sjekket " + global.get("total_strøm_checks_24") + " ganger)" + "\n-----------------------------\n" + "Daglig høyeste strømbruk: " + global.get("strøm_highest_24") + ", skjedde kl. " + new Date(global.get("time_of_highest")).toLocaleTimeString('nb', { timeZone: 'CET', hour: '2-digit', minute: '2-digit' }))
    )
  )
}