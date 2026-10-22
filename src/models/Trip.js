const mongoose = require('mongoose');

/**
 * Esquema de Viaje / Itinerario Intermunicipal para VIABUS
 * Almacena el recorrido completo, incluyendo paradas intermedias ordenadas cronológicamente.
 */
const TripSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      trim: true,
      index: true
    },
    // Punto de partida inicial
    origen: {
      type: String,
      required: [true, 'El municipio de origen es obligatorio'],
      trim: true
    },
    // Destino final del recorrido
    destino: {
      type: String,
      required: [true, 'El municipio de destino final es obligatorio'],
      trim: true
    },
    // Secuencia de municipios/pueblos intermedios en orden estricto de ruta
    paradasIntermedias: {
      type: [
        {
          type: String,
          trim: true
        }
      ],
      default: []
    },
    fecha: {
      type: String,
      required: [true, 'La fecha de salida es obligatoria']
    },
    hora: {
      type: String,
      required: [true, 'La hora de salida es obligatoria']
    },
    vehiculoId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'El vehículo asignado es obligatorio']
    },
    bus: {
      type: mongoose.Schema.Types.Mixed
    },
    precio: {
      type: Number,
      required: [true, 'La tarifa base del viaje es obligatoria'],
      min: [0, 'El precio no puede ser negativo']
    },
    price: {
      type: Number
    },
    estado: {
      type: String,
      enum: ['Programado', 'Disponible', 'En Curso', 'Finalizado', 'Cancelado'],
      default: 'Programado'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para obtener la secuencia completa de paradas de la ruta en orden
TripSchema.virtual('recorridoCompleto').get(function () {
  const intermedias = Array.isArray(this.paradasIntermedias) ? this.paradasIntermedias : [];
  return [this.origen, ...intermedias, this.destino].filter(Boolean);
});

module.exports = mongoose.models.Trip || mongoose.model('Trip', TripSchema);
