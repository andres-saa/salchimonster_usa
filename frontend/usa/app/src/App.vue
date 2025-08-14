<script setup>
import { onMounted } from 'vue'

// UI
import Toast from 'primevue/toast'

// Componentes
import VistaProducto from './components/Dialogs/VistaProducto.vue'
import siteDialog from './components/Dialogs/siteDialog.vue'
import barra from './views/barra.vue'

// Stores y servicios
import { useReportesStore } from './store/ventas'
import { usecartStore } from './store/shoping_cart'
import { useSitesStore } from './store/site'
import { fetchService } from './service/utils/fetchService'
import { URI } from './service/conection'

// ─────────────────────────────
// State
// ─────────────────────────────
const cart = usecartStore()
const siteStore = useSitesStore()
const reportes = useReportesStore()

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
      fetchService.get(`${URI}/tiendas/${pe_id}/products`)
    ])

    if (status) siteStore.status = status
    if (data?.categorias) cart.menu = data.categorias
  } catch (err) {
    // Muestra un toast usando el store si ya lo tienes integrado,
    // o deja el console.error por ahora.
    console.error('Error cargando datos iniciales:', err)
  } finally {
    reportes.loading.visible = false
  }
}
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
  z-index: var(--overlay-z);
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
  border-radius: 50%;
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
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
