# Instrucciones para Agentes de IA - Backend de Turisnuble

Este documento proporciona información esencial para que los agentes de IA comprendan y trabajen eficientemente con el backend de Turisnuble.

## Arquitectura General

Este es un servidor proxy simple que:
1. Se conecta a la API GTFS-RT de Chillán
2. Almacena los datos en memoria (`cachedBusData`)
3. Sirve estos datos a través de un endpoint REST

### Componentes Principales

- `index.js`: Punto de entrada único que contiene toda la lógica
- Sistema de caché en memoria para optimizar las peticiones
- Actualización automática de datos cada 60 segundos

## Patrones y Convenciones

### Gestión de Datos
- Los datos de buses se mantienen en memoria usando `cachedBusData`
- No hay persistencia en base de datos - todo es efímero
- La actualización se realiza mediante polling cada 60 segundos

### Manejo de Errores
- Si falla la obtención de datos, se mantiene el caché anterior
- Si no está configurada la URL de la API (`GTFS_RT_URL`), se devuelve un mensaje de error

## Flujos de Desarrollo

### Configuración del Entorno
```bash
# Variables de entorno requeridas
GTFS_RT_URL=<URL-de-la-api-de-chillan>
PORT=3000 # (opcional, por defecto 3000)
```

### Comandos Principales
```bash
npm install    # Instalar dependencias
npm start      # Iniciar el servidor
```

## Puntos de Integración

### Endpoints
- `GET /`: Endpoint de salud/prueba
- `GET /buses_rt`: Endpoint principal que devuelve datos GTFS-RT en caché

### Dependencias Externas
- `express`: Framework web
- `axios`: Cliente HTTP para llamadas a la API
- `cors`: Middleware para habilitar CORS

## Consideraciones Importantes

1. La URL de la API de Chillán debe configurarse en las variables de entorno
2. CORS está habilitado globalmente para permitir conexiones desde la app móvil
3. No modificar el intervalo de actualización sin considerar los límites de la API
4. Los datos se sirven desde la memoria - no hay persistencia entre reinicios