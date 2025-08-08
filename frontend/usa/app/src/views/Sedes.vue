<template>
  <div class="main-container">

    <h1 style="padding: 1rem;">  {{ user.lang.name === 'es' ? 'Nuestras sedes' : 'Locations' }} </h1>

    <div class="container">

      <div
        v-for="sede in filteredSedes"
        :key="sede.site_id"
        class="sede-card"
      >
        <div class="sede-image-container">
          <img
            :src="currentImage(sede.site_id)"
            @load="loadHighResImage(sede.site_id)"
            @error="onImgError(sede.site_id)"
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
            <p class="sede-phone">
              <span class="sede-icon"><i class="pi pi-whatsapp"></i></span>
              {{ sede.site_phone }}
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

      <!-- Si no hay sedes que cumplan el filtro -->
      <div v-if="filteredSedes.length === 0" class="empty">
        No hay sedes en la zona horaria seleccionada.
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { URI } from '@/service/conection'

const TIME_ZONE_FILTER = 'America/New_York'
import { useUserStore } from '@/store/user'
const sedes = ref([])
const cities = ref([])
const citiesById = computed(() => {
  const map = new Map()
  for (const c of cities.value || []) map.set(c.city_id, c.city_name)
  return map
})

const cityName = (city_id) => citiesById.value.get(city_id) ?? '—'

const user = useUserStore()
// Progressive image loading
const currentImageSrc = ref({})

const lowResImage = (site_id) => `${URI}/read-product-image/96/site-${site_id}`
const highResImage = (site_id) => `${URI}/read-product-image/600/site-${site_id}`

const currentImage = (site_id) =>
  currentImageSrc.value[site_id] || lowResImage(site_id)

const loadHighResImage = (site_id) => {
  // Si ya está en alta, no recargar
  if (currentImageSrc.value[site_id] === highResImage(site_id)) return
  const img = new Image()
  img.src = highResImage(site_id)
  img.onload = () => {
    currentImageSrc.value[site_id] = highResImage(site_id)
  }
}

const onImgError = (site_id) => {
  // Fallback al low-res si falla
  currentImageSrc.value[site_id] = lowResImage(site_id)
}

const filteredSedes = computed(() =>
  (sedes.value || []).filter(
    (s) =>
      s?.city_id &&
      s?.show_on_web &&
      !s?.comming_soon &&
      s?.time_zone === TIME_ZONE_FILTER
  )
)

onMounted(async () => {
  await Promise.all([getSites(), getCities()])
})

async function getSites() {
  try {
    const response = await fetch(`${URI}/sites`)
    if (!response.ok) return
    const data = await response.json()
    sedes.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error fetching sites:', err)
  }
}

async function getCities() {
  try {
    const response = await fetch(`${URI}/cities`)
    if (!response.ok) return
    const data = await response.json()
    cities.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error fetching cities:', err)
  }
}
</script>

<style scoped>
/* Contenedor principal */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 0rem auto;
  padding: 1rem;
}

/* Tarjeta de cada sede */
.sede-card {
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Contenedor de la imagen y los detalles */
.sede-image-container {
  position: relative;
  height: min-content;
  box-shadow: 0 0 10px black;
  border-radius: 0.5rem;
}

/* Imagen de la sede */
.sede-image {
  width: 100%;
  height: 30rem;
  object-fit: cover;
  border-radius: 0.5rem;
  transition: opacity 0.5s ease-in-out;
}

.main-container {

  padding: 0;
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

/* Detalles específicos */
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
