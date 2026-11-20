<template>
  <q-card v-if="wrapCard" flat bordered class="vb-card q-mb-md shadow-1 rounded-borders">
    <q-card-section class="q-py-sm">
      <q-input
        v-model="model"
        outlined
        dense
        :placeholder="placeholder"
        clearable
        :style="maxWidth ? `max-width: ${maxWidth};` : ''"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>
    </q-card-section>
  </q-card>

  <div v-else class="row q-mb-md">
    <div :class="colClass || 'col-12 col-md-5'">
      <q-input
        v-model="model"
        outlined
        dense
        :placeholder="placeholder"
        clearable
        :style="maxWidth ? `max-width: ${maxWidth};` : ''"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
const model = defineModel({
  type: String,
  default: ''
})

defineProps({
  placeholder: {
    type: String,
    default: 'Buscar...'
  },
  maxWidth: {
    type: String,
    default: ''
  },
  wrapCard: {
    type: Boolean,
    default: true
  },
  colClass: {
    type: String,
    default: ''
  }
})
</script>
