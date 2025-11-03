<template>
  <div class="main-container">
    <h1 style="padding: 1rem;">
      {{ user.lang.name === 'es' ? 'Nuestras sedes' : 'Locations' }}
    </h1>

    <div class="container">
      <div
        v-for="sede in filteredSedes"
        :key="sede.site_id"
        class="sede-card"
      >
        <div class="sede-image-container">
          <img
            :src="currentImage(sede)"
            @load="loadHighResImage(sede)"
            @error="onImgError(sede)"
            class="sede-image"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <div class="sede-details">
            <p class="sede-location">
              <span class="sede-icon"><i class="pi pi-map-marker"></i></span>
              {{ cityName(sede.city_id) }}
              <span class="sede-address">{{ sede.site_address }}</span>
            </p>

            <p class="sede-name">SALCHIMONSTER {{ sede.site_name }}</p>

            <!-- Teléfono: link directo a WhatsApp -->
            <a
              v-if="waLink(sede)"
              :href="waLink(sede)"
              target="_blank"
              rel="noopener"
              class="sede-phone"
              :aria-label="`Chatear por WhatsApp con ${sede.site_name}`"
            >
              <span class="sede-icon"><i class="pi pi-whatsapp"></i></span>
              {{ displayPhone(sede.site_phone) }}
            </a>
            <p v-else class="sede-phone">
              <span class="sede-icon"><i class="pi pi-whatsapp"></i></span>
              {{ displayPhone(sede.site_phone) }}
            </p>

            <div class="maps-icon">
              <a :href="sede.maps" target="_blank" rel="noopener noreferrer">
                <img
                  class="maps-image"
                  src="https://th.bing.com/th/id/R.68201495ac2d0c4d1cd3cbf6d25f6755?rik=l%2bilUrRDF30tdw&pid=ImgRaw&r=0"
                  alt="Map icon"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Vacío -->
      <div v-if="filteredSedes.length === 0" class="empty">
        {{ user.lang.name === 'es'
            ? 'No hay sedes en la zona horaria seleccionada.'
            : 'No locations in the selected time zone.' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { URI } from '@/service/conection'
import { useUserStore } from '@/store/user'

const user = useUserStore()

// ------------------ Datos ------------------
const sedes  = ref([])
const cities = ref([])

onMounted(async () => {
  await Promise.all([getSites(), getCities()])
})

async function getSites () {
  try {
    const response = await fetch(`${URI}/sites`)
    if (!response.ok) return
    const data = await response.json()
    sedes.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error fetching sites:', err)
  }
}

async function getCities () {
  try {
    const response = await fetch(`${URI}/cities`)
    if (!response.ok) return
    const data = await response.json()
    cities.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error fetching cities:', err)
  }
}

// ------------------ Mapa de ciudades ------------------
const citiesById = computed(() => {
  const map = new Map()
  for (const c of cities.value || []) map.set(c.city_id, c.city_name)
  return map
})
const cityName = (city_id) => citiesById.value.get(city_id) ?? '—'

// ------------------ Filtro de sedes ------------------
const filteredSedes = computed(() =>
  (sedes.value || []).filter(s =>
    s?.city_id &&
    s?.show_on_web &&
    !s?.comming_soon &&
    s?.time_zone === 'America/New_York' &&
    s?.site_id !== 32
  )
)

// ------------------ Imágenes (progresivo con cache) ------------------
const imgCache = ref({}) // { [site_id]: urlActualMostrada }

const lowResSite  = (site_id) => `${URI}/read-product-image/96/site-${site_id}`
const highResSite = (site_id) => `${URI}/read-product-image/600/site-${site_id}`
const byImgId     = (img_id)  => `${URI}/read-photo-product/${img_id}`

const currentImage = (sede) => {
  const sid = sede.site_id
  if (imgCache.value[sid]) return imgCache.value[sid]
  // Primera pintura: low-res del site
  imgCache.value[sid] = lowResSite(sid)
  return imgCache.value[sid]
}

const loadHighResImage = (sede) => {
  const sid = sede.site_id
  // Si tiene img_id probamos esa como máxima calidad
  if (sede?.img_id) {
    const hi = byImgId(sede.img_id)
    const probe = new Image()
    probe.src = hi
    probe.onload = () => { imgCache.value[sid] = hi }
    probe.onerror = () => {
      // Fallback a 600 del site
      const fallbackHi = highResSite(sid)
      const p2 = new Image()
      p2.src = fallbackHi
      p2.onload = () => { imgCache.value[sid] = fallbackHi }
      // si falla también, queda low-res
    }
    return
  }
  // Sin img_id: subir a 600 del site
  const hi = highResSite(sid)
  const probe = new Image()
  probe.src = hi
  probe.onload = () => { imgCache.value[sid] = hi }
}

const onImgError = (sede) => {
  imgCache.value[sede.site_id] = lowResSite(sede.site_id)
}

// ------------------ Teléfono / WhatsApp ------------------
const displayPhone = (raw = '') => raw?.trim() || '—'

// Normaliza números colombianos a E.164 (57XXXXXXXXXX cuando es móvil 3XXXXXXXXX)
const toE164CO = (raw = '') => {
  let d = String(raw).replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('57')) return d
  if (d.length === 10 && d.startsWith('3')) return '57' + d
  return d
}

const waLink = (sede) => {
  const num = toE164CO(sede?.site_phone || '')
  if (!num) return ''
  const msg = `Hola, quiero más información sobre SALCHIMONSTER ${sede?.site_name ?? ''} en ${cityName(sede?.city_id)}.`
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
}
</script>

<style scoped>
/* Contenedor principal */
.main-container {
  padding: 0;
}

/* Grilla */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 0 auto;
  padding: 1rem;
}

/* Tarjeta */
.sede-card {
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Imagen + detalles */
.sede-image-container {
  position: relative;
  height: min-content;
  box-shadow: 0 0 10px black;
  border-radius: 0.5rem;
}

.sede-image {
  width: 100%;
  height: 30rem;
  object-fit: cover;
  border-radius: 0.5rem;
  transition: opacity 0.5s ease-in-out;
}

/* Detalles superpuestos */
.sede-details {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(to top, black, transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
  border-radius: 0 0 0.5rem 0.5rem;
}

/* Tipografías */
.sede-location,
.sede-phone {
  color: white;
  font-size: 1rem;
}

.sede-location {
  font-weight: bold;
  color: var(--p-primary-color);
}

.sede-address {
  font-weight: normal;
  color: white;
  padding-left: 1rem;
}

.sede-name {
  color: white;
  font-weight: bold;
}

.sede-phone {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  text-decoration: none;
  font-weight: 600;
}

.sede-phone .sede-icon {
  font-weight: bold;
  color: rgb(58, 255, 58);
}

/* Icono de ubicación/maps */
.maps-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  display: flex;
  padding: 1rem;
}

.maps-image {
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
  background-color: rebeccapurple;
}

.empty {
  grid-column: 1 / -1;
  color: #fff;
  text-align: center;
  padding: 2rem 0;
}
</style>
