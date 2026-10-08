import axios from 'axios'

// Configuración base de la instancia de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const mensaje = error.response?.data?.message || error.message || 'Error en la petición'
    console.error('Error API Axios:', mensaje)
    return Promise.reject(error)
  }
)

// Endpoints de Clientes
export const clienteApi = {
  obtenerTodos: (params) => api.get('/clientes', { params }),
  obtenerPorId: (id) => api.get(`/clientes/${id}`),
  crear: (data) => api.post('/clientes', data),
  actualizar: (id, data) => api.put(`/clientes/${id}`, data),
  eliminar: (id) => api.delete(`/clientes/${id}`),
  verificarExiste: (doc) => api.get(`/clientes/existe/${doc}`)
}

// Endpoints de Vehículos
export const vehiculoApi = {
  obtenerTodos: () => api.get('/vehiculos'),
  obtenerPorId: (id) => api.get(`/vehiculos/${id}`),
  crear: (data) => api.post('/vehiculos', data),
  actualizar: (id, data) => api.put(`/vehiculos/${id}`, data),
  actualizarConductor: (id, puestoId) => api.put(`/vehiculos/${id}/conductor-puesto`, { puestoId }),
  eliminar: (id) => api.delete(`/vehiculos/${id}`)
}

// Endpoints de Viajes
export const viajeApi = {
  obtenerTodos: (params) => api.get('/viajes', { params }),
  obtenerPorId: (id) => api.get(`/viajes/${id}`),
  crear: (data) => api.post('/viajes', data),
  actualizar: (id, data) => api.put(`/viajes/${id}`, data),
  eliminar: (id) => api.delete(`/viajes/${id}`)
}

// Endpoints de Ventas / Reservas
export const ventaApi = {
  obtenerTodas: (params) => api.get('/ventas', { params }),
  obtenerPorId: (id) => api.get(`/ventas/${id}`),
  crear: (data) => api.post('/ventas', data),
  cancelar: (id) => api.put(`/ventas/${id}/cancelar`)
}

export const reservaApi = ventaApi

export default api
