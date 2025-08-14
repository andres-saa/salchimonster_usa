<template>
  <div class="containerm" lang="es" translate="yes">
    <div
      v-for="(section, index) in filteredSections"
      :key="section.categoria_id"
      :id="section.categoria_id"
      class="container-button"
      :data-category-name="section.categoria_descripcion"
      ref="sectionEls"
    >
      <div class="category-header">
        <span class="category-name">
          <b>{{ user.lang.name === 'es' ? section.categoria_descripcion : section.english_name }}</b>
        </span>
      </div>

      <div class="section">
        <div
          v-for="(product, idx) in productsWithPrice(section.products)"
          :key="product.id"
          class="product-col"
        >
          <div class="card-container">
            <MenuCard
              class="menu-card"
              :id="`tarjeta-${index}-${idx}`"
              :index="idx + 1"
              :product="product"
              @click="open(product)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

// Components & Stores
import MenuCard from '@/components/cards/MenuCard.vue'
import { usecartStore } from '@/store/shoping_cart'
import { useReportesStore } from '@/store/ventas'
import { useSitesStore } from '@/store/site'
import { useUserStore } from '@/store/user'
import { fetchService } from '@/service/utils/fetchService'
import { URI } from '@/service/conection'
// Utils/consts
// import { URI } from '@/service/conection' // (No se usa aquí)

const route = useRoute()
const user = useUserStore()
const siteStore = useSitesStore()
const store = useReportesStore()
const cart = usecartStore()

// ─────────────────────────────────────────
// Computed helpers
// ─────────────────────────────────────────
const filteredSections = computed(() =>
  (cart?.menu || [])
    .filter(s => s?.products && s?.visible)
)

function productsWithPrice (list = []) {
  return list.filter(p => hasPrice(p))
}

function hasPrice (p) {
  const general = Number(p?.productogeneral_precio || 0)
  const firstPres = Number(p?.lista_presentacion?.[0]?.producto_precio || 0)
  return general > 0 || firstPres > 0
}

// ─────────────────────────────────────────
// Intersection Observer para la sección actual
// ─────────────────────────────────────────
const sectionEls = ref([])
let observer = null
let cancelSetCurrent = null

function debounce (fn, delay = 500) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}

const setCurrentSectionDebounced = debounce((id) => {
  cart.currentSection = id
}, 500)

function setupObserver () {
  if (observer) observer.disconnect()

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const id = entry.target?.id
        if (id) setCurrentSectionDebounced(id)
      }
    }
  }, {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  })

  sectionEls.value.forEach(el => el && observer.observe(el))
}

onMounted(async() => {
  // Si viene ?producto= en la URL, aquí puedes abrir el producto si ya está cargado en el store
  const produtct_id = route.query?.producto
  const categoria = route.query.categoria
       if (produtct_id) {
        const pe_id = siteStore.location.site?.pe_site_id

        const data = await fetchService.get(`${URI}/tiendas/${pe_id || 1}/products`)

        // const product = cart.menu?.data?.find(p => cart.getProductId(p) == produtct_id)
        const categoria_candidata = data?.categorias.find(c => c.categoria_id == categoria)
        console.log(categoria_candidata)
        cart.currentProduct = categoria_candidata?.products.find(p => p.productogeneral_id == produtct_id)
        cart.visibles.currentProduct = true
    }

  // Observa las secciones una vez montadas
  // setupObserver()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  if (cancelSetCurrent) clearTimeout(cancelSetCurrent)
})

// ─────────────────────────────────────────
// Acciones UI
// ─────────────────────────────────────────
function open (product) {
  cart.setCurrentProduct(product)
  cart.setVisible('currentProduct', true)
}

function smoothScrollTo (categoryId) {
  // Scroll vertical al contenido
  const element = document.getElementById(categoryId)
  if (element) {
    const offset = 10 * 16 // 10rem en px (asumiendo 1rem=16px)
    const elementY = element.getBoundingClientRect().top + window.pageYOffset
    const targetPosition = elementY - offset

    window.scrollTo({ top: targetPosition, behavior: 'smooth' })
  }

  // Marcar sección actual
  store.currentSection = categoryId

  // Scroll horizontal de la barra de categorías
  setTimeout(() => {
    const buttonElement = document.getElementById(`categoryButton-${categoryId}`)
    if (buttonElement) {
      buttonElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, 100)
}
</script>

<style scoped>
.containerm {
  max-width: 1600px;
  margin: 0 auto;
  padding-bottom: 5rem;
}

.container-button {}

/* Encabezado de categoría */
.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 2rem auto;
  justify-content: center;
}

.category-name {
  font-size: 2rem;
  padding: 0;
  margin: 0;
  text-transform: uppercase;
  text-align: center;
}

/* Grid de productos */
.section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25%, 1fr));
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  gap: 0.5rem;
  padding: 0.5rem;
}

.product-col {
  width: 100%;
}

.card-container {
  padding: 1rem;
  width: 100%;
  height: 100%;
}

.menu-card {
  height: 100%;
}

/* Responsivo */
@media (max-width: 1544px) {
  .section {
    grid-template-columns: repeat(auto-fit, minmax(33%, 1fr));
    max-width: 1200px;
    margin: auto;
  }
}

@media (max-width: 870px) {
  .section {
    grid-template-columns: 1fr;
    max-width: 600px;
    margin: auto;
  }

  .category-name {
    font-size: 1.5rem;
    width: 100%;
  }
}
</style>
