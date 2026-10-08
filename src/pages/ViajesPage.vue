<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="q-mx-auto" style="max-width: 1200px;">
      
      <!-- HERO HEADER PREMIUM -->
      <div class="premium-header q-pa-lg rounded-borders-lg q-mb-lg text-white">
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-md-8">
            <div class="row items-center q-gutter-x-sm q-mb-xs">
              <q-badge color="amber-5" text-color="dark" class="text-weight-bolder text-caption q-px-sm">
                <q-icon name="fiber_manual_record" size="10px" class="q-mr-xs text-positive animate-pulse" />
                OPERACIÓN EN VIVO
              </q-badge>
              <span class="text-caption text-blue-2">Terminal de Despacho VIABUS</span>
            </div>
            <div class="text-h4 text-weight-bolder tracking-tight">
              Gestión de Viajes & Despacho
            </div>
            <div class="text-subtitle2 text-blue-1 q-mt-xs font-regular">
              Monitorea rutas, disponibilidad de puestos en tiempo real y asigna tiquetes al instante.
            </div>
          </div>
          
          <div class="col-12 col-md-4 text-right">
            <q-btn
              color="white"
              text-color="primary"
              icon="add"
              label="Programar Nuevo Viaje"
              to="/viajes/crear"
              no-caps
              unelevated
              class="text-weight-bold btn-glow q-py-sm q-px-md"
            />
          </div>
        </div>

        <!-- KPI METRICS STATS BAR -->
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-6 col-sm-3">
            <div class="kpi-mini-card">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-blue-2">Viajes Activos</div>
                  <div class="text-h5 text-weight-bolder">{{ viajesActivos.length }}</div>
                </div>
                <q-avatar size="36px" color="white" text-color="primary" icon="route" class="shadow-1" />
              </div>
            </div>
          </div>

          <div class="col-6 col-sm-3">
            <div class="kpi-mini-card">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-blue-2">Puestos Disponibles</div>
                  <div class="text-h5 text-weight-bolder text-positive">{{ totalPuestosDisponibles }}</div>
                </div>
                <q-avatar size="36px" color="green-1" text-color="positive" icon="event_seat" class="shadow-1" />
              </div>
            </div>
          </div>

          <div class="col-6 col-sm-3">
            <div class="kpi-mini-card">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-blue-2">Pasajeros Confirmados</div>
                  <div class="text-h5 text-weight-bolder text-amber-3">{{ totalPuestosOcupados }}</div>
                </div>
                <q-avatar size="36px" color="amber-1" text-color="warning" icon="people" class="shadow-1" />
              </div>
            </div>
          </div>

          <div class="col-6 col-sm-3">
            <div class="kpi-mini-card">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-blue-2">Tarifa Promedio</div>
                  <div class="text-h5 text-weight-bolder">${{ tarifaPromedio.toLocaleString('es-CO') }}</div>
                </div>
                <q-avatar size="36px" color="blue-1" text-color="primary" icon="payments" class="shadow-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BARRA DE HERRAMIENTAS: BÚSQUEDA Y FILTROS -->
      <q-card flat bordered class="q-pa-md q-mb-lg rounded-borders-md bg-white shadow-sm">
        <div class="row items-center justify-between q-col-gutter-sm">
          <!-- Búsqueda rápida -->
          <div class="col-12 col-md-5">
            <q-input
              v-model="filtroTexto"
              outlined
              dense
              placeholder="Buscar por origen, destino, código, placa o conductor..."
              clearable
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
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
                rounded
                no-caps
                :color="filtroEstado === st ? 'primary' : 'grey-3'"
                :text-color="filtroEstado === st ? 'white' : 'grey-8'"
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
              push
              rounded
              dense
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
      <div v-if="viajesFiltrados.length === 0" class="text-center q-pa-xl bg-white rounded-borders-md border-dashed">
        <q-icon name="alt_route" size="56px" color="grey-5" />
        <div class="text-h6 text-grey-8 q-mt-md">No se encontraron viajes</div>
        <div class="text-caption text-grey-6 q-mb-md">
          Intente ajustar el término de búsqueda o cambie el filtro de estado.
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

      <!-- VISTA EN TARJETAS (PREMIUM GRID) -->
      <div v-else-if="vistaModo === 'cards'" class="row q-col-gutter-lg">
        <div
          v-for="viaje in viajesFiltrados"
          :key="viaje.id || viaje._id"
          class="col-12 col-md-6 col-lg-4"
        >
          <q-card flat bordered class="trip-card column justify-between">
            <div>
              <!-- Cabecera de la Tarjeta -->
              <div class="trip-card-header q-pa-md row items-center justify-between">
                <div class="row items-center q-gutter-x-xs">
                  <q-badge color="blue-1" text-color="primary" class="text-weight-bold font-mono text-subtitle2 q-px-sm">
                    {{ viaje.codigo }}
                  </q-badge>
                  <q-badge :color="colorEstado(viaje.estado)" class="text-weight-medium">
                    {{ viaje.estado }}
                  </q-badge>
                </div>
                <div class="text-h6 text-weight-bolder text-primary">
                  ${{ viaje.precio.toLocaleString('es-CO') }}
                </div>
              </div>

              <q-separator />

              <!-- Itinerario de Ruta -->
              <div class="q-pa-md">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="col-5 text-left">
                    <div class="text-caption text-grey-6">Origen</div>
                    <div class="text-subtitle1 text-weight-bold text-grey-9 ellipsis">{{ viaje.origen }}</div>
                  </div>
                  <div class="col-2 text-center">
                    <div class="route-icon-box">
                      <q-icon name="directions_bus" color="primary" size="18px" />
                    </div>
                  </div>
                  <div class="col-5 text-right">
                    <div class="text-caption text-grey-6">Destino</div>
                    <div class="text-subtitle1 text-weight-bold text-grey-9 ellipsis">{{ viaje.destino }}</div>
                  </div>
                </div>

                <!-- Detalles Horarios -->
                <div class="row q-col-gutter-xs q-my-xs text-caption">
                  <div class="col-6">
                    <div class="bg-grey-1 q-pa-xs rounded-borders row items-center">
                      <q-icon name="event" size="16px" color="grey-7" class="q-mr-xs" />
                      <span class="text-weight-medium">{{ viaje.fecha }}</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="bg-grey-1 q-pa-xs rounded-borders row items-center">
                      <q-icon name="schedule" size="16px" color="grey-7" class="q-mr-xs" />
                      <span class="text-weight-bold text-primary">{{ viaje.hora }}</span>
                    </div>
                  </div>
                </div>

                <!-- Información del Vehículo & Conductor -->
                <div class="bg-blue-0 q-pa-sm rounded-borders q-mt-sm">
                  <div class="row items-center justify-between text-caption">
                    <div class="row items-center q-gutter-x-xs">
                      <q-icon name="commute" size="16px" color="primary" />
                      <span class="text-weight-bold text-grey-9">{{ getVehiculo(viaje.vehiculoId)?.placa || 'Placa N/A' }}</span>
                      <span class="text-grey-6">({{ getVehiculo(viaje.vehiculoId)?.tipo || 'Bus' }})</span>
                    </div>
                    <div class="text-grey-7 ellipsis" style="max-width: 140px;" :title="getVehiculo(viaje.vehiculoId)?.conductor">
                      <q-icon name="person" size="14px" /> {{ getVehiculo(viaje.vehiculoId)?.conductor || 'Conductor asignado' }}
                    </div>
                  </div>
                </div>

                <!-- Barra de Ocupación de Asientos -->
                <div class="q-mt-md">
                  <div class="row items-center justify-between text-caption q-mb-xs">
                    <span class="text-weight-bold text-grey-8">Ocupación del Bus</span>
                    <span>
                      <strong class="text-positive">{{ getDisponibles(viaje) }} disponibles</strong>
                      <span class="text-grey-5 q-mx-xs">/</span>
                      <strong class="text-negative">{{ getOcupados(viaje) }} ocupados</strong>
                    </span>
                  </div>
                  <q-linear-progress
                    :value="getPorcentajeOcupacion(viaje)"
                    rounded
                    size="8px"
                    :color="getPorcentajeOcupacion(viaje) > 0.85 ? 'negative' : (getPorcentajeOcupacion(viaje) > 0.5 ? 'warning' : 'positive')"
                    track-color="grey-3"
                  />
                </div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div>
              <q-separator />
              <div class="q-pa-md bg-grey-0 row items-center justify-between q-gutter-x-sm">
                <!-- Botón Mapa -->
                <q-btn
                  flat
                  dense
                  color="grey-8"
                  icon="visibility"
                  label="Ver Mapa"
                  @click="abrirVistaMapa(viaje)"
                  no-caps
                  class="q-px-sm"
                />

                <!-- Botón Vender que redirige DIRECTO a este viaje y bus -->
                <q-btn
                  color="primary"
                  icon="add_shopping_cart"
                  label="Vender Tiquete"
                  :to="{ path: '/ventas/nueva', query: { viajeId: viaje.id || viaje._id } }"
                  no-caps
                  unelevated
                  class="text-weight-bold btn-action-sell"
                />
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- VISTA EN TABLA EJECUTIVA -->
      <q-card v-else flat bordered class="rounded-borders-md bg-white shadow-sm overflow-hidden">
        <q-table
          flat
          :rows="viajesFiltrados"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="No hay viajes registrados"
        >
          <template v-slot:body-cell-codigo="props">
            <q-td :props="props">
              <q-badge color="blue-1" text-color="primary" class="text-weight-bold font-mono">
                {{ props.row.codigo }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-ruta="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-xs">
                <span class="text-weight-bold text-grey-9">{{ props.row.origen }}</span>
                <q-icon name="arrow_forward" size="14px" color="primary" />
                <span class="text-weight-bold text-grey-9">{{ props.row.destino }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-horario="props">
            <q-td :props="props">
              <div class="text-caption">
                <div class="text-weight-medium">{{ props.row.fecha }}</div>
                <div class="text-primary text-weight-bold">{{ props.row.hora }}</div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-vehiculo="props">
            <q-td :props="props">
              <div>
                <span class="text-weight-bold text-primary">{{ getVehiculo(props.row.vehiculoId)?.placa || '—' }}</span>
                <span class="text-caption text-grey-6 q-ml-xs">({{ getVehiculo(props.row.vehiculoId)?.tipo }})</span>
                <div class="text-caption text-grey-7">{{ getVehiculo(props.row.vehiculoId)?.conductor }}</div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-disponibilidad="props">
            <q-td :props="props" style="min-width: 160px;">
              <div class="row items-center justify-between text-caption q-mb-xs">
                <q-badge color="positive" dense class="text-weight-bold">
                  {{ getDisponibles(props.row) }} disp.
                </q-badge>
                <q-badge color="negative" dense>
                  {{ getOcupados(props.row) }} ocup.
                </q-badge>
              </div>
              <q-linear-progress
                :value="getPorcentajeOcupacion(props.row)"
                rounded
                size="6px"
                :color="getPorcentajeOcupacion(props.row) > 0.85 ? 'negative' : 'positive'"
                track-color="grey-3"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-precio="props">
            <q-td :props="props">
              <span class="text-weight-bolder text-primary text-subtitle2">
                ${{ props.row.precio.toLocaleString('es-CO') }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge :color="colorEstado(props.row.estado)" class="q-py-xs q-px-sm">
                {{ props.row.estado }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <div class="row q-gutter-x-xs justify-center">
                <q-btn
                  flat
                  round
                  dense
                  color="grey-7"
                  icon="visibility"
                  @click="abrirVistaMapa(props.row)"
                  title="Ver mapa de asientos"
                />
                <!-- Botón Vender con Redirección Directa al Viaje -->
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
      <q-dialog v-model="modalMapaVisible" maximized-mobile>
        <q-card style="width: 700px; max-width: 95vw;" class="rounded-borders-lg">
          <q-card-section class="bg-primary text-white row items-center justify-between q-pa-md">
            <div>
              <div class="text-subtitle1 text-weight-bold">
                Mapa de Asientos en Vivo
              </div>
              <div class="text-caption text-blue-2" v-if="viajeSeleccionadoModal">
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

const vistaModo = ref('cards') // 'cards' o 'table'
const filtroTexto = ref('')
const filtroEstado = ref('Todos')
const estadosFiltro = ['Todos', 'Disponible', 'Programado', 'Completo']

// Estado para el modal de vista de mapa
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
    // Filtro por estado
    if (filtroEstado.value !== 'Todos' && v.estado !== filtroEstado.value) {
      return false
    }
    // Filtro por texto
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

// Cálculos para KPIs
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
  { name: 'disponibilidad', label: 'Capacidad & Puestos', field: 'id', align: 'center' },
  { name: 'precio', label: 'Tarifa', field: 'precio', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
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

function colorEstado(estado) {
  const map = {
    'Programado': 'info',
    'Disponible': 'positive',
    'Completo': 'negative',
    'Finalizado': 'grey-7',
    'Cancelado': 'warning'
  }
  return map[estado] || 'grey'
}

function limpiarFiltros() {
  filtroTexto.value = ''
  filtroEstado.value = 'Todos'
}

// Modal mapa
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
.premium-header {
  background: linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #1565c0 100%);
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(25, 118, 210, 0.35);
  position: relative;
  overflow: hidden;
}

.kpi-mini-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  transition: transform 0.2s ease, background 0.2s ease;
}

.kpi-mini-card:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
}

.btn-glow {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.btn-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

.trip-card {
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  transition: all 0.25s ease;
  height: 100%;
}

.trip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.12);
  border-color: #90caf9;
}

.trip-card-header {
  background: #fafbfc;
}

.route-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e3f2fd;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-0 {
  background: #f0f7ff;
}

.btn-action-sell {
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transition: all 0.2s ease;
}

.btn-action-sell:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(25, 118, 210, 0.45);
}

.rounded-borders-lg {
  border-radius: 16px;
}

.rounded-borders-md {
  border-radius: 12px;
}

.border-dashed {
  border: 2px dashed #cbd5e1;
}

.font-mono {
  font-family: monospace;
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}
</style>
