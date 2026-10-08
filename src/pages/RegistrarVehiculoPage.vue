<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 840px;">
      <!-- CABECERA -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bold text-dark q-mb-xs">Registrar Vehículo</div>
          <div class="text-subtitle2 text-grey-7">Ingreso de nueva unidad a la flota de transporte</div>
        </div>
        <q-btn flat color="grey-8" icon="arrow_back" label="Volver a Vehículos" to="/vehiculos" no-caps />
      </div>

      <!-- MENSAJE DE ÉXITO -->
      <q-banner v-if="exito" class="bg-green-1 text-positive q-mb-md rounded-borders" rounded>
        <template v-slot:avatar>
          <q-icon name="check_circle" color="positive" size="24px" />
        </template>
        <div class="row items-center justify-between">
          <div>Unidad vehicular registrada correctamente en el sistema.</div>
          <q-btn
            color="primary"
            icon="tune"
            label="Configurar Puestos de este Vehículo"
            :to="`/vehiculos/${nuevoId}/mapeo`"
            no-caps
            unelevated
            class="text-weight-bold q-ml-sm"
          />
        </div>
      </q-banner>

      <!-- FORMULARIO -->
      <q-card flat class="vb-card">
        <q-card-section class="q-pa-xl">
          <q-form ref="formRef" @submit="guardar" class="q-gutter-y-lg">
            
            <!-- SECCIÓN 1: DATOS OPERATIVOS -->
            <div>
              <div class="text-subtitle2 text-weight-bold text-dark q-mb-xs">1. DATOS OPERATIVOS DEL VEHÍCULO</div>
              <div class="text-caption text-grey-6 q-mb-md">Tipo de carrocería, placa comercial y capacidad de pasajeros</div>

              <div class="row q-col-gutter-md">
                <!-- Tipo -->
                <div class="col-12 col-sm-6">
                  <q-select
                    outlined
                    dense
                    v-model="form.tipo"
                    :options="['Bus', 'Buseta', 'Microbús']"
                    label="Tipo de vehículo *"
                    lazy-rules
                    :rules="[val => !!val || 'Seleccione el tipo de vehículo']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="directions_bus" size="18px" color="grey-6" />
                    </template>
                  </q-select>
                </div>

                <!-- Placa -->
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    dense
                    v-model="form.placa"
                    label="Placa del vehículo *"
                    placeholder="TRD459"
                    maxlength="7"
                    lazy-rules
                    :rules="[
                      val => !!val?.trim() || 'La placa es obligatoria',
                      val => !store.placaExiste(val) || 'La placa ya está registrada'
                    ]"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="pin" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>

                <!-- Número de Serie -->
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    dense
                    v-model="form.numeroSerie"
                    label="Número de serie interna *"
                    placeholder="SER-001"
                    lazy-rules
                    :rules="[
                      val => !!val?.trim() || 'El número de serie es obligatorio',
                      val => !store.serieExiste(val) || 'El número de serie ya existe'
                    ]"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="confirmation_number" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>

                <!-- Capacidad -->
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    dense
                    type="number"
                    v-model.number="form.capacidad"
                    label="Capacidad total (puestos) *"
                    min="1"
                    max="100"
                    lazy-rules
                    :rules="[val => (Number(val) > 0) || 'Debe ser mayor a 0']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event_seat" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>

                <!-- Conductor -->
                <div class="col-12">
                  <q-input
                    outlined
                    dense
                    v-model="form.conductor"
                    label="Nombre del conductor asignado *"
                    placeholder="Nombres y Apellidos del conductor"
                    lazy-rules
                    :rules="[val => !!val?.trim() || 'El conductor es obligatorio']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <q-separator />

            <!-- SECCIÓN 2: DATOS TÉCNICOS -->
            <div>
              <div class="text-subtitle2 text-weight-bold text-dark q-mb-xs">2. INFORMACIÓN MECÁNICA Y CHASIS</div>
              <div class="text-caption text-grey-6 q-mb-md">Identificación de motor y chasis para control técnico</div>

              <div class="row q-col-gutter-md">
                <!-- Chasis -->
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    dense
                    v-model="form.serieChasis"
                    label="Serie del chasis *"
                    placeholder="CHS-12345"
                    lazy-rules
                    :rules="[val => !!val?.trim() || 'La serie del chasis es obligatoria']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="settings" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>

                <!-- Motor -->
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    dense
                    v-model="form.serieMotor"
                    label="Serie del motor *"
                    placeholder="MOT-12345"
                    lazy-rules
                    :rules="[val => !!val?.trim() || 'La serie del motor es obligatoria']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="build" size="18px" color="grey-6" />
                    </template>
                  </q-input>
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
                label="Guardar Vehículo"
                no-caps
                unelevated
                class="q-px-lg text-weight-bold"
              />
              <q-btn
                type="button"
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
import { ref, reactive, nextTick } from 'vue'
import { useVehiculoStore } from '../stores/vehiculoStore'

const store = useVehiculoStore()
const formRef = ref(null)

const form = reactive({
  tipo: '',
  placa: '',
  numeroSerie: '',
  capacidad: '',
  conductor: '',
  serieChasis: '',
  serieMotor: ''
})

const exito = ref(false)
const nuevoId = ref(null)

async function guardar() {
  exito.value = false
  const nuevo = await store.registrarVehiculo({
    tipo: form.tipo,
    placa: form.placa.trim().toUpperCase(),
    numeroSerie: form.numeroSerie.trim(),
    capacidad: form.capacidad,
    conductor: form.conductor.trim(),
    serieChasis: form.serieChasis.trim(),
    serieMotor: form.serieMotor.trim()
  })

  nuevoId.value = nuevo.id
  exito.value = true
  await resetFormulario()
}

async function resetFormulario() {
  form.tipo = ''
  form.placa = ''
  form.numeroSerie = ''
  form.capacidad = ''
  form.conductor = ''
  form.serieChasis = ''
  form.serieMotor = ''

  await nextTick()
  formRef.value?.resetValidation()
}

function limpiar() {
  exito.value = false
  resetFormulario()
}
</script>
