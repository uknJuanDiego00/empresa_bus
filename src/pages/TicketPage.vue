<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg no-print" style="max-width: 680px; margin-left: auto; margin-right: auto;">
      <q-btn flat color="grey-8" icon="arrow_back" label="Volver a Ventas" to="/ventas" no-caps />
      <div class="row q-gutter-sm">
        <q-btn color="primary" icon="print" label="Imprimir Tiquete" @click="imprimir" no-caps unelevated class="text-weight-bold" />
        <q-btn outline color="primary" icon="add_shopping_cart" label="Nueva Venta" to="/ventas/nueva" no-caps />
      </div>
    </div>

    <!-- TIQUETE NO ENCONTRADO -->
    <div v-if="!venta" class="empty-state-box q-my-xl" style="max-width: 680px; margin: 0 auto;">
      <div class="empty-state-icon">
        <q-icon name="receipt_long" size="28px" />
      </div>
      <div class="empty-state-title">Tiquete no encontrado</div>
      <div class="empty-state-desc">El código solicitado no corresponde a una venta registrada.</div>
      <q-btn color="primary" label="Ver Todas las Ventas" to="/ventas" no-caps unelevated />
    </div>

    <!-- TARJETA DEL TIQUETE -->
    <div v-else style="max-width: 680px; margin: 0 auto;">
      <div class="ticket-wrapper">
        <!-- Encabezado del Tiquete -->
        <div class="ticket-header row items-center justify-between q-pa-lg">
          <div class="row items-center q-gutter-x-sm">
            <div class="brand-badge-circle">
              <q-icon name="directions_bus" size="20px" color="white" />
            </div>
            <div>
              <div class="text-h6 text-weight-bolder text-dark tracking-wide">VIABUS</div>
              <div class="text-caption text-grey-6">Tiquete de Transporte Intermunicipal</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-caption text-grey-6">Código de Tiquete</div>
            <div class="ticket-code-pill">{{ venta.id }}</div>
          </div>
        </div>

        <!-- Sección de Ruta -->
        <div class="ticket-route-box q-pa-md text-center">
          <div class="row items-center justify-center q-gutter-lg">
            <div class="text-left">
              <span class="text-caption text-grey-6 block">ORIGEN</span>
              <span class="text-h6 text-weight-bolder text-dark">{{ viaje?.origen || '—' }}</span>
            </div>
            <div class="route-arrow-circle">
              <q-icon name="arrow_forward" size="16px" color="primary" />
            </div>
            <div class="text-right">
              <span class="text-caption text-grey-6 block">DESTINO</span>
              <span class="text-h6 text-weight-bolder text-dark">{{ viaje?.destino || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Detalles del Pasajero y Servicio -->
        <div class="q-pa-lg">
          <div class="row q-col-gutter-md text-body2">
            <div class="col-6">
              <span class="detail-label">Pasajero:</span>
              <span class="detail-val text-weight-bold">{{ cliente?.nombre || '—' }}</span>
            </div>

            <div class="col-6">
              <span class="detail-label">Documento:</span>
              <span class="detail-val font-mono">{{ cliente?.tipoDoc }}: {{ cliente?.documento }}</span>
            </div>

            <div class="col-6">
              <span class="detail-label">Fecha de Salida:</span>
              <span class="detail-val">{{ viaje?.fecha || '—' }}</span>
            </div>

            <div class="col-6">
              <span class="detail-label">Hora de Salida:</span>
              <span class="detail-val text-weight-bold text-primary">{{ viaje?.hora || '—' }}</span>
            </div>

            <div class="col-6">
              <span class="detail-label">Vehículo Asignado:</span>
              <span class="detail-val">{{ vehiculo?.tipo }} {{ vehiculo?.placa }}</span>
            </div>

            <div class="col-6">
              <span class="detail-label">Conductor:</span>
              <span class="detail-val">{{ vehiculo?.conductor || 'Asignado en terminal' }}</span>
            </div>

            <div class="col-6">
              <span class="detail-label">Puesto Asignado:</span>
              <span class="seat-badge-ticket">
                <q-icon name="event_seat" size="14px" class="q-mr-xs" />
                Puesto #{{ venta.puestoId }}
              </span>
            </div>

            <div class="col-6">
              <span class="detail-label">Fecha de Emisión:</span>
              <span class="detail-val text-caption text-grey-7">{{ venta.fechaVenta }}</span>
            </div>

            <div v-if="venta.descripcion" class="col-12 q-mt-sm">
              <span class="detail-label">Observaciones:</span>
              <span class="detail-val bg-grey-1 q-pa-xs rounded-borders block text-caption">{{ venta.descripcion }}</span>
            </div>
          </div>

          <div class="ticket-dotted-divider q-my-lg"></div>

          <!-- Total y Estado -->
          <div class="row items-center justify-between">
            <div>
              <span class="text-caption text-grey-6 block">TOTAL ABONADO</span>
              <span class="text-h4 text-weight-bolder text-primary">
                ${{ venta.precio ? Number(venta.precio).toLocaleString('es-CO') : '0' }}
              </span>
            </div>
            <div>
              <q-badge class="badge-status-disponible q-py-xs q-px-md text-subtitle2">
                <q-icon name="check_circle" size="14px" class="q-mr-xs text-positive" />
                {{ venta.estado || 'Confirmado' }}
              </q-badge>
            </div>
          </div>
        </div>

        <!-- Footer del tiquete -->
        <div class="ticket-footer text-center q-pa-sm">
          <span class="text-caption text-grey-6">Presente este tiquete al momento de abordar. ¡Buen viaje con VIABUS!</span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useVentaStore } from '../stores/ventaStore'
import { useClienteStore } from '../stores/clienteStore'
import { useViajeStore } from '../stores/viajeStore'
import { useVehiculoStore } from '../stores/vehiculoStore'

const route = useRoute()
const ventaStore = useVentaStore()
const clienteStore = useClienteStore()
const viajeStore = useViajeStore()
const vehiculoStore = useVehiculoStore()

onMounted(async () => {
  await Promise.allSettled([
    ventaStore.cargarVentas(),
    clienteStore.cargarClientes(),
    viajeStore.cargarViajes(),
    vehiculoStore.cargarVehiculos()
  ])
})

const venta = computed(() => ventaStore.obtenerVenta(route.params.id))
const cliente = computed(() => venta.value ? clienteStore.obtenerCliente(venta.value.clienteId) : null)
const viaje = computed(() => venta.value ? viajeStore.obtenerViaje(venta.value.viajeId) : null)
const vehiculo = computed(() => viaje.value ? vehiculoStore.obtenerVehiculo(viaje.value.vehiculoId) : null)

function imprimir() {
  window.print()
}
</script>

<style scoped>
.ticket-wrapper {
  background: #FFFFFF;
  border: 1px solid #E4E4E7;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.ticket-header {
  background: #FAFAFA;
  border-bottom: 1px solid #E4E4E7;
}

.brand-badge-circle {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ticket-code-pill {
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  background: #F4F4F5;
  border: 1px solid #E4E4E7;
  padding: 3px 8px;
  border-radius: 6px;
  color: #18181B;
}

.ticket-route-box {
  background: #F8F9FA;
  border-bottom: 1px solid #E4E4E7;
}

.route-arrow-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #EFF6FF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-label {
  display: block;
  font-size: 11.5px;
  color: #71717A;
  margin-bottom: 2px;
}

.detail-val {
  color: #18181B;
}

.seat-badge-ticket {
  display: inline-flex;
  align-items: center;
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
  font-weight: 700;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 6px;
}

.ticket-dotted-divider {
  border-top: 2px dashed #E4E4E7;
}

.ticket-footer {
  background: #FAFAFA;
  border-top: 1px solid #E4E4E7;
}

.font-mono {
  font-family: monospace;
}

@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: #FFFFFF !important;
  }
  .ticket-wrapper {
    border: 1px solid #000000 !important;
    box-shadow: none !important;
  }
}
</style>
