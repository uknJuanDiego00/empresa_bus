<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1100px;">
      <!-- CABECERA -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bold text-dark q-mb-xs">Configuración de Puestos</div>
          <div class="text-subtitle2 text-grey-7">Distribución física de asientos y asignación del conductor</div>
        </div>
        <q-btn flat color="grey-8" icon="arrow_back" label="Volver a Vehículos" to="/vehiculos" no-caps />
      </div>

      <div v-if="!vehiculo" class="empty-state-box q-my-xl">
        <div class="empty-state-icon">
          <q-icon name="directions_bus" size="28px" />
        </div>
        <div class="empty-state-title">Vehículo no encontrado</div>
        <div class="empty-state-desc">La unidad que intenta consultar no existe en la base de datos.</div>
        <q-btn color="primary" label="Volver al Listado" to="/vehiculos" no-caps unelevated />
      </div>

      <div v-else class="row q-col-gutter-xl">
        <!-- FICHA TÉCNICA LATERAL -->
        <div class="col-12 col-md-5">
          <q-card flat class="vb-card q-mb-md">
            <q-card-section class="q-pa-lg border-bottom-subtle">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-h6 text-weight-bold text-dark">
                    {{ vehiculo.tipo }} — {{ vehiculo.placa }}
                  </div>
                  <div class="text-caption text-grey-6">Ficha técnica de la unidad</div>
                </div>
                <span class="plate-badge">{{ vehiculo.placa }}</span>
              </div>
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <div class="column q-gutter-y-sm text-body2">
                <div class="row justify-between">
                  <span class="text-grey-6">Capacidad total:</span>
                  <strong class="text-dark">{{ vehiculo.capacidad }} puestos</strong>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Conductor asignado:</span>
                  <strong class="text-dark">{{ vehiculo.conductor }}</strong>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Serie del chasis:</span>
                  <span class="font-mono text-grey-8">{{ vehiculo.serieChasis }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Serie del motor:</span>
                  <span class="font-mono text-grey-8">{{ vehiculo.serieMotor }}</span>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pa-lg">
              <div class="text-subtitle2 text-weight-bold q-mb-xs text-dark">
                Asignación de Puesto del Conductor
              </div>
              <div class="text-caption text-grey-6 q-mb-md">
                El puesto asignado al conductor queda bloqueado para la venta.
              </div>

              <q-select
                outlined
                dense
                v-model="conductorPuestoId"
                :options="opcionesPuestos"
                emit-value
                map-options
                label="Seleccionar puesto del conductor"
                @update:model-value="asignarConductor"
                class="bg-white"
              >
                <template v-slot:prepend>
                  <q-icon name="sports_motorsports" size="18px" color="grey-6" />
                </template>
              </q-select>
            </q-card-section>
          </q-card>
        </div>

        <!-- MAPA INTERACTIVO -->
        <div class="col-12 col-md-7">
          <q-card flat class="vb-card">
            <q-card-section class="border-bottom-subtle row items-center justify-between q-pa-md">
              <div>
                <div class="text-subtitle1 text-weight-bold text-dark">Plano del Autobús</div>
                <div class="text-caption text-grey-6">Distribución visual en planta</div>
              </div>
              <q-badge color="grey-2" text-color="primary" class="text-weight-bold">
                {{ vehiculo.puestos.filter(p => !p.esConductor).length }} puestos comerciales
              </q-badge>
            </q-card-section>

            <q-card-section class="q-pa-lg text-center">
              <SeatMap
                :puestos="vehiculo.puestos"
                :capacidad="Number(vehiculo.capacidad || 20)"
                :puestosOcupados="[]"
                :puestoSeleccionado="null"
                :selectable="false"
                :conductor="vehiculo.conductor"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useVehiculoStore } from '../stores/vehiculoStore'
import SeatMap from '../components/SeatMap.vue'

const route = useRoute()
const store = useVehiculoStore()

const vehiculo = computed(() => store.obtenerVehiculo(route.params.id))
const conductorPuestoId = ref(null)

const opcionesPuestos = computed(() => {
  if (!vehiculo.value) return []
  return vehiculo.value.puestos.map(p => ({
    label: `Puesto #${p.numero}`,
    value: p.id
  }))
})

onMounted(() => {
  if (vehiculo.value) {
    const p = vehiculo.value.puestos.find(p => p.esConductor)
    conductorPuestoId.value = p ? p.id : null
  }
})

function asignarConductor() {
  store.actualizarPuestoConductor(route.params.id, conductorPuestoId.value)
}
</script>

<style scoped>
.plate-badge {
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  background: #F4F4F5;
  color: #18181B;
  border: 1px solid #E4E4E7;
  padding: 3px 8px;
  border-radius: 6px;
}

.border-bottom-subtle {
  border-bottom: 1px solid #E4E4E7;
}

.font-mono {
  font-family: monospace;
}
</style>
