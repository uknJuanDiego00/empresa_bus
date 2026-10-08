<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1240px;">
      
      <!-- CABECERA PRINCIPAL -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="row items-center q-gutter-x-sm q-mb-xs">
            <span class="text-h4 text-weight-bold text-dark">Viajes & Despacho</span>
            <q-badge color="grey-3" text-color="grey-9" class="text-caption text-weight-bold">
              En Tiempo Real
            </q-badge>
          </div>
          <div class="text-subtitle2 text-grey-7">
            Control de itinerarios, disponibilidad de puestos y despacho de unidades
          </div>
        </div>

        <div>
          <q-btn
            color="primary"
            icon="add"
            label="Programar Nuevo Viaje"
            to="/viajes/crear"
            no-caps
            unelevated
            class="q-px-md text-weight-bold"
          />
        </div>
      </div>

      <!-- MÉTRICAS OPERATIVAS (KPIs) -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-sm-3">
          <div class="stat-card">
            <div class="row items-center justify-between no-wrap q-mb-xs">
              <span class="stat-card-label">Viajes Activos</span>
              <div class="stat-icon-wrapper">
                <q-icon name="route" size="18px" />
              </div>
            </div>
            <div class="stat-card-value">{{ viajesActivos.length }}</div>
            <div class="stat-card-sub">
              <span>Programados y disponibles</span>
            </div>
          </div>
        </div>

        <div class="col-6 col-sm-3">
          <div class="stat-card">
            <div class="row items-center justify-between no-wrap q-mb-xs">
              <span class="stat-card-label">Puestos Libres</span>
              <div class="stat-icon-wrapper">
                <q-icon name="event_seat" size="18px" />
              </div>
            </div>
            <div class="stat-card-value text-positive">{{ totalPuestosDisponibles }}</div>
            <div class="stat-card-sub">
              <span>Capacidad comercializable</span>
            </div>
          </div>
        </div>

        <div class="col-6 col-sm-3">
          <div class="stat-card">
            <div class="row items-center justify-between no-wrap q-mb-xs">
              <span class="stat-card-label">Ocupación</span>
              <div class="stat-icon-wrapper">
                <q-icon name="groups" size="18px" />
              </div>
            </div>
            <div class="stat-card-value">{{ totalPuestosOcupados }}</div>
            <div class="stat-card-sub">
              <span>Pasajeros confirmados</span>
            </div>
          </div>
        </div>

        <div class="col-6 col-sm-3">
          <div class="stat-card">
            <div class="row items-center justify-between no-wrap q-mb-xs">
              <span class="stat-card-label">Tarifa Promedio</span>
              <div class="stat-icon-wrapper">
                <q-icon name="payments" size="18px" />
              </div>
            </div>
            <div class="stat-card-value">${{ tarifaPromedio.toLocaleString('es-CO') }}</div>
            <div class="stat-card-sub">
              <span>Por tiquete emitido</span>
            </div>
          </div>
        </div>
      </div>

      <!-- BARRA DE HERRAMIENTAS: BÚSQUEDA Y FILTROS -->
      <q-card flat class="vb-card q-pa-sm q-mb-lg">
        <div class="row items-center justify-between q-col-gutter-sm">
          <!-- Búsqueda rápida -->
          <div class="col-12 col-md-5">
            <q-input
              v-model="filtroTexto"
              outlined
              dense
              placeholder="Buscar por origen, destino, código, placa o conductor..."
              clearable
              class="bg-white"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="grey-6" />
              </template>
            </q-input>
          </div>

          <!-- Filtro por estado -->
          <div class="col-12 col-md-4">
            <div class="row q-gutter-xs items-center">
              <q-btn
                v-for="st in estadosFiltro"
                :key="st"
                dense
                no-caps
                :class="filtroEstado === st ? 'filter-btn-active' : 'filter-btn-inactive'"
                :label="st"
                class="q-px-sm text-caption"
                @click="filtroEstado = st"
                unelevated
              />
            </div>
          </div>

          <!-- Selector de vista (Tarjetas vs Tabla) -->
          <div class="col-12 col-md-3 text-right">
            <q-btn-toggle
              v-model="vistaModo"
              dense
              rounded
              toggle-color="primary"
              color="grey-2"
              text-color="grey-8"
              :options="[
                { label: 'Tarjetas', value: 'cards', icon: 'grid_view' },
                { label: 'Tabla', value: 'table', icon: 'view_list' }
              ]"
              no-caps
            />
          </div>
        </div>
      </q-card>

      <!-- SIN RESULTADOS -->
      <div v-if="viajesFiltrados.length === 0" class="empty-state-box q-my-lg">
        <div class="empty-state-icon">
          <q-icon name="route" size="28px" />
        </div>
        <div class="empty-state-title">No se encontraron viajes</div>
        <div class="empty-state-desc">
          Intente ajustar el término de búsqueda o seleccione otro filtro de estado.
        </div>
        <q-btn
          outline
          color="primary"
          label="Limpiar Filtros"
          icon="clear_all"
          @click="limpiarFiltros"
          no-caps
        />
      </div>

      <!-- VISTA EN TARJETAS -->
      <div v-else-if="vistaModo === 'cards'" class="row q-col-gutter-lg">
        <div
          v-for="viaje in viajesFiltrados"
          :key="viaje.id || viaje._id"
          class="col-12 col-md-6 col-lg-4"
        >
          <q-card flat class="vb-card column justify-between trip-card-container">
            <div>
              <!-- Cabecera de la Tarjeta -->
              <div class="q-pa-md row items-center justify-between border-bottom-subtle bg-white">
                <div class="row items-center q-gutter-x-xs">
                  <span class="trip-code-badge">{{ viaje.codigo }}</span>
                  <q-badge :class="'badge-status-' + viaje.estado.toLowerCase()">
                    {{ viaje.estado }}
                  </q-badge>
                </div>
                <div class="text-h6 text-weight-bold text-dark">
                  ${{ viaje.precio.toLocaleString('es-CO') }}
                </div>
              </div>

              <!-- Itinerario de Ruta -->
              <div class="q-pa-md">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="col-5 text-left">
                    <div class="text-caption text-grey-6">Origen</div>
                    <div class="text-subtitle1 text-weight-bold text-dark ellipsis">{{ viaje.origen }}</div>
                  </div>
                  <div class="col-2 text-center">
                    <div class="route-node">
                      <q-icon name="arrow_forward" color="primary" size="14px" />
                    </div>
                  </div>
                  <div class="col-5 text-right">
                    <div class="text-caption text-grey-6">Destino</div>
                    <div class="text-subtitle1 text-weight-bold text-dark ellipsis">{{ viaje.destino }}</div>
                  </div>
                </div>

                <!-- Detalles Horarios -->
                <div class="row q-col-gutter-xs q-my-xs text-caption">
                  <div class="col-6">
                    <div class="meta-info-box row items-center">
                      <q-icon name="event" size="14px" color="grey-6" class="q-mr-xs" />
                      <span class="text-grey-8">{{ viaje.fecha }}</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="meta-info-box row items-center">
                      <q-icon name="schedule" size="14px" color="primary" class="q-mr-xs" />
                      <span class="text-weight-bold text-primary">{{ viaje.hora }}</span>
                    </div>
                  </div>
                </div>

                <!-- Vehículo & Conductor -->
                <div class="vehicle-info-bar q-pa-sm q-mt-sm">
                  <div class="row items-center justify-between text-caption">
                    <div class="row items-center q-gutter-x-xs">
                      <q-icon name="directions_bus" size="15px" color="primary" />
                      <span class="text-weight-bold text-dark">{{ getVehiculo(viaje.vehiculoId)?.placa || 'Placa N/A' }}</span>
                      <span class="text-grey-6">({{ getVehiculo(viaje.vehiculoId)?.tipo || 'Bus' }})</span>
                    </div>
                    <div class="text-grey-7 ellipsis" style="max-width: 140px;">
                      <q-icon name="person" size="13px" /> {{ getVehiculo(viaje.vehiculoId)?.conductor || 'Conductor' }}
                    </div>
                  </div>
                </div>

                <!-- Ocupación de Asientos -->
                <div class="q-mt-md">
                  <div class="row items-center justify-between text-caption q-mb-xs">
                    <span class="text-weight-medium text-grey-7">Ocupación</span>
                    <span>
                      <strong class="text-positive">{{ getDisponibles(viaje) }} disponibles</strong>
                      <span class="text-grey-4 q-mx-xs">/</span>
                      <strong class="text-grey-8">{{ getOcupados(viaje) }} ocupados</strong>
                    </span>
                  </div>
                  <q-linear-progress
                    :value="getPorcentajeOcupacion(viaje)"
                    rounded
                    size="6px"
                    :color="getPorcentajeOcupacion(viaje) > 0.85 ? 'negative' : (getPorcentajeOcupacion(viaje) > 0.5 ? 'warning' : 'positive')"
                    track-color="grey-2"
                  />
                </div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div>
              <q-separator />
              <div class="q-pa-md bg-grey-0 row items-center justify-between q-gutter-x-sm">
                <q-btn
                  flat
                  dense
                  color="grey-8"
                  icon="visibility"
                  label="Mapa"
                  @click="abrirVistaMapa(viaje)"
                  no-caps
                  class="q-px-sm"
                >
                  <q-tooltip>Ver distribución de asientos</q-tooltip>
                </q-btn>

                <q-btn
                  color="primary"
                  icon="add_shopping_cart"
                  label="Vender Tiquete"
                  :to="{ path: '/ventas/nueva', query: { viajeId: viaje.id || viaje._id } }"
                  no-caps
                  unelevated
                  class="text-weight-bold"
                />
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- VISTA EN TABLA -->
      <q-card v-else flat class="vb-card overflow-hidden">
        <q-table
          flat
          :rows="viajesFiltrados"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          class="no-border"
        >
          <!-- Código -->
          <template v-slot:body-cell-codigo="props">
            <q-td :props="props">
              <span class="trip-code-badge">{{ props.row.codigo }}</span>
            </q-td>
          </template>

          <!-- Ruta -->
          <template v-slot:body-cell-ruta="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-xs no-wrap">
                <span class="text-weight-bold text-dark">{{ props.row.origen }}</span>
                <q-icon name="arrow_forward" size="13px" color="grey-5" />
                <span class="text-weight-bold text-dark">{{ props.row.destino }}</span>
              </div>
            </q-td>
          </template>

          <!-- Horario -->
          <template v-slot:body-cell-horario="props">
            <q-td :props="props">
              <div class="text-caption">
                <span class="text-grey-8">{{ props.row.fecha }}</span>
                <span class="text-grey-4 q-mx-xs">•</span>
                <span class="text-primary text-weight-bold">{{ props.row.hora }}</span>
              </div>
            </q-td>
          </template>

          <!-- Vehículo -->
          <template v-slot:body-cell-vehiculo="props">
            <q-td :props="props">
              <div>
                <span class="text-weight-bold text-dark">{{ getVehiculo(props.row.vehiculoId)?.placa || '—' }}</span>
                <span class="text-caption text-grey-6 q-ml-xs">({{ getVehiculo(props.row.vehiculoId)?.tipo }})</span>
                <div class="text-caption text-grey-6">{{ getVehiculo(props.row.vehiculoId)?.conductor }}</div>
              </div>
            </q-td>
          </template>

          <!-- Disponibilidad -->
          <template v-slot:body-cell-disponibilidad="props">
            <q-td :props="props" style="min-width: 150px;">
              <div class="row items-center justify-between text-caption q-mb-xs">
                <span class="text-positive text-weight-bold">{{ getDisponibles(props.row) }} disp.</span>
                <span class="text-grey-6">{{ getOcupados(props.row) }} ocup.</span>
              </div>
              <q-linear-progress
                :value="getPorcentajeOcupacion(props.row)"
                rounded
                size="5px"
                :color="getPorcentajeOcupacion(props.row) > 0.85 ? 'negative' : 'positive'"
                track-color="grey-2"
              />
            </q-td>
          </template>

          <!-- Tarifa -->
          <template v-slot:body-cell-precio="props">
            <q-td :props="props">
              <span class="text-weight-bold text-dark">
                ${{ props.row.precio.toLocaleString('es-CO') }}
              </span>
            </q-td>
          </template>

          <!-- Estado -->
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge :class="'badge-status-' + props.row.estado.toLowerCase()">
                {{ props.row.estado }}
              </q-badge>
            </q-td>
          </template>

          <!-- Acciones -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <div class="row q-gutter-x-xs justify-end no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  color="grey-7"
                  icon="visibility"
                  @click="abrirVistaMapa(props.row)"
                >
                  <q-tooltip>Ver mapa de asientos</q-tooltip>
                </q-btn>
                <q-btn
                  color="primary"
                  size="sm"
                  icon="add_shopping_cart"
                  label="Vender"
                  :to="{ path: '/ventas/nueva', query: { viajeId: props.row.id || props.row._id } }"
                  no-caps
                  unelevated
                  class="text-weight-bold q-px-sm"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- MODAL DE PREVISUALIZACIÓN DE MAPA DE ASIENTOS -->
      <q-dialog v-model="modalMapaVisible">
        <q-card style="width: 680px; max-width: 95vw;" class="vb-card overflow-hidden">
          <q-card-section class="bg-white border-bottom-subtle row items-center justify-between q-pa-md">
            <div>
              <div class="text-subtitle1 text-weight-bold text-dark">
                Mapa de Asientos
              </div>
              <div class="text-caption text-grey-6" v-if="viajeSeleccionadoModal">
                {{ viajeSeleccionadoModal.origen }} → {{ viajeSeleccionadoModal.destino }} | {{ viajeSeleccionadoModal.fecha }} {{ viajeSeleccionadoModal.hora }}
              </div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pa-lg text-center" v-if="vehiculoModal">
            <SeatMap
              :puestos="vehiculoModal.puestos || []"
              :capacidad="Number(vehiculoModal.capacidad || 20)"
              :puestosOcupados="puestosOcupadosModal"
              :puestosPendientes="puestosPendientesModal"
              :selectable="false"
              :conductor="vehiculoModal.conductor"
            />
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md bg-grey-1">
            <q-btn flat label="Cerrar" color="grey-8" v-close-popup no-caps />
            <q-btn
              color="primary"
              icon="add_shopping_cart"
              label="Vender para este Viaje"
              :to="{ path: '/ventas/nueva', query: { viajeId: viajeSeleccionadoModal?.id || viajeSeleccionadoModal?._id } }"
              no-caps
              unelevated
              class="text-weight-bold"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useViajeStore } from '../stores/viajeStore'
import { useVehiculoStore } from '../stores/vehiculoStore'
import { useVentaStore } from '../stores/ventaStore'
import SeatMap from '../components/SeatMap.vue'

const viajeStore = useViajeStore()
const vehiculoStore = useVehiculoStore()
const ventaStore = useVentaStore()

const vistaModo = ref('cards')
const filtroTexto = ref('')
const filtroEstado = ref('Todos')
const estadosFiltro = ['Todos', 'Disponible', 'Programado', 'Completo']

const modalMapaVisible = ref(false)
const viajeSeleccionadoModal = ref(null)

onMounted(async () => {
  await Promise.allSettled([
    viajeStore.cargarViajes(),
    vehiculoStore.cargarVehiculos(),
    ventaStore.cargarVentas()
  ])
})

const viajes = computed(() => viajeStore.viajes)

const viajesActivos = computed(() => {
  return viajes.value.filter(v => v.estado !== 'Cancelado' && v.estado !== 'Finalizado')
})

const viajesFiltrados = computed(() => {
  return viajes.value.filter(v => {
    if (filtroEstado.value !== 'Todos' && v.estado !== filtroEstado.value) {
      return false
    }
    if (!filtroTexto.value) return true
    const term = filtroTexto.value.toLowerCase().trim()
    const veh = getVehiculo(v.vehiculoId)
    const placa = veh?.placa?.toLowerCase() || ''
    const conductor = veh?.conductor?.toLowerCase() || ''
    return (
      (v.codigo && v.codigo.toLowerCase().includes(term)) ||
      (v.origen && v.origen.toLowerCase().includes(term)) ||
      (v.destino && v.destino.toLowerCase().includes(term)) ||
      placa.includes(term) ||
      conductor.includes(term)
    )
  })
})

const totalPuestosDisponibles = computed(() => {
  return viajesActivos.value.reduce((acc, v) => acc + getDisponibles(v), 0)
})

const totalPuestosOcupados = computed(() => {
  return viajesActivos.value.reduce((acc, v) => acc + getOcupados(v), 0)
})

const tarifaPromedio = computed(() => {
  if (viajesActivos.value.length === 0) return 0
  const suma = viajesActivos.value.reduce((acc, v) => acc + (Number(v.precio) || 0), 0)
  return Math.round(suma / viajesActivos.value.length)
})

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'ruta', label: 'Ruta', field: 'origen', align: 'left' },
  { name: 'horario', label: 'Horario', field: 'fecha', align: 'left', sortable: true },
  { name: 'vehiculo', label: 'Vehículo / Conductor', field: 'vehiculoId', align: 'left' },
  { name: 'disponibilidad', label: 'Puestos', field: 'id', align: 'center' },
  { name: 'precio', label: 'Tarifa', field: 'precio', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: '', align: 'right' }
]

function getVehiculo(id) {
  if (!id) return null
  return vehiculoStore.obtenerVehiculo(id)
}

function getOcupados(viaje) {
  const vId = viaje.id || viaje._id
  return ventaStore.puestosOcupadosPorViaje(vId).length
}

function getDisponibles(viaje) {
  const vId = viaje.vehiculoId || (viaje.bus?._id || viaje.bus)
  const veh = getVehiculo(vId)
  if (!veh) return 0
  const ocupados = getOcupados(viaje)
  return Math.max(0, veh.capacidad - ocupados)
}

function getPorcentajeOcupacion(viaje) {
  const vId = viaje.vehiculoId || (viaje.bus?._id || viaje.bus)
  const veh = getVehiculo(vId)
  if (!veh || !veh.capacidad) return 0
  const ocupados = getOcupados(viaje)
  return Math.min(1, ocupados / veh.capacidad)
}

function limpiarFiltros() {
  filtroTexto.value = ''
  filtroEstado.value = 'Todos'
}

const vehiculoModal = computed(() => {
  if (!viajeSeleccionadoModal.value) return null
  const vId = viajeSeleccionadoModal.value.vehiculoId || (viajeSeleccionadoModal.value.bus?._id || viajeSeleccionadoModal.value.bus)
  return getVehiculo(vId)
})

const puestosOcupadosModal = computed(() => {
  if (!viajeSeleccionadoModal.value) return []
  return ventaStore.puestosOcupadosPorViaje(viajeSeleccionadoModal.value.id || viajeSeleccionadoModal.value._id)
})

const puestosPendientesModal = computed(() => {
  if (!viajeSeleccionadoModal.value) return []
  return ventaStore.puestosPendientesPorViaje(viajeSeleccionadoModal.value.id || viajeSeleccionadoModal.value._id)
})

function abrirVistaMapa(viaje) {
  viajeSeleccionadoModal.value = viaje
  modalMapaVisible.value = true
}
</script>

<style scoped>
.trip-card-container {
  height: 100%;
  transition: all 0.2s ease;
}

.trip-card-container:hover {
  transform: translateY(-3px);
}

.trip-code-badge {
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  background: #F4F4F5;
  color: #18181B;
  border: 1px solid #E4E4E7;
  padding: 3px 8px;
  border-radius: 6px;
}

.route-node {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #EFF6FF;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.meta-info-box {
  background: #F8F9FA;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #E4E4E7;
}

.vehicle-info-bar {
  background: #FAFAFA;
  border-radius: 8px;
  border: 1px solid #E4E4E7;
}

.filter-btn-active {
  background: #18181B !important;
  color: #FFFFFF !important;
  border-radius: 6px;
  font-weight: 600;
}

.filter-btn-inactive {
  background: #F4F4F5 !important;
  color: #52525B !important;
  border-radius: 6px;
}

.border-bottom-subtle {
  border-bottom: 1px solid #E4E4E7;
}
</style>
