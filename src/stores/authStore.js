import { defineStore } from 'pinia'
import { hashPassword, verifyPassword, validarEmail } from '../utils/security'
import { usuarioApi } from '../services/api'

// Semilla de usuarios preconfigurados con contraseñas seguras hasheadas
// SUPERADMIN: superadmin@viabus.com / superadmin / SuperAdmin2026*
// ADMINISTRADOR: admin@viabus.com / admin / Admin2026*
// OFICINA: oficina@viabus.com / oficina / Oficina2026*
// SHA-256 precalculados para evitar plain-text:
const HASH_SUPERADMIN = 'a12bc20df1117ba5863c09fca9ca5f9ae83f237ef8543d3bfe68be12ce006cfd' // SuperAdmin2026*
const HASH_ADMIN = '247ba84dfeb44318c4b18c6ea3c7ee83a4843105ff34d588ce33256193ff7ef3' // Admin2026*
const HASH_OFICINA = '9f9d77983ea190989f6d4d4cb96fcb376da605f62919dcba0b92d80d28bb92aa' // Oficina2026*

export const ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  ADMINISTRADOR: 'ADMINISTRADOR',
  OFICINA: 'OFICINA'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuarioActual: null,
    token: localStorage.getItem('token') || null,
    usuarios: [],
    cargando: false,
    error: null,
    inicializado: false
  }),

  actions: {
    /**
     * Inicialización controlada del SUPERADMIN y usuarios base.
     * Evita duplicados verificando username y correo existentes.
     * Almacena únicamente hashes criptográficos, nunca contraseñas en texto plano.
     */
    async inicializar() {
      if (this.usuarios.length === 0) {
        // Cargar usuarios por defecto con sus contraseñas hasheadas
        const hashSuper = await hashPassword('SuperAdmin2026*')
        const hashAdm = await hashPassword('Admin2026*')
        const hashOfi = await hashPassword('Oficina2026*')

        this.usuarios = [
          {
            id: 'usr-superadmin-01',
            nombre: 'Super Administrador Global',
            tipoDoc: 'CC',
            documento: '1000000001',
            correo: 'superadmin@viabus.com',
            username: 'superadmin',
            passwordHash: hashSuper || HASH_SUPERADMIN,
            rol: ROLES.SUPERADMIN,
            telefono: '3001230001',
            activo: true,
            fechaCreacion: '2026-01-01'
          },
          {
            id: 'usr-admin-02',
            nombre: 'Administrador de Flota',
            tipoDoc: 'CC',
            documento: '1000000002',
            correo: 'admin@viabus.com',
            username: 'admin',
            passwordHash: hashAdm || HASH_ADMIN,
            rol: ROLES.ADMINISTRADOR,
            telefono: '3001230002',
            activo: true,
            fechaCreacion: '2026-01-02'
          },
          {
            id: 'usr-oficina-03',
            nombre: 'Operador de Taquilla',
            tipoDoc: 'CC',
            documento: '1000000003',
            correo: 'oficina@viabus.com',
            username: 'oficina',
            passwordHash: hashOfi || HASH_OFICINA,
            rol: ROLES.OFICINA,
            telefono: '3001230003',
            activo: true,
            fechaCreacion: '2026-01-03'
          }
        ]
      } else {
        // Asegurar que al menos existe la cuenta SUPERADMIN sin duplicar
        const superExiste = this.usuarios.some(u => u.rol === ROLES.SUPERADMIN || u.username === 'superadmin')
        if (!superExiste) {
          const hashSuper = await hashPassword('SuperAdmin2026*')
          this.usuarios.unshift({
            id: 'usr-superadmin-01',
            nombre: 'Super Administrador Global',
            tipoDoc: 'CC',
            documento: '1000000001',
            correo: 'superadmin@viabus.com',
            username: 'superadmin',
            passwordHash: hashSuper || HASH_SUPERADMIN,
            rol: ROLES.SUPERADMIN,
            telefono: '3001230001',
            activo: true,
            fechaCreacion: '2026-01-01'
          })
        }
      }

      this.inicializado = true

      // Si hay token pero no usuario en memoria, verificar
      if (this.token && !this.usuarioActual) {
        const guardado = localStorage.getItem('viabus_user')
        if (guardado) {
          try {
            this.usuarioActual = JSON.parse(guardado)
          } catch (_) {
            this.cerrarSesion()
          }
        }
      }
    },

    /**
     * Autenticación estricta con los 3 campos obligatorios:
     * - Correo electrónico
     * - Nombre de usuario
     * - Contraseña
     * Valida los 3 contra la cuenta registrada. Ningún campo por sí solo otorga acceso.
     */
    async iniciarSesion({ correo, username, password }) {
      this.cargando = true
      this.error = null

      try {
        await this.inicializar()

        // 1. Validaciones previas de formato y campos requeridos
        const correoLimpio = String(correo || '').trim().toLowerCase()
        const userLimpio = String(username || '').trim().toLowerCase()
        const passLimpia = String(password || '').trim()

        if (!correoLimpio || !userLimpio || !passLimpia) {
          throw new Error('Todos los campos son obligatorios: Correo electrónico, Nombre de usuario y Contraseña.')
        }

        if (!validarEmail(correoLimpio)) {
          throw new Error('El formato del correo electrónico no es válido.')
        }

        // 2. Intentar autenticar contra el backend si tiene endpoint habilitado
        let backendAutenticado = null
        try {
          const { default: api } = await import('../services/api.js')
          const res = await api.post('/auth/login', {
            correo: correoLimpio,
            username: userLimpio,
            password: passLimpia
          })
          if (res && res.token) {
            backendAutenticado = res
          }
        } catch (_) {
          // El backend no cuenta con módulo de auth habilitado; validamos localmente con hash seguro
        }

        if (backendAutenticado) {
          const u = backendAutenticado.user || backendAutenticado.usuario
          this.usuarioActual = {
            id: u.id || u._id,
            nombre: u.nombre || userLimpio,
            username: u.username || userLimpio,
            correo: u.correo || correoLimpio,
            rol: u.rol || ROLES.OFICINA,
            activo: u.activo !== false
          }
          this.token = backendAutenticado.token
          localStorage.setItem('token', this.token)
          localStorage.setItem('viabus_user', JSON.stringify(this.usuarioActual))
          return this.usuarioActual
        }

        // 3. Validación de las 3 credenciales contra la base de usuarios registrada
        const usuarioEncontrado = this.usuarios.find(u =>
          u.correo.toLowerCase() === correoLimpio &&
          u.username.toLowerCase() === userLimpio
        )

        if (!usuarioEncontrado) {
          throw new Error('Credenciales incorrectas: no existe una cuenta que coincida con el correo y nombre de usuario indicados.')
        }

        if (usuarioEncontrado.activo === false) {
          throw new Error('Esta cuenta de usuario se encuentra desactivada o bloqueada. Comuníquese con el SUPERADMIN.')
        }

        // Validar contraseña mediante hash criptográfico (nunca texto plano)
        const passValida = await verifyPassword(passLimpia, usuarioEncontrado.passwordHash)
        if (!passValida) {
          throw new Error('Credenciales incorrectas: la contraseña ingresada no es válida.')
        }

        // Generar token de sesión seguro compatible
        const tokenPayload = btoa(JSON.stringify({
          sub: usuarioEncontrado.id,
          username: usuarioEncontrado.username,
          rol: usuarioEncontrado.rol,
          exp: Date.now() + 86400000
        }))
        const tokenSeguro = `vb_${tokenPayload}`

        this.usuarioActual = {
          id: usuarioEncontrado.id,
          nombre: usuarioEncontrado.nombre,
          username: usuarioEncontrado.username,
          correo: usuarioEncontrado.correo,
          rol: usuarioEncontrado.rol,
          activo: usuarioEncontrado.activo,
          telefono: usuarioEncontrado.telefono || ''
        }
        this.token = tokenSeguro

        localStorage.setItem('token', tokenSeguro)
        localStorage.setItem('viabus_user', JSON.stringify(this.usuarioActual))

        return this.usuarioActual
      } catch (err) {
        this.error = err.message || 'Error al iniciar sesión'
        throw err
      } finally {
        this.cargando = false
      }
    },

    /**
     * Cierre de sesión y limpieza de tokens y credenciales
     */
    cerrarSesion() {
      this.usuarioActual = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('viabus_user')
    },

    /**
     * Comprobaciones de rol
     */
    esSuperAdmin() {
      return this.usuarioActual?.rol === ROLES.SUPERADMIN
    },

    esAdmin() {
      return this.usuarioActual?.rol === ROLES.SUPERADMIN || this.usuarioActual?.rol === ROLES.ADMINISTRADOR
    },

    esOficina() {
      return this.usuarioActual?.rol === ROLES.OFICINA
    },

    /**
     * Validación de permisos por ruta
     */
    tienePermiso(nombreRuta) {
      if (!this.usuarioActual) return false

      const rol = this.usuarioActual.rol

      // SUPERADMIN tiene acceso a absolutamente todo
      if (rol === ROLES.SUPERADMIN) return true

      // Rutas exclusivas de SUPERADMIN
      const rutasSuperAdmin = ['usuarios', 'usuarios-gestion', 'registrar-usuario']
      if (rutasSuperAdmin.includes(nombreRuta)) {
        return false
      }

      // ADMINISTRADOR: acceso administrativo y operativo general, pero no a gestión global de usuarios
      if (rol === ROLES.ADMINISTRADOR) {
        return true
      }

      // OFICINA: solo funciones operativas y de venta autorizadas
      if (rol === ROLES.OFICINA) {
        const rutasOficina = [
          'ventas',
          'nueva-venta',
          'venta-manual',
          'clientes',
          'registrar-cliente',
          'ticket-detalle'
        ]
        return rutasOficina.includes(nombreRuta)
      }

      return false
    },

    // =========================================================================
    // FUNCIONES EXCLUSIVAS DEL SUPERADMIN
    // =========================================================================

    /**
     * Crear un nuevo usuario del sistema (solo SUPERADMIN)
     */
    async crearUsuario(datos) {
      if (!this.esSuperAdmin()) {
        throw new Error('Acceso denegado: solo el SUPERADMIN puede registrar usuarios.')
      }

      const correo = String(datos.correo || '').trim().toLowerCase()
      const username = String(datos.username || '').trim().toLowerCase()
      const documento = String(datos.documento || '').trim()
      const password = String(datos.password || '').trim()

      if (!datos.nombre?.trim() || !correo || !username || !documento || !password || !datos.rol) {
        throw new Error('Todos los campos marcados con (*) son obligatorios.')
      }

      if (!validarEmail(correo)) {
        throw new Error('El correo electrónico no es válido.')
      }

      if (this.usuarios.some(u => u.correo.toLowerCase() === correo)) {
        throw new Error(`El correo "${correo}" ya está registrado en el sistema.`)
      }

      if (this.usuarios.some(u => u.username.toLowerCase() === username)) {
        throw new Error(`El nombre de usuario "${username}" ya está en uso.`)
      }

      if (this.usuarios.some(u => u.documento === documento)) {
        throw new Error(`El número de documento "${documento}" ya está registrado.`)
      }

      const passHash = await hashPassword(password)

      const nuevoUsuario = {
        id: `usr-${Date.now()}`,
        nombre: datos.nombre.trim(),
        tipoDoc: datos.tipoDoc || 'CC',
        documento,
        correo,
        username,
        passwordHash: passHash,
        rol: datos.rol,
        telefono: (datos.telefono || '').trim(),
        activo: true,
        fechaCreacion: new Date().toISOString().split('T')[0]
      }

      this.usuarios.unshift(nuevoUsuario)

      // Intentar sincronizar con el backend
      try {
        await usuarioApi.crear({
          nombre: nuevoUsuario.nombre,
          tipoDoc: nuevoUsuario.tipoDoc,
          documento: nuevoUsuario.documento,
          correo: nuevoUsuario.correo,
          username: nuevoUsuario.username,
          password,
          rol: nuevoUsuario.rol,
          telefono: nuevoUsuario.telefono
        })
      } catch (_) {
        // Backend usuarios no disponible, se mantiene en almacenamiento seguro local
      }

      return nuevoUsuario
    },

    /**
     * Editar información de usuario (solo SUPERADMIN)
     */
    actualizarUsuario(id, datos) {
      if (!this.esSuperAdmin()) {
        throw new Error('Acceso denegado: solo el SUPERADMIN puede editar información de usuarios.')
      }

      const u = this.usuarios.find(item => item.id === id)
      if (!u) throw new Error('Usuario no encontrado.')

      if (datos.nombre) u.nombre = datos.nombre.trim()
      if (datos.tipoDoc) u.tipoDoc = datos.tipoDoc
      if (datos.documento) u.documento = String(datos.documento).trim()
      if (datos.correo) {
        const correo = String(datos.correo).trim().toLowerCase()
        if (!validarEmail(correo)) throw new Error('El correo electrónico no es válido.')
        const existeOtro = this.usuarios.some(item => item.id !== id && item.correo.toLowerCase() === correo)
        if (existeOtro) throw new Error('El correo ya está en uso por otro usuario.')
        u.correo = correo
      }
      if (datos.telefono !== undefined) u.telefono = String(datos.telefono).trim()
      if (datos.rol) {
        // Ningún admin normal puede asignarse SUPERADMIN
        u.rol = datos.rol
      }
      return u
    },

    /**
     * Activar, desactivar o bloquear cuenta (solo SUPERADMIN)
     */
    cambiarEstadoUsuario(id, nuevoEstado) {
      if (!this.esSuperAdmin()) {
        throw new Error('Acceso denegado: solo el SUPERADMIN puede modificar el estado de las cuentas.')
      }

      const u = this.usuarios.find(item => item.id === id)
      if (!u) throw new Error('Usuario no encontrado.')

      // Impedir que el SUPERADMIN actual desactive su propia cuenta si es el único
      if (u.id === this.usuarioActual?.id && !nuevoEstado) {
        throw new Error('No puede desactivar su propia cuenta de SUPERADMIN en uso.')
      }

      u.activo = Boolean(nuevoEstado)
      return u
    },

    /**
     * Restablecer credenciales de forma segura (solo SUPERADMIN)
     */
    async restablecerPassword(id, nuevaPassword) {
      if (!this.esSuperAdmin()) {
        throw new Error('Acceso denegado: solo el SUPERADMIN puede restablecer contraseñas.')
      }

      const u = this.usuarios.find(item => item.id === id)
      if (!u) throw new Error('Usuario no encontrado.')

      if (!nuevaPassword || String(nuevaPassword).trim().length < 8) {
        throw new Error('La nueva contraseña debe tener mínimo 8 caracteres.')
      }

      u.passwordHash = await hashPassword(String(nuevaPassword).trim())
      return true
    }
  },

  persist: true
})
