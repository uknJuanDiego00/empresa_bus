<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 780px;">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">Crear Nuevo Viaje</div>
          <div class="text-caption" style="color: var(--vb-text-secondary);">Programación de itinerario y asignación de vehículo</div>
        </div>
        <q-btn flat color="primary" icon="arrow_back" label="Volver" to="/viajes" no-caps />
      </div>

      <!-- Mensaje de éxito -->
      <q-banner v-if="exito" class="bg-green-1 text-positive q-mb-md rounded-borders" rounded>
        <template v-slot:avatar>
          <q-icon name="check_circle" color="positive" />
        </template>
        Viaje programado con éxito. Código asignado: <strong>{{ codigoCreado }}</strong>
      </q-banner>

      <q-card flat bordered class="vb-card shadow-1 rounded-borders">
        <q-card-section class="q-pa-lg">
          <q-form ref="formRef" @submit="guardar" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <!-- SECCIÓN 1: ORIGEN (DEPARTAMENTO Y MUNICIPIO) -->
              <div class="col-12 col-md-6">
                <q-card flat bordered class="q-pa-sm bg-grey-1 rounded-borders">
                  <div class="text-caption text-weight-bold text-primary q-mb-xs">
                    <q-icon name="trip_origin" color="positive" size="14px" class="q-mr-xs" />
                    1. Origen del Recorrido
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-12">
                      <q-select
                        outlined
                        dense
                        v-model="deptoOrigen"
                        :options="listaDeptosNombres"
                        label="Departamento de origen"
                        placeholder="Todos los departamentos"
                        clearable
                        @update:model-value="onDeptoOrigenChange"
                      />
                    </div>
                    <div class="col-12">
                      <q-select
                        outlined
                        dense
                        v-model="form.origen"
                        use-input
                        input-debounce="0"
                        :options="opcionesOrigen"
                        @filter="filtrarOrigen"
                        label="Ciudad / Municipio de origen *"
                        placeholder="Buscar municipio..."
                        lazy-rules
                        :rules="[val => !!val || 'El origen es obligatorio']"
                      >
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey text-caption">
                              No se encontraron municipios
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                  </div>
                </q-card>
              </div>

              <!-- SECCIÓN 2: DESTINO (DEPARTAMENTO Y MUNICIPIO) -->
              <div class="col-12 col-md-6">
                <q-card flat bordered class="q-pa-sm bg-grey-1 rounded-borders">
                  <div class="text-caption text-weight-bold text-primary q-mb-xs">
                    <q-icon name="place" color="negative" size="14px" class="q-mr-xs" />
                    2. Destino Final del Recorrido
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-12">
                      <q-select
                        outlined
                        dense
                        v-model="deptoDestino"
                        :options="listaDeptosNombres"
                        label="Departamento de destino"
                        placeholder="Todos los departamentos"
                        clearable
                        @update:model-value="onDeptoDestinoChange"
                      />
                    </div>
                    <div class="col-12">
                      <q-select
                        outlined
                        dense
                        v-model="form.destino"
                        use-input
                        input-debounce="0"
                        :options="opcionesDestino"
                        @filter="filtrarDestino"
                        label="Ciudad / Municipio de destino *"
                        placeholder="Buscar municipio..."
                        lazy-rules
                        :rules="[
                          val => !!val || 'El destino es obligatorio',
                          val => val !== form.origen || 'El destino no puede ser igual al origen'
                        ]"
                      >
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey text-caption">
                              No se encontraron municipios
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                  </div>
                </q-card>
              </div>

              <!-- SECCIÓN 3: PARADAS INTERMEDIAS AUTORIZADAS Y REORDENAMIENTO -->
              <div class="col-12">
                <q-card flat bordered class="q-pa-md bg-white rounded-borders">
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-caption text-weight-bold" style="color: var(--vb-text-primary);">
                      <q-icon name="linear_scale" color="primary" size="16px" class="q-mr-xs" />
                      3. Paradas intermedias autorizadas en la ruta (orden estricto de recorrido)
                    </div>
                    <q-badge color="primary" class="text-weight-bold">
                      {{ form.paradasIntermedias.length }} parada(s) intermedia(s)
                    </q-badge>
                  </div>

                  <!-- Controles para agregar parada con departamento opcional -->
                  <div class="row q-col-gutter-sm items-center q-mb-md">
                    <div class="col-12 col-sm-4">
                      <q-select
                        outlined
                        dense
                        v-model="deptoParada"
                        :options="listaDeptosNombres"
                        label="Filtrar depto (opcional)"
                        clearable
                        @update:model-value="onDeptoParadaChange"
                      />
                    </div>
                    <div class="col-12 col-sm-5">
                      <q-select
                        outlined
                        dense
                        v-model="nuevaParada"
                        use-input
                        input-debounce="0"
                        :options="opcionesParadas"
                        @filter="filtrarParadas"
                        label="Municipio o pueblo de parada *"
                        placeholder="Buscar municipio..."
                      >
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey text-caption">
                              No se encontraron resultados
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                    <div class="col-12 col-sm-3">
                      <q-btn
                        color="primary"
                        icon="add_location"
                        label="Agregar Parada"
                        no-caps
                        unelevated
                        dense
                        class="full-width q-py-sm"
                        @click="agregarParada"
                        :disable="!nuevaParada"
                      />
                    </div>
                  </div>

                  <!-- Lista interactiva de paradas con reordenamiento (subir/bajar) y eliminación -->
                  <div v-if="form.paradasIntermedias.length > 0">
                    <div class="text-caption text-grey-7 q-mb-xs">
                      Utilice las flechas para reordenar la secuencia real en la que el bus recorrerá cada parada:
                    </div>
                    <q-list bordered separator class="rounded-borders bg-grey-1">
                      <q-item v-for="(p, idx) in form.paradasIntermedias" :key="idx" class="q-py-xs items-center">
                        <q-item-section avatar style="min-width: 38px;">
                          <q-avatar size="26px" color="primary" text-color="white" class="text-caption text-weight-bold">
                            {{ idx + 1 }}
                          </q-avatar>
                        </q-item-section>

                        <q-item-section>
                          <q-item-label class="text-weight-bold text-grey-9">{{ p }}</q-item-label>
                          <q-item-label caption class="text-grey-6">Parada intermedia #{{ idx + 1 }} de la ruta</q-item-label>
                        </q-item-section>

                        <q-item-section side>
                          <div class="row items-center q-gutter-x-xs">
                            <!-- Botón Subir en el orden del recorrido -->
                            <q-btn
                              flat
                              round
                              dense
                              size="sm"
                              icon="arrow_upward"
                              color="primary"
                              :disable="idx === 0"
                              @click="subirParada(idx)"
                            >
                              <q-tooltip>Mover antes en el recorrido</q-tooltip>
                            </q-btn>

                            <!-- Botón Bajar en el orden del recorrido -->
                            <q-btn
                              flat
                              round
                              dense
                              size="sm"
                              icon="arrow_downward"
                              color="primary"
                              :disable="idx === form.paradasIntermedias.length - 1"
                              @click="bajarParada(idx)"
                            >
                              <q-tooltip>Mover después en el recorrido</q-tooltip>
                            </q-btn>

                            <!-- Botón Eliminar Parada -->
                            <q-btn
                              flat
                              round
                              dense
                              size="sm"
                              icon="delete"
                              color="negative"
                              @click="removerParada(idx)"
                            >
                              <q-tooltip>Eliminar parada</q-tooltip>
                            </q-btn>
                          </div>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </q-card>
              </div>

              <!-- Ficha de resumen de la ruta intermunicipal -->
              <div v-if="infoRutaActual()" class="col-12">
                <div class="bg-blue-1 text-primary q-pa-sm rounded-borders">
                  <div class="row items-center justify-between q-mb-xs">
                    <div class="row items-center q-gutter-x-sm">
                      <q-icon name="route" size="18px" />
                      <span class="text-caption text-weight-bold">
                        {{ form.origen }}
                        <template v-for="(p, i) in form.paradasIntermedias" :key="i">
                          <q-icon name="arrow_forward" size="12px" class="q-mx-xs" />
                          <span class="text-secondary">{{ p }}</span>
                        </template>
                        <q-icon name="arrow_forward" size="12px" class="q-mx-xs" />
                        {{ form.destino }}
                      </span>
                    </div>
                  </div>
                  <div class="text-caption text-grey-8">
                    Distancia total: <strong>{{ infoRutaActual().distanciaTexto }}</strong> • Duración estimada: <strong>{{ infoRutaActual().duracionTexto }}</strong>
                  </div>
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  outlined
                  dense
                  type="date"
                  v-model="form.fecha"
                  :min="obtenerFechaMinima()"
                  label="Fecha de salida *"
                  stack-label
                  lazy-rules
                  :rules="[
                    val => !!val || 'La fecha es obligatoria',
                    val => val >= obtenerFechaMinima() || 'No se pueden programar viajes en fechas pasadas'
                  ]"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  outlined
                  dense
                  type="time"
                  v-model="form.hora"
                  label="Hora de salida *"
                  stack-label
                  lazy-rules
                  :rules="[
                    val => !!val || 'La hora es obligatoria',
                    val => validarHora(val) || 'Para la fecha de hoy, la hora debe ser posterior a la actual'
                  ]"
                />
              </div>

              <div class="col-12">
                <q-select
                  outlined
                  dense
                  v-model="form.vehiculoId"
                  :options="obtenerOpcionesVehiculos()"
                  emit-value
                  map-options
                  label="Vehículo asignado *"
                  lazy-rules
                  :rules="[val => !!val || 'Debe asignar un vehículo']"
                  @update:model-value="onVehiculoChange"
                />
              </div>

              <!-- Ficha del vehículo seleccionado -->
              <div v-if="vehiculoSeleccionado" class="col-12">
                <div class="bg-blue-1 text-primary q-pa-sm rounded-borders row q-gutter-md items-center">
                  <div><span class="text-grey-7">Empresa:</span> <strong>{{ vehiculoSeleccionado.empresa || 'VIABUS Express' }}</strong></div>
                  <div><span class="text-grey-7">Tipo:</span> <strong>{{ vehiculoSeleccionado.tipo }}</strong></div>
                  <div><span class="text-grey-7">Conductor:</span> <strong>{{ vehiculoSeleccionado.conductor }}</strong></div>
                  <div><span class="text-grey-7">Capacidad:</span> <strong>{{ vehiculoSeleccionado.capacidad }} puestos</strong></div>
                </div>
              </div>

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
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  outlined
                  dense
                  v-model="form.estado"
                  :options="['Programado', 'Disponible']"
                  label="Estado inicial *"
                />
              </div>
            </div>

            <div class="row items-center q-gutter-md q-pt-md">
              <q-btn
                type="submit"
                color="primary"
                icon="save"
                label="Crear Viaje"
                no-caps
                unelevated
                :loading="guardando"
                :disable="guardando"
              />
              <q-btn flat color="grey-7" label="Limpiar" @click="limpiar" :disable="guardando" no-caps />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useViajeStore } from '../stores/viajeStore'
import { useVehiculoStore } from '../stores/vehiculoStore'

const $q = useQuasar()
const viajeStore = useViajeStore()
const vehiculoStore = useVehiculoStore()

const formRef = ref(null)
const guardando = ref(false)

onMounted(async () => {
  await vehiculoStore.cargarVehiculos()
})

// Función básica para obtener la fecha mínima permitida (Hoy)
function obtenerFechaMinima() {
  const hoyObj = new Date()
  const y = hoyObj.getFullYear()
  const m = String(hoyObj.getMonth() + 1).padStart(2, '0')
  const d = String(hoyObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function validarHora(horaVal) {
  const fMin = obtenerFechaMinima()
  if (!form.fecha || form.fecha > fMin) return true
  if (!horaVal) return true
  const partes = horaVal.split(':')
  const h = Number(partes[0])
  const m = Number(partes[1])
  const ahora = new Date()
  const minutosIngresados = h * 60 + m
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes()
  return minutosIngresados >= minutosActuales
}

import {
  buscarMunicipios,
  obtenerDepartamentos,
  obtenerMunicipiosPorDepartamento
} from '../utils/colombiaData'
import { estimarRutaViaje } from '../utils/distanceCalculator'

const listaDepartamentos = obtenerDepartamentos()
const listaDeptosNombres = listaDepartamentos.map(d => d.nombre)

const deptoOrigen = ref(null)
const deptoDestino = ref(null)
const deptoParada = ref(null)

const opcionesOrigen = ref(buscarMunicipios(''))
const opcionesDestino = ref(buscarMunicipios(''))
const opcionesParadas = ref(buscarMunicipios(''))
const nuevaParada = ref('')

function onDeptoOrigenChange(depto) {
  deptoOrigen.value = depto
  form.origen = ''
  if (depto) {
    opcionesOrigen.value = obtenerMunicipiosPorDepartamento(depto).map(m => m.value)
  } else {
    opcionesOrigen.value = buscarMunicipios('')
  }
}

function onDeptoDestinoChange(depto) {
  deptoDestino.value = depto
  form.destino = ''
  if (depto) {
    opcionesDestino.value = obtenerMunicipiosPorDepartamento(depto).map(m => m.value)
  } else {
    opcionesDestino.value = buscarMunicipios('')
  }
}

function onDeptoParadaChange(depto) {
  deptoParada.value = depto
  nuevaParada.value = ''
  if (depto) {
    opcionesParadas.value = obtenerMunicipiosPorDepartamento(depto).map(m => m.value)
  } else {
    opcionesParadas.value = buscarMunicipios('')
  }
}

function filtrarOrigen(val, update) {
  update(() => {
    opcionesOrigen.value = buscarMunicipios(val, deptoOrigen.value)
  })
}

function filtrarDestino(val, update) {
  update(() => {
    opcionesDestino.value = buscarMunicipios(val, deptoDestino.value)
  })
}

function filtrarParadas(val, update) {
  update(() => {
    opcionesParadas.value = buscarMunicipios(val, deptoParada.value)
  })
}

function agregarParada() {
  const p = (nuevaParada.value || '').trim()
  if (!p) return
  if (p === form.origen) {
    $q.notify({ type: 'warning', message: 'La parada intermedia no puede ser igual al origen', position: 'top' })
    return
  }
  if (p === form.destino) {
    $q.notify({ type: 'warning', message: 'La parada intermedia no puede ser igual al destino', position: 'top' })
    return
  }
  if (form.paradasIntermedias.includes(p)) {
    $q.notify({ type: 'warning', message: 'Esta parada intermedia ya fue agregada', position: 'top' })
    return
  }
  form.paradasIntermedias.push(p)
  nuevaParada.value = ''
}

function subirParada(idx) {
  if (idx <= 0 || idx >= form.paradasIntermedias.length) return
  const temp = form.paradasIntermedias[idx]
  form.paradasIntermedias[idx] = form.paradasIntermedias[idx - 1]
  form.paradasIntermedias[idx - 1] = temp
}

function bajarParada(idx) {
  if (idx < 0 || idx >= form.paradasIntermedias.length - 1) return
  const temp = form.paradasIntermedias[idx]
  form.paradasIntermedias[idx] = form.paradasIntermedias[idx + 1]
  form.paradasIntermedias[idx + 1] = temp
}

function removerParada(idx) {
  form.paradasIntermedias.splice(idx, 1)
}

function infoRutaActual() {
  if (!form.origen || !form.destino || form.origen === form.destino) return null
  return estimarRutaViaje(form.origen, form.destino)
}

// Función básica para transformar la lista de vehículos en opciones del select
function obtenerOpcionesVehiculos() {
  const opciones = []
  for (const v of vehiculoStore.vehiculos) {
    opciones.push({
      label: `${v.placa} – ${v.tipo} (${v.empresa || 'VIABUS Express'}) [${v.capacidad} puestos] | Cond: ${v.conductor}`,
      value: v.id
    })
  }
  return opciones
}

const form = reactive({
  origen: '',
  destino: '',
  fecha: '',
  hora: '',
  vehiculoId: null,
  precio: '',
  estado: 'Programado',
  paradasIntermedias: []
})

const exito = ref(false)
const codigoCreado = ref('')
const vehiculoSeleccionado = ref(null)

function onVehiculoChange(val) {
  vehiculoSeleccionado.value = vehiculoStore.obtenerVehiculo(val)
}

async function guardar() {
  guardando.value = true
  exito.value = false
  try {
    const nuevo = await viajeStore.crearViaje({
      origen: form.origen,
      destino: form.destino,
      fecha: form.fecha,
      hora: form.hora,
      vehiculoId: form.vehiculoId,
      precio: form.precio,
      estado: form.estado,
      paradasIntermedias: [...form.paradasIntermedias]
    })

    codigoCreado.value = nuevo.codigo
    exito.value = true
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `Viaje ${nuevo.codigo} programado exitosamente`,
      caption: `${form.origen} → ${form.destino} (${form.fecha} ${form.hora})`,
      position: 'top-right'
    })
    await resetFormulario()
  } catch (err) {
    $q.notify({
      type: 'negative',
      icon: 'error',
      message: 'Error al programar el viaje',
      caption: err?.message || 'Verifique los campos ingresados',
      position: 'top-right'
    })
  } finally {
    guardando.value = false
  }
}

async function resetFormulario() {
  form.origen = ''
  form.destino = ''
  form.fecha = ''
  form.hora = ''
  form.vehiculoId = null
  form.precio = ''
  form.estado = 'Programado'
  form.paradasIntermedias = []
  nuevaParada.value = ''
  deptoOrigen.value = null
  deptoDestino.value = null
  deptoParada.value = null
  vehiculoSeleccionado.value = null

  await nextTick()
  formRef.value?.resetValidation()
}

function limpiar() {
  exito.value = false
  resetFormulario()
}
</script>
