import { defineStore } from 'pinia'
import { ventaApi } from '../services/api'
import { useVehiculoStore } from './vehiculoStore'
import { useViajeStore } from './viajeStore'

function normalizeEstado(estado) {
  if (!estado) return 'CONFIRMADO'
  if (['Pagado', 'CONFIRMED', 'Pendiente', 'PENDING'].includes(estado)) return 'CONFIRMADO'
  if (['Cancelado', 'CANCELLED'].includes(estado)) return 'CANCELADO'
  return estado
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
              piso: Number(v.piso || v.floor || 1),
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

    validarReglasTrayectoria({ vehiculoId, viajeId, origen, destino }) {
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
      this.validarReglasTrayectoria({
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

      const payload = {
        tripId: String(datos.viajeId),
        viajeId: String(datos.viajeId),
        customerId: datos.clienteId ? String(datos.clienteId) : undefined,
        clienteId: datos.clienteId ? String(datos.clienteId) : undefined,
        customerName: datos.customerName.trim(),
        customerDoc: datos.customerDoc.trim(),
        seatNumber: Number(datos.puestoId),
        puestoId: Number(datos.puestoId),
        piso: Number(datos.piso || 1),
        floor: Number(datos.piso || 1),
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
          piso: payload.piso,
          precio: payload.precio,
          origen: payload.origin || datos.origen || '',
          destino: payload.destination || datos.destino || '',
          origin: payload.origin || datos.origen || '',
          destination: payload.destination || datos.destino || '',
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
      const items = datos.items || datos.puestos || []
      const origenItem = datos.origen || items[0]?.origen
      const destinoItem = datos.destino || items[0]?.destino

      this.validarReglasTrayectoria({
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

      // Validar puestos duplicados en la misma petición
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

      try {
        for (const item of items) {
          const numPuesto = Number(item.puestoId !== undefined ? item.puestoId : item.seatNumber)
          const precioItem = Number(item.precio !== undefined ? item.precio : (item.totalAmount !== undefined ? item.totalAmount : (datos.precio || 0)))
          const cNom = (item.customerName || item.nombre || '').trim()
          const cDoc = (item.customerDoc || item.documento || '').trim()
          const cId = item.clienteId || item.customerId || undefined
          const pisoNum = Number(item.piso || item.floor || 1)

          const payload = {
            tripId: String(datos.viajeId),
            viajeId: String(datos.viajeId),
            seatNumber: numPuesto,
            puestoId: numPuesto,
            piso: pisoNum,
            floor: pisoNum,
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
              piso: pisoNum,
              precio: precioItem,
              origen: payload.origin,
              destino: payload.destination,
              origin: payload.origin,
              destination: payload.destination,
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
              piso: pisoNum,
              precio: precioItem,
              origen: payload.origin,
              destino: payload.destination,
              origin: payload.origin,
              destination: payload.destination,
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

    async cancelarVentaConDevolucion(id, { motivo, aplicaDevolucion, montoDevuelto, metodoDevolucion }) {
      const v = this.obtenerVenta(id)
      if (!v) {
        throw new Error('Venta no encontrada.')
      }
      if (v.estado === 'CANCELADO') {
        throw new Error('Esta venta ya se encuentra cancelada.')
      }

      this.cargando = true
      try {
        const fechaCancel = new Date().toISOString()
        const monto = aplicaDevolucion ? Number(montoDevuelto !== undefined ? montoDevuelto : (v.precio || 0)) : 0
        const estadoDev = aplicaDevolucion ? 'Devuelta' : (v.estadoDevolucion === 'Devuelta' ? 'Devuelta' : 'Sin devolución')

        // Actualizar datos de forma reactiva y completa
        v.estado = 'CANCELADO'
        v.status = 'CANCELLED'
        v.motivoCancelacion = motivo || ''
        v.fechaCancelacion = fechaCancel
        v.estadoDevolucion = estadoDev
        v.montoDevuelto = monto
        v.metodoDevolucion = metodoDevolucion || v.metodoPago || 'Efectivo'
        v.notasDevolucion = motivo || v.notasDevolucion || ''

        // Persistir en backend API
        try {
          await ventaApi.cancelar(id, {
            motivo: motivo || '',
            aplicaDevolucion,
            montoDevuelto: monto,
            metodoDevolucion: v.metodoDevolucion
          })
          if (aplicaDevolucion) {
            await ventaApi.actualizarDevolucion(id, {
              estadoDevolucion: 'Devuelta',
              montoDevuelto: monto,
              notasDevolucion: motivo || ''
            })
          }
        } catch (apiErr) {
          console.warn('API backend no respondió, cancelación guardada en almacenamiento local:', apiErr.message)
        }

        return v
      } finally {
        this.cargando = false
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
