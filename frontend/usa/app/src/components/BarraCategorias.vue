<template>
  <div
    ref="categoryBar"
    style="
      position: sticky;
      box-shadow: 0 1rem 0.5rem #00000020;
      top: 3.5rem;
      padding: 0.2rem;
      z-index: 9999;
      display: flex;
      align-items: center;
      background-color: white;
      overflow-x: auto;
    "
  >
    <div class="container" style="justify-content: start; align-items: center">
      <div
        v-for="(section, index) in cart?.menu?.filter(p => p.products  && p.visible) || []"
        :key="section.categoria_id"
        :id="'categoryButton-' + section.categoria_id"
        class="container-button"
      >
        <a @click.prevent="smoothScrollTo(section.categoria_id, true,true)">
          <Button
            class="bar-button"
            :class="{ selected: cart.currentSection === section.categoria_id }"
            :label="section.categoria_descripcion"
          >
            <img
              :src="`${URI}/get-image?image_url=${section.products?.[0]?.productogeneral_urlimagen}`"
              alt=""
            />
            <span style="text-transform: capitalize;"
              ><b>{{ user.lang.name == 'es'? section.categoria_descripcion?.toLowerCase() :  section.english_name?.toLowerCase()}}</b></span
            >
          </Button>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { usecartStore } from '../store/shoping_cart'
import { Button } from 'primevue'
import { URI } from '@/service/conection'
import { useUserStore } from '@/store/user'

const user = useUserStore()
// Store
const cart = usecartStore()

// Orden personalizado de las categorías (IDs)
const codigos = [
120,
118,
  119,
  116,
  117,
  10,
  26,
  8,
  9,
  13,
  27,
  11,
  4,
  5,
  110, // SALCHIPAPA PARA 2 PERSONAS NJ
  112, // SALCHIPAPAS PERSONALES NJ
  113, // PARA COMPARTIR
  111, // BURGERMONSTER
  109, // BEBIDAS
  115,


]

// Filtra y ordena las categorías con base en 'codigos'
const filteredAndSortedCategories = computed(() => {
  return cart?.menu
    ?.filter((c) => codigos.includes(parseInt(c.categoria_id)))
    ?.sort((a, b) => {
      return codigos.indexOf(parseInt(a.categoria_id)) - codigos.indexOf(parseInt(b.categoria_id))
    })
})

/**
 * Desplaza suavemente el contenido principal hasta la sección
 * y actualiza cart.currentSection para que se marque como activa
 */
const smoothScrollTo = (categoryId, desplaza = true, button = false) => {
  // ----- SCROLL VERTICAL (al contenido) -----
  const element = document.getElementById(categoryId)
  if (element) {
    const offset = 10 * 16
    const elementY = element.getBoundingClientRect().top + window.pageYOffset
    const targetPosition = elementY - offset

    if (desplaza && button) {
      window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    })

    }

  }


  // ----- MARCAR SECCIÓN ACTUAL -----
  cart.currentSection = categoryId

  // ----- SCROLL HORIZONTAL (a la barra de categorías) -----
  setTimeout(() => {
    const buttonElement = document.getElementById(`categoryButton-${categoryId}`)
    if (buttonElement) {

        buttonElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center', // Centra horizontalmente
        block: 'nearest', // No desplaza verticalmente innecesariamente
      })


    }
  }, 0)
}

// IntersectionObserver para marcar la sección activa al hacer scroll
// let observer = null;
// onMounted(() => {
//   observer = new IntersectionObserver(
//     entries => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           cart.currentSection = entry.target.id;
//         }
//       });
//     },
//     {
//       root: null,
//       // Ajustar según la altura de tu barra sticky
//       rootMargin: '-50px 0px -60% 0px',
//       threshold: 0
//     }
//   );

//   // Se observa cada contenedor de categoría (en tu DOM deben existir elementos con id = section.categoria_id)
//   filteredAndSortedCategories.value.forEach(section => {
//     const target = document.getElementById(section.categoria_id);
//     if (target) {
//       observer.observe(target);
//     }
//   });

// });

// Al desmontar, limpiamos el observer
onBeforeUnmount(() => {
  // if (observer) observer.disconnect();
})

// watch(() => cart.currentSection, (f) => {
//   setTimeout(() => {
//     const buttonElement = document.getElementById(`categoryButton-${f}`);
//     if (buttonElement) {
//       buttonElement.scrollIntoView({
//         behavior: 'smooth',
//         inline: 'center',   // Centra horizontalmente
//         block: 'nearest'       // No desplaza verticalmente innecesariamente
//       });
//     }
//   }, 1000);
// })

/**
 * Watch que, cada vez que cambie la sección activa,
 * busca el botón correspondiente y hace scroll para centrarlo.
 */

watch(() => cart.currentSection,(newval) => {

  setTimeout(() => {
    const buttonElement = document.getElementById(`categoryButton-${newval}`)
    if (buttonElement) {

        buttonElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center', // Centra horizontalmente
        block: 'nearest', // No desplaza verticalmente innecesariamente
      })


    }
  }, 0)

})
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 0.5rem;
  animation:;
}

.bar-button {
  border-radius: .3rem;
  background-color: #fff;
  color: #000;
  padding: 0.2rem 1rem 0.4rem 0.4rem;
  white-space: nowrap;
  border: none;
  box-shadow: 0 0 0.5rem #00000050;
  /* para evitar quiebres de línea */
}

.bar-button:hover {
  background-color: #000000;
  color: #fff;

  /* para evitar quiebres de línea */
}

.container-button {
  display: flex;
  align-items: center;
  font-weight: bold;
  height: 3rem;
}

.selected {
  background-color: #000;
  color: #fff;
}

@keyframes scrollHint {
  0% {
    transform: translateX(0) rotate(45deg);
    opacity: 0;
  }

  30% {
    opacity: 1;
  }

  70% {
    transform: translateX(20px) rotate(45deg);
    opacity: 1;
  }

  100% {
    transform: translateX(40px) rotate(45deg);
    opacity: 0;
  }
}

img {
  height: 2rem;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: .3rem;
}
</style>
