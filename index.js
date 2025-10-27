import express from 'express';
import axios from 'axios';
import cors from 'cors'; // Importa 'cors'

// --- CONFIGURACIÓN ---
const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANTE: Esta URL la debes poner en Render (en el Paso 1.4)
// Es la URL de la API de Chillán que requiere tu API key, 
// la que se menciona en el PDF.
const GTFS_RT_URL = process.env.GTFS_RT_URL;

// Esta variable en memoria guardará los datos de los buses
let cachedBusData = { "message": "Aún no se han cargado los datos." };

// --- FUNCIÓN QUE ACTUALIZA LOS DATOS ---
async function fetchAndCacheData() {
  if (!GTFS_RT_URL) {
    console.error("Error: La variable de entorno GTFS_RT_URL no está definida.");
    cachedBusData = { error: "Configuración del servidor incompleta." };
    return;
  }

  console.log("Buscando datos de la API de Chillán...");
  try {
    // 1. Llama a la API de Chillán
    const response = await axios.get(GTFS_RT_URL);

    // 2. Guarda la respuesta (el JSON) en la variable 'cachedBusData'
    cachedBusData = response.data;
    console.log("¡Éxito! Datos de buses actualizados en memoria.");

  } catch (error) {
    console.error("Error al buscar datos de la API:", error.message);
    // Si falla, mantenemos los datos antiguos en caché y no hacemos nada
  }
}

// --- CONFIGURACIÓN DEL SERVIDOR ---

// Usa CORS para permitir que tu app móvil se conecte. ¡Muy importante!
app.use(cors());

// Endpoint raíz (para pruebas)
app.get('/', (req, res) => {
  res.send('Servidor de Turisnuble RT funcionando.');
});

// Endpoint de buses (Este es el que llamará tu app)
app.get('/buses_rt', (req, res) => {
  // Devuelve el JSON que tenemos guardado en memoria
  res.json(cachedBusData);
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  
  // 1. Al iniciar, busca los datos inmediatamente
  fetchAndCacheData();
  
  // 2. Luego, configura un temporizador para que lo haga cada 60 segundos
  setInterval(fetchAndCacheData, 60000); // 60,000 ms = 1 minuto
});