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
              <div class="text-caption" style="color: var(--vb-text-secondary);">Detalles técnicos y distribución de la unidad</div>
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

              <!-- Distribución de Pisos para Buses -->
              <template v-if="obtenerVehiculo().tipo === 'Bus'">
                <q-separator class="q-my-xs" />
                <div class="text-caption text-weight-bold text-primary">Configuración de la Unidad:</div>
                <template v-if="obtenerVehiculo().capacidad > 60">
                  <div class="row justify-between text-caption">
                    <span class="text-grey-7">Primer Piso (con Baño fijo):</span>
                    <strong>{{ obtenerVehiculo().puestosPiso1 || 38 }} puestos (35 a 40)</strong>
                  </div>
                  <div class="row justify-between text-caption">
                    <span class="text-grey-7">Segundo Piso (sin baño):</span>
                    <strong>{{ obtenerVehiculo().capacidad - (obtenerVehiculo().puestosPiso1 || 38) }} puestos</strong>
                  </div>
                  <div class="bg-blue-1 text-primary q-pa-xs rounded-borders text-caption text-weight-medium">
                    <q-icon name="info" size="14px" class="q-mr-xs" />
                    Bus Doble Piso: Segundo piso habilitado al cumplir más de 60 puestos (61 a 80 puestos). Baño exclusivo en primer piso.
                  </div>
                </template>
                <template v-else>
                  <div class="row justify-between text-caption">
                    <span class="text-grey-7">Piso Único (con Baño fijo):</span>
                    <strong>{{ obtenerVehiculo().capacidad }} puestos</strong>
                  </div>
                  <div class="bg-blue-1 text-primary q-pa-xs rounded-borders text-caption text-weight-medium">
                    <q-icon name="info" size="14px" class="q-mr-xs" />
                    Bus de Un Solo Piso: Capacidad autorizada de 35 a 40 puestos con baño exclusivo.
                  </div>
                </template>
              </template>
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
                :tipoVehiculo="obtenerVehiculo().tipo"
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
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useVehiculoStore } from '../stores/vehiculoStore'
import SeatMap from '../components/SeatMap.vue'

const route = useRoute()
const store = useVehiculoStore()

function obtenerVehiculo() {
  return store.obtenerVehiculo(route.params.id)
}

onMounted(async () => {
  await store.cargarVehiculos()
})
</script>
