<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1200px;">
      <!-- Cabecera del módulo -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="row items-center q-gutter-x-sm">
            <q-badge color="purple-9" text-color="white" class="text-weight-bold text-caption q-pa-xs">
              <q-icon name="security" size="14px" class="q-mr-xs" />
              EXCLUSIVO SUPERADMIN
            </q-badge>
            <div class="text-h5 text-weight-bold" style="color: var(--vb-text-primary);">
              Gestión Global de Usuarios
            </div>
          </div>
          <div class="text-caption" style="color: var(--vb-text-secondary);">
            Control administrativo global: altas, bajas, roles y restablecimiento de credenciales
          </div>
        </div>

        <div class="row q-gutter-sm">
          <q-btn
            color="primary"
            icon="person_add"
            label="Nuevo Usuario"
            @click="abrirModalCrear"
            no-caps
            unelevated
            class="text-weight-bold"
          />
        </div>
      </div>

      <!-- Métricas del sistema de usuarios -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="vb-card text-center q-pa-md">
            <div class="text-caption text-grey-7">Total Cuentas</div>
            <div class="text-h5 text-weight-bold text-primary">{{ obtenerTotalUsuarios() }}</div>
            <div class="text-caption text-grey-6">{{ obtenerUsuariosActivos() }} activas</div>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="vb-card text-center q-pa-md">
            <div class="text-caption text-grey-7">Superadministradores</div>
            <div class="text-h5 text-weight-bold text-purple-9">{{ obtenerConteoRol('SUPERADMIN') }}</div>
            <div class="text-caption text-grey-6">Control global total</div>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="vb-card text-center q-pa-md">
            <div class="text-caption text-grey-7">Administradores</div>
            <div class="text-h5 text-weight-bold text-info">{{ obtenerConteoRol('ADMINISTRADOR') }}</div>
            <div class="text-caption text-grey-6">Gestión de flota y viajes</div>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="vb-card text-center q-pa-md">
            <div class="text-caption text-grey-7">Operadores de Oficina</div>
            <div class="text-h5 text-weight-bold text-positive">{{ obtenerConteoRol('OFICINA') }}</div>
            <div class="text-caption text-grey-6">Ventas y reservas</div>
          </q-card>
        </div>
      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <q-card flat bordered class="vb-card q-mb-md">
        <q-card-section class="q-py-sm">
          <div class="row q-col-gutter-sm items-center">
            <div class="col-12 col-md-6">
              <q-input
                v-model="filtroBusqueda"
                outlined
                dense
                placeholder="Buscar por nombre, usuario, correo o documento..."
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="primary" />
                </template>
              </q-input>
            </div>
            <div class="col-6 col-md-3">
              <q-select
                v-model="filtroRol"
                :options="['Todos los roles', 'SUPERADMIN', 'ADMINISTRADOR', 'OFICINA']"
                outlined
                dense
                label="Filtrar por rol"
              />
            </div>
            <div class="col-6 col-md-3">
              <q-select
                v-model="filtroEstado"
                :options="['Todos los estados', 'Activos', 'Bloqueados']"
                outlined
                dense
                label="Filtrar por estado"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla de Usuarios -->
      <q-card flat bordered class="vb-card shadow-1 overflow-hidden">
        <q-table
          flat
          dense
          :rows="obtenerUsuariosFiltrados()"
          :columns="columnas"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="No se encontraron usuarios registrados"
          class="usuarios-table"
        >
          <!-- Usuario y Nombre -->
          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-sm no-wrap">
                <q-avatar size="28px" :color="obtenerColorAvatar(props.row.rol)" text-color="white" class="text-weight-bold">
                  {{ obtenerIniciales(props.row.nombre) }}
                </q-avatar>
                <div>
                  <div class="text-weight-bold text-caption text-dark">{{ props.row.nombre }}</div>
                  <div class="text-caption text-grey-6 font-mono" style="font-size: 11px;">
                    @{{ props.row.username }}
                  </div>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Documento -->
          <template v-slot:body-cell-documento="props">
            <q-td :props="props">
              <span class="text-caption text-grey-8 font-mono">
                {{ props.row.tipoDoc }}: {{ props.row.documento }}
              </span>
            </q-td>
          </template>

          <!-- Correo -->
          <template v-slot:body-cell-correo="props">
            <q-td :props="props">
              <span class="text-caption text-grey-8">{{ props.row.correo }}</span>
            </q-td>
          </template>

          <!-- Rol -->
          <template v-slot:body-cell-rol="props">
            <q-td :props="props">
              <q-badge
                :color="obtenerColorBadgeRol(props.row.rol)"
                :text-color="props.row.rol === 'SUPERADMIN' ? 'white' : 'dark'"
                class="text-weight-bold"
              >
                <q-icon :name="obtenerIconoRol(props.row.rol)" size="12px" class="q-mr-xs" />
                {{ props.row.rol }}
              </q-badge>
            </q-td>
          </template>

          <!-- Estado -->
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.activo !== false ? 'positive' : 'negative'"
                class="text-weight-bold"
              >
                {{ props.row.activo !== false ? 'Activo' : 'Bloqueado' }}
              </q-badge>
            </q-td>
          </template>

          <!-- Acciones de administración -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-right">
              <div class="row items-center justify-end q-gutter-x-xs no-wrap">
                <!-- Editar información -->
                <q-btn
                  flat round dense size="sm" color="primary" icon="edit"
                  @click="abrirModalEditar(props.row)"
                >
                  <q-tooltip>Editar información y rol</q-tooltip>
                </q-btn>

                <!-- Restablecer contraseña -->
                <q-btn
                  flat round dense size="sm" color="amber-9" icon="lock_reset"
                  @click="abrirModalRestablecer(props.row)"
                >
                  <q-tooltip>Restablecer contraseña</q-tooltip>
                </q-btn>

                <!-- Activar / Bloquear -->
                <q-btn
                  flat round dense size="sm"
                  :color="props.row.activo !== false ? 'negative' : 'positive'"
                  :icon="props.row.activo !== false ? 'block' : 'check_circle'"
                  @click="toggleEstado(props.row)"
                  :disable="props.row.id === authStore.usuarioActual?.id"
                >
                  <q-tooltip>
                    {{ props.row.activo !== false ? 'Bloquear cuenta' : 'Activar cuenta' }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- MODAL: REGISTRAR NUEVO USUARIO -->
    <q-dialog v-model="modalCrearVisible" persistent>
      <q-card style="min-width: 500px; max-width: 600px; border-radius: 12px;">
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="person_add" size="22px" />
            <div class="text-subtitle1 text-weight-bold">Registrar Nuevo Usuario</div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit.prevent="guardarNuevoUsuario" class="column q-gutter-y-sm">
            <!-- Nombre -->
            <q-input
              v-model="formCrear.nombre"
              outlined dense
              label="Nombre completo *"
              placeholder="Ej. Carlos Arturo Gómez"
              lazy-rules
              :rules="[val => !!val?.trim() || 'El nombre es obligatorio']"
            />

            <!-- Tipo y documento -->
            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <q-select
                  v-model="formCrear.tipoDoc"
                  :options="['CC', 'TI', 'CE', 'Pasaporte']"
                  outlined dense
                  label="Tipo Doc *"
                />
              </div>
              <div class="col-8">
                <q-input
                  v-model="formCrear.documento"
                  outlined dense
                  label="Número de documento *"
                  placeholder="1085123456"
                  lazy-rules
                  :rules="[val => !!val?.trim() || 'El documento es obligatorio']"
                />
              </div>
            </div>

            <!-- Correo -->
            <q-input
              v-model="formCrear.correo"
              outlined dense
              type="email"
              label="Correo electrónico *"
              placeholder="usuario@viabus.com"
              lazy-rules
              :rules="[
                val => !!val?.trim() || 'El correo es obligatorio',
                val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Formato de correo no válido'
              ]"
            />

            <!-- Nombre de usuario -->
            <q-input
              v-model="formCrear.username"
              outlined dense
              label="Nombre de usuario *"
              placeholder="cgomez_viabus"
              hint="Solo letras, números y _"
              lazy-rules
              :rules="[val => !!val?.trim() || 'El nombre de usuario es obligatorio']"
            />

            <!-- Rol -->
            <q-select
              v-model="formCrear.rol"
              :options="rolesOpciones"
              emit-value
              map-options
              outlined dense
              label="Rol del sistema *"
              lazy-rules
              :rules="[val => !!val || 'Seleccione un rol']"
            >
              <template v-slot:prepend>
                <q-icon name="admin_panel_settings" color="primary" />
              </template>
            </q-select>

            <!-- Contraseña inicial -->
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model="formCrear.password"
                  outlined dense
                  type="password"
                  label="Contraseña inicial *"
                  placeholder="Mínimo 8 caracteres"
                  lazy-rules
                  :rules="[val => (val && val.length >= 8) || 'Mínimo 8 caracteres']"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="formCrear.confirmarPassword"
                  outlined dense
                  type="password"
                  label="Confirmar contraseña *"
                  placeholder="Repita la contraseña"
                  lazy-rules
                  :rules="[val => val === formCrear.password || 'Las contraseñas no coinciden']"
                />
              </div>
            </div>

            <!-- Teléfono -->
            <q-input
              v-model="formCrear.telefono"
              outlined dense
              label="Teléfono de contacto (opcional)"
              placeholder="3001234567"
            />

            <q-card-actions align="right" class="q-pt-md">
              <q-btn flat label="Cancelar" color="grey-7" v-close-popup no-caps />
              <q-btn
                type="submit"
                color="primary"
                icon="save"
                label="Registrar Usuario"
                unelevated
                no-caps
                :loading="guardando"
                :disable="guardando"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- MODAL: EDITAR INFORMACIÓN DE USUARIO -->
    <q-dialog v-model="modalEditarVisible" persistent>
      <q-card style="min-width: 480px; max-width: 550px; border-radius: 12px;">
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="edit" size="22px" />
            <div class="text-subtitle1 text-weight-bold">Editar Usuario</div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit.prevent="guardarEdicionUsuario" class="column q-gutter-y-sm">
            <q-input
              v-model="formEditar.nombre"
              outlined dense
              label="Nombre completo *"
              lazy-rules
              :rules="[val => !!val?.trim() || 'El nombre es obligatorio']"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <q-select
                  v-model="formEditar.tipoDoc"
                  :options="['CC', 'TI', 'CE', 'Pasaporte']"
                  outlined dense
                  label="Tipo Doc"
                />
              </div>
              <div class="col-8">
                <q-input
                  v-model="formEditar.documento"
                  outlined dense
                  label="Número de documento *"
                  lazy-rules
                  :rules="[val => !!val?.trim() || 'El documento es obligatorio']"
                />
              </div>
            </div>

            <q-input
              v-model="formEditar.correo"
              outlined dense
              type="email"
              label="Correo electrónico *"
              lazy-rules
              :rules="[
                val => !!val?.trim() || 'El correo es obligatorio',
                val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Formato de correo no válido'
              ]"
            />

            <!-- Asignar rol (solo SUPERADMIN) -->
            <q-select
              v-model="formEditar.rol"
              :options="rolesOpciones"
              emit-value
              map-options
              outlined dense
              label="Rol del sistema *"
              lazy-rules
              :rules="[val => !!val || 'Seleccione un rol']"
            >
              <template v-slot:prepend>
                <q-icon name="admin_panel_settings" color="primary" />
              </template>
            </q-select>

            <q-input
              v-model="formEditar.telefono"
              outlined dense
              label="Teléfono"
            />

            <q-card-actions align="right" class="q-pt-md">
              <q-btn flat label="Cancelar" color="grey-7" v-close-popup no-caps />
              <q-btn
                type="submit"
                color="primary"
                icon="save"
                label="Guardar Cambios"
                unelevated
                no-caps
                :loading="guardando"
                :disable="guardando"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- MODAL: RESTABLECER CONTRASEÑA -->
    <q-dialog v-model="modalRestablecerVisible" persistent>
      <q-card style="min-width: 420px; border-radius: 12px;">
        <q-card-section class="bg-amber-9 text-white row items-center justify-between">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="lock_reset" size="22px" />
            <div class="text-subtitle1 text-weight-bold">Restablecer Contraseña</div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-caption text-grey-7 q-mb-md">
            Asignar una nueva contraseña segura para el usuario
            <strong>@{{ usuarioSeleccionado?.username }}</strong> ({{ usuarioSeleccionado?.nombre }}).
            La contraseña se guardará cifrada con hash criptográfico SHA-256.
          </div>

          <q-form @submit.prevent="guardarNuevaPassword" class="column q-gutter-y-sm">
            <q-input
              v-model="nuevaPassword"
              outlined dense
              type="password"
              label="Nueva contraseña *"
              placeholder="Mínimo 8 caracteres"
              lazy-rules
              :rules="[val => (val && val.length >= 8) || 'Mínimo 8 caracteres']"
            />

            <q-input
              v-model="confirmarNuevaPassword"
              outlined dense
              type="password"
              label="Confirmar nueva contraseña *"
              placeholder="Repita la nueva contraseña"
              lazy-rules
              :rules="[val => val === nuevaPassword || 'Las contraseñas no coinciden']"
            />

            <q-card-actions align="right" class="q-pt-md">
              <q-btn flat label="Cancelar" color="grey-7" v-close-popup no-caps />
              <q-btn
                type="submit"
                color="amber-9"
                icon="check"
                label="Restablecer Credenciales"
                unelevated
                no-caps
                :loading="guardando"
                :disable="guardando"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore, ROLES } from '../stores/authStore'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const filtroBusqueda = ref('')
const filtroRol = ref('Todos los roles')
const filtroEstado = ref('Todos los estados')

const modalCrearVisible = ref(false)
const modalEditarVisible = ref(false)
const modalRestablecerVisible = ref(false)
const guardando = ref(false)
const usuarioSeleccionado = ref(null)

const nuevaPassword = ref('')
const confirmarNuevaPassword = ref('')

const rolesOpciones = [
  { label: 'SUPERADMIN (Control global)', value: ROLES.SUPERADMIN },
  { label: 'ADMINISTRADOR (Gestión operativa y flota)', value: ROLES.ADMINISTRADOR },
  { label: 'OFICINA (Venta y atención de tiquetes)', value: ROLES.OFICINA }
]

const formCrear = reactive({
  nombre: '',
  tipoDoc: 'CC',
  documento: '',
  correo: '',
  username: '',
  password: '',
  confirmarPassword: '',
  rol: ROLES.OFICINA,
  telefono: ''
})

const formEditar = reactive({
  id: '',
  nombre: '',
  tipoDoc: 'CC',
  documento: '',
  correo: '',
  rol: '',
  telefono: ''
})

onMounted(async () => {
  await authStore.inicializar()

  // Validación estricta de seguridad: solo SUPERADMIN
  if (!authStore.esSuperAdmin()) {
    $q.notify({
      type: 'negative',
      message: 'Acceso restringido: este módulo solo puede ser utilizado por el SUPERADMIN.',
      position: 'top'
    })
    router.replace('/dashboard')
  }
})

// Funciones para estadísticas y valores derivados (sin computed)
function obtenerTotalUsuarios() {
  return authStore.usuarios.length
}

function obtenerUsuariosActivos() {
  return authStore.usuarios.filter(u => u.activo !== false).length
}

function obtenerConteoRol(rol) {
  return authStore.usuarios.filter(u => u.rol === rol).length
}

function obtenerUsuariosFiltrados() {
  let list = [...authStore.usuarios]

  if (filtroBusqueda.value) {
    const q = filtroBusqueda.value.toLowerCase().trim()
    list = list.filter(u =>
      (u.nombre && u.nombre.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.correo && u.correo.toLowerCase().includes(q)) ||
      (u.documento && u.documento.includes(q))
    )
  }

  if (filtroRol.value && filtroRol.value !== 'Todos los roles') {
    list = list.filter(u => u.rol === filtroRol.value)
  }

  if (filtroEstado.value && filtroEstado.value !== 'Todos los estados') {
    if (filtroEstado.value === 'Activos') {
      list = list.filter(u => u.activo !== false)
    } else if (filtroEstado.value === 'Bloqueados') {
      list = list.filter(u => u.activo === false)
    }
  }

  return list
}

function obtenerColorAvatar(rol) {
  if (rol === ROLES.SUPERADMIN) return 'purple-9'
  if (rol === ROLES.ADMINISTRADOR) return 'primary'
  return 'teal-8'
}

function obtenerColorBadgeRol(rol) {
  if (rol === ROLES.SUPERADMIN) return 'purple-9'
  if (rol === ROLES.ADMINISTRADOR) return 'blue-2'
  return 'green-2'
}

function obtenerIconoRol(rol) {
  if (rol === ROLES.SUPERADMIN) return 'security'
  if (rol === ROLES.ADMINISTRADOR) return 'admin_panel_settings'
  return 'point_of_sale'
}

function obtenerIniciales(nombre) {
  if (!nombre) return 'US'
  const parts = nombre.trim().split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return nombre.slice(0, 2).toUpperCase()
}

function abrirModalCrear() {
  formCrear.nombre = ''
  formCrear.tipoDoc = 'CC'
  formCrear.documento = ''
  formCrear.correo = ''
  formCrear.username = ''
  formCrear.password = ''
  formCrear.confirmarPassword = ''
  formCrear.rol = ROLES.OFICINA
  formCrear.telefono = ''
  modalCrearVisible.value = true
}

async function guardarNuevoUsuario() {
  guardando.value = true
  try {
    await authStore.crearUsuario({
      nombre: formCrear.nombre,
      tipoDoc: formCrear.tipoDoc,
      documento: formCrear.documento,
      correo: formCrear.correo,
      username: formCrear.username,
      password: formCrear.password,
      rol: formCrear.rol,
      telefono: formCrear.telefono
    })

    modalCrearVisible.value = false
    $q.notify({
      type: 'positive',
      icon: 'verified',
      message: `Usuario @${formCrear.username} creado exitosamente con rol ${formCrear.rol}.`,
      position: 'top'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Error al crear el usuario',
      position: 'top'
    })
  } finally {
    guardando.value = false
  }
}

function abrirModalEditar(u) {
  usuarioSeleccionado.value = u
  formEditar.id = u.id
  formEditar.nombre = u.nombre
  formEditar.tipoDoc = u.tipoDoc || 'CC'
  formEditar.documento = u.documento
  formEditar.correo = u.correo
  formEditar.rol = u.rol
  formEditar.telefono = u.telefono || ''
  modalEditarVisible.value = true
}

async function guardarEdicionUsuario() {
  guardando.value = true
  try {
    authStore.actualizarUsuario(formEditar.id, {
      nombre: formEditar.nombre,
      tipoDoc: formEditar.tipoDoc,
      documento: formEditar.documento,
      correo: formEditar.correo,
      rol: formEditar.rol,
      telefono: formEditar.telefono
    })

    modalEditarVisible.value = false
    $q.notify({
      type: 'positive',
      message: 'Información y rol de usuario actualizados correctamente.',
      position: 'top'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Error al actualizar usuario',
      position: 'top'
    })
  } finally {
    guardando.value = false
  }
}

function abrirModalRestablecer(u) {
  usuarioSeleccionado.value = u
  nuevaPassword.value = ''
  confirmarNuevaPassword.value = ''
  modalRestablecerVisible.value = true
}

async function guardarNuevaPassword() {
  if (nuevaPassword.value !== confirmarNuevaPassword.value) {
    $q.notify({ type: 'warning', message: 'Las contraseñas no coinciden.', position: 'top' })
    return
  }

  guardando.value = true
  try {
    await authStore.restablecerPassword(usuarioSeleccionado.value.id, nuevaPassword.value)
    modalRestablecerVisible.value = false
    $q.notify({
      type: 'positive',
      icon: 'lock',
      message: `Contraseña restablecida de manera segura para @${usuarioSeleccionado.value.username}.`,
      position: 'top'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Error al restablecer contraseña',
      position: 'top'
    })
  } finally {
    guardando.value = false
  }
}

function toggleEstado(u) {
  const accion = u.activo !== false ? 'bloquear' : 'activar'
  $q.dialog({
    title: `Confirmar ${accion}`,
    message: `¿Está seguro de que desea ${accion} la cuenta de @${u.username}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    try {
      authStore.cambiarEstadoUsuario(u.id, u.activo === false)
      $q.notify({
        type: 'info',
        message: `Cuenta de @${u.username} ${u.activo ? 'activada' : 'bloqueada'}.`,
        position: 'top'
      })
    } catch (err) {
      $q.notify({ type: 'negative', message: err.message, position: 'top' })
    }
  })
}

const columnas = [
  { name: 'nombre', label: 'Usuario / Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'documento', label: 'Documento', field: 'documento', align: 'left' },
  { name: 'correo', label: 'Correo Electrónico', field: 'correo', align: 'left' },
  { name: 'rol', label: 'Rol Asignado', field: 'rol', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones (SUPERADMIN)', align: 'right' }
]
</script>

<style scoped>
.usuarios-table :deep(th) {
  font-weight: 700;
  color: var(--vb-text-primary);
}
</style>
