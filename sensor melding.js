
// Hvis ingen argument blir brukt
if (typeof args[0] == "undefined") {
  // Send en feilmelding og avbryt programmet
  throw new Error("No argument specified. try again");
}

// Definer brukere i homey
const homeyUsers = await Homey.users.getUsers()

// Definer en variabel brukt for å sende meldinger til brukere på denne homey
let users = {}

// Definer en variabel som passer på at en melding ikke blir sendt før all informasjon er blitt mottat
let sensorAmount = 5
// Definer navn som det første argumentet når du kjører scriptet fra en flow
let name = args[0].split(", ")[0].toLowerCase()
// Definer enhet som det andre argumentet når du kjører scriptet fra en flow
let enhet = args[0].split(", ")[1]
// Definer status som det tredje argumentet når du kjører scriptet fra en flow
let status = args[0].split(", ")[2]
// Definer melding variabel til det du vil at meldingen din skal være
let message = (`Sensor aktiv ved alarmtilkobling: ${enhet} - ${status}`)

// Definer en funksjon slik at du kan sende en melding til hvilken som helst bruker
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
  return action; // Returner informasjonen
}

// Gå gjennom alle brukere på denne Homey
for (let currentUser of Object.values(homeyUsers)) {
  // Alle brukere på homey-en er defineres med sitt første navn
  userName = currentUser.name.toLowerCase()

  // Lag en liste innenfor denne homey-brukeren sitt navn
  users[userName] = {}

  // Innenfor denne listen legger vi til alt nødvendig informasjon
  users[userName]["name"] = currentUser.name // legg til navn
  users[userName]["id"] = currentUser.id // legg til bruker-id
  users[userName]["image"] = currentUser.avatar // legg till image-id/avatar
  users[userName]["athomId"] = currentUser.athomId // legg til athom-id
}

// Oppdater global variabel for hvor mange sensore som har blitt lest
global.set("sensors_read", global.get("sensors_read") + 1)
// Oppdater global variabel for meldingen som skal bli sent
global.set("current_message",global.get("current_message") + "\n|" + message + "|")

// Ikke send en melding før alle sensorene har blitt mottat
if (global.get("sensors_read") >= sensorAmount) {
  // Kjør en flowcard-action som sender melding til brukeren som blir sendt som første argument/ord fra flowen
  await Homey.flow.runFlowCardAction(getCardAction(
    userInfo = users[name],
    textToSend = global.get("current_message")
  ));
  // Reset globale variabler
  global.set("sensors_read", 0)
  global.set("current_message", "")
}

//debugging
// log(users)
log(global.get("sensors_read"))
log(global.get("current_message"))
