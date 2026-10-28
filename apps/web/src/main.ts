import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { store } from './lib/store.svelte'

// Aplica el tema guardado antes de montar para evitar el flash de tema en el login
const savedTheme = localStorage.getItem('dash_theme_v1')
document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark'

// Inicializa el store (carga datos según modo local/API) y monta la app
async function bootstrap() {
  await store.init()
  mount(App, { target: document.getElementById('app')! })
}
bootstrap()

export { store }
