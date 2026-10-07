import { defineStore } from 'pinia'
import { api } from '../boot/axios.js'

export const useViajeStore = defineStore('viaje', {
  state: () => ({
    viajes: [],
    cargando: false,
    error: null
  }),

  actions: {
    // 1. Cargar viajes reales desde MongoDB Atlas
    async cargarViajes() {
      this.cargando = true
      this.error = null
      try {
        const respuesta = await api.get('/trips')
        const viajesDB = respuesta.data?.data || []

        this.viajes = viajesDB.map(v => ({
          _id: v._id,
          id: v._id, // Asignar el _id real de MongoDB
          codigo: v.code || v.codigo || `VIA-${v._id ? v._id.slice(-4) : '000'}`,
          origen: v.origin || v.origen,
          destino: v.destination || v.destino,
          fecha: v.date ? v.date.split('T')[0] : v.fecha,
          hora: v.departureTime || v.hora,
          vehiculoId: v.bus?._id || v.bus || v.vehiculoId,
          precio: Number(v.price || v.precio) || 0,
          estado: v.status || v.estado || 'Disponible'
        }))
      } catch (e) {
        console.error('Error al cargar viajes:', e)
        this.error = e.response?.data?.message || e.message
      } finally {
        this.cargando = false
      }
    },

    // 2. Crear un viaje real en MongoDB Atlas
    async crearViaje(datos) {
      try {
        const respuesta = await api.post('/trips', {
          origin: datos.origen,
          destination: datos.destino,
          date: datos.fecha,
          departureTime: datos.hora,
          price: Number(datos.precio),
          bus: datos.vehiculoId
        })

        const nuevoDB = respuesta.data?.data

        const nuevoViaje = {
          _id: nuevoDB._id,
          id: nuevoDB._id,
          codigo: nuevoDB.code || nuevoDB.codigo || `VIA-${nuevoDB._id.slice(-4)}`,
          origen: nuevoDB.origin || nuevoDB.origen,
          destino: nuevoDB.destination || nuevoDB.destino,
          fecha: nuevoDB.date ? nuevoDB.date.split('T')[0] : nuevoDB.fecha,
          hora: nuevoDB.departureTime || nuevoDB.hora,
          vehiculoId: nuevoDB.bus?._id || nuevoDB.bus,
          precio: Number(nuevoDB.price || nuevoDB.precio) || 0,
          estado: nuevoDB.status || nuevoDB.estado || 'Disponible'
        }

        this.viajes.push(nuevoViaje)
        return nuevoViaje
      } catch (error) {
        console.error('Error al crear viaje:', error)
        throw new Error(error.response?.data?.message || 'No se pudo crear el viaje')
      }
    },

    obtenerViaje(id) {
      return this.viajes.find(v => String(v.id) === String(id) || String(v._id) === String(id)) || null
    },

    async actualizarEstado(id, estado) {
      const v = this.obtenerViaje(id)
      if (v) v.estado = estado
    }
  }
})
