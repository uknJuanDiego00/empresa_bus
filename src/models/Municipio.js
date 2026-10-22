const mongoose = require('mongoose');

/**
 * Esquema de Municipios de Colombia (Codificación Oficial DIVIPOLA DANE)
 */
const MunicipioSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código DIVIPOLA del municipio es obligatorio'],
      unique: true,
      trim: true,
      index: true
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del municipio es obligatorio'],
      trim: true,
      index: true
    },
    departamentoCodigo: {
      type: String,
      required: [true, 'El código del departamento es obligatorio'],
      trim: true,
      index: true
    },
    departamentoNombre: {
      type: String,
      required: [true, 'El nombre del departamento es obligatorio'],
      trim: true,
      index: true
    },
    esCapital: {
      type: Boolean,
      default: false,
      index: true
    },
    esCiudadPrincipal: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Índice de texto para búsquedas rápidas por municipio y departamento
MunicipioSchema.index({ nombre: 'text', departamentoNombre: 'text' });

module.exports = mongoose.models.Municipio || mongoose.model('Municipio', MunicipioSchema);
