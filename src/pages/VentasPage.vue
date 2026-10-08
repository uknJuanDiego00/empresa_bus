<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1240px;">
      <!-- CABECERA -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bold text-dark q-mb-xs">Ventas Realizadas</div>
          <div class="text-subtitle2 text-grey-7">{{ ventas.length }} tiquetes emitidos y registrados</div>
        </div>
        <q-btn
          color="primary"
          icon="add_shopping_cart"
          label="Nueva Venta"
          to="/ventas/nueva"
          no-caps
          unelevated
          class="q-px-md text-weight-bold"
        />
      </div>

      <!-- BÚSQUEDA Y FILTRO -->
      <div class="row q-col-gutter-sm items-center q-mb-md">
        <div class="col-12 col-md-5">
          <q-input
            outlined
            dense
            v-model="filtro"
            placeholder="Buscar por ID de tiquete, pasajero o documento..."
            clearable
            class="bg-white"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- TABLA DE VENTAS -->
      <q-card flat class="vb-card overflow-hidden">
        <q-table
          flat
          :rows="ventasFiltradas"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          class="no-border"
        >
          <!-- Tiquete ID -->
          <template v-slot:body-cell-id="props">
            <q-td :props="props">
              <span class="ticket-id-badge">{{ props.row.id }}</span>
            </q-td>
          </template>

          <!-- Pasajero -->
          <template v-slot:body-cell-cliente="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-sm">
                <q-avatar size="26px" color="grey-2" text-color="grey-9" class="text-caption text-weight-bold">
                  {{ getCliente(props.row.clienteId)?.nombre?.charAt(0)?.toUpperCase() || 'P' }}
                </q-avatar>
                <span class="text-weight-bold text-dark">{{ getCliente(props.row.clienteId)?.nombre || '—' }}</span>
              </div>
            </q-td>
          </template>

          <!-- Documento -->
          <template v-slot:body-cell-documento="props">
            <q-td :props="props">
              <span class="font-mono text-grey-8">{{ getCliente(props.row.clienteId)?.documento || '—' }}</span>
            </q-td>
          </template>

          <!-- Viaje -->
          <template v-slot:body-cell-viaje="props">
            <q-td :props="props">
              <span class="font-mono text-weight-medium text-grey-9">{{ getViaje(props.row.viajeId)?.codigo || '—' }}</span>
            </q-td>
          </template>

          <!-- Ruta -->
          <template v-slot:body-cell-ruta="props">
            <q-td :props="props">
              <div v-if="getViaje(props.row.viajeId)" class="row items-center q-gutter-x-xs no-wrap">
                <span class="text-weight-medium text-dark">{{ getViaje(props.row.viajeId).origen }}</span>
                <q-icon name="arrow_forward" size="13px" color="grey-5" />
                <span class="text-weight-medium text-dark">{{ getViaje(props.row.viajeId).destino }}</span>
              </div>
              <span v-else class="text-grey-5">—</span>
            </q-td>
          </template>

          <!-- Puesto -->
          <template v-slot:body-cell-puesto="props">
            <q-td :props="props">
              <span class="seat-badge">
                <q-icon name="event_seat" size="13px" class="q-mr-xs" />
                #{{ props.row.puestoId }}
              </span>
            </q-td>
          </template>

          <!-- Precio -->
          <template v-slot:body-cell-precio="props">
            <q-td :props="props">
              <span class="text-weight-bold text-dark">
                ${{ props.row.precio ? Number(props.row.precio).toLocaleString('es-CO') : '0' }}
              </span>
            </q-td>
          </template>

          <!-- Fecha Venta -->
          <template v-slot:body-cell-fechaVenta="props">
            <q-td :props="props">
              <span class="text-caption text-grey-7">{{ props.row.fechaVenta }}</span>
            </q-td>
          </template>

          <!-- Estado -->
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge class="badge-status-disponible">
                <q-icon name="check_circle" size="12px" class="q-mr-xs text-positive" />
                {{ props.row.estado }}
              </q-badge>
            </q-td>
          </template>

          <!-- Acciones -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                outline
                dense
                color="primary"
                icon="description"
                label="Tiquete"
                :to="`/tickets/${props.row.id}`"
                no-caps
                class="q-px-sm text-caption"
              >
                <q-tooltip>Ver detalle e imprimir tiquete</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Estado Vacío -->
          <template v-slot:no-data>
            <div class="empty-state-box full-width q-my-lg">
              <div class="empty-state-icon">
                <q-icon name="receipt_long" size="28px" />
              </div>
              <div class="empty-state-title">No hay ventas registradas</div>
              <div class="empty-state-desc">Realiza tu primera venta seleccionando un viaje y puesto disponible.</div>
              <q-btn
                color="primary"
                icon="add_shopping_cart"
                label="Realizar Primera Venta"
                to="/ventas/nueva"
                no-caps
                unelevated
              />
            </div>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVentaStore } from '../stores/ventaStore'
import { useClienteStore } from '../stores/clienteStore'
import { useViajeStore } from '../stores/viajeStore'

const ventaStore = useVentaStore()
const clienteStore = useClienteStore()
const viajeStore = useViajeStore()

const filtro = ref('')

onMounted(async () => {
  await Promise.allSettled([
    ventaStore.cargarVentas(),
    clienteStore.cargarClientes(),
    viajeStore.cargarViajes()
  ])
})

const ventas = computed(() => ventaStore.ventas)

const ventasFiltradas = computed(() => {
  const q = filtro.value?.trim().toLowerCase()
  if (!q) return ventas.value
  return ventas.value.filter(v => {
    const cli = getCliente(v.clienteId)
    const viaje = getViaje(v.viajeId)
    return (
      (v.id && String(v.id).toLowerCase().includes(q)) ||
      (cli?.nombre && cli.nombre.toLowerCase().includes(q)) ||
      (cli?.documento && cli.documento.toLowerCase().includes(q)) ||
      (viaje?.codigo && viaje.codigo.toLowerCase().includes(q)) ||
      (viaje?.origen && viaje.origen.toLowerCase().includes(q)) ||
      (viaje?.destino && viaje.destino.toLowerCase().includes(q))
    )
  })
})

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
  { name: 'acciones', label: '', align: 'center' }
]

function getCliente(id) {
  return clienteStore.obtenerCliente(id)
}

function getViaje(id) {
  return viajeStore.obtenerViaje(id)
}
</script>

<style scoped>
.ticket-id-badge {
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  background: #F4F4F5;
  color: #18181B;
  border: 1px solid #E4E4E7;
  padding: 3px 8px;
  border-radius: 6px;
}

.seat-badge {
  display: inline-flex;
  align-items: center;
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
  font-weight: 700;
  font-size: 11.5px;
  padding: 2px 8px;
  border-radius: 6px;
}

.font-mono {
  font-family: monospace;
}
</style>
