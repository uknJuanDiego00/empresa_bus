const mongoose = require('mongoose');

/**
 * Esquema de Departamentos de Colombia (Codificación Oficial DIVIPOLA DANE)
 */
const DepartamentoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código DIVIPOLA del departamento es obligatorio'],
      unique: true,
      trim: true,
      index: true
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del departamento es obligatorio'],
      trim: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Departamento || mongoose.model('Departamento', DepartamentoSchema);
