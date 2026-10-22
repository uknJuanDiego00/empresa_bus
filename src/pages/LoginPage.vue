<template>
  <div class="login-wrapper fullscreen row items-center justify-center">
    <div class="login-card-container q-pa-md">
      <!-- Tarjeta principal de acceso -->
      <q-card flat bordered class="login-card shadow-3">
        <!-- Encabezado con identidad visual VIABUS -->
        <div class="login-header text-center q-pa-lg">
          <div class="brand-logo-icon q-mx-auto q-mb-sm">
            <q-icon name="directions_bus" size="32px" color="white" />
          </div>
          <div class="text-h5 text-weight-bolder text-white tracking-wide">VIABUS</div>
          <div class="text-caption text-blue-2">Sistema de Gestión de Transporte Terrestre</div>
        </div>

        <q-card-section class="q-pa-lg">
          <div class="text-subtitle1 text-weight-bold text-center q-mb-xs" style="color: var(--vb-text-primary);">
            Iniciar Sesión
          </div>
          <div class="text-caption text-center text-grey-7 q-mb-lg">
            Ingrese sus credenciales registradas para acceder a la plataforma
          </div>

          <!-- Mensaje de error general -->
          <q-banner v-if="errorMsg" class="bg-red-1 text-negative rounded-borders q-mb-md" rounded>
            <template v-slot:avatar>
              <q-icon name="error_outline" color="negative" size="22px" />
            </template>
            <div class="text-caption text-weight-medium">{{ errorMsg }}</div>
          </q-banner>

          <q-form @submit.prevent="submitLogin" class="q-gutter-y-md">
            <!-- Correo electrónico -->
            <div>
              <q-input
                v-model="form.correo"
                outlined
                dense
                type="email"
                label="Correo electrónico *"
                placeholder="ejemplo@viabus.com"
                :error="!!errors.correo"
                :error-message="errors.correo"
                @blur="validarCampo('correo')"
                :disable="cargando"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="primary" />
                </template>
              </q-input>
            </div>

            <!-- Nombre de usuario -->
            <div>
              <q-input
                v-model="form.username"
                outlined
                dense
                label="Nombre de usuario *"
                placeholder="Ej. superadmin"
                :error="!!errors.username"
                :error-message="errors.username"
                @blur="validarCampo('username')"
                :disable="cargando"
              >
                <template v-slot:prepend>
                  <q-icon name="account_circle" color="primary" />
                </template>
              </q-input>
            </div>

            <!-- Contraseña -->
            <div>
              <q-input
                v-model="form.password"
                outlined
                dense
                :type="verPassword ? 'text' : 'password'"
                label="Contraseña *"
                placeholder="Ingrese su contraseña"
                :error="!!errors.password"
                :error-message="errors.password"
                @blur="validarCampo('password')"
                :disable="cargando"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="verPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer text-grey-6"
                    @click="verPassword = !verPassword"
                  />
                </template>
              </q-input>
            </div>

            <!-- Botón de acceso -->
            <div class="q-pt-sm">
              <q-btn
                type="submit"
                color="primary"
                icon-right="login"
                label="Ingresar a viaBus"
                class="full-width text-weight-bold"
                size="md"
                unelevated
                no-caps
                :loading="cargando"
                :disable="cargando"
              />
            </div>
          </q-form>
        </q-card-section>

        <!-- Pie de página -->
        <div class="q-pa-sm text-center text-caption text-grey-6 bg-grey-1" style="font-size: 11px;">
          VIABUS Enterprise • Plataforma de Transporte Terrestre v1.0
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore, ROLES } from '../stores/authStore'
import { validarEmail } from '../utils/security'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const cargando = ref(false)
const verPassword = ref(false)
const errorMsg = ref('')

const form = reactive({
  correo: '',
  username: '',
  password: ''
})

const errors = reactive({
  correo: '',
  username: '',
  password: ''
})

onMounted(async () => {
  await authStore.inicializar()

  // Si ya tiene sesión activa válida, redirigir según su rol
  if (authStore.usuarioActual && authStore.token) {
    redirigirSegunRol(authStore.usuarioActual.rol)
  }
})

function validarCampo(campo) {
  errors[campo] = ''
  if (campo === 'correo') {
    const val = String(form.correo || '').trim()
    if (!val) {
      errors.correo = 'El correo electrónico es obligatorio.'
    } else if (!validarEmail(val)) {
      errors.correo = 'Ingrese un formato de correo electrónico válido.'
    }
  }
  if (campo === 'username') {
    const val = String(form.username || '').trim()
    if (!val) {
      errors.username = 'El nombre de usuario es obligatorio.'
    }
  }
  if (campo === 'password') {
    const val = String(form.password || '').trim()
    if (!val) {
      errors.password = 'La contraseña es obligatoria.'
    }
  }
}

function validarTodo() {
  validarCampo('correo')
  validarCampo('username')
  validarCampo('password')
  return !errors.correo && !errors.username && !errors.password
}

async function submitLogin() {
  errorMsg.value = ''

  if (!validarTodo()) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete todos los campos requeridos correctamente.',
      position: 'top'
    })
    return
  }

  cargando.value = true

  try {
    const usuario = await authStore.iniciarSesion({
      correo: form.correo,
      username: form.username,
      password: form.password
    })

    $q.notify({
      type: 'positive',
      icon: 'verified',
      message: `Bienvenido, ${usuario.nombre}`,
      caption: `Rol: ${usuario.rol}`,
      position: 'top'
    })

    redirigirSegunRol(usuario.rol)
  } catch (err) {
    errorMsg.value = err.message || 'Error de autenticación: verifique sus credenciales.'
    $q.notify({
      type: 'negative',
      icon: 'error',
      message: errorMsg.value,
      position: 'top'
    })
  } finally {
    cargando.value = false
  }
}

function redirigirSegunRol(rol) {
  const rutaDestino = route.query.redirect

  // Si el usuario tenía una ruta pendiente y tiene permisos para ella, ir allí
  if (rutaDestino && authStore.tienePermiso(extraerNombreRuta(rutaDestino))) {
    router.push(rutaDestino)
    return
  }

  // Redirección predeterminada según el perfil
  if (rol === ROLES.SUPERADMIN) {
    router.push('/viajes')
  } else if (rol === ROLES.ADMINISTRADOR) {
    router.push('/viajes')
  } else if (rol === ROLES.OFICINA) {
    router.push('/viajes')
  } else {
    router.push('/viajes')
  }
}

function extraerNombreRuta(path) {
  if (!path) return 'dashboard'
  const partes = path.split('/').filter(Boolean)
  return partes[0] || 'dashboard'
}
</script>

<style scoped>
.login-wrapper {
  background: linear-gradient(135deg, #1C2833 0%, #0F172A 50%, #1E293B 100%);
  min-height: 100vh;
}

.login-card-container {
  width: 100%;
  max-width: 460px;
}

.login-card {
  border-radius: 16px;
  overflow: hidden;
  background: var(--vb-bg-surface, #ffffff);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-header {
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
}

.brand-logo-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.pt-border-top {
  border-top: 1px solid var(--vb-border, #E2E8F0);
  padding-top: 14px;
}
</style>
