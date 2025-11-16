import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import PouchDB from 'pouchdb-browser'
import findPlugin from 'pouchdb-find'
const app = createApp(App)

app.use(createPinia())
PouchDB.plugin(findPlugin)
app.mount('#app')

