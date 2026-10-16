import { defineStore } from 'pinia'
import { vehiculoApi } from '../services/api'

export const REGLAS_CAPACIDAD = {
  'Microbús': { min: 10, max: 20, label: 'Microbús' },
  'Buseta': { min: 20, max: 35, label: 'Buseta' },
  'Bus': { min: 35, max: 80, label: 'Bus' }
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
    if ((cap >= 35 && cap <= 40) || (cap > 60 && cap <= 80)) {
      return true
    }
    return 'Para Bus, la capacidad debe ser de 35 a 40 puestos (1 piso) o más de 60 hasta 80 puestos (doble piso)'
  }
  if (cap <= 0) return 'La capacidad debe ser mayor a 0'
  return true
}

export function generarPuestos(capacidad, tipo = 'Bus', puestosPiso1 = null) {
  const cap = Number(capacidad)
  const lista = []
  // Solo se habilita segundo piso si cumple con MÁS DE 60 puestos (y hasta 80)
  const esDoblePiso = (tipo === 'Bus' && cap > 60)

  let p1 = cap
  if (esDoblePiso) {
    // El primer piso tiene entre 35 y 40 puestos
    if (puestosPiso1 && Number(puestosPiso1) >= 35 && Number(puestosPiso1) <= Math.min(40, cap - 1)) {
      p1 = Number(puestosPiso1)
    } else {
      p1 = Math.min(40, Math.max(35, Math.min(cap - 1, 38)))
    }
  }

  for (let i = 1; i <= cap; i++) {
    const piso = (!esDoblePiso || i <= p1) ? 1 : 2
    lista.push({
      id: i,
      numero: i,
      piso,
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
            const p1 = Number(v.puestosPiso1 || (tipo === 'Bus' ? Math.min(28, Math.max(12, Math.round(cap * 0.4))) : cap))
            let puestos = v.puestos && v.puestos.length > 0 ? v.puestos : generarPuestos(cap, tipo, p1)

            // Asegurar que cada puesto tenga su atributo 'piso'
            puestos = puestos.map(p => ({
              ...p,
              piso: p.piso || (tipo === 'Bus' && p.numero > p1 ? 2 : 1)
            }))

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
              puestosPiso1: p1,
              puestosPiso2: tipo === 'Bus' ? (cap - p1) : 0,
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

      // Validación de reglas de capacidad
      const validacion = validarCapacidadTipo(tipo, cap)
      if (validacion !== true) {
        this.cargando = false
        throw new Error(validacion)
      }

      // Configuración de pisos: solo se habilita segundo piso si cumple con MÁS DE 60 puestos
      let p1 = cap
      let p2 = 0
      if (tipo === 'Bus' && cap > 60) {
        p1 = (datos.puestosPiso1 && Number(datos.puestosPiso1) >= 35 && Number(datos.puestosPiso1) <= 40)
          ? Number(datos.puestosPiso1)
          : Math.min(40, Math.max(35, Math.min(cap - 1, 38)))
        p2 = cap - p1
      }

      const puestos = generarPuestos(cap, tipo, p1)

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
        puestosPiso1: p1,
        puestosPiso2: p2,
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
          puestosPiso1: p1,
          puestosPiso2: p2,
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

    async actualizarDistribucionPisos(vehiculoId, puestosPiso1) {
      const v = this.obtenerVehiculo(vehiculoId)
      if (!v || v.tipo !== 'Bus') return
      const p1 = Number(puestosPiso1)
      if (p1 <= 0 || p1 >= v.capacidad) return

      v.puestosPiso1 = p1
      v.puestosPiso2 = v.capacidad - p1
      v.puestos = generarPuestos(v.capacidad, 'Bus', p1)

      try {
        await vehiculoApi.actualizar(v.id || v._id, {
          puestosPiso1: v.puestosPiso1,
          puestosPiso2: v.puestosPiso2,
          puestos: v.puestos
        })
      } catch (err) {
        console.warn('Error al guardar distribución de pisos en API:', err.message)
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
        v => v.numeroSerie && v.numeroSerie.toUpperCase() === serie.trim().toUpperCase() && v.id !== excluirId && v._id !== excluirId
      )
    },

    obtenerVehiculo(id) {
      if (!id) return null
      return this.vehiculos.find(v => String(v.id) === String(id) || String(v._id) === String(id)) || null
    }
  },
  persist: true
})
