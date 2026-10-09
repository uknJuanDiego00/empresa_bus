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
            const tripObj = v.trip && typeof v.trip === 'object' ? v.trip : null
            const custObj = v.customer && typeof v.customer === 'object' ? v.customer : null
            const vId = v.viajeId || (tripObj ? (tripObj._id || tripObj.id) : v.trip) || ''
            const cId = v.clienteId || (custObj ? (custObj._id || custObj.id) : v.customer) || ''

            nuevas.push({
              id: v.ticketCode || v.id || v._id,
              _id: v._id,
              ventaId: v.ventaId || v.saleId || v.ticketCode || v.id || v._id,
              viajeId: vId,
              trip: tripObj,
              clienteId: cId,
              customer: custObj,
              customerName: v.customerName || custObj?.nombre || '',
              customerDoc: v.customerDoc || custObj?.documento || '',
              puestoId: Number(v.puestoId !== undefined ? v.puestoId : v.seatNumber),
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

      const payload = {
        tripId: String(datos.viajeId),
        viajeId: String(datos.viajeId),
        customerId: datos.clienteId ? String(datos.clienteId) : undefined,
        clienteId: datos.clienteId ? String(datos.clienteId) : undefined,
        customerName: datos.customerName || '',
        customerDoc: datos.customerDoc || '',
        seatNumber: Number(datos.puestoId),
        puestoId: Number(datos.puestoId),
        totalAmount: Number(datos.precio),
        precio: Number(datos.precio),
        origin: datos.origen || '',
        destination: datos.destino || '',
        notes: datos.descripcion || '',
        descripcion: datos.descripcion || '',
        saleDate: fechaStr,
        fechaVenta: fechaStr,
        status: 'Pagado',
        estado: 'Pagado',
        paymentMethod: datos.metodoPago || 'Efectivo',
        metodoPago: datos.metodoPago || 'Efectivo'
      }

      try {
        const res = await ventaApi.crear(payload)
        const vGuardada = res?.data || res
        const primera = Array.isArray(vGuardada) ? vGuardada[0] : vGuardada
        const nueva = {
          id: primera?.ticketCode || primera?.id || `TKT-${num}`,
          _id: primera?._id,
          ventaId: primera?.saleId || primera?.ticketCode || primera?.id || `VTA-${num}`,
          viajeId: payload.viajeId,
          clienteId: payload.clienteId || (primera?.customer ? (primera.customer._id || primera.customer) : ''),
          customerName: primera?.customerName || payload.customerName,
          customerDoc: primera?.customerDoc || payload.customerDoc,
          puestoId: payload.puestoId,
          precio: payload.precio,
          descripcion: payload.descripcion,
          fechaVenta: payload.fechaVenta,
          estado: 'CONFIRMADO',
          metodoPago: payload.metodoPago,
          estadoDevolucion: 'No solicitada',
          notasDevolucion: ''
        }
        this.ventas.unshift(nueva)
        return nueva
      } catch (err) {
        console.error('Error al guardar venta en API, guardando local:', err)
        const nuevaLocal = {
          id: `TKT-${num}`,
          _id: `local-${Date.now()}`,
          ventaId: `VTA-${num}`,
          ...payload,
          estado: 'CONFIRMADO',
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

      const items = datos.items || datos.puestos || []
      if (items.length === 0) {
        this.cargando = false
        throw new Error('No se han seleccionado asientos para la venta.')
      }

      // Validar disponibilidad de puestos
      for (const item of items) {
        const numPuesto = Number(item.puestoId !== undefined ? item.puestoId : item.seatNumber)
        if (this.puestoOcupado(datos.viajeId, numPuesto)) {
          this.cargando = false
          throw new Error(`El puesto #${numPuesto} ya se encuentra ocupado para este viaje.`)
        }
      }

      const now = new Date()
      const fechaStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const tiquetesCreados = []

      try {
        for (const item of items) {
          const numPuesto = Number(item.puestoId !== undefined ? item.puestoId : item.seatNumber)
          const precioItem = Number(item.precio !== undefined ? item.precio : (item.totalAmount !== undefined ? item.totalAmount : (datos.precio || 0)))
          const cNom = item.customerName || item.nombre || datos.customerName || ''
          const cDoc = item.customerDoc || item.documento || datos.customerDoc || ''
          const cId = item.clienteId || item.customerId || datos.clienteId || undefined

          const payload = {
            tripId: String(datos.viajeId),
            viajeId: String(datos.viajeId),
            seatNumber: numPuesto,
            puestoId: numPuesto,
            customerId: cId,
            clienteId: cId,
            customerName: cNom,
            customerDoc: cDoc,
            totalAmount: precioItem,
            precio: precioItem,
            origin: item.origen || datos.origen || '',
            destination: item.destino || datos.destino || '',
            notes: item.notes || item.descripcion || datos.descripcion || '',
            descripcion: item.descripcion || item.notes || datos.descripcion || '',
            saleDate: fechaStr,
            fechaVenta: fechaStr,
            status: 'Pagado',
            estado: 'Pagado',
            paymentMethod: datos.paymentMethod || datos.metodoPago || 'Efectivo',
            metodoPago: datos.metodoPago || datos.paymentMethod || 'Efectivo'
          }

          try {
            const res = await ventaApi.crear(payload)
            const resObj = res?.data || res
            const primera = Array.isArray(resObj) ? resObj[0] : resObj
            const tkt = {
              id: primera?.ticketCode || primera?.id || primera?._id || `TKT-${String(this.ventas.length + 1).padStart(3, '0')}`,
              _id: primera?._id,
              ventaId: primera?.saleId || primera?.ticketCode || primera?.id || `VTA-${String(this.ventas.length + 1).padStart(3, '0')}`,
              viajeId: String(datos.viajeId),
              clienteId: cId || (primera?.customer ? (primera.customer._id || primera.customer) : ''),
              customerName: cNom,
              customerDoc: cDoc,
              puestoId: numPuesto,
              precio: precioItem,
              descripcion: payload.descripcion,
              fechaVenta: fechaStr,
              estado: 'CONFIRMADO',
              metodoPago: payload.metodoPago,
              estadoDevolucion: 'No solicitada',
              notasDevolucion: ''
            }
            this.ventas.unshift(tkt)
            tiquetesCreados.push(tkt)
          } catch (itemErr) {
            console.error('Error al guardar tiquete en backend, guardando local:', itemErr)
            const num = String(this.ventas.length + 1).padStart(3, '0')
            const fallbackTkt = {
              id: `TKT-${num}`,
              _id: `local-${Date.now()}-${numPuesto}`,
              ventaId: `VTA-${num}`,
              viajeId: String(datos.viajeId),
              clienteId: cId || '',
              customerName: cNom,
              customerDoc: cDoc,
              puestoId: numPuesto,
              precio: precioItem,
              descripcion: payload.descripcion,
              fechaVenta: fechaStr,
              estado: 'CONFIRMADO',
              metodoPago: payload.metodoPago,
              estadoDevolucion: 'No solicitada',
              notasDevolucion: ''
            }
            this.ventas.unshift(fallbackTkt)
            tiquetesCreados.push(fallbackTkt)
          }
        }

        return {
          saleId: tiquetesCreados[0]?.ventaId || `VTA-${Date.now()}`,
          tiquetes: tiquetesCreados,
          data: tiquetesCreados
        }
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
