const Departamento = require('../models/Departamento');
const Municipio = require('../models/Municipio');
const { ejecutarSeedIdempotente, DEPARTAMENTOS_RAW, MUNICIPIOS_RAW } = require('../scripts/seedGeografia');

// @desc    Obtener lista de departamentos (32 + Bogotá D.C.)
// @route   GET /api/geografia/departamentos
exports.obtenerDepartamentos = async (req, res) => {
  try {
    let departamentos = await Departamento.find().sort({ nombre: 1 });
    if (!departamentos || departamentos.length === 0) {
      // Fallback a memoria si la base de datos aún no ha ejecutado el seed
      departamentos = DEPARTAMENTOS_RAW.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    res.json({
      success: true,
      count: departamentos.length,
      data: departamentos
    });
  } catch (error) {
    res.json({
      success: true,
      count: DEPARTAMENTOS_RAW.length,
      data: DEPARTAMENTOS_RAW.sort((a, b) => a.nombre.localeCompare(b.nombre))
    });
  }
};

// @desc    Obtener municipios (filtrables por departamento o query q)
// @route   GET /api/geografia/municipios
exports.obtenerMunicipios = async (req, res) => {
  try {
    const { departamento, q } = req.query;
    const filtro = {};

    if (departamento) {
      filtro.$or = [
        { departamentoCodigo: departamento },
        { departamentoNombre: new RegExp(departamento, 'i') }
      ];
    }

    if (q) {
      const qRegex = new RegExp(q, 'i');
      filtro.$or = [
        { nombre: qRegex },
        { departamentoNombre: qRegex },
        { codigo: qRegex }
      ];
    }

    let municipios = await Municipio.find(filtro).sort({ esCapital: -1, nombre: 1 });
    if (!municipios || municipios.length === 0) {
      // Fallback a catálogo en memoria
      municipios = MUNICIPIOS_RAW.filter(m => {
        const coincideDepto = !departamento ||
          m.departamentoCodigo === departamento ||
          m.departamentoNombre.toLowerCase().includes(departamento.toLowerCase());
        const coincideQ = !q ||
          m.nombre.toLowerCase().includes(q.toLowerCase()) ||
          m.departamentoNombre.toLowerCase().includes(q.toLowerCase()) ||
          m.codigo.includes(q);
        return coincideDepto && coincideQ;
      });
    }

    res.json({
      success: true,
      count: municipios.length,
      data: municipios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al consultar municipios',
      error: error.message
    });
  }
};

// @desc    Obtener capitales y ciudades principales de Colombia
// @route   GET /api/geografia/ciudades-principales
exports.obtenerCiudadesPrincipales = async (req, res) => {
  try {
    let ciudades = await Municipio.find({
      $or: [{ esCapital: true }, { esCiudadPrincipal: true }]
    }).sort({ esCapital: -1, nombre: 1 });

    if (!ciudades || ciudades.length === 0) {
      ciudades = MUNICIPIOS_RAW.filter(m => m.esCapital || m.esCiudadPrincipal);
    }

    res.json({
      success: true,
      count: ciudades.length,
      data: ciudades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al consultar ciudades principales',
      error: error.message
    });
  }
};

// @desc    Ejecutar importación/sincronización idempotente del catálogo territorial
// @route   POST /api/geografia/seed
exports.ejecutarSeed = async (req, res) => {
  try {
    const resultado = await ejecutarSeedIdempotente();
    res.json({
      success: true,
      message: 'Catálogo de departamentos y municipios sincronizado exitosamente sin duplicados.',
      detalles: resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al ejecutar seed de geografía',
      error: error.message
    });
  }
};
