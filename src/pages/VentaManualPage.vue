<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1100px;">
      <!-- Cabecera -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">Crear Venta Manual</div>
          <div class="text-caption" style="color: var(--vb-text-secondary);">
            Registro administrativo de venta — seleccione viaje, asientos y pasajeros
          </div>
        </div>
        <q-btn flat color="grey-8" icon="arrow_back" label="Volver a Ventas" to="/ventas" no-caps />
      </div>

      <!-- PASO 1: SELECCIONAR VIAJE -->
      <q-card flat bordered class="vb-card q-mb-lg">
        <q-card-section class="q-pb-sm">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="route" color="primary" size="22px" />
            <div class="text-subtitle1 text-weight-bold" style="color: var(--vb-text-primary);">1. Seleccionar Viaje</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-8">
              <q-select
                v-model="viajeSeleccionadoId"
                :options="opcionesViajes()"
                emit-value
                map-options
                outlined
                dense
                label="Seleccionar viaje disponible"
                @update:model-value="onViajeChange"
              >
                <template v-slot:prepend>
                  <q-icon name="route" color="primary" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="metodoPago"
                :options="metodosPago"
                outlined
                dense
                label="Método de pago"
              >
                <template v-slot:prepend>
                  <q-icon name="payments" color="primary" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Detalle del viaje seleccionado -->
          <div v-if="viajeActual" class="row items-center q-col-gutter-md q-pa-md bg-grey-1 rounded-borders">
            <div class="col-auto">
              <div class="text-caption text-grey-6">Ruta</div>
              <div class="text-weight-bold" style="color: var(--vb-text-primary);">
                {{ viajeActual.origen }} → {{ viajeActual.destino }}
              </div>
            </div>
            <div class="col-auto">
              <div class="text-caption text-grey-6">Fecha y Hora</div>
              <div>{{ viajeActual.fecha }} <strong class="text-primary">{{ viajeActual.hora }}</strong></div>
            </div>
            <div class="col-auto">
              <div class="text-caption text-grey-6">Bus / Placa</div>
              <div>{{ vehiculoActual?.tipo || 'Bus' }} — {{ vehiculoActual?.placa || '—' }}</div>
            </div>
            <div class="col-auto">
              <div class="text-caption text-grey-6">Tarifa por asiento</div>
              <div class="text-h6 text-weight-bold text-positive">${{ viajeActual.precio?.toLocaleString('es-CO') }}</div>
            </div>
            <div class="col-auto">
              <div class="text-caption text-grey-6">Disponibles</div>
              <q-badge color="positive" text-color="white">
                {{ asientosDisponibles() }} disponibles
              </q-badge>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- PASO 2: MAPA DE ASIENTOS Y PASAJEROS (visible solo si hay viaje) -->
      <div v-if="viajeActual">
        <div class="row q-col-gutter-xl items-start">
          <!-- Mapa de asientos -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="vb-card">
              <q-card-section class="q-pb-sm">
                <div class="row items-center q-gutter-x-sm">
                  <q-icon name="event_seat" color="primary" size="22px" />
                  <div class="text-subtitle1 text-weight-bold" style="color: var(--vb-text-primary);">
                    2. Seleccionar Asientos
                  </div>
                </div>
                <div class="text-caption text-grey-6">Haga clic en asientos disponibles (verde) para seleccionarlos</div>
              </q-card-section>
              <q-separator />
              <q-card-section>
                <SeatMap
                  :puestos="vehiculoActual?.puestos || []"
                  :capacidad="Number(vehiculoActual?.capacidad || 20)"
                  :puestosOcupados="puestosOcupados()"
                  :puestosPendientes="puestosPendientes()"
                  :puestosSeleccionados="asientosSeleccionados"
                  :puestoSeleccionado="null"
                  :selectable="true"
                  :conductor="vehiculoActual?.conductor"
                  @seleccionar="onSeleccionarAsiento"
                />

                <!-- Leyenda asientos seleccionados -->
                <div v-if="asientosSeleccionados.length > 0" class="q-mt-md">
                  <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Asientos seleccionados:</div>
                  <div class="row q-gutter-xs flex-wrap">
                    <q-chip
                      v-for="a in asientosSeleccionados"
                      :key="a.numero"
                      dense
                      color="primary"
                      text-color="white"
                      removable
                      @remove="quitarAsiento(a)"
                    >
                      #{{ a.numero }}
                    </q-chip>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Panel de pasajeros -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="vb-card">
              <q-card-section class="q-pb-sm">
                <div class="row items-center justify-between">
                  <div class="row items-center q-gutter-x-sm">
                    <q-icon name="people" color="primary" size="22px" />
                    <div class="text-subtitle1 text-weight-bold" style="color: var(--vb-text-primary);">
                      3. Asignar Pasajeros
                    </div>
                  </div>
                  <q-badge v-if="asientosSeleccionados.length > 0" color="primary">
                    {{ pasajerosAsignados().length }}/{{ asientosSeleccionados.length }} asignados
                  </q-badge>
                </div>
                <div class="text-caption text-grey-6">Asigne un pasajero a cada asiento seleccionado</div>
              </q-card-section>
              <q-separator />
              <q-card-section>
                <div v-if="asientosSeleccionados.length === 0" class="text-center q-pa-lg text-grey-5">
                  <q-icon name="touch_app" size="32px" class="q-mb-xs block" />
                  <div class="text-caption">Seleccione asientos en el mapa para asignar pasajeros</div>
                </div>

                <div v-else class="column q-gutter-md">
                  <div
                    v-for="asiento in asientosSeleccionados"
                    :key="asiento.numero"
                    class="pasajero-slot q-pa-md rounded-borders"
                  >
                    <div class="row items-center justify-between q-mb-sm">
                      <div class="row items-center q-gutter-x-xs">
                        <q-badge color="primary" text-color="white" class="text-weight-bold">
                          Asiento #{{ asiento.numero }}
                        </q-badge>
                        <q-badge v-if="getItemPasajero(asiento.numero)" color="positive" text-color="white">
                          Asignado
                        </q-badge>
                      </div>
                      <q-btn
                        v-if="getItemPasajero(asiento.numero)"
                        flat dense size="xs" icon="close" color="negative"
                        @click="limpiarPasajero(asiento.numero)"
                      />
                    </div>

                    <!-- Búsqueda por documento -->
                    <div class="row q-col-gutter-sm items-center q-mb-sm">
                      <div class="col">
                        <q-input
                          v-model="busquedaDoc[asiento.numero]"
                          outlined dense
                          :placeholder="`Doc. pasajero asiento #${asiento.numero}`"
                          @keyup.enter="buscarPasajero(asiento.numero)"
                          clearable
                        >
                          <template v-slot:prepend>
                            <q-icon name="badge" color="grey-6" />
                          </template>
                        </q-input>
                      </div>
                      <div class="col-auto">
                        <q-btn
                          outline color="primary" size="sm" icon="search"
                          @click="buscarPasajero(asiento.numero)" no-caps
                        />
                      </div>
                    </div>

                    <!-- Resultado de búsqueda -->
                    <div v-if="resultadoBusqueda[asiento.numero] !== undefined">
                      <div v-if="resultadoBusqueda[asiento.numero] === null" class="bg-orange-1 rounded-borders q-pa-xs q-mb-sm">
                        <span class="text-caption text-orange-9">
                          <q-icon name="info" /> No encontrado. Ingrese datos manualmente:
                        </span>
                      </div>
                      <div v-else class="bg-green-1 rounded-borders q-pa-sm q-mb-sm cursor-pointer"
                           @click="seleccionarPasajero(asiento.numero, resultadoBusqueda[asiento.numero])">
                        <div class="row items-center justify-between">
                          <div>
                            <div class="text-weight-bold text-caption">{{ resultadoBusqueda[asiento.numero].nombre }}</div>
                            <div class="text-caption text-grey-6">{{ resultadoBusqueda[asiento.numero].documento }}</div>
                          </div>
                          <q-btn color="positive" size="xs" icon="check" label="Usar" no-caps unelevated
                                 @click.stop="seleccionarPasajero(asiento.numero, resultadoBusqueda[asiento.numero])" />
                        </div>
                      </div>
                    </div>

                    <!-- Selección del listado -->
                    <q-select
                      v-if="!getItemPasajero(asiento.numero)"
                      v-model="seleccionListado[asiento.numero]"
                      :options="opcionesClientes(asiento.numero)"
                      emit-value
                      map-options
                      outlined
                      dense
                      label="O seleccionar del listado"
                      @update:model-value="(id) => seleccionarPorId(asiento.numero, id)"
                      clearable
                    />

                    <!-- Pasajero asignado -->
                    <div v-if="getItemPasajero(asiento.numero)" class="bg-primary-soft rounded-borders q-pa-sm">
                      <div class="row items-center q-gutter-x-sm">
                        <q-icon name="person" color="primary" />
                        <div>
                          <div class="text-weight-bold text-caption" style="color: var(--vb-text-primary);">
                            {{ getItemPasajero(asiento.numero).customerName }}
                          </div>
                          <div class="text-caption text-grey-7">{{ getItemPasajero(asiento.numero).customerDoc }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notas opcionales -->
                <q-input
                  v-if="asientosSeleccionados.length > 0"
                  v-model="notasVenta"
                  outlined dense type="textarea" rows="2"
                  label="Observaciones (opcional)"
                  placeholder="Ej. Equipaje especial, pasajero con necesidad especial..."
                  class="q-mt-md"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- RESUMEN Y CONFIRMACIÓN -->
        <q-card v-if="asientosSeleccionados.length > 0 && pasajerosAsignados().length === asientosSeleccionados.length"
          flat bordered class="vb-card q-mt-lg">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: var(--vb-text-primary);">
              4. Resumen de Venta Manual
            </div>

            <q-table
              flat
              :rows="itemsResumen()"
              :columns="columnsResumen"
              row-key="puestoId"
              hide-bottom
              dense
            />

            <q-separator class="q-my-md" />

            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-6">Total a cobrar</div>
                <div class="text-h4 text-weight-bold text-positive">
                  ${{ totalVenta().toLocaleString('es-CO') }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ asientosSeleccionados.length }} asiento(s) × ${{ viajeActual.precio?.toLocaleString('es-CO') }}
                  • Pago: {{ metodoPago }}
                </div>
              </div>

              <div class="row q-gutter-sm">
                <q-btn
                  color="positive" icon="payments" label="Confirmar y Emitir"
                  @click="confirmarVenta('CONFIRMADO')" no-caps unelevated
                  :loading="cargando" :disabled="cargando"
                />
              </div>
            </div>

            <q-banner v-if="errorVenta" class="bg-red-1 text-negative q-mt-md rounded-borders" rounded>
              <q-icon name="error" />
              {{ errorVenta }}
            </q-banner>
          </q-card-section>
        </q-card>

        <!-- Incompleto: faltan pasajeros -->
        <q-banner
          v-else-if="asientosSeleccionados.length > 0 && pasajerosAsignados().length < asientosSeleccionados.length"
          class="bg-orange-1 text-dark q-mt-md rounded-borders"
          rounded
        >
          <q-icon name="warning" color="warning" size="22px" />
          Faltan {{ asientosSeleccionados.length - pasajerosAsignados().length }} pasajero(s) por asignar.
          Cada asiento debe tener un pasajero antes de confirmar la venta.
        </q-banner>
      </div>

      <!-- Resultado exitoso -->
      <q-card v-if="ventasCreadas.length > 0" flat bordered class="vb-card q-mt-lg text-center">
        <q-card-section class="q-pa-xl">
          <q-icon name="verified" color="positive" size="48px" class="q-mb-md" />
          <div class="text-h5 text-weight-bold q-mb-xs" style="color: var(--vb-text-primary);">
            ¡Venta manual registrada exitosamente!
          </div>
          <div class="text-body2 text-grey-7 q-mb-lg">
            Se generaron {{ ventasCreadas.length }} tiquete(s). ID de venta: <strong>{{ saleIdCreado }}</strong>
          </div>
          <div class="row q-gutter-sm justify-center q-mb-lg">
            <q-chip
              v-for="t in ventasCreadas"
              :key="t.id || t.ticketCode"
              color="primary"
              text-color="white"
              icon="confirmation_number"
              dense
            >
              {{ t.id || t.ticketCode }}
            </q-chip>
          </div>
          <div class="row q-gutter-md justify-center">
            <q-btn
              v-for="t in ventasCreadas"
              :key="`btn-${t.id}`"
              outline color="primary" icon="description" :label="`Tiquete ${t.id}`"
              :to="`/tickets/${t.id}`" no-caps size="sm"
            />
          </div>
          <div class="row q-gutter-sm justify-center q-mt-md">
            <q-btn outline color="grey-8" icon="add_shopping_cart" label="Nueva Venta Manual" @click="reiniciar" no-caps />
            <q-btn flat color="grey-7" label="Ir a Ventas" to="/ventas" no-caps />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useViajeStore } from '../stores/viajeStore'
import { useVehiculoStore } from '../stores/vehiculoStore'
import { useClienteStore } from '../stores/clienteStore'
import { useVentaStore } from '../stores/ventaStore'
import SeatMap from '../components/SeatMap.vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const viajeStore = useViajeStore()
const vehiculoStore = useVehiculoStore()
const clienteStore = useClienteStore()
const ventaStore = useVentaStore()

const viajeSeleccionadoId = ref(null)
const viajeActual = ref(null)
const vehiculoActual = ref(null)
const metodoPago = ref('Efectivo')
const notasVenta = ref('')
const asientosSeleccionados = ref([])
const itemsPasajeros = ref({}) // { [numeroPuesto]: { customerName, customerDoc, clienteId } }
const busquedaDoc = ref({}) // { [numeroPuesto]: string }
const resultadoBusqueda = ref({}) // { [numeroPuesto]: cliente | null | undefined }
const seleccionListado = ref({}) // { [numeroPuesto]: id }
const cargando = ref(false)
const errorVenta = ref('')
const ventasCreadas = ref([])
const saleIdCreado = ref('')

const metodosPago = ['Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'Transferencia', 'Nequi', 'Daviplata']

onMounted(async () => {
  cargando.value = true
  await Promise.allSettled([
    viajeStore.cargarViajes(),
    vehiculoStore.cargarVehiculos(),
    clienteStore.cargarClientes(),
    ventaStore.cargarVentas()
  ])
  cargando.value = false
})

function opcionesViajes() {
  const opts = []
  for (const v of viajeStore.viajes) {
    if (v.estado === 'Cancelado' || v.estado === 'Finalizado') continue
    const veh = vehiculoStore.obtenerVehiculo(v.vehiculoId)
    const placa = veh ? ` [${veh.placa}]` : ''
    opts.push({
      label: `${v.codigo} | ${v.origen} → ${v.destino} | ${v.fecha} ${v.hora}${placa}`,
      value: v.id
    })
  }
  return opts
}

function onViajeChange(id) {
  viajeActual.value = viajeStore.obtenerViaje(id)
  if (viajeActual.value) {
    vehiculoActual.value = vehiculoStore.obtenerVehiculo(viajeActual.value.vehiculoId)
  } else {
    vehiculoActual.value = null
  }
  asientosSeleccionados.value = []
  itemsPasajeros.value = {}
  busquedaDoc.value = {}
  resultadoBusqueda.value = {}
  seleccionListado.value = {}
  errorVenta.value = ''
  ventasCreadas.value = []
}

function puestosOcupados() {
  if (!viajeActual.value) return []
  return ventaStore.puestosOcupadosPorViaje(viajeActual.value.id)
}

function puestosPendientes() {
  if (!viajeActual.value) return []
  return ventaStore.puestosPendientesPorViaje(viajeActual.value.id)
}

function asientosDisponibles() {
  if (!vehiculoActual.value) return 0
  const cap = vehiculoActual.value.capacidad || 0
  const ocupados = puestosOcupados().length
  return Math.max(0, cap - ocupados)
}

function onSeleccionarAsiento(asiento) {
  if (!asiento) return
  const num = Number(asiento.numero || asiento.id)
  const idx = asientosSeleccionados.value.findIndex(a => a.numero === num)
  if (idx >= 0) {
    // Toggle: quitar
    asientosSeleccionados.value.splice(idx, 1)
    quitarAsientoState(num)
  } else {
    asientosSeleccionados.value.push({ id: asiento.id, numero: num })
  }
}

function quitarAsiento(asiento) {
  const idx = asientosSeleccionados.value.findIndex(a => a.numero === asiento.numero)
  if (idx >= 0) {
    asientosSeleccionados.value.splice(idx, 1)
    quitarAsientoState(asiento.numero)
  }
}

function quitarAsientoState(num) {
  delete itemsPasajeros.value[num]
  delete busquedaDoc.value[num]
  delete resultadoBusqueda.value[num]
  delete seleccionListado.value[num]
}

function buscarPasajero(numPuesto) {
  const doc = (busquedaDoc.value[numPuesto] || '').trim()
  if (!doc) return
  const cliente = clienteStore.buscarClientePorDocumento(doc)
  resultadoBusqueda.value = { ...resultadoBusqueda.value, [numPuesto]: cliente }
}

function seleccionarPasajero(numPuesto, cliente) {
  itemsPasajeros.value = {
    ...itemsPasajeros.value,
    [numPuesto]: {
      customerName: cliente.nombre,
      customerDoc: cliente.documento,
      clienteId: cliente.id || cliente._id
    }
  }
  resultadoBusqueda.value = { ...resultadoBusqueda.value, [numPuesto]: undefined }
  busquedaDoc.value = { ...busquedaDoc.value, [numPuesto]: '' }
  seleccionListado.value = { ...seleccionListado.value, [numPuesto]: null }
}

function seleccionarPorId(numPuesto, clienteId) {
  if (!clienteId) return
  const cliente = clienteStore.obtenerCliente(clienteId)
  if (!cliente) return
  seleccionarPasajero(numPuesto, cliente)
}

function limpiarPasajero(numPuesto) {
  const nuevo = { ...itemsPasajeros.value }
  delete nuevo[numPuesto]
  itemsPasajeros.value = nuevo
}

function getItemPasajero(numPuesto) {
  return itemsPasajeros.value[numPuesto] || null
}

function opcionesClientes(numPuesto) {
  const opts = []
  const yaUsados = new Set()
  for (const num of asientosSeleccionados.value) {
    const item = itemsPasajeros.value[num.numero]
    if (item && num.numero !== numPuesto) {
      yaUsados.add(item.customerDoc)
    }
  }
  for (const c of clienteStore.clientes) {
    if (!yaUsados.has(c.documento)) {
      opts.push({ label: `${c.nombre} — ${c.documento}`, value: c.id })
    }
  }
  return opts
}

function pasajerosAsignados() {
  const asignados = []
  for (const a of asientosSeleccionados.value) {
    if (itemsPasajeros.value[a.numero]) {
      asignados.push({ ...itemsPasajeros.value[a.numero], puestoId: a.numero })
    }
  }
  return asignados
}

function itemsResumen() {
  const items = []
  for (const a of asientosSeleccionados.value) {
    const p = itemsPasajeros.value[a.numero]
    items.push({
      puestoId: a.numero,
      pasajero: p ? p.customerName : '—',
      documento: p ? p.customerDoc : '—',
      precio: viajeActual.value?.precio || 0
    })
  }
  return items
}

function totalVenta() {
  return asientosSeleccionados.value.length * (viajeActual.value?.precio || 0)
}

const columnsResumen = [
  { name: 'puestoId', label: 'Asiento', field: 'puestoId', align: 'center' },
  { name: 'pasajero', label: 'Pasajero', field: 'pasajero', align: 'left' },
  { name: 'documento', label: 'Documento', field: 'documento', align: 'left' },
  { name: 'precio', label: 'Valor', field: 'precio', align: 'right',
    format: (val) => `$${Number(val).toLocaleString('es-CO')}` }
]

async function confirmarVenta(estado) {
  errorVenta.value = ''
  if (!viajeActual.value) {
    errorVenta.value = 'Debe seleccionar un viaje.'
    return
  }
  if (asientosSeleccionados.value.length === 0) {
    errorVenta.value = 'Debe seleccionar al menos un asiento.'
    return
  }
  if (pasajerosAsignados().length < asientosSeleccionados.value.length) {
    errorVenta.value = 'Todos los asientos deben tener un pasajero asignado.'
    return
  }

  // Validar que los asientos siguen disponibles
  for (const a of asientosSeleccionados.value) {
    if (ventaStore.puestoOcupado(viajeActual.value.id, a.numero)) {
      errorVenta.value = `El asiento #${a.numero} acaba de ser ocupado por otro usuario. Por favor actualice la selección.`
      return
    }
  }

  cargando.value = true

  // Construir items
  const items = []
  for (const a of asientosSeleccionados.value) {
    const p = itemsPasajeros.value[a.numero]
    items.push({
      puestoId: a.numero,
      customerName: p.customerName,
      customerDoc: p.customerDoc,
      clienteId: p.clienteId || undefined,
      precio: viajeActual.value.precio,
      notes: notasVenta.value || ''
    })
  }

  const payload = {
    viajeId: viajeActual.value.id,
    estado,
    status: estado,
    metodoPago: metodoPago.value,
    paymentMethod: metodoPago.value,
    items
  }

  try {
    const res = await ventaStore.crearVentaMultiple(payload)
    ventasCreadas.value = res.tiquetes || []
    saleIdCreado.value = res.saleId || ''
    $q.notify({ type: 'positive', message: `Venta registrada con ${ventasCreadas.value.length} tiquete(s).`, position: 'top' })
    // Recargar ventas para actualizar el mapa
    await ventaStore.cargarVentas()
  } catch (e) {
    errorVenta.value = e.message || 'Error al registrar la venta. Intente nuevamente.'
  } finally {
    cargando.value = false
  }
}

function reiniciar() {
  viajeSeleccionadoId.value = null
  viajeActual.value = null
  vehiculoActual.value = null
  asientosSeleccionados.value = []
  itemsPasajeros.value = {}
  busquedaDoc.value = {}
  resultadoBusqueda.value = {}
  seleccionListado.value = {}
  notasVenta.value = ''
  errorVenta.value = ''
  ventasCreadas.value = []
  saleIdCreado.value = ''
}
</script>

<style scoped>
.pasajero-slot {
  background: var(--vb-bg-surface);
  border: 1px solid var(--vb-border);
}
.bg-primary-soft {
  background: var(--vb-primary-soft);
  border-radius: 8px;
}
</style>
