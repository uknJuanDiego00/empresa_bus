<template>
  <div class="row items-center justify-between q-mb-lg">
    <!-- Bloque izquierdo: título, subtítulo y badge opcional -->
    <div>
      <div v-if="badge" class="row items-center q-gutter-x-sm">
        <q-badge :color="badge.color || 'primary'" :text-color="badge.textColor || 'white'" class="text-weight-bold text-caption q-pa-xs">
          <q-icon v-if="badge.icon" :name="badge.icon" size="14px" class="q-mr-xs" />
          {{ badge.text }}
        </q-badge>
        <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">
          {{ title }}
        </div>
      </div>
      <div v-else class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">
        {{ title }}
      </div>
      <div v-if="subtitle" class="text-caption" style="color: var(--vb-text-secondary);">
        {{ subtitle }}
      </div>
    </div>

    <!-- Bloque derecho: botones directos y sencillos mediante props básicas -->
    <div class="row q-gutter-sm">
      <!-- Botón principal -->
      <q-btn
        v-if="botonTexto"
        color="primary"
        unelevated
        no-caps
        :icon="botonIcono"
        :label="botonTexto"
        :to="botonRuta"
        @click="onBotonClick ? onBotonClick() : null"
      />

      <!-- Segundo botón opcional (por ejemplo en Ventas) -->
      <q-btn
        v-if="boton2Texto"
        outline
        color="primary"
        no-caps
        :icon="boton2Icono"
        :label="boton2Texto"
        :to="boton2Ruta"
        @click="onBoton2Click ? onBoton2Click() : null"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  badge: {
    type: Object,
    default: null
  },
  // Botón principal
  botonTexto: {
    type: String,
    default: ''
  },
  botonIcono: {
    type: String,
    default: ''
  },
  botonRuta: {
    type: String,
    default: ''
  },
  onBotonClick: {
    type: Function,
    default: null
  },
  // Segundo botón opcional
  boton2Texto: {
    type: String,
    default: ''
  },
  boton2Icono: {
    type: String,
    default: ''
  },
  boton2Ruta: {
    type: String,
    default: ''
  },
  onBoton2Click: {
    type: Function,
    default: null
  }
})
</script>
