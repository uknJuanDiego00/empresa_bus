<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1100px;">
      <!-- CABECERA -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bold text-dark q-mb-xs">Nueva Venta de Tiquete</div>
          <div class="text-subtitle2 text-grey-7">Flujo guiado paso a paso para emisión y facturación</div>
        </div>
        <q-btn flat color="grey-8" icon="arrow_back" label="Volver a Ventas" to="/ventas" no-caps />
      </div>

      <!-- STEPPER GUIDED WORKFLOW -->
      <q-stepper
        :model-value="paso"
        @update:model-value="cambiarPaso"
        ref="stepper"
        color="primary"
        animated
        flat
        header-nav
        class="vb-card overflow-hidden"
      >
        <!-- PASO 1: SELECCIONAR VIAJE -->
        <q-step
          :name="1"
          title="Viaje"
          icon="route"
          :done="paso > 1"
          class="q-pa-lg"
        >
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-subtitle1 text-weight-bold text-dark">
                1. Seleccione el Viaje Programado
              </div>
              <div class="text-caption text-grey-6">
                Elija la ruta y horario para el cual desea emitir el tiquete
              </div>
            </div>
            <div v-if="viajeSeleccionado" class="selected-indicator-pill">
              <q-icon name="check_circle" color="positive" size="14px" class="q-mr-xs" />
              <span class="text-caption text-weight-bold">Viaje seleccionado: {{ viajeSeleccionado.codigo }}</span>
            </div>
          </div>

          <div v-if="viajesDisponibles.length === 0" class="empty-state-box q-my-md">
            <div class="empty-state-icon">
              <q-icon name="route" size="28px" />
            </div>
            <div class="empty-state-title">No hay viajes programados disponibles</div>
            <div class="empty-state-desc">Todos los viajes están completos o finalizados. Programe un nuevo viaje para continuar.</div>
            <q-btn color="primary" unelevated icon="add" label="Programar Viaje" to="/viajes/crear" no-caps />
          </div>

          <div v-else class="row q-col-gutter-md">
            <div
              v-for="viaje in viajesDisponibles"
              :key="viaje.id"
              class="col-12 col-md-6 col-lg-4"
            >
              <q-card
                flat
                class="trip-select-card cursor-pointer"
                :class="{ 'trip-select-active': viajeSeleccionado?.id === viaje.id }"
                @click="seleccionarViaje(viaje)"
              >
                <q-card-section class="q-pa-md">
                  <div class="row items-center justify-between q-mb-sm">
                    <span class="trip-code-pill">{{ viaje.codigo }}</span>
                    <span class="text-h6 text-weight-bold text-primary">
                      ${{ viaje.precio.toLocaleString('es-CO') }}
                    </span>
                  </div>

                  <div class="row items-center q-gutter-x-xs q-my-sm">
                    <span class="text-weight-bold text-dark text-subtitle2">{{ viaje.origen }}</span>
                    <q-icon name="arrow_forward" size="14px" color="grey-5" />
                    <span class="text-weight-bold text-dark text-subtitle2">{{ viaje.destino }}</span>
                  </div>

                  <div class="row q-gutter-x-md text-caption text-grey-7 q-my-xs">
                    <span class="row items-center"><q-icon name="event" size="14px" color="grey-6" class="q-mr-xs" />{{ viaje.fecha }}</span>
                    <span class="row items-center"><q-icon name="schedule" size="14px" color="primary" class="q-mr-xs" /><strong class="text-primary">{{ viaje.hora }}</strong></span>
                  </div>

                  <div class="row items-center justify-between q-mt-md pt-top-border">
                    <div class="row items-center q-gutter-x-xs text-caption text-grey-8">
                      <q-icon name="directions_bus" size="14px" color="grey-6" />
                      <span>{{ getVehiculo(viaje.vehiculoId)?.placa || 'Bus' }}</span>
                    </div>
                    <div class="row q-gutter-x-xs">
                      <q-badge color="grey-2" text-color="positive" class="text-weight-bold">
                        {{ getDisponibles(viaje) }} disponibles
                      </q-badge>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div class="row justify-end q-mt-xl">
            <q-btn
              color="primary"
              label="Continuar a Cliente"
              icon-right="arrow_forward"
              :disabled="!viajeSeleccionado"
              @click="paso = 2"
              no-caps
              unelevated
              class="q-px-lg text-weight-bold"
            />
          </div>
        </q-step>

        <!-- PASO 2: SELECCIONAR CLIENTE -->
        <q-step
          :name="2"
          title="Cliente"
          icon="person"
          :done="paso > 2"
          :disable="!viajeSeleccionado"
          class="q-pa-lg"
        >
          <div style="max-width: 680px;" class="q-mx-auto">
            <!-- Banner Resumen del Viaje Escogido -->
            <div v-if="viajeSeleccionado" class="selected-trip-banner row items-center justify-between q-pa-sm q-mb-lg">
              <div class="row items-center q-gutter-x-sm">
                <div class="banner-icon-box">
                  <q-icon name="route" size="16px" color="white" />
                </div>
                <div>
                  <div class="text-weight-bold text-dark text-body2">
                    {{ viajeSeleccionado.origen }} <q-icon name="arrow_forward" size="12px" color="primary" /> {{ viajeSeleccionado.destino }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ viajeSeleccionado.fecha }} • {{ viajeSeleccionado.hora }} | Bus: {{ vehiculoDelViaje?.placa || 'Asignado' }}
                  </div>
                </div>
              </div>
              <div class="row items-center q-gutter-x-sm">
                <span class="text-weight-bold text-primary">${{ viajeSeleccionado.precio?.toLocaleString('es-CO') }}</span>
                <q-btn flat dense size="sm" color="grey-7" label="Cambiar" @click="paso = 1" no-caps />
              </div>
            </div>

            <div class="text-subtitle1 text-weight-bold text-dark q-mb-xs">
              2. Identificación del Pasajero
            </div>
            <div class="text-caption text-grey-6 q-mb-md">
              Busque al pasajero por documento de identidad o elíjalo del listado
            </div>

            <!-- Búsqueda por documento -->
            <div class="row q-col-gutter-sm items-center q-mb-md">
              <div class="col-8">
                <q-input
                  outlined
                  dense
                  v-model="docBusqueda"
                  placeholder="Ingrese número de documento..."
                  label="Documento del pasajero"
                  @keyup.enter="buscarCliente"
                  class="bg-white"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" color="grey-6" />
                  </template>
                </q-input>
              </div>
              <div class="col-4">
                <q-btn
                  outline
                  color="primary"
                  icon="search"
                  label="Buscar"
                  class="full-width"
                  @click="buscarCliente"
                  no-caps
                />
              </div>
            </div>

            <!-- Resultado de búsqueda directa -->
            <div v-if="clienteBuscado !== undefined" class="q-mb-md">
              <div v-if="clienteBuscado === null" class="warning-alert-box row items-center justify-between q-pa-sm">
                <div class="row items-center q-gutter-x-sm">
                  <q-icon name="info" color="warning" size="20px" />
                  <span class="text-caption text-grey-9">Pasajero no registrado en el sistema.</span>
                </div>
                <q-btn flat dense color="primary" label="+ Registrar Cliente" to="/clientes/registrar" no-caps class="text-weight-bold" />
              </div>

              <div v-else class="client-result-card row items-center justify-between q-pa-md">
                <div>
                  <div class="text-weight-bold text-dark">{{ clienteBuscado.nombre }}</div>
                  <div class="text-caption text-grey-6">
                    {{ clienteBuscado.tipoDoc }}: {{ clienteBuscado.documento }} • Tel: {{ clienteBuscado.telefono }}
                  </div>
                </div>
                <q-btn color="positive" icon="check" label="Seleccionar" @click="seleccionarCliente(clienteBuscado)" size="sm" no-caps unelevated />
              </div>
            </div>

            <div class="text-caption text-grey-5 q-my-md text-center">— o seleccione directamente del registro —</div>

            <q-select
              outlined
              dense
              v-model="clienteIdSeleccionado"
              :options="opcionesClientes"
              emit-value
              map-options
              label="Seleccionar de la lista de clientes registrados"
              @update:model-value="onClienteSelectChange"
              class="bg-white"
            />

            <!-- Confirmación visual de cliente seleccionado -->
            <div v-if="clienteSeleccionado" class="selected-client-box q-mt-md row items-center justify-between q-pa-sm">
              <div class="row items-center q-gutter-x-sm">
                <q-icon name="check_circle" color="positive" size="20px" />
                <div>
                  <span class="text-caption text-grey-6">Pasajero asignado:</span>
                  <div class="text-weight-bold text-dark">
                    {{ clienteSeleccionado.nombre }} ({{ clienteSeleccionado.tipoDoc }}: {{ clienteSeleccionado.documento }})
                  </div>
                </div>
              </div>
              <q-btn flat dense size="sm" color="grey-7" icon="close" @click="deseleccionarCliente" no-caps />
            </div>
          </div>

          <div class="row justify-between q-mt-xl">
            <q-btn flat color="grey-8" label="Atrás" @click="paso = 1" no-caps />
            <q-btn
              color="primary"
              label="Continuar a Puesto"
              icon-right="arrow_forward"
              :disabled="!clienteSeleccionado"
              @click="paso = 3"
              no-caps
              unelevated
              class="q-px-lg text-weight-bold"
            />
          </div>
        </q-step>

        <!-- PASO 3: SELECCIONAR PUESTO -->
        <q-step
          :name="3"
          title="Puesto"
          icon="event_seat"
          :done="paso > 3"
          :disable="!viajeSeleccionado || !clienteSeleccionado"
          class="q-pa-lg"
        >
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-subtitle1 text-weight-bold text-dark">
                3. Selección de Puesto en el Vehículo
              </div>
              <div class="text-caption text-grey-6">
                Haga clic en un asiento disponible (verde) del mapa interactivo
              </div>
            </div>
            <div v-if="puestoSeleccionado" class="selected-indicator-pill">
              <q-icon name="check_circle" color="positive" size="14px" class="q-mr-xs" />
              <span class="text-caption text-weight-bold">Asiento elegido: #{{ puestoSeleccionado.numero }}</span>
            </div>
          </div>

          <div class="row q-col-gutter-xl items-start justify-center">
            <!-- Mapa interactivo de asientos -->
            <div class="col-12 col-md-6 text-center">
              <SeatMap
                :puestos="vehiculoDelViaje?.puestos || []"
                :capacidad="Number(vehiculoDelViaje?.capacidad || 20)"
                :puestosOcupados="puestosOcupados"
                :puestosPendientes="puestosPendientes"
                :puestoSeleccionado="puestoSeleccionado"
                :selectable="true"
                :conductor="vehiculoDelViaje?.conductor"
                @seleccionar="onSeleccionarPuesto"
              />
            </div>

            <!-- Resumen lateral del itinerario y puesto -->
            <div class="col-12 col-md-6">
              <div class="detail-summary-card">
                <div class="text-subtitle2 text-weight-bold text-dark q-mb-sm">Resumen de Selección</div>
                <q-separator class="q-mb-md" />

                <div class="column q-gutter-y-sm text-body2">
                  <div class="row justify-between">
                    <span class="text-grey-6">Ruta:</span>
                    <strong class="text-dark">{{ viajeSeleccionado?.origen }} → {{ viajeSeleccionado?.destino }}</strong>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Horario:</span>
                    <span>{{ viajeSeleccionado?.fecha }} ({{ viajeSeleccionado?.hora }})</span>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Vehículo:</span>
                    <span>{{ vehiculoDelViaje?.placa }} ({{ vehiculoDelViaje?.tipo }})</span>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Pasajero:</span>
                    <strong class="text-dark">{{ clienteSeleccionado?.nombre }}</strong>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Tarifa:</span>
                    <strong class="text-primary">${{ viajeSeleccionado?.precio?.toLocaleString('es-CO') }}</strong>
                  </div>
                </div>

                <q-separator class="q-my-md" />

                <div v-if="puestoSeleccionado">
                  <div class="seat-assigned-pill row items-center justify-between q-pa-sm q-mb-md">
                    <div class="row items-center q-gutter-x-xs">
                      <q-icon name="event_seat" color="primary" size="18px" />
                      <span class="text-weight-bold text-dark">Asiento seleccionado: #{{ puestoSeleccionado.numero }}</span>
                    </div>
                    <q-btn flat dense size="xs" color="negative" icon="close" label="Quitar" @click="puestoSeleccionado = null" no-caps />
                  </div>

                  <q-input
                    v-model="descripcionOpcional"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                    label="Nota u observación opcional"
                    placeholder="Ej. Pasajero con equipaje especial, asiento de pasillo..."
                    class="bg-white"
                  />
                </div>
                <div v-else class="empty-selection-hint q-pa-md text-center">
                  <q-icon name="touch_app" size="24px" color="grey-5" class="q-mb-xs block" />
                  <span class="text-caption text-grey-6">Haz clic sobre un asiento verde disponible en el mapa del bus para asignarlo.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="row justify-between q-mt-xl">
            <q-btn flat color="grey-8" label="Atrás" @click="paso = 2" no-caps />
            <q-btn
              color="primary"
              label="Continuar a Confirmación"
              icon-right="arrow_forward"
              :disabled="!puestoSeleccionado"
              @click="paso = 4"
              no-caps
              unelevated
              class="q-px-lg text-weight-bold"
            />
          </div>
        </q-step>

        <!-- PASO 4: CONFIRMAR INFORMACIÓN -->
        <q-step
          :name="4"
          title="Confirmar"
          icon="check_circle"
          :done="paso > 4"
          :disable="!viajeSeleccionado || !clienteSeleccionado || !puestoSeleccionado"
          class="q-pa-lg"
        >
          <div style="max-width: 580px;" class="q-mx-auto">
            <div class="text-center q-mb-lg">
              <div class="text-h6 text-weight-bold text-dark">Resumen de Liquidación de Tiquete</div>
              <div class="text-caption text-grey-6">Verifique la información antes de emitir la venta</div>
            </div>

            <div class="invoice-summary-card q-pa-lg">
              <div class="row items-center justify-between q-mb-md">
                <span class="text-subtitle2 text-weight-bold text-dark">Detalle de la Operación</span>
                <q-badge color="grey-2" text-color="primary" class="text-weight-bold">
                  Liquidación VIABUS
                </q-badge>
              </div>

              <q-separator class="q-mb-md" />

              <div class="column q-gutter-y-sm text-body2">
                <div class="row justify-between">
                  <span class="text-grey-6">Ruta de viaje:</span>
                  <strong class="text-dark">{{ viajeSeleccionado?.origen }} → {{ viajeSeleccionado?.destino }}</strong>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Fecha y hora:</span>
                  <span class="text-dark">{{ viajeSeleccionado?.fecha }} a las {{ viajeSeleccionado?.hora }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Pasajero titular:</span>
                  <strong class="text-dark">{{ clienteSeleccionado?.nombre }}</strong>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Documento:</span>
                  <span class="font-mono text-grey-8">{{ clienteSeleccionado?.tipoDoc }}: {{ clienteSeleccionado?.documento }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Vehículo / Placa:</span>
                  <span>{{ vehiculoDelViaje?.tipo }} — {{ vehiculoDelViaje?.placa }}</span>
                </div>
                <div class="row justify-between items-center">
                  <span class="text-grey-6">Puesto asignado:</span>
                  <span class="seat-badge-confirm">Puesto #{{ puestoSeleccionado?.numero }}</span>
                </div>

                <div v-if="descripcionOpcional" class="q-mt-xs">
                  <span class="text-grey-6 block text-caption">Observación:</span>
                  <span class="text-grey-8 text-caption bg-grey-1 q-pa-xs rounded-borders block">{{ descripcionOpcional }}</span>
                </div>

                <q-separator class="q-my-md" />

                <!-- Total Destacado -->
                <div class="total-row row items-center justify-between q-py-sm">
                  <div>
                    <span class="text-subtitle1 text-weight-bold text-dark">Total a Cobrar:</span>
                    <div class="text-caption text-grey-6">Tarifa de tiquete único</div>
                  </div>
                  <div class="text-h4 text-weight-bold text-primary">
                    ${{ viajeSeleccionado?.precio?.toLocaleString('es-CO') }}
                  </div>
                </div>
              </div>

              <div v-if="errorVenta" class="q-mt-md">
                <q-banner class="bg-red-1 text-negative rounded-borders" rounded>
                  {{ errorVenta }}
                </q-banner>
              </div>
            </div>
          </div>

          <div class="row justify-between q-mt-xl">
            <q-btn flat color="grey-8" label="Atrás" @click="paso = 3" no-caps />
            <q-btn
              color="positive"
              icon="payments"
              label="Confirmar y Emitir Tiquete"
              @click="confirmarVenta"
              no-caps
              unelevated
              class="q-px-xl text-weight-bold"
            />
          </div>
        </q-step>

        <!-- PASO 5: TIQUETE EMITIDO -->
        <q-step
          :name="5"
          title="Emitido"
          icon="receipt"
          :disable="!ventaCreada"
          class="q-pa-xl text-center"
        >
          <div style="max-width: 520px; margin: 0 auto;">
            <div class="success-icon-badge q-mb-md">
              <q-icon name="verified" size="44px" color="positive" />
            </div>

            <div class="text-h5 text-weight-bold text-dark q-mb-xs">¡Venta Confirmada con Éxito!</div>
            <div class="text-body2 text-grey-6 q-mb-lg">
              El tiquete ha sido generado y los asientos actualizados en tiempo real. Código:
              <strong class="text-dark font-mono">{{ ventaCreada?.id }}</strong>
            </div>

            <div class="row q-gutter-md justify-center">
              <q-btn
                color="primary"
                icon="description"
                label="Ver e Imprimir Tiquete"
                :to="`/tickets/${ventaCreada?.id}`"
                no-caps
                unelevated
                class="q-px-md text-weight-bold"
              />
              <q-btn
                outline
                color="grey-8"
                icon="add_shopping_cart"
                label="Realizar Otra Venta"
                @click="reiniciar"
                no-caps
              />
              <q-btn
                flat
                color="grey-7"
                label="Ir a Listado"
                to="/ventas"
                no-caps
              />
            </div>
          </div>
        </q-step>
      </q-stepper>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useViajeStore } from '../stores/viajeStore'
import { useVehiculoStore } from '../stores/vehiculoStore'
import { useClienteStore } from '../stores/clienteStore'
import { useVentaStore } from '../stores/ventaStore'
import SeatMap from '../components/SeatMap.vue'

const route = useRoute()

const viajeStore = useViajeStore()
const vehiculoStore = useVehiculoStore()
const clienteStore = useClienteStore()
const ventaStore = useVentaStore()

const paso = ref(1)
const viajeSeleccionado = ref(null)
const clienteSeleccionado = ref(null)
const puestoSeleccionado = ref(null)
const ventaCreada = ref(null)

const docBusqueda = ref('')
const clienteBuscado = ref(undefined)
const clienteIdSeleccionado = ref(null)
const descripcionOpcional = ref('')
const errorVenta = ref('')

function cambiarPaso(nuevoPaso) {
  if (nuevoPaso === 2 && !viajeSeleccionado.value) return
  if (nuevoPaso === 3 && (!viajeSeleccionado.value || !clienteSeleccionado.value)) return
  if (nuevoPaso === 4 && (!viajeSeleccionado.value || !clienteSeleccionado.value || !puestoSeleccionado.value)) return
  if (nuevoPaso === 5 && !ventaCreada.value) return
  paso.value = nuevoPaso
}

const clientes = computed(() => clienteStore.clientes)
const opcionesClientes = computed(() =>
  clientes.value.map(c => ({
    label: `${c.nombre} – ${c.tipoDoc}: ${c.documento}`,
    value: c.id
  }))
)

const viajesDisponibles = computed(() =>
  viajeStore.viajes.filter(v => v.estado !== 'Cancelado' && v.estado !== 'Finalizado' && v.estado !== 'Completo')
)

const vehiculoDelViaje = computed(() => {
  if (!viajeSeleccionado.value) return null
  const vId = viajeSeleccionado.value.vehiculoId || (viajeSeleccionado.value.bus ? (viajeSeleccionado.value.bus._id || viajeSeleccionado.value.bus) : null)
  let veh = vId ? vehiculoStore.obtenerVehiculo(vId) : null
  if (!veh && viajeSeleccionado.value.bus && typeof viajeSeleccionado.value.bus === 'object') {
    veh = viajeSeleccionado.value.bus
  }
  if (!veh && vehiculoStore.vehiculos.length > 0) {
    veh = vehiculoStore.vehiculos[0]
  }
  return veh
})

const puestosOcupados = computed(() =>
  viajeSeleccionado.value ? ventaStore.puestosOcupadosPorViaje(viajeSeleccionado.value.id || viajeSeleccionado.value._id) : []
)

const puestosPendientes = computed(() =>
  viajeSeleccionado.value ? ventaStore.puestosPendientesPorViaje(viajeSeleccionado.value.id || viajeSeleccionado.value._id) : []
)

function getVehiculo(id) {
  return vehiculoStore.obtenerVehiculo(id)
}

function getOcupados(viaje) {
  return ventaStore.puestosOcupadosPorViaje(viaje.id).length
}

function getDisponibles(viaje) {
  const v = getVehiculo(viaje.vehiculoId)
  return v ? v.capacidad - getOcupados(viaje) : 0
}

function seleccionarViaje(viaje) {
  viajeSeleccionado.value = viaje
  puestoSeleccionado.value = null
}

function buscarCliente() {
  const doc = docBusqueda.value?.trim()
  if (!doc) {
    clienteBuscado.value = undefined
    return
  }
  clienteBuscado.value = clienteStore.buscarClientePorDocumento(doc) || null
}

function seleccionarCliente(c) {
  clienteSeleccionado.value = c
  clienteIdSeleccionado.value = c.id
  clienteBuscado.value = undefined
  docBusqueda.value = ''
}

function deseleccionarCliente() {
  clienteSeleccionado.value = null
  clienteIdSeleccionado.value = null
}

function onClienteSelectChange(id) {
  if (!id) return
  clienteSeleccionado.value = clienteStore.obtenerCliente(id)
}

function onSeleccionarPuesto(puesto) {
  puestoSeleccionado.value = puesto
}

async function confirmarVenta() {
  errorVenta.value = ''
  try {
    const nueva = await ventaStore.crearVenta({
      viajeId: viajeSeleccionado.value.id || viajeSeleccionado.value._id,
      clienteId: clienteSeleccionado.value.id || clienteSeleccionado.value._id,
      puestoId: puestoSeleccionado.value.numero,
      precio: viajeSeleccionado.value.precio,
      descripcion: descripcionOpcional.value
    })
    ventaCreada.value = nueva
    paso.value = 5
  } catch (e) {
    errorVenta.value = e.message
  }
}

function reiniciar() {
  paso.value = 1
  viajeSeleccionado.value = null
  clienteSeleccionado.value = null
  puestoSeleccionado.value = null
  ventaCreada.value = null
  docBusqueda.value = ''
  clienteBuscado.value = undefined
  clienteIdSeleccionado.value = null
  descripcionOpcional.value = ''
  errorVenta.value = ''
}

function verificarViajeDesdeRuta() {
  const vId = route.query.viajeId
  if (vId && viajeStore.viajes.length > 0) {
    const vEncontrado = viajeStore.viajes.find(v => String(v.id) === String(vId) || String(v._id) === String(vId))
    if (vEncontrado) {
      seleccionarViaje(vEncontrado)
      if (paso.value === 1) {
        paso.value = 2
      }
    }
  }
}

onMounted(async () => {
  await Promise.allSettled([
    viajeStore.cargarViajes(),
    vehiculoStore.cargarVehiculos(),
    clienteStore.cargarClientes(),
    ventaStore.cargarVentas()
  ])
  verificarViajeDesdeRuta()
})

watch(() => route.query.viajeId, () => {
  verificarViajeDesdeRuta()
})

watch(() => viajeStore.viajes, () => {
  if (route.query.viajeId && !viajeSeleccionado.value) {
    verificarViajeDesdeRuta()
  }
})
</script>

<style scoped>
.trip-select-card {
  background: #FFFFFF;
  border: 1px solid #E4E4E7;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.trip-select-card:hover {
  border-color: #2563EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.trip-select-active {
  border: 2px solid #2563EB !important;
  background-color: #EFF6FF !important;
}

.trip-code-pill {
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  background: #F4F4F5;
  color: #18181B;
  border: 1px solid #E4E4E7;
  padding: 2px 6px;
  border-radius: 4px;
}

.pt-top-border {
  border-top: 1px solid #F4F4F5;
  padding-top: 8px;
}

.selected-indicator-pill {
  background: #ECFDF5;
  color: #047857;
  border: 1px solid #A7F3D0;
  padding: 4px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
}

.selected-trip-banner {
  background: #FAFAFA;
  border: 1px solid #E4E4E7;
  border-radius: 10px;
}

.banner-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
}

.warning-alert-box {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 8px;
}

.client-result-card {
  background: #F8F9FA;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
}

.selected-client-box {
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  border-radius: 8px;
}

.detail-summary-card {
  background: #FAFAFA;
  border: 1px solid #E4E4E7;
  border-radius: 12px;
  padding: 20px;
}

.seat-assigned-pill {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 8px;
}

.empty-selection-hint {
  background: #FFFFFF;
  border: 1px dashed #E4E4E7;
  border-radius: 8px;
}

.invoice-summary-card {
  background: #FFFFFF;
  border: 1px solid #E4E4E7;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.seat-badge-confirm {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
  font-weight: 700;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 6px;
}

.total-row {
  border-top: 1px solid #E4E4E7;
  border-bottom: 1px solid #E4E4E7;
}

.success-icon-badge {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: #ECFDF5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.font-mono {
  font-family: monospace;
}
</style>
