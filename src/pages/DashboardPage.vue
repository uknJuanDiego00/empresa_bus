<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1240px;">
      <!-- CABECERA DASHBOARD -->
      <div class="row items-center justify-between q-mb-xl">
        <div>
<<<<<<< HEAD
          <div class="text-h4 text-weight-bold text-dark q-mb-xs">Dashboard</div>
          <div class="text-subtitle2 text-grey-7">Resumen general de la operación</div>
=======
          <div class="text-h4 text-weight-bold q-mb-xs" style="color: var(--vb-text-primary);">Dashboard</div>
          <div class="text-subtitle2" style="color: var(--vb-text-secondary);">Resumen general de la operación</div>
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
        </div>
        <div>
          <q-btn
            color="primary"
            icon="add_shopping_cart"
            label="Nueva Venta"
            to="/ventas/nueva"
            no-caps
            unelevated
            class="q-px-lg q-py-sm text-weight-bold btn-primary-elevated"
          />
        </div>
      </div>

      <!-- TARJETAS DE ESTADÍSTICAS (KPIs) -->
      <div class="row q-col-gutter-md q-mb-xl">
        <!-- 1. Vehículos -->
        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <div class="stat-card">
            <div class="row items-center justify-between no-wrap q-mb-sm">
              <span class="stat-card-label">Vehículos</span>
              <div class="stat-icon-wrapper">
                <q-icon name="directions_bus" size="20px" />
              </div>
            </div>
            <div class="stat-card-value">{{ vehiculos.length }}</div>
            <div class="stat-card-sub">
              <q-icon name="check_circle" size="14px" color="positive" />
              <span>Flota activa</span>
            </div>
          </div>
        </div>

        <!-- 2. Clientes -->
        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <div class="stat-card">
            <div class="row items-center justify-between no-wrap q-mb-sm">
              <span class="stat-card-label">Clientes</span>
              <div class="stat-icon-wrapper">
                <q-icon name="groups" size="20px" />
              </div>
            </div>
            <div class="stat-card-value">{{ clientes.length }}</div>
            <div class="stat-card-sub">
              <q-icon name="person" size="14px" color="grey-6" />
              <span>Pasajeros</span>
            </div>
          </div>
        </div>

        <!-- 3. Viajes -->
        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <div class="stat-card">
            <div class="row items-center justify-between no-wrap q-mb-sm">
              <span class="stat-card-label">Viajes</span>
              <div class="stat-icon-wrapper">
                <q-icon name="route" size="20px" />
              </div>
            </div>
            <div class="stat-card-value">{{ viajes.length }}</div>
            <div class="stat-card-sub">
              <q-icon name="schedule" size="14px" color="info" />
              <span>Programados</span>
            </div>
          </div>
        </div>

        <!-- 4. Ventas -->
        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <div class="stat-card">
            <div class="row items-center justify-between no-wrap q-mb-sm">
              <span class="stat-card-label">Ventas</span>
              <div class="stat-icon-wrapper">
                <q-icon name="receipt_long" size="20px" />
              </div>
            </div>
            <div class="stat-card-value">{{ ventas.length }}</div>
            <div class="stat-card-sub">
              <q-icon name="confirmation_number" size="14px" color="primary" />
              <span>Tiquetes</span>
            </div>
          </div>
        </div>

        <!-- 5. Ocupados -->
        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <div class="stat-card">
            <div class="row items-center justify-between no-wrap q-mb-sm">
              <span class="stat-card-label">Ocupados</span>
              <div class="stat-icon-wrapper">
                <q-icon name="event_seat" size="20px" />
              </div>
            </div>
            <div class="stat-card-value">{{ totalAsientosOcupados }}</div>
            <div class="stat-card-sub">
              <q-icon name="chair" size="14px" color="warning" />
              <span>Puestos reservados</span>
            </div>
          </div>
        </div>

        <!-- 6. Ingresos -->
        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <div class="stat-card">
            <div class="row items-center justify-between no-wrap q-mb-sm">
              <span class="stat-card-label">Ingresos</span>
              <div class="stat-icon-wrapper">
                <q-icon name="payments" size="20px" />
              </div>
            </div>
            <div class="stat-card-value text-primary" style="font-size: 22px;">
              ${{ formatPrecio(totalIngresos) }}
            </div>
            <div class="stat-card-sub">
              <q-icon name="trending_up" size="14px" color="positive" />
              <span>Recaudo total</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN OPERATIVA: PRÓXIMOS VIAJES & ACCESOS RÁPIDOS -->
      <div class="row q-col-gutter-xl">
        <!-- Columna Izquierda: Próximos Viajes -->
        <div class="col-12 col-lg-8">
          <q-card flat class="vb-card overflow-hidden">
<<<<<<< HEAD
            <q-card-section class="row items-center justify-between q-px-lg q-py-md bg-white border-bottom-subtle">
              <div>
                <div class="text-subtitle1 text-weight-bold text-dark">Próximos Viajes Programados</div>
                <div class="text-caption text-grey-6">Itinerarios activos en despacho con estimación de ruta</div>
=======
            <q-card-section class="row items-center justify-between q-px-lg q-py-md border-bottom-subtle">
              <div>
                <div class="text-subtitle1 text-weight-bold" style="color: var(--vb-text-primary);">Próximos Viajes Programados</div>
                <div class="text-caption" style="color: var(--vb-text-secondary);">Itinerarios activos en despacho con estimación de ruta</div>
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
              </div>
              <q-btn flat dense color="primary" label="Ver todos los viajes" to="/viajes" icon-right="chevron_right" no-caps class="text-weight-bold" />
            </q-card-section>

            <q-card-section class="q-pa-none">
              <div v-if="viajesProximos.length === 0" class="empty-state-box q-my-md q-mx-md">
                <div class="empty-state-icon">
                  <q-icon name="route" size="28px" />
                </div>
                <div class="empty-state-title">No hay viajes programados</div>
                <div class="empty-state-desc">Cuando crees un nuevo itinerario aparecerá listado aquí.</div>
                <q-btn color="primary" unelevated icon="add" label="Programar Viaje" to="/viajes/crear" no-caps />
              </div>

              <q-table
                v-else
                flat
                :rows="viajesProximos"
                :columns="columnsViajes"
                row-key="id"
                hide-pagination
                :rows-per-page-options="[5]"
                class="no-border"
              >
                <!-- Celda Ruta con Duración y Distancia -->
                <template v-slot:body-cell-ruta="props">
                  <q-td :props="props">
                    <div class="row items-center q-gutter-x-xs no-wrap">
<<<<<<< HEAD
                      <span class="text-weight-bold text-dark">{{ props.row.origen }}</span>
                      <q-icon name="arrow_forward" size="13px" class="q-mx-xs text-grey-5" />
                      <span class="text-weight-bold text-dark">{{ props.row.destino }}</span>
                    </div>
                    <div class="text-caption text-grey-6 row items-center q-gutter-x-xs q-mt-xs">
=======
                      <span class="text-weight-bold" style="color: var(--vb-text-primary);">{{ props.row.origen }}</span>
                      <q-icon name="arrow_forward" size="13px" class="q-mx-xs text-grey-5" />
                      <span class="text-weight-bold" style="color: var(--vb-text-primary);">{{ props.row.destino }}</span>
                    </div>
                    <div class="text-caption row items-center q-gutter-x-xs q-mt-xs" style="color: var(--vb-text-secondary);">
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
                      <q-icon name="schedule" size="12px" color="primary" />
                      <span>{{ getRutaInfo(props.row).duracionTexto }}</span>
                      <span>•</span>
                      <span>{{ getRutaInfo(props.row).distanciaTexto }}</span>
                    </div>
                  </q-td>
                </template>

                <!-- Celda Horario -->
                <template v-slot:body-cell-horario="props">
                  <q-td :props="props">
                    <div class="text-caption">
<<<<<<< HEAD
                      <span class="text-grey-8">{{ props.row.fecha }}</span>
=======
                      <span style="color: var(--vb-text-primary);">{{ props.row.fecha }}</span>
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
                      <span class="text-grey-5 q-mx-xs">•</span>
                      <span class="text-weight-bold text-primary">{{ props.row.hora }}</span>
                    </div>
                  </q-td>
                </template>

                <!-- Celda Disponibilidad -->
                <template v-slot:body-cell-disponibilidad="props">
                  <q-td :props="props">
                    <q-badge color="grey-2" text-color="grey-9" class="text-weight-medium">
                      <q-icon name="event_seat" size="12px" class="q-mr-xs text-positive" />
                      {{ getDisponibles(props.row) }} disponibles
                    </q-badge>
                  </q-td>
                </template>

                <!-- Celda Tarifa -->
                <template v-slot:body-cell-precio="props">
                  <q-td :props="props">
<<<<<<< HEAD
                    <span class="text-weight-bold text-dark">${{ formatPrecio(props.row.precio) }}</span>
=======
                    <span class="text-weight-bold" style="color: var(--vb-text-primary);">${{ formatPrecio(props.row.precio) }}</span>
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
                  </q-td>
                </template>

                <!-- Celda Estado -->
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
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="add_shopping_cart"
                      :to="{ path: '/ventas/nueva', query: { viajeId: props.row.id || props.row._id } }"
                    >
                      <q-tooltip>Vender tiquete para este viaje</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>

        <!-- Columna Derecha: Accesos Rápidos -->
        <div class="col-12 col-lg-4">
          <q-card flat class="vb-card">
            <q-card-section class="q-px-lg q-py-md border-bottom-subtle">
<<<<<<< HEAD
              <div class="text-subtitle1 text-weight-bold text-dark">Accesos Rápidos</div>
              <div class="text-caption text-grey-6">Operaciones directas del sistema</div>
=======
              <div class="text-subtitle1 text-weight-bold" style="color: var(--vb-text-primary);">Accesos Rápidos</div>
              <div class="text-caption" style="color: var(--vb-text-secondary);">Operaciones directas del sistema</div>
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
            </q-card-section>

            <q-card-section class="q-pa-md">
              <div class="column q-gutter-y-sm">
                <!-- Venta de Tiquete -->
                <router-link to="/ventas/nueva" class="quick-action-item">
                  <div class="quick-action-icon bg-primary-light text-primary">
                    <q-icon name="add_shopping_cart" size="20px" />
                  </div>
                  <div class="quick-action-content">
                    <div class="quick-action-title">Venta de Tiquete</div>
                    <div class="quick-action-sub">Reserva de asiento y facturación</div>
                  </div>
                  <q-icon name="chevron_right" size="18px" class="text-grey-4 action-arrow" />
                </router-link>

                <!-- Programar Viaje -->
                <router-link to="/viajes/crear" class="quick-action-item">
                  <div class="quick-action-icon bg-neutral-light text-grey-9">
                    <q-icon name="route" size="20px" />
                  </div>
                  <div class="quick-action-content">
                    <div class="quick-action-title">Programar Viaje</div>
                    <div class="quick-action-sub">Nueva ruta, horario y tarifa</div>
                  </div>
                  <q-icon name="chevron_right" size="18px" class="text-grey-4 action-arrow" />
                </router-link>

                <!-- Registrar Vehículo -->
                <router-link to="/vehiculos/registrar" class="quick-action-item">
                  <div class="quick-action-icon bg-neutral-light text-grey-9">
                    <q-icon name="directions_bus" size="20px" />
                  </div>
                  <div class="quick-action-content">
                    <div class="quick-action-title">Registrar Vehículo</div>
                    <div class="quick-action-sub">Ingreso de unidad a la flota</div>
                  </div>
                  <q-icon name="chevron_right" size="18px" class="text-grey-4 action-arrow" />
                </router-link>

                <!-- Registrar Cliente -->
                <router-link to="/clientes/registrar" class="quick-action-item">
                  <div class="quick-action-icon bg-neutral-light text-grey-9">
                    <q-icon name="person_add" size="20px" />
                  </div>
                  <div class="quick-action-content">
                    <div class="quick-action-title">Registrar Cliente</div>
                    <div class="quick-action-sub">Nuevo pasajero en base de datos</div>
                  </div>
                  <q-icon name="chevron_right" size="18px" class="text-grey-4 action-arrow" />
                </router-link>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useVehiculoStore } from '../stores/vehiculoStore'
import { useClienteStore } from '../stores/clienteStore'
import { useViajeStore } from '../stores/viajeStore'
import { useVentaStore } from '../stores/ventaStore'
import { estimarRutaViaje } from '../utils/distanceCalculator'

const vehiculoStore = useVehiculoStore()
const clienteStore = useClienteStore()
const viajeStore = useViajeStore()
const ventaStore = useVentaStore()

onMounted(async () => {
  await Promise.allSettled([
    vehiculoStore.cargarVehiculos(),
    clienteStore.cargarClientes(),
    viajeStore.cargarViajes(),
    ventaStore.cargarVentas()
  ])
})

const vehiculos = computed(() => vehiculoStore.vehiculos)
const clientes = computed(() => clienteStore.clientes)
const viajes = computed(() => viajeStore.viajes)
const ventas = computed(() => ventaStore.ventas)
const totalIngresos = computed(() => ventaStore.totalIngresos)

const totalAsientosOcupados = computed(() => {
  return ventas.value.length
})

const viajesProximos = computed(() =>
  viajes.value.filter(v => v.estado !== 'Cancelado' && v.estado !== 'Finalizado').slice(0, 5)
)

const columnsViajes = [
  { name: 'ruta', label: 'Ruta & Duración', field: 'origen', align: 'left' },
  { name: 'horario', label: 'Horario', field: 'fecha', align: 'left' },
  { name: 'disponibilidad', label: 'Disponibilidad', field: 'id', align: 'center' },
  { name: 'precio', label: 'Tarifa', field: 'precio', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: '', align: 'right' }
]

function getRutaInfo(viaje) {
  if (!viaje) return { distanciaKm: 0, distanciaTexto: '—', duracionTexto: '—', duracionMinutos: 0 }
  return estimarRutaViaje(viaje.origen, viaje.destino)
}

function getDisponibles(viaje) {
  const vId = viaje.vehiculoId || (viaje.bus?._id || viaje.bus)
  const v = vehiculoStore.obtenerVehiculo(vId)
  if (!v) return 0
  const ocupados = ventaStore.puestosOcupadosPorViaje(viaje.id || viaje._id).length
  return Math.max(0, v.capacidad - ocupados)
}

function formatPrecio(val) {
  return val ? Number(val).toLocaleString('es-CO') : '0'
}
</script>

<style scoped>
.btn-primary-elevated {
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  border-radius: 10px;
}

.border-bottom-subtle {
<<<<<<< HEAD
  border-bottom: 1px solid #E4E4E7;
=======
  border-bottom: 1px solid var(--vb-border-light);
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
}

.quick-action-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-radius: 10px;
  text-decoration: none;
<<<<<<< HEAD
  background: #FAFAFA;
  border: 1px solid #E4E4E7;
=======
  background: var(--vb-bg-surface);
  border: 1px solid var(--vb-border);
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
  transition: all 0.2s ease;
}

.quick-action-item:hover {
<<<<<<< HEAD
  background: #FFFFFF;
  border-color: #D4D4D8;
  transform: translateX(3px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.quick-action-item:hover .action-arrow {
  color: #2563EB !important;
=======
  background: var(--vb-bg-surface-hover);
  border-color: var(--vb-primary);
  transform: translateX(3px);
  box-shadow: var(--vb-shadow-sm);
}

.quick-action-item:hover .action-arrow {
  color: var(--vb-primary) !important;
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
  transform: translateX(2px);
}

.quick-action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
}

.bg-primary-light {
<<<<<<< HEAD
  background-color: #EFF6FF;
}

.bg-neutral-light {
  background-color: #F4F4F5;
=======
  background-color: var(--vb-primary-soft);
}

.bg-neutral-light {
  background-color: var(--vb-bg-elevated);
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
}

.quick-action-content {
  flex: 1;
}

.quick-action-title {
  font-size: 13.5px;
  font-weight: 600;
<<<<<<< HEAD
  color: #18181B;
=======
  color: var(--vb-text-primary);
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
}

.quick-action-sub {
  font-size: 12px;
<<<<<<< HEAD
  color: #71717A;
=======
  color: var(--vb-text-secondary);
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
}

.action-arrow {
  transition: all 0.2s ease;
}
</style>
