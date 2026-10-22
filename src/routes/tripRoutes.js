const express = require('express');
const router = express.Router();
const {
  obtenerViajes,
  obtenerViajePorId,
  obtenerParadasRuta,
  crearViaje,
  actualizarViaje
} = require('../controllers/tripController');

router.route('/')
  .get(obtenerViajes)
  .post(crearViaje);

router.route('/:id')
  .get(obtenerViajePorId)
  .put(actualizarViaje);

// Endpoint específico para consultar el recorrido oficial y orden de paradas
router.route('/:id/paradas')
  .get(obtenerParadasRuta);

module.exports = router;
