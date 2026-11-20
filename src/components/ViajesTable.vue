<template>
  <div class="tabla-contenedor">
    <table class="tabla-viajes">
      <thead>
        <tr>
          <th v-if="!compacto">Código</th>
          <th>Ruta</th>
          <th>Horario</th>
          <th v-if="!compacto">Vehículo</th>
          <th>Disponibilidad</th>
          <th>Precio</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <!-- Mensaje si no hay viajes -->
        <tr v-if="!viajes || viajes.length === 0">
          <td :colspan="compacto ? 6 : 8" class="texto-vacio">
            No hay viajes registrados
          </td>
        </tr>

        <!-- Filas de viajes -->
        <tr v-for="viaje in viajes" :key="viaje.id || viaje._id">
          <!-- Código (solo vista completa) -->
          <td v-if="!compacto">
            <span class="codigo-badge">{{ viaje.codigo }}</span>
          </td>

          <!-- Ruta: Origen -> Destino -->
          <td>
            <div class="ruta-texto">
              <strong>{{ viaje.origen }}</strong>
              <span class="flecha">➔</span>
              <strong>{{ viaje.destino }}</strong>
            </div>
            <div v-if="!compacto && viaje.paradasIntermedias && viaje.paradasIntermedias.length > 0" class="subtexto">
              {{ viaje.paradasIntermedias.length }} parada(s) intermedia(s)
            </div>
          </td>

          <!-- Horario: Fecha y Hora -->
          <td>
            <div>{{ viaje.fecha }}</div>
            <small class="hora-texto">{{ viaje.hora }}</small>
          </td>

          <!-- Vehículo asignado (solo vista completa) -->
          <td v-if="!compacto">
            <div v-if="obtenerVehiculo(viaje.vehiculoId)">
              <strong>{{ obtenerVehiculo(viaje.vehiculoId)?.placa }}</strong>
              <small class="subtexto"> ({{ obtenerVehiculo(viaje.vehiculoId)?.tipo }})</small>
            </div>
            <span v-else class="texto-vacio">—</span>
          </td>

          <!-- Disponibilidad de asientos -->
          <td>
            <span class="badge-disp">
              {{ obtenerDisponibles(viaje) }} disponibles
            </span>
          </td>

          <!-- Tarifa / Precio -->
          <td>
            <strong>${{ Number(viaje.precio || 0).toLocaleString('es-CO') }}</strong>
          </td>

          <!-- Estado del viaje -->
          <td>
            <span :class="['estado-badge', obtenerClaseEstado(viaje.estado)]">
              {{ viaje.estado }}
            </span>
          </td>

          <!-- Botones de Acción -->
          <td>
            <!-- Botón de venta rápida en Dashboard -->
            <button
              v-if="compacto"
              type="button"
              class="btn-accion btn-primario"
              @click="irAVenta(viaje)"
            >
              Vender
            </button>

            <!-- Botones en vista completa de Viajes -->
            <div v-else class="acciones-fila">
              <button
                type="button"
                class="btn-accion btn-secundario"
                @click="onVerMapa ? onVerMapa(viaje) : null"
                title="Ver mapa de asientos"
              >
                Ver Mapa
              </button>
              <button
                type="button"
                class="btn-accion btn-primario"
                @click="onNuevaVenta ? onNuevaVenta(viaje) : null"
              >
                Nueva Venta
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
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

const router = useRouter()
const vehiculoStore = useVehiculoStore()
const ventaStore = useVentaStore()

// Navegar a la pantalla de ventas
function irAVenta(viaje) {
  const viajeId = viaje.id || viaje._id
  router.push({ path: '/ventas/nueva', query: { viajeId } })
}

// Obtener datos del vehículo por su ID
function obtenerVehiculo(vehiculoId) {
  if (!vehiculoId) return null
  return vehiculoStore.obtenerVehiculo(vehiculoId)
}

// Contar asientos ocupados
function obtenerOcupados(viaje) {
  if (!viaje?.id) return 0
  return ventaStore.puestosOcupadosPorViaje(viaje.id).length
}

// Calcular asientos disponibles
function obtenerDisponibles(viaje) {
  if (!viaje) return 0
  const vehiculo = obtenerVehiculo(viaje.vehiculoId)
  const capacidad = Number(vehiculo?.capacidad || 20)
  const ocupados = obtenerOcupados(viaje)
  const disponibles = capacidad - ocupados
  return disponibles > 0 ? disponibles : 0
}

// Asignar clase de color según el estado
function obtenerClaseEstado(estado) {
  if (!estado) return 'estado-default'
  const est = estado.toLowerCase()
  if (est === 'programado') return 'estado-programado'
  if (est === 'en ruta' || est === 'activo') return 'estado-activo'
  if (est === 'finalizado') return 'estado-finalizado'
  if (est === 'cancelado') return 'estado-cancelado'
  return 'estado-default'
}
</script>

<style scoped>
.tabla-contenedor {
  width: 100%;
  overflow-x: auto;
  background: white;
  border-radius: 8px;
}

.tabla-viajes {
  width: 100%;
  border-collapse: collapse;
  font-family: inherit;
  font-size: 14px;
}

.tabla-viajes th {
  background-color: #f5f7fa;
  color: #334155;
  font-weight: 600;
  text-align: left;
  padding: 12px 14px;
  border-bottom: 2px solid #e2e8f0;
}

.tabla-viajes td {
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
  vertical-align: middle;
}

.tabla-viajes tr:hover {
  background-color: #f8fafc;
}

.texto-vacio {
  text-align: center;
  color: #94a3b8;
  padding: 24px;
}

.codigo-badge {
  background: #e0f2fe;
  color: #0369a1;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.ruta-texto {
  display: flex;
  align-items: center;
  gap: 6px;
}

.flecha {
  color: #0284c7;
}

.subtexto {
  color: #64748b;
  font-size: 12px;
}

.hora-texto {
  color: #0284c7;
  font-weight: bold;
}

.badge-disp {
  background: #dcfce7;
  color: #15803d;
  font-weight: bold;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.estado-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.estado-programado {
  background: #e0f2fe;
  color: #0284c7;
}

.estado-activo {
  background: #dcfce7;
  color: #16a34a;
}

.estado-finalizado {
  background: #f1f5f9;
  color: #475569;
}

.estado-cancelado {
  background: #fee2e2;
  color: #dc2626;
}

.estado-default {
  background: #f1f5f9;
  color: #64748b;
}

.acciones-fila {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.btn-accion {
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-primario {
  background-color: #0284c7;
  color: white;
}

.btn-primario:hover {
  background-color: #0369a1;
}

.btn-secundario {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.btn-secundario:hover {
  background-color: #e2e8f0;
}
</style>
