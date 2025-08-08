<template>

<div  style="width: 100%;background: url(https://backend.salchimonster.com/read-photo-product/Gg0HBDOT);background-size: contain; padding-bottom: 4rem;">
  <div class="container8" style="">


<div class="people" style="">


  <img class="muneco" v-for="i in [2,3,4].reverse()" :src="`/images/kids/${i}.png`" alt="" style="width: 100%;object-fit: contain;">

</div>


<div style="width: 100%; padding-bottom: 5rem; display: flex;flex-direction: column;align-items: center;margin-top: 4rem;z-index: 10000000;">
  <div class="stage">
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
  <div class="layer"></div>
</div>




<div class="grid" style="">
<MenuCard ref="card" style="grid-area: t;box-shadow: 0 1rem 1rem  #00000040;"  :product="product"></MenuCard>

<!-- <MenuCard style="grid-area: m"  :product="product"></MenuCard> -->


<div class="pc" style="">
  <p>
    <h2>La Gran Misión de los Monster Kids</h2>
<br>
<p>Había una vez, en la ciudad secreta de MonsterLand, un grupo de monstruos muy especiales. No eran monstruos cualquiera… ¡eran los Guardianes del Sabor! Cada uno tenía un poder único y delicioso que usaban para proteger el sabor del mundo.</p>
<br>
<p>Un día, el Gran Chef Cósmico les envió una misión:</p>

<span >
<br>
<p>“¡El sabor de la alegría está desapareciendo de los platos de los niños! Necesitamos que viajen al mundo real y lleven con ustedes la Caja Monster Kids para devolver la diversión, el color y el sabor a cada almuerzo y comida.”</p>
<br>
<p>El primero en alistarse fue Salchiclón, el líder valiente. — ¡Vamos equipo, esta misión necesita nuestro poder monstruoso!</p>
<br>
<p>Madurín se puso sus gafas y dijo: — Con estilo y sazón, salvaremos la diversión.</p>
<br>
<p>Quesón, siempre con una idea brillante, diseñó el mapa de sabor para encontrar a cada niño.</p>
<br>
<p>Chicharronator se cargó la mochila con crocancia y fuerza. — ¡Con cada mordida, una sonrisa asegurada!</p>
<br>
<p>Papatín corrió como un rayo por toda MonsterLand avisando que la aventura comenzaba. — ¡Vamos rápido, hay muchos niños por alegrar!</p>
<br>
<p>Pollón SM preparó su salsa secreta para darles valor a los más tímidos. — ¡Que nadie se quede sin probar nuestra energía!</p>
<br>
<p>Y por último, Guacamón, con su bigote sabio, les recordó: — No se olviden que el sabor más poderoso… ¡es el amor!</p>
<br>
<p>Así, los siete monstruos saltaron dentro de la Caja Monster Kids. Cada vez que un niño la abre, una parte de MonsterLand llega a su mesa con aventuras, colores y un sabor que ¡solo los valientes pueden probar!</p>
<br>
<p>¿Estás listo para unirte a la misión? Abre tu caja y deja que los Monstruos del Sabor entren a tu mundo.</p>
<br>
</span>




</p>

<Button style="margin: 1rem;" @click="clickCard" label="Estoy listo"></Button>


<div style="width: 100%;justify-content: center;display: flex;">
  <!-- <Button style="margin: 1rem;" v-if="!ver_mas" @click="ver_mas = true" label="Seguir leyendo"></Button>
  <Button style="margin: 1rem;background-color: black; position: absolute;bottom: -2rem;border: none;border-radius: 50%; width: 3rem; height:3rem;" icon="pi pi-angle-up" v-else @click="ver_mas = false" ></Button> -->

</div>

</div>




<div class="video"  controls style="" src="/Reel 1 Salchimonster Musica 2.mov">

  <iframe width="100%" height="100vh" style="height: 100%;min-height: 80vh;border-radius: .5rem;" src="https://www.youtube.com/embed/RbhYUm9TLQM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


</div>



<div class="movil" >


  <p>
    <h2>La Gran Misión de los Monster Kids</h2>
<br>
<p>Había una vez, en la ciudad secreta de MonsterLand, un grupo de monstruos muy especiales. No eran monstruos cualquiera… ¡eran los Guardianes del Sabor! Cada uno tenía un poder único y delicioso que usaban para proteger el sabor del mundo.</p>
<br>
<p>Un día, el Gran Chef Cósmico les envió una misión:</p>

<span >
<br>
<p>“¡El sabor de la alegría está desapareciendo de los platos de los niños! Necesitamos que viajen al mundo real y lleven con ustedes la Caja Monster Kids para devolver la diversión, el color y el sabor a cada almuerzo y comida.”</p>
<br>
<p>El primero en alistarse fue Salchiclón, el líder valiente. — ¡Vamos equipo, esta misión necesita nuestro poder monstruoso!</p>
<br>
<p>Madurín se puso sus gafas y dijo: — Con estilo y sazón, salvaremos la diversión.</p>
<br>
<p>Quesón, siempre con una idea brillante, diseñó el mapa de sabor para encontrar a cada niño.</p>
<br>
<p>Chicharronator se cargó la mochila con crocancia y fuerza. — ¡Con cada mordida, una sonrisa asegurada!</p>
<br>
<p>Papatín corrió como un rayo por toda MonsterLand avisando que la aventura comenzaba. — ¡Vamos rápido, hay muchos niños por alegrar!</p>
<br>
<p>Pollón SM preparó su salsa secreta para darles valor a los más tímidos. — ¡Que nadie se quede sin probar nuestra energía!</p>
<br>
<p>Y por último, Guacamón, con su bigote sabio, les recordó: — No se olviden que el sabor más poderoso… ¡es el amor!</p>
<br>
<p>Así, los siete monstruos saltaron dentro de la Caja Monster Kids. Cada vez que un niño la abre, una parte de MonsterLand llega a su mesa con aventuras, colores y un sabor que ¡solo los valientes pueden probar!</p>
<br>
<p>¿Estás listo para unirte a la misión? Abre tu caja y deja que los Monstruos del Sabor entren a tu mundo.</p>
<br>
</span>




</p>

<Button style="margin: 1rem;" @click="clickCard" label="Estoy listo"></Button>


<div style="width: 100%;justify-content: center;display: flex;">
  <!-- <Button style="margin: 1rem;" v-if="!ver_mas" @click="ver_mas = true" label="Seguir leyendo"></Button>
  <Button style="margin: 1rem;background-color: black; position: absolute;bottom: -2rem;border: none;border-radius: 50%; width: 3rem; height:3rem;" icon="pi pi-angle-up" v-else @click="ver_mas = false" ></Button> -->

</div>

</div>




</div>


</div>




<div class="people" >


<img class="muneco" v-for="i in [6,7,5]" :src="`/images/kids/${i}.png`" alt="" style="width: 100%;object-fit: contain;">

</div>


</div>

<Piano style="width: 100%;"></Piano>

</div>

</template>



<script setup>

import MenuCard from '@/components/cards/MenuCard.vue';
import { onMounted , ref} from 'vue';
import { Button } from 'primevue';

import { usecartStore } from '@/store/shoping_cart';
import { useRoute } from 'vue-router';
import Piano from './Piano.vue';

const card = ref()

const clickCard = () => {
  if (card.value && card.value.$el) {
    card.value.$el.click();
  }
};
const store = usecartStore();
const route = useRoute();

const ver_mas = ref(false)

const product =  {
            "productogeneral_id": "347",
            "productogeneral_descripcionweb": "Salchipapa MiniKids con Papa Francesa,Salchicha Premium SM, Nuggets de pollo, jugo del valle,Alpinito,Monstruo del Imperio.",
            "productogeneral_descripcion": "MONSTERKIDS",
            "productogeneral_marca": "",
            "productogeneral_escombo": "0",
            "productogeneral_preciofijo": "1",
            "productogeneral_noalteratotalcambio": "0",
            "productogeneral_totalpreciomayor": "0",
            "productogeneral_leysunat": "0",
            "categoria_id": "120",
            "productogeneral_urlimagen": "salchimonsterrestaurantpe/productos/4bf95776-73e1-4593-9113-6cd383d50f70.jpg",
            "productogeneral_estado": "Activo",
            "notas": [],
            "lista_presentacion": [
                {
                    "productogeneral_id": "347",
                    "producto_id": "350",
                    "producto_presentacion": "Monster kids",
                    "producto_precio": "25900.00",
                    "producto_delivery": "1",
                    "producto_urlimagen": "salchimonsterrestaurantpe/productos/4bf95776-73e1-4593-9113-6cd383d50f70.jpg",
                    "producto_codigo": "",
                    "producto_codigointerno": null,
                    "producto_estado": "Activo"
                }]}


                onMounted(() => {
  setTimeout(() => {
    if (route.params.product_id) {
      store.currentProduct = store.menu.data.find(
        (p) => p.productogeneral_id == route.params.product_id
      );
      store.visibles.currentProduct = true;
    }
  }, 1000);


});

</script>


<style scoped>

.layer:after {
  font: 7rem "Pacifico", "Kaushan Script", Futura, "Roboto", "Trebuchet MS", Helvetica, sans-serif;
  content: "Monster\a    Kids!";
  white-space: pre;
  text-align: center;
  height: 100%;
  width: 100%;
  margin: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  color: whitesmoke;
  letter-spacing: -2px;
  text-shadow: 4px 0 10px rgba(0, 0, 0, 0.13);
}

.layer{
  width: 100%;
}

.grid{
  display: grid;
  /* max-width: 900px; */
  grid-template-columns: 30rem 1fr;
  grid-template-rows: 15rem 2fr ;
  gap: 2rem;
  grid-template-areas: "t v "
                        "m v";
}

.people{
  display: flex;
  gap: 5rem;width: 100%; flex-direction: column;align-items: center;max-height: 80vh;padding: 3rem;
  position: sticky;top: 3rem;
}


  * *, *::before, *::after {
    animation-play-state: running !important;
  }


.pc{
  grid-area: m;display: flex;align-items: end; justify-content: end;flex-direction: column; max-height: max-content;text-overflow: clip;
;position: relative;  background-color: white; padding: 1rem;border-radius: .5rem;box-shadow: 0 1rem 1rem  #00000040;transition: all ease .3s;
}

.movil {
  grid-area: m;display: none;align-items: end; justify-content: end;flex-direction: column; max-height: max-content;text-overflow: clip;
  ;position: relative;  background-color: white; padding: 1rem;border-radius: .5rem;box-shadow: 0 1rem 1rem  #00000040;transition: all ease .3s;
}


.video{
  aspect-ratio: 9 /  16;width: 100%;position: sticky;top: 5rem; box-shadow: 0 1rem 1rem  #00000040; grid-area: v; max-height: 80vh;border-radius: 0.5em;
}

.container8{
  grid-template-columns: 1fr 1fr 1fr;
  display: grid;gap: 2rem; width: 100%;margin: auto;
}

@media (width < 1200px) {

  .container8{
    grid-template-columns: 1fr;
    grid-template-areas: none;
  }


  .people{
    display: none;
  }

}

@media (width < 957px) {

.container8{
  grid-template-columns: 1fr;
  grid-template-areas: 'a';
  display: block;

}

.layer:after {
  font: 4rem "Pacifico", "Kaushan Script", Futura, "Roboto", "Trebuchet MS", Helvetica, sans-serif;
  content: "Monster\a    Kids!";
  white-space: pre;
  text-align: center;
  height: 100%;
  width: 75%;
  margin: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  color: whitesmoke;
  letter-spacing: -2px;
  text-shadow: 4px 0 10px rgba(0, 0, 0, 0.13);
}

.grid{
  grid-template-columns:  1fr;
  grid-template-areas: none;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}
h1{
  font-size: 2rem;
}

.people{
  display: none;
}

.movil{
  display: block;
}
.pc{
  display: none;
}
.video{
  position: static;
}
}


h1{
  font-size:3rem;
}


@media (width < 1400px) {

.container8{
  /* grid-template-columns: 1fr; */
}

.people{

  /* gap: 1rem; */
  padding: 1rem;

}

}

@import url("//fonts.googleapis.com/css?family=Pacifico&text=Pure");
@import url("//fonts.googleapis.com/css?family=Roboto:700&text=css");
@import url("//fonts.googleapis.com/css?family=Kaushan+Script&text=!");

body {
  min-height: 450px;
  height: 100vh;
  margin: 0;
  background: radial-gradient(circle, #0077ea, #1f4f96, #1b2949, #000);
}

.stage {
  height: 300px;
  width: 500px;
  margin: auto;
  position: relative;
  top: 0;
  /* right: 0; */
  /* bottom: 0; */
  /* left: 0; */
  perspective: 9999px;
  transform-style: preserve-3d;
}

.layer {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  transform-style: preserve-3d;
  animation: ಠ_ಠ 2s infinite alternate ease-in-out -5s;
  animation-fill-mode: forwards;
  transform: rotateY(20deg) rotateX(0deg) translateZ(0);

}



.layer:nth-child(1):after {
  transform: translateZ(0px);
}

.layer:nth-child(2):after {
  transform: translateZ(-1.5px);
}

.layer:nth-child(3):after {
  transform: translateZ(-3px);
}

.layer:nth-child(4):after {
  transform: translateZ(-4.5px);
}

.layer:nth-child(5):after {
  transform: translateZ(-6px);
}

.layer:nth-child(6):after {
  transform: translateZ(-7.5px);
}

.layer:nth-child(7):after {
  transform: translateZ(-9px);
}

.layer:nth-child(8):after {
  transform: translateZ(-10.5px);
}

.layer:nth-child(9):after {
  transform: translateZ(-12px);
}

.layer:nth-child(10):after {
  transform: translateZ(-13.5px);
}

.layer:nth-child(11):after {
  transform: translateZ(-15px);
}

.layer:nth-child(12):after {
  transform: translateZ(-16.5px);
}

.layer:nth-child(13):after {
  transform: translateZ(-18px);
}

.layer:nth-child(14):after {
  transform: translateZ(-19.5px);
}

.layer:nth-child(15):after {
  transform: translateZ(-21px);
}

.layer:nth-child(16):after {
  transform: translateZ(-22.5px);
}

.layer:nth-child(17):after {
  transform: translateZ(-24px);
}

.layer:nth-child(18):after {
  transform: translateZ(-25.5px);
}

.layer:nth-child(19):after {
  transform: translateZ(-27px);
}

.layer:nth-child(20):after {
  transform: translateZ(-28.5px);
}

.layer:nth-child(n+10):after {
  -webkit-text-stroke: 3px rgba(0, 0, 0, 0.25);
}

.layer:nth-child(n+11):after {
  -webkit-text-stroke: 15px dodgerblue;
  text-shadow: 6px 0 6px #00366b, 5px 5px 5px #002951, 0 6px 6px #00366b;
}

.layer:nth-child(n+12):after {
  -webkit-text-stroke: 15px #0077ea;
}

.layer:last-child:after {
  -webkit-text-stroke: 17px rgba(0, 0, 0, 0.1);
}

.layer:first-child:after {
  color: #fff;
  text-shadow: none;
}

@keyframes ಠ_ಠ {
  100% {
    transform: rotateY(-1deg) rotateX(1deg);
  }
}


.muneco{
  transition: all .3s ease;
}

.muneco:hover{
  transform: scale(1.1);
  -webkit-filter: drop-shadow(5px 5px 5px #fffb00);
  cursor: pointer;

}

.key:hover{
  transform: scale(1.1);
}

</style>
