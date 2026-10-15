export function tieneBanoVehiculo(capacidad) {
  return Number(capacidad || 0) >= 35;
}

export function generarPuestos(capacidad) {
  const total = Math.max(1, Number(capacidad || 20));
  const lista = [];
  for (let i = 1; i <= total; i++) {
    lista.push({
      id: i,
      numero: i,
      type: 'seat',
      esConductor: false,
      disponible: true
    });
  }
  return lista;
}

export function calcularDistribucionBus(puestosRaw, capacidadRaw) {
  let puestos = [];

  if (Array.isArray(puestosRaw) && puestosRaw.length > 0) {
    puestos = puestosRaw.filter(p => !p.esConductor && p.type !== 'bathroom');
  }

  const cap = Number(capacidadRaw || (puestos.length > 0 ? puestos.length : 20));

  if (puestos.length === 0 || puestos.length !== cap) {
    puestos = generarPuestos(cap);
  }

  const total = puestos.length;
  const conBano = tieneBanoVehiculo(total);

  let asientosTraserosCount = 6;
  let asientosLadoBano = 0;

  if (conBano) {
    const rem = total % 4;
    if (rem === 3) {
      asientosTraserosCount = 5;
      asientosLadoBano = 2;
    } else if (rem === 0) {
      asientosTraserosCount = 6;
      asientosLadoBano = 2;
    } else if (rem === 1) {
      asientosTraserosCount = 5;
      asientosLadoBano = 4;
    } else {
      asientosTraserosCount = 6;
      asientosLadoBano = 4;
    }
  } else {
    const rem = total % 4;
    if (rem === 2) {
      asientosTraserosCount = 6;
    } else if (rem === 1) {
      asientosTraserosCount = 5;
    } else if (rem === 0) {
      asientosTraserosCount = 6;
    } else {
      asientosTraserosCount = 5;
    }
  }

  const filas = [];
  const asientosTraseros = puestos.slice(total - asientosTraserosCount);
  const asientosRestantesCuerpo = puestos.slice(0, total - asientosTraserosCount);

  if (conBano) {
    const totalCuerpo = asientosRestantesCuerpo.length;
    const cantAntesBano = totalCuerpo - asientosLadoBano;
    const asientosAntesBano = asientosRestantesCuerpo.slice(0, cantAntesBano);
    const asientosJuntoBano = asientosRestantesCuerpo.slice(cantAntesBano);

    let c = 0;
    while (c < asientosAntesBano.length) {
      const grupo = asientosAntesBano.slice(c, c + 4);
      if (grupo.length === 4) {
        filas.push({
          tipo: 'normal',
          esUltimaFila: false,
          tieneBano: false,
          izq: grupo.slice(0, 2),
          der: grupo.slice(2, 4)
        });
        c += 4;
      } else {
        filas.push({
          tipo: 'normal',
          esUltimaFila: false,
          tieneBano: false,
          izq: grupo.slice(0, Math.min(2, grupo.length)),
          der: grupo.slice(2)
        });
        c += grupo.length;
      }
    }

    if (asientosLadoBano === 4) {
      filas.push({
        tipo: 'bano_parcial',
        esUltimaFila: false,
        tieneBano: true,
        banoPosicion: 'top',
        izq: asientosJuntoBano.slice(0, 2),
        der: []
      });
      filas.push({
        tipo: 'bano',
        esUltimaFila: false,
        tieneBano: true,
        banoPosicion: 'bottom',
        izq: asientosJuntoBano.slice(2, 4),
        der: []
      });
    } else {
      filas.push({
        tipo: 'bano',
        esUltimaFila: false,
        tieneBano: true,
        banoPosicion: 'full',
        izq: asientosJuntoBano.slice(0, 2),
        der: []
      });
    }
  } else {
    let c = 0;
    if (asientosRestantesCuerpo.length % 4 !== 0) {
      const sobrante = asientosRestantesCuerpo.length % 4;
      filas.push({
        tipo: 'normal',
        esUltimaFila: false,
        tieneBano: false,
        izq: asientosRestantesCuerpo.slice(0, 2),
        der: asientosRestantesCuerpo.slice(2, sobrante)
      });
      c = sobrante;
    }

    while (c < asientosRestantesCuerpo.length) {
      const grupo = asientosRestantesCuerpo.slice(c, c + 4);
      filas.push({
        tipo: 'normal',
        esUltimaFila: false,
        tieneBano: false,
        izq: grupo.slice(0, 2),
        der: grupo.slice(2, 4)
      });
      c += 4;
    }
  }

  filas.push({
    tipo: 'trasera',
    esUltimaFila: true,
    tieneBano: false,
    asientosCount: asientosTraserosCount,
    todos: asientosTraseros
  });

  return {
    filas,
    tieneBano: conBano,
    capacidad: total,
    asientosTraserosCount
  };
}

export function validarReglasVehiculo(vehiculo) {
  const cap = Number(vehiculo.capacidad || 0);
  const tieneBano = tieneBanoVehiculo(cap);
  const dist = calcularDistribucionBus(vehiculo.puestos, cap);

  const asientosTraserosOk = dist.asientosTraserosCount >= 5 && dist.asientosTraserosCount <= 6;
  const totalAsientosOk = dist.capacidad === cap;
  const banoOk = dist.tieneBano === (cap >= 35);

  return {
    esValido: asientosTraserosOk && totalAsientosOk && banoOk,
    tieneBanoCorrecto: banoOk,
    tieneAsientosTraserosCorrectos: asientosTraserosOk,
    detalles: {
      capacidad: cap,
      tieneBano,
      asientosTraserosCount: dist.asientosTraserosCount,
      filasTotal: dist.filas.length
    }
  };
}
