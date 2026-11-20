/**
 * Calculador de Distancia y Duración Estimada de Rutas Intermunicipales (VIABUS)
 * Basado en topografía y tiempos reales de transporte intermunicipal en Colombia.
 */

// Coordenadas aproximadas de terminales de transporte en Colombia
const COORDENADAS_CIUDADES = {
  'Bogotá': { lat: 4.7110, lon: -74.0721 },
  'Bogotá D.C.': { lat: 4.7110, lon: -74.0721 },
  'Medellín': { lat: 6.2442, lon: -75.5812 },
  'Cali': { lat: 3.4516, lon: -76.5320 },
  'Barranquilla': { lat: 10.9685, lon: -74.7813 },
  'Cartagena': { lat: 10.3910, lon: -75.4794 },
  'Bucaramanga': { lat: 7.1254, lon: -73.1198 },
  'San Gil': { lat: 6.5558, lon: -73.1360 },
  'Charalá': { lat: 6.2798, lon: -73.1678 },
  'Cúcuta': { lat: 7.8939, lon: -72.5078 },
  'Pereira': { lat: 4.8133, lon: -75.6961 },
  'Manizales': { lat: 5.0689, lon: -75.5174 },
  'Armenia': { lat: 4.5339, lon: -75.6811 },
  'Ibagué': { lat: 4.4389, lon: -75.2322 },
  'Santa Marta': { lat: 11.2408, lon: -74.1990 },
  'Villavicencio': { lat: 4.1420, lon: -73.6266 },
  'Pasto': { lat: 1.2136, lon: -77.2811 },
  'Popayán': { lat: 2.4419, lon: -76.6063 },
  'Neiva': { lat: 2.9273, lon: -75.2819 },
  'Tunja': { lat: 5.5353, lon: -73.3678 },
  'Duitama': { lat: 5.8268, lon: -73.0336 },
  'Sogamoso': { lat: 5.7144, lon: -72.9332 },
  'Montería': { lat: 8.7479, lon: -75.8814 },
  'Sincelejo': { lat: 9.3047, lon: -75.3978 },
  'Valledupar': { lat: 10.4631, lon: -73.2532 },
  'Riohacha': { lat: 11.5444, lon: -72.9072 },
  'Yopal': { lat: 5.3377, lon: -72.3959 },
  'Girardot': { lat: 4.3019, lon: -74.8062 },
  'Fusagasugá': { lat: 4.3365, lon: -74.3638 },
  'Buenaventura': { lat: 3.8801, lon: -77.0312 },
  'Palmira': { lat: 3.5394, lon: -76.3036 },
  'Buga': { lat: 3.9009, lon: -76.2978 },
  'Tuluá': { lat: 4.0847, lon: -76.1954 },
  'Cartago': { lat: 4.7464, lon: -75.9117 },
  'Rionegro': { lat: 6.1552, lon: -75.3737 },
  'Chía': { lat: 4.8617, lon: -74.0578 },
  'Zipaquirá': { lat: 5.0256, lon: -74.0044 }
}

// Tabla de rutas frecuentes con datos viales verificados (distancia real por carretera y duración promedio en bus)
const RUTAS_DIRECTAS = {
  'bogota-bucaramanga': { km: 398, minutos: 510, desc: '8h 30m' },
  'bogota-medellin': { km: 415, minutos: 550, desc: '9h 10m' },
  'bogota-cali': { km: 460, minutos: 630, desc: '10h 30m' },
  'bogota-ibague': { km: 200, minutos: 270, desc: '4h 30m' },
  'bogota-tunja': { km: 140, minutos: 165, desc: '2h 45m' },
  'bogota-duitama': { km: 195, minutos: 225, desc: '3h 45m' },
  'bogota-sogamoso': { km: 210, minutos: 240, desc: '4h 00m' },
  'bogota-villavicencio': { km: 120, minutos: 195, desc: '3h 15m' },
  'bogota-neiva': { km: 310, minutos: 360, desc: '6h 00m' },
  'bogota-barranquilla': { km: 990, minutos: 1080, desc: '18h 00m' },
  'bogota-cartagena': { km: 1040, minutos: 1170, desc: '19h 30m' },
  'bogota-santamarta': { km: 960, minutos: 1050, desc: '17h 30m' },
  'bogota-sangil': { km: 315, minutos: 420, desc: '7h 00m' },
  'bogota-pereira': { km: 320, minutos: 450, desc: '7h 30m' },
  'bogota-manizales': { km: 295, minutos: 430, desc: '7h 10m' },
  'bogota-armenia': { km: 285, minutos: 410, desc: '6h 50m' },
  'bogota-cucuta': { km: 570, minutos: 840, desc: '14h 00m' },
  'bogota-pasto': { km: 840, minutos: 1140, desc: '19h 00m' },

  'medellin-sangil': { km: 385, minutos: 540, desc: '9h 00m' },
  'medellin-bucaramanga': { km: 390, minutos: 525, desc: '8h 45m' },
  'medellin-cali': { km: 420, minutos: 540, desc: '9h 00m' },
  'medellin-pereira': { km: 215, minutos: 285, desc: '4h 45m' },
  'medellin-manizales': { km: 195, minutos: 270, desc: '4h 30m' },
  'medellin-cartagena': { km: 640, minutos: 810, desc: '13h 30m' },
  'medellin-barranquilla': { km: 705, minutos: 870, desc: '14h 30m' },
  'medellin-santamarta': { km: 790, minutos: 960, desc: '16h 00m' },
  'medellin-monteria': { km: 410, minutos: 480, desc: '8h 00m' },
  'medellin-cucuta': { km: 580, minutos: 780, desc: '13h 00m' },

  'cali-charala': { km: 640, minutos: 840, desc: '14h 00m' },
  'cali-sangil': { km: 625, minutos: 810, desc: '13h 30m' },
  'cali-popayan': { km: 140, minutos: 180, desc: '3h 00m' },
  'cali-pasto': { km: 385, minutos: 570, desc: '9h 30m' },
  'cali-armenia': { km: 180, minutos: 225, desc: '3h 45m' },
  'cali-pereira': { km: 210, minutos: 255, desc: '4h 15m' },
  'cali-manizales': { km: 260, minutos: 330, desc: '5h 30m' },
  'cali-ibague': { km: 265, minutos: 360, desc: '6h 00m' },
  'cali-buenaventura': { km: 115, minutos: 150, desc: '2h 30m' },
  'cali-bucaramanga': { km: 730, minutos: 930, desc: '15h 30m' },

  'bucaramanga-sangil': { km: 96, minutos: 150, desc: '2h 30m' },
  'bucaramanga-charala': { km: 135, minutos: 225, desc: '3h 45m' },
  'bucaramanga-cucuta': { km: 198, minutos: 330, desc: '5h 30m' },
  'bucaramanga-barranquilla': { km: 590, minutos: 660, desc: '11h 00m' },
  'bucaramanga-cartagena': { km: 640, minutos: 750, desc: '12h 30m' },
  'bucaramanga-santamarta': { km: 540, minutos: 600, desc: '10h 00m' },

  'sangil-charala': { km: 35, minutos: 75, desc: '1h 15m' },
  'sangil-cucuta': { km: 290, minutos: 450, desc: '7h 30m' },
  'sangil-tunja': { km: 175, minutos: 240, desc: '4h 00m' },

  'pereira-manizales': { km: 52, minutos: 75, desc: '1h 15m' },
  'pereira-armenia': { km: 45, minutos: 60, desc: '1h 00m' },
  'manizales-armenia': { km: 95, minutos: 135, desc: '2h 15m' },
  'barranquilla-cartagena': { km: 120, minutos: 135, desc: '2h 15m' },
  'barranquilla-santamarta': { km: 95, minutos: 105, desc: '1h 45m' },
  'cartagena-santamarta': { km: 215, minutos: 240, desc: '4h 00m' }
}

function normalizar(texto) {
  if (!texto) return ''
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

// Distancia geodésica con corrección de sinuosidad vial de Colombia
function calcularDistanciaHaversine(c1, c2) {
  const R = 6371 // Radio terrestre en km
  const dLat = (c2.lat - c1.lat) * (Math.PI / 180)
  const dLon = (c2.lon - c1.lon) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(c1.lat * (Math.PI / 180)) *
      Math.cos(c2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distanciaGeodesica = R * c

  // Factor de sinuosidad de carreteras andinas (1.42 promedio)
  return Math.round(distanciaGeodesica * 1.42)
}

/**
 * Calcula o estima la distancia y duración en bus entre dos ciudades.
 * @param {string} origen Nombre de la ciudad de origen
 * @param {string} destino Nombre de la ciudad de destino
 * @returns {{ distanciaKm: number, distanciaTexto: string, duracionTexto: string, duracionMinutos: number }}
 */
export function estimarRutaViaje(origen, destino) {
  if (!origen || !destino) {
    return {
      distanciaKm: 0,
      distanciaTexto: '—',
      duracionTexto: '—',
      duracionMinutos: 0
    }
  }

  const k1 = `${normalizar(origen)}-${normalizar(destino)}`
  const k2 = `${normalizar(destino)}-${normalizar(origen)}`

  // 1. Verificación en tabla de rutas directas
  if (RUTAS_DIRECTAS[k1]) {
    const r = RUTAS_DIRECTAS[k1]
    return {
      distanciaKm: r.km,
      distanciaTexto: `${r.km} km`,
      duracionTexto: r.desc,
      duracionMinutos: r.minutos
    }
  }

  if (RUTAS_DIRECTAS[k2]) {
    const r = RUTAS_DIRECTAS[k2]
    return {
      distanciaKm: r.km,
      distanciaTexto: `${r.km} km`,
      duracionTexto: r.desc,
      duracionMinutos: r.minutos
    }
  }

  // 2. Estimación a través de coordenadas
  const normOrig = normalizar(origen)
  const normDest = normalizar(destino)

  let c1 = null
  let c2 = null

  for (const [nom, coord] of Object.entries(COORDENADAS_CIUDADES)) {
    const n = normalizar(nom)
    if (!c1 && normOrig.includes(n)) c1 = coord
    if (!c2 && normDest.includes(n)) c2 = coord
  }

  if (c1 && c2) {
    const km = Math.max(30, calcularDistanciaHaversine(c1, c2))
    // Velocidad promedio de bus intermunicipal en Colombia: ~48 km/h considerando paradas y geografía
    const minutos = Math.round((km / 48) * 60)
    const horas = Math.floor(minutos / 60)
    const minsRestantes = minutos % 60
    const desc = `${horas}h ${minsRestantes.toString().padStart(2, '0')}m`

    return {
      distanciaKm: km,
      distanciaTexto: `${km} km`,
      duracionTexto: desc,
      duracionMinutos: minutos
    }
  }

  // 3. Fallback genérico si es una población menor
  const kmEstimado = 180
  return {
    distanciaKm: kmEstimado,
    distanciaTexto: `~${kmEstimado} km`,
    duracionTexto: '~3h 45m',
    duracionMinutos: 225
  }
}

/**
 * Calcula el precio para un tramo intermedio de la ruta del bus
 * basado en la tarifa oficial del viaje y la distancia del trayecto.
 */
export function calcularTarifaTramo(precioTotalViaje, origenViaje, destinoViaje, subida, bajada) {
  if (!precioTotalViaje || Number(precioTotalViaje) <= 0) {
    return { precio: 0, error: 'Tarifa del viaje no configurada' }
  }

  if (!subida || !bajada) {
    return { precio: Number(precioTotalViaje), error: null }
  }

  const origNorm = normalizar(origenViaje)
  const destNorm = normalizar(destinoViaje)
  const subNorm = normalizar(subida)
  const bajNorm = normalizar(bajada)

  // Si el trayecto es exactamente el origen y destino completo del viaje
  if (origNorm === subNorm && destNorm === bajNorm) {
    return {
      precio: Number(precioTotalViaje),
      esCompleto: true,
      error: null
    }
  }

  const rutaCompleta = estimarRutaViaje(origenViaje, destinoViaje)
  const rutaTramo = estimarRutaViaje(subida, bajada)

  if (!rutaCompleta || !rutaTramo || rutaTramo.distanciaKm <= 0 || rutaCompleta.distanciaKm <= 0) {
    return {
      precio: null,
      error: 'No hay tarifa disponible para este tramo'
    }
  }

  const ratio = Math.min(1, Math.max(0.15, rutaTramo.distanciaKm / rutaCompleta.distanciaKm))
  const precioCalculado = Math.max(5000, Math.round((Number(precioTotalViaje) * ratio) / 1000) * 1000)

  return {
    precio: precioCalculado,
    esCompleto: false,
    distanciaKm: rutaTramo.distanciaKm,
    distanciaTexto: rutaTramo.distanciaTexto,
    duracionTexto: rutaTramo.duracionTexto,
    error: null
  }
}

