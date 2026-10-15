import { defineStore } from 'pinia'
import { vehiculoApi } from '../services/api'
import { generarPuestos, tieneBanoVehiculo } from '../utils/busLayout'

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
            const puestosOficiales = generarPuestos(cap)
            // Preservar si ya tenía conductor asignado
            const prevConductorPuesto = Array.isArray(v.puestos) ? v.puestos.find(p => p.esConductor) : null
            if (prevConductorPuesto) {
              const matching = puestosOficiales.find(p => p.numero === prevConductorPuesto.numero || p.id === prevConductorPuesto.id)
              if (matching) matching.esConductor = true
            }

            return {
              id: v.id || v._id,
              _id: v._id,
              tipo: v.tipo || v.vehicleType || 'Bus',
              empresa: v.empresa || v.company || 'VIABUS Express',
              placa: (v.placa || v.plate || '').toUpperCase(),
              numeroSerie: (v.numeroSerie || v.serialNumber || '').toUpperCase(),
              capacidad: cap,
              tieneBano: tieneBanoVehiculo(cap),
              conductor: v.conductor || v.driverName || '',
              serieChasis: (v.serieChasis || v.chassisSeries || '').toUpperCase(),
              serieMotor: (v.serieMotor || v.engineSeries || '').toUpperCase(),
              puestos: puestosOficiales
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
      const puestos = generarPuestos(cap)
      const payload = {
        tipo: datos.tipo,
        empresa: (datos.empresa || 'VIABUS Express').trim(),
        company: (datos.empresa || 'VIABUS Express').trim(),
        placa: (datos.placa || '').trim().toUpperCase(),
        numeroSerie: (datos.numeroSerie || '').trim().toUpperCase(),
        capacidad: cap,
        tieneBano: tieneBanoVehiculo(cap),
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
          placa: (vGuardado.placa || payload.placa || '').toUpperCase(),
          numeroSerie: (vGuardado.numeroSerie || payload.numeroSerie || '').toUpperCase(),
          capacidad: Number(vGuardado.capacidad || payload.capacidad),
          tieneBano: tieneBanoVehiculo(Number(vGuardado.capacidad || payload.capacidad)),
          conductor: vGuardado.conductor || payload.conductor,
          serieChasis: (vGuardado.serieChasis || payload.serieChasis || '').toUpperCase(),
          serieMotor: (vGuardado.serieMotor || payload.serieMotor || '').toUpperCase(),
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
      const v = this.vehiculos.find(x => String(x.id) === String(id) || String(x._id) === String(id))
      if (!v) return null

      // Garantizar coherencia estricta de estructura
      const cap = Number(v.capacidad || 20)
      v.capacidad = cap
      v.tieneBano = tieneBanoVehiculo(cap)
      if (!Array.isArray(v.puestos) || v.puestos.length !== cap) {
        const puestosNuevos = generarPuestos(cap)
        const prev = Array.isArray(v.puestos) ? v.puestos.find(p => p.esConductor) : null
        if (prev) {
          const match = puestosNuevos.find(p => p.numero === prev.numero || p.id === prev.id)
          if (match) match.esConductor = true
        }
        v.puestos = puestosNuevos
      }
      return v
    }
  },
  persist: true
})
