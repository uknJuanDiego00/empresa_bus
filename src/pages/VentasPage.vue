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

      <!-- Tabla compacta optimizada sin desplazamiento horizontal forzado en escritorio -->
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
            <!-- ID Venta -->
            <template v-slot:body-cell-ventaId="props">
              <q-td :props="props" style="white-space: nowrap;">
                <q-badge color="grey-2" text-color="grey-8" class="text-weight-medium font-mono text-caption q-px-xs">
                  {{ props.row.ventaId || '—' }}
                </q-badge>
              </q-td>
            </template>

            <!-- Tiquete -->
            <template v-slot:body-cell-id="props">
              <q-td :props="props" style="white-space: nowrap;">
                <q-badge color="blue-1" text-color="primary" class="text-weight-bold font-mono q-px-xs">
                  {{ props.row.id }}
                </q-badge>
              </q-td>
            </template>

            <!-- Fecha Venta -->
            <template v-slot:body-cell-fechaVenta="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span class="text-caption text-grey-8" style="font-size: 0.76rem;">{{ props.row.fechaVenta || '—' }}</span>
              </q-td>
            </template>

            <!-- Pasajero -->
            <template v-slot:body-cell-cliente="props">
              <q-td :props="props">
                <div class="text-weight-bold text-caption ellipsis" style="max-width: 125px;">
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

            <!-- Viaje -->
            <template v-slot:body-cell-viaje="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span class="font-mono text-caption text-grey-8" style="font-size: 0.76rem;">
                  {{ getViaje(props.row.viajeId)?.codigo || '—' }}
                </span>
              </q-td>
            </template>

            <!-- Ruta -->
            <template v-slot:body-cell-ruta="props">
              <q-td :props="props">
                <div v-if="getViaje(props.row.viajeId)" class="text-caption ellipsis" style="max-width: 135px;">
                  {{ getViaje(props.row.viajeId).origen }} → {{ getViaje(props.row.viajeId).destino }}
                  <q-tooltip>{{ getViaje(props.row.viajeId).origen }} → {{ getViaje(props.row.viajeId).destino }}</q-tooltip>
                </div>
                <span v-else class="text-grey-5">—</span>
              </q-td>
            </template>

            <!-- Fecha y Hora Viaje -->
            <template v-slot:body-cell-fechaViaje="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span v-if="getViaje(props.row.viajeId)" class="text-caption text-grey-8" style="font-size: 0.76rem;">
                  {{ getViaje(props.row.viajeId).fecha }}
                  <span class="text-primary text-weight-bold q-ml-xs">{{ getViaje(props.row.viajeId).hora }}</span>
                </span>
                <span v-else class="text-grey-5">—</span>
              </q-td>
            </template>

            <!-- Bus -->
            <template v-slot:body-cell-bus="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span v-if="getBus(props.row.viajeId)" class="text-caption text-weight-medium">
                  {{ getBus(props.row.viajeId).placa }}
                </span>
                <span v-else class="text-grey-5">—</span>
              </q-td>
            </template>

            <!-- Puesto -->
            <template v-slot:body-cell-puesto="props">
              <q-td :props="props" class="text-center" style="white-space: nowrap;">
                <q-badge color="blue-1" text-color="primary" class="text-weight-bold q-px-xs">
                  #{{ props.row.puestoId }}
                </q-badge>
              </q-td>
            </template>

            <!-- Valor -->
            <template v-slot:body-cell-precio="props">
              <q-td :props="props" class="text-right" style="white-space: nowrap;">
                <span class="text-weight-bolder text-positive" style="font-size: 0.8rem;">
                  ${{ Number(props.row.precio || 0).toLocaleString('es-CO') }}
                </span>
              </q-td>
            </template>

            <!-- Método de Pago -->
            <template v-slot:body-cell-metodoPago="props">
              <q-td :props="props" style="white-space: nowrap;">
                <q-chip dense size="xs" color="grey-2" text-color="grey-8" icon="payments">
                  {{ props.row.metodoPago || 'Efectivo' }}
                </q-chip>
              </q-td>
            </template>

            <!-- Estado Pago -->
            <template v-slot:body-cell-estado="props">
              <q-td :props="props" class="text-center" style="white-space: nowrap;">
                <q-badge v-if="props.row.estado === 'CONFIRMADO'" color="positive" class="text-weight-bold q-py-xs q-px-xs" style="font-size: 0.72rem;">
                  <q-icon name="check_circle" size="10px" class="q-mr-xs" />Confirmado
                </q-badge>
                <q-badge v-else-if="props.row.estado === 'CANCELADO'" color="negative" class="text-weight-bold q-py-xs q-px-xs" style="font-size: 0.72rem;">
                  <q-icon name="cancel" size="10px" class="q-mr-xs" />Cancelado
                </q-badge>
                <q-badge v-else color="grey-4" text-color="grey-8" class="q-py-xs q-px-xs" style="font-size: 0.72rem;">
                  {{ props.row.estado }}
                </q-badge>
              </q-td>
            </template>

            <!-- Estado Devolución -->
            <template v-slot:body-cell-devolucion="props">
              <q-td :props="props" class="text-center" style="white-space: nowrap;">
                <q-badge
                  :color="getColorDevolucion(props.row.estadoDevolucion)"
                  :text-color="getTextColorDevolucion(props.row.estadoDevolucion)"
                  class="q-py-xs q-px-xs cursor-pointer"
                  style="font-size: 0.72rem;"
                  @click="abrirModalDevolucion(props.row)"
                >
                  {{ props.row.estadoDevolucion || 'No solicitada' }}
                  <q-tooltip>Clic para gestionar devolución</q-tooltip>
                </q-badge>
              </q-td>
            </template>

            <!-- Acciones -->
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props" style="white-space: nowrap;">
                <div class="row items-center q-gutter-x-xs no-wrap justify-center">
                  <q-btn
                    dense round outline color="primary" size="xs" icon="receipt"
                    :to="`/tickets/${props.row.id}`"
                  >
                    <q-tooltip>Ver / Imprimir Tiquete</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="props.row.estado === 'CONFIRMADO' && (props.row.estadoDevolucion === 'No solicitada')"
                    dense round flat color="warning" size="xs" icon="undo"
                    @click="abrirModalDevolucion(props.row)"
                  >
                    <q-tooltip>Gestionar Devolución</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="props.row.estado === 'CONFIRMADO'"
                    dense round flat color="negative" size="xs" icon="cancel"
                    @click="cancelarVenta(props.row)"
                    :loading="cargando"
                    :disabled="cargando"
                  >
                    <q-tooltip>Cancelar Venta</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card>
    </div>

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
  return clienteStore.obtenerCliente(id)
}

function getViaje(id) {
  return viajeStore.obtenerViaje(id)
}

function getBus(viajeId) {
  const viaje = viajeStore.obtenerViaje(viajeId)
  if (!viaje) return null
  return vehiculoStore.obtenerVehiculo(viaje.vehiculoId)
}

const columns = [
  { name: 'ventaId', label: 'ID Venta', field: 'ventaId', align: 'left', sortable: true },
  { name: 'id', label: 'Tiquete', field: 'id', align: 'left', sortable: true },
  { name: 'fechaVenta', label: 'Fecha Venta', field: 'fechaVenta', align: 'left', sortable: true },
  { name: 'cliente', label: 'Pasajero', field: 'customerName', align: 'left' },
  { name: 'documento', label: 'Documento', field: 'customerDoc', align: 'left' },
  { name: 'viaje', label: 'Viaje', field: 'viajeId', align: 'left' },
  { name: 'ruta', label: 'Ruta', field: 'viajeId', align: 'left' },
  { name: 'fechaViaje', label: 'Fecha/Hora Viaje', field: 'viajeId', align: 'left' },
  { name: 'bus', label: 'Bus', field: 'viajeId', align: 'left' },
  { name: 'puesto', label: 'Puesto', field: 'puestoId', align: 'center' },
  { name: 'precio', label: 'Valor', field: 'precio', align: 'right', sortable: true },
  { name: 'metodoPago', label: 'Método Pago', field: 'metodoPago', align: 'center' },
  { name: 'estado', label: 'Estado Pago', field: 'estado', align: 'center', sortable: true },
  { name: 'devolucion', label: 'Estado Devolución', field: 'estadoDevolucion', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]
</script>

<style scoped>
.ventas-compact-table :deep(th),
.ventas-compact-table :deep(td) {
  padding: 6px 7px !important;
  font-size: 0.8rem;
}
.ventas-compact-table :deep(th) {
  font-weight: 700;
  color: var(--vb-text-primary);
  white-space: nowrap;
  font-size: 0.78rem;
}
</style>

