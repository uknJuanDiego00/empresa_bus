import { defineStore } from 'pinia'
import { clienteApi } from '../services/api'

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
        const res = await clienteApi.obtenerTodos()
        if (res && res.data) {
          this.clientes = res.data.map(c => ({
            id: c.id || c._id,
            _id: c._id,
            tipoDoc: c.tipoDoc,
            documento: c.documento,
            nombre: c.nombre,
            telefono: c.telefono,
            correo: c.correo,
            direccion: c.direccion
          }))
        }
      } catch (err) {
        console.warn('No se pudo conectar a la API de clientes, usando datos locales:', err.message)
      } finally {
        this.cargando = false
      }
    },
    async registrarCliente(datos) {
      this.cargando = true
      this.error = null
      const payload = {
        tipoDoc: datos.tipoDoc,
        documento: datos.documento.trim(),
        nombre: datos.nombre.trim(),
        telefono: datos.telefono.trim(),
        correo: datos.correo.trim(),
        direccion: datos.direccion.trim()
      }

      try {
        const res = await clienteApi.crear(payload)
        const clienteGuardado = res.data || res
        const nuevo = {
          id: clienteGuardado.id || clienteGuardado._id || String(Date.now()),
          _id: clienteGuardado._id,
          tipoDoc: clienteGuardado.tipoDoc,
          documento: clienteGuardado.documento,
          nombre: clienteGuardado.nombre,
          telefono: clienteGuardado.telefono,
          correo: clienteGuardado.correo,
          direccion: clienteGuardado.direccion
        }
        this.clientes.unshift(nuevo)
        return nuevo
      } catch (err) {
        console.warn('API error, guardando en local:', err.message)
        const nuevoLocal = {
          id: String(Date.now()),
          ...payload
        }
        this.clientes.unshift(nuevoLocal)
        return nuevoLocal
      } finally {
        this.cargando = false
      }
    },
    documentoExiste(doc, excluirId = null) {
      if (!doc) return false
      return this.clientes.some(
        c => c.documento && c.documento.toLowerCase() === doc.trim().toLowerCase() && c.id !== excluirId && c._id !== excluirId
      )
    },
    buscarClientePorDocumento(doc) {
      if (!doc) return null
      return this.clientes.find(
        c => c.documento && c.documento.toLowerCase() === doc.trim().toLowerCase()
      ) || null
    },
    obtenerCliente(id) {
      if (!id) return null
      return this.clientes.find(c => String(c.id) === String(id) || String(c._id) === String(id)) || null
    }
  },
  persist: true
})
