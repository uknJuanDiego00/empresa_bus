import { defineStore } from 'pinia'
import { vehiculoApi } from '../services/api'

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
          this.vehiculos = res.data.map(v => {
            const cap = Number(v.capacidad || v.capacity || 20)
            const tipo = v.tipo || v.vehicleType || 'Bus'
            let puestos = (v.puestos && v.puestos.length > 0) ? v.puestos : generarPuestos(cap, tipo)
            puestos = puestos.map(p => ({ ...p, piso: 1 }))

            return {
              id: v.id || v._id,
              _id: v._id,
              tipo,
              empresa: v.empresa || v.company || 'VIABUS Express',
              placa: v.placa || v.plate,
              numeroSerie: v.numeroSerie || v.serialNumber || '',
              capacidad: cap,
              conductor: v.conductor || v.driverName || '',
              serieChasis: v.serieChasis || v.chassisSeries || '',
              serieMotor: v.serieMotor || v.engineSeries || '',
              puestos
            }
          })
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
      const tipo = datos.tipo || 'Bus'

      const validacion = validarCapacidadTipo(tipo, cap)
      if (validacion !== true) {
        this.cargando = false
        throw new Error(validacion)
      }

      const puestos = generarPuestos(cap, tipo)
      const payload = {
        tipo,
        empresa: (datos.empresa || 'VIABUS Express').trim(),
        company: (datos.empresa || 'VIABUS Express').trim(),
        placa: datos.placa.trim().toUpperCase(),
        numeroSerie: (datos.numeroSerie || '').trim().toUpperCase(),
        capacidad: cap,
        conductor: datos.conductor.trim(),
        serieChasis: (datos.serieChasis || '').trim().toUpperCase(),
        serieMotor: (datos.serieMotor || '').trim().toUpperCase(),
        puestos
      }

      try {
        const res = await vehiculoApi.crear(payload)
        const vGuardado = res.data || res
        const nuevo = {
          id: vGuardado.id || vGuardado._id || String(Date.now()),
          _id: vGuardado._id,
          tipo: vGuardado.tipo || payload.tipo,
          empresa: vGuardado.empresa || vGuardado.company || payload.empresa,
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
        for (const p of v.puestos) {
          p.esConductor = (p.id === Number(puestoId) || p.numero === Number(puestoId))
        }
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
