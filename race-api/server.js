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
  },
  {
    bib: 44,
    name: "Rayne Ramirez",
    finalTime: "",
    gap: "",
  },
  {
    bib: 33,
    name: "Jaime Pascualin",
    finalTime: "",
    gap: "",
  },
  {
    bib: 26,
    name: "Diego Torres",
    finalTime: "",
    gap: "",
  },
];

function simulateRace() {
  const driver = drivers[Math.floor(Math.random() * drivers.length)];
  return {
    name: driver.name,
    bib: driver.bib,
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

setInterval(() => {
  const eventData = simulateRace();
  if (eventData) {
    sendToWebhook(eventData);
  }
}, random(10000, 40000));

app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});
