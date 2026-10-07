import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

// Aplica el tema guardado antes de montar para evitar el flash de tema en el login
const savedTheme = localStorage.getItem('dash_theme_v1')
document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
