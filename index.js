import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Esta es la URL REAL de la API con tu token
// (Basado en los archivos que me diste)
const GTFS_RT_URL = "https://datamanager.dtpr.transapp.cl/data/gtfs-rt/chillan.proto?apikey=" + process.env.GTFS_RT_URL;

let cachedBusBuffer = null; // Aquí guardaremos el archivo binario

async function fetchAndCacheData() {
  console.log("Buscando datos .proto de la API de Chillán...");
  try {
    const response = await axios.get(GTFS_RT_URL, {
      responseType: 'arraybuffer' // ¡MUY IMPORTANTE: pedimos el archivo binario!
    });
    
    cachedBusBuffer = response.data; // Guardamos el archivo binario en la caché
    console.log("¡Éxito! Buffer .proto actualizado en memoria.");
    
  } catch (error) {
    console.error("Error al buscar datos .proto:", error.message);
  }
}

app.use(cors());

// ¡Importante! Escuchamos en la *misma ruta* que tu app espera: "data/gtfs-rt/chillan.proto"
app.get('/data/gtfs-rt/chillan.proto', (req, res) => {
  if (cachedBusBuffer) {
    // Le decimos al navegador/app que esto es un archivo protobuf
    res.set('Content-Type', 'application/x-protobuf');
    res.send(cachedBusBuffer); // Enviamos el archivo binario
  } else {
    // Si la caché aún está vacía (recién partiendo el servidor)
    res.status(503).send("El servidor está cargando los datos iniciales. Intenta de nuevo en 30 segundos.");
  }
});

// Ruta simple para verificar que el servidor está vivo
app.get('/', (req, res) => res.send('Servidor Proxy GTFS-RT de Turisnuble funcionando.'));

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  fetchAndCacheData(); // Carga los datos la primera vez
  // Actualiza los datos cada 30 segundos (justo como la API)
  setInterval(fetchAndCacheData, 30000); 
});