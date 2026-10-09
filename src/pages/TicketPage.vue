<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg no-print" style="max-width: 650px; margin-left: auto; margin-right: auto;">
      <q-btn flat color="grey-8" icon="arrow_back" label="Volver a Ventas" to="/ventas" no-caps />
      <div class="row q-gutter-sm">
        <q-btn color="primary" icon="print" label="Imprimir / PDF" @click="imprimir" no-caps unelevated />
        <q-btn outline color="primary" icon="add_shopping_cart" label="Nueva Venta" to="/ventas/nueva" no-caps />
      </div>
    </div>

    <div v-if="!obtenerVenta()" class="text-center q-pa-xl">
      <q-icon name="receipt_long" size="48px" color="grey-5" />
      <div class="text-h6 text-grey-6 q-mt-md">Tiquete no encontrado</div>
    </div>

    <div v-else style="max-width: 650px; margin: 0 auto;">
      <q-card flat bordered class="ticket-card vb-card">
        <!-- Encabezado del Tiquete -->
        <div class="bg-primary text-white q-pa-md text-center">
          <div class="row items-center justify-center q-gutter-xs">
            <q-icon name="directions_bus" size="24px" />
            <span class="text-h6 text-weight-bold">VIABUS</span>
          </div>
          <div class="text-caption text-blue-2">Comprobante Oficial de Viaje Intermunicipal</div>
          <div class="text-subtitle2 text-weight-bolder text-mono q-mt-xs">{{ obtenerVenta().id }}</div>
        </div>

        <!-- Ruta -->
        <q-card-section class="ticket-route-section text-center q-py-md">
          <div class="row items-center justify-center q-gutter-md">
            <div>
              <div class="text-h6 text-weight-bold" style="color: var(--vb-text-primary);">{{ obtenerViaje()?.origen }}</div>
              <div class="text-caption" style="color: var(--vb-text-secondary);">Origen</div>
            </div>
            <q-icon name="trending_flat" size="28px" color="primary" />
            <div>
              <div class="text-h6 text-weight-bold" style="color: var(--vb-text-primary);">{{ obtenerViaje()?.destino }}</div>
              <div class="text-caption" style="color: var(--vb-text-secondary);">Destino</div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Detalles del Pasajero y Viaje -->
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-y-sm text-body2">
            <div class="col-6">
              <span class="block text-caption" style="color: var(--vb-text-secondary);">Pasajero:</span>
              <strong style="color: var(--vb-text-primary);">{{ obtenerCliente()?.nombre }}</strong>
            </div>

            <div class="col-6">
              <span class="block text-caption" style="color: var(--vb-text-secondary);">Documento:</span>
              <span class="text-mono" style="color: var(--vb-text-primary);">{{ obtenerCliente()?.tipoDoc }}: {{ obtenerCliente()?.documento }}</span>
            </div>

            <div class="col-6">
              <span class="text-grey-6 block text-caption">Fecha de salida:</span>
              <span>{{ obtenerViaje()?.fecha }}</span>
            </div>

            <div class="col-6">
              <span class="text-grey-6 block text-caption">Hora de salida:</span>
              <span>{{ obtenerViaje()?.hora }}</span>
            </div>

            <div class="col-6">
              <span class="text-grey-6 block text-caption">Vehículo:</span>
              <span>{{ obtenerVehiculo()?.tipo }} {{ obtenerVehiculo()?.placa }}</span>
            </div>

            <div class="col-6">
              <span class="text-grey-6 block text-caption">Conductor:</span>
              <span>{{ obtenerVehiculo()?.conductor }}</span>
            </div>

            <div class="col-6">
              <span class="text-grey-6 block text-caption">Puesto Asignado:</span>
              <q-badge color="amber-3" text-color="black" class="text-weight-bolder text-subtitle2">
                #{{ obtenerVenta().puestoId }}
              </q-badge>
            </div>

            <div class="col-6">
              <span class="text-grey-6 block text-caption">Fecha y hora de emisión:</span>
              <span class="text-caption">{{ obtenerVenta().fechaVenta }}</span>
            </div>

            <div v-if="obtenerVenta().descripcion" class="col-12 q-mt-xs">
              <span class="text-grey-6 block text-caption">Observaciones / Descripción:</span>
              <span class="text-grey-9 text-body2 bg-grey-2 q-pa-xs rounded-borders block">{{ obtenerVenta().descripcion }}</span>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Código QR de Validación del Tiquete y Estado -->
          <div class="row items-center justify-between q-pa-sm bg-grey-1 rounded-borders q-mb-md">
            <div class="row items-center q-gutter-x-md">
              <!-- Gráfico QR Oficial de Comprobante -->
              <svg width="68" height="68" viewBox="0 0 100 100" class="bg-white q-pa-xs rounded-borders shadow-1">
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="10" y="10" width="26" height="26" fill="#1A252C" />
                <rect x="15" y="15" width="16" height="16" fill="#ffffff" />
                <rect x="19" y="19" width="8" height="8" fill="#2471A3" />

                <rect x="64" y="10" width="26" height="26" fill="#1A252C" />
                <rect x="69" y="15" width="16" height="16" fill="#ffffff" />
                <rect x="73" y="19" width="8" height="8" fill="#2471A3" />

                <rect x="10" y="64" width="26" height="26" fill="#1A252C" />
                <rect x="15" y="69" width="16" height="16" fill="#ffffff" />
                <rect x="19" y="73" width="8" height="8" fill="#2471A3" />

                <rect x="42" y="12" width="6" height="6" fill="#1A252C" />
                <rect x="52" y="18" width="6" height="6" fill="#1A252C" />
                <rect x="42" y="28" width="6" height="6" fill="#1A252C" />
                <rect x="42" y="42" width="16" height="16" fill="#2471A3" />
                <rect x="64" y="44" width="8" height="8" fill="#1A252C" />
                <rect x="78" y="52" width="8" height="8" fill="#1A252C" />
                <rect x="44" y="64" width="8" height="8" fill="#1A252C" />
                <rect x="56" y="72" width="12" height="6" fill="#1A252C" />
                <rect x="74" y="74" width="14" height="14" fill="#2471A3" />
              </svg>
              <div>
                <div class="text-weight-bold text-caption text-dark">Código de Seguridad QR</div>
                <div class="text-caption text-mono text-grey-7">HASH: {{ obtenerHashTiquete() }}</div>
                <div class="text-caption text-grey-6">Escanee en punto de abordaje</div>
              </div>
            </div>
            <div>
              <q-chip :color="obtenerVenta().estado === 'Pagado' ? 'positive' : 'warning'" text-color="white" icon="verified">
                {{ obtenerVenta().estado }}
              </q-chip>
            </div>
          </div>

          <!-- Precio -->
          <div class="row items-center justify-between">
            <div>
              <div class="text-caption text-grey-6">Tarifa Total</div>
              <div class="text-h5 text-weight-bolder text-primary">
                ${{ Number(obtenerVenta().precio || 0).toLocaleString('es-CO') }}
              </div>
            </div>
            <div class="text-caption text-grey-6 text-right">
              <div>VIABUS Express S.A.S.</div>
              <div>NIT: 900.123.456-7</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
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

function obtenerVenta() {
  return ventaStore.obtenerVenta(route.params.id)
}

function obtenerCliente() {
  const v = obtenerVenta()
  if (!v) return null
  const c = clienteStore.obtenerCliente(v.clienteId)
  if (c) return c
  if (v.customer && typeof v.customer === 'object') return v.customer
  if (v.customerName) return { nombre: v.customerName, documento: v.customerDoc || '', tipoDoc: 'CC' }
  return null
}

function obtenerViaje() {
  const v = obtenerVenta()
  if (!v) return null
  const vj = viajeStore.obtenerViaje(v.viajeId)
  if (vj) return vj
  if (v.trip && typeof v.trip === 'object') {
    return {
      origen: v.trip.origen || v.trip.origin,
      destino: v.trip.destino || v.trip.destination,
      fecha: v.trip.fecha || v.trip.departureDate,
      hora: v.trip.hora || v.trip.departureTime,
      vehiculoId: v.trip.vehiculoId || (v.trip.bus ? (v.trip.bus._id || v.trip.bus) : ''),
      bus: v.trip.bus
    }
  }
  return null
}

function obtenerVehiculo() {
  const vj = obtenerViaje()
  if (!vj) return null
  const veh = vehiculoStore.obtenerVehiculo(vj.vehiculoId)
  if (veh) return veh
  if (vj.bus && typeof vj.bus === 'object') {
    return {
      tipo: vj.bus.tipo || vj.bus.vehicleType || 'Bus',
      placa: vj.bus.placa || vj.bus.plate || '',
      conductor: vj.bus.conductor || vj.bus.driverName || ''
    }
  }
  return null
}

function obtenerHashTiquete() {
  const v = obtenerVenta()
  if (!v) return 'VB-0000'
  return `VB-${String(v.id).toUpperCase().slice(-6)}`
}

function imprimir() {
  window.print()
}
</script>

<style scoped>
.ticket-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
.ticket-route-section {
  background: var(--vb-bg-surface-hover);
}
@media print {
  .no-print {
    display: none !important;
  }
}
</style>

