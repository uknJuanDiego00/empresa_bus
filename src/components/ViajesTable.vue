<template>
  <q-table
    flat
    :dense="compacto"
    :rows="viajes"
    :columns="obtenerColumnas()"
    row-key="id"
    :hide-pagination="compacto"
    :rows-per-page-options="compacto ? [5] : [10]"
    :pagination="compacto ? undefined : { rowsPerPage: 10 }"
    no-data-label="No hay viajes registrados"
    :class="compacto ? 'no-border' : ''"
  >
    <!-- Código de viaje (solo en modo completo) -->
    <template v-slot:body-cell-codigo="props">
      <q-td :props="props">
        <q-badge color="blue-1" text-color="primary" class="text-weight-bold font-mono">
          {{ props.row.codigo }}
        </q-badge>
      </q-td>
    </template>

    <!-- Ruta Origen -> Destino con distancia y duración calculada -->
    <template v-slot:body-cell-ruta="props">
      <q-td :props="props">
        <div class="row items-center q-gutter-x-xs no-wrap">
          <span class="text-weight-bold text-grey-9">{{ props.row.origen }}</span>
          <q-icon name="arrow_forward" size="14px" color="primary" class="q-mx-xs" />
          <span class="text-weight-bold text-grey-9">{{ props.row.destino }}</span>
        </div>
        <div v-if="!compacto && props.row.paradasIntermedias && props.row.paradasIntermedias.length > 0" class="text-caption text-grey-6">
          {{ props.row.paradasIntermedias.length }} parada(s) intermedia(s)
        </div>
        <div class="text-caption text-grey-6 row items-center q-gutter-x-xs q-mt-xs">
          <q-icon name="schedule" size="12px" color="primary" />
          <span>{{ obtenerRutaInfo(props.row).duracionTexto }}</span>
          <span>•</span>
          <span>{{ obtenerRutaInfo(props.row).distanciaTexto }}</span>
        </div>
      </q-td>
    </template>

    <!-- Horario -->
    <template v-slot:body-cell-horario="props">
      <q-td :props="props">
        <div class="text-caption">
          <div class="text-weight-medium">{{ props.row.fecha }}</div>
          <div class="text-primary text-weight-bold">{{ props.row.hora }}</div>
        </div>
      </q-td>
    </template>

    <!-- Vehículo asignado (solo en modo completo) -->
    <template v-slot:body-cell-vehiculo="props">
      <q-td :props="props">
        <div v-if="obtenerVehiculo(props.row.vehiculoId)">
          <span class="text-weight-bold text-primary">{{ obtenerVehiculo(props.row.vehiculoId)?.placa }}</span>
          <span class="text-caption text-grey-6 q-ml-xs">({{ obtenerVehiculo(props.row.vehiculoId)?.tipo }})</span>
          <div class="text-caption text-grey-7">{{ obtenerVehiculo(props.row.vehiculoId)?.conductor }}</div>
        </div>
        <span v-else class="text-grey-5">—</span>
      </q-td>
    </template>

    <!-- Disponibilidad y cupos -->
    <template v-slot:body-cell-disponibilidad="props">
      <q-td :props="props" :style="compacto ? '' : 'min-width: 150px;'">
        <div class="row items-center justify-between text-caption q-mb-xs">
          <q-badge color="positive" dense class="text-weight-bold">
            <q-icon name="event_seat" size="12px" class="q-mr-xs" />
            {{ obtenerDisponibles(props.row) }} disp.
          </q-badge>
          <q-badge v-if="!compacto" color="negative" dense>
            {{ obtenerOcupados(props.row) }} ocup.
          </q-badge>
        </div>
        <q-linear-progress
          v-if="!compacto"
          :value="obtenerPorcentajeOcupacion(props.row)"
          rounded
          size="6px"
          :color="obtenerPorcentajeOcupacion(props.row) > 0.85 ? 'negative' : 'positive'"
          track-color="grey-3"
        />
      </q-td>
    </template>

    <!-- Tarifa / Precio -->
    <template v-slot:body-cell-precio="props">
      <q-td :props="props">
        <span class="text-weight-bolder text-primary text-subtitle2">
          ${{ Number(props.row.precio || 0).toLocaleString('es-CO') }}
        </span>
      </q-td>
    </template>

    <!-- Estado -->
    <template v-slot:body-cell-estado="props">
      <q-td :props="props">
        <q-badge :color="obtenerColorEstado(props.row.estado)" class="q-py-xs q-px-sm">
          {{ props.row.estado }}
        </q-badge>
      </q-td>
    </template>

    <!-- Acciones -->
    <template v-slot:body-cell-acciones="props">
      <q-td :props="props" class="text-right">
        <!-- En modo compacto (Dashboard) botón de venta directa -->
        <div v-if="compacto">
          <q-btn
            flat
            round
            dense
            color="primary"
            icon="add_shopping_cart"
            :to="{ path: '/ventas/nueva', query: { viajeId: props.row.id || props.row._id } }"
          >
            <q-tooltip>Vender tiquete para este viaje</q-tooltip>
          </q-btn>
        </div>

        <!-- En modo completo (ViajesPage) botón de mapa y venta -->
        <div v-else class="row q-gutter-x-xs justify-end no-wrap">
          <q-btn
            flat
            round
            dense
            color="grey-7"
            icon="visibility"
            @click="onVerMapa ? onVerMapa(props.row) : null"
            title="Ver mapa de asientos"
          />
          <q-btn
            color="primary"
            size="sm"
            icon="add_shopping_cart"
            label="Nueva Venta"
            @click="onNuevaVenta ? onNuevaVenta(props.row) : null"
            no-caps
            unelevated
            class="text-weight-bold q-px-sm"
          />
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { useVehiculoStore } from '../stores/vehiculoStore'
import { useVentaStore } from '../stores/ventaStore'

const props = defineProps({
  viajes: {
    type: Array,
    required: true
  },
  compacto: {
    type: Boolean,
    default: false
  },
  onVerMapa: {
    type: Function,
    default: null
  },
  onNuevaVenta: {
    type: Function,
    default: null
  }
})

const vehiculoStore = useVehiculoStore()
const ventaStore = useVentaStore()

// Columnas según si es vista compacta o completa
function obtenerColumnas() {
  if (props.compacto) {
    return [
      { name: 'ruta', label: 'Ruta (Trayecto)', field: 'origen', align: 'left', sortable: true },
      { name: 'horario', label: 'Horario', field: 'fecha', align: 'left', sortable: true },
      { name: 'disponibilidad', label: 'Disponibilidad', field: 'disponibilidad', align: 'left' },
      { name: 'precio', label: 'Tarifa', field: 'precio', align: 'left', sortable: true },
      { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
      { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
    ]
  }

  return [
    { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
    { name: 'ruta', label: 'Ruta', field: 'origen', align: 'left', sortable: true },
    { name: 'horario', label: 'Horario', field: 'fecha', align: 'left', sortable: true },
    { name: 'vehiculo', label: 'Vehículo Asignado', field: 'vehiculoId', align: 'left' },
    { name: 'disponibilidad', label: 'Disponibilidad', field: 'disponibilidad', align: 'center' },
    { name: 'precio', label: 'Precio', field: 'precio', align: 'right', sortable: true },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
    { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'right' }
  ]
}

function obtenerRutaInfo(viaje) {
  if (!viaje?.origen || !viaje?.destino) {
    return { distanciaTexto: '—', duracionTexto: '—' }
  }
  return calcularDistanciaYDuracion(viaje.origen, viaje.destino)
}

function obtenerVehiculo(vehiculoId) {
  if (!vehiculoId) return null
  return vehiculoStore.obtenerVehiculo(vehiculoId)
}

function obtenerOcupados(viaje) {
  if (!viaje?.id) return 0
  return ventaStore.puestosOcupadosPorViaje(viaje.id).length
}

function obtenerDisponibles(viaje) {
  if (!viaje) return 0
  const vehiculo = obtenerVehiculo(viaje.vehiculoId)
  const cap = Number(vehiculo?.capacidad || 20)
  const ocupados = obtenerOcupados(viaje)
  return Math.max(0, cap - ocupados)
}

function obtenerPorcentajeOcupacion(viaje) {
  const vehiculo = obtenerVehiculo(viaje.vehiculoId)
  const cap = Number(vehiculo?.capacidad || 20)
  if (cap === 0) return 0
  return obtenerOcupados(viaje) / cap
}

function obtenerColorEstado(estado) {
  if (!estado) return 'grey-7'
  const est = estado.toLowerCase()
  if (est === 'programado') return 'info'
  if (est === 'en ruta' || est === 'activo') return 'positive'
  if (est === 'finalizado') return 'dark'
  if (est === 'cancelado') return 'negative'
  return 'primary'
}
</script>
