import { defineStore } from 'pinia'
import { vehiculoApi } from '../services/api'

function generarPuestos(capacidad) {
  const lista = []
  for (let i = 1; i <= capacidad; i++) {
    lista.push({ id: i, numero: i, esConductor: false, disponible: true })
  }
  return lista
}

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
        const res = await vehiculoApi.obtenerTodos()
        if (res && res.data) {
          this.vehiculos = res.data.map(v => ({
            id: v.id || v._id,
            _id: v._id,
            tipo: v.tipo || v.vehicleType || 'Bus',
            placa: v.placa || v.plate,
            numeroSerie: v.numeroSerie || v.serialNumber || '',
            capacidad: Number(v.capacidad || v.capacity || 20),
            conductor: v.conductor || v.driverName || '',
            serieChasis: v.serieChasis || v.chassisSeries || '',
            serieMotor: v.serieMotor || v.engineSeries || '',
            puestos: (v.puestos && v.puestos.length > 0) ? v.puestos : generarPuestos(Number(v.capacidad || v.capacity || 20))
          }))
        }
      } catch (err) {
        console.warn('No se pudo conectar a la API de vehículos, usando datos locales:', err.message)
      } finally {
        this.cargando = false
      }
    },
    async registrarVehiculo(datos) {
      this.cargando = true
      this.error = null
      const cap = Number(datos.capacidad)
      const puestos = generarPuestos(cap)
      const payload = {
        tipo: datos.tipo,
        placa: datos.placa.trim().toUpperCase(),
        numeroSerie: (datos.numeroSerie || '').trim(),
        capacidad: cap,
        conductor: datos.conductor.trim(),
        serieChasis: (datos.serieChasis || '').trim(),
        serieMotor: (datos.serieMotor || '').trim(),
        puestos
      }

      try {
        const res = await vehiculoApi.crear(payload)
        const vGuardado = res.data || res
        const nuevo = {
          id: vGuardado.id || vGuardado._id || String(Date.now()),
          _id: vGuardado._id,
          tipo: vGuardado.tipo || payload.tipo,
          placa: vGuardado.placa || payload.placa,
          numeroSerie: vGuardado.numeroSerie || payload.numeroSerie,
          capacidad: Number(vGuardado.capacidad || payload.capacidad),
          conductor: vGuardado.conductor || payload.conductor,
          serieChasis: vGuardado.serieChasis || payload.serieChasis,
          serieMotor: vGuardado.serieMotor || payload.serieMotor,
          puestos: vGuardado.puestos || puestos
        }
        this.vehiculos.unshift(nuevo)
        return nuevo
      } catch (err) {
        console.warn('API error al registrar vehículo, guardando en local:', err.message)
        const nuevoLocal = {
          id: String(Date.now()),
          ...payload
        }
        this.vehiculos.unshift(nuevoLocal)
        return nuevoLocal
      } finally {
        this.cargando = false
      }
    },
    async actualizarPuestoConductor(vehiculoId, puestoId) {
      const v = this.obtenerVehiculo(vehiculoId)
      if (v) {
        v.puestos.forEach(p => {
          p.esConductor = (p.id === Number(puestoId) || p.numero === Number(puestoId))
        })
      }
      try {
        await vehiculoApi.actualizarConductor(vehiculoId, puestoId)
      } catch (err) {
        console.warn('Error al actualizar puesto conductor en API:', err.message)
      }
    },
    placaExiste(placa, excluirId = null) {
      if (!placa) return false
      return this.vehiculos.some(
        v => v.placa && v.placa.toUpperCase() === placa.trim().toUpperCase() && v.id !== excluirId && v._id !== excluirId
      )
    },
    serieExiste(serie, excluirId = null) {
      if (!serie) return false
      return this.vehiculos.some(
        v => v.numeroSerie && v.numeroSerie.toLowerCase() === serie.trim().toLowerCase() && v.id !== excluirId && v._id !== excluirId
      )
    },
    obtenerVehiculo(id) {
      if (!id) return null
      return this.vehiculos.find(v => String(v.id) === String(id) || String(v._id) === String(id)) || null
    }
  },
  persist: true
})
