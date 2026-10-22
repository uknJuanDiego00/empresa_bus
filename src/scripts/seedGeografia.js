const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Departamento = require('../models/Departamento');
const Municipio = require('../models/Municipio');

dotenv.config();

// Catálogo maestro DIVIPOLA
const DEPARTAMENTOS_RAW = [
  { codigo: '91', nombre: 'Amazonas' },
  { codigo: '05', nombre: 'Antioquia' },
  { codigo: '81', nombre: 'Arauca' },
  { codigo: '08', nombre: 'Atlántico' },
  { codigo: '11', nombre: 'Bogotá D.C.' },
  { codigo: '13', nombre: 'Bolívar' },
  { codigo: '15', nombre: 'Boyacá' },
  { codigo: '17', nombre: 'Caldas' },
  { codigo: '18', nombre: 'Caquetá' },
  { codigo: '85', nombre: 'Casanare' },
  { codigo: '19', nombre: 'Cauca' },
  { codigo: '20', nombre: 'Cesar' },
  { codigo: '27', nombre: 'Chocó' },
  { codigo: '23', nombre: 'Córdoba' },
  { codigo: '25', nombre: 'Cundinamarca' },
  { codigo: '94', nombre: 'Guainía' },
  { codigo: '95', nombre: 'Guaviare' },
  { codigo: '41', nombre: 'Huila' },
  { codigo: '44', nombre: 'La Guajira' },
  { codigo: '47', nombre: 'Magdalena' },
  { codigo: '50', nombre: 'Meta' },
  { codigo: '52', nombre: 'Nariño' },
  { codigo: '54', nombre: 'Norte de Santander' },
  { codigo: '86', nombre: 'Putumayo' },
  { codigo: '63', nombre: 'Quindío' },
  { codigo: '66', nombre: 'Risaralda' },
  { codigo: '88', nombre: 'San Andrés y Providencia' },
  { codigo: '68', nombre: 'Santander' },
  { codigo: '70', nombre: 'Sucre' },
  { codigo: '73', nombre: 'Tolima' },
  { codigo: '76', nombre: 'Valle del Cauca' },
  { codigo: '97', nombre: 'Vaupés' },
  { codigo: '99', nombre: 'Vichada' }
];

const MUNICIPIOS_RAW = [
  // Amazonas
  { codigo: '91001', nombre: 'Leticia', departamentoCodigo: '91', departamentoNombre: 'Amazonas', esCapital: true, esCiudadPrincipal: true },
  { codigo: '91540', nombre: 'Puerto Nariño', departamentoCodigo: '91', departamentoNombre: 'Amazonas', esCapital: false, esCiudadPrincipal: false },

  // Antioquia
  { codigo: '05001', nombre: 'Medellín', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: true, esCiudadPrincipal: true },
  { codigo: '05088', nombre: 'Bello', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05360', nombre: 'Itagüí', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05266', nombre: 'Envigado', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05615', nombre: 'Rionegro', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05045', nombre: 'Apartadó', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05837', nombre: 'Turbo', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05154', nombre: 'Caucasia', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05887', nombre: 'Yarumal', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05686', nombre: 'Santa Rosa de Osos', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05318', nombre: 'Guarne', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05631', nombre: 'Sabaneta', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05129', nombre: 'Caldas', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05376', nombre: 'La Ceja', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05440', nombre: 'Marinilla', departamentoCodigo: '05', departamentoNombre: 'Antioquia', esCapital: false, esCiudadPrincipal: false },

  // Arauca
  { codigo: '81001', nombre: 'Arauca', departamentoCodigo: '81', departamentoNombre: 'Arauca', esCapital: true, esCiudadPrincipal: true },
  { codigo: '81736', nombre: 'Saravena', departamentoCodigo: '81', departamentoNombre: 'Arauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '81794', nombre: 'Tame', departamentoCodigo: '81', departamentoNombre: 'Arauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '81300', nombre: 'Fortul', departamentoCodigo: '81', departamentoNombre: 'Arauca', esCapital: false, esCiudadPrincipal: false },

  // Atlántico
  { codigo: '08001', nombre: 'Barranquilla', departamentoCodigo: '08', departamentoNombre: 'Atlántico', esCapital: true, esCiudadPrincipal: true },
  { codigo: '08758', nombre: 'Soledad', departamentoCodigo: '08', departamentoNombre: 'Atlántico', esCapital: false, esCiudadPrincipal: true },
  { codigo: '08433', nombre: 'Malambo', departamentoCodigo: '08', departamentoNombre: 'Atlántico', esCapital: false, esCiudadPrincipal: false },
  { codigo: '08638', nombre: 'Sabanalarga', departamentoCodigo: '08', departamentoNombre: 'Atlántico', esCapital: false, esCiudadPrincipal: false },
  { codigo: '08078', nombre: 'Baranoa', departamentoCodigo: '08', departamentoNombre: 'Atlántico', esCapital: false, esCiudadPrincipal: false },
  { codigo: '08573', nombre: 'Puerto Colombia', departamentoCodigo: '08', departamentoNombre: 'Atlántico', esCapital: false, esCiudadPrincipal: false },

  // Bogotá D.C.
  { codigo: '11001', nombre: 'Bogotá D.C.', departamentoCodigo: '11', departamentoNombre: 'Bogotá D.C.', esCapital: true, esCiudadPrincipal: true },

  // Bolívar
  { codigo: '13001', nombre: 'Cartagena', departamentoCodigo: '13', departamentoNombre: 'Bolívar', esCapital: true, esCiudadPrincipal: true },
  { codigo: '13430', nombre: 'Magangué', departamentoCodigo: '13', departamentoNombre: 'Bolívar', esCapital: false, esCiudadPrincipal: true },
  { codigo: '13244', nombre: 'El Carmen de Bolívar', departamentoCodigo: '13', departamentoNombre: 'Bolívar', esCapital: false, esCiudadPrincipal: false },
  { codigo: '13836', nombre: 'Turbaco', departamentoCodigo: '13', departamentoNombre: 'Bolívar', esCapital: false, esCiudadPrincipal: false },
  { codigo: '13468', nombre: 'Mompós', departamentoCodigo: '13', departamentoNombre: 'Bolívar', esCapital: false, esCiudadPrincipal: false },

  // Boyacá
  { codigo: '15001', nombre: 'Tunja', departamentoCodigo: '15', departamentoNombre: 'Boyacá', esCapital: true, esCiudadPrincipal: true },
  { codigo: '15238', nombre: 'Duitama', departamentoCodigo: '15', departamentoNombre: 'Boyacá', esCapital: false, esCiudadPrincipal: true },
  { codigo: '15759', nombre: 'Sogamoso', departamentoCodigo: '15', departamentoNombre: 'Boyacá', esCapital: false, esCiudadPrincipal: true },
  { codigo: '15176', nombre: 'Chiquinquirá', departamentoCodigo: '15', departamentoNombre: 'Boyacá', esCapital: false, esCiudadPrincipal: true },
  { codigo: '15516', nombre: 'Paipa', departamentoCodigo: '15', departamentoNombre: 'Boyacá', esCapital: false, esCiudadPrincipal: false },
  { codigo: '15572', nombre: 'Puerto Boyacá', departamentoCodigo: '15', departamentoNombre: 'Boyacá', esCapital: false, esCiudadPrincipal: false },
  { codigo: '15407', nombre: 'Villa de Leyva', departamentoCodigo: '15', departamentoNombre: 'Boyacá', esCapital: false, esCiudadPrincipal: false },

  // Caldas
  { codigo: '17001', nombre: 'Manizales', departamentoCodigo: '17', departamentoNombre: 'Caldas', esCapital: true, esCiudadPrincipal: true },
  { codigo: '17174', nombre: 'Chinchiná', departamentoCodigo: '17', departamentoNombre: 'Caldas', esCapital: false, esCiudadPrincipal: true },
  { codigo: '17380', nombre: 'La Dorada', departamentoCodigo: '17', departamentoNombre: 'Caldas', esCapital: false, esCiudadPrincipal: true },
  { codigo: '17873', nombre: 'Villamaría', departamentoCodigo: '17', departamentoNombre: 'Caldas', esCapital: false, esCiudadPrincipal: false },
  { codigo: '17614', nombre: 'Riosucio', departamentoCodigo: '17', departamentoNombre: 'Caldas', esCapital: false, esCiudadPrincipal: false },

  // Caquetá
  { codigo: '18001', nombre: 'Florencia', departamentoCodigo: '18', departamentoNombre: 'Caquetá', esCapital: true, esCiudadPrincipal: true },
  { codigo: '18753', nombre: 'San Vicente del Caguán', departamentoCodigo: '18', departamentoNombre: 'Caquetá', esCapital: false, esCiudadPrincipal: false },

  // Casanare
  { codigo: '85001', nombre: 'Yopal', departamentoCodigo: '85', departamentoNombre: 'Casanare', esCapital: true, esCiudadPrincipal: true },
  { codigo: '85010', nombre: 'Aguazul', departamentoCodigo: '85', departamentoNombre: 'Casanare', esCapital: false, esCiudadPrincipal: true },
  { codigo: '85440', nombre: 'Villanueva', departamentoCodigo: '85', departamentoNombre: 'Casanare', esCapital: false, esCiudadPrincipal: false },
  { codigo: '85410', nombre: 'Tauramena', departamentoCodigo: '85', departamentoNombre: 'Casanare', esCapital: false, esCiudadPrincipal: false },

  // Cauca
  { codigo: '19001', nombre: 'Popayán', departamentoCodigo: '19', departamentoNombre: 'Cauca', esCapital: true, esCiudadPrincipal: true },
  { codigo: '19698', nombre: 'Santander de Quilichao', departamentoCodigo: '19', departamentoNombre: 'Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '19573', nombre: 'Puerto Tejada', departamentoCodigo: '19', departamentoNombre: 'Cauca', esCapital: false, esCiudadPrincipal: false },

  // Cesar
  { codigo: '20001', nombre: 'Valledupar', departamentoCodigo: '20', departamentoNombre: 'Cesar', esCapital: true, esCiudadPrincipal: true },
  { codigo: '20011', nombre: 'Aguachica', departamentoCodigo: '20', departamentoNombre: 'Cesar', esCapital: false, esCiudadPrincipal: true },
  { codigo: '20013', nombre: 'Agustín Codazzi', departamentoCodigo: '20', departamentoNombre: 'Cesar', esCapital: false, esCiudadPrincipal: false },
  { codigo: '20060', nombre: 'Bosconia', departamentoCodigo: '20', departamentoNombre: 'Cesar', esCapital: false, esCiudadPrincipal: true },
  { codigo: '20228', nombre: 'Curumaní', departamentoCodigo: '20', departamentoNombre: 'Cesar', esCapital: false, esCiudadPrincipal: false },
  { codigo: '20400', nombre: 'La Jagua de Ibirico', departamentoCodigo: '20', departamentoNombre: 'Cesar', esCapital: false, esCiudadPrincipal: false },

  // Chocó
  { codigo: '27001', nombre: 'Quibdó', departamentoCodigo: '27', departamentoNombre: 'Chocó', esCapital: true, esCiudadPrincipal: true },
  { codigo: '27361', nombre: 'Istmina', departamentoCodigo: '27', departamentoNombre: 'Chocó', esCapital: false, esCiudadPrincipal: false },

  // Córdoba
  { codigo: '23001', nombre: 'Montería', departamentoCodigo: '23', departamentoNombre: 'Córdoba', esCapital: true, esCiudadPrincipal: true },
  { codigo: '23417', nombre: 'Lorica', departamentoCodigo: '23', departamentoNombre: 'Córdoba', esCapital: false, esCiudadPrincipal: true },
  { codigo: '23660', nombre: 'Sahagún', departamentoCodigo: '23', departamentoNombre: 'Córdoba', esCapital: false, esCiudadPrincipal: true },
  { codigo: '23162', nombre: 'Cereté', departamentoCodigo: '23', departamentoNombre: 'Córdoba', esCapital: false, esCiudadPrincipal: false },

  // Cundinamarca
  { codigo: '25754', nombre: 'Soacha', departamentoCodigo: '25', departamentoNombre: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25307', nombre: 'Girardot', departamentoCodigo: '25', departamentoNombre: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25290', nombre: 'Fusagasugá', departamentoCodigo: '25', departamentoNombre: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25269', nombre: 'Facatativá', departamentoCodigo: '25', departamentoNombre: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25175', nombre: 'Chía', departamentoCodigo: '25', departamentoNombre: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25899', nombre: 'Zipaquirá', departamentoCodigo: '25', departamentoNombre: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25430', nombre: 'Madrid', departamentoCodigo: '25', departamentoNombre: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '25473', nombre: 'Mosquera', departamentoCodigo: '25', departamentoNombre: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '25286', nombre: 'Funza', departamentoCodigo: '25', departamentoNombre: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '25875', nombre: 'Villeta', departamentoCodigo: '25', departamentoNombre: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },

  // Guainía & Guaviare
  { codigo: '94001', nombre: 'Inírida', departamentoCodigo: '94', departamentoNombre: 'Guainía', esCapital: true, esCiudadPrincipal: true },
  { codigo: '95001', nombre: 'San José del Guaviare', departamentoCodigo: '95', departamentoNombre: 'Guaviare', esCapital: true, esCiudadPrincipal: true },

  // Huila
  { codigo: '41001', nombre: 'Neiva', departamentoCodigo: '41', departamentoNombre: 'Huila', esCapital: true, esCiudadPrincipal: true },
  { codigo: '41551', nombre: 'Pitalito', departamentoCodigo: '41', departamentoNombre: 'Huila', esCapital: false, esCiudadPrincipal: true },
  { codigo: '41298', nombre: 'Garzón', departamentoCodigo: '41', departamentoNombre: 'Huila', esCapital: false, esCiudadPrincipal: true },
  { codigo: '41396', nombre: 'La Plata', departamentoCodigo: '41', departamentoNombre: 'Huila', esCapital: false, esCiudadPrincipal: false },

  // La Guajira
  { codigo: '44001', nombre: 'Riohacha', departamentoCodigo: '44', departamentoNombre: 'La Guajira', esCapital: true, esCiudadPrincipal: true },
  { codigo: '44430', nombre: 'Maicao', departamentoCodigo: '44', departamentoNombre: 'La Guajira', esCapital: false, esCiudadPrincipal: true },
  { codigo: '44650', nombre: 'San Juan del Cesar', departamentoCodigo: '44', departamentoNombre: 'La Guajira', esCapital: false, esCiudadPrincipal: false },

  // Magdalena
  { codigo: '47001', nombre: 'Santa Marta', departamentoCodigo: '47', departamentoNombre: 'Magdalena', esCapital: true, esCiudadPrincipal: true },
  { codigo: '47189', nombre: 'Ciénaga', departamentoCodigo: '47', departamentoNombre: 'Magdalena', esCapital: false, esCiudadPrincipal: true },
  { codigo: '47288', nombre: 'Fundación', departamentoCodigo: '47', departamentoNombre: 'Magdalena', esCapital: false, esCiudadPrincipal: true },
  { codigo: '47555', nombre: 'Plato', departamentoCodigo: '47', departamentoNombre: 'Magdalena', esCapital: false, esCiudadPrincipal: false },
  { codigo: '47245', nombre: 'El Banco', departamentoCodigo: '47', departamentoNombre: 'Magdalena', esCapital: false, esCiudadPrincipal: false },

  // Meta
  { codigo: '50001', nombre: 'Villavicencio', departamentoCodigo: '50', departamentoNombre: 'Meta', esCapital: true, esCiudadPrincipal: true },
  { codigo: '50006', nombre: 'Acacías', departamentoCodigo: '50', departamentoNombre: 'Meta', esCapital: false, esCiudadPrincipal: true },
  { codigo: '50313', nombre: 'Granada', departamentoCodigo: '50', departamentoNombre: 'Meta', esCapital: false, esCiudadPrincipal: true },
  { codigo: '50573', nombre: 'Puerto López', departamentoCodigo: '50', departamentoNombre: 'Meta', esCapital: false, esCiudadPrincipal: false },

  // Nariño
  { codigo: '52001', nombre: 'Pasto', departamentoCodigo: '52', departamentoNombre: 'Nariño', esCapital: true, esCiudadPrincipal: true },
  { codigo: '52835', nombre: 'Tumaco', departamentoCodigo: '52', departamentoNombre: 'Nariño', esCapital: false, esCiudadPrincipal: true },
  { codigo: '52356', nombre: 'Ipiales', departamentoCodigo: '52', departamentoNombre: 'Nariño', esCapital: false, esCiudadPrincipal: true },

  // Norte de Santander
  { codigo: '54001', nombre: 'Cúcuta', departamentoCodigo: '54', departamentoNombre: 'Norte de Santander', esCapital: true, esCiudadPrincipal: true },
  { codigo: '54498', nombre: 'Ocaña', departamentoCodigo: '54', departamentoNombre: 'Norte de Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '54518', nombre: 'Pamplona', departamentoCodigo: '54', departamentoNombre: 'Norte de Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '54874', nombre: 'Villa del Rosario', departamentoCodigo: '54', departamentoNombre: 'Norte de Santander', esCapital: false, esCiudadPrincipal: false },

  // Putumayo
  { codigo: '86001', nombre: 'Mocoa', departamentoCodigo: '86', departamentoNombre: 'Putumayo', esCapital: true, esCiudadPrincipal: true },
  { codigo: '86568', nombre: 'Puerto Asís', departamentoCodigo: '86', departamentoNombre: 'Putumayo', esCapital: false, esCiudadPrincipal: true },

  // Quindío
  { codigo: '63001', nombre: 'Armenia', departamentoCodigo: '63', departamentoNombre: 'Quindío', esCapital: true, esCiudadPrincipal: true },
  { codigo: '63130', nombre: 'Calarcá', departamentoCodigo: '63', departamentoNombre: 'Quindío', esCapital: false, esCiudadPrincipal: true },
  { codigo: '63470', nombre: 'Montenegro', departamentoCodigo: '63', departamentoNombre: 'Quindío', esCapital: false, esCiudadPrincipal: false },
  { codigo: '63594', nombre: 'Quimbaya', departamentoCodigo: '63', departamentoNombre: 'Quindío', esCapital: false, esCiudadPrincipal: false },

  // Risaralda
  { codigo: '66001', nombre: 'Pereira', departamentoCodigo: '66', departamentoNombre: 'Risaralda', esCapital: true, esCiudadPrincipal: true },
  { codigo: '66170', nombre: 'Dosquebradas', departamentoCodigo: '66', departamentoNombre: 'Risaralda', esCapital: false, esCiudadPrincipal: true },
  { codigo: '66682', nombre: 'Santa Rosa de Cabal', departamentoCodigo: '66', departamentoNombre: 'Risaralda', esCapital: false, esCiudadPrincipal: true },
  { codigo: '66400', nombre: 'La Virginia', departamentoCodigo: '66', departamentoNombre: 'Risaralda', esCapital: false, esCiudadPrincipal: false },

  // San Andrés y Providencia
  { codigo: '88001', nombre: 'San Andrés', departamentoCodigo: '88', departamentoNombre: 'San Andrés y Providencia', esCapital: true, esCiudadPrincipal: true },
  { codigo: '88564', nombre: 'Providencia', departamentoCodigo: '88', departamentoNombre: 'San Andrés y Providencia', esCapital: false, esCiudadPrincipal: false },

  // Santander
  { codigo: '68001', nombre: 'Bucaramanga', departamentoCodigo: '68', departamentoNombre: 'Santander', esCapital: true, esCiudadPrincipal: true },
  { codigo: '68276', nombre: 'Floridablanca', departamentoCodigo: '68', departamentoNombre: 'Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '68307', nombre: 'Girón', departamentoCodigo: '68', departamentoNombre: 'Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '68547', nombre: 'Piedecuesta', departamentoCodigo: '68', departamentoNombre: 'Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '68081', nombre: 'Barrancabermeja', departamentoCodigo: '68', departamentoNombre: 'Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '68679', nombre: 'San Gil', departamentoCodigo: '68', departamentoNombre: 'Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '68755', nombre: 'Socorro', departamentoCodigo: '68', departamentoNombre: 'Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '68077', nombre: 'Barbosa', departamentoCodigo: '68', departamentoNombre: 'Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '68176', nombre: 'Charalá', departamentoCodigo: '68', departamentoNombre: 'Santander', esCapital: false, esCiudadPrincipal: false },

  // Sucre
  { codigo: '70001', nombre: 'Sincelejo', departamentoCodigo: '70', departamentoNombre: 'Sucre', esCapital: true, esCiudadPrincipal: true },
  { codigo: '70215', nombre: 'Corozal', departamentoCodigo: '70', departamentoNombre: 'Sucre', esCapital: false, esCiudadPrincipal: true },
  { codigo: '70820', nombre: 'Santiago de Tolú', departamentoCodigo: '70', departamentoNombre: 'Sucre', esCapital: false, esCiudadPrincipal: false },
  { codigo: '70221', nombre: 'Coveñas', departamentoCodigo: '70', departamentoNombre: 'Sucre', esCapital: false, esCiudadPrincipal: false },

  // Tolima
  { codigo: '73001', nombre: 'Ibagué', departamentoCodigo: '73', departamentoNombre: 'Tolima', esCapital: true, esCiudadPrincipal: true },
  { codigo: '73268', nombre: 'Espinal', departamentoCodigo: '73', departamentoNombre: 'Tolima', esCapital: false, esCiudadPrincipal: true },
  { codigo: '73449', nombre: 'Melgar', departamentoCodigo: '73', departamentoNombre: 'Tolima', esCapital: false, esCiudadPrincipal: true },
  { codigo: '73349', nombre: 'Honda', departamentoCodigo: '73', departamentoNombre: 'Tolima', esCapital: false, esCiudadPrincipal: true },
  { codigo: '73443', nombre: 'Mariquita', departamentoCodigo: '73', departamentoNombre: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73168', nombre: 'Chaparral', departamentoCodigo: '73', departamentoNombre: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73411', nombre: 'Líbano', departamentoCodigo: '73', departamentoNombre: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73319', nombre: 'Guamo', departamentoCodigo: '73', departamentoNombre: 'Tolima', esCapital: false, esCiudadPrincipal: false },

  // Valle del Cauca
  { codigo: '76001', nombre: 'Cali', departamentoCodigo: '76', departamentoNombre: 'Valle del Cauca', esCapital: true, esCiudadPrincipal: true },
  { codigo: '76109', nombre: 'Buenaventura', departamentoCodigo: '76', departamentoNombre: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '76520', nombre: 'Palmira', departamentoCodigo: '76', departamentoNombre: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '76834', nombre: 'Tuluá', departamentoCodigo: '76', departamentoNombre: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '76111', nombre: 'Buga', departamentoCodigo: '76', departamentoNombre: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '76147', nombre: 'Cartago', departamentoCodigo: '76', departamentoNombre: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '76364', nombre: 'Jamundí', departamentoCodigo: '76', departamentoNombre: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '76892', nombre: 'Yumbo', departamentoCodigo: '76', departamentoNombre: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },

  // Vaupés & Vichada
  { codigo: '97001', nombre: 'Mitú', departamentoCodigo: '97', departamentoNombre: 'Vaupés', esCapital: true, esCiudadPrincipal: true },
  { codigo: '99001', nombre: 'Puerto Carreño', departamentoCodigo: '99', departamentoNombre: 'Vichada', esCapital: true, esCiudadPrincipal: true }
];

/**
 * Función idempotente de seed / sincronización del catálogo geográfico en MongoDB
 */
async function ejecutarSeedIdempotente() {
  console.log('Iniciando sincronización idempotente de catálogo DIVIPOLA DANE...');

  // 1. Departamentos (Upsert basado en código DIVIPOLA)
  const opsDepartamentos = DEPARTAMENTOS_RAW.map(depto => ({
    updateOne: {
      filter: { codigo: depto.codigo },
      update: {
        $set: {
          codigo: depto.codigo,
          nombre: depto.nombre
        }
      },
      upsert: true
    }
  }));

  const resDeptos = await Departamento.bulkWrite(opsDepartamentos);

  // 2. Municipios (Upsert basado en código DIVIPOLA)
  const opsMunicipios = MUNICIPIOS_RAW.map(mun => ({
    updateOne: {
      filter: { codigo: mun.codigo },
      update: {
        $set: {
          codigo: mun.codigo,
          nombre: mun.nombre,
          departamentoCodigo: mun.departamentoCodigo,
          departamentoNombre: mun.departamentoNombre,
          esCapital: mun.esCapital,
          esCiudadPrincipal: mun.esCiudadPrincipal
        }
      },
      upsert: true
    }
  }));

  const resMunicipios = await Municipio.bulkWrite(opsMunicipios);

  const totalDeptos = await Departamento.countDocuments();
  const totalMuns = await Municipio.countDocuments();

  return {
    success: true,
    mensaje: 'Catálogo territorial de Colombia sincronizado correctamente sin duplicados.',
    departamentosTotal: totalDeptos,
    municipiosTotal: totalMuns,
    deptosUpserted: resDeptos.upsertedCount,
    deptosModified: resDeptos.modifiedCount,
    munsUpserted: resMunicipios.upsertedCount,
    munsModified: resMunicipios.modifiedCount
  };
}

// Si se ejecuta directamente desde línea de comandos
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      const resultado = await ejecutarSeedIdempotente();
      console.log('Resultado Seed:', resultado);
      process.exit(0);
    } catch (err) {
      console.error('Error al ejecutar seed de geografía:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = {
  ejecutarSeedIdempotente,
  DEPARTAMENTOS_RAW,
  MUNICIPIOS_RAW
};
