import { defineStore } from 'pinia'
import { ventaApi } from '../services/api'

export const useVentaStore = defineStore('venta', {
  state: () => ({
    ventas: [],
    cargando: false,
    error: null
  }),
  getters: {
    totalIngresos: (state) =>
      state.ventas
        .filter(v => v.estado === 'Pagado' || v.status === 'CONFIRMED' || v.status === 'Pagado')
        .reduce((sum, v) => sum + (Number(v.precio || v.totalAmount) || 0), 0),
    puestosOcupadosPorViaje: (state) => (viajeId) => {
      return state.ventas
        .filter(v => (String(v.viajeId) === String(viajeId) || String(v.trip?._id || v.trip) === String(viajeId)) &&
                     (v.estado === 'Pagado' || v.status === 'CONFIRMED' || v.status === 'Pagado'))
        .map(v => Number(v.puestoId || v.seatNumber))
    },
    puestosPendientesPorViaje: (state) => (viajeId) => {
      return state.ventas
        .filter(v => (String(v.viajeId) === String(viajeId) || String(v.trip?._id || v.trip) === String(viajeId)) &&
                     (v.estado === 'Pendiente' || v.status === 'Pendiente' || v.status === 'PENDING'))
        .map(v => Number(v.puestoId || v.seatNumber))
    },
    puestoOcupado: (state) => (viajeId, puestoId) => {
      return state.ventas.some(
        v => (String(v.viajeId) === String(viajeId) || String(v.trip?._id || v.trip) === String(viajeId)) &&
             Number(v.puestoId || v.seatNumber) === Number(puestoId) &&
             v.estado !== 'Cancelado' && v.status !== 'Cancelado' && v.status !== 'CANCELLED'
      )
    }
  },
  actions: {
    async cargarVentas() {
      this.cargando = true
      this.error = null
      try {
        const res = await ventaApi.obtenerTodas()
        if (res && res.data) {
          this.ventas = res.data.map(v => ({
            id: v.ticketCode || v.id || v._id,
            _id: v._id,
            viajeId: v.viajeId || (v.trip ? (v.trip._id || v.trip) : ''),
            clienteId: v.clienteId || (v.customer ? (v.customer._id || v.customer) : ''),
            customerName: v.customerName,
            customerDoc: v.customerDoc,
            puestoId: Number(v.puestoId || v.seatNumber),
            precio: Number(v.precio !== undefined ? v.precio : v.totalAmount),
            descripcion: v.descripcion || v.notes || '',
            fechaVenta: v.fechaVenta || v.saleDate,
            estado: v.estado || v.status || 'Pagado'
          }))
        }
      } catch (err) {
        console.warn('No se pudo conectar a la API de ventas, usando datos locales:', err.message)
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
        viajeId: String(datos.viajeId),
        clienteId: String(datos.clienteId),
        puestoId: Number(datos.puestoId),
        precio: Number(datos.precio),
        descripcion: datos.descripcion || '',
        fechaVenta: fechaStr,
        estado: 'Pagado'
      }

      try {
        const res = await ventaApi.crear(payload)
        const vGuardada = res.data || res
        const nueva = {
          id: vGuardada.ticketCode || vGuardada.id || `TKT-${num}`,
          _id: vGuardada._id,
          viajeId: payload.viajeId,
          clienteId: payload.clienteId,
          puestoId: payload.puestoId,
          precio: payload.precio,
          descripcion: payload.descripcion,
          fechaVenta: payload.fechaVenta,
          estado: 'Pagado'
        }
        this.ventas.unshift(nueva)
        return nueva
      } catch (err) {
        console.warn('API error al registrar venta, guardando en local:', err.message)
        const nuevaLocal = {
          id: `TKT-${num}`,
          ...payload
        }
        this.ventas.unshift(nuevaLocal)
        return nuevaLocal
      } finally {
        this.cargando = false
      }
    },
    obtenerVenta(id) {
      if (!id) return null
      return this.ventas.find(
        v => String(v.id) === String(id) || String(v._id) === String(id) || String(v.ticketCode) === String(id)
      ) || null
    }
  },
  persist: true
})
