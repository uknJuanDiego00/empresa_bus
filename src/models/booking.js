const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  ticketCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'El viaje es obligatorio']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  seatNumber: {
    type: Number,
    required: [true, 'El número de asiento es obligatorio']
  },
  customerName: {
    type: String,
    required: [true, 'El nombre del cliente es obligatorio'],
    trim: true
  },
  customerDoc: {
    type: String,
    required: [true, 'El documento del cliente es obligatorio'],
    trim: true
  },
  totalAmount: {
    type: Number,
    required: [true, 'El valor del tiquete es obligatorio']
  },
  origin: {
    type: String,
    trim: true,
    default: ''
  },
  destination: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  saleDate: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['CONFIRMADO', 'CANCELADO'],
    default: 'CONFIRMADO'
  },
  saleId: {
    type: String,
    trim: true,
    default: ''
  },
  paymentMethod: {
    type: String,
    trim: true,
    default: 'Efectivo'
  },
  refundStatus: {
    type: String,
    enum: ['No solicitada', 'Pendiente de revisión', 'Aprobada', 'Rechazada', 'Devuelta'],
    default: 'No solicitada'
  },
  refundNotes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret.ticketCode || (ret._id ? ret._id.toString() : '');
      ret._dbId = ret._id ? ret._id.toString() : '';
      ret.ventaId = ret.saleId || ret.ticketCode || (ret._id ? ret._id.toString() : '');
      ret.puestoId = ret.seatNumber;
      ret.precio = ret.totalAmount;
      ret.origen = ret.origin || (ret.trip && ret.trip.origin) || '';
      ret.destino = ret.destination || (ret.trip && ret.trip.destination) || '';
      ret.descripcion = ret.notes;
      ret.fechaVenta = ret.saleDate;
      ret.estado = ret.status;
      ret.metodoPago = ret.paymentMethod || 'Efectivo';
      ret.estadoDevolucion = ret.refundStatus || 'No solicitada';
      ret.notasDevolucion = ret.refundNotes || '';
      if (ret.trip && ret.trip._id) {
        ret.viajeId = ret.trip._id.toString();
      } else if (ret.trip) {
        ret.viajeId = ret.trip.toString();
      }
      if (ret.customer && ret.customer._id) {
        ret.clienteId = ret.customer._id.toString();
      } else if (ret.customer) {
        ret.clienteId = ret.customer.toString();
      }
      return ret;
    }
  }
});

bookingSchema.index({ trip: 1, seatNumber: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);