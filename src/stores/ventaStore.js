import { defineStore } from 'pinia'
import { useVehiculoStore } from './vehiculoStore'
import { useViajeStore } from './viajeStore'

function normalizeEstado(estado) {
  if (!estado) return 'CONFIRMADO'
  if (['Pagado', 'CONFIRMED', 'Pendiente', 'PENDING'].includes(estado)) return 'CONFIRMADO'
  if (['Cancelado', 'CANCELLED'].includes(estado)) return 'CANCELADO'
  return estado
}

const VENTAS_INICIALES = [
  {
    id: 'TKT-001',
    ventaId: 'VTA-001',
    viajeId: 'via-001',
    clienteId: 'cli-001',
    customerName: 'Carlos Alberto Pérez Gómez',
    customerDoc: '1000000001',
    puestoId: 5,
    piso: 1,
    precio: 85000,
    origen: 'Bogotá D.C.',
    destino: 'Medellín',
    descripcion: 'Equipaje estándar 1 maleta',
    fechaVenta: '2026-11-19 09:30',
    estado: 'CONFIRMADO',
    metodoPago: 'Efectivo',
    estadoDevolucion: 'No solicitada',
    notasDevolucion: ''
  },
  {
    id: 'TKT-002',
    ventaId: 'VTA-002',
    viajeId: 'via-001',
    clienteId: 'cli-002',
    customerName: 'María Fernanda Gómez Ruiz',
    customerDoc: '1000000002',
    puestoId: 6,
    piso: 1,
    precio: 85000,
    origen: 'Bogotá D.C.',
    destino: 'Medellín',
    descripcion: '',
    fechaVenta: '2026-11-19 10:15',
    estado: 'CONFIRMADO',
    metodoPago: 'Tarjeta Débito',
    estadoDevolucion: 'No solicitada',
    notasDevolucion: ''
  },
  {
    id: 'TKT-003',
    ventaId: 'VTA-003',
    viajeId: 'via-002',
    clienteId: 'cli-003',
    customerName: 'Juan David Rodríguez Toro',
    customerDoc: '1000000003',
    puestoId: 12,
    piso: 1,
    precio: 70000,
    origen: 'Medellín',
    destino: 'Cali',
    descripcion: 'Asiento pasillo',
    fechaVenta: '2026-11-19 11:45',
    estado: 'CONFIRMADO',
    metodoPago: 'Transferencia',
    estadoDevolucion: 'No solicitada',
    notasDevolucion: ''
  }
]

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

    puestosOcupadosPorViaje: (state) => (viajeId, tramoOrigen, tramoDestino) => {
      const viajeStore = useViajeStore()
      const viaje = viajeStore.obtenerViaje(viajeId)
      const nums = []

      let paradas = []
      if (viaje) {
        paradas = [
          String(viaje.origen || '').trim().toLowerCase(),
          ...(Array.isArray(viaje.paradasIntermedias) ? viaje.paradasIntermedias.map(p => String(p).trim().toLowerCase()) : []),
          String(viaje.destino || '').trim().toLowerCase()
        ]
      }

      const reqO = tramoOrigen ? String(tramoOrigen).trim().toLowerCase() : ''
      const reqD = tramoDestino ? String(tramoDestino).trim().toLowerCase() : ''
      const idxReqO = reqO && paradas.length > 0 ? paradas.indexOf(reqO) : -1
      const idxReqD = reqD && paradas.length > 0 ? paradas.indexOf(reqD) : -1
      const tieneTramoValido = idxReqO !== -1 && idxReqD !== -1 && idxReqD > idxReqO

      for (const v of state.ventas) {
        const vId = String(v.viajeId || v.trip?._id || v.trip || '')
        const esMismoViaje = vId === String(viajeId)
        const esActivo = v.estado !== 'CANCELADO'

        if (!esMismoViaje || !esActivo) continue

        const puestoNum = Number(v.puestoId || v.seatNumber)
        if (!puestoNum) continue

        if (!tieneTramoValido) {
          if (!nums.includes(puestoNum)) nums.push(puestoNum)
          continue
        }

        const tktO = String(v.origen || v.origin || viaje.origen || '').trim().toLowerCase()
        const tktD = String(v.destino || v.destination || viaje.destino || '').trim().toLowerCase()

        let idxTktO = paradas.indexOf(tktO)
        let idxTktD = paradas.indexOf(tktD)

        if (idxTktO === -1) idxTktO = 0
        if (idxTktD === -1) idxTktD = paradas.length - 1

        const seSuperpone = Math.max(idxReqO, idxTktO) < Math.min(idxReqD, idxTktD)

        if (seSuperpone && !nums.includes(puestoNum)) {
          nums.push(puestoNum)
        }
      }
      return nums
    },

    puestosPendientesPorViaje: () => () => [],

    puestoOcupado: (state) => (viajeId, puestoId, tramoOrigen, tramoDestino) => {
      const ocupados = state.puestosOcupadosPorViaje(viajeId, tramoOrigen, tramoDestino)
      return ocupados.includes(Number(puestoId))
    },

    cuposDisponiblesViaje: (state) => (viajeId) => {
      const viajeStore = useViajeStore()
      const vehiculoStore = useVehiculoStore()
      const viaje = viajeStore.obtenerViaje(viajeId)
      if (!viaje) return 0
      const vehiculo = vehiculoStore.obtenerVehiculo(viaje.vehiculoId)
      if (!vehiculo) return 0
      const ocupados = state.ventas.filter(v => {
        const vId = String(v.viajeId || v.trip?._id || v.trip || '')
        return vId === String(viajeId) && v.estado !== 'CANCELADO'
      }).length
      return Math.max(0, Number(vehiculo.capacidad || 0) - ocupados)
    }
  },

  actions: {
    async cargarVentas() {
      this.cargando = true
      this.error = null
      try {
        if (this.ventas.length === 0) {
          this.ventas = [...VENTAS_INICIALES]
        }
      } finally {
        this.cargando = false
      }
    },

    validarRegrasTrayectoria({ vehiculoId, viajeId, origen, destino }) {
      const viajeStore = useViajeStore()
      const vehiculoStore = useVehiculoStore()

      if (!viajeId) {
        throw new Error('Debe especificar una trayectoria válida.')
      }

      const viaje = viajeStore.obtenerViaje(viajeId)
      if (!viaje) {
        throw new Error('La trayectoria especificada no existe en el sistema.')
      }

      const busId = vehiculoId || viaje.vehiculoId
      if (!busId) {
        throw new Error('La trayectoria no tiene ningún bus asignado.')
      }

      const vehiculo = vehiculoStore.obtenerVehiculo(busId)
      if (vehiculoId && vehiculo) {
        const vIdStr = String(viaje.vehiculoId || '')
        const busIdStr = String(vehiculo.id || vehiculo._id || '')
        if (vIdStr && busIdStr && vIdStr !== busIdStr && String(viaje.vehiculoId) !== String(vehiculo._id)) {
          throw new Error(`RESTRICCIÓN DE SEGURIDAD: La trayectoria "${viaje.codigo}" no está asignada al bus con placa ${vehiculo.placa}.`)
        }
      }

      if (origen && destino) {
        const paradasRuta = [
          String(viaje.origen || '').trim().toLowerCase(),
          ...(Array.isArray(viaje.paradasIntermedias) ? viaje.paradasIntermedias.map(p => String(p).trim().toLowerCase()) : []),
          String(viaje.destino || '').trim().toLowerCase()
        ]

        const o = String(origen).trim().toLowerCase()
        const d = String(destino).trim().toLowerCase()

        const idxO = paradasRuta.indexOf(o)
        const idxD = paradasRuta.indexOf(d)

        if (idxO === -1) {
          throw new Error(`El origen "${origen}" no pertenece a la trayectoria autorizada (${viaje.origen} → ${viaje.destino}).`)
        }

        if (idxD === -1) {
          throw new Error(`El destino "${destino}" no pertenece a la trayectoria autorizada (${viaje.origen} → ${viaje.destino}).`)
        }

        if (idxO >= idxD) {
          throw new Error(`RECORRIDO INVÁLIDO: El destino "${destino}" debe estar ubicado después del origen "${origen}" en el orden de la trayectoria autorizada.`)
        }
      }

      return true
    },

    async crearVenta(datos) {
      this.validarRegrasTrayectoria({
        vehiculoId: datos.vehiculoId,
        viajeId: datos.viajeId,
        origen: datos.origen,
        destino: datos.destino
      })

      const disp = this.cuposDisponiblesViaje(datos.viajeId)
      if (disp <= 0) {
        throw new Error('SIN CUPOS DISPONIBLES: El viaje ya no tiene puestos disponibles.')
      }

      if (this.puestoOcupado(datos.viajeId, datos.puestoId)) {
        throw new Error(`El puesto #${datos.puestoId} ya se encuentra ocupado para este viaje.`)
      }

      if (!datos.customerName?.trim() || !datos.customerDoc?.trim()) {
        throw new Error(`Debe completar el nombre y documento del pasajero para el puesto #${datos.puestoId}.`)
      }

      this.cargando = true
      this.error = null

      const num = String(this.ventas.length + 1).padStart(3, '0')
      const now = new Date()
      const fechaStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      const nueva = {
        id: `TKT-${num}`,
        ventaId: `VTA-${num}`,
        viajeId: String(datos.viajeId),
        clienteId: datos.clienteId ? String(datos.clienteId) : undefined,
        customerName: datos.customerName.trim(),
        customerDoc: datos.customerDoc.trim(),
        puestoId: Number(datos.puestoId),
        piso: Number(datos.piso || 1),
        precio: Number(datos.precio),
        origen: datos.origen || '',
        destino: datos.destino || '',
        descripcion: datos.descripcion || '',
        fechaVenta: fechaStr,
        estado: 'CONFIRMADO',
        metodoPago: datos.metodoPago || 'Efectivo',
        estadoDevolucion: 'No solicitada',
        notasDevolucion: ''
      }

      this.ventas.unshift(nueva)
      this.cargando = false
      return nueva
    },

    async crearVentaMultiple(datos) {
      const items = datos.items || datos.puestos || []
      const origenItem = datos.origen || items[0]?.origen
      const destinoItem = datos.destino || items[0]?.destino

      this.validarRegrasTrayectoria({
        vehiculoId: datos.vehiculoId,
        viajeId: datos.viajeId,
        origen: origenItem,
        destino: destinoItem
      })

      this.cargando = true
      this.error = null

      if (items.length === 0) {
        this.cargando = false
        throw new Error('No se han seleccionado asientos para la venta.')
      }

      const disp = this.cuposDisponiblesViaje(datos.viajeId)
      if (disp <= 0) {
        this.cargando = false
        throw new Error('SIN CUPOS DISPONIBLES: El viaje ya no tiene puestos disponibles.')
      }

      if (items.length > disp) {
        this.cargando = false
        throw new Error(`Solo quedan ${disp} puesto(s) disponible(s) para este viaje.`)
      }

      const puestosVistos = new Set()
      for (const item of items) {
        const numPuesto = Number(item.puestoId !== undefined ? item.puestoId : item.seatNumber)
        if (puestosVistos.has(numPuesto)) {
          this.cargando = false
          throw new Error(`El puesto #${numPuesto} está duplicado en la selección.`)
        }
        puestosVistos.add(numPuesto)

        if (this.puestoOcupado(datos.viajeId, numPuesto)) {
          this.cargando = false
          throw new Error(`El puesto #${numPuesto} ya se encuentra ocupado para este viaje.`)
        }

        const cNom = (item.customerName || item.nombre || '').trim()
        const cDoc = (item.customerDoc || item.documento || '').trim()
        if (!cNom || !cDoc) {
          this.cargando = false
          throw new Error(`Falta completar nombre y cédula para el pasajero del puesto #${numPuesto}.`)
        }
      }

      const now = new Date()
      const fechaStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const tiquetesCreados = []

      for (const item of items) {
        const numPuesto = Number(item.puestoId !== undefined ? item.puestoId : item.seatNumber)
        const precioItem = Number(item.precio !== undefined ? item.precio : (item.totalAmount !== undefined ? item.totalAmount : (datos.precio || 0)))
        const cNom = (item.customerName || item.nombre || '').trim()
        const cDoc = (item.customerDoc || item.documento || '').trim()
        const cId = item.clienteId || item.customerId || undefined
        const pisoNum = Number(item.piso || item.floor || 1)
        const num = String(this.ventas.length + 1).padStart(3, '0')

        const tkt = {
          id: `TKT-${num}`,
          ventaId: `VTA-${num}`,
          viajeId: String(datos.viajeId),
          clienteId: cId || '',
          customerName: cNom,
          customerDoc: cDoc,
          puestoId: numPuesto,
          piso: pisoNum,
          precio: precioItem,
          origen: item.origen || datos.origen || '',
          destino: item.destino || datos.destino || '',
          descripcion: item.descripcion || item.notes || datos.descripcion || '',
          fechaVenta: fechaStr,
          estado: 'CONFIRMADO',
          metodoPago: datos.metodoPago || datos.paymentMethod || 'Efectivo',
          estadoDevolucion: 'No solicitada',
          notasDevolucion: ''
        }
        this.ventas.unshift(tkt)
        tiquetesCreados.push(tkt)
      }

      this.cargando = false
      return tiquetesCreados
    },

    async cancelarVenta(id, datos = {}) {
      this.cargando = true
      this.error = null

      try {
        const v = this.obtenerVenta(id)
        if (!v) {
          throw new Error('Venta no encontrada.')
        }

        const motivo = datos.motivo || ''
        const aplicaDevolucion = Boolean(datos.aplicaDevolucion)
        const monto = Number(datos.montoDevuelto !== undefined ? datos.montoDevuelto : v.precio)

        v.estado = 'CANCELADO'
        v.motivoCancelacion = motivo
        v.fechaCancelacion = new Date().toISOString()
        v.aplicaDevolucion = aplicaDevolucion
        v.montoDevuelto = aplicaDevolucion ? monto : 0
        v.metodoDevolucion = datos.metodoDevolucion || 'Efectivo'
        v.estadoDevolucion = aplicaDevolucion ? 'Devuelta' : 'No aplica'
        v.notasDevolucion = motivo

        return v
      } finally {
        this.cargando = false
      }
    },

    async actualizarDevolucion(id, estadoDevolucion, notas) {
      const v = this.obtenerVenta(id)
      if (v) {
        v.estadoDevolucion = estadoDevolucion
        if (notas) v.notasDevolucion = notas
        if (estadoDevolucion === 'Devuelta') {
          v.estado = 'CANCELADO'
        }
      }
      return v
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
