const Trip = require('../models/Trip');

// @desc    Obtener todos los viajes con sus paradas
// @route   GET /api/viajes
exports.obtenerViajes = async (req, res) => {
  try {
    const viajes = await Trip.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: viajes.length,
      data: viajes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los viajes',
      error: error.message
    });
  }
};

// @desc    Obtener un viaje por ID con sus paradas
// @route   GET /api/viajes/:id
exports.obtenerViajePorId = async (req, res) => {
  try {
    const viaje = await Trip.findById(req.params.id);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    res.json({
      success: true,
      data: viaje
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el viaje',
      error: error.message
    });
  }
};

// @desc    Obtener la secuencia oficial ordenada de paradas de un viaje
// @route   GET /api/viajes/:id/paradas
exports.obtenerParadasRuta = async (req, res) => {
  try {
    const viaje = await Trip.findById(req.params.id);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    const paradas = [
      viaje.origen,
      ...(Array.isArray(viaje.paradasIntermedias) ? viaje.paradasIntermedias : []),
      viaje.destino
    ].filter(Boolean);

    res.json({
      success: true,
      viajeId: viaje._id,
      codigo: viaje.codigo,
      totalParadas: paradas.length,
      origen: viaje.origen,
      destino: viaje.destino,
      paradas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener paradas de la ruta',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo viaje con paradas intermedias ordenadas
// @route   POST /api/viajes
exports.crearViaje = async (req, res) => {
  try {
    const { origen, destino, paradasIntermedias, fecha, hora, vehiculoId, precio, estado, codigo } = req.body;

    if (!origen || !destino) {
      return res.status(400).json({
        success: false,
        message: 'El origen y el destino son obligatorios'
      });
    }

    // Asegurar que las paradas intermedias sean un array limpio sin valores vacíos
    const paradasLimpias = Array.isArray(paradasIntermedias)
      ? paradasIntermedias.map(p => String(p).trim()).filter(Boolean)
      : [];

    const nuevoViaje = await Trip.create({
      codigo: codigo || `VIA-${Date.now().toString().slice(-4)}`,
      origen: origen.trim(),
      destino: destino.trim(),
      paradasIntermedias: paradasLimpias,
      fecha,
      hora,
      vehiculoId,
      precio: Number(precio),
      estado: estado || 'Programado'
    });

    res.status(201).json({
      success: true,
      message: 'Viaje programado correctamente',
      data: nuevoViaje
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al programar el viaje',
      error: error.message
    });
  }
};

// @desc    Actualizar viaje (ej. estado o itinerario)
// @route   PUT /api/viajes/:id
exports.actualizarViaje = async (req, res) => {
  try {
    const viaje = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    res.json({
      success: true,
      data: viaje
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el viaje',
      error: error.message
    });
  }
};
