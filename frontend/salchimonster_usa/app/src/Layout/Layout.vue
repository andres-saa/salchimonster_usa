<template>
  <div class="main-container">
    <AppTopbar></AppTopbar>
    <RouterView class="main"></RouterView>
  </div>
</template>

<script setup>
import AppTopbar from './AppTopbar.vue';
// import Home from './Home.vue';
import { watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

watch(() => route.path, () => {
  scrollToTop();
  // alert('ho')
});

const scrollToTop = () => {

  window.scrollTo({ top: 0, behavior: 'smooth' });

};


</script>

<style scoped>
.main {
  margin-top: 0rem;
  width: 100vw;
  max-width: 100vw;
  contain: paint;
  margin: 0;
  max-width: 100%;
}

.main-container {
  background-color: rgba(6, 0, 255, 0.04);
  min-height: 120vh;
}
</style>
