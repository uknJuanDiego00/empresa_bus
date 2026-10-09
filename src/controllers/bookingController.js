const Booking = require('../models/booking');
const Trip = require('../models/trip');
const Customer = require('../models/customer');

exports.createBooking = async (req, res) => {
  try {
    const {
      tripId,
      viajeId,
      seatNumber,
      puestoId,
      customerId,
      clienteId,
      customerName,
      customerDoc,
      totalAmount,
      precio,
      notes,
      descripcion,
      saleDate,
      fechaVenta,
      status,
      estado,
      paymentMethod,
      metodoPago,
      items,
      puestos
    } = req.body;

    const finalTripId = viajeId || tripId;
    const finalPaymentMethod = paymentMethod || metodoPago || 'Efectivo';
    // Normalize and validate incoming status
    let rawStatus = estado || status || 'CONFIRMADO';
    // Normalize legacy values
    if (['Pagado', 'CONFIRMED', 'Pendiente', 'PENDING'].includes(rawStatus)) rawStatus = 'CONFIRMADO';
    if (['Cancelado', 'CANCELLED'].includes(rawStatus)) rawStatus = 'CANCELADO';
    if (!['CONFIRMADO', 'CANCELADO'].includes(rawStatus)) {
      return res.status(400).json({ success: false, message: 'Estado no válido. Solo se permiten: CONFIRMADO, CANCELADO' });
    }
    const finalStatus = rawStatus;

    const trip = await Trip.findById(finalTripId).populate('bus');
    if (!trip) {
      return res.status(404).json({ success: false, message: 'El viaje seleccionado no existe' });
    }

    const capacity = trip.bus ? trip.bus.capacity : 50;

    const now = new Date();
    let finalFechaVenta = fechaVenta || saleDate;
    if (!finalFechaVenta) {
      finalFechaVenta = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    // --- FLUJO 1: VENTA MULTI-ASIENTO / MULTI-PASAJERO ---
    const itemsVenta = Array.isArray(items) && items.length > 0 ? items : (Array.isArray(puestos) && puestos.length > 0 ? puestos : null);

    if (itemsVenta && itemsVenta.length > 0) {
      // 1. Pre-validación estricta de todos los asientos y pasajeros antes de guardar
      const asientosCheck = new Set();
      for (const item of itemsVenta) {
        const numPuesto = Number(item.puestoId !== undefined ? item.puestoId : item.seatNumber);
        if (!numPuesto || numPuesto < 1 || numPuesto > capacity) {
          return res.status(400).json({
            success: false,
            message: `El número de asiento ${numPuesto} no es válido. Capacidad máxima: ${capacity}`
          });
        }

        if (asientosCheck.has(numPuesto)) {
          return res.status(400).json({
            success: false,
            message: `El asiento #${numPuesto} está duplicado en la misma solicitud.`
          });
        }
        asientosCheck.add(numPuesto);

        if (trip.bus && Array.isArray(trip.bus.puestos)) {
          const seatConfig = trip.bus.puestos.find(p => p.id === numPuesto || p.numero === numPuesto);
          if (seatConfig && seatConfig.esConductor) {
            return res.status(400).json({
              success: false,
              message: `El asiento #${numPuesto} es el puesto del conductor y no puede venderse.`
            });
          }
        }

        const existingBooking = await Booking.findOne({
          trip: finalTripId,
          seatNumber: numPuesto,
          status: 'CONFIRMADO'
        });

        if (existingBooking) {
          return res.status(409).json({
            success: false,
            message: `El puesto #${numPuesto} ya se encuentra ocupado o reservado para este viaje. Por favor actualice la selección.`
          });
        }

        const cName = (item.customerName || item.nombre || '').trim();
        const cDoc = (item.customerDoc || item.documento || '').trim();
        if (!cName || !cDoc) {
          return res.status(400).json({
            success: false,
            message: `Cada asiento debe tener un pasajero asignado con nombre y documento válidos (Asiento #${numPuesto}).`
          });
        }

        const seatPrice = Number(item.precio !== undefined ? item.precio : (item.totalAmount !== undefined ? item.totalAmount : trip.price));
        if (isNaN(seatPrice) || seatPrice <= 0) {
          return res.status(400).json({
            success: false,
            message: `La tarifa asignada al asiento #${numPuesto} es inválida o menor a cero.`
          });
        }
      }

      // 2. Si todas las validaciones pasaron, generar identificador único de venta común
      const countVentas = await Booking.countDocuments();
      const saleId = `VTA-${String(countVentas + 1).padStart(4, '0')}`;
      const creados = [];

      let seq = 1;
      for (const item of itemsVenta) {
        const numPuesto = Number(item.puestoId !== undefined ? item.puestoId : item.seatNumber);
        const ticketCode = `TKT-${String(countVentas + seq).padStart(3, '0')}`;
        seq += 1;

        let clienteRef = null;
        const cDoc = (item.customerDoc || item.documento || '').trim();
        const cId = item.clienteId || item.customerId;
        if (cId && String(cId).match(/^[0-9a-fA-F]{24}$/)) {
          clienteRef = await Customer.findById(cId);
        }
        if (!clienteRef && cDoc) {
          clienteRef = await Customer.findOne({ documento: cDoc });
        }

        const segOrigin = (item.origen || item.origin || req.body.origen || req.body.origin || trip.origin || '').trim();
        const segDest = (item.destino || item.destination || req.body.destino || req.body.destination || trip.destination || '').trim();

        const nuevoTkt = await Booking.create({
          ticketCode,
          saleId,
          trip: finalTripId,
          customer: clienteRef ? clienteRef._id : null,
          seatNumber: numPuesto,
          customerName: (item.customerName || item.nombre || (clienteRef ? clienteRef.nombre : '')).trim(),
          customerDoc: (item.customerDoc || item.documento || (clienteRef ? clienteRef.documento : '')).trim(),
          totalAmount: Number(item.precio !== undefined ? item.precio : (item.totalAmount !== undefined ? item.totalAmount : trip.price)),
          origin: segOrigin,
          destination: segDest,
          notes: item.descripcion || item.notes || descripcion || notes || '',
          saleDate: finalFechaVenta,
          status: finalStatus,
          paymentMethod: finalPaymentMethod,
          refundStatus: 'No solicitada'
        });

        const pop = await Booking.findById(nuevoTkt._id)
          .populate({ path: 'trip', populate: { path: 'bus' } })
          .populate('customer');
        creados.push(pop);
      }

      return res.status(201).json({
        success: true,
        message: `¡Venta de ${creados.length} tiquete(s) registrada con éxito!`,
        saleId,
        count: creados.length,
        data: creados
      });
    }

    // --- FLUJO 2: VENTA INDIVIDUAL ---
    const finalSeatNumber = Number(puestoId !== undefined ? puestoId : seatNumber);

    if (finalSeatNumber < 1 || finalSeatNumber > capacity) {
      return res.status(400).json({
        success: false,
        message: `El número de asiento ${finalSeatNumber} no es válido. Capacidad máxima: ${capacity}`
      });
    }

    if (trip.bus && Array.isArray(trip.bus.puestos)) {
      const seatConfig = trip.bus.puestos.find(p => p.id === finalSeatNumber || p.numero === finalSeatNumber);
      if (seatConfig && seatConfig.esConductor) {
        return res.status(400).json({
          success: false,
          message: `El asiento #${finalSeatNumber} es el puesto del conductor y no puede venderse.`
        });
      }
    }

    const existingActiveBooking = await Booking.findOne({
      trip: finalTripId,
      seatNumber: finalSeatNumber,
      status: 'CONFIRMADO'
    });

    if (existingActiveBooking) {
      return res.status(409).json({
        success: false,
        message: `El puesto #${finalSeatNumber} ya fue vendido y está Ocupado para este viaje. Por favor seleccione otro asiento disponible.`
      });
    }

    let finalCustomer = null;
    let finalCustomerName = (customerName || '').trim();
    let finalCustomerDoc = (customerDoc || '').trim();

    const lookupClientId = clienteId || customerId;
    if (lookupClientId && lookupClientId.match(/^[0-9a-fA-F]{24}$/)) {
      finalCustomer = await Customer.findById(lookupClientId);
    }
    if (!finalCustomer && finalCustomerDoc) {
      finalCustomer = await Customer.findOne({ documento: finalCustomerDoc });
    }

    if (finalCustomer) {
      finalCustomerName = finalCustomer.nombre;
      finalCustomerDoc = finalCustomer.documento;
    }

    if (!finalCustomerName || !finalCustomerDoc) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y documento del cliente son obligatorios'
      });
    }

    const count = await Booking.countDocuments();
    const ticketCode = `TKT-${String(count + 1).padStart(3, '0')}`;
    const saleId = `VTA-${String(count + 1).padStart(4, '0')}`;

    const finalAmount = Number(precio !== undefined ? precio : (totalAmount !== undefined ? totalAmount : trip.price));
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La tarifa del viaje debe ser un valor numérico mayor a cero.'
      });
    }
    const finalNotes = descripcion || notes || '';
    const finalOrigin = (req.body.origen || req.body.origin || trip.origin || '').trim();
    const finalDestination = (req.body.destino || req.body.destination || trip.destination || '').trim();

    const booking = await Booking.create({
      ticketCode,
      saleId,
      trip: finalTripId,
      customer: finalCustomer ? finalCustomer._id : null,
      seatNumber: finalSeatNumber,
      customerName: finalCustomerName,
      customerDoc: finalCustomerDoc,
      totalAmount: finalAmount,
      origin: finalOrigin,
      destination: finalDestination,
      notes: finalNotes,
      saleDate: finalFechaVenta,
      status: finalStatus,
      paymentMethod: finalPaymentMethod,
      refundStatus: 'No solicitada'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'trip',
        populate: { path: 'bus' }
      })
      .populate('customer');

    res.status(201).json({
      success: true,
      message: '¡Tiquete emitido con éxito!',
      data: populatedBooking
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `El asiento #${req.body.puestoId || req.body.seatNumber} ya fue vendido para este viaje.`
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { doc, tripId, viajeId } = req.query;
    let query = {};

    if (doc) query.customerDoc = doc.trim();
    const filterTrip = viajeId || tripId;
    if (filterTrip) query.trip = filterTrip;

    const bookings = await Booking.find(query)
      .populate({
        path: 'trip',
        populate: { path: 'bus' }
      })
      .populate('customer')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTicketByCode = async (req, res) => {
  try {
    const { code } = req.params;
    let booking = null;

    if (code.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(code).populate({
        path: 'trip',
        populate: { path: 'bus' }
      }).populate('customer');
    }

    if (!booking) {
      booking = await Booking.findOne({ ticketCode: code }).populate({
        path: 'trip',
        populate: { path: 'bus' }
      }).populate('customer');
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Tiquete no encontrado' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    let booking = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(id);
    }
    if (!booking) {
      booking = await Booking.findOne({ ticketCode: id });
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Tiquete no encontrado' });
    }

    booking.status = 'CANCELADO';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Tiquete cancelado exitosamente',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateRefundStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estadoDevolucion, refundStatus, notasDevolucion, notes } = req.body;
    const nuevoEstado = refundStatus || estadoDevolucion;

    const estadosValidos = [
      'No solicitada',
      'Pendiente de revisión',
      'Aprobada',
      'Rechazada',
      'Devuelta'
    ];

    if (!nuevoEstado || !estadosValidos.includes(nuevoEstado)) {
      return res.status(400).json({
        success: false,
        message: `Estado de devolución no válido. Opciones permitidas: ${estadosValidos.join(', ')}`
      });
    }

    let booking = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(id);
    }
    if (!booking) {
      booking = await Booking.findOne({ ticketCode: id });
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Tiquete no encontrado' });
    }

    // Regla de coherencia: No procesar nuevamente si ya fue devuelta
    if (booking.refundStatus === 'Devuelta' && nuevoEstado !== 'Devuelta') {
      return res.status(400).json({
        success: false,
        message: 'Esta venta ya se encuentra con devolución completada (Devuelta) y no permite cambios.'
      });
    }

    // Regla: No pasar a devuelta si fue rechazada sin antes revisar
    if (booking.refundStatus === 'Rechazada' && nuevoEstado === 'Devuelta') {
      return res.status(400).json({
        success: false,
        message: 'La solicitud de devolución fue rechazada. Debe someterse nuevamente a revisión antes de devolver el dinero.'
      });
    }

    booking.refundStatus = nuevoEstado;
    if (notasDevolucion || notes) {
      booking.refundNotes = notasDevolucion || notes;
    }

    // Si el dinero ya fue devuelto efectivamente ('Devuelta'), se libera el asiento marcando como Cancelado
    // Notar que 'Aprobada' NO cancela ni devuelve dinero inmediatamente (mantiene coherencia).
    if (nuevoEstado === 'Devuelta') {
      booking.status = 'CANCELADO';
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Estado de devolución actualizado a "${nuevoEstado}" exitosamente`,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};