<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1240px;">
      <!-- CABECERA -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bold text-dark q-mb-xs">Clientes</div>
          <div class="text-subtitle2 text-grey-7">{{ clientes.length }} pasajeros registrados en la plataforma</div>
        </div>
        <q-btn
          color="primary"
          icon="person_add"
          label="Nuevo Cliente"
          to="/clientes/registrar"
          no-caps
          unelevated
          class="q-px-md text-weight-bold"
        />
      </div>

      <!-- BARRA DE BÚSQUEDA -->
      <div class="row q-col-gutter-sm items-center q-mb-md">
        <div class="col-12 col-md-5">
          <q-input
            outlined
            dense
            v-model="filtro"
            placeholder="Buscar por número de documento o nombre completo..."
            clearable
            class="bg-white"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- TABLA DE CLIENTES -->
      <q-card flat class="vb-card overflow-hidden">
        <q-table
          flat
          :rows="clientesFiltrados"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          class="no-border"
        >
          <!-- Tipo Doc -->
          <template v-slot:body-cell-tipoDoc="props">
            <q-td :props="props">
              <span class="doc-type-badge">{{ props.row.tipoDoc }}</span>
            </q-td>
          </template>

          <!-- Documento -->
          <template v-slot:body-cell-documento="props">
            <q-td :props="props">
              <span class="text-weight-bold text-dark font-mono">{{ props.row.documento }}</span>
            </q-td>
          </template>

          <!-- Nombre -->
          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-sm">
                <q-avatar size="28px" color="grey-2" text-color="grey-9" class="text-caption text-weight-bold">
                  {{ props.row.nombre?.charAt(0)?.toUpperCase() || 'P' }}
                </q-avatar>
                <span class="text-weight-bold text-dark">{{ props.row.nombre }}</span>
              </div>
            </q-td>
          </template>

          <!-- Teléfono -->
          <template v-slot:body-cell-telefono="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-xs text-grey-8">
                <q-icon name="phone" size="14px" color="grey-6" />
                <span>{{ props.row.telefono }}</span>
              </div>
            </q-td>
          </template>

          <!-- Correo -->
          <template v-slot:body-cell-correo="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-xs text-grey-8">
                <q-icon name="mail" size="14px" color="grey-6" />
                <span>{{ props.row.correo }}</span>
              </div>
            </q-td>
          </template>

          <!-- Dirección -->
          <template v-slot:body-cell-direccion="props">
            <q-td :props="props">
              <span class="text-grey-7">{{ props.row.direccion }}</span>
            </q-td>
          </template>

          <!-- Estado Vacío -->
          <template v-slot:no-data>
            <div class="empty-state-box full-width q-my-lg">
              <div class="empty-state-icon">
                <q-icon name="groups" size="28px" />
              </div>
              <div class="empty-state-title">No hay clientes registrados</div>
              <div class="empty-state-desc">Registra nuevos pasajeros para asociarlos a ventas de tiquetes.</div>
              <q-btn
                color="primary"
                icon="person_add"
                label="Registrar Primer Cliente"
                to="/clientes/registrar"
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
import { useClienteStore } from '../stores/clienteStore'

const store = useClienteStore()
const filtro = ref('')

onMounted(() => {
  store.cargarClientes()
})

const clientes = computed(() => store.clientes)

const clientesFiltrados = computed(() => {
  const q = filtro.value?.trim().toLowerCase()
  if (!q) return clientes.value
  return clientes.value.filter(c =>
    (c.documento && c.documento.toLowerCase().includes(q)) ||
    (c.nombre && c.nombre.toLowerCase().includes(q)) ||
    (c.correo && c.correo.toLowerCase().includes(q)) ||
    (c.telefono && c.telefono.toLowerCase().includes(q))
  )
})

const columns = [
  { name: 'tipoDoc', label: 'Tipo', field: 'tipoDoc', align: 'center' },
  { name: 'documento', label: 'Documento', field: 'documento', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre Completo', field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
  { name: 'correo', label: 'Correo Electrónico', field: 'correo', align: 'left' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' }
]
</script>

<style scoped>
.doc-type-badge {
  font-size: 11px;
  font-weight: 700;
  background: #F4F4F5;
  color: #52525B;
  border: 1px solid #E4E4E7;
  padding: 2px 6px;
  border-radius: 4px;
}

.font-mono {
  font-family: monospace;
}
</style>
