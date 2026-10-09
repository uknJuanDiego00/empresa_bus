/**
 * Catálogo normalizado de Municipios y Departamentos de Colombia para VIABUS
 * Permite selección consistente de rutas intermunicipales en todo el sistema.
 */

export const MUNICIPIOS_COLOMBIA = [
  // Cundinamarca y Bogotá D.C.
  { municipio: 'Bogotá', departamento: 'Cundinamarca', label: 'Bogotá, Cundinamarca', value: 'Bogotá, Cundinamarca' },
  { municipio: 'Soacha', departamento: 'Cundinamarca', label: 'Soacha, Cundinamarca', value: 'Soacha, Cundinamarca' },
  { municipio: 'Girardot', departamento: 'Cundinamarca', label: 'Girardot, Cundinamarca', value: 'Girardot, Cundinamarca' },
  { municipio: 'Fusagasugá', departamento: 'Cundinamarca', label: 'Fusagasugá, Cundinamarca', value: 'Fusagasugá, Cundinamarca' },
  { municipio: 'Facatativá', departamento: 'Cundinamarca', label: 'Facatativá, Cundinamarca', value: 'Facatativá, Cundinamarca' },
  { municipio: 'Chía', departamento: 'Cundinamarca', label: 'Chía, Cundinamarca', value: 'Chía, Cundinamarca' },
  { municipio: 'Zipaquirá', departamento: 'Cundinamarca', label: 'Zipaquirá, Cundinamarca', value: 'Zipaquirá, Cundinamarca' },
  { municipio: 'Villeta', departamento: 'Cundinamarca', label: 'Villeta, Cundinamarca', value: 'Villeta, Cundinamarca' },
  { municipio: 'Cáqueza', departamento: 'Cundinamarca', label: 'Cáqueza, Cundinamarca', value: 'Cáqueza, Cundinamarca' },

  // Antioquia
  { municipio: 'Medellín', departamento: 'Antioquia', label: 'Medellín, Antioquia', value: 'Medellín, Antioquia' },
  { municipio: 'Apartadó', departamento: 'Antioquia', label: 'Apartadó, Antioquia', value: 'Apartadó, Antioquia' },
  { municipio: 'Turbo', departamento: 'Antioquia', label: 'Turbo, Antioquia', value: 'Turbo, Antioquia' },
  { municipio: 'Rionegro', departamento: 'Antioquia', label: 'Rionegro, Antioquia', value: 'Rionegro, Antioquia' },
  { municipio: 'Bello', departamento: 'Antioquia', label: 'Bello, Antioquia', value: 'Bello, Antioquia' },
  { municipio: 'Itagüí', departamento: 'Antioquia', label: 'Itagüí, Antioquia', value: 'Itagüí, Antioquia' },
  { municipio: 'Envigado', departamento: 'Antioquia', label: 'Envigado, Antioquia', value: 'Envigado, Antioquia' },
  { municipio: 'Caucasia', departamento: 'Antioquia', label: 'Caucasia, Antioquia', value: 'Caucasia, Antioquia' },
  { municipio: 'Yarumal', departamento: 'Antioquia', label: 'Yarumal, Antioquia', value: 'Yarumal, Antioquia' },
  { municipio: 'Santa Rosa de Osos', departamento: 'Antioquia', label: 'Santa Rosa de Osos, Antioquia', value: 'Santa Rosa de Osos, Antioquia' },
  { municipio: 'Guarne', departamento: 'Antioquia', label: 'Guarne, Antioquia', value: 'Guarne, Antioquia' },

  // Valle del Cauca
  { municipio: 'Cali', departamento: 'Valle del Cauca', label: 'Cali, Valle del Cauca', value: 'Cali, Valle del Cauca' },
  { municipio: 'Buenaventura', departamento: 'Valle del Cauca', label: 'Buenaventura, Valle del Cauca', value: 'Buenaventura, Valle del Cauca' },
  { municipio: 'Palmira', departamento: 'Valle del Cauca', label: 'Palmira, Valle del Cauca', value: 'Palmira, Valle del Cauca' },
  { municipio: 'Buga', departamento: 'Valle del Cauca', label: 'Buga, Valle del Cauca', value: 'Buga, Valle del Cauca' },
  { municipio: 'Tuluá', departamento: 'Valle del Cauca', label: 'Tuluá, Valle del Cauca', value: 'Tuluá, Valle del Cauca' },
  { municipio: 'Cartago', departamento: 'Valle del Cauca', label: 'Cartago, Valle del Cauca', value: 'Cartago, Valle del Cauca' },
  { municipio: 'Jamundí', departamento: 'Valle del Cauca', label: 'Jamundí, Valle del Cauca', value: 'Jamundí, Valle del Cauca' },
  { municipio: 'Yumbo', departamento: 'Valle del Cauca', label: 'Yumbo, Valle del Cauca', value: 'Yumbo, Valle del Cauca' },

  // Eje Cafetero (Risaralda, Quindío, Caldas)
  { municipio: 'Pereira', departamento: 'Risaralda', label: 'Pereira, Risaralda', value: 'Pereira, Risaralda' },
  { municipio: 'Dosquebradas', departamento: 'Risaralda', label: 'Dosquebradas, Risaralda', value: 'Dosquebradas, Risaralda' },
  { municipio: 'Santa Rosa de Cabal', departamento: 'Risaralda', label: 'Santa Rosa de Cabal, Risaralda', value: 'Santa Rosa de Cabal, Risaralda' },
  { municipio: 'Armenia', departamento: 'Quindío', label: 'Armenia, Quindío', value: 'Armenia, Quindío' },
  { municipio: 'Calarcá', departamento: 'Quindío', label: 'Calarcá, Quindío', value: 'Calarcá, Quindío' },
  { municipio: 'Quimbaya', departamento: 'Quindío', label: 'Quimbaya, Quindío', value: 'Quimbaya, Quindío' },
  { municipio: 'Montenegro', departamento: 'Quindío', label: 'Montenegro, Quindío', value: 'Montenegro, Quindío' },
  { municipio: 'Manizales', departamento: 'Caldas', label: 'Manizales, Caldas', value: 'Manizales, Caldas' },
  { municipio: 'Chinchiná', departamento: 'Caldas', label: 'Chinchiná, Caldas', value: 'Chinchiná, Caldas' },
  { municipio: 'La Dorada', departamento: 'Caldas', label: 'La Dorada, Caldas', value: 'La Dorada, Caldas' },

  // Santander y Norte de Santander
  { municipio: 'Bucaramanga', departamento: 'Santander', label: 'Bucaramanga, Santander', value: 'Bucaramanga, Santander' },
  { municipio: 'Floridablanca', departamento: 'Santander', label: 'Floridablanca, Santander', value: 'Floridablanca, Santander' },
  { municipio: 'Girón', departamento: 'Santander', label: 'Girón, Santander', value: 'Girón, Santander' },
  { municipio: 'Piedecuesta', departamento: 'Santander', label: 'Piedecuesta, Santander', value: 'Piedecuesta, Santander' },
  { municipio: 'San Gil', departamento: 'Santander', label: 'San Gil, Santander', value: 'San Gil, Santander' },
  { municipio: 'Socorro', departamento: 'Santander', label: 'Socorro, Santander', value: 'Socorro, Santander' },
  { municipio: 'Charalá', departamento: 'Santander', label: 'Charalá, Santander', value: 'Charalá, Santander' },
  { municipio: 'Barrancabermeja', departamento: 'Santander', label: 'Barrancabermeja, Santander', value: 'Barrancabermeja, Santander' },
  { municipio: 'Barbosa', departamento: 'Santander', label: 'Barbosa, Santander', value: 'Barbosa, Santander' },
  { municipio: 'Cúcuta', departamento: 'Norte de Santander', label: 'Cúcuta, Norte de Santander', value: 'Cúcuta, Norte de Santander' },
  { municipio: 'Pamplona', departamento: 'Norte de Santander', label: 'Pamplona, Norte de Santander', value: 'Pamplona, Norte de Santander' },
  { municipio: 'Ocaña', departamento: 'Norte de Santander', label: 'Ocaña, Norte de Santander', value: 'Ocaña, Norte de Santander' },
  { municipio: 'Villa del Rosario', departamento: 'Norte de Santander', label: 'Villa del Rosario, Norte de Santander', value: 'Villa del Rosario, Norte de Santander' },

  // Costa Caribe (Magdalena, Bolívar, Atlántico, Cesar, Guajira, Córdoba, Sucre)
  { municipio: 'Santa Marta', departamento: 'Magdalena', label: 'Santa Marta, Magdalena', value: 'Santa Marta, Magdalena' },
  { municipio: 'Ciénaga', departamento: 'Magdalena', label: 'Ciénaga, Magdalena', value: 'Ciénaga, Magdalena' },
  { municipio: 'Fundación', departamento: 'Magdalena', label: 'Fundación, Magdalena', value: 'Fundación, Magdalena' },
  { municipio: 'Cartagena', departamento: 'Bolívar', label: 'Cartagena, Bolívar', value: 'Cartagena, Bolívar' },
  { municipio: 'Magangué', departamento: 'Bolívar', label: 'Magangué, Bolívar', value: 'Magangué, Bolívar' },
  { municipio: 'El Carmen de Bolívar', departamento: 'Bolívar', label: 'El Carmen de Bolívar, Bolívar', value: 'El Carmen de Bolívar, Bolívar' },
  { municipio: 'Barranquilla', departamento: 'Atlántico', label: 'Barranquilla, Atlántico', value: 'Barranquilla, Atlántico' },
  { municipio: 'Soledad', departamento: 'Atlántico', label: 'Soledad, Atlántico', value: 'Soledad, Atlántico' },
  { municipio: 'Valledupar', departamento: 'Cesar', label: 'Valledupar, Cesar', value: 'Valledupar, Cesar' },
  { municipio: 'Aguachica', departamento: 'Cesar', label: 'Aguachica, Cesar', value: 'Aguachica, Cesar' },
  { municipio: 'Riohacha', departamento: 'La Guajira', label: 'Riohacha, La Guajira', value: 'Riohacha, La Guajira' },
  { municipio: 'Maicao', departamento: 'La Guajira', label: 'Maicao, La Guajira', value: 'Maicao, La Guajira' },
  { municipio: 'Fonseca', departamento: 'La Guajira', label: 'Fonseca, La Guajira', value: 'Fonseca, La Guajira' },
  { municipio: 'Montería', departamento: 'Córdoba', label: 'Montería, Córdoba', value: 'Montería, Córdoba' },
  { municipio: 'Lorica', departamento: 'Córdoba', label: 'Lorica, Córdoba', value: 'Lorica, Córdoba' },
  { municipio: 'Sahagún', departamento: 'Córdoba', label: 'Sahagún, Córdoba', value: 'Sahagún, Córdoba' },
  { municipio: 'Sincelejo', departamento: 'Sucre', label: 'Sincelejo, Sucre', value: 'Sincelejo, Sucre' },
  { municipio: 'Corozal', departamento: 'Sucre', label: 'Corozal, Sucre', value: 'Corozal, Sucre' },

  // Tolima y Huila
  { municipio: 'Ibagué', departamento: 'Tolima', label: 'Ibagué, Tolima', value: 'Ibagué, Tolima' },
  { municipio: 'Espinal', departamento: 'Tolima', label: 'Espinal, Tolima', value: 'Espinal, Tolima' },
  { municipio: 'Melgar', departamento: 'Tolima', label: 'Melgar, Tolima', value: 'Melgar, Tolima' },
  { municipio: 'Honda', departamento: 'Tolima', label: 'Honda, Tolima', value: 'Honda, Tolima' },
  { municipio: 'Mariquita', departamento: 'Tolima', label: 'Mariquita, Tolima', value: 'Mariquita, Tolima' },
  { municipio: 'Neiva', departamento: 'Huila', label: 'Neiva, Huila', value: 'Neiva, Huila' },
  { municipio: 'Pitalito', departamento: 'Huila', label: 'Pitalito, Huila', value: 'Pitalito, Huila' },
  { municipio: 'Garzón', departamento: 'Huila', label: 'Garzón, Huila', value: 'Garzón, Huila' },
  { municipio: 'La Plata', departamento: 'Huila', label: 'La Plata, Huila', value: 'La Plata, Huila' },

  // Boyacá
  { municipio: 'Tunja', departamento: 'Boyacá', label: 'Tunja, Boyacá', value: 'Tunja, Boyacá' },
  { municipio: 'Duitama', departamento: 'Boyacá', label: 'Duitama, Boyacá', value: 'Duitama, Boyacá' },
  { municipio: 'Sogamoso', departamento: 'Boyacá', label: 'Sogamoso, Boyacá', value: 'Sogamoso, Boyacá' },
  { municipio: 'Chiquinquirá', departamento: 'Boyacá', label: 'Chiquinquirá, Boyacá', value: 'Chiquinquirá, Boyacá' },
  { municipio: 'Paipa', departamento: 'Boyacá', label: 'Paipa, Boyacá', value: 'Paipa, Boyacá' },

  // Llanos y Amazonía (Meta, Casanare, Caquetá, Guaviare, Putumayo, Arauca)
  { municipio: 'Villavicencio', departamento: 'Meta', label: 'Villavicencio, Meta', value: 'Villavicencio, Meta' },
  { municipio: 'Acacías', departamento: 'Meta', label: 'Acacías, Meta', value: 'Acacías, Meta' },
  { municipio: 'Granada', departamento: 'Meta', label: 'Granada, Meta', value: 'Granada, Meta' },
  { municipio: 'Puerto López', departamento: 'Meta', label: 'Puerto López, Meta', value: 'Puerto López, Meta' },
  { municipio: 'Yopal', departamento: 'Casanare', label: 'Yopal, Casanare', value: 'Yopal, Casanare' },
  { municipio: 'Aguazul', departamento: 'Casanare', label: 'Aguazul, Casanare', value: 'Aguazul, Casanare' },
  { municipio: 'Florencia', departamento: 'Caquetá', label: 'Florencia, Caquetá', value: 'Florencia, Caquetá' },
  { municipio: 'San José del Guaviare', departamento: 'Guaviare', label: 'San José del Guaviare, Guaviare', value: 'San José del Guaviare, Guaviare' },
  { municipio: 'Mocoa', departamento: 'Putumayo', label: 'Mocoa, Putumayo', value: 'Mocoa, Putumayo' },
  { municipio: 'Puerto Asís', departamento: 'Putumayo', label: 'Puerto Asís, Putumayo', value: 'Puerto Asís, Putumayo' },
  { municipio: 'Arauca', departamento: 'Arauca', label: 'Arauca, Arauca', value: 'Arauca, Arauca' },
  { municipio: 'Saravena', departamento: 'Arauca', label: 'Saravena, Arauca', value: 'Saravena, Arauca' },

  // Suroccidente (Cauca, Nariño, Chocó)
  { municipio: 'Popayán', departamento: 'Cauca', label: 'Popayán, Cauca', value: 'Popayán, Cauca' },
  { municipio: 'Santander de Quilichao', departamento: 'Cauca', label: 'Santander de Quilichao, Cauca', value: 'Santander de Quilichao, Cauca' },
  { municipio: 'Pasto', departamento: 'Nariño', label: 'Pasto, Nariño', value: 'Pasto, Nariño' },
  { municipio: 'Ipiales', departamento: 'Nariño', label: 'Ipiales, Nariño', value: 'Ipiales, Nariño' },
  { municipio: 'Tumaco', departamento: 'Nariño', label: 'Tumaco, Nariño', value: 'Tumaco, Nariño' },
  { municipio: 'Quibdó', departamento: 'Chocó', label: 'Quibdó, Chocó', value: 'Quibdó, Chocó' }
]

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
 * Busca municipios coincidentes por nombre de municipio o departamento
 * Cumple con la restricción de NO usar filter() ni forEach()
 */
export function buscarMunicipios(termino) {
  if (!termino || !termino.trim()) {
    const list = []
    for (const m of MUNICIPIOS_COLOMBIA) {
      list.push(m.value)
    }
    return list
  }

  const queryNorm = normalizarTexto(termino)
  const resultados = []

  for (const m of MUNICIPIOS_COLOMBIA) {
    const mNorm = normalizarTexto(m.municipio)
    const dNorm = normalizarTexto(m.departamento)
    const fullNorm = normalizarTexto(m.label)

    if (fullNorm.includes(queryNorm) || mNorm.includes(queryNorm) || dNorm.includes(queryNorm)) {
      resultados.push(m.value)
    }
  }

  return resultados
}

/**
 * Devuelve el objeto estructurado { municipio, departamento } de un valor normalizado
 */
export function parseMunicipio(valor) {
  if (!valor) return { municipio: '', departamento: '' }
  const partes = String(valor).split(',')
  return {
    municipio: partes[0] ? partes[0].trim() : '',
    departamento: partes[1] ? partes[1].trim() : ''
  }
}
