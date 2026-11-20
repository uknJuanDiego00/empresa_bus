import { defineStore } from 'pinia'

export const REGLAS_CAPACIDAD = {
  'Microbús': { min: 10, max: 20, label: 'Microbús' },
  'Buseta': { min: 20, max: 35, label: 'Buseta' },
  'Bus': { min: 35, max: 50, label: 'Bus' }
}

export function validarCapacidadTipo(tipo, capacidad) {
  const cap = Number(capacidad)
  if (tipo === 'Microbús') {
    if (cap < 10 || cap > 20) return 'La capacidad debe estar entre 10 y 20 puestos'
    return true
  }
  if (tipo === 'Buseta') {
    if (cap < 20 || cap > 35) return 'La capacidad debe estar entre 20 y 35 puestos'
    return true
  }
  if (tipo === 'Bus') {
    if (cap < 35 || cap > 50) return 'Para Bus, la capacidad debe estar entre 35 y 50 puestos'
    return true
  }
  if (cap <= 0) return 'La capacidad debe ser mayor a 0'
  return true
}

export function generarPuestos(capacidad, tipo = 'Bus') {
  const cap = Number(capacidad)
  const lista = []
  for (let i = 1; i <= cap; i++) {
    lista.push({
      id: i,
      numero: i,
      piso: 1,
      esConductor: false,
      disponible: true
    })
  }
  return lista
}

const VEHICULOS_INICIALES = [
  {
    id: 'veh-001',
    tipo: 'Bus',
    empresa: 'VIABUS Express',
    placa: 'WAA123',
    numeroSerie: 'SER-2024-001',
    capacidad: 40,
    conductor: 'José Martínez',
    serieChasis: 'CHS-98741-B',
    serieMotor: 'MTR-55421-V',
    puestos: generarPuestos(40, 'Bus')
  },
  {
    id: 'veh-002',
    tipo: 'Buseta',
    empresa: 'Rápido Nacional',
    placa: 'SKL456',
    numeroSerie: 'SER-2024-002',
    capacidad: 28,
    conductor: 'Hernando Silva',
    serieChasis: 'CHS-65412-B',
    serieMotor: 'MTR-33211-V',
    puestos: generarPuestos(28, 'Buseta')
  },
  {
    id: 'veh-003',
    tipo: 'Microbús',
    empresa: 'TransOriente',
    placa: 'TGY789',
    numeroSerie: 'SER-2024-003',
    capacidad: 16,
    conductor: 'Wilson Caicedo',
    serieChasis: 'CHS-32145-M',
    serieMotor: 'MTR-11452-M',
    puestos: generarPuestos(16, 'Microbús')
  }
]

export const useVehiculoStore = defineStore('vehiculo', {
  state: () => ({
    vehiculos: [],
    cargando: false,
    error: null
  }),

  actions: {
    async cargarVehiculos() {
      this.cargando = true
      this.error = null
      try {
        if (this.vehiculos.length === 0) {
          this.vehiculos = [...VEHICULOS_INICIALES]
        }
      } finally {
        this.cargando = false
      }
    },

    async registrarVehiculo(datos) {
      this.cargando = true
      this.error = null
      const cap = Number(datos.capacidad)
      const tipo = datos.tipo || 'Bus'

      const validacion = validarCapacidadTipo(tipo, cap)
      if (validacion !== true) {
        this.cargando = false
        throw new Error(validacion)
      }

      const puestos = generarPuestos(cap, tipo)
      const nuevo = {
        id: `veh-${Date.now()}`,
        tipo,
        empresa: (datos.empresa || 'VIABUS Express').trim(),
        placa: datos.placa.trim().toUpperCase(),
        numeroSerie: (datos.numeroSerie || '').trim().toUpperCase(),
        capacidad: cap,
        conductor: (datos.conductor || '').trim(),
        serieChasis: (datos.serieChasis || '').trim().toUpperCase(),
        serieMotor: (datos.serieMotor || '').trim().toUpperCase(),
        puestos
      }

      this.vehiculos.unshift(nuevo)
      this.cargando = false
      return nuevo
    },

    async actualizarPuestoConductor(vehiculoId, puestoId) {
      const v = this.obtenerVehiculo(vehiculoId)
      if (v && Array.isArray(v.puestos)) {
        for (const p of v.puestos) {
          p.esConductor = (p.id === Number(puestoId) || p.numero === Number(puestoId))
        }
      }
    },

    placaExiste(placa, excluirId = null) {
      if (!placa) return false
      return this.vehiculos.some(
        v => v.placa && v.placa.toUpperCase() === String(placa).trim().toUpperCase() && v.id !== excluirId
      )
    },

    serieExiste(serie, excluirId = null) {
      if (!serie) return false
      return this.vehiculos.some(
        v => v.numeroSerie && v.numeroSerie.toLowerCase() === String(serie).trim().toLowerCase() && v.id !== excluirId
      )
    },

    obtenerVehiculo(id) {
      if (!id) return null
      return this.vehiculos.find(v => String(v.id) === String(id) || String(v._id) === String(id)) || null
    }
  },

  persist: true
})
