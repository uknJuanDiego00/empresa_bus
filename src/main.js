import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import quasarLang from 'quasar/lang/es'

// Material Icons de Quasar
import '@quasar/extras/material-icons/material-icons.css'

// Estilos Quasar y tema ergonómico
import 'quasar/dist/quasar.css'
import './styles/theme.css'

// Pinia y persistencia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Router y aplicación
import router from './router'
import App from './App.vue'

// Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Crear aplicación Vue
const app = createApp(App)

// Configuración de Quasar
app.use(Quasar, {
  config: {
    dark: false,
    brand: {
      primary: '#2471A3',
      secondary: '#0E6251',
      accent: '#2980B9',
      dark: '#1A252C',
      positive: '#1E8449',
      negative: '#C0392B',
      info: '#2471A3',
      warning: '#F39C12'
    }
  },
  plugins: {
    Notify,
    Dialog,
    Loading
  },
  lang: quasarLang
})

// Registrar Pinia y Vue Router
app.use(pinia)
app.use(router)

// Montar aplicación
app.mount('#app')
