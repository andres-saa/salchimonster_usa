<!-- CountryMenu.vue (Jersey‑only, no dialogs) -->
<template>
  <!-- ░░░ Galería ░░░ -->
  <div style="background-color:var(--p-primary-color);min-height:120vh;padding:0;">
    <div v-if="activeMenu">
      <div class="image-gallery">
        <img
          v-for="card in activeMenu.cartas"
          :key="card.id"
          :src="bigUrl(card.img_identifier)"
          :alt="`Menú ${activeMenu.name}`"
          :class="{ 'horizontal-image': !isMobile, 'vertical-image': isMobile }"
          @error="e => (e.target.src = plainUrl(card.img_identifier))"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { URI } from '@/service/conection'
import { useUserStore } from '@/store/user'

/* ───── Estado global ───── */
const user = useUserStore()

/* ───── Estados internos ───── */
const carta = ref('jersey')   // sólo 'jersey'

/* ───── Datos del backend ───── */
const menuData = ref([])

/* ───── Responsividad ───── */
const windowWidth = ref(window.innerWidth)
const isMobile    = computed(() => windowWidth.value < 600)
const updateWidth = () => (windowWidth.value = window.innerWidth)

/* ───── Helpers para URLs de imagen ───── */
const bigUrl   = id => `${URI}/read-photo-product/${id}/1920`
const plainUrl = id => `${URI}/read-photo-product/${id}`

/* ───── Fetch menú ───── */
const fetchMenuData = async () => {
  try { menuData.value = await (await fetch(`${URI}/cartas-all`)).json() }
  catch (e) { console.error('Error fetching menu data:', e) }
}

/* ───── Normalización y filtros ───── */
const normalize = s => s.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // sin tildes
  .replace(/_/g, ' ')                               // _ → espacio
  .replace(/\s+/g, ' ')                             // colapsa dobles espacios

const hasAll = (name, ...kw) =>
  kw.every(k => normalize(name).includes(normalize(k)))

const itemHasImages = m =>
  Array.isArray(m.cartas) && m.cartas.some(c => c.img_identifier)

const firstMatch = patterns => {
  for (const kw of patterns) {
    const hit = menuData.value.find(
      m => hasAll(m.name, ...kw) && itemHasImages(m)
    )
    if (hit) return hit
  }
  return null
}

/* ───── Menú activo preferido ───── */
const activeMenu = computed(() => {
  if (!menuData.value.length) return null

  const primary   = isMobile.value ? 'vertical'   : 'horizontal'
  const secondary = isMobile.value ? 'horizontal' : 'vertical'

  // usa idioma del usuario, por defecto español
  if (!user.lang?.name) {
    user.lang = { name: 'es', label: 'Español', flag: 'https://flagcdn.com/w20/co.png' }
  }

  const prefLang  = user.lang.name === 'es' ? 'espanol' : 'ingles'
  const otherLang = prefLang === 'espanol' ? 'ingles' : 'espanol'

  const rulesNJ = [
    [primary,   'nj', prefLang],
    [secondary, 'nj', prefLang],
    [primary,   'nj', otherLang],
    [secondary, 'nj', otherLang],
    ['nj']
  ]
  return firstMatch(rulesNJ)
})

/* ───── Mounted / Unmounted ───── */
onMounted(() => {
  fetchMenuData()
  window.addEventListener('resize', updateWidth)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWidth)
})
</script>

<style scoped>
.image-gallery         { display:flex; flex-direction:column; margin:0; padding:0 }
.horizontal-image,
.vertical-image        { width:100%; margin:0; padding:0 }
</style>
