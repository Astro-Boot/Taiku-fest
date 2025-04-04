const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const drivers = [
	{
		name: 'BOTTAS Valtteri',
		bib: '77',
	},
	{
		name: 'HAMILTON Lewis',
		bib: '44',
	},
	{
		name: 'OCON Esteban',
		bib: '31',
	},
	{
		name: 'STROLL Lance',
		bib: '18',
	},
	{
		name: 'KVYAT Daniil',
		bib: '26',
	},
	{
		name: 'GIOVINAZZI Antonio',
		bib: '99',
	},
	{
		name: 'RICCIARDO Daniel',
		bib: '3',
	},
	{
		name: 'VERSTAPPEN Max',
		bib: '33',
	},
	{
		name: 'GASLY Pierre',
		bib: '10',
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
	const webhookUrl = 'http://localhost:4000/api/webhook';
	try {
		await axios.post(webhookUrl, eventData);
		console.log('Evento enviado:', eventData);
	} catch (error) {
		console.error('Error enviando al webhook:', error.message);
	}
}

setInterval(() => {
	const eventData = simulateRace();
	if (eventData) {
		sendToWebhook(eventData);
	}
}, 10000);

app.listen(port, () => {
	console.log(`API corriendo en http://localhost:${port}`);
});
