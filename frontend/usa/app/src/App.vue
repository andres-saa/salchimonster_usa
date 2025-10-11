<script setup>
import { onMounted , ref, onBeforeMount, onBeforeUnmount} from 'vue'

// UI
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog' // usamos el diálogo para la cuenta regresiva

// Componentes
import VistaProducto from './components/Dialogs/VistaProducto.vue'
import siteDialog from './components/Dialogs/siteDialog.vue'
import barra from './views/barra.vue'
import { useRoute } from 'vue-router';
// Stores y servicios
import { useReportesStore } from './store/ventas'
import { usecartStore } from './store/shoping_cart'
import { useSitesStore } from './store/site'
import { fetchService } from './service/utils/fetchService'
import { URI } from './service/conection'
import Button from 'primevue/button'

// ─────────────────────────────
// State
// ─────────────────────────────
const cart = usecartStore()
const siteStore = useSitesStore()
const reportes = useReportesStore()
const route = useRoute()

// ─────────────────────────────
// Lifecycle
// ─────────────────────────────
onMounted(loadInitialData)

// ─────────────────────────────
// Functions
// ─────────────────────────────
async function loadInitialData () {
  try {
    reportes.loading.visible = true

    const site_id = siteStore.location?.site?.site_id
    const pe_id = siteStore.location?.site?.pe_site_id || 1

    // Evita llamadas si no hay site_id aún
    const [status, data] = await Promise.all([
      site_id ? fetchService.get(`${URI}/site/${site_id}/status`) : Promise.resolve(null),
      fetchService.get(`${URI}/tiendas/${site_id}/products`)
    ])

    if (status) siteStore.status = status
    if (data?.categorias) cart.menu = data.categorias
  } catch (err) {
    console.error('Error cargando datos iniciales:', err)
  } finally {
    reportes.loading.visible = false
  }
}

// ─────────────────────────────
// Sticky on scroll (ya existente)
// ─────────────────────────────
const lastScrollY = ref(0)
const sticky = ref(false)
const handleScroll = () => {
  const currentScroll = window.scrollY
  if (currentScroll > lastScrollY.value) {
    sticky.value = true
  } else if (currentScroll < lastScrollY.value) {
    sticky.value = false
  }
  lastScrollY.value = currentScroll
}

onMounted(() => {
  lastScrollY.value = window.scrollY
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

// ─────────────────────────────
// Idiomas (ya existente)
// ─────────────────────────────
const languages = [
  { name: 'es', label: 'Español', flag: 'https://flagcdn.com/w20/co.png' },
  { name: 'en', label: 'English',  flag: 'https://flagcdn.com/w20/us.png' }
]

// ─────────────────────────────
// WebSocket a tiendas-usa + cuenta regresiva
// ─────────────────────────────
const WS_URL = 'wss://sockets-service.salchimonster.com/ws/tiendas-usa'
const wsRef = ref(null)
const reconnectAttempts = ref(0)
let reconnectTimeoutId = null

const showReloadDialog = ref(false)
const countdown = ref(3)
const isStrongReload = ref(false)
let countdownTimerId = null

async function clearAppData () {
  // Reset de stores si exponen $reset
  try { cart.$reset?.() } catch {}
  try { siteStore.$reset?.() } catch {}
  try { reportes.$reset?.() } catch {}
  // Limpieza de storage
  try { localStorage.clear() } catch {}
  try { sessionStorage.clear() } catch {}
  // Cache API (PWA)
  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map(k => caches.delete(k)))
    }
  } catch {}
}

function startReloadCountdown (strong = false) {
  if (showReloadDialog.value) return
  isStrongReload.value = strong
  showReloadDialog.value = true
  countdown.value = 3

  clearInterval(countdownTimerId)
  countdownTimerId = setInterval(async () => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(countdownTimerId)
      if (isStrongReload.value) {
        await clearAppData()
      }
      window.location.reload()
    }
  }, 1000)
}

function connectWS () {
  if (wsRef.value && (wsRef.value.readyState === WebSocket.OPEN || wsRef.value.readyState === WebSocket.CONNECTING)) {
    return
  }
  const ws = new WebSocket(WS_URL)
  wsRef.value = ws

  ws.addEventListener('open', () => {
    reconnectAttempts.value = 0
  })

  ws.addEventListener('message', async (event) => {
    const msg = typeof event.data === 'string' ? event.data.trim().toLowerCase() : ''
    if (msg === 'actualizar') {
      startReloadCountdown(false)
    } else if (msg === 'actualizar-fuerte') {
      startReloadCountdown(true)
    }
  })

  ws.addEventListener('close', () => {
    const attempt = Math.min(6, reconnectAttempts.value + 1)
    reconnectAttempts.value = attempt
    const delay = Math.min(30000, 1000 * (2 ** attempt)) // hasta 30s
    clearTimeout(reconnectTimeoutId)
    reconnectTimeoutId = setTimeout(connectWS, delay)
  })

  ws.addEventListener('error', () => {
    try { ws.close() } catch {}
  })
}

onMounted(() => {
  connectWS()
})

onBeforeUnmount(() => {
  try {
    clearTimeout(reconnectTimeoutId)
    clearInterval(countdownTimerId)
    wsRef.value?.close(1000, 'component unmounted')
  } catch {}
})
</script>

<template>
  <div>
    <!-- Overlay de carga -->
    <div
      v-if="reportes.loading.visible"
      class="overlay"
      aria-busy="true"
      aria-live="polite"
    >
      <div class="spinner-wrap">
        <div class="spinner"></div>

        <div class="loading-card">
          <img
            class="loading-logo"
            src="https://backend.salchimonster.com/read-photo-product/xai0dVnL"
            alt="Cargando"
          />
          <h5 class="loading-text">Cargando...</h5>
        </div>
      </div>
    </div>

    <Toast />

    <!-- Diálogo de cuenta regresiva (WS) -->
    <Dialog
      v-model:visible="showReloadDialog"
      modal
      :closable="false"
      :draggable="false"
      :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
      style="width: 420px; max-width: 95vw; z-index: 100001"
      header="Actualización disponible"
    >
      <div class="reload-dialog">
        <p class="reload-text">
          Esta página se recargará automáticamente en
          <b style="padding-left:.25rem">{{ countdown }}</b>
        </p>
        <div class="countdown-bubble">{{ countdown }}</div>
        <small v-if="isStrongReload" class="hint">
          Limpieza de datos y actualización…
        </small>
      </div>
    </Dialog>

    <!-- Rutas -->
    <router-view />

    <!-- Diálogos y barra -->
    <VistaProducto />
    <siteDialog />
    <barra />
    <!-- Si lo necesitas luego:
    <SiteDialogSonando />
    -->
  </div>
</template>

<style scoped>
/* Variables opcionales */
:root {
  --overlay-bg: #00000020;
  --overlay-z: 99999999;
}

/* Overlay */
.overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index:99999;
  transition: opacity 0.3s ease;
  pointer-events: auto;
}

/* Contenedor central */
.spinner-wrap {
  position: relative;
  display: grid;
  place-items: center;
}

/* Disco giratorio detrás */
.spinner {
  width: 150px;
  height: 150px;
  background-color: var(--p-primary-color);
  padding: 3rem;
  position: absolute;
  animation: spin 1s linear infinite;
  z-index: -1;
}

/* Tarjeta blanca con contenido */
.loading-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  background: #fff;
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
}

/* Logo */
.loading-logo {
  width: min(20vw, 100px);
  height: auto;
  display: block;
}

/* Texto */
.loading-text {
  color: #111827;
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.2px;
}

/* Animación */
@keyframes spin { to { transform: rotate(360deg); } }

/* Diálogo de recarga */
.reload-dialog{
  display: grid;
  gap: .75rem;
  place-items: center;
  text-align: center;
  padding: .5rem 0;
}
.reload-text{
  font-size: 1rem;
  margin: 0;
}
.countdown-bubble{
  width: 90px;
  height: 90px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 2.25rem;
  font-weight: 900;
  border: 3px solid var(--p-primary-color, #6d28d9);
  animation: pop .8s ease-in-out infinite alternate;
}
.hint{ opacity: .8; }
@keyframes pop { from { transform: scale(1); } to { transform: scale(1.06); } }
</style>
