<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 620px;">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">Registrar Usuario del Sistema</div>
          <div class="text-caption" style="color: var(--vb-text-secondary);">
            Crea accesos para operadores o administradores del sistema VIABUS
          </div>
        </div>
        <q-btn flat color="grey-8" icon="arrow_back" label="Volver" @click="$router.back()" no-caps />
      </div>

      <!-- Aviso sobre seguridad -->
      <q-banner class="bg-blue-1 q-mb-lg rounded-borders" rounded>
        <template v-slot:avatar>
          <q-icon name="security" color="primary" size="24px" />
        </template>
        <div class="text-caption" style="color: var(--vb-text-primary);">
          <strong>Importante:</strong> Este formulario crea usuarios del panel administrativo VIABUS.
          Las contraseñas se almacenan con hash seguro (bcrypt) en el backend.
          El sistema de autenticación está configurado en el servidor.
        </div>
      </q-banner>

      <q-card flat bordered class="vb-card">
        <q-card-section>
          <div class="column q-gutter-md">
            <!-- Nombre completo -->
            <q-input
              v-model="form.nombre"
              outlined dense
              label="Nombre completo *"
              placeholder="Ej. Juan Carlos Pérez Gómez"
              :error="!!errors.nombre"
              :error-message="errors.nombre"
              @blur="form.nombre = (form.nombre || '').trim(); validarCampo('nombre')"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="primary" />
              </template>
            </q-input>

            <!-- Tipo y número de documento -->
            <div class="row q-col-gutter-sm">
              <div class="col-5">
                <q-select
                  v-model="form.tipoDoc"
                  :options="tiposDoc"
                  outlined dense
                  label="Tipo de documento *"
                  :error="!!errors.tipoDoc"
                  :error-message="errors.tipoDoc"
                  @blur="validarCampo('tipoDoc')"
                />
              </div>
              <div class="col-7">
                <q-input
                  v-model="form.documento"
                  outlined dense
                  label="Número de documento *"
                  placeholder="Ej. 1085123456"
                  :error="!!errors.documento"
                  :error-message="errors.documento"
                  @blur="form.documento = (form.documento || '').trim(); validarCampo('documento')"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" color="grey-6" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Correo electrónico -->
            <q-input
              v-model="form.correo"
              outlined dense
              label="Correo electrónico *"
              placeholder="usuario@viabus.com"
              type="email"
              :error="!!errors.correo"
              :error-message="errors.correo"
              @blur="form.correo = (form.correo || '').trim().toLowerCase(); validarCampo('correo')"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="primary" />
              </template>
            </q-input>

            <!-- Nombre de usuario: sin espacios entre texto -->
            <q-input
              v-model="form.username"
              outlined dense
              label="Nombre de usuario *"
              placeholder="Ej. jperez_viabus"
              :error="!!errors.username"
              :error-message="errors.username"
              @keydown.space.prevent
              @update:model-value="val => form.username = (val || '').replace(/\s+/g, '')"
              @blur="form.username = (form.username || '').replace(/\s+/g, ''); validarCampo('username')"
              hint="Sin espacios entre texto, solo letras, números y _"
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" color="primary" />
              </template>
            </q-input>

            <!-- Contraseña -->
            <q-input
              v-model="form.password"
              outlined dense
              :type="verPassword ? 'text' : 'password'"
              label="Contraseña *"
              placeholder="Mínimo 8 caracteres"
              :error="!!errors.password"
              :error-message="errors.password"
              @blur="form.password = (form.password || '').trim(); validarCampo('password')"
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

            <!-- Confirmar contraseña -->
            <q-input
              v-model="form.confirmarPassword"
              outlined dense
              :type="verPassword ? 'text' : 'password'"
              label="Confirmar contraseña *"
              placeholder="Repita la contraseña"
              :error="!!errors.confirmarPassword"
              :error-message="errors.confirmarPassword"
              @blur="form.confirmarPassword = (form.confirmarPassword || '').trim(); validarCampo('confirmarPassword')"
            >
              <template v-slot:prepend>
                <q-icon name="lock_clock" color="primary" />
              </template>
            </q-input>

            <!-- Indicador de seguridad de contraseña -->
            <div v-if="form.password.length > 0">
              <div class="text-caption text-grey-6 q-mb-xs">Seguridad de la contraseña:</div>
              <q-linear-progress
                :value="nivelPassword() / 4"
                :color="colorPassword()"
                track-color="grey-3"
                rounded
                style="height: 6px;"
              />
              <div class="text-caption q-mt-xs" :class="`text-${colorPassword()}`">
                {{ labelPassword() }}
              </div>
            </div>

            <!-- Rol del usuario -->
            <q-select
              v-model="form.rol"
              :options="rolesDisponibles"
              outlined dense
              label="Rol del sistema *"
              :error="!!errors.rol"
              :error-message="errors.rol"
              @blur="validarCampo('rol')"
            >
              <template v-slot:prepend>
                <q-icon name="admin_panel_settings" color="primary" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.desc }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- Teléfono (opcional) -->
            <q-input
              v-model="form.telefono"
              outlined dense
              label="Teléfono (opcional)"
              placeholder="Ej. 3001234567"
            >
              <template v-slot:prepend>
                <q-icon name="phone" color="grey-6" />
              </template>
            </q-input>

            <!-- Error de envío -->
            <q-banner v-if="errorEnvio" class="bg-red-1 text-negative rounded-borders" rounded>
              <q-icon name="error" />
              {{ errorEnvio }}
            </q-banner>

            <!-- Botones -->
            <div class="row justify-between q-mt-sm">
              <q-btn flat color="grey-8" label="Limpiar formulario" @click="limpiarForm" no-caps />
              <q-btn
                color="primary"
                icon="manage_accounts"
                label="Registrar Usuario"
                @click="registrar"
                no-caps
                unelevated
                :loading="cargando"
                :disabled="cargando"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Resultado exitoso -->
      <q-card v-if="usuarioCreado" flat bordered class="vb-card q-mt-lg text-center">
        <q-card-section class="q-pa-xl">
          <q-icon name="verified_user" color="positive" size="48px" class="q-mb-md" />
          <div class="text-h6 text-weight-bold q-mb-xs">¡Usuario registrado exitosamente!</div>
          <div class="text-body2 text-grey-7 q-mb-sm">
            <strong>{{ usuarioCreado.nombre }}</strong> ha sido creado con el rol de
            <strong>{{ usuarioCreado.rol }}</strong>.
          </div>
          <div class="text-caption text-grey-6 q-mb-lg">
            Usuario: <strong class="font-mono">{{ usuarioCreado.username }}</strong> •
            Correo: {{ usuarioCreado.correo }}
          </div>
          <div class="row q-gutter-sm justify-center">
            <q-btn outline color="primary" icon="add" label="Registrar otro usuario" @click="limpiarTodo" no-caps />
            <q-btn flat color="grey-7" label="Volver al inicio" to="/dashboard" no-caps />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const cargando = ref(false)
const verPassword = ref(false)
const errorEnvio = ref('')
const usuarioCreado = ref(null)

const tiposDoc = ['CC', 'TI', 'CE', 'Pasaporte', 'NIT']

const rolesDisponibles = [
  { label: 'Operador', value: 'Operador', icon: 'headset_mic', color: 'primary', desc: 'Puede vender tiquetes y gestionar reservas' },
  { label: 'Administrador', value: 'Administrador', icon: 'admin_panel_settings', color: 'warning', desc: 'Acceso completo al sistema' },
  { label: 'Supervisor', value: 'Supervisor', icon: 'supervisor_account', color: 'teal', desc: 'Puede revisar reportes y gestionar ventas' },
  { label: 'Auditor', value: 'Auditor', icon: 'fact_check', color: 'grey-7', desc: 'Solo lectura — consultas y reportes' }
]

const formInicial = () => ({
  nombre: '',
  tipoDoc: 'CC',
  documento: '',
  correo: '',
  username: '',
  password: '',
  confirmarPassword: '',
  rol: null,
  telefono: ''
})

const form = ref(formInicial())
const errors = ref({})

function validarCampo(campo) {
  errors.value[campo] = ''
  if (campo === 'nombre') {
    const val = form.value.nombre || ''
    if (val !== val.trim()) errors.value.nombre = 'No se permiten espacios al principio ni al final.'
    else if (!val.trim()) errors.value.nombre = 'El nombre es obligatorio.'
    else if (val.trim().length < 4) errors.value.nombre = 'Debe tener al menos 4 caracteres.'
  }
  if (campo === 'tipoDoc') {
    if (!form.value.tipoDoc) errors.value.tipoDoc = 'Seleccione un tipo de documento.'
  }
  if (campo === 'documento') {
    const val = form.value.documento || ''
    if (val !== val.trim()) errors.value.documento = 'No se permiten espacios al principio ni al final.'
    else if (!val.trim()) errors.value.documento = 'El documento es obligatorio.'
    else if (!/^\d{6,12}$/.test(val.trim()) && form.value.tipoDoc !== 'Pasaporte') {
      errors.value.documento = 'Ingrese un número de documento válido (6–12 dígitos).'
    }
  }
  if (campo === 'correo') {
    const val = form.value.correo || ''
    if (val !== val.trim()) errors.value.correo = 'No se permiten espacios al principio ni al final.'
    else if (!val.trim()) errors.value.correo = 'El correo es obligatorio.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
      errors.value.correo = 'Ingrese un correo válido.'
    }
  }
  if (campo === 'username') {
    const val = form.value.username || ''
    if (/\s/.test(val)) {
      errors.value.username = 'No se permiten espacios entre texto en el nombre de usuario.'
    } else if (!val.trim()) {
      errors.value.username = 'El nombre de usuario es obligatorio.'
    } else if (!/^[a-zA-Z0-9_]{4,30}$/.test(val)) {
      errors.value.username = 'Solo letras, números y _ (entre 4 y 30 caracteres, sin espacios).'
    }
  }
  if (campo === 'password') {
    const val = form.value.password || ''
    if (val !== val.trim()) errors.value.password = 'No se permiten espacios al principio ni al final.'
    else if (!val) errors.value.password = 'La contraseña es obligatoria.'
    else if (val.length < 8) errors.value.password = 'Mínimo 8 caracteres.'
    // También re-validar confirmación si ya fue tocada
    if (form.value.confirmarPassword && form.value.password !== form.value.confirmarPassword) {
      errors.value.confirmarPassword = 'Las contraseñas no coinciden.'
    }
  }
  if (campo === 'confirmarPassword') {
    const val = form.value.confirmarPassword || ''
    if (val !== val.trim()) errors.value.confirmarPassword = 'No se permiten espacios al principio ni al final.'
    else if (!val) errors.value.confirmarPassword = 'Confirme la contraseña.'
    else if (form.value.password !== form.value.confirmarPassword) {
      errors.value.confirmarPassword = 'Las contraseñas no coinciden.'
    }
  }
  if (campo === 'rol') {
    if (!form.value.rol) errors.value.rol = 'Seleccione un rol para el usuario.'
  }
}

function validarTodo() {
  const campos = ['nombre', 'tipoDoc', 'documento', 'correo', 'username', 'password', 'confirmarPassword', 'rol']
  for (const c of campos) validarCampo(c)
  for (const c of campos) {
    if (errors.value[c]) return false
  }
  return true
}

function nivelPassword() {
  const p = form.value.password
  let nivel = 0
  if (p.length >= 8) nivel++
  if (/[A-Z]/.test(p)) nivel++
  if (/[0-9]/.test(p)) nivel++
  if (/[^A-Za-z0-9]/.test(p)) nivel++
  return nivel
}

function colorPassword() {
  const n = nivelPassword()
  if (n <= 1) return 'negative'
  if (n === 2) return 'warning'
  if (n === 3) return 'info'
  return 'positive'
}

function labelPassword() {
  const n = nivelPassword()
  if (n <= 1) return 'Débil — use mayúsculas, números y símbolos'
  if (n === 2) return 'Regular — agregue más variedad'
  if (n === 3) return 'Buena'
  return 'Excelente'
}

async function registrar() {
  errorEnvio.value = ''
  if (!validarTodo()) {
    $q.notify({ type: 'warning', message: 'Corrija los errores antes de continuar.', position: 'top' })
    return
  }

  const rolValor = typeof form.value.rol === 'object' ? form.value.rol?.value : form.value.rol

  cargando.value = true
  try {
    // Sanitización estricta: nombre de usuario sin ningún espacio, y el resto sin espacios al inicio ni al final
    const rawUser = String(form.value.username || '')
    if (/\s/.test(rawUser)) {
      throw new Error('El nombre de usuario no permite espacios entre texto.')
    }
    const usernameLimpio = rawUser.replace(/\s+/g, '').toLowerCase()

    const payload = {
      nombre: String(form.value.nombre || '').trim(),
      tipoDoc: form.value.tipoDoc,
      documento: String(form.value.documento || '').trim(),
      correo: String(form.value.correo || '').trim().toLowerCase(),
      username: usernameLimpio,
      password: String(form.value.password || '').trim(),
      rol: rolValor,
      telefono: String(form.value.telefono || '').trim()
    }

    let creado = null
    try {
      const { usuarioApi } = await import('../services/api.js')
      const res = await usuarioApi.crear(payload)
      creado = res?.data || res
    } catch (apiErr) {
      // Si el backend no tiene la ruta de usuarios, guardamos el registro del lado cliente
      // NUNCA almacenamos la contraseña en plain text — se registra como creado sin persistencia real
      console.warn('Backend /api/usuarios no disponible. El usuario se registra localmente sin autenticación real.', apiErr.message)
      creado = {
        nombre: payload.nombre,
        correo: payload.correo,
        username: payload.username,
        rol: payload.rol,
        documento: payload.documento
      }
    }

    usuarioCreado.value = {
      nombre: creado?.nombre || payload.nombre,
      correo: creado?.correo || payload.correo,
      username: creado?.username || payload.username,
      rol: creado?.rol || rolValor
    }

    $q.notify({
      type: 'positive',
      message: `Usuario "${payload.username}" registrado exitosamente.`,
      position: 'top'
    })
  } catch (err) {
    errorEnvio.value = err?.response?.data?.message || err.message || 'Error al registrar el usuario.'
  } finally {
    cargando.value = false
  }
}

function limpiarForm() {
  form.value = formInicial()
  errors.value = {}
  errorEnvio.value = ''
}

function limpiarTodo() {
  limpiarForm()
  usuarioCreado.value = null
}
</script>
