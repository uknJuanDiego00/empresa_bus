import { defineStore } from 'pinia'

const VIAJES_INICIALES = [
  {
    id: 'via-001',
    codigo: 'VIA-001',
    origen: 'Bogotá D.C.',
    destino: 'Medellín',
    fecha: '2026-11-20',
    hora: '08:00',
    vehiculoId: 'veh-001',
    precio: 85000,
    estado: 'Programado',
    paradasIntermedias: ['La Dorada', 'Puerto Triunfo']
  },
  {
    id: 'via-002',
    codigo: 'VIA-002',
    origen: 'Medellín',
    destino: 'Cali',
    fecha: '2026-11-20',
    hora: '14:30',
    vehiculoId: 'veh-002',
    precio: 70000,
    estado: 'En Ruta',
    paradasIntermedias: ['Pereira', 'Armenia']
  },
  {
    id: 'via-003',
    codigo: 'VIA-003',
    origen: 'Bogotá D.C.',
    destino: 'Bucaramanga',
    fecha: '2026-11-21',
    hora: '21:00',
    vehiculoId: 'veh-001',
    precio: 95000,
    estado: 'Programado',
    paradasIntermedias: ['Tunja', 'Barbosa', 'San Gil']
  }
]

export const useViajeStore = defineStore('viaje', {
  state: () => ({
    viajes: [],
    cargando: false,
    error: null
  }),

  actions: {
    async cargarViajes() {
      this.cargando = true
      this.error = null
      try {
        if (this.viajes.length === 0) {
          this.viajes = [...VIAJES_INICIALES]
        }
      } finally {
        this.cargando = false
      }
    },

    async crearViaje(datos) {
      this.cargando = true
      this.error = null
      try {
        const contador = this.viajes.length + 1
        const codigoSugerido = `VIA-${String(contador).padStart(3, '0')}`

        const nuevo = {
          id: `via-${Date.now()}`,
          codigo: codigoSugerido,
          origen: String(datos.origen || '').trim(),
          destino: String(datos.destino || '').trim(),
          fecha: datos.fecha,
          hora: datos.hora,
          vehiculoId: String(datos.vehiculoId),
          precio: Number(datos.precio),
          estado: datos.estado || 'Programado',
          paradasIntermedias: Array.isArray(datos.paradasIntermedias) ? datos.paradasIntermedias : []
        }

        this.viajes.unshift(nuevo)
        return nuevo
      } catch (err) {
        this.error = err.message || 'Error al crear el viaje'
        throw err
      } finally {
        this.cargando = false
      }
    },

    obtenerViaje(id) {
      if (!id) return null
      return this.viajes.find(
        v => String(v.id) === String(id) || String(v._id) === String(id) || String(v.codigo) === String(id)
      ) || null
    },

    async actualizarEstado(id, estado) {
      const v = this.obtenerViaje(id)
      if (v) {
        v.estado = estado
      }
    }
  },

  persist: true
})
