<script setup>

import VistaProducto from './components/Dialogs/VistaProducto.vue';
import Toast from 'primevue/toast';
import { InputText } from 'primevue';
import siteDialog from './components/Dialogs/siteDialog.vue';
import SiteDialogSonando from './components/Dialogs/siteDialogSonando.vue';
import barra from './views/barra.vue';
import { useReportesStore } from './store/ventas';
import { onMounted } from 'vue';
import { usecartStore } from './store/shoping_cart';
import { fetchService } from './service/utils/fetchService';
import { URI } from './service/conection';
import { useSitesStore } from './store/site';

const cart = usecartStore()
const siteStore = useSitesStore()


const reportes = useReportesStore()
onMounted(async () => {


  const site_id = siteStore.location.site?.site_id
  const pe_id = siteStore.location.site?.pe_site_id
  const status = await fetchService.get(`${URI}/site/${site_id}/status`)
  if (status) {
    siteStore.status = status
  }
  const data = await fetchService.get(`${URI}/tiendas/${pe_id || 1}/products`)

  cart.menu = data.categorias

})
</script>

<template>
  <div>
    <div
    class=""
    v-if="reportes.loading.visible"
    style="width: 100vw;transition: all ease .3s;  flex-direction: column;pointer-events:auto; background-color: #00000020; height: 100vh;position: fixed;display: flex;align-items: center;justify-content: center; left: 0;right: 0;z-index: 99999999;"
  >
  <div class="luz" style="aspect-ratio: 1  / 1;display: flex;justify-content: center;align-items: center;">

    <div class="girar" style="width: 150px;z-index: -1; height: 150px;padding: 3rem; background-color: var(--p-primary-color); position: absolute;"></div>
    <div class="imagen" style="display: flex;padding: 1rem;border-radius: .3rem; background-color: white;  gap: 1rem; flex-direction: column; align-items:center;">
      <img src="https://backend.salchimonster.com/read-photo-product/xai0dVnL" style="width:20vw ;max-width: 100px;" alt="">
      <h5 style="color: black;">Cargando...</h5>
    </div>
  </div>

  </div>

    <Toast></Toast>
    <router-view></router-view>
    <vista-producto></vista-producto>
    <!-- <InputText></InputText> -->
    <siteDialog></siteDialog>
    <barra></barra>
    <!-- <SiteDialogSonando></SiteDialogSonando> -->
  </div>
</template>


<style scoped>

.girar{

  animation: girar infinite 1s linear;

}



@keyframes girar {

  100%{
    transform: rotate(360deg);
  }

}
</style>
