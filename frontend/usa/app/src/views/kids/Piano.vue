<template>

  <div style="width: 100vw; display: flex;justify-content: center; max-width: 900px;margin: auto;padding: .5rem;">

    <div class="piano"  style="width: max-content;aspect-ratio: 16 / 12 ;background-color: red;	box-shadow: inset 9px 9px 9px yellow, inset -2px -2px 5px rgba(0,0,0,.1), 2px 2px 10px rgba(0,0,0,.1);
 max-width: 50rem;display: flex;flex-direction: column;gap: 1rem;">

    <div style=" width: 100%;background-color: #199690;height: 50%;border-radius: 2rem;box-shadow: inset 9px 9px 9px rgba(255,255,255,.5), inset -2px -2px 5px rgba(0,0,0,.1), 2px 2px 10px rgba(0,0,0,.1); overflow: hidden; display: flex;padding: 1rem;"> <img src="/images/personajes.png" alt="" style="width: 100%;object-fit: contain;"></div>

    <div style=" width: 100%;;height: 50%;;overflow: hidden;display: flex;padding: 0;
">



      <section id="main" style="height: 100%;background-color: black;border-radius: 1rem; width: 100%;min-width: 100%;">
        <div class="keys" style="">
          <div data-key="65" style="background-color: #e26c0c;" class="key" data-note="C" @click="playNoteMouse">

          </div>
          <div data-key="87"   class="key sharp" data-note="C#" @click="playNoteMouse">

          </div>
          <div data-key="83" style="background-color: #d12b11;"  class="key" data-note="D" @click="playNoteMouse">

          </div>
          <div data-key="69"  fca61b class="key sharp" data-note="D#" @click="playNoteMouse">

          </div>
          <div data-key="68" style="background-color: #faa516;" class="key" data-note="E" @click="playNoteMouse">

          </div>
          <div data-key="70"  style="background-color: #007657;"  class="key" data-note="F" @click="playNoteMouse">

          </div>
          <div data-key="84" class="key sharp" data-note="F#" @click="playNoteMouse">

          </div>
          <div data-key="71"  style="background-color: #7e9e19;" class="key" data-note="G" @click="playNoteMouse">

          </div>
          <div data-key="89" class="key sharp" data-note="G#" @click="playNoteMouse">

          </div>
          <div data-key="72"  style="background-color: #1393b0;"  class="key" data-note="A" @click="playNoteMouse">

          </div>
          <div data-key="85" class="key sharp" data-note="A#" @click="playNoteMouse">

          </div>
          <div data-key="74" class="key" data-note="B" @click="playNoteMouse">

          </div>


        </div>

        <!-- Audios para cada tecla -->
        <audio data-key="65" src="http://carolinegabriel.com/demo/js-keyboard/sounds/040.wav"></audio>
        <audio data-key="87" src="http://carolinegabriel.com/demo/js-keyboard/sounds/041.wav"></audio>
        <audio data-key="83" src="http://carolinegabriel.com/demo/js-keyboard/sounds/042.wav"></audio>
        <audio data-key="69" src="http://carolinegabriel.com/demo/js-keyboard/sounds/043.wav"></audio>
        <audio data-key="68" src="http://carolinegabriel.com/demo/js-keyboard/sounds/044.wav"></audio>
        <audio data-key="70" src="http://carolinegabriel.com/demo/js-keyboard/sounds/045.wav"></audio>
        <audio data-key="84" src="http://carolinegabriel.com/demo/js-keyboard/sounds/046.wav"></audio>
        <audio data-key="71" src="http://carolinegabriel.com/demo/js-keyboard/sounds/047.wav"></audio>
        <audio data-key="89" src="http://carolinegabriel.com/demo/js-keyboard/sounds/048.wav"></audio>
        <audio data-key="72" src="http://carolinegabriel.com/demo/js-keyboard/sounds/049.wav"></audio>
        <audio data-key="85" src="http://carolinegabriel.com/demo/js-keyboard/sounds/050.wav"></audio>
        <audio data-key="74" src="http://carolinegabriel.com/demo/js-keyboard/sounds/051.wav"></audio>
        <audio data-key="75" src="http://carolinegabriel.com/demo/js-keyboard/sounds/052.wav"></audio>
        <audio data-key="79" src="http://carolinegabriel.com/demo/js-keyboard/sounds/053.wav"></audio>
        <audio data-key="76" src="http://carolinegabriel.com/demo/js-keyboard/sounds/054.wav"></audio>
        <audio data-key="80" src="http://carolinegabriel.com/demo/js-keyboard/sounds/055.wav"></audio>
        <audio data-key="186" src="http://carolinegabriel.com/demo/js-keyboard/sounds/056.wav"></audio>
      </section>


    </div>

  </div>
  </div>

</template>


<script setup>
import { onMounted, ref } from 'vue';

// Referencia para actualizar el display de la nota que se está reproduciendo
const nowplaying = ref(null);

// Función para reproducir la nota al presionar una tecla
function playNote(e) {
  const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
  const key = document.querySelector(`.key[data-key="${e.keyCode}"]`);
  if (!key) return;
  const noteName = key.getAttribute("data-note");
  key.classList.add("playing");
  if (nowplaying.value) nowplaying.value.innerHTML = noteName;
  audio.currentTime = 0;
  audio.play();
}

// Función para reproducir la nota al hacer clic con el mouse
function playNoteMouse(e) {
  const key = e.currentTarget;
  const keyCode = key.getAttribute("data-key");
  const audio = document.querySelector(`audio[data-key="${keyCode}"]`);
  if (!audio) return;
  const noteName = key.getAttribute("data-note");
  key.classList.add("playing");
  if (nowplaying.value) nowplaying.value.innerHTML = noteName;
  audio.currentTime = 0;
  audio.play();
}

// Función para quitar la clase "playing" al finalizar la transición
function removeTransition(e) {
  if (e.propertyName !== 'transform') return;
  e.currentTarget.classList.remove("playing");
}

onMounted(() => {
  // Escucha el evento de teclado
  window.addEventListener("keydown", playNote);

  // Agrega el evento para remover la clase "playing" al terminar la transición
  const keys = document.querySelectorAll(".key");
  keys.forEach(key => {
    key.addEventListener("transitionend", removeTransition);
  });

  // Opcional: agrega un delay en la transición de aparición de las pistas (hints)
  const hints = document.querySelectorAll(".hints");
  hints.forEach((hint, index) => {
    hint.style.transitionDelay = `${index * 50}ms`;
  });
});
</script>


<style scoped>


html {
  background: #000;
  font-family: 'Noto Serif', serif;
  -webkit-font-smoothing: antialiased;
  text-align: center;
}

video#bgvid {
  position: fixed;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: -100;
  transform: translateX(-50%) translateY(-50%);
  background-size: cover;
}

header {
  position: relative;
  margin: 30px 0;
}

header:after {
  content: '';
  width: 460px;
  height: 15px;
  background: url(images/intro-div.svg) no-repeat center;
  display: inline-block;
  text-align: center;
  background-size: 70%;
}

h1 {
  color: #fff;
  font-size: 50px;
  font-weight: 400;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin: 0;
}

h2 {
  color: #fff;
  font-size: 24px;
  font-style: italic;
  font-weight: 400;
  margin: 0 0 30px;
}

.nowplaying {
  font-size: 120px;
  line-height: 1;
  color: #eee;
  text-shadow: 0 0 5rem #028ae9;
  transition: all 0.07s ease;
  min-height: 120px;
}

.keys {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 100%;
  position: relative;
  margin: 0 auto;
  /* background-color: green; */

  cursor: pointer; /* Se muestra el cursor para indicar interactividad */
}

.key {
  position: relative;
  border: 4px solid black;
  border-radius: 1rem;
  transition: all 0.07s ease;
  display: block;
  box-sizing: border-box;
  z-index: 2;
}

.key:not(.sharp) {
  float: left;
  width: 14.28%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
}

.key.sharp {
  position: absolute;
  width: 10%;
  height: 60%;
  background: #000;
  color: #eee;
  top: 0;
  z-index: 3;
}

.key[data-key="87"] {
  left: 9%
}

.key[data-key="69"] {
  left: 23%;
}

.key[data-key="84"] {
  left: 51%;
}

.key[data-key="89"] {
  left: 65%;
}

.key[data-key="85"] {
  left: 80%;
}


.playing {
  transform: scale(0.95);
  border-color: #028ae9;
  box-shadow: 0 0 1rem #028ae9;
}

.hints {
  display: block;
  width: 100%;
  opacity: 0;
  position: absolute;
  bottom: 7px;
  transition: opacity 0.3s ease-out;
  font-size: 20px;
}

.keys:hover .hints {
  opacity: 1;
}

.key:hover{
  transform: scale(.97);
}

.piano{
  padding:2rem;
  border-radius: 3rem;
}


@media (width < 700px) {

.piano{
  padding: 1rem;
  border-radius: 2rem;
}

}
</style>
