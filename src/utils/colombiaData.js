/**
 * Catálogo Oficial DIVIPOLA DANE de Departamentos y Municipios de Colombia para VIABUS
 * Incluye los 32 Departamentos de Colombia y Bogotá D.C. como entidad territorial especial,
 * junto con sus capitales, centros urbanos y municipios intermedios con códigos oficiales DANE.
 */

export const DEPARTAMENTOS_COLOMBIA = [
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
]

export const MUNICIPIOS_COLOMBIA_DATA = [
  // 91 - Amazonas
  { codigo: '91001', municipio: 'Leticia', departamentoCodigo: '91', departamento: 'Amazonas', esCapital: true, esCiudadPrincipal: true },
  { codigo: '91540', municipio: 'Puerto Nariño', departamentoCodigo: '91', departamento: 'Amazonas', esCapital: false, esCiudadPrincipal: false },

  // 05 - Antioquia
  { codigo: '05001', municipio: 'Medellín', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: true, esCiudadPrincipal: true },
  { codigo: '05088', municipio: 'Bello', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05360', municipio: 'Itagüí', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05266', municipio: 'Envigado', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05615', municipio: 'Rionegro', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05045', municipio: 'Apartadó', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05837', municipio: 'Turbo', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05154', municipio: 'Caucasia', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: true },
  { codigo: '05887', municipio: 'Yarumal', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05686', municipio: 'Santa Rosa de Osos', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05318', municipio: 'Guarne', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05631', municipio: 'Sabaneta', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05129', municipio: 'Caldas', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05376', municipio: 'La Ceja', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05440', municipio: 'Marinilla', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05079', municipio: 'Barbosa', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05697', municipio: 'El Santuario', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: false },
  { codigo: '05670', municipio: 'San Pedro de los Milagros', departamentoCodigo: '05', departamento: 'Antioquia', esCapital: false, esCiudadPrincipal: false },

  // 81 - Arauca
  { codigo: '81001', municipio: 'Arauca', departamentoCodigo: '81', departamento: 'Arauca', esCapital: true, esCiudadPrincipal: true },
  { codigo: '81736', municipio: 'Saravena', departamentoCodigo: '81', departamento: 'Arauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '81794', municipio: 'Tame', departamentoCodigo: '81', departamento: 'Arauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '81300', municipio: 'Fortul', departamentoCodigo: '81', departamento: 'Arauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '81065', municipio: 'Arauquita', departamentoCodigo: '81', departamento: 'Arauca', esCapital: false, esCiudadPrincipal: false },

  // 08 - Atlántico
  { codigo: '08001', municipio: 'Barranquilla', departamentoCodigo: '08', departamento: 'Atlántico', esCapital: true, esCiudadPrincipal: true },
  { codigo: '08758', municipio: 'Soledad', departamentoCodigo: '08', departamento: 'Atlántico', esCapital: false, esCiudadPrincipal: true },
  { codigo: '08433', municipio: 'Malambo', departamentoCodigo: '08', departamento: 'Atlántico', esCapital: false, esCiudadPrincipal: false },
  { codigo: '08638', municipio: 'Sabanalarga', departamentoCodigo: '08', departamento: 'Atlántico', esCapital: false, esCiudadPrincipal: false },
  { codigo: '08078', municipio: 'Baranoa', departamentoCodigo: '08', departamento: 'Atlántico', esCapital: false, esCiudadPrincipal: false },
  { codigo: '08573', municipio: 'Puerto Colombia', departamentoCodigo: '08', departamento: 'Atlántico', esCapital: false, esCiudadPrincipal: false },
  { codigo: '08296', municipio: 'Galapa', departamentoCodigo: '08', departamento: 'Atlántico', esCapital: false, esCiudadPrincipal: false },

  // 11 - Bogotá D.C. (Distrito Capital)
  { codigo: '11001', municipio: 'Bogotá D.C.', departamentoCodigo: '11', departamento: 'Bogotá D.C.', esCapital: true, esCiudadPrincipal: true },

  // 13 - Bolívar
  { codigo: '13001', municipio: 'Cartagena', departamentoCodigo: '13', departamento: 'Bolívar', esCapital: true, esCiudadPrincipal: true },
  { codigo: '13430', municipio: 'Magangué', departamentoCodigo: '13', departamento: 'Bolívar', esCapital: false, esCiudadPrincipal: true },
  { codigo: '13244', municipio: 'El Carmen de Bolívar', departamentoCodigo: '13', departamento: 'Bolívar', esCapital: false, esCiudadPrincipal: false },
  { codigo: '13836', municipio: 'Turbaco', departamentoCodigo: '13', departamento: 'Bolívar', esCapital: false, esCiudadPrincipal: false },
  { codigo: '13052', municipio: 'Arjona', departamentoCodigo: '13', departamento: 'Bolívar', esCapital: false, esCiudadPrincipal: false },
  { codigo: '13468', municipio: 'Mompós', departamentoCodigo: '13', departamento: 'Bolívar', esCapital: false, esCiudadPrincipal: false },

  // 15 - Boyacá
  { codigo: '15001', municipio: 'Tunja', departamentoCodigo: '15', departamento: 'Boyacá', esCapital: true, esCiudadPrincipal: true },
  { codigo: '15238', municipio: 'Duitama', departamentoCodigo: '15', departamento: 'Boyacá', esCapital: false, esCiudadPrincipal: true },
  { codigo: '15759', municipio: 'Sogamoso', departamentoCodigo: '15', departamento: 'Boyacá', esCapital: false, esCiudadPrincipal: true },
  { codigo: '15176', municipio: 'Chiquinquirá', departamentoCodigo: '15', departamento: 'Boyacá', esCapital: false, esCiudadPrincipal: true },
  { codigo: '15516', municipio: 'Paipa', departamentoCodigo: '15', departamento: 'Boyacá', esCapital: false, esCiudadPrincipal: false },
  { codigo: '15572', municipio: 'Puerto Boyacá', departamentoCodigo: '15', departamento: 'Boyacá', esCapital: false, esCiudadPrincipal: false },
  { codigo: '15407', municipio: 'Villa de Leyva', departamentoCodigo: '15', departamento: 'Boyacá', esCapital: false, esCiudadPrincipal: false },
  { codigo: '15469', municipio: 'Moniquirá', departamentoCodigo: '15', departamento: 'Boyacá', esCapital: false, esCiudadPrincipal: false },
  { codigo: '15646', municipio: 'Samacá', departamentoCodigo: '15', departamento: 'Boyacá', esCapital: false, esCiudadPrincipal: false },
  { codigo: '15837', municipio: 'Tuta', departamentoCodigo: '15', departamento: 'Boyacá', esCapital: false, esCiudadPrincipal: false },

  // 17 - Caldas
  { codigo: '17001', municipio: 'Manizales', departamentoCodigo: '17', departamento: 'Caldas', esCapital: true, esCiudadPrincipal: true },
  { codigo: '17174', municipio: 'Chinchiná', departamentoCodigo: '17', departamento: 'Caldas', esCapital: false, esCiudadPrincipal: true },
  { codigo: '17873', municipio: 'Villamaría', departamentoCodigo: '17', departamento: 'Caldas', esCapital: false, esCiudadPrincipal: false },
  { codigo: '17380', municipio: 'La Dorada', departamentoCodigo: '17', departamento: 'Caldas', esCapital: false, esCiudadPrincipal: true },
  { codigo: '17614', municipio: 'Riosucio', departamentoCodigo: '17', departamento: 'Caldas', esCapital: false, esCiudadPrincipal: false },
  { codigo: '17042', municipio: 'Anserma', departamentoCodigo: '17', departamento: 'Caldas', esCapital: false, esCiudadPrincipal: false },

  // 18 - Caquetá
  { codigo: '18001', municipio: 'Florencia', departamentoCodigo: '18', departamento: 'Caquetá', esCapital: true, esCiudadPrincipal: true },
  { codigo: '18753', municipio: 'San Vicente del Caguán', departamentoCodigo: '18', departamento: 'Caquetá', esCapital: false, esCiudadPrincipal: false },
  { codigo: '18247', municipio: 'El Doncello', departamentoCodigo: '18', departamento: 'Caquetá', esCapital: false, esCiudadPrincipal: false },
  { codigo: '18592', municipio: 'Puerto Rico', departamentoCodigo: '18', departamento: 'Caquetá', esCapital: false, esCiudadPrincipal: false },
  { codigo: '18094', municipio: 'Belén de los Andaquíes', departamentoCodigo: '18', departamento: 'Caquetá', esCapital: false, esCiudadPrincipal: false },

  // 85 - Casanare
  { codigo: '85001', municipio: 'Yopal', departamentoCodigo: '85', departamento: 'Casanare', esCapital: true, esCiudadPrincipal: true },
  { codigo: '85010', municipio: 'Aguazul', departamentoCodigo: '85', departamento: 'Casanare', esCapital: false, esCiudadPrincipal: true },
  { codigo: '85440', municipio: 'Villanueva', departamentoCodigo: '85', departamento: 'Casanare', esCapital: false, esCiudadPrincipal: false },
  { codigo: '85250', municipio: 'Paz de Ariporo', departamentoCodigo: '85', departamento: 'Casanare', esCapital: false, esCiudadPrincipal: false },
  { codigo: '85410', municipio: 'Tauramena', departamentoCodigo: '85', departamento: 'Casanare', esCapital: false, esCiudadPrincipal: false },
  { codigo: '85162', municipio: 'Monterrey', departamentoCodigo: '85', departamento: 'Casanare', esCapital: false, esCiudadPrincipal: false },

  // 19 - Cauca
  { codigo: '19001', municipio: 'Popayán', departamentoCodigo: '19', departamento: 'Cauca', esCapital: true, esCiudadPrincipal: true },
  { codigo: '19698', municipio: 'Santander de Quilichao', departamentoCodigo: '19', departamento: 'Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '19573', municipio: 'Puerto Tejada', departamentoCodigo: '19', departamento: 'Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '19532', municipio: 'Patía', departamentoCodigo: '19', departamento: 'Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '19548', municipio: 'Piendamó', departamentoCodigo: '19', departamento: 'Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '19455', municipio: 'Miranda', departamentoCodigo: '19', departamento: 'Cauca', esCapital: false, esCiudadPrincipal: false },

  // 20 - Cesar
  { codigo: '20001', municipio: 'Valledupar', departamentoCodigo: '20', departamento: 'Cesar', esCapital: true, esCiudadPrincipal: true },
  { codigo: '20011', municipio: 'Aguachica', departamentoCodigo: '20', departamento: 'Cesar', esCapital: false, esCiudadPrincipal: true },
  { codigo: '20013', municipio: 'Agustín Codazzi', departamentoCodigo: '20', departamento: 'Cesar', esCapital: false, esCiudadPrincipal: false },
  { codigo: '20060', municipio: 'Bosconia', departamentoCodigo: '20', departamento: 'Cesar', esCapital: false, esCiudadPrincipal: true },
  { codigo: '20228', municipio: 'Curumaní', departamentoCodigo: '20', departamento: 'Cesar', esCapital: false, esCiudadPrincipal: false },
  { codigo: '20400', municipio: 'La Jagua de Ibirico', departamentoCodigo: '20', departamento: 'Cesar', esCapital: false, esCiudadPrincipal: false },
  { codigo: '20178', municipio: 'Chiriguaná', departamentoCodigo: '20', departamento: 'Cesar', esCapital: false, esCiudadPrincipal: false },
  { codigo: '20250', municipio: 'El Paso', departamentoCodigo: '20', departamento: 'Cesar', esCapital: false, esCiudadPrincipal: false },

  // 27 - Chocó
  { codigo: '27001', municipio: 'Quibdó', departamentoCodigo: '27', departamento: 'Chocó', esCapital: true, esCiudadPrincipal: true },
  { codigo: '27361', municipio: 'Istmina', departamentoCodigo: '27', departamento: 'Chocó', esCapital: false, esCiudadPrincipal: false },
  { codigo: '27787', municipio: 'Tadó', departamentoCodigo: '27', departamento: 'Chocó', esCapital: false, esCiudadPrincipal: false },
  { codigo: '27205', municipio: 'Condoto', departamentoCodigo: '27', departamento: 'Chocó', esCapital: false, esCiudadPrincipal: false },
  { codigo: '27075', municipio: 'Bahía Solano', departamentoCodigo: '27', departamento: 'Chocó', esCapital: false, esCiudadPrincipal: false },

  // 23 - Córdoba
  { codigo: '23001', municipio: 'Montería', departamentoCodigo: '23', departamento: 'Córdoba', esCapital: true, esCiudadPrincipal: true },
  { codigo: '23417', municipio: 'Lorica', departamentoCodigo: '23', departamento: 'Córdoba', esCapital: false, esCiudadPrincipal: true },
  { codigo: '23660', municipio: 'Sahagún', departamentoCodigo: '23', departamento: 'Córdoba', esCapital: false, esCiudadPrincipal: true },
  { codigo: '23162', municipio: 'Cereté', departamentoCodigo: '23', departamento: 'Córdoba', esCapital: false, esCiudadPrincipal: false },
  { codigo: '23466', municipio: 'Montelíbano', departamentoCodigo: '23', departamento: 'Córdoba', esCapital: false, esCiudadPrincipal: false },
  { codigo: '23555', municipio: 'Planeta Rica', departamentoCodigo: '23', departamento: 'Córdoba', esCapital: false, esCiudadPrincipal: false },
  { codigo: '23807', municipio: 'Tierralta', departamentoCodigo: '23', departamento: 'Córdoba', esCapital: false, esCiudadPrincipal: false },

  // 25 - Cundinamarca
  { codigo: '25754', municipio: 'Soacha', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25307', municipio: 'Girardot', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25290', municipio: 'Fusagasugá', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25269', municipio: 'Facatativá', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25175', municipio: 'Chía', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25899', municipio: 'Zipaquirá', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25430', municipio: 'Madrid', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '25473', municipio: 'Mosquera', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '25286', municipio: 'Funza', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '25875', municipio: 'Villeta', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '25126', municipio: 'Cajicá', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '25843', municipio: 'Ubaté', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '25151', municipio: 'Cáqueza', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '25817', municipio: 'Tocancipá', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '25743', municipio: 'Silvania', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '25320', municipio: 'Guaduas', departamentoCodigo: '25', departamento: 'Cundinamarca', esCapital: false, esCiudadPrincipal: false },

  // 94 - Guainía
  { codigo: '94001', municipio: 'Inírida', departamentoCodigo: '94', departamento: 'Guainía', esCapital: true, esCiudadPrincipal: true },
  { codigo: '94343', municipio: 'Barranco Minas', departamentoCodigo: '94', departamento: 'Guainía', esCapital: false, esCiudadPrincipal: false },

  // 95 - Guaviare
  { codigo: '95001', municipio: 'San José del Guaviare', departamentoCodigo: '95', departamento: 'Guaviare', esCapital: true, esCiudadPrincipal: true },
  { codigo: '95025', municipio: 'El Retorno', departamentoCodigo: '95', departamento: 'Guaviare', esCapital: false, esCiudadPrincipal: false },
  { codigo: '95015', municipio: 'Calamar', departamentoCodigo: '95', departamento: 'Guaviare', esCapital: false, esCiudadPrincipal: false },

  // 41 - Huila
  { codigo: '41001', municipio: 'Neiva', departamentoCodigo: '41', departamento: 'Huila', esCapital: true, esCiudadPrincipal: true },
  { codigo: '41551', municipio: 'Pitalito', departamentoCodigo: '41', departamento: 'Huila', esCapital: false, esCiudadPrincipal: true },
  { codigo: '41298', municipio: 'Garzón', departamentoCodigo: '41', departamento: 'Huila', esCapital: false, esCiudadPrincipal: true },
  { codigo: '41396', municipio: 'La Plata', departamentoCodigo: '41', departamento: 'Huila', esCapital: false, esCiudadPrincipal: false },
  { codigo: '41132', municipio: 'Campoalegre', departamentoCodigo: '41', departamento: 'Huila', esCapital: false, esCiudadPrincipal: false },
  { codigo: '41306', municipio: 'Gigante', departamentoCodigo: '41', departamento: 'Huila', esCapital: false, esCiudadPrincipal: false },
  { codigo: '41615', municipio: 'Rivera', departamentoCodigo: '41', departamento: 'Huila', esCapital: false, esCiudadPrincipal: false },

  // 44 - La Guajira
  { codigo: '44001', municipio: 'Riohacha', departamentoCodigo: '44', departamento: 'La Guajira', esCapital: true, esCiudadPrincipal: true },
  { codigo: '44430', municipio: 'Maicao', departamentoCodigo: '44', departamento: 'La Guajira', esCapital: false, esCiudadPrincipal: true },
  { codigo: '44847', municipio: 'Uribia', departamentoCodigo: '44', departamento: 'La Guajira', esCapital: false, esCiudadPrincipal: false },
  { codigo: '44560', municipio: 'Manaure', departamentoCodigo: '44', departamento: 'La Guajira', esCapital: false, esCiudadPrincipal: false },
  { codigo: '44650', municipio: 'San Juan del Cesar', departamentoCodigo: '44', departamento: 'La Guajira', esCapital: false, esCiudadPrincipal: false },
  { codigo: '44279', municipio: 'Fonseca', departamentoCodigo: '44', departamento: 'La Guajira', esCapital: false, esCiudadPrincipal: false },
  { codigo: '44874', municipio: 'Villanueva', departamentoCodigo: '44', departamento: 'La Guajira', esCapital: false, esCiudadPrincipal: false },

  // 47 - Magdalena
  { codigo: '47001', municipio: 'Santa Marta', departamentoCodigo: '47', departamento: 'Magdalena', esCapital: true, esCiudadPrincipal: true },
  { codigo: '47189', municipio: 'Ciénaga', departamentoCodigo: '47', departamento: 'Magdalena', esCapital: false, esCiudadPrincipal: true },
  { codigo: '47288', municipio: 'Fundación', departamentoCodigo: '47', departamento: 'Magdalena', esCapital: false, esCiudadPrincipal: true },
  { codigo: '47555', municipio: 'Plato', departamentoCodigo: '47', departamento: 'Magdalena', esCapital: false, esCiudadPrincipal: false },
  { codigo: '47245', municipio: 'El Banco', departamentoCodigo: '47', departamento: 'Magdalena', esCapital: false, esCiudadPrincipal: false },
  { codigo: '47053', municipio: 'Aracataca', departamentoCodigo: '47', departamento: 'Magdalena', esCapital: false, esCiudadPrincipal: false },
  { codigo: '47545', municipio: 'Pivijay', departamentoCodigo: '47', departamento: 'Magdalena', esCapital: false, esCiudadPrincipal: false },

  // 50 - Meta
  { codigo: '50001', municipio: 'Villavicencio', departamentoCodigo: '50', departamento: 'Meta', esCapital: true, esCiudadPrincipal: true },
  { codigo: '50006', municipio: 'Acacías', departamentoCodigo: '50', departamento: 'Meta', esCapital: false, esCiudadPrincipal: true },
  { codigo: '50313', municipio: 'Granada', departamentoCodigo: '50', departamento: 'Meta', esCapital: false, esCiudadPrincipal: true },
  { codigo: '50573', municipio: 'Puerto López', departamentoCodigo: '50', departamento: 'Meta', esCapital: false, esCiudadPrincipal: false },
  { codigo: '50568', municipio: 'Puerto Gaitán', departamentoCodigo: '50', departamento: 'Meta', esCapital: false, esCiudadPrincipal: false },
  { codigo: '50689', municipio: 'San Martín', departamentoCodigo: '50', departamento: 'Meta', esCapital: false, esCiudadPrincipal: false },
  { codigo: '50226', municipio: 'Cumaral', departamentoCodigo: '50', departamento: 'Meta', esCapital: false, esCiudadPrincipal: false },

  // 52 - Nariño
  { codigo: '52001', municipio: 'Pasto', departamentoCodigo: '52', departamento: 'Nariño', esCapital: true, esCiudadPrincipal: true },
  { codigo: '52835', municipio: 'Tumaco', departamentoCodigo: '52', departamento: 'Nariño', esCapital: false, esCiudadPrincipal: true },
  { codigo: '52356', municipio: 'Ipiales', departamentoCodigo: '52', departamento: 'Nariño', esCapital: false, esCiudadPrincipal: true },
  { codigo: '52838', municipio: 'Túquerres', departamentoCodigo: '52', departamento: 'Nariño', esCapital: false, esCiudadPrincipal: false },
  { codigo: '52678', municipio: 'Samaniego', departamentoCodigo: '52', departamento: 'Nariño', esCapital: false, esCiudadPrincipal: false },
  { codigo: '52399', municipio: 'La Unión', departamentoCodigo: '52', departamento: 'Nariño', esCapital: false, esCiudadPrincipal: false },

  // 54 - Norte de Santander
  { codigo: '54001', municipio: 'Cúcuta', departamentoCodigo: '54', departamento: 'Norte de Santander', esCapital: true, esCiudadPrincipal: true },
  { codigo: '54498', municipio: 'Ocaña', departamentoCodigo: '54', departamento: 'Norte de Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '54518', municipio: 'Pamplona', departamentoCodigo: '54', departamento: 'Norte de Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '54874', municipio: 'Villa del Rosario', departamentoCodigo: '54', departamento: 'Norte de Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '54405', municipio: 'Los Patios', departamentoCodigo: '54', departamento: 'Norte de Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '54810', municipio: 'Tibú', departamentoCodigo: '54', departamento: 'Norte de Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '54172', municipio: 'Chinácota', departamentoCodigo: '54', departamento: 'Norte de Santander', esCapital: false, esCiudadPrincipal: false },

  // 86 - Putumayo
  { codigo: '86001', municipio: 'Mocoa', departamentoCodigo: '86', departamento: 'Putumayo', esCapital: true, esCiudadPrincipal: true },
  { codigo: '86568', municipio: 'Puerto Asís', departamentoCodigo: '86', departamento: 'Putumayo', esCapital: false, esCiudadPrincipal: true },
  { codigo: '86320', municipio: 'Orito', departamentoCodigo: '86', departamento: 'Putumayo', esCapital: false, esCiudadPrincipal: false },
  { codigo: '86865', municipio: 'Valle del Guamuez', departamentoCodigo: '86', departamento: 'Putumayo', esCapital: false, esCiudadPrincipal: false },
  { codigo: '86749', municipio: 'Sibundoy', departamentoCodigo: '86', departamento: 'Putumayo', esCapital: false, esCiudadPrincipal: false },
  { codigo: '86885', municipio: 'Villagarzón', departamentoCodigo: '86', departamento: 'Putumayo', esCapital: false, esCiudadPrincipal: false },

  // 63 - Quindío
  { codigo: '63001', municipio: 'Armenia', departamentoCodigo: '63', departamento: 'Quindío', esCapital: true, esCiudadPrincipal: true },
  { codigo: '63130', municipio: 'Calarcá', departamentoCodigo: '63', departamento: 'Quindío', esCapital: false, esCiudadPrincipal: true },
  { codigo: '63470', municipio: 'Montenegro', departamentoCodigo: '63', departamento: 'Quindío', esCapital: false, esCiudadPrincipal: false },
  { codigo: '63594', municipio: 'Quimbaya', departamentoCodigo: '63', departamento: 'Quindío', esCapital: false, esCiudadPrincipal: false },
  { codigo: '63401', municipio: 'La Tebaida', departamentoCodigo: '63', departamento: 'Quindío', esCapital: false, esCiudadPrincipal: false },
  { codigo: '63190', municipio: 'Circasia', departamentoCodigo: '63', departamento: 'Quindío', esCapital: false, esCiudadPrincipal: false },
  { codigo: '63272', municipio: 'Filandia', departamentoCodigo: '63', departamento: 'Quindío', esCapital: false, esCiudadPrincipal: false },
  { codigo: '63690', municipio: 'Salento', departamentoCodigo: '63', departamento: 'Quindío', esCapital: false, esCiudadPrincipal: false },

  // 66 - Risaralda
  { codigo: '66001', municipio: 'Pereira', departamentoCodigo: '66', departamento: 'Risaralda', esCapital: true, esCiudadPrincipal: true },
  { codigo: '66170', municipio: 'Dosquebradas', departamentoCodigo: '66', departamento: 'Risaralda', esCapital: false, esCiudadPrincipal: true },
  { codigo: '66682', municipio: 'Santa Rosa de Cabal', departamentoCodigo: '66', departamento: 'Risaralda', esCapital: false, esCiudadPrincipal: true },
  { codigo: '66400', municipio: 'La Virginia', departamentoCodigo: '66', departamento: 'Risaralda', esCapital: false, esCiudadPrincipal: false },
  { codigo: '66088', municipio: 'Belén de Umbría', departamentoCodigo: '66', departamento: 'Risaralda', esCapital: false, esCiudadPrincipal: false },
  { codigo: '66594', municipio: 'Quinchía', departamentoCodigo: '66', departamento: 'Risaralda', esCapital: false, esCiudadPrincipal: false },

  // 88 - San Andrés y Providencia
  { codigo: '88001', municipio: 'San Andrés', departamentoCodigo: '88', departamento: 'San Andrés y Providencia', esCapital: true, esCiudadPrincipal: true },
  { codigo: '88564', municipio: 'Providencia', departamentoCodigo: '88', departamento: 'San Andrés y Providencia', esCapital: false, esCiudadPrincipal: false },

  // 68 - Santander
  { codigo: '68001', municipio: 'Bucaramanga', departamentoCodigo: '68', departamento: 'Santander', esCapital: true, esCiudadPrincipal: true },
  { codigo: '68276', municipio: 'Floridablanca', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '68307', municipio: 'Girón', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '68547', municipio: 'Piedecuesta', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '68081', municipio: 'Barrancabermeja', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '68679', municipio: 'San Gil', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: true },
  { codigo: '68755', municipio: 'Socorro', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '68077', municipio: 'Barbosa', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '68176', municipio: 'Charalá', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '68432', municipio: 'Málaga', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '68655', municipio: 'Sabana de Torres', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '68861', municipio: 'Vélez', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '68406', municipio: 'Lebrija', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '68895', municipio: 'Zapatoca', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: false },
  { codigo: '68079', municipio: 'Barichara', departamentoCodigo: '68', departamento: 'Santander', esCapital: false, esCiudadPrincipal: false },

  // 70 - Sucre
  { codigo: '70001', municipio: 'Sincelejo', departamentoCodigo: '70', departamento: 'Sucre', esCapital: true, esCiudadPrincipal: true },
  { codigo: '70215', municipio: 'Corozal', departamentoCodigo: '70', departamento: 'Sucre', esCapital: false, esCiudadPrincipal: true },
  { codigo: '70708', municipio: 'San Marcos', departamentoCodigo: '70', departamento: 'Sucre', esCapital: false, esCiudadPrincipal: false },
  { codigo: '70820', municipio: 'Santiago de Tolú', departamentoCodigo: '70', departamento: 'Sucre', esCapital: false, esCiudadPrincipal: false },
  { codigo: '70221', municipio: 'Coveñas', departamentoCodigo: '70', departamento: 'Sucre', esCapital: false, esCiudadPrincipal: false },
  { codigo: '70670', municipio: 'Sampués', departamentoCodigo: '70', departamento: 'Sucre', esCapital: false, esCiudadPrincipal: false },
  { codigo: '70717', municipio: 'San Onofre', departamentoCodigo: '70', departamento: 'Sucre', esCapital: false, esCiudadPrincipal: false },

  // 73 - Tolima
  { codigo: '73001', municipio: 'Ibagué', departamentoCodigo: '73', departamento: 'Tolima', esCapital: true, esCiudadPrincipal: true },
  { codigo: '73268', municipio: 'Espinal', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: true },
  { codigo: '73449', municipio: 'Melgar', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: true },
  { codigo: '73349', municipio: 'Honda', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: true },
  { codigo: '73443', municipio: 'Mariquita', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73168', municipio: 'Chaparral', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73411', municipio: 'Líbano', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73319', municipio: 'Guamo', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73283', municipio: 'Fresno', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73275', municipio: 'Flandes', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73585', municipio: 'Purificación', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73671', municipio: 'Saldaña', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73124', municipio: 'Cajamarca', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: false },
  { codigo: '73055', municipio: 'Armero Guayabal', departamentoCodigo: '73', departamento: 'Tolima', esCapital: false, esCiudadPrincipal: false },

  // 76 - Valle del Cauca
  { codigo: '76001', municipio: 'Cali', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: true, esCiudadPrincipal: true },
  { codigo: '76109', municipio: 'Buenaventura', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '76520', municipio: 'Palmira', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '76834', municipio: 'Tuluá', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '76111', municipio: 'Buga', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '76147', municipio: 'Cartago', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: true },
  { codigo: '76364', municipio: 'Jamundí', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '76892', municipio: 'Yumbo', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '76130', municipio: 'Candelaria', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '76736', municipio: 'Sevilla', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '76895', municipio: 'Zarzal', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '76622', municipio: 'Roldanillo', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '76126', municipio: 'Caicedonia', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '76275', municipio: 'Florida', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '76563', municipio: 'Pradera', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },
  { codigo: '76233', municipio: 'Dagua', departamentoCodigo: '76', departamento: 'Valle del Cauca', esCapital: false, esCiudadPrincipal: false },

  // 97 - Vaupés
  { codigo: '97001', municipio: 'Mitú', departamentoCodigo: '97', departamento: 'Vaupés', esCapital: true, esCiudadPrincipal: true },
  { codigo: '97161', municipio: 'Carurú', departamentoCodigo: '97', departamento: 'Vaupés', esCapital: false, esCiudadPrincipal: false },
  { codigo: '97666', municipio: 'Taraira', departamentoCodigo: '97', departamento: 'Vaupés', esCapital: false, esCiudadPrincipal: false },

  // 99 - Vichada
  { codigo: '99001', municipio: 'Puerto Carreño', departamentoCodigo: '99', departamento: 'Vichada', esCapital: true, esCiudadPrincipal: true },
  { codigo: '99524', municipio: 'La Primavera', departamentoCodigo: '99', departamento: 'Vichada', esCapital: false, esCiudadPrincipal: false },
  { codigo: '99624', municipio: 'Santa Rosalía', departamentoCodigo: '99', departamento: 'Vichada', esCapital: false, esCiudadPrincipal: false },
  { codigo: '99773', municipio: 'Cumaribo', departamentoCodigo: '99', departamento: 'Vichada', esCapital: false, esCiudadPrincipal: false }
]

// Array exportado para compatibilidad con código existente
export const MUNICIPIOS_COLOMBIA = MUNICIPIOS_COLOMBIA_DATA.map(m => ({
  codigo: m.codigo,
  municipio: m.municipio,
  departamento: m.departamento,
  departamentoCodigo: m.departamentoCodigo,
  esCapital: m.esCapital,
  esCiudadPrincipal: m.esCiudadPrincipal,
  label: `${m.municipio}, ${m.departamento}`,
  value: `${m.municipio}, ${m.departamento}`
}))

/**
 * Normaliza cadenas para comparaciones sin tildes ni mayúsculas
 */
function normalizarTexto(txt) {
  if (!txt) return ''
  return String(txt)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Devuelve la lista completa de los 32 departamentos + Bogotá D.C.
 */
export function obtenerDepartamentos() {
  return [...DEPARTAMENTOS_COLOMBIA]
}

/**
 * Devuelve los municipios correspondientes a un departamento por código o nombre
 */
export function obtenerMunicipiosPorDepartamento(deptoNombreOCodigo) {
  if (!deptoNombreOCodigo) return []
  const norm = normalizarTexto(deptoNombreOCodigo)
  const res = []
  for (const m of MUNICIPIOS_COLOMBIA_DATA) {
    if (
      m.departamentoCodigo === String(deptoNombreOCodigo).trim() ||
      normalizarTexto(m.departamento) === norm
    ) {
      res.push({
        codigo: m.codigo,
        municipio: m.municipio,
        departamento: m.departamento,
        departamentoCodigo: m.departamentoCodigo,
        esCapital: m.esCapital,
        esCiudadPrincipal: m.esCiudadPrincipal,
        label: `${m.municipio}${m.esCapital ? ' (Capital)' : ''}`,
        value: `${m.municipio}, ${m.departamento}`
      })
    }
  }
  return res
}

/**
 * Devuelve las capitales y ciudades principales de Colombia
 */
export function obtenerCiudadesPrincipales() {
  const res = []
  for (const m of MUNICIPIOS_COLOMBIA_DATA) {
    if (m.esCapital || m.esCiudadPrincipal) {
      res.push({
        codigo: m.codigo,
        municipio: m.municipio,
        departamento: m.departamento,
        esCapital: m.esCapital,
        label: `${m.municipio}, ${m.departamento} ${m.esCapital ? '⭐ Capital' : '🏢 Principal'}`,
        value: `${m.municipio}, ${m.departamento}`
      })
    }
  }
  return res
}

/**
 * Busca municipios coincidentes por nombre de municipio o departamento
 */
export function buscarMunicipios(termino, departamentoFiltro = null) {
  const normTermino = normalizarTexto(termino)
  const normDepto = departamentoFiltro ? normalizarTexto(departamentoFiltro) : null
  const resultados = []

  for (const m of MUNICIPIOS_COLOMBIA_DATA) {
    if (normDepto && normalizarTexto(m.departamento) !== normDepto && m.departamentoCodigo !== String(departamentoFiltro)) {
      continue
    }

    const mNorm = normalizarTexto(m.municipio)
    const dNorm = normalizarTexto(m.departamento)
    const codNorm = m.codigo

    if (!normTermino || mNorm.includes(normTermino) || dNorm.includes(normTermino) || codNorm.includes(normTermino)) {
      resultados.push(`${m.municipio}, ${m.departamento}`)
    }
  }

  return resultados
}

/**
 * Busca municipios con metadata enriquecida para selectores Quasar
 */
export function buscarMunicipiosEstructurado(termino, departamentoFiltro = null) {
  const normTermino = normalizarTexto(termino)
  const normDepto = departamentoFiltro ? normalizarTexto(departamentoFiltro) : null
  const resultados = []

  for (const m of MUNICIPIOS_COLOMBIA_DATA) {
    if (normDepto && normalizarTexto(m.departamento) !== normDepto && m.departamentoCodigo !== String(departamentoFiltro)) {
      continue
    }

    const mNorm = normalizarTexto(m.municipio)
    const dNorm = normalizarTexto(m.departamento)
    const codNorm = m.codigo

    if (!normTermino || mNorm.includes(normTermino) || dNorm.includes(normTermino) || codNorm.includes(normTermino)) {
      resultados.push({
        codigo: m.codigo,
        municipio: m.municipio,
        departamento: m.departamento,
        departamentoCodigo: m.departamentoCodigo,
        esCapital: m.esCapital,
        esCiudadPrincipal: m.esCiudadPrincipal,
        label: `${m.municipio}, ${m.departamento}`,
        sublabel: `${m.esCapital ? 'Capital Departamental' : 'Municipio'} · Código DIVIPOLA: ${m.codigo}`,
        value: `${m.municipio}, ${m.departamento}`
      })
    }
  }

  return resultados
}

/**
 * Devuelve el objeto estructurado { municipio, departamento } de un valor normalizado
 */
export function parseMunicipio(valor) {
  if (!valor) return { municipio: '', departamento: '', codigo: '' }
  const partes = String(valor).split(',')
  const munNombre = partes[0] ? partes[0].trim() : ''
  const depNombre = partes[1] ? partes[1].trim() : ''

  const encontrado = MUNICIPIOS_COLOMBIA_DATA.find(
    m => normalizarTexto(m.municipio) === normalizarTexto(munNombre) &&
         (!depNombre || normalizarTexto(m.departamento) === normalizarTexto(depNombre))
  )

  return {
    municipio: munNombre,
    departamento: depNombre || (encontrado ? encontrado.departamento : ''),
    codigo: encontrado ? encontrado.codigo : ''
  }
}
