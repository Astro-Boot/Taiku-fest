import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useTransition, animated } from 'react-spring';

// Import images
import logoFest from './assets/timing-screen-logofest_03.png';
import ebLogo from './assets/timing-screen-eblogo_03.png';
import photoFrame from './assets/timing-screen-photoframe_03.png';
import enPistaImage from './assets/timing-screen-en-pista_03.png';
import sponsorsImage from './assets/timing-screen-sponsors_03.png';
import texture from './assets/timing-screen-background_01.png';

const socket = io('http://localhost:4000');

// Función para convertir tiempo de formato 'mm:ss.SS' a segundos
const timeToSeconds = (time) => {
    if (!time) return Number.MAX_VALUE;
    const [minutes, seconds] = time.split(':');
    return parseFloat(minutes) * 60 + parseFloat(seconds);
};

function RaceEvent() {
    const [drivers, setDrivers] = useState([
	]);

    // New state for timer with start time
    const [startTime, setStartTime] = useState(Date.now());
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Timer effect to increment every frame
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(Date.now());
        }, 10); // Update every 10ms for smoother millisecond tracking

        return () => clearInterval(intervalId);
    }, []);

    // Efecto para recalcular tiempos y posiciones constantemente
    useEffect(() => {
        // Ordenar conductores por tiempo
        const sortedDrivers = [...drivers].sort((a, b) => {
            if (!a.finalTime) return 1;
            if (!b.finalTime) return -1;
            return timeToSeconds(a.finalTime) - timeToSeconds(b.finalTime);
        });

        // Calcular gaps
        const fastestTime = sortedDrivers.find(driver => driver.finalTime)?.finalTime;
        const updatedDrivers = sortedDrivers.map((driver, index) => {
            if (!driver.finalTime) return driver;
            
            // Si es el primer conductor con tiempo, no tiene gap
            if (index === 0) {
                return { ...driver, gap: '' };
            }
            
            // Calcular gap respecto al primer tiempo
            const driverSeconds = timeToSeconds(driver.finalTime);
            const fastestSeconds = timeToSeconds(fastestTime);
            const gapSeconds = driverSeconds - fastestSeconds;
            
            // Formatear gap
            const gapMinutes = Math.floor(gapSeconds / 60);
            const gapSecondsRemainder = (gapSeconds % 60).toFixed(2).padStart(5, '0');
            const formattedGap = gapMinutes > 0 
                ? `${gapMinutes}:${gapSecondsRemainder}` 
                : `00:${gapSecondsRemainder}`;
            
            return { 
                ...driver, 
                gap: formattedGap 
            };
        });

        // Solo actualizar si hay cambios
        const needsUpdate = JSON.stringify(updatedDrivers) !== JSON.stringify(drivers);
        if (needsUpdate) {
            setDrivers(updatedDrivers);
        }
    }, [drivers]);

    // Escuchar actualizaciones desde Socket.IO
    useEffect(() => {
        console.log('Conectado al servidor de Socket.IO');
        socket.on('race-update', (newDriverData) => {
            console.log('Recibiendo actualización de carrera:', newDriverData);
            
            // Reset timer when new race data is received
            setStartTime(Date.now());
            setCurrentTime(Date.now());
            
            setDrivers((prevDrivers) => {
                // Verificar si el corredor ya existe por 'bib'
                const driverExists = prevDrivers.some((driver) => driver.bib === newDriverData.bib);

                let updatedDrivers;
                if (driverExists) {
                    // Actualizar datos del corredor existente
                    updatedDrivers = prevDrivers.map((prevDriver) =>
                        prevDriver.bib === newDriverData.bib ? { ...prevDriver, ...newDriverData } : prevDriver
                    );
                } else {
                    // Añadir nuevo corredor si no existe
                    updatedDrivers = [...prevDrivers, { ...newDriverData }];
                }

                return updatedDrivers;
            });
        });

        // Limpiar la conexión al desmontar el componente
        return () => {
            socket.off('race-update');
        };
    }, []);

    // Helper function to format timer
    const formatTimer = () => {
        const totalMilliseconds = currentTime - startTime;
        const hours = Math.floor(totalMilliseconds / 3600000);
        const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
        const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
        const milliseconds = totalMilliseconds % 1000;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    };

    // Configurar animaciones con react-spring
    const transitions = useTransition(drivers, {
        keys: (driver) => driver.bib,
        from: { opacity: 0, transform: 'translateY(20px)' },
        enter: { opacity: 1, transform: 'translateY(0px)' },
        update: { opacity: 1, transform: 'translateY(0px)' },
        leave: { opacity: 0, transform: 'translateY(-20px)' },
        trail: 100,
    });

    return (
        <div
            className="h-screen w-screen overflow-hidden bg-gradient-to-b from-black/50 to-black/50 bg-cover bg-center bg-no-repeat font-['Smooch_Sans'] font-bold uppercase tracking-wider"
        >
            <div className="container relative z-10 h-full max-w-[750px] bg-contain bg-no-repeat" style={{ backgroundImage: `url(${texture})` }}>
                <div className="content">
                    <div className="tabla absolute left-[20%] top-[10%] h-[650px] w-[71%] rounded-[3px] bg-black/80">
                        <div className="logo relative top-[-70px] left-[10%] h-[100px]">
                            <img src={logoFest} alt="" className="w-[200px]" />
                        </div>
                        <div className="heading flex relative -left-[10%] items-center gap-5 bg-[#dbd0ca] p-[5px_20px] rounded-[3px] shadow-[-5px_7px_5px_0px_rgba(0,0,0,0.75)]">
                            <img src={ebLogo} alt="" className="w-10" />
                            <h1 className="text-[42px]">DOWNHILL TIMING - RACE RUN</h1>
                        </div>
                        <table className="w-full text-[24px] text-white">
                            <tbody>
                                {transitions((style, driver, _, index) => (
                                    <animated.tr
                                        style={style}
                                        key={driver.bib}
                                        className="odd:bg-[#323232]"
                                    >
                                        <td className="px-4 py-2 font-bold text-white">{index + 1}.</td>
                                        <td className="px-4 py-2">{driver.name}</td>
                                        <td className="px-4 py-2">{driver.finalTime}</td>
                                        <td className={`px-4 py-2 ${driver.gap ? 'text-[#fb3c54]' : ''}`}>{driver.gap ? `+${driver.gap}` : ''}</td>
                                    </animated.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Placeholder para simular el espacio de la pantalla de pista */}
                    <div className="place_holder h-[750px] w-full"></div>
                    {/* Elemento de la pantalla de pista */}
                    <div className="on_track relative w-[80%] left-[20%] h-[150px] flex rounded-[3px] ">
                        {/* Texto */}
                        <div className="text absolute top-[10%] p-[0_20px] w-[85%] z-10 flex flex-wrap justify-between text-[30px] text-white">
                            <p>En pista</p>
                            <div className="flex items-center gap-5">
                                <div className="driver-info flex items-center gap-2">
                                    <span className="profile-img">
                                        <img
                                            src={photoFrame}
                                            alt=""
                                            width="40"
                                            height="40"
                                        />
                                    </span>
                                    <span>{drivers[0]?.name || 'null'}</span>
                                </div>
                            </div>
                            <p className="text-[#d0de0e] self-end basis-[150px]">{formatTimer()}</p>
                        </div>
                        {/* Image */}
                        <div className="image absolute top-[-30%] left-[-7.5%] z-[1] h-auto w-full">
                            <img src={enPistaImage} alt="" className="w-full h-full object-cover" />
                        </div>
                        {/* Sponsors */}
                        <div className="sponsors absolute top-[40%] z-10 w-[calc(100%-80px)] max-w-[650px]">
                            <img src={sponsorsImage} alt="" className="w-full" />
                        </div>
                    </div> 
                    {/* Fin del elemento de la pantalla de pista */}
                </div>
            </div>
        </div>
    );
}
export default RaceEvent;
