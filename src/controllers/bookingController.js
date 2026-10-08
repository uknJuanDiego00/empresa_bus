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
      estado
    } = req.body;

    const finalTripId = viajeId || tripId;
    const finalSeatNumber = Number(puestoId !== undefined ? puestoId : seatNumber);

    const trip = await Trip.findById(finalTripId).populate('bus');
    if (!trip) {
      return res.status(404).json({ success: false, message: 'El viaje seleccionado no existe' });
    }

    const capacity = trip.bus ? trip.bus.capacity : 50;
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
      status: { $in: ['Pagado', 'CONFIRMED', 'Pendiente', 'PENDING'] }
    });

    if (existingActiveBooking) {
      const estadoMsg = (existingActiveBooking.status === 'Pendiente' || existingActiveBooking.status === 'PENDING')
        ? 'se encuentra actualmente en proceso de reserva (Pendiente)'
        : 'ya fue vendido y está Ocupado';
      return res.status(409).json({
        success: false,
        message: `El puesto #${finalSeatNumber} ${estadoMsg} para este viaje. Por favor seleccione otro asiento disponible.`
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

    let finalFechaVenta = fechaVenta || saleDate;
    if (!finalFechaVenta) {
      const now = new Date();
      finalFechaVenta = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    const finalAmount = Number(precio !== undefined ? precio : (totalAmount !== undefined ? totalAmount : trip.price));
    const finalNotes = descripcion || notes || '';
    const finalStatus = estado || status || 'Pagado';

    const booking = await Booking.create({
      ticketCode,
      trip: finalTripId,
      customer: finalCustomer ? finalCustomer._id : null,
      seatNumber: finalSeatNumber,
      customerName: finalCustomerName,
      customerDoc: finalCustomerDoc,
      totalAmount: finalAmount,
      notes: finalNotes,
      saleDate: finalFechaVenta,
      status: finalStatus
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

    booking.status = 'Cancelado';
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