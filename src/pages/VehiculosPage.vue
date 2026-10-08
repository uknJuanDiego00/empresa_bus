<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1240px;">
      <!-- CABECERA -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bold text-dark q-mb-xs">Vehículos</div>
          <div class="text-subtitle2 text-grey-7">{{ vehiculos.length }} unidades registradas en flota</div>
        </div>
        <q-btn
          color="primary"
          icon="add"
          label="Registrar Vehículo"
          to="/vehiculos/registrar"
          no-caps
          unelevated
          class="q-px-md text-weight-bold"
        />
      </div>

      <!-- BARRA DE BÚSQUEDA Y FILTRO -->
      <div class="row q-col-gutter-sm items-center q-mb-md">
        <div class="col-12 col-md-5">
          <q-input
            outlined
            dense
            v-model="filtro"
            placeholder="Buscar por placa, conductor o serie..."
            clearable
            class="bg-white"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- TABLA DE VEHÍCULOS -->
      <q-card flat class="vb-card overflow-hidden">
        <q-table
          flat
          :rows="vehiculosFiltrados"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          class="no-border"
        >
          <!-- Tipo -->
          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-sm no-wrap">
                <div class="vehicle-icon-pill">
                  <q-icon name="directions_bus" size="16px" color="primary" />
                </div>
                <span class="text-weight-bold text-dark">{{ props.row.tipo }}</span>
              </div>
            </q-td>
          </template>

          <!-- Placa -->
          <template v-slot:body-cell-placa="props">
            <q-td :props="props">
              <span class="plate-badge">{{ props.row.placa }}</span>
            </q-td>
          </template>

          <!-- Capacidad -->
          <template v-slot:body-cell-capacidad="props">
            <q-td :props="props">
              <div class="row items-center justify-center q-gutter-x-xs">
                <q-icon name="event_seat" size="15px" color="grey-7" />
                <span class="text-weight-bold text-dark">{{ props.row.capacidad }}</span>
                <span class="text-caption text-grey-6">puestos</span>
              </div>
            </q-td>
          </template>

          <!-- Conductor -->
          <template v-slot:body-cell-conductor="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-xs">
                <q-icon name="person" size="15px" color="grey-6" />
                <span class="text-weight-medium text-dark">{{ props.row.conductor }}</span>
              </div>
            </q-td>
          </template>

          <!-- Estado -->
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge class="badge-status-disponible">
                <q-icon name="check_circle" size="12px" class="q-mr-xs text-positive" />
                Disponible
              </q-badge>
            </q-td>
          </template>

          <!-- Acciones -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                outline
                dense
                color="primary"
                icon="tune"
                label="Puestos"
                :to="`/vehiculos/${props.row.id}/mapeo`"
                no-caps
                class="q-px-sm text-caption"
              >
                <q-tooltip>Configurar asientos del vehículo</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Estado Vacío -->
          <template v-slot:no-data>
            <div class="empty-state-box full-width q-my-lg">
              <div class="empty-state-icon">
                <q-icon name="directions_bus" size="28px" />
              </div>
              <div class="empty-state-title">No se encontraron vehículos</div>
              <div class="empty-state-desc">Registra las unidades de tu flota para comenzar a programar viajes.</div>
              <q-btn
                color="primary"
                icon="add"
                label="Registrar Primer Vehículo"
                to="/vehiculos/registrar"
                no-caps
                unelevated
              />
            </div>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVehiculoStore } from '../stores/vehiculoStore'

const store = useVehiculoStore()
const filtro = ref('')

onMounted(() => {
  store.cargarVehiculos()
})

const vehiculos = computed(() => store.vehiculos)

const vehiculosFiltrados = computed(() => {
  const q = filtro.value?.trim().toLowerCase()
  if (!q) return vehiculos.value
  return vehiculos.value.filter(v =>
    (v.placa && v.placa.toLowerCase().includes(q)) ||
    (v.conductor && v.conductor.toLowerCase().includes(q)) ||
    (v.numeroSerie && v.numeroSerie.toLowerCase().includes(q)) ||
    (v.tipo && v.tipo.toLowerCase().includes(q))
  )
})

const columns = [
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true },
  { name: 'placa', label: 'Placa', field: 'placa', align: 'left', sortable: true },
  { name: 'numeroSerie', label: 'N° Serie', field: 'numeroSerie', align: 'left' },
  { name: 'capacidad', label: 'Capacidad', field: 'capacidad', align: 'center', sortable: true },
  { name: 'conductor', label: 'Conductor Asignado', field: 'conductor', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'id', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]
</script>

<style scoped>
.plate-badge {
  font-family: monospace;
  font-weight: 700;
  font-size: 13px;
  background: #F4F4F5;
  color: #18181B;
  border: 1px solid #E4E4E7;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.vehicle-icon-pill {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #EFF6FF;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
