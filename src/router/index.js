import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from '../stores/authStore'
import { Notify } from 'quasar'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Guardia de navegación global para proteger rutas privadas y validar roles
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.inicializado) {
    await authStore.inicializar()
  }

  const esRutaPublica = to.meta?.public === true || to.name === 'login'
  const estaAutenticado = Boolean(authStore.token && authStore.usuarioActual)

  // 1. Si no está autenticado y la ruta es privada, redirigir al login
  if (!estaAutenticado && !esRutaPublica) {
    return next({
      path: '/login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined
    })
  }

  // 2. Si ya está autenticado e intenta ir al login, redirigir según su rol
  if (estaAutenticado && to.path === '/login') {
    if (authStore.esOficina()) {
      return next({ path: '/viajes' })
    }
    return next({ path: '/viajes' })
  }

  // 3. Si la ruta requiere roles específicos, validar autorización estricta
  if (estaAutenticado && to.meta?.roles && Array.isArray(to.meta.roles)) {
    const rolActual = authStore.usuarioActual?.rol
    if (!to.meta.roles.includes(rolActual)) {
      Notify.create({
        type: 'negative',
        icon: 'security',
        message: 'Acceso denegado: no cuenta con autorización para acceder a este módulo.',
        position: 'top'
      })

      // Redirigir al inicio correspondiente
      return next({ path: '/viajes' })
    }
  }

  // 4. Si el operador de oficina entra a la raíz '/', redirigir a viajes
  if (estaAutenticado && authStore.esOficina() && to.path === '/') {
    return next({ path: '/viajes' })
  }

  next()
})

export default router
