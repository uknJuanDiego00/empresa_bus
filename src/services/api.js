import axios from 'axios'

// Configuración base de la instancia de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para peticiones (ej. tokens o logs)
api.interceptors.request.use(
  (config) => {
    // Si manejas token de autenticación:
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

// Endpoints listos para conectar con el backend y MongoDB Atlas
export const clienteApi = {
  obtenerTodos: () => api.get('/clientes'),
  obtenerPorId: (id) => api.get(`/clientes/${id}`),
  crear: (data) => api.post('/clientes', data),
  actualizar: (id, data) => api.put(`/clientes/${id}`, data),
  eliminar: (id) => api.delete(`/clientes/${id}`)
}

export const vehiculoApi = {
  obtenerTodos: () => api.get('/vehiculos'),
  obtenerPorId: (id) => api.get(`/vehiculos/${id}`),
  crear: (data) => api.post('/vehiculos', data),
  actualizar: (id, data) => api.put(`/vehiculos/${id}`, data),
  eliminar: (id) => api.delete(`/vehiculos/${id}`)
}

export const viajeApi = {
  obtenerTodos: () => api.get('/viajes'),
  obtenerPorId: (id) => api.get(`/viajes/${id}`),
  crear: (data) => api.post('/viajes', data),
  actualizar: (id, data) => api.put(`/viajes/${id}`, data),
  eliminar: (id) => api.delete(`/viajes/${id}`)
}

export const reservaApi = {
  obtenerTodas: () => api.get('/reservas'),
  crear: (data) => api.post('/reservas', data)
}

export default api
