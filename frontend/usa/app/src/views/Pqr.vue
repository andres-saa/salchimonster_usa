<template>
  <!-- Primer Diálogo -->
  <Dialog class="dialog-custom" v-model:visible="visibleDialog" modal>
    <div class="dialog-content">
      <div class="dialog-icon success">
        <i class="pi pi-check-circle"></i>
      </div>
      <h4 class="dialog-title">¡Solicitud recibida!</h4>
      <p class="dialog-subtitle">Ha quedado registrada con el id</p>
      <p class="last-id">{{ last_id }}</p>

      <router-link to="/">
        <Button class="button-center" severity="info" label="Listo" />
      </router-link>
    </div>
  </Dialog>

  <!-- Segundo Diálogo -->
  <Dialog class="dialog-custom" v-model:visible="visibleDialogGRacias" modal>
    <div class="dialog-content">
      <div class="dialog-icon heart">
        <i class="pi pi-heart"></i>
      </div>
      <h4 class="dialog-title">¡Muchas gracias!</h4>
      <p class="gracias-message">Tu opinión nos ayuda a mejorar ❤️</p>

      <router-link to="/">
        <Button class="button-center" severity="info" label="Listo" />
      </router-link>
    </div>
  </Dialog>

  <!-- Fondo con degradados -->
  <div class="bg-wrapper">
    <div class="bg-gradient"></div>
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <!-- Tu imagen de fondo desenfocada sigue presente -->
    <div class="fondo">
      <img src="https://backend.salchimonster.com/read-product-image/600/site-4" alt="" />
    </div>
  </div>

  <!-- Contenido principal -->
  <div class="main-container">
    <header class="hero">
      <div class="badge">MONSTER</div>
      <h1 class="title">🔥 <b>MONSTER AYUDA</b> 🔥</h1>
      <h2 class="subtitle"><b>Cada día mejoramos</b></h2>
      <img
        src="https://www.salchimonster.com/assets/5-86724fd3.png"
        alt="Monster Ayuda"
        class="main-image"
      />
    </header>

    <!-- Tarjeta glass -->
    <div class="form-card">
      <div class="form-container">
        <!-- Selección de Tipo de Requerimiento -->
        <div class="form-input">
          <label class="field">¿Cómo te podemos ayudar?</label>
          <Select
            class="select-uppercase fancy-input"
            v-model="selectedType"
            optionValue="id"
            :options="types.filter(t => t.show_on_web)"
            optionLabel="name"
          />
        </div>

        <!-- Selección de Clasificación de Inconveniente -->
        <div class="form-input" v-if="selectedType && selectedType != 8">
          <label class="field">Por favor clasifica tu inconveniente</label>

          <Select class="select-full fancy-input" :options="tags" v-model="selecte_tag">
            <template #option="option">
              <div class="option-content">
                <Tag :style="`background-color:${option.option.color}`" class="tag-option" />
                <h3 class="option-text">{{ option.option.name }}</h3>
              </div>
            </template>

            <template #value="value">
              <div class="option-content">
                <Tag :style="`background-color:${value.value.color}`" class="tag-option" />
                <h3 class="option-text">{{ value.value.name }}</h3>
              </div>
            </template>
          </Select>
        </div>

        <!-- Selección de Sede -->
        <div class="form-input" v-if="selectedType">
          <label class="field">Sede</label>
          <Select
            class="select-full fancy-input"
            :options="sites.filter(s => s.show_on_web)"
            v-model="selecteSite"
            optionValue="site_id"
            optionLabel="site_name"
          />
        </div>

        <!-- ID de la Orden -->
        <div class="form-input" v-if="selectedType == 9">
          <label class="field">
            ID de la orden (ejemplo <b>BRE-0554</b>)
          </label>
          <InputText
            v-random-hover-border-color
            v-model="orderId"
            class="input-full fancy-input"
            placeholder="Escriba el número de la orden"
          />
        </div>

        <!-- Comentarios -->
        <div class="form-input" v-if="selectedType">
          <label class="field">Comentarios</label>
          <Textarea
            v-model="comments"
            rows="5"
            class="textarea-full fancy-input"
            placeholder="Deja tus comentarios"
          />
          <small class="hint">Sé específico para ayudarte más rápido.</small>
        </div>

        <!-- Información del Usuario -->
        <div class="form-grid" v-if="selectedType">
          <div class="form-input">
            <label class="field">Nombre</label>
            <InputText
              v-model="userName"
              class="input-full fancy-input"
              placeholder="Escriba su nombre por favor"
            />
          </div>

          <div class="form-input">
            <label class="field">Número de teléfono</label>
            <InputNumber
              :useGrouping="false"
              v-model="userPhone"
              class="input-full fancy-input"
              placeholder="Escriba su número de teléfono"
            />
          </div>

          <div class="form-input">
            <label class="field">Correo Electrónico</label>
            <InputText
              v-model="userEmail"
              class="input-full fancy-input"
              placeholder="Escriba su correo electrónico"
            />
          </div>

          <div class="form-input form-input--full">
            <label class="field">Dirección</label>
            <InputText
              v-model="userAddress"
              class="input-full fancy-input"
              placeholder="Escriba su dirección"
            />
          </div>
        </div>

        <!-- Botón de Envío -->
        <div class="form-input button-container">
          <Button
            label="Enviar"
            class="button-send glow"
            severity="help"
            @click="handleSubmit"
            icon="pi pi-send"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// import { pqrsService } from '@/service/pqrs/pqrsService';
import { fetchService } from '@/service/utils/fetchService.js';
import { URI } from '@/service/conection';
import { InputNumber, InputText, Textarea, Select, Tag, Button, Dialog, Rating } from 'primevue';
import router from '@/router';

const last_id = ref('');
const selecte_tag = ref({});
const visibleDialog = ref(false);
const pqrs = ref([]);
const visibleDialogGRacias = ref(false);
const selectedType = ref(null);
const selecteSite = ref(null);
const sites = ref([]);
const types = ref([]);
const orderId = ref('');
const userName = ref('');
const userPhone = ref('');
const userEmail = ref('');
const userAddress = ref('');
const comments = ref('');
const rating = ref(null);
const tags = ref([{}]);

// const update = async () => {
//   pqrs.value = await pqrsService.getPqrsByPlaceId(1);
// };

const handleSubmit = async () => {
  // Validación de campos obligatorios
  if (!selectedType.value) {
    alert('Por favor, seleccione un tipo de requerimiento.');
    return;
  }
  if (selectedType.value == 9 && !orderId.value) {
    alert('Por favor, ingrese el ID de la orden.');
    return;
  }

  if (selectedType.value != 8 && !selecte_tag.value) {
    alert('Por favor, clasifica tu inconveniente.');
    return;
  }

  if (selectedType.value != 8 && !comments.value) {
    alert('Por favor, cuéntenos lo sucedido.');
    return;
  }

  if (selectedType.value != 8 && (!userName.value || !userPhone.value || !userAddress.value)) {
    alert('Por favor, complete los campos obligatorios (nombre, teléfono, direccion y Correo Electronico).');
    return;
  }

  if (!selecteSite.value) {
    alert('Por favor, seleccione la sede.');
    return;
  }

  if (selectedType.value == 8 && !rating.value) {
    alert('Por favor, seleccione una calificación.');
    return;
  }

  // Construcción del objeto de datos
  const data = {
    data: {
      reques_type_id: selectedType.value,
      content: comments.value || 'Sin comentarios',
      channel_id: 1, // Ajustar según el canal
      rating: rating.value || null,
      site_id: selecteSite.value || null,
      order_id: orderId.value || null,
      network_id: 4,
      tag_id: selecte_tag.value?.id || 7,
      restaurant_id: 1
    },
    user: {
      user_name: userName.value || '',
      user_phone: userPhone.value?.toString() || '',
      user_address: userAddress.value || '',
      site_id: selecteSite.value || null,
      email: userEmail.value
    }
  };

  // Envío de datos
  try {
    const result = await fetchService.post(`${URI}/create-pqr`, data);
    last_id.value = result?.pqr_id[0]?.id;
    if (selectedType.value == 8) {
      visibleDialogGRacias.value = true;
    } else {
      visibleDialog.value = true;
    }
  } catch (error) {
    console.error('Error al enviar la solicitud:', error);
    alert('Hubo un error al enviar su solicitud. Por favor, intente nuevamente.');
  }
};

onMounted(async () => {
  // update();
  types.value = await fetchService.get(`${URI}/get-all-pqrs-types`);
  sites.value = await fetchService.get(`${URI}/sites`);
  tags.value = await fetchService.get(`${URI}/get-all-pqr-tags`);
  selectedType.value = 9;
});
</script>
<style scoped>
/* --------- Fondo light con degradados pastel --------- */
.bg-wrapper {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: -2;
}

.bg-gradient {
  position: absolute;
  inset: -20%;
  background: radial-gradient(60% 60% at 30% 20%, #93c5fd55 0%, transparent 60%),
              radial-gradient(50% 50% at 80% 0%, #a78bfa44 0%, transparent 60%),
              radial-gradient(45% 45% at 10% 90%, #fcd34d44 0%, transparent 60%),
              linear-gradient(135deg, #ffffff 0%, #f9fafb 40%, #f3f4f6 100%);
  filter: blur(25px) saturate(120%);
  animation: float-bg 16s ease-in-out infinite;
}

@keyframes float-bg {
  0% { transform: translate3d(0,0,0) scale(1.02); }
  50% { transform: translate3d(0,-10px,0) scale(1.03); }
  100% { transform: translate3d(0,0,0) scale(1.02); }
}

/* orbes decorativos */
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: .25;
  mix-blend-mode: multiply;
  animation: drift 18s ease-in-out infinite;
}
.orb-1 { width: 24rem; height: 24rem; background: #a5b4fc; top: 10%; left: -6%; }
.orb-2 { width: 20rem; height: 20rem; background: #7dd3fc; bottom: 8%; right: -4%; animation-delay: -4s; }
.orb-3 { width: 18rem; height: 18rem; background: #fde68a; bottom: 30%; left: 60%; animation-delay: -8s; }

@keyframes drift {
  0% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-15px) translateX(10px); }
  100% { transform: translateY(0) translateX(0); }
}

/* imagen difuminada base */
.fondo img {
  position: fixed;
  left: -5%;
  right: 0;
  top: 0;
  height: 120vh;
  object-fit: cover;
  width: 120%;
  z-index: -1;
  filter: blur(16px) brightness(1.1);
  opacity: .25;
}

/* --------- Contenedor principal --------- */
.main-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* --------- Hero --------- */
.hero {
  text-align: center;
  color: #1f2937;
  margin-top: .5rem;
}

.badge {
  display: inline-block;
  padding: .35rem .7rem;
  font-weight: 700;
  letter-spacing: .08em;
  border-radius: 999px;
  background: linear-gradient(90deg, #38bdf8, #a78bfa);
  color: white;
  font-size: .8rem;
  margin-bottom: .5rem;
  box-shadow: 0 6px 20px #38bdf833, 0 6px 20px #a78bfa33;
}

.title {
  margin: .25rem 0 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  text-wrap: balance;
}

.subtitle {
  color: #4f46e5;
  margin: .15rem 0 1rem;
  font-size: clamp(1rem, 2.4vw, 1.25rem);
  font-weight: 600;
}

/* --------- Tarjeta glass light --------- */
.form-card {
  width: 100%;
  margin-top: 1.2rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .08);
  overflow: hidden;
}

.form-container {
  padding: clamp(1rem, 2.2vw, 1.6rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* --------- Inputs --------- */
.form-input { width: 100%; display: flex; flex-direction: column; gap: .5rem; }
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 720px) {
  .form-grid { grid-template-columns: 1fr 1fr; }
  .form-input--full { grid-column: 1 / -1; }
}

.field {
  margin: 0;
  font-weight: 700;
  color: #374151;
  font-size: .95rem;
}

.hint {
  color: #6b7280;
  font-size: .8rem;
}

.fancy-input,
.input-full,
.textarea-full,
.select-full,
.select-uppercase {
  border-radius: .6rem;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  color: #111827;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.fancy-input:focus-within,
.input-full:focus,
.textarea-full:focus {
  border-color: #38bdf8 !important;
  box-shadow: 0 0 0 3px #38bdf833;
}

.textarea-full {
  resize: vertical;
  min-height: 110px;
}

/* Opciones del Select */
.option-content { display: flex; align-items: center; gap: .75rem; }
.tag-option { height: 1.1rem; width: 1.1rem; border-radius: 50%; }

/* --------- Botón enviar --------- */
.button-container { display: flex; justify-content: flex-end; }

.button-send {
  font-weight: 700;
  border-radius: .7rem;
  padding: .7rem 1.1rem;
}

.glow :deep(button),
.glow {
  background: linear-gradient(90deg, #38bdf8, #a78bfa);
  border: none;
  color: white;
  box-shadow: 0 8px 20px #38bdf855, 0 8px 20px #a78bfa55;
  transition: transform .08s ease, filter .2s ease;
}
.glow :deep(button:hover) { filter: brightness(1.08); transform: translateY(-1px); }
.glow :deep(button:active) { transform: translateY(0); }

/* --------- Diálogos --------- */
.dialog-custom {
  width: min(32rem, calc(100vw - 2rem));
  background-color: transparent;
  margin: 1rem;
}
.dialog-content {
  background: #ffffffee;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem 1.2rem;
  color: #1f2937;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .12);
}
.dialog-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  margin-bottom: .75rem;
}
.dialog-icon.success { background: #bbf7d0; color: #166534; }
.dialog-icon.heart   { background: #fecdd3; color: #be123c; }

.dialog-title {
  font-size: 1.2rem;
  margin: .25rem 0 .25rem;
  font-weight: 700;
  text-align: center;
}
.dialog-subtitle { margin: 0 0 .25rem; text-align: center; }

.last-id,
.gracias-message {
  font-size: 2rem;
  text-align: center;
  margin: .5rem 0 1rem;
  background: linear-gradient(90deg, #38bdf8, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Animaciones fade */
.fade-enter-active, .fade-leave-active { transition: opacity .5s; }
.fade-enter, .fade-leave-to { opacity: 0; }

/* Texto base */
body { font-family: Inter, Arial, sans-serif; color: #111827; }
</style>
