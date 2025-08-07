<template>
  <div class="containerm" lang="es" translate="yes">
    <div
      v-for="(section, index) in cart?.menu.filter(p => p.products && p.visible )"
      :key="section.categoria_id"
      :id="section.categoria_id"
      class="container-button"
      :data-category-name="section.categoria_descripcion"


    >
      <div class="category-header">
        <span class="category-name" style="margin: 0 1rem;">
          <b>{{ user.lang.name == 'es'?   section.categoria_descripcion : section.english_name }}</b>
        </span>
      </div>

      <div class="section">
        <div
          v-for="(product, idx) in section?.products?.filter(p => p?.productogeneral_precio > 0 || p?.lista_presentacion[0]?.producto_precio > 0)"
          :key="product.id"
          style="width: 100%;"
        >
          <div class="card-container">
            <MenuCard
              style="height: 100%;"
              :id="`tarjeta-${index}-${idx}`"
              :index="idx + 1"
              :product="product"
            />
          </div>
        </div>
      </div> 
    </div>
  </div>
</template>




<script setup>
import { usecartStore } from '../store/shoping_cart';
import MenuCard from '@/components/cards/MenuCard.vue';
import { useReportesStore } from '@/store/ventas';
import { onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { URI } from '@/service/conection';
const route = useRoute()
import { useSitesStore } from '@/store/site';
import { useUserStore } from '@/store/user';

const user = useUserStore()
const siteStore = useSitesStore()
const store = useReportesStore()
const cart = usecartStore()


// IDs de las categorías (con sus nombres en comentarios)
const codigos = [
118,
120,
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


// console.log(route.query)

const produtct_id = route.query?.producto;



onMounted(() => {
    console.log(produtct_id)

    if (produtct_id) {
        const product = cart.menu?.data?.find(p => cart.getProductId(p) == produtct_id)
        cart.currentProduct = product
        cart.visibles.currentProduct = true
    }

})


let scrollTimeout = null
let observer = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Cancelamos el timer anterior
        if (scrollTimeout) clearTimeout(scrollTimeout)
        // Programamos la asignación sólo si pasan 500 ms sin más intersecciones
        scrollTimeout = setTimeout(() => {
          cart.currentSection = entry.target.id
        }, 500)
      }
    })
  }, {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  })

  // Observamos cada sección
  document.querySelectorAll('.container-button').forEach(el => {
    observer.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  if (scrollTimeout) clearTimeout(scrollTimeout)
})

const open = (product) => {
    cart.setCurrentProduct(product);
    cart.setVisible('currentProduct', true);


};

const smoothScrollTo = (categoryId) => {
    // ----- SCROLL VERTICAL (al contenido) -----
    const element = document.getElementById(categoryId);
    if (element) {
        const offset = 10 * 16;
        const elementY = element.getBoundingClientRect().top + window.pageYOffset;
        const targetPosition = elementY - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // ----- MARCAR SECCIÓN ACTUAL -----
    store.currentSection = categoryId;

    // ----- SCROLL HORIZONTAL (a la barra de categorías) -----
    setTimeout(() => {
        const buttonElement = document.getElementById(`categoryButton-${categoryId}`);
        if (buttonElement) {
            buttonElement.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',   // Centra horizontalmente
                block: 'nearest'       // No desplaza verticalmente innecesariamente
            });
        }
    }, 100);
};


onMounted(() => {

  // if( !siteStore.location?.site?.pe_site_id){
  //   siteStore.visibles.currentSite = true
  //   console.log(siteStore.location)
  // }
  //   if (cart.currentSection) {
  //       smoothScrollTo(cart.currentSection)
  //   }
})

</script>



<style scoped>
.category-name {
    font-size: 2rem;
    padding: 0;
    margin: 0;
    text-transform: uppercase;
    text-align: center;

}


.container-button {
    /* padding-top: 2rem;
    padding-bottom: 2rem; */
}

.containerm {
    max-width: 1600px;
    margin:0 auto;

    padding-bottom: 5rem;
    /* margin-top: 3rem; */
}

.category-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    /* padding: 0 1rem; */

    margin: 2rem auto;
    justify-content: center;
    /* width: max-content; */
}


.category-img {

    height: 4rem;
    width: 4rem;
    aspect-ratio: 1 /1;
    object-fit: cover;
    border-radius: 50%;
    border: 4px solid rgb(255, 255, 255);
    box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.2);
    transition: all ease .3s;
    cursor: pointer;
    /* padding: .3rem; */
}

.category-img:hover {
    transform: translateY(-.5rem);
    box-shadow: 0 1.5rem 1rem rgba(0, 0, 0, 0.2);


}

.section {
  display: grid;
  /* Crea tantas columnas como quepan hasta un máximo de 3 */
  grid-template-columns: repeat(auto-fit, minmax(25%, 1fr));

  /* Asegura que no haya más de 3 columnas (3 * 250px = 750px) */
  max-width: 1600px;
  width: 100%;

  /* Centra la grid en la página */
  margin: 0 auto;

  /* Centra el contenido en cada celda de la grid */

  margin: auto;
  gap: 0.5rem;
  padding: 0.5rem;
}



@media (max-width: 1544px) {
    .section {
         /* Crea tantas columnas como quepan hasta un máximo de 3 */
  grid-template-columns: repeat(auto-fit, minmax(33%, 1fr));

        max-width: 1200px;
        margin: auto;
    }

    .container {
        max-width: 1200px;
        margin: auto;
        /* margin-top: 3rem; */
    }
}

/*
   Cuando la ventana sea menor a 992px,
   pasas a 2 columnas.
*/
/* @media (max-width: 992px) {
    .section {
        grid-template-columns: repeat(2, 1fr);
    }
} */

/*
   Cuando la ventana sea menor a 768px,
   queda en 1 columna (formato de “tarjeta” vertical).
*/
@media (max-width: 870px) {
    .section {
        grid-template-columns: repeat(1, 1fr);
        max-width: 600px;
        margin: auto;
    }

    .category-img {

        height: 3rem;
        width: 3rem;

    }

    .category-name {
        font-size: 1.5rem;
        padding: 0;
        margin: 0;
        width: 100%;
        text-transform: uppercase;
        text-align: center;

    }

}


.card-container {
    padding: 1rem;
    width: 100%;
    height: 100%;
}
</style>
