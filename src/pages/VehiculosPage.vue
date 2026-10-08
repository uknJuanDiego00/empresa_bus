<<<<<<< HEAD
<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1100px;">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bold text-grey-9">Vehículos y Flota</div>
          <div class="text-caption text-grey-6">{{ vehiculos.length }} vehículos registrados en flota</div>
        </div>
        <q-btn
          color="primary"
          icon="add"
          label="Registrar Vehículo"
          to="/vehiculos/registrar"
          no-caps
          unelevated
        />
      </div>

      <!-- Barra de búsqueda rápida de flota -->
      <div class="row q-mb-md">
        <div class="col-12 col-md-5">
          <q-input
            v-model="filtroTexto"
            outlined
            dense
            placeholder="Buscar por empresa, placa, tipo o conductor..."
            clearable
            class="bg-white"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>
      </div>

      <q-card flat bordered class="shadow-1 rounded-borders">
        <q-table
          flat
          :rows="vehiculosFiltrados"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="No hay vehículos registrados"
        >
          <template v-slot:body-cell-empresa="props">
            <q-td :props="props">
              <q-badge color="grey-2" text-color="dark" class="text-weight-bold q-py-xs q-px-sm">
                <q-icon name="business" size="14px" color="primary" class="q-mr-xs" />
                {{ props.row.empresa || 'VIABUS Express' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <q-badge color="blue-1" text-color="primary" class="text-weight-bold q-py-xs q-px-sm">
                <q-icon name="directions_bus" size="14px" class="q-mr-xs" />
                {{ props.row.tipo }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-placa="props">
            <q-td :props="props">
              <span class="text-weight-bolder text-subtitle2">{{ props.row.placa }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-capacidad="props">
            <q-td :props="props">
              <span>{{ props.row.capacidad }} puestos</span>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                outline
                color="primary"
                size="sm"
                icon="tune"
                label="Configurar Puestos"
                :to="`/vehiculos/${props.row.id}/mapeo`"
                no-caps
              />
            </q-td>
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
const filtroTexto = ref('')

onMounted(() => {
  store.cargarVehiculos()
})

const vehiculos = computed(() => store.vehiculos)

const vehiculosFiltrados = computed(() => {
  if (!filtroTexto.value) return vehiculos.value
  const term = filtroTexto.value.toLowerCase().trim()
  return vehiculos.value.filter(v =>
    (v.empresa && v.empresa.toLowerCase().includes(term)) ||
    (v.placa && v.placa.toLowerCase().includes(term)) ||
    (v.tipo && v.tipo.toLowerCase().includes(term)) ||
    (v.conductor && v.conductor.toLowerCase().includes(term))
  )
})

const columns = [
  { name: 'empresa', label: 'Empresa', field: 'empresa', align: 'left', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true },
  { name: 'placa', label: 'Placa', field: 'placa', align: 'left', sortable: true },
  { name: 'numeroSerie', label: 'N° Serie', field: 'numeroSerie', align: 'left' },
  { name: 'capacidad', label: 'Capacidad', field: 'capacidad', align: 'center', sortable: true },
  { name: 'conductor', label: 'Conductor Asignado', field: 'conductor', align: 'left' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]
</script>
=======
<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1100px;">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">Vehículos y Flota</div>
          <div class="text-caption" style="color: var(--vb-text-secondary);">{{ vehiculos.length }} vehículos registrados en flota</div>
        </div>
        <q-btn
          color="primary"
          icon="add"
          label="Registrar Vehículo"
          to="/vehiculos/registrar"
          no-caps
          unelevated
        />
      </div>

      <!-- Barra de búsqueda rápida de flota -->
      <div class="row q-mb-md">
        <div class="col-12 col-md-5">
          <q-input
            v-model="filtroTexto"
            outlined
            dense
            placeholder="Buscar por empresa, placa, tipo o conductor..."
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>
      </div>

      <q-card flat bordered class="vb-card shadow-1 rounded-borders">
        <q-table
          flat
          :rows="vehiculosFiltrados"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="No hay vehículos registrados"
        >
          <template v-slot:body-cell-empresa="props">
            <q-td :props="props">
              <q-badge class="company-badge q-py-xs q-px-sm">
                <q-icon name="business" size="14px" color="primary" class="q-mr-xs" />
                {{ props.row.empresa || 'VIABUS Express' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <q-badge color="primary" outline class="text-weight-bold q-py-xs q-px-sm">
                <q-icon name="directions_bus" size="14px" class="q-mr-xs" />
                {{ props.row.tipo }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-placa="props">
            <q-td :props="props">
              <span class="text-weight-bolder text-subtitle2">{{ props.row.placa }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-capacidad="props">
            <q-td :props="props">
              <span>{{ props.row.capacidad }} puestos</span>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                outline
                color="primary"
                size="sm"
                icon="tune"
                label="Configurar Puestos"
                :to="`/vehiculos/${props.row.id}/mapeo`"
                no-caps
              />
            </q-td>
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
const filtroTexto = ref('')

onMounted(() => {
  store.cargarVehiculos()
})

const vehiculos = computed(() => store.vehiculos)

const vehiculosFiltrados = computed(() => {
  if (!filtroTexto.value) return vehiculos.value
  const term = filtroTexto.value.toLowerCase().trim()
  return vehiculos.value.filter(v =>
    (v.empresa && v.empresa.toLowerCase().includes(term)) ||
    (v.placa && v.placa.toLowerCase().includes(term)) ||
    (v.tipo && v.tipo.toLowerCase().includes(term)) ||
    (v.conductor && v.conductor.toLowerCase().includes(term))
  )
})

const columns = [
  { name: 'empresa', label: 'Empresa', field: 'empresa', align: 'left', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true },
  { name: 'placa', label: 'Placa', field: 'placa', align: 'left', sortable: true },
  { name: 'numeroSerie', label: 'N° Serie', field: 'numeroSerie', align: 'left' },
  { name: 'capacidad', label: 'Capacidad', field: 'capacidad', align: 'center', sortable: true },
  { name: 'conductor', label: 'Conductor Asignado', field: 'conductor', align: 'left' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]
</script>
>>>>>>> 8aefa4c (feat: actualizar interfaz y funcionalidades del sistema VIABUS)
