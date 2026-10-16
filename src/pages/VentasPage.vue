<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 100%;">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">Ventas & Reservas</div>
          <div class="text-caption" style="color: var(--vb-text-secondary);">
            {{ obtenerVentas().length }} registros en total
          </div>
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            color="primary"
            icon="add_shopping_cart"
            label="Nueva Venta"
            to="/ventas/nueva"
            no-caps
            unelevated
          />
          <q-btn
            outline
            color="primary"
            icon="point_of_sale"
            label="Venta Manual"
            to="/ventas/manual"
            no-caps
          />
        </div>
      </div>

      <!-- Filtros por estado -->
      <div class="row q-gutter-sm items-center q-mb-md">
        <q-btn
          dense no-caps unelevated
          :color="filtroEstado === 'Todos' ? 'primary' : 'grey-3'"
          :text-color="filtroEstado === 'Todos' ? 'white' : 'grey-9'"
          :label="`Todos (${obtenerVentas().length})`"
          class="q-px-md text-weight-medium"
          @click="filtroEstado = 'Todos'"
        />
        <q-btn
          dense no-caps unelevated
          :color="filtroEstado === 'CONFIRMADO' ? 'positive' : 'grey-3'"
          :text-color="filtroEstado === 'CONFIRMADO' ? 'white' : 'grey-9'"
          :label="`Confirmados (${obtenerVentasConfirmadas().length})`"
          icon="check_circle"
          class="q-px-md text-weight-medium"
          @click="filtroEstado = 'CONFIRMADO'"
        />
        <q-btn
          dense no-caps unelevated
          :color="filtroEstado === 'CANCELADO' ? 'negative' : 'grey-3'"
          :text-color="filtroEstado === 'CANCELADO' ? 'white' : 'grey-9'"
          :label="`Cancelados (${obtenerVentasCanceladas().length})`"
          icon="cancel"
          class="q-px-md"
          @click="filtroEstado = 'CANCELADO'"
        />
      </div>

      <!-- Tabla compacta con 4 columnas principales -->
      <q-card flat bordered class="vb-card shadow-1 overflow-hidden">
        <div style="overflow-x: auto;">
          <q-table
            flat
            dense
            :rows="obtenerVentasFiltradas()"
            :columns="columns"
            row-key="id"
            :pagination="{ rowsPerPage: 10 }"
            no-data-label="No hay ventas con el filtro seleccionado"
            :loading="cargando"
            class="ventas-compact-table"
            style="width: 100%;"
          >
            <!-- Fecha Venta -->
            <template v-slot:body-cell-fechaVenta="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span class="text-caption text-grey-8" style="font-size: 0.76rem;">{{ props.row.fechaVenta || '—' }}</span>
              </q-td>
            </template>

            <!-- Pasajero -->
            <template v-slot:body-cell-cliente="props">
              <q-td :props="props">
                <div class="text-weight-bold text-caption ellipsis" style="max-width: 150px;">
                  {{ props.row.customerName || getCliente(props.row.clienteId)?.nombre || '—' }}
                  <q-tooltip>{{ props.row.customerName || getCliente(props.row.clienteId)?.nombre || '—' }}</q-tooltip>
                </div>
              </q-td>
            </template>

            <!-- Documento -->
            <template v-slot:body-cell-documento="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span class="font-mono text-caption text-grey-8" style="font-size: 0.76rem;">
                  {{ props.row.customerDoc || getCliente(props.row.clienteId)?.documento || '—' }}
                </span>
              </q-td>
            </template>

            <!-- Ruta -->
            <template v-slot:body-cell-ruta="props">
              <q-td :props="props">
                <div v-if="getViaje(props.row.viajeId)" class="text-caption ellipsis" style="max-width: 160px;">
                  <q-icon name="trip_origin" size="10px" color="positive" class="q-mr-xs" />
                  {{ getViaje(props.row.viajeId).origen }}
                  <q-icon name="arrow_forward" size="10px" class="q-mx-xs text-grey-6" />
                  {{ getViaje(props.row.viajeId).destino }}
                  <q-tooltip>{{ getViaje(props.row.viajeId).origen }} → {{ getViaje(props.row.viajeId).destino }}</q-tooltip>
                </div>
                <span v-else class="text-grey-5">—</span>
              </q-td>
            </template>

            <!-- N° Serie Bus -->
            <template v-slot:body-cell-numeroSerie="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span v-if="getBus(props.row.viajeId)?.numeroSerie" class="font-mono text-caption text-grey-8" style="font-size: 0.76rem;">
                  {{ getBus(props.row.viajeId).numeroSerie }}
                  <q-tooltip>Número de serie del bus</q-tooltip>
                </span>
                <span v-else class="text-grey-4 text-caption">—</span>
              </q-td>
            </template>

            <!-- Columna Detalles (lupa) -->
            <template v-slot:body-cell-detalles="props">
              <q-td :props="props" class="text-center" style="white-space: nowrap;">
                <q-btn
                  dense round flat color="primary" size="sm" icon="search"
                  @click="abrirDetalleVenta(props.row)"
                >
                  <q-tooltip>Ver todos los detalles</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card>
    </div>

    <!-- Modal de detalles de venta (lupa) -->
    <q-dialog v-model="dialogDetalle" transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 480px; max-width: 560px; border-radius: 16px; overflow: hidden;">
        <!-- Encabezado con gradiente -->
        <div class="detalle-modal-header q-pa-lg">
          <div class="row items-center no-wrap q-mb-xs">
            <q-icon name="receipt_long" size="26px" color="white" class="q-mr-sm" />
            <div>
              <div class="text-subtitle1 text-weight-bold text-white">Detalle de Venta</div>
              <div class="text-caption" style="color: rgba(255,255,255,0.75);">
                Tiquete: <strong>{{ ventaDetalle?.id || '—' }}</strong>
              </div>
            </div>
            <q-space />
            <q-btn flat round dense icon="close" color="white" @click="dialogDetalle = false" />
          </div>
        </div>

        <q-card-section class="q-pa-lg">
          <!-- Grid de información -->
          <div class="detalle-grid">

            <!-- ID Venta -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="tag" size="13px" class="q-mr-xs" />ID Venta</div>
              <div class="detalle-value">
                <q-badge color="grey-2" text-color="grey-8" class="text-weight-medium font-mono">
                  {{ ventaDetalle?.ventaId || '—' }}
                </q-badge>
              </div>
            </div>

            <!-- Tiquete -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="confirmation_number" size="13px" class="q-mr-xs" />Tiquete</div>
              <div class="detalle-value">
                <q-badge color="blue-1" text-color="primary" class="text-weight-bold font-mono">
                  {{ ventaDetalle?.id || '—' }}
                </q-badge>
              </div>
            </div>

            <!-- Fecha Venta -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="calendar_today" size="13px" class="q-mr-xs" />Fecha Venta</div>
              <div class="detalle-value text-grey-8">{{ ventaDetalle?.fechaVenta || '—' }}</div>
            </div>

            <!-- Pasajero -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="person" size="13px" class="q-mr-xs" />Pasajero</div>
              <div class="detalle-value text-weight-bold">
                {{ ventaDetalle?.customerName || getCliente(ventaDetalle?.clienteId)?.nombre || '—' }}
              </div>
            </div>

            <!-- Documento -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="badge" size="13px" class="q-mr-xs" />Documento</div>
              <div class="detalle-value font-mono text-grey-8">
                {{ ventaDetalle?.customerDoc || getCliente(ventaDetalle?.clienteId)?.documento || '—' }}
              </div>
            </div>

            <!-- Código Viaje -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="directions_bus" size="13px" class="q-mr-xs" />Código Viaje</div>
              <div class="detalle-value font-mono text-grey-8">
                {{ getViaje(ventaDetalle?.viajeId)?.codigo || '—' }}
              </div>
            </div>

            <!-- Ruta -->
            <div class="detalle-item detalle-item--full">
              <div class="detalle-label"><q-icon name="route" size="13px" class="q-mr-xs" />Ruta</div>
              <div class="detalle-value" v-if="getViaje(ventaDetalle?.viajeId)">
                <span class="text-positive text-weight-medium">{{ getViaje(ventaDetalle?.viajeId).origen }}</span>
                <q-icon name="arrow_forward" size="14px" class="q-mx-sm text-grey-5" />
                <span class="text-primary text-weight-medium">{{ getViaje(ventaDetalle?.viajeId).destino }}</span>
              </div>
              <div class="detalle-value text-grey-5" v-else>—</div>
            </div>

            <!-- Fecha y Hora Viaje -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="schedule" size="13px" class="q-mr-xs" />Fecha / Hora Viaje</div>
              <div class="detalle-value" v-if="getViaje(ventaDetalle?.viajeId)">
                {{ getViaje(ventaDetalle?.viajeId).fecha }}
                <span class="text-primary text-weight-bold q-ml-xs">{{ getViaje(ventaDetalle?.viajeId).hora }}</span>
              </div>
              <div class="detalle-value text-grey-5" v-else>—</div>
            </div>

            <!-- Bus -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="airport_shuttle" size="13px" class="q-mr-xs" />Bus (Placa)</div>
              <div class="detalle-value text-weight-medium">
                {{ getBus(ventaDetalle?.viajeId)?.placa || '—' }}
              </div>
            </div>

            <!-- Puesto -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="event_seat" size="13px" class="q-mr-xs" />Puesto</div>
              <div class="detalle-value">
                <q-badge color="blue-1" text-color="primary" class="text-weight-bold">
                  #{{ ventaDetalle?.puestoId || '—' }}
                </q-badge>
              </div>
            </div>

            <!-- Valor -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="attach_money" size="13px" class="q-mr-xs" />Valor</div>
              <div class="detalle-value text-weight-bolder text-positive" style="font-size: 1rem;">
                ${{ Number(ventaDetalle?.precio || 0).toLocaleString('es-CO') }}
              </div>
            </div>

            <!-- Método Pago -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="payments" size="13px" class="q-mr-xs" />Método de Pago</div>
              <div class="detalle-value">
                <q-chip dense size="sm" color="grey-2" text-color="grey-8" icon="payments">
                  {{ ventaDetalle?.metodoPago || 'Efectivo' }}
                </q-chip>
              </div>
            </div>

            <!-- Estado Pago -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="verified" size="13px" class="q-mr-xs" />Estado Pago</div>
              <div class="detalle-value">
                <q-badge v-if="ventaDetalle?.estado === 'CONFIRMADO'" color="positive" class="text-weight-bold">
                  <q-icon name="check_circle" size="11px" class="q-mr-xs" />Confirmado
                </q-badge>
                <q-badge v-else-if="ventaDetalle?.estado === 'CANCELADO'" color="negative" class="text-weight-bold">
                  <q-icon name="cancel" size="11px" class="q-mr-xs" />Cancelado
                </q-badge>
                <q-badge v-else color="grey-4" text-color="grey-8">{{ ventaDetalle?.estado || '—' }}</q-badge>
              </div>
            </div>

            <!-- Estado Devolución -->
            <div class="detalle-item">
              <div class="detalle-label"><q-icon name="undo" size="13px" class="q-mr-xs" />Estado Devolución</div>
              <div class="detalle-value">
                <q-badge
                  :color="getColorDevolucion(ventaDetalle?.estadoDevolucion)"
                  :text-color="getTextColorDevolucion(ventaDetalle?.estadoDevolucion)"
                  class="cursor-pointer"
                  @click="abrirModalDevolucion(ventaDetalle); dialogDetalle = false"
                >
                  {{ ventaDetalle?.estadoDevolucion || 'No solicitada' }}
                  <q-tooltip>Clic para gestionar devolución</q-tooltip>
                </q-badge>
              </div>
            </div>

          </div>
        </q-card-section>

        <!-- Acciones del modal -->
        <q-separator />
        <q-card-actions class="q-pa-md q-gutter-xs" align="right">
          <q-btn
            dense outline color="primary" size="sm" icon="receipt" no-caps
            :to="`/tickets/${ventaDetalle?.id}`"
            label="Ver Tiquete"
            @click="dialogDetalle = false"
          />
          <q-btn
            v-if="ventaDetalle?.estado === 'CONFIRMADO' && ventaDetalle?.estadoDevolucion === 'No solicitada'"
            dense outline color="warning" size="sm" icon="undo" no-caps
            label="Gestionar Devolución"
            @click="abrirModalDevolucion(ventaDetalle); dialogDetalle = false"
          />
          <q-btn
            v-if="ventaDetalle?.estado === 'CONFIRMADO'"
            dense outline color="negative" size="sm" icon="cancel" no-caps
            label="Cancelar Venta"
            @click="cancelarVenta(ventaDetalle); dialogDetalle = false"
            :loading="cargando"
          />
          <q-btn flat label="Cerrar" color="grey-7" @click="dialogDetalle = false" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de gestión de devolución -->
    <q-dialog v-model="dialogDevolucion" persistent>
      <q-card style="min-width: 420px;">
        <q-card-section class="bg-primary text-white">
          <div class="row items-center no-wrap">
            <q-icon name="undo" size="22px" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bold">Gestionar Devolución</div>
          </div>
          <div class="text-caption text-blue-2 q-mt-xs">
            Tiquete: {{ ventaEnDevolucion?.id }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="column q-gutter-sm text-body2 q-mb-md">
            <div class="row justify-between">
              <span class="text-grey-6">Pasajero:</span>
              <strong>{{ ventaEnDevolucion?.customerName || '—' }}</strong>
            </div>
            <div class="row justify-between">
              <span class="text-grey-6">Puesto:</span>
              <span>#{{ ventaEnDevolucion?.puestoId }}</span>
            </div>
            <div class="row justify-between">
              <span class="text-grey-6">Valor:</span>
              <strong class="text-positive">${{ Number(ventaEnDevolucion?.precio || 0).toLocaleString('es-CO') }}</strong>
            </div>
            <div class="row justify-between">
              <span class="text-grey-6">Estado actual:</span>
              <q-badge :color="getColorDevolucion(ventaEnDevolucion?.estadoDevolucion)" :text-color="getTextColorDevolucion(ventaEnDevolucion?.estadoDevolucion)">
                {{ ventaEnDevolucion?.estadoDevolucion || 'No solicitada' }}
              </q-badge>
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <q-select
            v-model="nuevoEstadoDevolucion"
            outlined
            dense
            :options="estadosDevolucion"
            label="Nuevo estado de devolución"
            class="q-mb-md"
          />

          <q-input
            v-model="notasDevolucion"
            outlined
            dense
            type="textarea"
            rows="2"
            label="Notas u observaciones (opcional)"
            placeholder="Ej. Cliente solicitó devolución por cancelación del viaje..."
          />

          <q-banner v-if="nuevoEstadoDevolucion === 'Devuelta'" class="bg-warning-soft text-dark q-mt-md rounded-borders" rounded>
            <q-icon name="info" color="warning" />
            <strong> Atención:</strong> Marcar como "Devuelta" cancelará el tiquete y liberará el asiento. Esta acción no tiene reversa automática.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" @click="dialogDevolucion = false" no-caps />
          <q-btn
            color="primary"
            label="Guardar cambio"
            @click="guardarDevolucion"
            no-caps
            unelevated
            :disabled="!nuevoEstadoDevolucion || cargando"
            :loading="cargando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVentaStore } from '../stores/ventaStore'
import { useClienteStore } from '../stores/clienteStore'
import { useViajeStore } from '../stores/viajeStore'
import { useVehiculoStore } from '../stores/vehiculoStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const ventaStore = useVentaStore()
const clienteStore = useClienteStore()
const viajeStore = useViajeStore()
const vehiculoStore = useVehiculoStore()

const filtroEstado = ref('Todos')
const cargando = ref(false)
const dialogDevolucion = ref(false)
const ventaEnDevolucion = ref(null)
const nuevoEstadoDevolucion = ref('')
const notasDevolucion = ref('')
const dialogDetalle = ref(false)
const ventaDetalle = ref(null)

const estadosDevolucion = [
  'No solicitada',
  'Pendiente de revisión',
  'Aprobada',
  'Rechazada',
  'Devuelta'
]

onMounted(async () => {
  cargando.value = true
  await Promise.allSettled([
    ventaStore.cargarVentas(),
    clienteStore.cargarClientes(),
    viajeStore.cargarViajes(),
    vehiculoStore.cargarVehiculos()
  ])
  cargando.value = false
})

function obtenerVentas() {
  return ventaStore.ventas || []
}

function obtenerVentasConfirmadas() {
  const result = []
  for (const v of obtenerVentas()) {
    if (v.estado === 'CONFIRMADO') result.push(v)
  }
  return result
}

function obtenerVentasPendientes() {
  return []
}

function obtenerVentasCanceladas() {
  const result = []
  for (const v of obtenerVentas()) {
    if (v.estado === 'CANCELADO') result.push(v)
  }
  return result
}

function obtenerVentasFiltradas() {
  if (filtroEstado.value === 'CONFIRMADO') return obtenerVentasConfirmadas()
  if (filtroEstado.value === 'CANCELADO') return obtenerVentasCanceladas()
  return obtenerVentas()
}

async function cancelarVenta(venta) {
  $q.dialog({
    title: 'Cancelar Venta',
    message: `¿Desea cancelar el tiquete ${venta.id}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    cargando.value = true
    await ventaStore.actualizarEstadoVenta(venta.id, 'CANCELADO')
    cargando.value = false
    $q.notify({ type: 'info', message: `Tiquete ${venta.id} cancelado.`, position: 'top' })
  })
}

function abrirModalDevolucion(venta) {
  ventaEnDevolucion.value = venta
  nuevoEstadoDevolucion.value = venta.estadoDevolucion || 'No solicitada'
  notasDevolucion.value = venta.notasDevolucion || ''
  dialogDevolucion.value = true
}

function abrirDetalleVenta(venta) {
  ventaDetalle.value = venta
  dialogDetalle.value = true
}

async function guardarDevolucion() {
  if (!ventaEnDevolucion.value || !nuevoEstadoDevolucion.value) return
  cargando.value = true
  await ventaStore.actualizarDevolucion(
    ventaEnDevolucion.value.id,
    nuevoEstadoDevolucion.value,
    notasDevolucion.value
  )
  cargando.value = false
  dialogDevolucion.value = false
  $q.notify({
    type: 'positive',
    message: `Estado de devolución actualizado a "${nuevoEstadoDevolucion.value}".`,
    position: 'top'
  })
}

function getColorDevolucion(estado) {
  if (estado === 'Devuelta') return 'green-2'
  if (estado === 'Aprobada') return 'teal-1'
  if (estado === 'Rechazada') return 'red-1'
  if (estado === 'Pendiente de revisión') return 'amber-2'
  return 'grey-2'
}

function getTextColorDevolucion(estado) {
  if (estado === 'Devuelta') return 'positive'
  if (estado === 'Aprobada') return 'teal-9'
  if (estado === 'Rechazada') return 'negative'
  if (estado === 'Pendiente de revisión') return 'dark'
  return 'grey-7'
}

function getCliente(id) {
  if (!id) return null
  const c = clienteStore.obtenerCliente(id)
  if (c) return c
  for (const v of ventaStore.ventas) {
    if ((String(v.clienteId) === String(id) || String(v.customer?._id) === String(id)) && v.customer) {
      return v.customer
    }
  }
  return null
}

function getViaje(id) {
  if (!id) return null
  const vj = viajeStore.obtenerViaje(id)
  if (vj) return vj
  for (const v of ventaStore.ventas) {
    if ((String(v.viajeId) === String(id) || String(v.trip?._id) === String(id)) && v.trip) {
      return {
        id: v.trip._id || v.trip.id,
        codigo: v.trip.codigo || (v.trip.bus ? `VIA-${String(v.trip._id || '').slice(-3)}` : 'VIA-000'),
        origen: v.trip.origen || v.trip.origin,
        destino: v.trip.destino || v.trip.destination,
        fecha: v.trip.fecha || v.trip.departureDate,
        hora: v.trip.hora || v.trip.departureTime,
        vehiculoId: v.trip.vehiculoId || (v.trip.bus ? (v.trip.bus._id || v.trip.bus) : ''),
        bus: v.trip.bus
      }
    }
  }
  return null
}

function getBus(viajeId) {
  const viaje = getViaje(viajeId)
  if (!viaje) return null
  const vehiculo = vehiculoStore.obtenerVehiculo(viaje.vehiculoId)
  if (vehiculo) return vehiculo
  if (viaje.bus && typeof viaje.bus === 'object') {
    return {
      placa: viaje.bus.plate || viaje.bus.placa,
      conductor: viaje.bus.driverName || viaje.bus.conductor
    }
  }
  return null
}

const columns = [
  { name: 'cliente', label: 'Pasajero', field: 'customerName', align: 'left' },
  { name: 'documento', label: 'Documento', field: 'customerDoc', align: 'left' },
  { name: 'fechaVenta', label: 'Fecha Venta', field: 'fechaVenta', align: 'left', sortable: true },
  { name: 'ruta', label: 'Ruta', field: 'viajeId', align: 'left' },
  { name: 'numeroSerie', label: 'N° Serie Bus', field: 'viajeId', align: 'left' },
  { name: 'detalles', label: 'Detalles', align: 'center' }
]
</script>

<style scoped>
.ventas-compact-table :deep(th),
.ventas-compact-table :deep(td) {
  padding: 6px 10px !important;
  font-size: 0.8rem;
}
.ventas-compact-table :deep(th) {
  font-weight: 700;
  color: var(--vb-text-primary);
  white-space: nowrap;
  font-size: 0.78rem;
}

/* Modal de detalle */
.detalle-modal-header {
  background: linear-gradient(135deg, #1976D2 0%, #0D47A1 100%);
}

.detalle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
}

.detalle-item--full {
  grid-column: 1 / -1;
}

.detalle-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 3px;
  display: flex;
  align-items: center;
}

.detalle-value {
  font-size: 0.85rem;
  color: #212121;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
</style>

