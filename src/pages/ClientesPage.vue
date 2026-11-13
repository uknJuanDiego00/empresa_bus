<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1100px;">
      <PageHeader
        title="Clientes"
        :subtitle="`${store.clientes.length} clientes registrados`"
      >
        <q-btn
          color="primary"
          icon="person_add"
          label="Registrar Cliente"
          to="/clientes/registrar"
          no-caps
          unelevated
        />
      </PageHeader>


      <!-- en esta parte se integran los cambios con la compontizacion de funciones -->


      <!-- Buscador -->
      <BuscadorFiltro
        v-model="filtro"
        placeholder="Buscar por documento o nombre..."
        max-width="400px"
      />

      <q-card flat bordered class="vb-card shadow-1 rounded-borders">
        <q-table
          flat
          :rows="obtenerClientesFiltrados()"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="No hay clientes que coincidan"
        >
          <template v-slot:body-cell-tipoDoc="props">
            <q-td :props="props">
              <q-badge class="company-badge text-weight-bold">
                {{ props.row.tipoDoc }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <span class="text-weight-bold">{{ props.row.nombre }}</span>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useClienteStore } from '../stores/clienteStore'
import PageHeader from '../components/PageHeader.vue'
import BuscadorFiltro from '../components/BuscadorFiltro.vue'

const store = useClienteStore()
const filtro = ref('')

onMounted(async () => {
  await store.cargarClientes()
})

function obtenerClientesFiltrados() {
  const lista = store.clientes || []
  const q = filtro.value?.trim().toLowerCase()
  if (!q) return lista
  return lista.filter(c =>
    (c.documento && c.documento.toLowerCase().includes(q)) ||
    (c.nombre && c.nombre.toLowerCase().includes(q))
  )
}

const columns = [
  { name: 'tipoDoc', label: 'Tipo', field: 'tipoDoc', align: 'center' },
  { name: 'documento', label: 'Documento', field: 'documento', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre Completo', field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
  { name: 'correo', label: 'Correo Electrónico', field: 'correo', align: 'left' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' }
]
</script>
