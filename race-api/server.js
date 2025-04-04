const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;

const drivers = [
  {
    bib: 77,
    name: "Pedro Sereno",
    finalTime: "",
    gap: "",
    onTrack: false,
    raceCompleted: false
  },
  {
    bib: 44,
    name: "Rayne Ramirez",
    finalTime: "",
    gap: "",
    onTrack: false,
    raceCompleted: false
  },
  {
    bib: 33,
    name: "Jaime Pascualin",
    finalTime: "",
    gap: "",
    onTrack: false,
    raceCompleted: false
  },
  {
    bib: 26,
    name: "Diego Torres",
    finalTime: "",
    gap: "",
    onTrack: false,
    raceCompleted: false
  }
];

function getNextDriver() {
  // Find the first driver who hasn't completed their race
  return drivers.find(driver => !driver.raceCompleted);
}

function simulateRace(driver) {
  if (!driver) return null;
  
  // Mark driver as on track
  driver.onTrack = true;
  
  // Simulate driver's race progression
  const raceTime = Math.floor(Math.random() * (10000 - 5000) + 5000); // Random race duration
  
  return {
    name: driver.name,
    bib: driver.bib,
    finalTime: new Date().toISOString(), // Current timestamp as final time
    gap: `+${Math.random().toFixed(3)}`, // Simulated gap
    onTrack: true,
    raceTime: raceTime
  };
}

function simulateRaceEnd(driver) {
  if (!driver) return null;
  
  // Mark driver as off track and race completed
  const driverIndex = drivers.findIndex(d => d.bib === driver.bib);
  if (driverIndex !== -1) {
    drivers[driverIndex].onTrack = false;
    drivers[driverIndex].raceCompleted = true;
    drivers[driverIndex].finalTime = driver.finalTime;
    drivers[driverIndex].gap = driver.gap;
  }
  
  return {
    name: driver.name,
    bib: driver.bib,
    finalTime: driver.finalTime,
    gap: driver.gap,
    onTrack: false,
    raceCompleted: true
  };
}

async function sendToWebhook(eventData) {
  const webhookUrl = "http://localhost:4000/api/webhook";
  try {
    await axios.post(webhookUrl, eventData);
    console.log("Evento enviado:", eventData);
  } catch (error) {
    console.error("Error enviando al webhook:", error.message);
  }
}

let currentDriver = null;

function startNextRace() {
  // If all drivers have completed, stop
  if (drivers.every(driver => driver.raceCompleted)) {
    console.log("All drivers have completed the race");
    return;
  }
  
  // Get next driver who hasn't completed their race
  const nextDriver = getNextDriver();
  
  if (nextDriver) {
    // Simulate race start
    currentDriver = simulateRace(nextDriver);
    if (currentDriver) {
      sendToWebhook(currentDriver);
      
      // Set a timeout to end the driver's race
      setTimeout(() => {
        const endEvent = simulateRaceEnd(nextDriver);
        if (endEvent) {
          sendToWebhook(endEvent);
        }
        
        // Start next race immediately after this one ends
        startNextRace();
      }, currentDriver.raceTime);
    }
  }
}

// Start the first race
startNextRace();

app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});
