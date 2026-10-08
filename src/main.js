import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import quasarLang from 'quasar/lang/es'

// Material Icons de Quasar (sin emojis)
import '@quasar/extras/material-icons/material-icons.css'

// Estilos Quasar y Tema Ergonómico
import 'quasar/dist/quasar.css'
import './styles/theme.css'

// Pinia y pinia-plugin-persistedstate
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import router from './router'
import App from './App.vue'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Quasar, {
  config: {
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

app.mount('#app')
