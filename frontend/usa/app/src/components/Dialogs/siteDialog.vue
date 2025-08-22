<template>
  <Dialog
    :closable="store.location?.site?.pe_site_id > 0"
    style="width: 30rem; max-width: 96%;"
    v-model:visible="store.visibles.currentSite"
    :header="user.lang.name === 'es' ? 'Selección de sede' : 'Select a location'"
    :modal="true"
    class="dialog"
  >
    <div class="dialog-content">
      <b class="dialog-title"></b>

      <div class="form-container">
        <!-- (Se elimina el selector de 'ciudad'; ahora se selecciona USA por defecto y NO se muestra) -->

        <!-- Selector de sede -->
        <div class="form-group">
          <div class="label-spinner">
            <label for="site-dropdown" class="label">
              {{ user.lang.name === 'es' ? 'Elige una sede' : 'Select your site' }}
            </label>
            <div v-if="spinnersView.barrio" class="loading-neighborhood">
              <ProgressSpinner class="spinner" strokeWidth="8" fill="var(--white)" animationDuration=".5s"
                aria-label="Buscando sedes" />
              <p class="loading-text">
                {{ user.lang.name === 'es' ? 'Buscando sedes...' : 'Loading sites...' }}
              </p>
            </div>
          </div>

          <Dropdown
            id="site-dropdown"
            v-model="currenNeigborhood"
            :disabled="!possibleNeigborhoods.length"
            :options="possibleNeigborhoods"
            optionLabel="name"
            :placeholder="user.lang.name === 'es' ? 'Selecciona una sede' : 'Select a site'"
            filter
            :filterPlaceholder="user.lang.name === 'es' ? 'Escribe el nombre de la sede' : 'Type your site name'"
            class="dropdown"
            required
          />

          <!-- Idioma -->
          <div class="label-spinner">
            <label for="lang-dropdown" class="label" style="margin-top: 1rem;">
              {{ user.lang.name === 'es' ? 'Elige tu idioma' : 'Choose your language' }}
            </label>
          </div>

          <Dropdown
            id="lang-dropdown"
            v-model="user.lang"
            :options="languages"
            class="dropdown"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flag-option">
                <img :src="slotProps.value.flag" class="flag-img" />
                <span>{{ slotProps.value.label }}</span>
              </div>
            </template>

            <template #option="slotProps">
              <div class="flag-option">
                <img :src="slotProps.option.flag" class="flag-img" />
                <span>{{ slotProps.option.label }}</span>
              </div>
            </template>
          </Dropdown>
        </div>

        <!-- Vista Previa -->
        <div class="image-container">
          <img
            v-if="currenNeigborhood?.site_id"
            :src="`${URI}/read-product-image/600/site-${currenNeigborhood?.site_id}`"
            :class="{ 'default-image': currenNeigborhood.site?.name === 'default' }"
            alt="Vista previa de la sede"
          />

          <div v-if="currenNeigborhood?.site_id" class="image-overlay">
            <p class="site-info">

              <span class="site-name">{{ currentSite?.site_name }}</span> -
              <span class="site-name" style="text-transform: lowercase;">{{ currentSite?.site_address }}</span>
            </p>
          </div>
        </div>

        <!-- Botón Guardar -->
        <div class="button-container">
          <Button
            :label="user.lang.name === 'es' ? 'Guardar' : 'Save'"
            @click="setNeigborhood"
            :disabled="!currenNeigborhood?.name"
            class="save-button"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Dialog } from 'primevue'
import { Dropdown } from 'primevue'
import { Button } from 'primevue'
import { ProgressSpinner } from 'primevue'
import { URI } from '@/service/conection'
import { sitesService } from '@/service/site/sitesService'
import { useSitesStore } from '@/store/site'
import { usecartStore } from '@/store/shoping_cart'
import router from '@/router'
import { useUserStore } from '@/store/user'
import { fetchService } from '@/service/utils/fetchService'
const USA_CITY_ID = 15 // ← por defecto: USA

const languages = [
  { name: 'es', label: 'Español', flag: 'https://flagcdn.com/w20/co.png' },
  { name: 'en', label: 'English', flag: 'https://flagcdn.com/w20/us.png' }
]

const user = useUserStore()
const store = useSitesStore()
const cart = usecartStore()

watch(
  () => store.location.site,
  async (newval, oldval) => {
    if (!newval?.site_id) return; // evita llamadas innecesarias

    // obtén el status normalmente
    const status = await fetchService.get(`${URI}/site/${newval.site_id}/status`);

    if (newval.site_id == 37) {
      // 🔹 revertir el cambio en el store ANTES de navegar
      store.location.site = oldval;

      // 🔹 navegar a la URL externa
      window.location.href = 'https://ordering.chownow.com/order/42376/locations/64019';
      return; // salimos para no sobreescribir el store.status
    }

    if (status) {
      store.status = status;
    }
  }
);


const spinnersView = ref({ ciudad: false, barrio: false })
const cities = ref([])
const currentSite = ref({})
const currenCity = ref(null) // sigue existiendo pero NO se muestra
const currenNeigborhood = ref({ site: { name: 'default' } })
const possibleNeigborhoods = ref([])

const resetNeighborhood = () => {
  currenNeigborhood.value = { site: { site_name: 'default' } }
}

const changePossiblesNeigborhoods = async () => {
  if (currenCity.value && currenCity.value.city_id) {
    const neighborhoods = await getNeighborhoodsByCityId(currenCity.value.city_id)
    possibleNeigborhoods.value = neighborhoods
  } else {
    possibleNeigborhoods.value = []
  }
}

watch(currenCity, () => changePossiblesNeigborhoods())

watch(
  currenNeigborhood,
  async () => {
    if (currenNeigborhood.value.site_id) {
      currentSite.value = await sitesService.getSiteById(currenNeigborhood.value.site_id)
    } else {
      currentSite.value = {}
    }
  },
  { immediate: true }
)

const setNeigborhood = async () => {
  const newLocation = {
    site: currentSite.value,
    neigborhood: currenNeigborhood.value,
    city: currenCity.value
  }
  store.setLocation(newLocation)
  store.setVisible('currentSite', false)

}

const getCities = async () => {
  try {
    spinnersView.value.ciudad = true
    const response = await fetch(`${URI}/cities`)
    if (response.ok) {
      const data = await response.json()
      cities.value = data || []
      // Seleccionar USA por defecto (sin mostrar UI)
      const usa = cities.value.find(c => c.city_id === USA_CITY_ID || c.city_name?.toUpperCase() === 'USA')
      currenCity.value = usa || cities.value[0] || null
      await changePossiblesNeigborhoods()
    }
  } catch (error) {
    console.error('Error obteniendo ciudades:', error)
  } finally {
    spinnersView.value.ciudad = false
  }
}

const getNeighborhoodsByCityId = async (city_Id) => {
  try {
    spinnersView.value.barrio = true
    const response = await fetch(`${URI}/neighborhoods/by-city/${city_Id}`)
    if (response.ok) {
      const data = await response.json()
      return data
    }
    return []
  } catch (error) {
    console.error('Error obteniendo sedes:', error)
    return []
  } finally {
    spinnersView.value.barrio = false
  }
}

// Auto idioma según sede (mantengo tu lógica)
watch(
  currenNeigborhood,
  (newval) => {
    user.lang = newval?.site_id === 33
      ? { name: 'en', label: 'English', flag: 'https://flagcdn.com/w20/us.png' }
      : { name: 'es', label: 'Español', flag: 'https://flagcdn.com/w20/co.png' }
  },
  { deep: true }
)

onMounted(() => {
  getCities()
})
</script>

<style scoped>
/* (tus estilos originales, sin cambios relevantes) */
.dialog { background-color: white; position: relative; border-radius: 1rem; padding-top: 2rem; }
.dialog-content { display: flex; flex-direction: column; align-items: center; }
.dialog-title { color: black; margin-bottom: 1rem; }
.form-container { width: 100%; display: flex; flex-direction: column; align-items: center; }
.form-group { width: 100%; margin-bottom: 1.5rem; }
.label-spinner { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
.label { color: black; min-width: max-content; }
.dropdown { width: 100%; }
.spinner { width: 20px; height: 20px; }
.loading-neighborhood { display: flex; align-items: center; gap: 0.5rem; }
.loading-text { color: black; }
.image-container { width: 100%; height: 15rem; position: relative; margin-bottom: 1.5rem; border-radius: 0.5rem; overflow: hidden; }
.image-container img { width: 100%; height: 100%; object-fit: cover; border: 1px solid #fff; border-radius: 0.2rem; background-color: #fff; }
.default-image { filter: blur(10px); position: relative; }
.image-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: flex-end; padding: 1rem; border-radius: 0.5rem; }
.site-info { background-color: rgba(0, 0, 0, 0.7); text-align: center; width: 100%; font-weight: 500; padding: 0.5rem 0; color: #fff; }
.brand-name { font-size: 1.25rem; }
.site-name { text-transform: uppercase; font-size: 1.25rem; }
.button-container { width: 100%; }
.save-button { width: 100%; padding: 10px 20px; border: none; background-color: black; color: #fff; text-align: center; border-radius: 0.5rem; cursor: pointer; transition: background-color 0.3s ease; }
.save-button:disabled { background-color: #555; cursor: not-allowed; }
.save-button:not(:disabled):hover { background-color: #333; }
@media (max-width: 500px) {
  .dialog { width: 90%; }
  .site-info { font-size: 1rem; }
  .brand-name, .site-name { font-size: 1rem; }
}
.flag-option { display: flex; align-items: center; gap: 0.5rem; }
.flag-img { width: 20px; height: 14px; }
</style>
