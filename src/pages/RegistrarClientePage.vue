<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 780px;">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">
            Registrar Cliente
          </div>
          <div class="text-caption" style="color: var(--vb-text-secondary);">
            Ingreso de un nuevo pasajero
          </div>
        </div>

        <q-btn
          flat
          color="primary"
          icon="arrow_back"
          label="Volver"
          to="/clientes"
          no-caps
        />
      </div>

      <!-- Mensaje de éxito -->
      <q-banner
        v-if="exito"
        class="bg-green-1 text-positive q-mb-md rounded-borders"
        rounded
      >
        <template v-slot:avatar>
          <q-icon name="check_circle" color="positive" />
        </template>

        Cliente registrado exitosamente en la base de datos.
      </q-banner>

      <!-- Mensaje de error -->
      <q-banner
        v-if="errorServidor"
        class="bg-red-1 text-negative q-mb-md rounded-borders"
        rounded
      >
        <template v-slot:avatar>
          <q-icon name="error" color="negative" />
        </template>
        {{ errorServidor }}
      </q-banner>

      <q-card flat bordered class="vb-card shadow-1 rounded-borders">
        <q-card-section class="q-pa-lg">

          <q-form
            ref="formRef"
            @submit="guardar"
            class="q-gutter-md"
          >
            <div class="row q-col-gutter-md">

              <!-- Tipo de documento -->
              <div class="col-12 col-sm-6">
                <q-select
                  outlined
                  dense
                  v-model="form.tipoDoc"
                  :options="opcionesDoc"
                  emit-value
                  map-options
                  label="Tipo de documento *"
                  lazy-rules
                  :rules="[
                    val => !!val || 'Seleccione el tipo de documento'
                  ]"
                />
              </div>

              <!-- Documento -->
              <div class="col-12 col-sm-6">
                <q-input
                  outlined
                  dense
                  v-model="form.documento"
                  label="Número de documento *"
                  placeholder="1020304050"
                  lazy-rules
                  :rules="[
                    val => !!val?.trim() || 'El documento es obligatorio',
                    val => !store.documentoExiste(val) || 'Este documento ya está registrado'
                  ]"
                />
              </div>

              <!-- Nombre -->
              <div class="col-12">
                <q-input
                  outlined
                  dense
                  v-model="form.nombre"
                  label="Nombre completo *"
                  placeholder="Nombres y Apellidos"
                  lazy-rules
                  :rules="[
                    val => !!val?.trim() || 'El nombre es obligatorio'
                  ]"
                />
              </div>

              <!-- Teléfono -->
              <div class="col-12 col-sm-6">
                <q-input
                  outlined
                  dense
                  v-model="form.telefono"
                  label="Teléfono *"
                  placeholder="3101234567"
                  lazy-rules
                  :rules="[
                    val => !!val?.trim() || 'El teléfono es obligatorio'
                  ]"
                />
              </div>

              <!-- Correo -->
              <div class="col-12 col-sm-6">
                <q-input
                  outlined
                  dense
                  type="email"
                  v-model="form.correo"
                  label="Correo electrónico *"
                  placeholder="correo@ejemplo.com"
                  lazy-rules
                  :rules="[
                    val => !!val?.trim() || 'El correo es obligatorio',
                    val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
                      'Ingrese un correo electrónico válido'
                  ]"
                />
              </div>

              <!-- Dirección -->
              <div class="col-12">
                <q-input
                  outlined
                  dense
                  v-model="form.direccion"
                  label="Dirección *"
                  placeholder="Dirección de residencia"
                  lazy-rules
                  :rules="[
                    val => !!val?.trim() || 'La dirección es obligatoria'
                  ]"
                />
              </div>
            </div>

            <!-- Botones -->
            <div class="row items-center q-gutter-md q-pt-md">

              <q-btn
                type="submit"
                color="primary"
                icon="save"
                label="Guardar Cliente"
                no-caps
                unelevated
              />

              <q-btn
                type="button"
                flat
                color="grey-7"
                label="Limpiar"
                @click="limpiar"
                no-caps
              />

            </div>
          </q-form>

        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useClienteStore } from '../stores/clienteStore'

const store = useClienteStore()

const formRef = ref(null)
const exito = ref(false)
const errorServidor = ref('')

const opcionesDoc = [
  {
    label: 'CC – Cédula de Ciudadanía',
    value: 'CC'
  },
  {
    label: 'TI – Tarjeta de Identidad',
    value: 'TI'
  },
  {
    label: 'CE – Cédula de Extranjería',
    value: 'CE'
  },
  {
    label: 'PP – Pasaporte',
    value: 'PP'
  },
  {
    label: 'NIT – Número de Identificación Tributaria',
    value: 'NIT'
  }
]

const form = reactive({
  tipoDoc: '',
  documento: '',
  nombre: '',
  telefono: '',
  correo: '',
  direccion: ''
})

async function guardar() {
  exito.value = false
  errorServidor.value = ''

  try {
    await store.registrarCliente({
      tipoDoc: form.tipoDoc,
      documento: form.documento.trim(),
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      direccion: form.direccion.trim()
    })

    // Mostrar mensaje de éxito
    exito.value = true

    // Limpiar campos y resetear estado de validación
    await resetFormulario()
  } catch (err) {
    errorServidor.value = err?.message || 'Error al registrar cliente en el servidor'
  }
}

async function resetFormulario() {
  form.tipoDoc = ''
  form.documento = ''
  form.nombre = ''
  form.telefono = ''
  form.correo = ''
  form.direccion = ''

  await nextTick()
  formRef.value?.resetValidation()
}

function limpiar() {
  exito.value = false
  resetFormulario()
}
</script>
