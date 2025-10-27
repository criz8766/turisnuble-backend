import express from 'express';
import axios from 'axios';
import cors from 'cors';
// Importa la librería GTFS-RT
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'; 

// --- CONFIGURACIÓN ---
const app = express();
const PORT = process.env.PORT || 3000;
const GTFS_RT_URL = process.env.GTFS_RT_URL;

// Esta variable guardará los datos YA CONVERTIDOS a JSON
let cachedBusDataJson = { "message": "Aún no se han cargado los datos." };

// --- FUNCIÓN QUE ACTUALIZA LOS DATOS ---
async function fetchAndCacheData() {
  if (!GTFS_RT_URL) {
    console.error("Error: La variable de entorno GTFS_RT_URL no está definida.");
    cachedBusDataJson = { error: "Configuración del servidor incompleta." };
    return;
  }

  console.log("Buscando datos GTFS-RT (protobuf) de la API de Chillán...");
  try {
    // 1. Llama a la API de Chillán y pide la respuesta como 'arraybuffer' (datos binarios)
    const response = await axios.get(GTFS_RT_URL, {
      responseType: 'arraybuffer' // <-- MUY IMPORTANTE: pedir datos binarios
    });

    // 2. Convierte los datos protobuf binarios a un objeto JavaScript (JSON)
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(response.data));
    
    // 3. Guarda el objeto JSON en la caché
    cachedBusDataJson = feed; 
    console.log("¡Éxito! Datos Protobuf decodificados y guardados en memoria como JSON.");
    // console.log("Número de entidades:", feed.entity?.length); // Para depurar

  } catch (error) {
    console.error("Error durante el fetch o decodificación:", error.message);
    // Si falla, mantenemos los datos antiguos en caché
  }
}

// --- CONFIGURACIÓN DEL SERVIDOR ---
app.use(cors());

app.get('/', (req, res) => {
  res.send('Servidor de Turisnuble RT funcionando.');
});

// Endpoint de buses (Ahora devolverá JSON)
app.get('/buses_rt', (req, res) => {
  // Devuelve el objeto JSON que tenemos en memoria
  res.json(cachedBusDataJson); 
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  fetchAndCacheData(); // Primera carga
  setInterval(fetchAndCacheData, 60000); // Actualizar cada minuto
});