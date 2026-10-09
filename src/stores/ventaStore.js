import { defineStore } from 'pinia'
import { ventaApi } from '../services/api'

function normalizeEstado(estado) {
  if (!estado) return 'CONFIRMADO'
  if (['Pagado', 'CONFIRMED', 'Pendiente', 'PENDING'].includes(estado)) return 'CONFIRMADO'
  if (['Cancelado', 'CANCELLED'].includes(estado)) return 'CANCELADO'
  return estado // already CONFIRMADO or CANCELADO
}

export const useVentaStore = defineStore('venta', {
  state: () => ({
    ventas: [],
    cargando: false,
    error: null
  }),
  getters: {
    totalIngresos: (state) => {
      let suma = 0
      for (const v of state.ventas) {
        if (v.estado === 'CONFIRMADO') {
          suma += Number(v.precio || v.totalAmount) || 0
        }
      }
      return suma
    },
    puestosOcupadosPorViaje: (state) => (viajeId) => {
      const nums = []
      for (const v of state.ventas) {
        const vId = String(v.viajeId || v.trip?._id || v.trip || '')
        const esMismoViaje = vId === String(viajeId)
        const esPagado = v.estado === 'CONFIRMADO'
        if (esMismoViaje && esPagado) nums.push(Number(v.puestoId || v.seatNumber))
      }
      return nums
    },
    puestosPendientesPorViaje: () => () => [],
    puestoOcupado: (state) => (viajeId, puestoId) => {
      for (const v of state.ventas) {
        const vId = String(v.viajeId || v.trip?._id || v.trip || '')
        const esMismoViaje = vId === String(viajeId)
        const esMismoPuesto = Number(v.puestoId || v.seatNumber) === Number(puestoId)
        const noCancel = v.estado !== 'CANCELADO'
        if (esMismoViaje && esMismoPuesto && noCancel) return true
      }
      return false
    }
  },
  actions: {
    async cargarVentas() {
      this.cargando = true
      this.error = null
      try {
        const res = await ventaApi.obtenerTodas()
        if (res && res.data) {
          const nuevas = []
          for (const v of res.data) {
            nuevas.push({
              id: v.ticketCode || v.id || v._id,
              _id: v._id,
              ventaId: v.ventaId || v.saleId || v.ticketCode || v.id || v._id,
              viajeId: v.viajeId || (v.trip ? (v.trip._id || v.trip) : ''),
              clienteId: v.clienteId || (v.customer ? (v.customer._id || v.customer) : ''),
              customerName: v.customerName || '',
              customerDoc: v.customerDoc || '',
              puestoId: Number(v.puestoId || v.seatNumber),
              precio: Number(v.precio !== undefined ? v.precio : v.totalAmount),
              descripcion: v.descripcion || v.notes || '',
              fechaVenta: v.fechaVenta || v.saleDate,
              estado: normalizeEstado(v.estado || v.status),
              metodoPago: v.metodoPago || v.paymentMethod || 'Efectivo',
              estadoDevolucion: v.estadoDevolucion || v.refundStatus || 'No solicitada',
              notasDevolucion: v.notasDevolucion || v.refundNotes || ''
            })
          }
          this.ventas = nuevas
        }
      } catch (err) {
        console.warn('No se pudo conectar a la API de ventas:', err.message)
      } finally {
        this.cargando = false
      }
    },

    async crearVenta(datos) {
      if (this.puestoOcupado(datos.viajeId, datos.puestoId)) {
        throw new Error(`El puesto ${datos.puestoId} ya se encuentra ocupado para este viaje.`)
      }

      this.cargando = true
      this.error = null

      const num = String(this.ventas.length + 1).padStart(3, '0')
      const now = new Date()
      const fechaStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      const estadoFinal = 'CONFIRMADO'

      const payload = {
        viajeId: String(datos.viajeId),
        clienteId: datos.clienteId ? String(datos.clienteId) : undefined,
        customerName: datos.customerName || '',
        customerDoc: datos.customerDoc || '',
        puestoId: Number(datos.puestoId),
        precio: Number(datos.precio),
        descripcion: datos.descripcion || '',
        fechaVenta: fechaStr,
        estado: estadoFinal,
        status: estadoFinal,
        metodoPago: datos.metodoPago || 'Efectivo',
        paymentMethod: datos.metodoPago || 'Efectivo'
      }

      try {
        const res = await ventaApi.crear(payload)
        const vGuardada = res.data || res
        const esArray = Array.isArray(vGuardada)
        const primera = esArray ? vGuardada[0] : vGuardada
        const nueva = {
          id: primera.ticketCode || primera.id || `TKT-${num}`,
          _id: primera._id,
          ventaId: primera.ventaId || primera.saleId || primera.ticketCode || primera.id,
          viajeId: payload.viajeId,
          clienteId: payload.clienteId || '',
          customerName: primera.customerName || payload.customerName,
          customerDoc: primera.customerDoc || payload.customerDoc,
          puestoId: payload.puestoId,
          precio: payload.precio,
          descripcion: payload.descripcion,
          fechaVenta: payload.fechaVenta,
          estado: primera.estado || primera.status || estadoFinal,
          metodoPago: payload.metodoPago,
          estadoDevolucion: 'No solicitada',
          notasDevolucion: ''
        }
        this.ventas.unshift(nueva)
        return nueva
      } catch (err) {
        const nuevaLocal = {
          id: `TKT-${num}`,
          ventaId: `VTA-${num}`,
          ...payload,
          puestoId: payload.puestoId,
          metodoPago: payload.metodoPago,
          estadoDevolucion: 'No solicitada',
          notasDevolucion: ''
        }
        this.ventas.unshift(nuevaLocal)
        return nuevaLocal
      } finally {
        this.cargando = false
      }
    },

    async crearVentaMultiple(datos) {
      this.cargando = true
      this.error = null
      try {
        const res = await ventaApi.crear(datos)
        const resData = res.data || res
        const lista = Array.isArray(resData) ? resData : [resData]
        for (const v of lista) {
          this.ventas.unshift({
            id: v.ticketCode || v.id || v._id,
            _id: v._id,
            ventaId: v.ventaId || v.saleId || v.ticketCode || v.id,
            viajeId: datos.viajeId,
            clienteId: v.clienteId || '',
            customerName: v.customerName || '',
            customerDoc: v.customerDoc || '',
            puestoId: Number(v.puestoId || v.seatNumber),
            precio: Number(v.precio || v.totalAmount),
            descripcion: v.descripcion || v.notes || '',
            fechaVenta: v.fechaVenta || v.saleDate,
            estado: normalizeEstado(v.estado || v.status),
            metodoPago: datos.metodoPago || 'Efectivo',
            estadoDevolucion: 'No solicitada',
            notasDevolucion: ''
          })
        }
        return { saleId: res.saleId || datos.viajeId, tiquetes: lista }
      } finally {
        this.cargando = false
      }
    },

    async actualizarEstadoVenta(id, nuevoEstado) {
      const v = this.obtenerVenta(id)
      if (v) {
        v.estado = nuevoEstado
        v.status = nuevoEstado
      }
      try {
        if (nuevoEstado === 'CANCELADO') {
          await ventaApi.cancelar(id)
        }
      } catch (err) {
        console.warn('Error al actualizar estado en API:', err.message)
      }
    },

    async actualizarDevolucion(id, estadoDevolucion, notas) {
      const v = this.obtenerVenta(id)
      try {
        const payload = { estadoDevolucion, notasDevolucion: notas || '' }
        await ventaApi.actualizarDevolucion(id, payload)
        if (v) {
          v.estadoDevolucion = estadoDevolucion
          if (notas) v.notasDevolucion = notas
          if (estadoDevolucion === 'Devuelta') {
            v.estado = 'Cancelado'
          }
        }
      } catch (err) {
        console.warn('Error al actualizar devolución en API:', err.message)
        if (v) {
          v.estadoDevolucion = estadoDevolucion
          if (notas) v.notasDevolucion = notas
        }
      }
    },

    obtenerVenta(id) {
      if (!id) return null
      for (const v of this.ventas) {
        if (String(v.id) === String(id) || String(v._id) === String(id) || String(v.ventaId) === String(id)) {
          return v
        }
      }
      return null
    }
  },
  persist: true
})
