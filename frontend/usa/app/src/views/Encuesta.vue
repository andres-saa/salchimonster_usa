<!-- Encuesta.vue -->
<template>
  <section class="survey">
    <!-- 1. Título -->
    <h2 class="title">{{ encuesta.name }}</h2>

    <!-- 2. Preguntas -->
    <div
      v-for="question in encuesta.questions"
      :key="question.id"
      class="question-block"
    >
      <h3 class="question-text">{{ question.question }}</h3>

      <!-- Opciones → exclusivas (RadioButton) -->
      <div class="options">
        <div
          v-for="option in question.options"
          :key="option.id"
          class="option-card"
        >
          <img style="width: 100%;"
            class="option-img"
            :src="`${URI}/read-photo-product/${option.image}`"
            :alt="option.option"
          />

          <div class="option-info">
            <RadioButton
              v-model="selected[question.id]"
              :value="option.id"
              :inputId="`q${question.id}o${option.id}`"
            />
            <label :for="`q${question.id}o${option.id}`">{{ option.option }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Botón CONTINUAR (habilitado solo si todo está contestado) -->
    <div class="actions">
      <Button
        label="Continuar"
        icon="pi pi-arrow-right"
        class="p-button-lg"
        :disabled="!todoContestadas"
        @click="showDialog = true"
      />
    </div>

    <!-- 4. Diálogo para capturar datos del usuario -->
    <Dialog style="max-width: 90vw;"
      v-model:visible="showDialog"
      header="Tus datos antes de votar"
      modal
      :style="{ width: '370px' }"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="name">Nombre</label>
          <InputText id="name" v-model.trim="user.user_name" />
        </div>
        <div class="field">
          <label for="phone">Teléfono</label>
          <InputText id="phone" v-model.trim="user.user_phone" />
        </div>
        <div class="field">
          <label for="address">Dirección</label>
          <InputText id="address" v-model.trim="user.user_address" />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <InputText id="email" v-model.trim="user.email" />
        </div>
      </div>

      <template #footer>
        <Button
          label="Enviar"
          icon="pi pi-send"
          :disabled="enviando || !datosCompletos"
          @click="enviarRespuestas"
        />
      </template>
    </Dialog>

    <Dialog :closable="false"
      v-model:visible="showThankDialog"
      header="¡Gracias por participar!"
      modal
      :style="{ width: '340px' }"
    >
      <div class="thanks-content">
        <p>Tu votación ha sido registrada correctamente, muchas gracias</p>
        <p>Este es tu código reclamas tu adición de chicharrón</p>

        <h3 class="code">{{ confirmCode }}</h3>
      </div>

      <template #footer>
        <RouterLink to="/">

            <Button
                label="Listo, ya guarde' mi codigo"
                class="p-button-text"
                @click="showThankDialog = false"
                />

        </RouterLink>
    
      </template>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { URI } from '@/service/conection'
import { fetchService } from '@/service/utils/fetchService'
import { Dialog } from 'primevue'
import {Button} from 'primevue'
import {Checkbox} from 'primevue'
import {RadioButton} from 'primevue'
import {InputText} from 'primevue'
interface Option { id: number; option: string; image: string }
interface Question { id: number; question: string; options: Option[] }
interface Encuesta { id: number; name: string; questions: Question[] }

const encuesta = ref<Encuesta>({ id: 0, name: '', questions: [] })
const showThankDialog = ref(false)  // nuevo
const confirmCode     = ref('')     // nuevo
/* ---- Selección exclusiva ---- */
const selected = reactive<Record<number, number | null>>({})

/* ---- Datos del usuario ---- */
const user = reactive({
  user_name: '',
  user_phone: '',
  user_address: '',
  email: '',
  wa_user_id: '', // opcional
  site_id: 0      // la sede no se usa, lo dejamos en 0
})

/* ---- Estados ---- */
const showDialog = ref(false)
const enviando   = ref(false)

/* ---- Carga de encuesta ---- */
onMounted(async () => {
  encuesta.value = await fetchService.get<Encuesta>(`${URI}/encuestas`)
  encuesta.value.questions.forEach(q => (selected[q.id] = null))
})

/* ---- Computados para habilitar botones ---- */
const todoContestadas = computed(() =>
  encuesta.value.questions.every(q => selected[q.id] !== null)
)

const datosCompletos = computed(() =>
  user.user_name && user.user_phone && user.user_address && user.email
)

/* ---- Envío ---- */
async function enviarRespuestas () {
  enviando.value = true
  try {
    const payload = {
      encuesta_id: encuesta.value.id,
      user,
      select: Object.entries(selected).map(([qid, oid]) => ({
        question_id: Number(qid),
        option_id: oid
      }))
    }
    const respuesta = await fetchService.post(`${URI}/votar`, payload)
 

/* Si el backend devuelve texto plano, usa String(respuesta) */
    confirmCode.value = typeof respuesta === 'string' ? respuesta : respuesta.code

    showDialog.value = false
     // cerrar diálogo de datos
    showThankDialog.value = true      // abrir diálogo de gracias

  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.survey {

  margin: 0 auto;
  padding: 1rem;
}
.title   { text-align: center; font-size: 1.6rem; margin-bottom: 1.5rem;width: 100%; }
.question-block { margin-bottom: 2rem ;}
.question-text  { font-size: 1.15rem; margin-bottom: 1rem;text-align: center;font-weight: 500;}

/* ---- Opciones en grid con CSS puro ---- */
.options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}
.option-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
  overflow: hidden;
  flex: 1 1 calc(25% - 1rem);
  max-width: calc(25% - 1rem);
  display: flex;
  flex-direction: column;
}
.option-img  { width: 100%; object-fit: cover; }
.option-info { display: flex; align-items: end; gap: .5rem; padding: .75rem; font-size: .9rem;height: 100%; }

/* ---- Breakpoints ---- */
@media (max-width: 1023px) { .option-card{ flex-basis: calc(33.333% - 1rem); max-width: calc(33.333% - 1rem);} }
@media (max-width: 767px)  { .option-card{ flex-basis: calc(50% - 1rem);  max-width: calc(50% - 1rem);} }
@media (max-width: 479px)  { .option-card{ flex-basis: 100%;             max-width: 100%;            } }

.actions { text-align: center; margin-top: 1.5rem; }
.field   { margin-bottom: 1rem; display: flex;flex-direction: column;}
</style>
