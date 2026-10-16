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
                  :options="['Microbús', 'Buseta', 'Bus']"
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
                  :label="form.tipo ? `Capacidad (${rangoCapacidadTexto}) *` : 'Capacidad (puestos) *'"
                  :min="limiteMinimo"
                  :max="limiteMaximo"
                  :hint="hintCapacidad"
                  lazy-rules
                  :rules="[
                    val => (val !== null && val !== undefined && val !== '') || 'La capacidad es obligatoria',
                    validarCapacidadRegla
                  ]"
                  @update:model-value="onCapacidadChange"
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

            <!-- SECCIÓN ADICIONAL PARA BUSES: DISTRIBUCIÓN DE PISOS (SOLO SI CUMPLE MÍNIMO 60 Y MÁXIMO 80 PUESTOS) -->
            <div v-if="esDoblePiso" class="q-mt-md">
              <q-separator class="q-my-sm" />
              <div class="text-subtitle2 text-weight-bold q-mb-xs" style="color: var(--vb-text-primary);">
                Configuración de Dos Pisos (Bus Doble Piso: {{ form.capacidad }} puestos)
              </div>
              <div class="text-caption text-grey-7 q-mb-sm">
                El segundo piso se habilita al cumplir mínimo 60 y máximo 80 puestos. El primer piso debe tener entre 35 y 40 puestos junto al baño exclusivo. El segundo piso cuenta con los puestos restantes sin baño.
              </div>

              <div class="row q-col-gutter-md items-center">
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    dense
                    type="number"
                    v-model.number="form.puestosPiso1"
                    label="Puestos Primer Piso (con Baño, 35 a 40) *"
                    min="35"
                    max="40"
                    :rules="[
                      val => (Number(val) >= 35 && Number(val) <= 40) || 'El primer piso debe tener entre 35 y 40 puestos'
                    ]"
                    @update:model-value="onPiso1Change"
                  >
                    <template v-slot:prepend>
                      <q-icon name="stairs" color="primary" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6" style="padding:10px;">
                  <q-input
                    outlined
                    dense
                    type="number"
                    :model-value="puestosSegundoPisoCalculado"
                    label="Puestos Segundo Piso (sin Baño)"
                    readonly
                  >
                    <template v-slot:prepend>
                      <q-icon name="flight_class" color="primary" />
                    </template>
                    <template v-slot:append>
                      <q-badge color="grey-3" text-color="dark">Automático</q-badge>
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="bg-blue-1 text-primary q-pa-sm rounded-borders row items-center q-gutter-x-sm text-caption q-mt-xs">
                <q-icon name="info" size="18px" />
                <span>
                  <strong>Distribución autorizada:</strong> Primer piso con {{ Number(form.puestosPiso1 || 38) }} puestos + Baño. Segundo piso con {{ puestosSegundoPisoCalculado }} puestos. Total: {{ form.capacidad }} puestos.
                </span>
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
import { ref, reactive, computed, nextTick } from 'vue'
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
  serieMotor: '',
  puestosPiso1: null
})

const exito = ref(false)
const errorMsg = ref('')
const nuevoId = ref(null)

const reglaActual = computed(() => {
  return REGLAS_CAPACIDAD[form.tipo] || null
})

const limiteMinimo = computed(() => {
  return reglaActual.value ? reglaActual.value.min : 1
})

const limiteMaximo = computed(() => {
  return reglaActual.value ? reglaActual.value.max : 100
})

const rangoCapacidadTexto = computed(() => {
  if (form.tipo === 'Microbús') return '10 - 20 puestos'
  if (form.tipo === 'Buseta') return '20 - 35 puestos'
  if (form.tipo === 'Bus') return '35 a 40 (1 piso) o 60 a 80 puestos (2 pisos)'
  return '1 a 80 puestos'
})

const hintCapacidad = computed(() => {
  if (form.tipo === 'Microbús') return 'Microbús: min 10 puestos, max 20 puestos'
  if (form.tipo === 'Buseta') return 'Buseta: min 20 puestos, max 35 puestos'
  if (form.tipo === 'Bus') return 'Bus: 35 a 40 puestos (1 piso) o 60 a 80 puestos (doble piso)'
  return 'Seleccione primero el tipo de vehículo para ver el rango permitido'
})

const esDoblePiso = computed(() => {
  return form.tipo === 'Bus' && Number(form.capacidad || 0) >= 60
})

const puestosSegundoPisoCalculado = computed(() => {
  const cap = Number(form.capacidad || 0)
  const p1 = Number(form.puestosPiso1 || 38)
  return Math.max(0, cap - p1)
})

function validarCapacidadRegla(val) {
  if (!val) return 'La capacidad es obligatoria'
  const cap = Number(val)
  if (form.tipo === 'Microbús') {
    if (cap < 10 || cap > 20) return 'La capacidad debe estar entre 10 y 20 puestos'
  } else if (form.tipo === 'Buseta') {
    if (cap < 20 || cap > 35) return 'La capacidad debe estar entre 20 y 35 puestos'
  } else if (form.tipo === 'Bus') {
    if ((cap >= 35 && cap <= 40) || (cap >= 60 && cap <= 80)) {
      return true
    }
    return 'Para Bus, la capacidad debe ser entre 35 y 40 puestos (1 piso) o entre 60 y 80 puestos (doble piso)'
  } else {
    if (cap <= 0) return 'La capacidad debe ser mayor a 0'
  }
  return true
}

function onTipoChange(tipo) {
  if (tipo === 'Microbús') {
    if (!form.capacidad || form.capacidad < 10 || form.capacidad > 20) {
      form.capacidad = 15
    }
  } else if (tipo === 'Buseta') {
    if (!form.capacidad || form.capacidad < 20 || form.capacidad > 35) {
      form.capacidad = 25
    }
  } else if (tipo === 'Bus') {
    // Si no tiene capacidad válida para bus, sugerir 38 (1 piso estándar)
    const capActual = Number(form.capacidad || 0)
    const esValida = (capActual >= 35 && capActual <= 40) || (capActual >= 60 && capActual <= 80)
    if (!esValida) {
      form.capacidad = 38
    }
    if (form.capacidad >= 60) {
      form.puestosPiso1 = 38
    }
  }
}

function onCapacidadChange(cap) {
  if (form.tipo === 'Bus' && cap) {
    if (Number(cap) >= 60) {
      if (!form.puestosPiso1 || form.puestosPiso1 < 35 || form.puestosPiso1 > 40) {
        form.puestosPiso1 = 38
      }
    } else {
      form.puestosPiso1 = null
    }
  }
}

function onPiso1Change() {
  // reactividad automática vía puestosSegundoPisoCalculado
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
    let p1 = null
    if (form.tipo === 'Bus') {
      const capNum = Number(form.capacidad)
      if (capNum >= 60) {
        p1 = Number(form.puestosPiso1 || 38)
      } else {
        p1 = capNum
      }
    }

    const nuevo = await store.registrarVehiculo({
      empresa: form.empresa,
      tipo: form.tipo,
      placa: (form.placa || '').toUpperCase().trim(),
      numeroSerie: (form.numeroSerie || '').toUpperCase().trim(),
      capacidad: Number(form.capacidad),
      conductor: form.conductor,
      serieChasis: (form.serieChasis || '').toUpperCase().trim(),
      serieMotor: (form.serieMotor || '').toUpperCase().trim(),
      puestosPiso1: p1
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
  form.puestosPiso1 = null

  await nextTick()
  formRef.value?.resetValidation()
}

function limpiar() {
  exito.value = false
  errorMsg.value = ''
  resetFormulario()
}
</script>
