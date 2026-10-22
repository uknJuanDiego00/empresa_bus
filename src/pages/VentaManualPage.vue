<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1150px;">
      <!-- Cabecera -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="alt_route" color="primary" size="26px" />
            <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">
              Venta por Trayectoria
            </div>
          </div>
          <div class="text-caption" style="color: var(--vb-text-secondary);">
            Emisión de tiquetes según el bus seleccionado, su trayectoria autorizada y el orden de paradas del recorrido
          </div>
        </div>
        <q-btn flat color="grey-8" icon="arrow_back" label="Volver a Viajes" to="/viajes" no-caps />
      </div>

      <!-- PASO 1: SELECCIONAR BUS Y CONSULTAR TRAYECTORIA ASIGNADA -->
      <q-card flat bordered class="vb-card q-mb-lg shadow-1">
        <q-card-section class="q-pb-sm">
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="directions_bus" color="primary" size="22px" />
              <div class="text-subtitle1 text-weight-bold" style="color: var(--vb-text-primary);">
                1. Selección de Bus y Trayectoria Autorizada
              </div>
            </div>
            <q-badge v-if="busSeleccionado" color="primary" class="text-weight-bold">
              Bus Placa: {{ busSeleccionado.placa }}
            </q-badge>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row q-col-gutter-md q-mb-md">
            <!-- Selector de Bus -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="busSeleccionadoId"
                :options="opcionesBuses()"
                emit-value
                map-options
                outlined
                dense
                label="Seleccionar Bus (Vehículo) *"
                @update:model-value="onBusChange"
              >
                <template v-slot:prepend>
                  <q-icon name="directions_bus" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Selector de Trayectoria asignada al bus -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="trayectoriaSeleccionadaId"
                :options="opcionesTrayectoriasDelBus()"
                emit-value
                map-options
                outlined
                dense
                label="Trayectoria asignada al bus *"
                :disable="!busSeleccionado || trayectoriasDelBus().length === 0"
                @update:model-value="onTrayectoriaChange"
              >
                <template v-slot:prepend>
                  <q-icon name="alt_route" color="primary" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- BLOQUEO: Si el bus no tiene trayectoria asignada -->
          <q-banner
            v-if="busSeleccionado && trayectoriasDelBus().length === 0"
            class="bg-orange-1 text-dark rounded-borders q-mt-sm"
            rounded
          >
            <template v-slot:avatar>
              <q-icon name="warning" color="warning" size="28px" />
            </template>
            <div>
              <strong class="text-weight-bold text-dark">VENTA POR TRAYECTORIA BLOQUEADA:</strong>
              El bus seleccionado (<strong>{{ busSeleccionado.placa }}</strong> — {{ busSeleccionado.empresa }})
              no tiene ninguna trayectoria o viaje asignado actualmente en el sistema.
            </div>
            <div class="text-caption text-grey-8 q-mt-xs">
              Para vender tiquetes en este bus, debe programarle primero una trayectoria e itinerario en el módulo de
              <strong>Viajes</strong>.
            </div>
            <div class="q-mt-sm">
              <q-btn outline color="primary" icon="add" label="Programar Trayectoria en Viajes" to="/viajes/crear" size="sm" no-caps />
            </div>
          </q-banner>

          <!-- Detalle de la trayectoria asignada seleccionada -->
          <div v-if="trayectoriaActual" class="q-mt-sm">
            <div class="bg-blue-1 text-primary q-pa-md rounded-borders">
              <div class="row items-center justify-between q-mb-xs">
                <div class="row items-center q-gutter-x-sm">
                  <q-badge color="primary" text-color="white" class="font-mono text-weight-bold">
                    {{ trayectoriaActual.codigo }}
                  </q-badge>
                  <strong class="text-subtitle2" style="color: var(--vb-text-primary);">
                    Itinerario Oficial de la Trayectoria:
                  </strong>
                </div>
                <div class="text-subtitle1 text-weight-bold text-positive">
                  Tarifa base: ${{ Number(trayectoriaActual.precio || 0).toLocaleString('es-CO') }}
                </div>
              </div>

              <!-- Secuencia oficial de paradas autorizadas -->
              <div class="row items-center q-gutter-xs flex-wrap q-my-sm">
                <q-badge color="primary" text-color="white" class="text-weight-bold">
                  <q-icon name="trip_origin" size="12px" class="q-mr-xs" />
                  {{ trayectoriaActual.origen }} (Inicio)
                </q-badge>
                <template v-for="(parada, idx) in (trayectoriaActual.paradasIntermedias || [])" :key="idx">
                  <q-icon name="arrow_forward" size="14px" color="grey-6" />
                  <q-badge color="amber-8" text-color="white" class="text-weight-bold">
                    <q-icon name="place" size="12px" class="q-mr-xs" />
                    {{ parada }}
                  </q-badge>
                </template>
                <q-icon name="arrow_forward" size="14px" color="grey-6" />
                <q-badge color="positive" text-color="white" class="text-weight-bold">
                  <q-icon name="flag" size="12px" class="q-mr-xs" />
                  {{ trayectoriaActual.destino }} (Destino)
                </q-badge>
              </div>

              <div class="row q-gutter-x-lg text-caption text-grey-8 q-mt-xs">
                <span>Fecha: <strong>{{ trayectoriaActual.fecha }}</strong></span>
                <span>Hora de Salida: <strong>{{ trayectoriaActual.hora }}</strong></span>
                <span>Capacidad Bus: <strong>{{ busSeleccionado?.capacidad }} puestos</strong></span>
                <span>Puestos Disponibles: <strong class="text-positive">{{ asientosDisponibles() }}</strong></span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- PASO 2: CONFIGURACIÓN DEL RECORRIDO (ORIGEN Y DESTINO AUTORIZADOS) -->
      <q-card v-if="trayectoriaActual" flat bordered class="vb-card q-mb-lg shadow-1">
        <q-card-section class="q-pb-sm">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="edit_road" color="primary" size="22px" />
            <div class="text-subtitle1 text-weight-bold" style="color: var(--vb-text-primary);">
              2. Segmento del Recorrido (Origen y Destino de la Venta)
            </div>
          </div>
          <div class="text-caption text-grey-6">
            Solo se admiten puntos que pertenezcan a la trayectoria autorizada y respeten el orden de las paradas
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row q-col-gutter-md items-center">
            <!-- Origen (Embarque) -->
            <div class="col-12 col-sm-5">
              <q-select
                v-model="origenSeleccionado"
                :options="opcionesOrigenAutorizadas()"
                outlined
                dense
                label="Origen (Lugar de Embarque) *"
                @update:model-value="onOrigenChange"
              >
                <template v-slot:prepend>
                  <q-icon name="login" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Indicador Flecha -->
            <div class="col-12 col-sm-2 text-center gt-xs">
              <q-icon name="arrow_forward" size="24px" color="primary" />
            </div>

            <!-- Destino (Desembarque) -->
            <div class="col-12 col-sm-5">
              <q-select
                v-model="destinoSeleccionado"
                :options="opcionesDestinoAutorizadas()"
                outlined
                dense
                label="Destino (Lugar de Desembarque) *"
                :disable="!origenSeleccionado"
                @update:model-value="onDestinoChange"
              >
                <template v-slot:prepend>
                  <q-icon name="logout" color="positive" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Validación de orden y recorrido -->
          <div v-if="errorRecorrido" class="q-mt-sm">
            <q-banner dense rounded class="bg-red-1 text-negative">
              <template v-slot:avatar><q-icon name="error" /></template>
              {{ errorRecorrido }}
            </q-banner>
          </div>

          <div v-else-if="origenSeleccionado && destinoSeleccionado" class="q-mt-sm bg-grey-1 q-pa-sm rounded-borders row items-center justify-between text-caption">
            <div>
              <q-icon name="check_circle" color="positive" size="16px" class="q-mr-xs" />
              Recorrido válido de la trayectoria: <strong>{{ origenSeleccionado }} → {{ destinoSeleccionado }}</strong>
            </div>
            <div>
              <span class="text-grey-7">Método de pago:</span>
              <q-select
                v-model="metodoPago"
                :options="metodosPago"
                dense outlined
                class="inline-block q-ml-sm"
                style="min-width: 140px;"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- PASO 3: MAPA DE ASIENTOS Y ASIGNACIÓN DE PASAJEROS -->
      <div v-if="trayectoriaActual && origenSeleccionado && destinoSeleccionado && !errorRecorrido">
        <div class="row q-col-gutter-lg items-start">
          <!-- Mapa de asientos -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="vb-card shadow-1">
              <q-card-section class="q-pb-sm">
                <div class="row items-center q-gutter-x-sm">
                  <q-icon name="event_seat" color="primary" size="22px" />
                  <div class="text-subtitle1 text-weight-bold" style="color: var(--vb-text-primary);">
                    3. Selección de Asientos
                  </div>
                </div>
                <div class="text-caption text-grey-6">Haga clic en los puestos disponibles (verde) para seleccionarlos</div>
              </q-card-section>
              <q-separator />
              <q-card-section>
                <SeatMap
                  :puestos="busSeleccionado?.puestos || []"
                  :capacidad="Number(busSeleccionado?.capacidad || 20)"
                  :tipoVehiculo="busSeleccionado?.tipo || 'Bus'"
                  :puestosOcupados="puestosOcupados()"
                  :puestosPendientes="[]"
                  :puestosSeleccionados="asientosSeleccionados"
                  :puestoSeleccionado="null"
                  :selectable="true"
                  :conductor="busSeleccionado?.conductor"
                  @seleccionar="onSeleccionarAsiento"
                />

                <!-- Asientos seleccionados -->
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

          <!-- Panel de Asignación de Pasajeros -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="vb-card shadow-1">
              <q-card-section class="q-pb-sm">
                <div class="row items-center justify-between">
                  <div class="row items-center q-gutter-x-sm">
                    <q-icon name="people" color="primary" size="22px" />
                    <div class="text-subtitle1 text-weight-bold" style="color: var(--vb-text-primary);">
                      4. Asignar Pasajeros
                    </div>
                  </div>
                  <q-badge v-if="asientosSeleccionados.length > 0" color="primary">
                    {{ pasajerosAsignados().length }}/{{ asientosSeleccionados.length }} asignados
                  </q-badge>
                </div>
                <div class="text-caption text-grey-6">Complete los datos de cada pasajero por puesto</div>
              </q-card-section>
              <q-separator />
              <q-card-section>
                <div v-if="asientosSeleccionados.length === 0" class="text-center q-pa-lg text-grey-5">
                  <q-icon name="touch_app" size="32px" class="q-mb-xs block" />
                  <div class="text-caption">Seleccione asientos en el mapa para asignar los pasajeros</div>
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

                    <!-- Búsqueda rápida por documento -->
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
                          <q-icon name="info" /> No encontrado en clientes registrados. Ingrese datos manuales:
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

                    <!-- O ingresar directamente nombre y cédula -->
                    <div v-if="!getItemPasajero(asiento.numero)" class="row q-col-gutter-xs q-mt-xs">
                      <div class="col-7">
                        <q-input
                          v-model="manualPasajero[asiento.numero].nombre"
                          outlined dense
                          placeholder="Nombre y apellido *"
                          @blur="asignarManual(asiento.numero)"
                        />
                      </div>
                      <div class="col-5">
                        <q-input
                          v-model="manualPasajero[asiento.numero].documento"
                          outlined dense
                          placeholder="Documento *"
                          @blur="asignarManual(asiento.numero)"
                        />
                      </div>
                    </div>

                    <!-- Pasajero asignado -->
                    <div v-if="getItemPasajero(asiento.numero)" class="bg-blue-1 rounded-borders q-pa-sm q-mt-xs">
                      <div class="row items-center q-gutter-x-sm">
                        <q-icon name="person" color="primary" />
                        <div>
                          <div class="text-weight-bold text-caption text-dark">
                            {{ getItemPasajero(asiento.numero).customerName }}
                          </div>
                          <div class="text-caption text-grey-7">{{ getItemPasajero(asiento.numero).customerDoc }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Observaciones -->
                <q-input
                  v-if="asientosSeleccionados.length > 0"
                  v-model="notasVenta"
                  outlined dense type="textarea" rows="2"
                  label="Observaciones del viaje (opcional)"
                  placeholder="Ej. Pasajero con equipaje de bodega, menor de edad..."
                  class="q-mt-md"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- RESUMEN FINAL Y CONFIRMACIÓN DE VENTA -->
        <q-card
          v-if="asientosSeleccionados.length > 0 && pasajerosAsignados().length === asientosSeleccionados.length"
          flat bordered class="vb-card q-mt-lg shadow-1"
        >
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: var(--vb-text-primary);">
              5. Resumen de Venta por Trayectoria
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-6">Bus Asignado</div>
                <div class="text-weight-bold">{{ busSeleccionado?.placa }} ({{ busSeleccionado?.tipo }})</div>
                <div class="text-caption text-grey-7">{{ busSeleccionado?.empresa }} • Cond: {{ busSeleccionado?.conductor }}</div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-6">Trayectoria y Horario</div>
                <div class="text-weight-bold text-primary">{{ trayectoriaActual?.codigo }}</div>
                <div class="text-caption text-grey-8">{{ trayectoriaActual?.fecha }} a las {{ trayectoriaActual?.hora }}</div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-6">Recorrido del Pasajero</div>
                <div class="text-weight-bold text-positive">{{ origenSeleccionado }} → {{ destinoSeleccionado }}</div>
                <div class="text-caption text-grey-7">Trayecto validado en sentido de ruta</div>
              </div>
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
                <div class="text-caption text-grey-6">Total a Liquidar</div>
                <div class="text-h4 text-weight-bold text-positive">
                  ${{ totalVenta().toLocaleString('es-CO') }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ asientosSeleccionados.length }} tiquete(s) × ${{ Number(trayectoriaActual?.precio || 0).toLocaleString('es-CO') }}
                  • Método de pago: {{ metodoPago }}
                </div>
              </div>

              <div class="row q-gutter-sm">
                <q-btn
                  color="positive" icon="payments" label="Confirmar y Emitir Tiquete(s)"
                  @click="confirmarVenta" no-caps unelevated
                  :loading="cargando" :disable="cargando"
                  class="text-weight-bold q-px-lg shadow-1"
                />
              </div>
            </div>

            <q-banner v-if="errorVenta" class="bg-red-1 text-negative q-mt-md rounded-borders" rounded>
              <q-icon name="error" />
              {{ errorVenta }}
            </q-banner>
          </q-card-section>
        </q-card>

        <!-- Banner si faltan pasajeros por asignar -->
        <q-banner
          v-else-if="asientosSeleccionados.length > 0 && pasajerosAsignados().length < asientosSeleccionados.length"
          class="bg-orange-1 text-dark q-mt-md rounded-borders"
          rounded
        >
          <q-icon name="warning" color="warning" size="20px" class="q-mr-xs" />
          Faltan {{ asientosSeleccionados.length - pasajerosAsignados().length }} pasajero(s) por asignar.
          Cada asiento seleccionado debe tener asignado nombre y documento antes de confirmar.
        </q-banner>
      </div>

      <!-- RESULTADO EXITOSO DE LA VENTA -->
      <q-card v-if="ventasCreadas.length > 0" flat bordered class="vb-card q-mt-lg text-center shadow-2">
        <q-card-section class="q-pa-xl">
          <q-icon name="verified" color="positive" size="52px" class="q-mb-md" />
          <div class="text-h5 text-weight-bold q-mb-xs" style="color: var(--vb-text-primary);">
            ¡Venta por Trayectoria emitida exitosamente!
          </div>
          <div class="text-body2 text-grey-7 q-mb-md">
            Se emitieron <strong>{{ ventasCreadas.length }}</strong> tiquete(s) para el bus <strong>{{ busSeleccionado?.placa }}</strong>
            en la trayectoria <strong>{{ trayectoriaActual?.codigo }}</strong> ({{ origenSeleccionado }} → {{ destinoSeleccionado }}).
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
              outline color="primary" icon="description" :label="`Ver Tiquete ${t.id}`"
              :to="`/tickets/${t.id}`" no-caps size="sm"
            />
          </div>
          <div class="row q-gutter-sm justify-center q-mt-lg">
            <q-btn outline color="grey-8" icon="add_shopping_cart" label="Nueva Venta por Trayectoria" @click="reiniciar" no-caps />
            <q-btn flat color="grey-7" label="Volver a Ventas" to="/ventas" no-caps />
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

const busSeleccionadoId = ref(null)
const busSeleccionado = ref(null)
const trayectoriaSeleccionadaId = ref(null)
const trayectoriaActual = ref(null)

const origenSeleccionado = ref(null)
const destinoSeleccionado = ref(null)
const errorRecorrido = ref('')

const metodoPago = ref('Efectivo')
const notasVenta = ref('')
const asientosSeleccionados = ref([])
const itemsPasajeros = ref({}) // { [numeroPuesto]: { customerName, customerDoc, clienteId } }
const busquedaDoc = ref({})
const resultadoBusqueda = ref({})
const manualPasajero = ref({}) // { [numeroPuesto]: { nombre: '', documento: '' } }

const cargando = ref(false)
const errorVenta = ref('')
const ventasCreadas = ref([])
const saleIdCreado = ref('')

const metodosPago = ['Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'Transferencia', 'Nequi', 'Daviplata']

onMounted(async () => {
  cargando.value = true
  await Promise.allSettled([
    vehiculoStore.cargarVehiculos(),
    viajeStore.cargarViajes(),
    clienteStore.cargarClientes(),
    ventaStore.cargarVentas()
  ])
  cargando.value = false
})

function opcionesBuses() {
  const opts = []
  for (const v of vehiculoStore.vehiculos) {
    opts.push({
      label: `${v.placa} — ${v.tipo} (${v.empresa || 'VIABUS Express'}) [${v.capacidad} puestos] | Conductor: ${v.conductor}`,
      value: v.id
    })
  }
  return opts
}

function trayectoriasDelBus() {
  if (!busSeleccionado.value) return []
  const busId = String(busSeleccionado.value.id)
  const busMongoId = String(busSeleccionado.value._id || '')
  return viajeStore.viajes.filter(v => {
    const vBus = String(v.vehiculoId || '')
    const coincide = vBus === busId || (busMongoId && vBus === busMongoId)
    const estadoOk = v.estado !== 'Cancelado' && v.estado !== 'Finalizado'
    return coincide && estadoOk
  })
}

function opcionesTrayectoriasDelBus() {
  const trayectorias = trayectoriasDelBus()
  return trayectorias.map(t => ({
    label: `${t.codigo} | ${t.origen} → ${t.destino} (${t.fecha} ${t.hora}) — Tarifa: $${Number(t.precio || 0).toLocaleString('es-CO')}`,
    value: t.id
  }))
}

function onBusChange(busId) {
  busSeleccionado.value = vehiculoStore.obtenerVehiculo(busId)
  trayectoriaSeleccionadaId.value = null
  trayectoriaActual.value = null
  limpiarSeleccionTrayecto()

  // Si tiene exactamente una trayectoria asignada, auto-seleccionarla
  const trayectorias = trayectoriasDelBus()
  if (trayectorias.length === 1) {
    onTrayectoriaChange(trayectorias[0].id)
    trayectoriaSeleccionadaId.value = trayectorias[0].id
  }
}

function onTrayectoriaChange(trayectoriaId) {
  trayectoriaActual.value = viajeStore.obtenerViaje(trayectoriaId)
  limpiarSeleccionTrayecto()

  if (trayectoriaActual.value) {
    // Por defecto sugerir origen y destino de la trayectoria
    origenSeleccionado.value = trayectoriaActual.value.origen
    destinoSeleccionado.value = trayectoriaActual.value.destino
    validarRecorrido()
  }
}

function limpiarSeleccionTrayecto() {
  origenSeleccionado.value = null
  destinoSeleccionado.value = null
  errorRecorrido.value = ''
  asientosSeleccionados.value = []
  itemsPasajeros.value = {}
  busquedaDoc.value = {}
  resultadoBusqueda.value = {}
  manualPasajero.value = {}
  errorVenta.value = ''
  ventasCreadas.value = []
}

function secuenciaParadasTrayectoria() {
  if (!trayectoriaActual.value) return []
  const orig = trayectoriaActual.value.origen
  const dest = trayectoriaActual.value.destino
  const intermedias = Array.isArray(trayectoriaActual.value.paradasIntermedias) ? trayectoriaActual.value.paradasIntermedias : []
  return [orig, ...intermedias, dest]
}

function opcionesOrigenAutorizadas() {
  const sec = secuenciaParadasTrayectoria()
  if (sec.length <= 1) return []
  // Origen puede ser cualquier parada excepto la última
  return sec.slice(0, -1)
}

function opcionesDestinoAutorizadas() {
  const sec = secuenciaParadasTrayectoria()
  if (!origenSeleccionado.value) return sec.slice(1)
  const idxO = sec.indexOf(origenSeleccionado.value)
  if (idxO === -1) return []
  // Destino debe estar ESTRICTAMENTE después del origen
  return sec.slice(idxO + 1)
}

function onOrigenChange(val) {
  origenSeleccionado.value = val
  const destinosPosibles = opcionesDestinoAutorizadas()
  if (!destinosPosibles.includes(destinoSeleccionado.value)) {
    destinoSeleccionado.value = destinosPosibles.length > 0 ? destinosPosibles[destinosPosibles.length - 1] : null
  }
  validarRecorrido()
}

function onDestinoChange(val) {
  destinoSeleccionado.value = val
  validarRecorrido()
}

function validarRecorrido() {
  errorRecorrido.value = ''
  if (!origenSeleccionado.value || !destinoSeleccionado.value) return false

  const sec = secuenciaParadasTrayectoria()
  const idxO = sec.indexOf(origenSeleccionado.value)
  const idxD = sec.indexOf(destinoSeleccionado.value)

  if (idxO === -1) {
    errorRecorrido.value = `El origen "${origenSeleccionado.value}" no pertenece a la trayectoria autorizada.`
    return false
  }

  if (idxD === -1) {
    errorRecorrido.value = `El destino "${destinoSeleccionado.value}" no pertenece a la trayectoria autorizada.`
    return false
  }

  if (idxO >= idxD) {
    errorRecorrido.value = `RECORRIDO INVÁLIDO: El destino "${destinoSeleccionado.value}" debe estar ubicado después del origen "${origenSeleccionado.value}" en el orden oficial de paradas de la trayectoria.`
    return false
  }

  return true
}

function puestosOcupados() {
  if (!trayectoriaActual.value) return []
  return ventaStore.puestosOcupadosPorViaje(trayectoriaActual.value.id)
}

function asientosDisponibles() {
  if (!busSeleccionado.value) return 0
  const cap = busSeleccionado.value.capacidad || 0
  const ocupados = puestosOcupados().length
  return Math.max(0, cap - ocupados)
}

function onSeleccionarAsiento(asiento) {
  if (!asiento) return
  const num = Number(asiento.numero || asiento.id)
  const idx = asientosSeleccionados.value.findIndex(a => a.numero === num)
  if (idx >= 0) {
    asientosSeleccionados.value.splice(idx, 1)
    delete itemsPasajeros.value[num]
    delete busquedaDoc.value[num]
    delete resultadoBusqueda.value[num]
    delete manualPasajero.value[num]
  } else {
    asientosSeleccionados.value.push({ id: asiento.id, numero: num })
    manualPasajero.value[num] = { nombre: '', documento: '' }
  }
}

function quitarAsiento(asiento) {
  const idx = asientosSeleccionados.value.findIndex(a => a.numero === asiento.numero)
  if (idx >= 0) {
    asientosSeleccionados.value.splice(idx, 1)
    delete itemsPasajeros.value[asiento.numero]
    delete busquedaDoc.value[asiento.numero]
    delete resultadoBusqueda.value[asiento.numero]
    delete manualPasajero.value[asiento.numero]
  }
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
}

function asignarManual(numPuesto) {
  const datos = manualPasajero.value[numPuesto]
  if (datos && datos.nombre?.trim() && datos.documento?.trim()) {
    itemsPasajeros.value = {
      ...itemsPasajeros.value,
      [numPuesto]: {
        customerName: datos.nombre.trim(),
        customerDoc: datos.documento.trim()
      }
    }
  }
}

function limpiarPasajero(numPuesto) {
  const nuevo = { ...itemsPasajeros.value }
  delete nuevo[numPuesto]
  itemsPasajeros.value = nuevo
  if (manualPasajero.value[numPuesto]) {
    manualPasajero.value[numPuesto] = { nombre: '', documento: '' }
  }
}

function getItemPasajero(numPuesto) {
  return itemsPasajeros.value[numPuesto] || null
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
      recorrido: `${origenSeleccionado.value} → ${destinoSeleccionado.value}`,
      precio: trayectoriaActual.value?.precio || 0
    })
  }
  return items
}

function totalVenta() {
  return asientosSeleccionados.value.length * (trayectoriaActual.value?.precio || 0)
}

const columnsResumen = [
  { name: 'puestoId', label: 'Asiento', field: 'puestoId', align: 'center' },
  { name: 'pasajero', label: 'Pasajero', field: 'pasajero', align: 'left' },
  { name: 'documento', label: 'Documento', field: 'documento', align: 'left' },
  { name: 'recorrido', label: 'Trayecto', field: 'recorrido', align: 'left' },
  { name: 'precio', label: 'Tarifa', field: 'precio', align: 'right',
    format: (val) => `$${Number(val).toLocaleString('es-CO')}` }
]

async function confirmarVenta() {
  errorVenta.value = ''

  if (!busSeleccionado.value) {
    errorVenta.value = 'Debe seleccionar un bus.'
    return
  }

  if (!trayectoriaActual.value) {
    errorVenta.value = 'Debe seleccionar una trayectoria asignada al bus.'
    return
  }

  if (!validarRecorrido()) {
    return
  }

  if (asientosSeleccionados.value.length === 0) {
    errorVenta.value = 'Debe seleccionar al menos un asiento en el mapa.'
    return
  }

  if (pasajerosAsignados().length < asientosSeleccionados.value.length) {
    errorVenta.value = 'Todos los asientos deben tener un pasajero asignado.'
    return
  }

  // Validar disponibilidad actualizada de asientos
  for (const a of asientosSeleccionados.value) {
    if (ventaStore.puestoOcupado(trayectoriaActual.value.id, a.numero)) {
      errorVenta.value = `El asiento #${a.numero} acaba de ser ocupado. Por favor seleccione otro asiento.`
      return
    }
  }

  cargando.value = true

  const items = []
  for (const a of asientosSeleccionados.value) {
    const p = itemsPasajeros.value[a.numero]
    items.push({
      puestoId: a.numero,
      customerName: p.customerName,
      customerDoc: p.customerDoc,
      clienteId: p.clienteId || undefined,
      precio: trayectoriaActual.value.precio,
      origen: origenSeleccionado.value,
      destino: destinoSeleccionado.value,
      notes: notasVenta.value || ''
    })
  }

  const payload = {
    vehiculoId: busSeleccionado.value.id,
    viajeId: trayectoriaActual.value.id,
    origen: origenSeleccionado.value,
    destino: destinoSeleccionado.value,
    metodoPago: metodoPago.value,
    paymentMethod: metodoPago.value,
    items
  }

  try {
    const res = await ventaStore.crearVentaMultiple(payload)
    ventasCreadas.value = res.tiquetes || []
    saleIdCreado.value = res.saleId || ''

    $q.notify({
      type: 'positive',
      icon: 'verified',
      message: `Venta por trayectoria exitosa: ${ventasCreadas.value.length} tiquete(s) emitido(s).`,
      position: 'top'
    })

    await ventaStore.cargarVentas()
  } catch (e) {
    errorVenta.value = e.message || 'Error al procesar la venta por trayectoria.'
    $q.notify({
      type: 'negative',
      message: errorVenta.value,
      position: 'top'
    })
  } finally {
    cargando.value = false
  }
}

function reiniciar() {
  busSeleccionadoId.value = null
  busSeleccionado.value = null
  trayectoriaSeleccionadaId.value = null
  trayectoriaActual.value = null
  limpiarSeleccionTrayecto()
  notasVenta.value = ''
  saleIdCreado.value = ''
}
</script>

<style scoped>
.pasajero-slot {
  background: var(--vb-bg-surface);
  border: 1px solid var(--vb-border);
}
</style>
