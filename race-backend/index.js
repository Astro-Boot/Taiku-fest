const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');
const bodyParser = require('body-parser');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: '*',
	},
});

// Middleware para parsear diferentes tipos de datos
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); 
app.use(bodyParser.text({ limit: '50mb' })); 
app.use(bodyParser.raw({ limit: '50mb', type: 'application/octet-stream' })); 

let raceEvents = [];

// Función para convertir cualquier entrada a JSON
function convertToJSON(input) {
	// Si ya es un objeto, devolverlo directamente
	if (typeof input === 'object' && input !== null) {
		return input;
	}

    // Si es un string, intentar parsearlo
    if (typeof input === 'string') {
        // Intentar parsear diferentes formatos
        const cleaningAttempts = [
            // Intento 1: Parseo directo
            () => JSON.parse(input),
            
            // Intento 2: Limpiar y parsear
            () => {
                const cleanedBody = input
                    .replace(/'/g, '"')  // Reemplazar comillas simples por dobles
                    .replace(/(\w+):/g, '"$1":')  // Agregar comillas a las claves
                    .replace(/:\s*([^{}\[\],\s]+)\s*([,}\]])/g, ': "$1"$2')  // Agregar comillas a valores sin comillas
                    .replace(/\\/g, '');  // Eliminar backslashes
                return JSON.parse(cleanedBody);
            },
            
            // Intento 3: Evaluar como objeto JavaScript
            () => {
                // Usar Function constructor para evaluar de forma segura
                return (new Function(`return ${input}`))();
            }
        ];

        // Probar cada método de limpieza
        for (const attempt of cleaningAttempts) {
            try {
                return attempt();
            } catch (error) {
                // Continuar al siguiente método si falla
                continue;
            }
        }

        // Si todos los intentos fallan, lanzar error
        throw new Error('No se pudo convertir el input a JSON');
    }

    // Si es un Buffer, convertirlo a string y luego a JSON
    if (Buffer.isBuffer(input)) {
        return convertToJSON(input.toString());
    }

    // Para cualquier otro tipo, intentar convertir a JSON
    return JSON.parse(JSON.stringify(input));
}

app.post('/api/webhook', (req, res) => {
    try {
        // Intentar convertir el cuerpo a JSON
        const newDriverData = convertToJSON(req.body);

        // Guardar y emitir los datos exactos recibidos
        raceEvents.push(newDriverData);
        io.emit('race-update', newDriverData);
        console.log('Evento recibido:', newDriverData);

        res.json({
            status: 'success',
            message: 'Evento recibido y procesado correctamente',
            data: newDriverData,
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: 'Error al procesar los datos',
            error: error.message,
            receivedBody: req.body
        });
    }
});

// Endpoint para manejar actualizaciones de fotos de conductor
io.on('connection', (socket) => {
    socket.on('driver-photo-update', (data) => {
        // Broadcast the driver photo update to all connected clients
        io.emit('driver-photo-update', data);
    });
});

httpServer.listen(4000, () => {
    console.log('Backend corriendo en http://localhost:4000');
});