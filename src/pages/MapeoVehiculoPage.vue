<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1050px;">
      <div class="row items-center justify-between q-mb-lg">
        <q-btn flat color="primary" icon="arrow_back" label="Volver a Vehículos" to="/vehiculos" no-caps />
      </div>

      <div v-if="!obtenerVehiculo()" class="text-center q-pa-xl">
        <q-icon name="directions_bus" size="48px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-md">Vehículo no encontrado</div>
      </div>

      <div v-else class="row q-col-gutter-lg">
        <!-- Ficha técnica -->
        <div class="col-12 col-md-5">
          <q-card flat bordered class="vb-card q-mb-md shadow-1 rounded-borders">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-xs" style="color: var(--vb-text-primary);">
                {{ obtenerVehiculo().tipo }} — {{ obtenerVehiculo().placa }}
              </div>
              <div class="text-caption" style="color: var(--vb-text-secondary);">Detalles técnicos de la unidad</div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-gutter-y-sm">
              <div class="row justify-between">
                <span class="text-grey-6">Capacidad total:</span>
                <span class="text-weight-bold">{{ obtenerVehiculo().capacidad }} puestos</span>
              </div>
              <div class="row justify-between">
                <span class="text-grey-6">Conductor asignado:</span>
                <span class="text-weight-bold">{{ obtenerVehiculo().conductor }}</span>
              </div>
              <div class="row justify-between">
                <span class="text-grey-6">Serie del chasis:</span>
                <span class="text-weight-bold text-mono">{{ obtenerVehiculo().serieChasis }}</span>
              </div>
              <div class="row justify-between">
                <span class="text-grey-6">Serie del motor:</span>
                <span class="text-weight-bold text-mono">{{ obtenerVehiculo().serieMotor }}</span>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="text-caption text-weight-bold q-mb-sm text-grey-8">
                Asignación del Puesto del Conductor
              </div>
              <q-select
                outlined
                dense
                v-model="conductorPuestoId"
                :options="obtenerOpcionesPuestos()"
                emit-value
                map-options
                label="Seleccionar puesto del conductor"
                @update:model-value="asignarConductor"
              />
              <div class="text-caption text-grey-6 q-mt-xs">
                El puesto asignado al conductor no podrá ser comercializado.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Mapa interactivo -->
        <div class="col-12 col-md-7">
          <q-card flat bordered class="vb-card shadow-1 rounded-borders">
            <q-card-section class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold" style="color: var(--vb-text-primary);">Disposición de Puestos</div>
              <q-badge color="primary">
                {{ obtenerVehiculo().puestos.filter(p => !p.esConductor).length }} comerciales
              </q-badge>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <SeatMap
                :puestos="obtenerVehiculo().puestos"
                :capacidad="Number(obtenerVehiculo().capacidad || 20)"
                :puestosOcupados="[]"
                :puestoSeleccionado="null"
                :selectable="false"
                :conductor="obtenerVehiculo().conductor"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useVehiculoStore } from '../stores/vehiculoStore'
import SeatMap from '../components/SeatMap.vue'

const route = useRoute()
const store = useVehiculoStore()

const conductorPuestoId = ref(null)

function obtenerVehiculo() {
  return store.obtenerVehiculo(route.params.id)
}

function obtenerOpcionesPuestos() {
  const veh = obtenerVehiculo()
  if (!veh || !veh.puestos) return []
  return veh.puestos.map(p => ({
    label: `Puesto #${p.numero}`,
    value: p.id
  }))
}

onMounted(async () => {
  await store.cargarVehiculos()
  const veh = obtenerVehiculo()
  if (veh && veh.puestos) {
    const p = veh.puestos.find(x => x.esConductor)
    conductorPuestoId.value = p ? p.id : null
  }
})

function asignarConductor() {
  store.actualizarPuestoConductor(route.params.id, conductorPuestoId.value)
}
</script>
