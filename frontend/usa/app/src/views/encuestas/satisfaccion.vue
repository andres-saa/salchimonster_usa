<!-- Encuesta.vue (sin cambios de estilos/estructura) -->
<template>
  <!-- Fondo fijo -->
  <div style="position: fixed; height: 100%; display: flex; z-index: -1; width: 100vw; left: 0; top: 0; background-size: cover; background-image: url('https://backend.salchimonster.com/read-photo-product/9I1nbamZ');"></div>

  <!-- Diálogo principal -->
  <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
    <div style="width: max-content; display: flex; gap: 2rem; align-items: center; justify-content: center;">
      <!-- Sección encuesta -->
      <section class="survey" style="max-width: 50rem; background-color: #F8F7F4DE; min-height: 100vh; padding-bottom: 4rem;overflow: hidden;">
        <img style="max-width: 100%;" src="https://images.leadconnectorhq.com/image/f_webp/q_100/r_1000/u_https://storage.googleapis.com/highlevel-backend.appspot.com/location/84rX52L5i2x2OiG2l449/form/WbbEakm2DSApvxqfGpX9/header-image/23c28e3c-1f1e-4ff0-aab6-5530b6e94228.png" alt="header" />
        <h2 class="title">{{ encuesta.name }}</h2>

        <!-- BLOQUE PREGUNTAS -->
        <div v-for="q in encuesta.questions" :key="q.id" class="question-block">
          <!-- Preguntas con opciones -->
          <template v-if="q.options?.length">
            <h3 class="question-text">{{ q.question }}</h3>
            <div class="options">
              <div v-for="opt in q.options" :key="opt.id" class="option-card">
                <div class="option-info">
                  <RadioButton v-model="selected[q.id]" :value="opt.id" :inputId="`q${q.id}o${opt.id}`" />
                  <label :for="`q${q.id}o${opt.id}`">{{ opt.option }}</label>
                </div>
              </div>
            </div>
          </template>

          <!-- Nombre del colaborador -->
          <template v-else-if="q.id === 5">
            <h3 class="question-text">{{ q.question }}</h3>
            <InputText v-model.trim="openText[q.id]" placeholder="Ej: Mateo" style="width: 100%;" />
          </template>

          <!-- Calificación + comentario -->
          <template v-else>
            <h3 class="question-text">¿En cual de nuestras sedes nos visitaste o realizaste tu pedido?</h3>
            <Select v-model="selectedSite" :options="sites.filter(s => s.google_review_link)" option-label="site_name" style="min-width: 100%; text-align: start;" placeholder="Selecciona una sede" class="rating-block" />

            <div class="rating-block">
              <h3 class="question-text">¿Qué calificación nos das (1-5)?</h3>
              <Rating v-model="rating" :cancel="false" :stars="5" />
            </div>

            <div v-if="rating !== 5 && rating" class="open-text">
              <h3 class="question-text">Queremos saber por qué no somos un 5 🥹 Indícanos cómo podemos mejorar nuestra experiencia 👇🏼 *</h3>
              <Textarea  rows="4" auto-resize style="width: 100%;" placeholder="Cuéntanos un poco más" v-model.trim="openText[4]" />
            </div>
          </template>
        </div>

        <!-- Botón continuar -->
        <div class="actions">
          <Button label="Continuar" icon="pi pi-arrow-right" class="p-button-lg" :disabled="!todoContestadas" @click="showDialog = true" />
        </div>

        <!-- Diálogo datos usuario -->
        <Dialog v-model:visible="showDialog" header="Datos para la entrega de tu premio" modal :style="{ width: '370px' }" style="max-width: 95vw;">
          <div class="p-fluid">
            <div class="field">
              <label for="name">Nombre</label>
              <InputText id="name" v-model.trim="user.user_name" />
            </div>
            <div class="field">
              <label for="phone">WhatsApp</label>
              <InputText id="phone" v-model.trim="user.user_phone" />
            </div>
            <div class="field">
              <label for="email">Email</label>
              <InputText id="email" v-model.trim="user.email" />
            </div>
            <div class="field">
              <label for="birth">Fecha de cumpleaños</label>
              <Calendar id="birth" v-model="user.user_birthdate" dateFormat="dd/mm/yy" showIcon />
            </div>
          </div>
          <template #footer>
            <Button label="Enviar" icon="pi pi-send" :disabled="enviando || !datosCompletos" @click="enviarRespuestas" />
          </template>
        </Dialog>

        <!-- Agradecimiento -->
        <Dialog v-model:visible="showThankDialog" :closable="false"  header="¡Gracias!" modal :style="{ width: '340px' }">
          <div class="thanks-content">
            <p>Este es tu código para reclamar tu premio</p>
            <h3 class="code">{{ confirmCode }}</h3>
          </div>
          <template #footer>
          
              <Button label="Listo, ya guardé mi código" style="color: white;"  @click="redirect" />
           
          </template>
        </Dialog>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Dialog } from 'primevue'
import { Button } from 'primevue'
import { RadioButton } from 'primevue'
import { InputText, Textarea } from 'primevue'
import Rating from 'primevue/rating'
import Calendar from 'primevue/calendar'
import { fetchService } from '@/service/utils/fetchService'
import { URI } from '@/service/conection'
import { Select } from 'primevue'
import router from '@/router'

// Sede seleccionada
const selectedSite = ref<{ site_id: number; google_review_link: string; site_name: string } | null>(null)

/* Tipos */
interface Option { id: number; option: string; image: string | null }
interface Question { id: number; question: string; options: Option[] | null }
interface Encuesta { encuesta_id: number; name: string; questions: Question[] }

/* Sedes */
const sites = [
  { site_id: 32, site_name: 'ACOPI YUMBO', google_review_link: '' },
  { site_id: 1, site_name: 'BRETAÑA', google_review_link: 'https://g.page/r/CVPK07myYU-QEAE/review' },
  { site_id: 4, site_name: 'JAMUNDI', google_review_link: 'https://g.page/r/CRASKJboY3-bEAE/review' },
  { site_id: 11, site_name: 'LAURELES', google_review_link: 'https://g.page/r/CbRRla_R03iaEAE/review' },
  { site_id: 29, site_name: 'CITY U', google_review_link: 'https://g.page/r/CVd_5ZPEhFmUEAE/review' },
  { site_id: 9, site_name: 'MONTES', google_review_link: 'https://g.page/r/CequTwBa-ekNEAE/review' },
  { site_id: 33, site_name: 'NEW JERSEY', google_review_link: '' },
  { site_id: 8, site_name: 'SUBA', google_review_link: 'https://g.page/r/CTKzi2Gi8m0AEAE/review' },
  { site_id: 10, site_name: 'KENNEDY', google_review_link: 'https://g.page/r/CeW5lIc9k1AGEAE/review' },
  { site_id: 34, site_name: 'SM CANEY', google_review_link: '' },
  { site_id: 7, site_name: 'MODELIA', google_review_link: 'https://g.page/r/CVd_5ZPEhFmUEAE/review' },
  { site_id: 30, site_name: 'USAQUEN', google_review_link: 'https://g.page/r/CVd_5ZPEhFmUEAE/review' },
  { site_id: 3, site_name: 'CANEY', google_review_link: 'https://g.page/r/CWeKby77TtSdEAE/review' },
  { site_id: 2, site_name: 'FLORA', google_review_link: 'https://g.page/r/CeOU7QwAXdj_EAE/review' }
]

/* JSON encuesta */
const encuestaJson: Encuesta = {
  encuesta_id: 2,
  name: `¡Ey! 🤘 Queremos saber qué tan brutal fue tu visita a Salchimonster. Esta encuesta te tomará solo 30 segundos, ¡lo prometemos! Al finalizar, te mandamos un regalo exclusivo a tu correo. 🎁`,
  questions: [
    {
      id: 2,
      question: '¿Viste algún anuncio publicitario en Facebook o Instagram que influyó en tu decisión de visitarnos? *',
      options: [
        { id: 3, image: null, option: 'No' },
        { id: 4, image: null, option: 'Sí' }
      ]
    },
    {
      id: 3,
      question: '¿Cómo nos conociste? *',
      options: [
        { id: 5, image: null, option: 'Ya los conocía / Soy cliente' },
        { id: 6, image: null, option: 'Recomendación de alguien' },
        { id: 7, image: null, option: 'Los vi mientras caminaba y entré' },
        { id: 8, image: null, option: 'Los encontré en Google' },
        { id: 9, image: null, option: 'Búsqueda en Tripadvisor / Opentable' }
      ]
    },
    {
      id: 5,
      question: '¿Podrías indicarnos el nombre de la persona que te atendió durante tu visita? *',
      options: null
    },
    {
      id: 4,
      question: 'Queremos saber por qué no somos un 5 🥹 Indícanos cómo podemos mejorar nuestra experiencia 👇🏼 *',
      options: null
    }
  ]
}

/* Estado */
const showSurvey = ref(true)
const encuesta = ref<Encuesta>(encuestaJson)
const rating = ref<number | null>(null)
const selected = reactive<Record<number, number | null>>({})
const openText = reactive<Record<number, string>>({})
const showDialog = ref(false)
const showThankDialog = ref(false)
const confirmCode = ref('')
const enviando = ref(false)

/* Usuario */
const user = reactive({
  user_name: '',
  user_phone: '',
  email: '',
  user_birthdate: '',
  site_id: 0,
  user_address:'sin direccion',
  wa_user_id: ''
})

// Inicializar respuestas
encuesta.value.questions.forEach(q => {
  if (q.options?.length) selected[q.id] = null
  else openText[q.id] = ''
})

/* Validaciones */
const todoContestadas = computed(() => {
  if (rating.value === null) return false

  const opcionesOk = [2, 3].every(id => selected[id] !== null)
  const colaboradorOk = openText[5]?.trim().length > 0
  const feedbackOk = rating.value === 5 || openText[4]?.trim().length > 0
  const sedeOk = !!selectedSite.value?.site_id

  return opcionesOk && colaboradorOk && feedbackOk && sedeOk
})

const datosCompletos = computed(() => user.user_name && user.user_phone && user.email && user.user_birthdate)

/* Envío respuestas *//* ─────────────── helpers ─────────────── */
function buildAnswers() {
  const answers: any[] = []

  // ① Preguntas con opciones
  ;[2, 3].forEach(id => {
    const q = encuesta.value.questions.find(q => q.id === id)
    const optId = selected[id]

    if (q && optId !== null) {
      const opt = q.options?.find(o => o.id === optId)
      answers.push({
        question_id: id,
        question: q?.question,
        option: opt         // objeto completo { id, option, image }
      })
    }
  })

  // ② Nombre del colaborador
  answers.push({
    question_id: 5,
    question: encuesta.value.questions.find(q => q.id === 5)?.question,
    text: openText[5]
  })

  // ③ Comentario adicional (solo si rating < 5)
  if (rating.value !== 5) {
    answers.push({
      question_id: 4,
      question: encuesta.value.questions.find(q => q.id === 4)?.question,
      text: openText[4]
    })
  }

  return answers
}
function buildSelect() {
  const arr: any[] = []

  /* Preguntas con opciones (ids 2 y 3) */
  ;[2, 3].forEach(id => {
    const q = encuesta.value.questions.find(q => q.id === id)
    const optId = selected[id]
    if (q && optId !== null) {
      const opt = q.options?.find(o => o.id === optId)
      arr.push({
        question_id: id,           // 👈 requerido por backend
        option_id  : optId,        // 👈 requerido por backend
        question   : q.question,   // extra
        option     : opt           // extra (objeto completo)
      })
    }
  })

  /* Nombre del colaborador (id 5) */
  arr.push({
    question_id: 5,
    text       : openText[5],                      // 👈 requerido
    question   : encuesta.value.questions.find(q => q.id === 5)?.question // extra
  })

  /* Comentario adicional (id 4) solo si rating < 5 */
  if (rating.value !== 5) {
    arr.push({
      question_id: 4,
      text       : openText[4],                    // 👈 requerido
      question   : encuesta.value.questions.find(q => q.id === 4)?.question // extra
    })
  }

  /* Puedes incluir también la calificación como un “pseudo-ítem” */
arr.push({
  question_id: 999,          // id ficticio
  text       : String(rating.value),  // ← cast a string
  question   : 'rating'
})

  return arr
}

/* ───────── envío ───────── */
async function enviarRespuestas() {
  enviando.value = true
  try {
    user.site_id = selectedSite.value?.site_id || 0

    const payload = {
      encuesta_id: encuesta.value.encuesta_id,  // 👈 requerido
      user,                             // 👈 requerido
      select: buildSelect(),            // 👈 requerido
      // Extras a nivel raíz (el backend los ignorará sin fallar)
      rating       : rating.value,
      selected_site: selectedSite.value
    }

    const resp = await fetchService.post(`${URI}/votar-encuesta`, payload)
    confirmCode.value   = typeof resp === 'string' ? resp : resp.code
    showDialog.value    = false
    showThankDialog.value = true
  } finally {
    enviando.value = false
  }
}


function redirect() {
  showThankDialog.value = false
  if (rating.value === 5 && selectedSite.value?.google_review_link) {
   
      window.open(selectedSite.value!.google_review_link, '_blank')
 
  } else {
    router.push('/')
  }
}
  

</script>

<style scoped>
* { color: rgb(0, 0, 0); }
.survey { width: 100%; margin: 0; }
.title { text-align: center; font-size: 1.3rem; margin-bottom: 1.25rem; font-weight: 500; padding: 1rem; }
.question-block { margin-bottom: 1.75rem; padding: 2rem; }
.question-text { font-size: 1rem; margin-bottom: .75rem; font-weight: 500; text-align: start; }
.options { display: flex; flex-direction: column; gap: .75rem; }
.option-card { display: flex; align-items: center; gap: .75rem; width: 100%; }
.option-info { display: flex; align-items: center; gap: .5rem; flex: 1; }
.rating-block { margin-bottom: 1.25rem; text-align: center; }
.open-text { margin-top: .5rem; width: 100%; }
.actions { margin-top: 1.5rem; text-align: center; }
:deep(.p-dialog-content) { overflow-y: auto; padding: 4rem; }
.field { margin-bottom: 1rem; display: flex; flex-direction: column; }
.thanks-content { text-align: center; }
.code { margin-top: .5rem; letter-spacing: .1em; }
@media (width < 1172px) {
   .muneco { display: none; }
   .survey{
    border-radius: 0;
   }
   
   }
</style>
