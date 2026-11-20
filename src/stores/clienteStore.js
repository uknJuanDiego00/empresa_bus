import { defineStore } from 'pinia'

const CLIENTES_INICIALES = [
  {
    id: 'cli-001',
    tipoDoc: 'CC',
    documento: '1000000001',
    nombre: 'Carlos Alberto Pérez Gómez',
    telefono: '3101234567',
    correo: 'carlos.perez@email.com',
    direccion: 'Carrera 15 # 45-20, Bogotá'
  },
  {
    id: 'cli-002',
    tipoDoc: 'CC',
    documento: '1000000002',
    nombre: 'María Fernanda Gómez Ruiz',
    telefono: '3112345678',
    correo: 'maria.gomez@email.com',
    direccion: 'Calle 50 # 25-10, Medellín'
  },
  {
    id: 'cli-003',
    tipoDoc: 'CC',
    documento: '1000000003',
    nombre: 'Juan David Rodríguez Toro',
    telefono: '3123456789',
    correo: 'juan.rodriguez@email.com',
    direccion: 'Avenida 6 # 18-32, Cali'
  },
  {
    id: 'cli-004',
    tipoDoc: 'CC',
    documento: '1000000004',
    nombre: 'Laura Cristina Morales Peña',
    telefono: '3134567890',
    correo: 'laura.morales@email.com',
    direccion: 'Carrera 27 # 33-40, Bucaramanga'
  }
]

export const useClienteStore = defineStore('cliente', {
  state: () => ({
    clientes: [],
    cargando: false,
    error: null
  }),

  actions: {
    async cargarClientes() {
      this.cargando = true
      this.error = null
      try {
        if (this.clientes.length === 0) {
          this.clientes = [...CLIENTES_INICIALES]
        }
      } finally {
        this.cargando = false
      }
    },

    async registrarCliente(datos) {
      this.cargando = true
      this.error = null
      try {
        const nuevo = {
          id: `cli-${Date.now()}`,
          tipoDoc: datos.tipoDoc || 'CC',
          documento: String(datos.documento || '').trim(),
          nombre: String(datos.nombre || '').trim(),
          telefono: String(datos.telefono || '').trim(),
          correo: String(datos.correo || '').trim(),
          direccion: String(datos.direccion || '').trim()
        }
        this.clientes.unshift(nuevo)
        return nuevo
      } catch (err) {
        this.error = err.message || 'Error al registrar cliente'
        throw err
      } finally {
        this.cargando = false
      }
    },

    documentoExiste(doc, excluirId = null) {
      if (!doc) return false
      return this.clientes.some(
        c => c.documento && c.documento.toLowerCase() === String(doc).trim().toLowerCase() && c.id !== excluirId
      )
    },

    buscarClientePorDocumento(doc) {
      if (!doc) return null
      return this.clientes.find(
        c => c.documento && c.documento.toLowerCase() === String(doc).trim().toLowerCase()
      ) || null
    },

    obtenerCliente(id) {
      if (!id) return null
      return this.clientes.find(c => String(c.id) === String(id) || String(c._id) === String(id)) || null
    }
  },

  persist: true
})
