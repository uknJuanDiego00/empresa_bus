<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 840px;">
      <!-- CABECERA -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bold text-dark q-mb-xs">Registrar Cliente</div>
          <div class="text-subtitle2 text-grey-7">Ingreso de nuevo pasajero a la base de datos</div>
        </div>
        <q-btn flat color="grey-8" icon="arrow_back" label="Volver a Clientes" to="/clientes" no-caps />
      </div>

      <!-- MENSAJE DE ÉXITO -->
      <q-banner v-if="exito" class="bg-green-1 text-positive q-mb-md rounded-borders" rounded>
        <template v-slot:avatar>
          <q-icon name="check_circle" color="positive" size="24px" />
        </template>
        <div>
          Cliente registrado exitosamente en el sistema VIABUS.
          <q-btn flat dense color="primary" label="Ir a Ventas" to="/ventas/nueva" no-caps class="q-ml-sm text-weight-bold" />
        </div>
      </q-banner>

      <!-- FORMULARIO -->
      <q-card flat class="vb-card">
        <q-card-section class="q-pa-xl">
          <q-form ref="formRef" @submit="guardar" class="q-gutter-y-lg">
            
            <!-- SECCIÓN 1: IDENTIFICACIÓN -->
            <div>
              <div class="text-subtitle2 text-weight-bold text-dark q-mb-xs">1. INFORMACIÓN DE IDENTIDAD</div>
              <div class="text-caption text-grey-6 q-mb-md">Documento oficial y nombre completo del pasajero</div>

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
                    :rules="[val => !!val || 'Seleccione el tipo de documento']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" size="18px" color="grey-6" />
                    </template>
                  </q-select>
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
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="pin" size="18px" color="grey-6" />
                    </template>
                  </q-input>
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
                    :rules="[val => !!val?.trim() || 'El nombre es obligatorio']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <q-separator />

            <!-- SECCIÓN 2: CONTACTO -->
            <div>
              <div class="text-subtitle2 text-weight-bold text-dark q-mb-xs">2. DATOS DE CONTACTO</div>
              <div class="text-caption text-grey-6 q-mb-md">Información para notificaciones y facturación</div>

              <div class="row q-col-gutter-md">
                <!-- Teléfono -->
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    dense
                    v-model="form.telefono"
                    label="Teléfono de contacto *"
                    placeholder="3101234567"
                    lazy-rules
                    :rules="[val => !!val?.trim() || 'El teléfono es obligatorio']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="phone" size="18px" color="grey-6" />
                    </template>
                  </q-input>
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
                      val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Ingrese un correo electrónico válido'
                    ]"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="mail" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>

                <!-- Dirección -->
                <div class="col-12">
                  <q-input
                    outlined
                    dense
                    v-model="form.direccion"
                    label="Dirección de residencia *"
                    placeholder="Dirección completa"
                    lazy-rules
                    :rules="[val => !!val?.trim() || 'La dirección es obligatoria']"
                    class="bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="home" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <q-separator />

            <!-- BOTONES -->
            <div class="row items-center q-gutter-md q-pt-sm">
              <q-btn
                type="submit"
                color="primary"
                icon="save"
                label="Guardar Cliente"
                no-caps
                unelevated
                class="q-px-lg text-weight-bold"
              />
              <q-btn
                type="button"
                flat
                color="grey-7"
                label="Limpiar Formulario"
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

const opcionesDoc = [
  { label: 'CC – Cédula de Ciudadanía', value: 'CC' },
  { label: 'TI – Tarjeta de Identidad', value: 'TI' },
  { label: 'CE – Cédula de Extranjería', value: 'CE' },
  { label: 'PP – Pasaporte', value: 'PP' },
  { label: 'NIT – Identificación Tributaria', value: 'NIT' }
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
  store.registrarCliente({
    tipoDoc: form.tipoDoc,
    documento: form.documento.trim(),
    nombre: form.nombre.trim(),
    telefono: form.telefono.trim(),
    correo: form.correo.trim(),
    direccion: form.direccion.trim()
  })

  exito.value = true
  await resetFormulario()
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
