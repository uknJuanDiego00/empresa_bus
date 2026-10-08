<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 840px;">
      <!-- CABECERA -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bold text-dark q-mb-xs">Programar Nuevo Viaje</div>
          <div class="text-subtitle2 text-grey-7">Configuración de itinerario, horarios y asignación de vehículo</div>
        </div>
        <q-btn flat color="grey-8" icon="arrow_back" label="Volver a Viajes" to="/viajes" no-caps />
      </div>

      <!-- MENSAJE DE ÉXITO -->
      <q-banner v-if="exito" class="bg-green-1 text-positive q-mb-md rounded-borders" rounded>
        <template v-slot:avatar>
          <q-icon name="check_circle" color="positive" size="24px" />
        </template>
        <div>
          Viaje programado con éxito en el sistema. Código de viaje asignado:
          <strong class="font-mono text-dark">{{ codigoCreado }}</strong>
        </div>
      </q-banner>

      <!-- FORMULARIO -->
      <q-card flat class="vb-card">
        <q-card-section class="q-pa-xl">
          <q-form ref="formRef" @submit="guardar" class="q-gutter-y-lg">
            
            <!-- SECCIÓN 1: ITINERARIO -->
            <div>
              <div class="text-subtitle2 text-weight-bold text-dark q-mb-xs">1. DATOS DEL ITINERARIO</div>
              <div class="text-caption text-grey-6 q-mb-md">Defina origen, destino y horarios del servicio</div>
              
              <div class="row q-col-gutter-md">
                <!-- Origen -->
                <div class="col-12 col-sm-6">
                  <q-select
                    outlined
                    dense
                    v-model="form.origen"
                    use-input
                    input-debounce="0"
                    :options="opcionesOrigen"
                    @filter="filtrarOrigen"
                    label="Ciudad de origen *"
                    placeholder="Seleccione o escriba ciudad"
                    lazy-rules
                    :rules="[val => !!val || 'El origen es obligatorio']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="trip_origin" size="18px" color="grey-6" />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">No se encontraron ciudades</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <!-- Destino -->
                <div class="col-12 col-sm-6">
                  <q-select
                    outlined
                    dense
                    v-model="form.destino"
                    use-input
                    input-debounce="0"
                    :options="opcionesDestino"
                    @filter="filtrarDestino"
                    label="Ciudad de destino *"
                    placeholder="Seleccione o escriba ciudad"
                    lazy-rules
                    :rules="[
                      val => !!val || 'El destino es obligatorio',
                      val => val !== form.origen || 'El destino no puede ser igual al origen'
                    ]"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="location_on" size="18px" color="grey-6" />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">No se encontraron ciudades</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <!-- Fecha -->
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    dense
                    type="date"
                    v-model="form.fecha"
                    label="Fecha de salida *"
                    stack-label
                    lazy-rules
                    :rules="[val => !!val || 'La fecha es obligatoria']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>

                <!-- Hora -->
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    dense
                    type="time"
                    v-model="form.hora"
                    label="Hora de salida *"
                    stack-label
                    lazy-rules
                    :rules="[val => !!val || 'La hora es obligatoria']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="schedule" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <q-separator />

            <!-- SECCIÓN 2: VEHÍCULO Y TARIFA -->
            <div>
              <div class="text-subtitle2 text-weight-bold text-dark q-mb-xs">2. ASIGNACIÓN DE VEHÍCULO Y TARIFA</div>
              <div class="text-caption text-grey-6 q-mb-md">Seleccione la unidad de flota asignada y establezca el precio</div>

              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-select
                    outlined
                    dense
                    v-model="form.vehiculoId"
                    :options="opcionesVehiculos"
                    emit-value
                    map-options
                    label="Vehículo asignado *"
                    lazy-rules
                    :rules="[val => !!val || 'Debe asignar un vehículo']"
                    @update:model-value="onVehiculoChange"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="directions_bus" size="18px" color="grey-6" />
                    </template>
                  </q-select>
                </div>

                <!-- Resumen del vehículo seleccionado -->
                <div v-if="vehiculoSeleccionado" class="col-12">
                  <div class="vehicle-preview-box row items-center q-gutter-md q-pa-sm">
                    <div><span class="text-grey-6">Tipo:</span> <strong class="text-dark">{{ vehiculoSeleccionado.tipo }}</strong></div>
                    <div><span class="text-grey-6">Conductor:</span> <strong class="text-dark">{{ vehiculoSeleccionado.conductor }}</strong></div>
                    <div><span class="text-grey-6">Capacidad:</span> <strong class="text-dark">{{ vehiculoSeleccionado.capacidad }} puestos</strong></div>
                  </div>
                </div>

                <!-- Precio -->
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    dense
                    type="number"
                    v-model.number="form.precio"
                    label="Precio del tiquete ($ COP) *"
                    prefix="$"
                    min="0"
                    lazy-rules
                    :rules="[val => (Number(val) > 0) || 'El precio debe ser mayor a 0']"
                    class="bg-white"
                  />
                </div>

                <!-- Estado Inicial -->
                <div class="col-12 col-sm-6">
                  <q-select
                    outlined
                    dense
                    v-model="form.estado"
                    :options="['Programado', 'Disponible']"
                    label="Estado inicial *"
                    class="bg-white"
                  />
                </div>
              </div>
            </div>

            <q-separator />

            <!-- BOTONES -->
            <div class="row items-center q-gutter-md q-pt-sm">
              <q-btn
                type="submit"
                color="primary"
                icon="save"
                label="Crear Viaje"
                no-caps
                unelevated
                class="q-px-lg text-weight-bold"
              />
              <q-btn
                flat
                color="grey-7"
                label="Limpiar Formulario"
                @click="limpiar"
                no-caps
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { useViajeStore } from '../stores/viajeStore'
import { useVehiculoStore } from '../stores/vehiculoStore'

const viajeStore = useViajeStore()
const vehiculoStore = useVehiculoStore()

const formRef = ref(null)

const CIUDADES_COLOMBIA = [
  'Apartadó',
  'Armenia',
  'Barrancabermeja',
  'Barranquilla',
  'Bogotá D.C.',
  'Bucaramanga',
  'Buenaventura',
  'Buga',
  'Cali',
  'Cartagena',
  'Cartago',
  'Chía',
  'Cúcuta',
  'Dosquebradas',
  'Duitama',
  'Facatativá',
  'Florencia',
  'Fusagasugá',
  'Girardot',
  'Ibagué',
  'Ipiales',
  'Manizales',
  'Medellín',
  'Montería',
  'Neiva',
  'Palmira',
  'Pasto',
  'Pereira',
  'Pitalito',
  'Popayán',
  'Quibdó',
  'Riohacha',
  'Rionegro',
  'San Gil',
  'Santa Marta',
  'Sincelejo',
  'Sogamoso',
  'Tuluá',
  'Tunja',
  'Valledupar',
  'Villavicencio',
  'Yopal',
  'Zipaquirá'
]

const opcionesOrigen = ref([...CIUDADES_COLOMBIA])
const opcionesDestino = ref([...CIUDADES_COLOMBIA])

function filtrarOrigen(val, update) {
  if (val === '') {
    update(() => {
      opcionesOrigen.value = CIUDADES_COLOMBIA
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    opcionesOrigen.value = CIUDADES_COLOMBIA.filter(v => v.toLowerCase().includes(needle))
  })
}

function filtrarDestino(val, update) {
  if (val === '') {
    update(() => {
      opcionesDestino.value = CIUDADES_COLOMBIA
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    opcionesDestino.value = CIUDADES_COLOMBIA.filter(v => v.toLowerCase().includes(needle))
  })
}

const vehiculos = computed(() => vehiculoStore.vehiculos)

const opcionesVehiculos = computed(() =>
  vehiculos.value.map(v => ({
    label: `${v.placa} – ${v.tipo} (${v.capacidad} puestos) | Conductor: ${v.conductor}`,
    value: v.id
  }))
)

const form = reactive({
  origen: '',
  destino: '',
  fecha: '',
  hora: '',
  vehiculoId: null,
  precio: '',
  estado: 'Programado'
})

const exito = ref(false)
const codigoCreado = ref('')
const vehiculoSeleccionado = ref(null)

function onVehiculoChange(val) {
  vehiculoSeleccionado.value = vehiculoStore.obtenerVehiculo(val)
}

async function guardar() {
  exito.value = false
  const nuevo = await viajeStore.crearViaje({
    origen: form.origen,
    destino: form.destino,
    fecha: form.fecha,
    hora: form.hora,
    vehiculoId: form.vehiculoId,
    precio: form.precio,
    estado: form.estado
  })

  codigoCreado.value = nuevo.codigo
  exito.value = true
  await resetFormulario()
}

async function resetFormulario() {
  form.origen = ''
  form.destino = ''
  form.fecha = ''
  form.hora = ''
  form.vehiculoId = null
  form.precio = ''
  form.estado = 'Programado'
  vehiculoSeleccionado.value = null

  await nextTick()
  formRef.value?.resetValidation()
}

function limpiar() {
  exito.value = false
  resetFormulario()
}
</script>

<style scoped>
.vehicle-preview-box {
  background: #F8F9FA;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  font-size: 13px;
}

.font-mono {
  font-family: monospace;
}
</style>
