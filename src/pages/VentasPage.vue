<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1150px;">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">Ventas & Reservas</div>
          <div class="text-caption" style="color: var(--vb-text-secondary);">
            {{ obtenerVentas().length }} registros en total • {{ obtenerVentasPendientes().length }} pendientes por confirmar
          </div>
        </div>
        <q-btn
          color="primary"
          icon="add_shopping_cart"
          label="Nueva Venta / Reserva"
          to="/ventas/nueva"
          no-caps
          unelevated
        />
      </div>

      <!-- Filtros por Pestaña de Estado -->
      <div class="row q-gutter-sm items-center q-mb-md">
        <q-btn
          dense
          no-caps
          :color="filtroEstado === 'Todos' ? 'primary' : ($q.dark.isActive ? 'dark' : 'grey-3')"
          :text-color="filtroEstado === 'Todos' ? 'white' : ($q.dark.isActive ? 'grey-4' : 'grey-9')"
          :label="`Todos (${obtenerVentas().length})`"
          class="q-px-md text-weight-medium"
          @click="filtroEstado = 'Todos'"
          unelevated
        />
        <q-btn
          dense
          no-caps
          :color="filtroEstado === 'Pagado' ? 'positive' : ($q.dark.isActive ? 'dark' : 'grey-3')"
          :text-color="filtroEstado === 'Pagado' ? 'white' : ($q.dark.isActive ? 'grey-4' : 'grey-9')"
          :label="`Pagados (${obtenerVentasPagadas().length})`"
          icon="check_circle"
          class="q-px-md text-weight-medium"
          @click="filtroEstado = 'Pagado'"
          unelevated
        />
        <q-btn
          dense
          no-caps
          :color="filtroEstado === 'Pendiente' ? 'warning' : ($q.dark.isActive ? 'dark' : 'grey-3')"
          :text-color="filtroEstado === 'Pendiente' ? 'dark' : ($q.dark.isActive ? 'grey-4' : 'grey-9')"
          :label="`Pendientes / Reservas (${obtenerVentasPendientes().length})`"
          icon="hourglass_top"
          class="q-px-md text-weight-bold"
          @click="filtroEstado = 'Pendiente'"
          unelevated
        />
      </div>

      <q-card flat bordered class="vb-card shadow-1">
        <q-table
          flat
          :rows="obtenerVentasFiltradas()"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="No hay ventas o reservas con el filtro seleccionado"
        >
          <template v-slot:body-cell-id="props">
            <q-td :props="props">
              <q-badge color="blue-1" text-color="primary" class="text-weight-bold font-mono">
                {{ props.row.id }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-cliente="props">
            <q-td :props="props">
              <span class="text-weight-bold">{{ props.row.customerName || getCliente(props.row.clienteId)?.nombre || '—' }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-documento="props">
            <q-td :props="props">
              <span class="font-mono text-grey-8">{{ props.row.customerDoc || getCliente(props.row.clienteId)?.documento || '—' }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-viaje="props">
            <q-td :props="props">
              <span class="font-mono text-grey-8">{{ getViaje(props.row.viajeId)?.codigo || '—' }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-ruta="props">
            <q-td :props="props">
              <span v-if="getViaje(props.row.viajeId)">
                {{ getViaje(props.row.viajeId).origen }} → {{ getViaje(props.row.viajeId).destino }}
              </span>
              <span v-else>—</span>
            </q-td>
          </template>

          <template v-slot:body-cell-puesto="props">
            <q-td :props="props">
              <q-badge :color="props.row.estado === 'Pendiente' ? 'amber-3' : 'blue-1'" :text-color="props.row.estado === 'Pendiente' ? 'dark' : 'primary'" class="text-weight-bold">
                Puesto #{{ props.row.puestoId }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-precio="props">
            <q-td :props="props">
              <span class="text-weight-bolder">${{ props.row.precio.toLocaleString('es-CO') }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge
                v-if="props.row.estado === 'Pendiente'"
                color="warning"
                text-color="dark"
                class="text-weight-bold q-py-xs q-px-sm"
              >
                <q-icon name="hourglass_top" size="12px" class="q-mr-xs" />
                Pendiente
              </q-badge>
              <q-badge
                v-else-if="props.row.estado === 'Pagado' || props.row.status === 'CONFIRMED'"
                color="positive"
                class="text-weight-bold q-py-xs q-px-sm"
              >
                <q-icon name="check_circle" size="12px" class="q-mr-xs" />
                Pagado
              </q-badge>
              <q-badge v-else color="grey-4" text-color="grey-8" class="q-py-xs q-px-sm">
                {{ props.row.estado }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <div class="row items-center justify-center q-gutter-x-xs no-wrap">
                <!-- Botón Confirmar si está pendiente -->
                <q-btn
                  v-if="props.row.estado === 'Pendiente'"
                  color="positive"
                  size="xs"
                  icon="check"
                  label="Confirmar"
                  @click="confirmarPago(props.row)"
                  no-caps
                  unelevated
                  class="q-px-xs text-weight-bold"
                  title="Confirmar pago del tiquete"
                />

                <!-- Botón Cancelar/Liberar si está pendiente -->
                <q-btn
                  v-if="props.row.estado === 'Pendiente'"
                  color="negative"
                  flat
                  size="xs"
                  icon="close"
                  label="Liberar"
                  @click="liberarPuesto(props.row)"
                  no-caps
                  title="Cancelar reserva y liberar asiento"
                />

                <q-btn
                  outline
                  color="primary"
                  size="xs"
                  icon="description"
                  label="Tiquete"
                  :to="`/tickets/${props.row.id}`"
                  no-caps
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVentaStore } from '../stores/ventaStore'
import { useClienteStore } from '../stores/clienteStore'
import { useViajeStore } from '../stores/viajeStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const ventaStore = useVentaStore()
const clienteStore = useClienteStore()
const viajeStore = useViajeStore()

const filtroEstado = ref('Todos')

onMounted(async () => {
  await Promise.allSettled([
    ventaStore.cargarVentas(),
    clienteStore.cargarClientes(),
    viajeStore.cargarViajes()
  ])
})

function obtenerVentas() {
  return ventaStore.ventas || []
}

function obtenerVentasPagadas() {
  return obtenerVentas().filter(v => v.estado === 'Pagado' || v.status === 'CONFIRMED' || v.status === 'Pagado')
}

function obtenerVentasPendientes() {
  return obtenerVentas().filter(v => v.estado === 'Pendiente' || v.status === 'Pendiente' || v.status === 'PENDING')
}

function obtenerVentasFiltradas() {
  if (filtroEstado.value === 'Pagado') return obtenerVentasPagadas()
  if (filtroEstado.value === 'Pendiente') return obtenerVentasPendientes()
  return obtenerVentas()
}

async function confirmarPago(venta) {
  await ventaStore.actualizarEstadoVenta(venta.id, 'Pagado')
  $q.notify({
    type: 'positive',
    message: `Reserva ${venta.id} confirmada y pagada exitosamente.`,
    position: 'top'
  })
}

async function liberarPuesto(venta) {
  $q.dialog({
    title: 'Liberar Puesto',
    message: `¿Desea cancelar la reserva del puesto #${venta.puestoId} para que vuelva a estar disponible?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await ventaStore.actualizarEstadoVenta(venta.id, 'Cancelado')
    $q.notify({
      type: 'info',
      message: `Puesto #${venta.puestoId} liberado y disponible nuevamente.`,
      position: 'top'
    })
  })
}

const columns = [
  { name: 'id', label: 'Tiquete', field: 'id', align: 'left', sortable: true },
  { name: 'cliente', label: 'Pasajero', field: 'clienteId', align: 'left' },
  { name: 'documento', label: 'Documento', field: 'clienteId', align: 'left' },
  { name: 'viaje', label: 'Viaje', field: 'viajeId', align: 'left' },
  { name: 'ruta', label: 'Ruta', field: 'viajeId', align: 'left' },
  { name: 'puesto', label: 'Puesto', field: 'puestoId', align: 'center' },
  { name: 'precio', label: 'Valor', field: 'precio', align: 'right', sortable: true },
  { name: 'fechaVenta', label: 'Fecha Venta', field: 'fechaVenta', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

function getCliente(id) {
  return clienteStore.obtenerCliente(id)
}

function getViaje(id) {
  return viajeStore.obtenerViaje(id)
}
</script>
