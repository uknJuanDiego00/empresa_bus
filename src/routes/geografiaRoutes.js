const express = require('express');
const router = express.Router();
const {
  obtenerDepartamentos,
  obtenerMunicipios,
  obtenerCiudadesPrincipales,
  ejecutarSeed
} = require('../controllers/geografiaController');

router.get('/departamentos', obtenerDepartamentos);
router.get('/municipios', obtenerMunicipios);
router.get('/ciudades-principales', obtenerCiudadesPrincipales);
router.post('/seed', ejecutarSeed);

module.exports = router;
