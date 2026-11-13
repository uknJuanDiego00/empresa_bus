<template>
  <div class="row items-center justify-between q-mb-lg">
    <!-- Bloque izquierdo: badge opcional + título + subtítulo -->
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

    <!-- Bloque derecho: slot para botones / acciones personalizadas -->
    <div class="row q-gutter-sm">
      <slot />
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
  fondo: {
    type: string,
    default: blue
  }
,
  colorDetexto:{
    type: string,
    default: white
  },
  icon:{
    type: string,
    default: null
  }
})
</script>

