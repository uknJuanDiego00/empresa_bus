<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 780px;">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">Registrar Vehículo</div>
          <div class="text-caption" style="color: var(--vb-text-secondary);">Ingreso de nueva unidad a la flota</div>
        </div>
        <q-btn flat color="primary" icon="arrow_back" label="Volver" to="/vehiculos" no-caps />
      </div>

      <!-- Mensaje de éxito -->
      <q-banner v-if="exito" class="bg-green-1 text-positive q-mb-md rounded-borders" rounded>
        <template v-slot:avatar>
          <q-icon name="check_circle" color="positive" />
        </template>
        <div>
          Vehículo registrado correctamente con capacidad autorizada.
          <q-btn flat dense color="primary" label="Ver configuración de puestos" :to="`/vehiculos/${nuevoId}/mapeo`" no-caps class="q-ml-sm text-weight-bold" />
        </div>
      </q-banner>

      <!-- Mensaje de error general -->
      <q-banner v-if="errorMsg" class="bg-red-1 text-negative q-mb-md rounded-borders" rounded>
        <template v-slot:avatar>
          <q-icon name="error" color="negative" />
        </template>
        <div>{{ errorMsg }}</div>
      </q-banner>

      <q-card flat bordered class="vb-card shadow-1 rounded-borders">
        <q-card-section class="q-pa-lg">
          <q-form ref="formRef" @submit="guardar" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select
                  outlined
                  dense
                  v-model="form.empresa"
                  use-input
                  new-value-mode="add-unique"
                  :options="['VIABUS Express', 'Copetran', 'Berlinas del Fonce', 'Expreso Bolivariano', 'Rápido Ochoa', 'Coomotor']"
                  label="Empresa transportadora *"
                  placeholder="Seleccione o escriba la empresa"
                  lazy-rules
                  :rules="[val => !!val?.trim() || 'La empresa es obligatoria']"
                >
                  <template v-slot:prepend>
                    <q-icon name="business" color="primary" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  outlined
                  dense
                  v-model="form.tipo"
                  :options="['Bus', 'Buseta', 'Microbús']"
                  label="Tipo de vehículo *"
                  lazy-rules
                  :rules="[val => !!val || 'Seleccione el tipo de vehículo']"
                  @update:model-value="onTipoChange"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  outlined
                  dense
                  v-model="form.placa"
                  label="Placa *"
                  placeholder="TRD459"
                  maxlength="7"
                  style="text-transform: uppercase;"
                  @update:model-value="val => { form.placa = val ? val.toUpperCase() : '' }"
                  lazy-rules
                  :rules="[
                    val => !!val?.trim() || 'La placa es obligatoria',
                    val => !store.placaExiste(val) || 'La placa ya está registrada'
                  ]"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  outlined
                  dense
                  v-model="form.numeroSerie"
                  label="Número de serie *"
                  placeholder="SER-001"
                  style="text-transform: uppercase;"
                  @update:model-value="val => { form.numeroSerie = val ? val.toUpperCase() : '' }"
                  lazy-rules
                  :rules="[
                    val => !!val?.trim() || 'El número de serie es obligatorio',
                    val => !store.serieExiste(val) || 'El número de serie ya existe'
                  ]"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                   outlined
                     dense
                     type="number"
                     v-model.number="form.capacidad"
                     :label="form.tipo ? `Capacidad (${rangoCapacidadTexto()}) *` : 'Capacidad (puestos) *'"
                     :min="limiteMinimo()"
                     :max="limiteMaximo()"
                    :hint="hintCapacidad()"
                    lazy-rules
                   :rules="[
                   val => (val !== null && val !== undefined && val !== '') || 'La capacidad es obligatoria',
                   validarCapacidadRegla
                 ]"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  outlined
                  dense
                  v-model="form.conductor"
                  label="Nombre del conductor *"
                  placeholder="Nombre completo"
                  lazy-rules
                  :rules="[val => !!val?.trim() || 'El conductor es obligatorio']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  outlined
                  dense
                  v-model="form.serieChasis"
                  label="Serie del chasis *"
                  placeholder="CHS-12345"
                  style="text-transform: uppercase;"
                  @update:model-value="val => { form.serieChasis = val ? val.toUpperCase() : '' }"
                  lazy-rules
                  :rules="[val => !!val?.trim() || 'La serie del chasis es obligatoria']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  outlined
                  dense
                  v-model="form.serieMotor"
                  label="Serie del motor *"
                  placeholder="MOT-12345"
                  style="text-transform: uppercase;"
                  @update:model-value="val => { form.serieMotor = val ? val.toUpperCase() : '' }"
                  lazy-rules
                  :rules="[val => !!val?.trim() || 'La serie del motor es obligatoria']"
                />
              </div>
            </div>

            <div class="row items-center q-gutter-md q-pt-md">
              <q-btn type="submit" color="primary" icon="save" label="Guardar Vehículo" no-caps unelevated />
              <q-btn flat color="grey-7" label="Limpiar" @click="limpiar" no-caps />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useVehiculoStore, REGLAS_CAPACIDAD, validarCapacidadTipo } from '../stores/vehiculoStore'

const store = useVehiculoStore()
const formRef = ref(null)

const form = reactive({
  empresa: 'VIABUS Express',
  tipo: '',
  placa: '',
  numeroSerie: '',
  capacidad: '',
  conductor: '',
  serieChasis: '',
  serieMotor: ''
})

const exito = ref(false)
const errorMsg = ref('')
const nuevoId = ref(null)

function reglaActual() {
  return REGLAS_CAPACIDAD[form.tipo] || null
}

function limiteMinimo() {
  const regla = reglaActual()
  return regla ? regla.min : 1
}

function limiteMaximo() {
  const regla = reglaActual()
  return regla ? regla.max : 50
}

function rangoCapacidadTexto() {
  if (form.tipo === 'Microbús') return '10 - 20 puestos'
  if (form.tipo === 'Buseta') return '20 - 35 puestos'
  if (form.tipo === 'Bus') return '35 - 50 puestos (máx. 50)'
  return '1 a 50 puestos'
}

function hintCapacidad() {
  if (form.tipo === 'Microbús') return 'Microbús: min 10 puestos, max 20 puestos'
  if (form.tipo === 'Buseta') return 'Buseta: min 20 puestos, max 35 puestos'
  if (form.tipo === 'Bus') {
    const capNum = Number(form.capacidad || 0)
    if (capNum > 35) {
      return `Bus: ${capNum} puestos (equipado con baño al final a la derecha y 5 puestos traseros)`
    }
    return 'Bus: 35 a 50 puestos (más de 35 incluye baño al final a la derecha)'
  }
  return 'Seleccione primero el tipo de vehículo'
}


function validarCapacidadRegla(val) {
  if (!val) return 'La capacidad es obligatoria'
  return validarCapacidadTipo(form.tipo, val)
}

function onTipoChange(tipo) {
  if (tipo === 'Microbús') {
    if (!form.capacidad || form.capacidad < 10 || form.capacidad > 20) form.capacidad = 15
  } else if (tipo === 'Buseta') {
    if (!form.capacidad || form.capacidad < 20 || form.capacidad > 35) form.capacidad = 25
  } else if (tipo === 'Bus') {
    if (!form.capacidad || form.capacidad < 35 || form.capacidad > 50) form.capacidad = 40
  }
}

async function guardar() {
  exito.value = false
  errorMsg.value = ''

  const validacionCap = validarCapacidadRegla(form.capacidad)
  if (validacionCap !== true) {
    errorMsg.value = validacionCap
    return
  }

  try {
    const nuevo = await store.registrarVehiculo({
      empresa: form.empresa,
      tipo: form.tipo,
      placa: (form.placa || '').toUpperCase().trim(),
      numeroSerie: (form.numeroSerie || '').toUpperCase().trim(),
      capacidad: Number(form.capacidad),
      conductor: form.conductor,
      serieChasis: (form.serieChasis || '').toUpperCase().trim(),
      serieMotor: (form.serieMotor || '').toUpperCase().trim()
    })

    nuevoId.value = nuevo.id
    exito.value = true
    await resetFormulario()
  } catch (err) {
    errorMsg.value = err.message || 'Error al guardar el vehículo'
  }
}

async function resetFormulario() {
  form.empresa = 'VIABUS Express'
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
  errorMsg.value = ''
  resetFormulario()
}
</script>
