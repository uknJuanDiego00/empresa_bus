import { defineStore } from 'pinia'
import { viajeApi } from '../services/api'

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
        const res = await viajeApi.obtenerTodos()
        if (res && res.data) {
          this.viajes = res.data.map(v => ({
            id: v.id || v._id,
            _id: v._id,
            codigo: v.codigo || (v.bus ? `VIA-${String(v.id).slice(-3)}` : 'VIA-000'),
            origen: v.origen || v.origin,
            destino: v.destino || v.destination,
            fecha: v.fecha || v.departureDate,
            hora: v.hora || v.departureTime,
            vehiculoId: v.vehiculoId || (v.bus ? (v.bus._id || v.bus) : ''),
            precio: Number(v.precio !== undefined ? v.precio : v.price),
            estado: v.estado || v.status || 'Programado',
            paradasIntermedias: Array.isArray(v.paradasIntermedias) ? v.paradasIntermedias : []
          }))
        }
      } catch (err) {
        console.warn('No se pudo conectar a la API de viajes, usando datos locales:', err.message)
      } finally {
        this.cargando = false
      }
    },
    async crearViaje(datos) {
      this.cargando = true
      this.error = null
      const contador = this.viajes.length + 1
      const codigoSugerido = `VIA-${String(contador).padStart(3, '0')}`

      const payload = {
        codigo: codigoSugerido,
        origen: datos.origen.trim(),
        destino: datos.destino.trim(),
        fecha: datos.fecha,
        hora: datos.hora,
        vehiculoId: String(datos.vehiculoId),
        precio: Number(datos.precio),
        estado: datos.estado || 'Programado',
        paradasIntermedias: Array.isArray(datos.paradasIntermedias) ? datos.paradasIntermedias : []
      }

      try {
        const res = await viajeApi.crear(payload)
        const vGuardado = res.data || res
        const nuevo = {
          id: vGuardado.id || vGuardado._id || String(Date.now()),
          _id: vGuardado._id,
          codigo: vGuardado.codigo || payload.codigo,
          origen: vGuardado.origen || payload.origen,
          destino: vGuardado.destino || payload.destino,
          fecha: vGuardado.fecha || payload.fecha,
          hora: vGuardado.hora || payload.hora,
          vehiculoId: vGuardado.vehiculoId || payload.vehiculoId,
          precio: Number(vGuardado.precio !== undefined ? vGuardado.precio : payload.precio),
          estado: vGuardado.estado || payload.estado,
          paradasIntermedias: Array.isArray(vGuardado.paradasIntermedias) ? vGuardado.paradasIntermedias : payload.paradasIntermedias
        }
        this.viajes.unshift(nuevo)
        return nuevo
      } catch (err) {
        console.warn('API error al crear viaje, guardando en local:', err.message)
        const nuevoLocal = {
          id: String(Date.now()),
          ...payload
        }
        this.viajes.unshift(nuevoLocal)
        return nuevoLocal
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
      if (v) v.estado = estado
      try {
        await viajeApi.actualizar(id, { estado })
      } catch (err) {
        console.warn('Error al actualizar estado del viaje en API:', err.message)
      }
    }
  },
  persist: true
})
