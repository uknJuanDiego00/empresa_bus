<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 100%;">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">Ventas & Reservas</div>
          <div class="text-caption" style="color: var(--vb-text-secondary);">
            {{ obtenerVentas().length }} registros en total • {{ obtenerVentasPendientes().length }} pendientes por confirmar
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
          :color="filtroEstado === 'Pagado' ? 'positive' : 'grey-3'"
          :text-color="filtroEstado === 'Pagado' ? 'white' : 'grey-9'"
          :label="`Pagados (${obtenerVentasPagadas().length})`"
          icon="check_circle"
          class="q-px-md text-weight-medium"
          @click="filtroEstado = 'Pagado'"
        />
        <q-btn
          dense no-caps unelevated
          :color="filtroEstado === 'Pendiente' ? 'warning' : 'grey-3'"
          :text-color="filtroEstado === 'Pendiente' ? 'dark' : 'grey-9'"
          :label="`Pendientes (${obtenerVentasPendientes().length})`"
          icon="hourglass_top"
          class="q-px-md"
          @click="filtroEstado = 'Pendiente'"
        />
        <q-btn
          dense no-caps unelevated
          :color="filtroEstado === 'Cancelado' ? 'negative' : 'grey-3'"
          :text-color="filtroEstado === 'Cancelado' ? 'white' : 'grey-9'"
          :label="`Cancelados (${obtenerVentasCanceladas().length})`"
          icon="cancel"
          class="q-px-md"
          @click="filtroEstado = 'Cancelado'"
        />
      </div>

      <!-- Tabla completa con scroll horizontal -->
      <q-card flat bordered class="vb-card shadow-1 overflow-hidden">
        <div style="overflow-x: auto;">
          <q-table
            flat
            :rows="obtenerVentasFiltradas()"
            :columns="columns"
            row-key="id"
            :pagination="{ rowsPerPage: 10 }"
            no-data-label="No hay ventas con el filtro seleccionado"
            :loading="cargando"
            style="min-width: 1400px;"
          >
            <!-- ID Venta -->
            <template v-slot:body-cell-ventaId="props">
              <q-td :props="props" style="white-space: nowrap;">
                <q-badge color="grey-2" text-color="grey-8" class="text-weight-medium font-mono text-caption">
                  {{ props.row.ventaId || '—' }}
                </q-badge>
              </q-td>
            </template>

            <!-- Tiquete -->
            <template v-slot:body-cell-id="props">
              <q-td :props="props" style="white-space: nowrap;">
                <q-badge color="blue-1" text-color="primary" class="text-weight-bold font-mono">
                  {{ props.row.id }}
                </q-badge>
              </q-td>
            </template>

            <!-- Fecha Venta -->
            <template v-slot:body-cell-fechaVenta="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span class="text-caption text-grey-8">{{ props.row.fechaVenta || '—' }}</span>
              </q-td>
            </template>

            <!-- Pasajero -->
            <template v-slot:body-cell-cliente="props">
              <q-td :props="props">
                <div class="text-weight-bold text-caption" style="min-width: 130px;">
                  {{ props.row.customerName || getCliente(props.row.clienteId)?.nombre || '—' }}
                </div>
              </q-td>
            </template>

            <!-- Documento -->
            <template v-slot:body-cell-documento="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span class="font-mono text-caption text-grey-8">
                  {{ props.row.customerDoc || getCliente(props.row.clienteId)?.documento || '—' }}
                </span>
              </q-td>
            </template>

            <!-- Viaje -->
            <template v-slot:body-cell-viaje="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span class="font-mono text-caption text-grey-8">
                  {{ getViaje(props.row.viajeId)?.codigo || '—' }}
                </span>
              </q-td>
            </template>

            <!-- Ruta -->
            <template v-slot:body-cell-ruta="props">
              <q-td :props="props">
                <span v-if="getViaje(props.row.viajeId)" class="text-caption" style="min-width: 140px;">
                  {{ getViaje(props.row.viajeId).origen }} → {{ getViaje(props.row.viajeId).destino }}
                </span>
                <span v-else class="text-grey-5">—</span>
              </q-td>
            </template>

            <!-- Fecha y Hora Viaje -->
            <template v-slot:body-cell-fechaViaje="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span v-if="getViaje(props.row.viajeId)" class="text-caption text-grey-8">
                  {{ getViaje(props.row.viajeId).fecha }}
                  <span class="text-primary text-weight-bold q-ml-xs">{{ getViaje(props.row.viajeId).hora }}</span>
                </span>
                <span v-else class="text-grey-5">—</span>
              </q-td>
            </template>

            <!-- Bus -->
            <template v-slot:body-cell-bus="props">
              <q-td :props="props" style="white-space: nowrap;">
                <span v-if="getBus(props.row.viajeId)" class="text-caption">
                  {{ getBus(props.row.viajeId).placa }}
                </span>
                <span v-else class="text-grey-5">—</span>
              </q-td>
            </template>

            <!-- Puesto -->
            <template v-slot:body-cell-puesto="props">
              <q-td :props="props" class="text-center" style="white-space: nowrap;">
                <q-badge
                  :color="props.row.estado === 'Pendiente' ? 'amber-2' : 'blue-1'"
                  :text-color="props.row.estado === 'Pendiente' ? 'dark' : 'primary'"
                  class="text-weight-bold"
                >
                  # {{ props.row.puestoId }}
                </q-badge>
              </q-td>
            </template>

            <!-- Valor -->
            <template v-slot:body-cell-precio="props">
              <q-td :props="props" class="text-right" style="white-space: nowrap;">
                <span class="text-weight-bolder text-positive">
                  ${{ Number(props.row.precio || 0).toLocaleString('es-CO') }}
                </span>
              </q-td>
            </template>

            <!-- Método de Pago -->
            <template v-slot:body-cell-metodoPago="props">
              <q-td :props="props" style="white-space: nowrap;">
                <q-chip dense size="sm" color="grey-2" text-color="grey-8" icon="payments">
                  {{ props.row.metodoPago || 'Efectivo' }}
                </q-chip>
              </q-td>
            </template>

            <!-- Estado Pago -->
            <template v-slot:body-cell-estado="props">
              <q-td :props="props" class="text-center" style="white-space: nowrap;">
                <q-badge v-if="props.row.estado === 'Pendiente'" color="warning" text-color="dark" class="text-weight-bold q-py-xs q-px-sm">
                  <q-icon name="hourglass_top" size="12px" class="q-mr-xs" />Pendiente
                </q-badge>
                <q-badge v-else-if="props.row.estado === 'Pagado' || props.row.estado === 'CONFIRMED'" color="positive" class="text-weight-bold q-py-xs q-px-sm">
                  <q-icon name="check_circle" size="12px" class="q-mr-xs" />Pagado
                </q-badge>
                <q-badge v-else-if="props.row.estado === 'Cancelado' || props.row.estado === 'CANCELLED'" color="negative" class="text-weight-bold q-py-xs q-px-sm">
                  <q-icon name="cancel" size="12px" class="q-mr-xs" />Cancelado
                </q-badge>
                <q-badge v-else color="grey-4" text-color="grey-8" class="q-py-xs q-px-sm">
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
                  class="text-caption q-py-xs q-px-sm cursor-pointer"
                  @click="abrirModalDevolucion(props.row)"
                  style="cursor: pointer;"
                >
                  {{ props.row.estadoDevolucion || 'No solicitada' }}
                </q-badge>
              </q-td>
            </template>

            <!-- Acciones -->
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props" style="white-space: nowrap;">
                <div class="row items-center q-gutter-x-xs no-wrap">
                  <q-btn
                    v-if="props.row.estado === 'Pendiente'"
                    color="positive" size="xs" icon="check" label="Confirmar"
                    @click="confirmarPago(props.row)" no-caps unelevated
                    :loading="cargando"
                    :disabled="cargando"
                  />
                  <q-btn
                    v-if="props.row.estado === 'Pendiente'"
                    flat color="negative" size="xs" icon="close" label="Liberar"
                    @click="liberarPuesto(props.row)" no-caps
                  />
                  <q-btn
                    outline color="primary" size="xs" icon="description" label="Tiquete"
                    :to="`/tickets/${props.row.id}`" no-caps
                  />
                  <q-btn
                    v-if="props.row.estado === 'Pagado' && (props.row.estadoDevolucion === 'No solicitada')"
                    flat color="warning" size="xs" icon="undo" label="Devol."
                    @click="abrirModalDevolucion(props.row)" no-caps
                  />
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

function obtenerVentasPagadas() {
  const result = []
  for (const v of obtenerVentas()) {
    if (v.estado === 'Pagado' || v.status === 'CONFIRMED' || v.estado === 'CONFIRMED') result.push(v)
  }
  return result
}

function obtenerVentasPendientes() {
  const result = []
  for (const v of obtenerVentas()) {
    if (v.estado === 'Pendiente' || v.status === 'PENDING') result.push(v)
  }
  return result
}

function obtenerVentasCanceladas() {
  const result = []
  for (const v of obtenerVentas()) {
    if (v.estado === 'Cancelado' || v.status === 'CANCELLED') result.push(v)
  }
  return result
}

function obtenerVentasFiltradas() {
  if (filtroEstado.value === 'Pagado') return obtenerVentasPagadas()
  if (filtroEstado.value === 'Pendiente') return obtenerVentasPendientes()
  if (filtroEstado.value === 'Cancelado') return obtenerVentasCanceladas()
  return obtenerVentas()
}

async function confirmarPago(venta) {
  cargando.value = true
  await ventaStore.actualizarEstadoVenta(venta.id, 'Pagado')
  cargando.value = false
  $q.notify({ type: 'positive', message: `Tiquete ${venta.id} confirmado y pagado.`, position: 'top' })
}

function liberarPuesto(venta) {
  $q.dialog({
    title: 'Liberar Puesto',
    message: `¿Desea cancelar la reserva del puesto #${venta.puestoId}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    cargando.value = true
    await ventaStore.actualizarEstadoVenta(venta.id, 'Cancelado')
    cargando.value = false
    $q.notify({ type: 'info', message: `Puesto #${venta.puestoId} liberado.`, position: 'top' })
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
