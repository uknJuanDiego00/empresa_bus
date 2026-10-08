<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useClienteStore } from './stores/clienteStore'
import { useVehiculoStore } from './stores/vehiculoStore'
import { useViajeStore } from './stores/viajeStore'
import { useVentaStore } from './stores/ventaStore'

const clienteStore = useClienteStore()
const vehiculoStore = useVehiculoStore()
const viajeStore = useViajeStore()
const ventaStore = useVentaStore()

onMounted(async () => {
  // Sincronizar todos los módulos con la base de datos al iniciar
  await Promise.allSettled([
    clienteStore.cargarClientes(),
    vehiculoStore.cargarVehiculos(),
    viajeStore.cargarViajes(),
    ventaStore.cargarVentas()
  ])
})
</script>
