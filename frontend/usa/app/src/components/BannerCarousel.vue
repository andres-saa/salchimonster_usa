<!-- BannerCarousel.vue -->
<template>
  <div class="banner-carousel">
    <!-- Sólo renderiza si hay banners -->
    <Carousel
      v-if="banners.length"
      :value="banners"
      :numVisible="1"
      :numScroll="1"
      :circular="true"
      :autoplayInterval="5000"    
      :showIndicators="true"     
      :showNavigators="banners.length > 1"
      class="w-full"
    >
      <template #item="{ data, index }">
        <img
          :src="`${URI}/read-photo-product/${data.img_identifier}`"
          :alt="data.title ?? `Banner ${index}`"
          class="banner-img"
        />
      </template>
    </Carousel>
  </div>
</template>

<script setup>
import { ref, onMounted }  from 'vue'
import {Carousel}            from 'primevue'
import { fetchService }    from '@/service/utils/fetchService'
import { URI }             from '@/service/conection'
// import Carousel from 'primevue/carousel'
const banners = ref([])

onMounted(async () => {
  const data = await fetchService.get(`${URI}/banners`)
  // ordena por el índice que ya usabas
  banners.value = data.sort((a, b) => a.index - b.index)
})
</script>

<style scoped>
.banner-carousel { position: relative; width: 100%; overflow: hidden; }
.banner-img      { width: 100%; aspect-ratio: 16/7; object-fit: cover; }

img{
  width: 100vw;
}


:deep(.p-carousel-next-button){
  position: absolute;
  right: .5rem;
  background-color: rgba(0, 0, 0, 0.473);
  color: rgb(255, 255, 255);

}


:deep(.p-carousel-prev-button){
  position: absolute;
  left: .5rem;
  background-color: rgba(0, 0, 0, 0.473);
  color: rgb(255, 255, 255);
  z-index: 100;
}

@media (max-width: 600px) {
  .banner-img { aspect-ratio: 4/3; }
}
</style>
