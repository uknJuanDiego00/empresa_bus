<template>
  <div class="seat-map-wrapper">
    <!-- Leyenda de Estados -->
    <div class="legend-panel q-mb-md">
      <div class="legend-item">
        <span class="legend-badge badge-available">
          <q-icon name="check" size="12px" />
        </span>
        <span class="legend-label">Disponible</span>
      </div>

      <div class="legend-item" v-if="selectable">
        <span class="legend-badge badge-selected">
          <q-icon name="done_all" size="12px" />
        </span>
        <span class="legend-label">Seleccionado</span>
      </div>

      <div class="legend-item">
        <span class="legend-badge badge-pending">
          <q-icon name="hourglass_empty" size="12px" />
        </span>
        <span class="legend-label">Pendiente</span>
      </div>

      <div class="legend-item">
        <span class="legend-badge badge-occupied">
          <q-icon name="close" size="12px" />
        </span>
        <span class="legend-label">Ocupado</span>
      </div>

      <div class="legend-item">
        <span class="legend-badge badge-driver">
          <q-icon name="sports_motorsports" size="12px" />
        </span>
        <span class="legend-label">Conductor</span>
      </div>
    </div>

    <!-- Estructura del Vehículo (Vista Superior) -->
    <div class="vehicle-container">
      <!-- Retrovisores exteriores del autobús -->
      <div class="mirror mirror-left"></div>
      <div class="mirror mirror-right"></div>

      <div class="bus-chassis">
        <!-- Parte Delantera / Parabrisas -->
        <div class="bus-front-cap">
          <div class="front-windshield">
            <div class="windshield-glare"></div>
            <div class="front-title">
              <q-icon name="navigation" size="14px" class="q-mr-xs rotate-90" />
              <span>FRENTE DEL VEHÍCULO</span>
            </div>
          </div>
        </div>

        <!-- Cabina Frontal: Conductor (Izquierda) y Puerta/Entrada (Derecha) -->
        <div class="cabin-area">
          <!-- Asiento del conductor -->
          <div class="driver-box" title="Puesto reservado para el conductor">
            <div class="driver-seat-visual">
              <q-icon name="sports_motorsports" size="22px" />
              <span class="driver-text">COND</span>
            </div>
            <div class="driver-details">
              <span class="driver-name">{{ conductor || 'Conductor asignado' }}</span>
              <span class="driver-badge">Puesto del conductor</span>
            </div>
          </div>

          <!-- Puerta de acceso de pasajeros -->
          <div class="door-box" title="Puerta de ascenso y descenso">
            <div class="door-indicator">
              <q-icon name="login" size="18px" class="text-grey-7" />
              <span class="door-text">PUERTA</span>
            </div>
            <div class="door-steps">
              <div class="step-line"></div>
              <div class="step-line"></div>
            </div>
          </div>
        </div>

        <!-- Separador de cabina de pasajeros -->
        <div class="cabin-divider">
          <span class="divider-text">ZONA DE PASAJEROS</span>
        </div>

        <!-- Área de Asientos con Pasillo Central -->
        <div class="passenger-area">
          <div
            v-for="(fila, fIdx) in filasCalculadas"
            :key="'fila-' + fIdx"
            class="seat-row"
            :class="{ 'rear-row': fila.esUltimaFilaCinco }"
          >
            <!-- Layout regular de 4 puestos (2 izquierda + pasillo + 2 derecha) -->
            <template v-if="!fila.esUltimaFilaCinco">
              <!-- Lado Izquierdo (2 puestos) -->
              <div class="seat-pair left-pair">
                <div
                  v-for="asiento in fila.izq"
                  :key="'asiento-' + asiento.numero"
                  class="seat-cell"
                  :class="getClaseAsiento(asiento)"
                  @click="onAsientoClick(asiento)"
                >
                  <div class="seat-headrest"></div>
                  <div class="seat-cushion">
                    <span class="seat-number">{{ asiento.numero }}</span>
                    <q-icon :name="getIconoAsiento(asiento)" size="12px" class="seat-state-icon" />
                  </div>
                </div>
              </div>

              <!-- Pasillo central -->
              <div class="aisle-lane">
                <span class="aisle-marker">•</span>
              </div>

              <!-- Lado Derecho (2 puestos) -->
              <div class="seat-pair right-pair">
                <div
                  v-for="asiento in fila.der"
                  :key="'asiento-' + asiento.numero"
                  class="seat-cell"
                  :class="getClaseAsiento(asiento)"
                  @click="onAsientoClick(asiento)"
                >
                  <div class="seat-headrest"></div>
                  <div class="seat-cushion">
                    <span class="seat-number">{{ asiento.numero }}</span>
                    <q-icon :name="getIconoAsiento(asiento)" size="12px" class="seat-state-icon" />
                  </div>
                </div>
              </div>
            </template>

            <!-- Última fila completa de 5 asientos (Fondo del autobús) -->
            <template v-else>
              <div class="rear-five-seats">
                <div
                  v-for="asiento in fila.todos"
                  :key="'asiento-' + asiento.numero"
                  class="seat-cell"
                  :class="getClaseAsiento(asiento)"
                  @click="onAsientoClick(asiento)"
                >
                  <div class="seat-headrest"></div>
                  <div class="seat-cushion">
                    <span class="seat-number">{{ asiento.numero }}</span>
                    <q-icon :name="getIconoAsiento(asiento)" size="12px" class="seat-state-icon" />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Parte Posterior / Luces traseras -->
        <div class="bus-rear-cap">
          <div class="rear-light left-light"></div>
          <div class="rear-label">PARTE POSTERIOR</div>
          <div class="rear-light right-light"></div>
        </div>
      </div>
    </div>

    <!-- Indicador de Puesto Seleccionado -->
    <div v-if="selectable && puestoSeleccionado" class="selected-summary-banner q-mt-md">
      <div class="row items-center justify-between no-wrap">
        <div class="row items-center q-gutter-x-sm">
          <q-icon name="airline_seat_recline_normal" color="primary" size="22px" />
          <div>
            <div class="text-caption text-grey-7">Puesto seleccionado para la compra:</div>
            <div class="text-weight-bold text-primary text-subtitle1">
              Asiento #{{ puestoSeleccionado.numero }}
            </div>
          </div>
        </div>
        <q-btn
          flat
          dense
          color="negative"
          icon="close"
          label="Deseleccionar"
          size="sm"
          no-caps
          @click="deseleccionar"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Lista de puestos del vehículo (si está vacío, se generará dinámicamente)
  puestos: { type: Array, default: () => [] },
  // Capacidad total del vehículo por si no tiene arreglo explícito
  capacidad: { type: Number, default: 0 },
  // Números de puestos ocupados (estado confirmado / pagado)
  puestosOcupados: { type: Array, default: () => [] },
  // Números de puestos pendientes (reserva en proceso)
  puestosPendientes: { type: Array, default: () => [] },
  // Puesto seleccionado actualmente por el usuario { id, numero, ... }
  puestoSeleccionado: { type: Object, default: null },
  // Permite selección interactiva o solo visualización
  selectable: { type: Boolean, default: true },
  // Nombre del conductor
  conductor: { type: String, default: '' }
})

const emit = defineEmits(['seleccionar'])

// Normalizar la lista de asientos disponibles para pasajeros
const listaAsientosPasajeros = computed(() => {
  let list = []

  // 1. Si vienen puestos en props y tienen elementos
  if (Array.isArray(props.puestos) && props.puestos.length > 0) {
    list = props.puestos.filter(p => !p.esConductor)
  }

  // 2. Si no hay lista pero se indicó capacidad o se necesita respaldo
  if (list.length === 0) {
    const total = props.capacidad > 0 ? props.capacidad : 20
    for (let i = 1; i <= total; i++) {
      list.push({ id: i, numero: i, esConductor: false, disponible: true })
    }
  }

  return list
})

// Estructurar los asientos en filas realistas tipo bus (2 izquierda, pasillo, 2 derecha)
// Si la última fila tiene exactamente 5 asientos o sobrante, se coloca alineada atrás
const filasCalculadas = computed(() => {
  const asientos = [...listaAsientosPasajeros.value]
  const total = asientos.length
  const filas = []

  // Si tiene más de 8 asientos y termina en un grupo de 5 o 4
  const tieneFilaTraseraCompleta = total >= 16 && (total % 4 === 1 || total % 4 === 2)

  let cursor = 0

  while (cursor < total) {
    const restantes = total - cursor

    // Verificar si es la última fila y tiene 5 asientos
    if (tieneFilaTraseraCompleta && restantes === 5) {
      filas.push({
        esUltimaFilaCinco: true,
        todos: asientos.slice(cursor, cursor + 5)
      })
      cursor += 5
      break
    }

    // Fila estándar de 4 (2 a la izquierda, 2 a la derecha)
    const grupo = asientos.slice(cursor, cursor + 4)
    filas.push({
      esUltimaFilaCinco: false,
      izq: grupo.slice(0, 2),
      der: grupo.slice(2, 4)
    })
    cursor += 4
  }

  return filas
})

// Verificar si un puesto está ocupado (rojo)
function isOcupado(asiento) {
  if (!asiento) return false
  const num = Number(asiento.numero || asiento.id)
  return props.puestosOcupados.includes(num) || props.puestosOcupados.includes(String(num))
}

// Verificar si un puesto está pendiente (amarillo)
function isPendiente(asiento) {
  if (!asiento) return false
  const num = Number(asiento.numero || asiento.id)
  return props.puestosPendientes.includes(num) || props.puestosPendientes.includes(String(num))
}

// Verificar si un puesto está seleccionado por el usuario (azul)
function isSeleccionado(asiento) {
  if (!props.puestoSeleccionado || !asiento) return false
  const numSel = Number(props.puestoSeleccionado.numero || props.puestoSeleccionado.id)
  const numActual = Number(asiento.numero || asiento.id)
  return numSel === numActual
}

// Determinar la clase CSS de estado
function getClaseAsiento(asiento) {
  if (!asiento) return 'seat-unavailable'
  if (asiento.esConductor) return 'seat-driver'
  if (isSeleccionado(asiento)) return 'seat-selected'
  if (isOcupado(asiento)) return 'seat-occupied'
  if (isPendiente(asiento)) return 'seat-pending'
  return 'seat-available'
}

// Ícono representativo para cada estado
function getIconoAsiento(asiento) {
  if (asiento.esConductor) return 'sports_motorsports'
  if (isSeleccionado(asiento)) return 'done'
  if (isOcupado(asiento)) return 'close'
  if (isPendiente(asiento)) return 'hourglass_top'
  return 'event_seat'
}

// Interacción al hacer clic en un puesto
function onAsientoClick(asiento) {
  if (!props.selectable || !asiento) return

  // El conductor nunca se selecciona
  if (asiento.esConductor) return

  // Los puestos ocupados y pendientes están bloqueados
  if (isOcupado(asiento) || isPendiente(asiento)) return

  // Si ya está seleccionado, hacer toggle (deseleccionar)
  if (isSeleccionado(asiento)) {
    emit('seleccionar', null)
    return
  }

  // Si está disponible (verde), seleccionarlo
  emit('seleccionar', asiento)
}

function deseleccionar() {
  emit('seleccionar', null)
}
</script>

<style scoped>
.seat-map-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  width: 100%;
}

/* Panel de Leyenda Superior */
.legend-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 18px;
  background: #ffffff;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  max-width: 460px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

.legend-badge {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 10px;
}

.badge-available {
  background-color: #22c55e;
}

.badge-selected {
  background-color: #2563eb;
}

.badge-pending {
  background-color: #eab308;
}

.badge-occupied {
  background-color: #ef4444;
}

.badge-driver {
  background-color: #374151;
}

/* Contenedor del Vehículo */
.vehicle-container {
  position: relative;
  display: inline-block;
  padding: 8px 16px;
  max-width: 380px;
  width: 100%;
}

/* Retrovisores */
.mirror {
  position: absolute;
  top: 36px;
  width: 10px;
  height: 28px;
  background: #64748b;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.mirror-left {
  left: 6px;
}
.mirror-right {
  right: 6px;
}

/* Carrocería del Autobús */
.bus-chassis {
  background: #f8fafc;
  border: 3px solid #cbd5e1;
  border-radius: 36px 36px 20px 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  padding: 0 0 12px 0;
}

/* Frente del Vehículo */
.bus-front-cap {
  padding: 12px 14px 6px 14px;
  background: #f1f5f9;
}

.front-windshield {
  position: relative;
  background: linear-gradient(180deg, #bae6fd 0%, #e0f2fe 100%);
  border: 2px solid #7dd3fc;
  border-radius: 24px 24px 8px 8px;
  padding: 8px 12px;
  text-align: center;
  overflow: hidden;
}

.windshield-glare {
  position: absolute;
  top: 0;
  left: 20%;
  width: 30px;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  transform: skewX(-25deg);
}

.front-title {
  position: relative;
  font-size: 11px;
  font-weight: 800;
  color: #0369a1;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Cabina Delantera */
.cabin-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px;
  background: #f8fafc;
  border-bottom: 1px dashed #cbd5e1;
}

.driver-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 2px solid #374151;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: not-allowed;
}

.driver-seat-visual {
  width: 36px;
  height: 36px;
  background: #374151;
  color: #ffffff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.driver-text {
  font-size: 8px;
  font-weight: 800;
  line-height: 1;
}

.driver-details {
  display: flex;
  flex-direction: column;
}

.driver-name {
  font-size: 11px;
  font-weight: 700;
  color: #1e293b;
  max-width: 110px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.driver-badge {
  font-size: 9px;
  color: #64748b;
  font-weight: 500;
}

/* Puerta */
.door-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  padding: 6px 10px;
  border-radius: 8px;
}

.door-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.door-text {
  font-size: 9px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.5px;
}

.door-steps {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 3px;
  width: 100%;
}

.step-line {
  height: 2px;
  background: #94a3b8;
  border-radius: 1px;
}

/* Separador */
.cabin-divider {
  text-align: center;
  padding: 6px 0;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.divider-text {
  font-size: 9px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 1px;
}

/* Área de Pasajeros */
.passenger-area {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.seat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.seat-pair {
  display: flex;
  gap: 8px;
}

/* Pasillo central */
.aisle-lane {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 100%;
  color: #cbd5e1;
}

.aisle-marker {
  font-size: 16px;
  color: #94a3b8;
}

/* Fila trasera de 5 asientos */
.rear-five-seats {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 6px;
}

/* Componente Individual de Asiento */
.seat-cell {
  position: relative;
  width: 44px;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px 8px 6px 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.seat-headrest {
  width: 68%;
  height: 10px;
  border-radius: 5px 5px 2px 2px;
  margin-top: 2px;
  opacity: 0.9;
}

.seat-cushion {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 3px 3px 6px 6px;
  position: relative;
}

.seat-number {
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
}

.seat-state-icon {
  margin-top: 2px;
}

/* ESTADO: DISPONIBLE */
.seat-available {
  background-color: #dcfce7;
  border: 2px solid #22c55e;
  color: #15803d;
  cursor: pointer;
}

.seat-available .seat-headrest {
  background-color: #22c55e;
}

.seat-available:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 14px rgba(34, 197, 94, 0.35);
  border-color: #16a34a;
}

/* ESTADO: SELECCIONADO */
.seat-selected {
  background-color: #2563eb;
  border: 2px solid #1d4ed8;
  color: #ffffff;
  cursor: pointer;
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3), 0 6px 14px rgba(37, 99, 235, 0.4);
}

.seat-selected .seat-headrest {
  background-color: #1e40af;
}

/* ESTADO: PENDIENTE */
.seat-pending {
  background-color: #fef9c3;
  border: 2px solid #eab308;
  color: #854d0e;
  cursor: not-allowed;
  opacity: 0.88;
}

.seat-pending .seat-headrest {
  background-color: #eab308;
}

/* ESTADO: OCUPADO */
.seat-occupied {
  background-color: #fee2e2;
  border: 2px solid #ef4444;
  color: #b91c1c;
  cursor: not-allowed;
  opacity: 0.88;
}

.seat-occupied .seat-headrest {
  background-color: #ef4444;
}

/* ESTADO: CONDUCTOR */
.seat-driver {
  background-color: #374151;
  border: 2px solid #1f2937;
  color: #ffffff;
  cursor: not-allowed;
}

.seat-driver .seat-headrest {
  background-color: #1f2937;
}

.seat-unavailable {
  visibility: hidden;
}

/* Parte Posterior */
.bus-rear-cap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 18px 2px 18px;
  background: #f1f5f9;
  border-top: 1px solid #e2e8f0;
}

.rear-label {
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 1px;
}

.rear-light {
  width: 14px;
  height: 6px;
  background: #ef4444;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.5);
}

/* Banner de Resumen Seleccionado */
.selected-summary-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 10px 16px;
  border-radius: 10px;
  width: 100%;
  max-width: 380px;
}

@media (max-width: 480px) {
  .vehicle-container {
    padding: 4px 8px;
  }
  .seat-cell {
    width: 38px;
    height: 44px;
  }
  .seat-number {
    font-size: 11px;
  }
}
</style>
