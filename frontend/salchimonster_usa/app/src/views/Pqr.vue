<template>
    <!-- Primer Diálogo -->
    <Dialog class="dialog-custom" v-model:visible="visibleDialog" modal>
        <div class="dialog-content">
            <h4 style="font-weight: 400;">Hemos recibido su solicitud y ha quedado registrada con el id </h4>
            <br>
            <b>
                <p class="last-id">{{ last_id }}</p>
            </b>

            <router-link to="/">
                <Button class="button-center" severity="info" label="Listo"></Button>
            </router-link>
        </div>
    </Dialog>

    <!-- Segundo Diálogo -->
    <Dialog class="dialog-custom" v-model:visible="visibleDialogGRacias" modal>
        <div class="dialog-content">
            <br>
            <b>
                <p class="gracias-message">Muchas gracias</p>
            </b>

            <router-link to="/">
                <Button class="button-center" severity="info" label="Listo"></Button>
            </router-link>
        </div>
    </Dialog>


    <div class="fondo">

        <img src="https://backend.salchimonster.com/read-product-image/600/site-4" alt="">

    </div>

    <!-- Formulario Principal -->
    <div class="main-container">
        <h1 style="color: white;" class="title">🔥 <b>MONSTER AYUDA</b> 🔥</h1>
        <h2 class="subtitle"><b>Cada día mejoramos</b></h2>
        <img src="https://www.salchimonster.com/assets/5-86724fd3.png" alt="Monster Ayuda" class="main-image">

        <div class="form-container">
            <!-- Selección de Tipo de Requerimiento -->
            <div class="form-input">
                <h3 class="field">¿Cómo te podemos ayudar?</h3>
                <Select class="select-uppercase" v-model="selectedType" optionValue="id"
                    :options="types.filter(t => t.show_on_web)" optionLabel="name"></Select>
            </div>

            <!-- Selección de Clasificación de Inconveniente -->
            <div class="form-input" v-if="selectedType && selectedType != 8">
                <h3 class="field">Por favor clasifica tu inconveniente</h3>
                <Select class="select-full" :options="tags" v-model="selecte_tag">
                    <template #option="option">
                        <div class="option-content">
                            <Tag :style="`background-color:${option.option.color}`" class="tag-option"></Tag>
                            <h3 class="option-text">{{ option.option.name }}</h3>
                        </div>
                    </template>

                    <template #value="value">
                        <div class="option-content">
                            <Tag :style="`background-color:${value.value.color}`" class="tag-option"></Tag>
                            <h3 class="option-text">{{ value.value.name }}</h3>
                        </div>
                    </template>
                </Select>
            </div>

            <!-- Selección de Sede -->
            <div class="form-input" v-if="selectedType">
                <h3 class="field">Sede</h3>
                <Select class="select-full" :options="sites.filter(s => s.show_on_web)" v-model="selecteSite"
                    optionValue="site_id" optionLabel="site_name"></Select>
            </div>

            <!-- ID de la Orden -->
            <div class="form-input" v-if="selectedType == 9">
                <h3 class="field">ID de la orden ejemplo <b>BRE-0554</b></h3>
                <InputText v-random-hover-border-color v-model="orderId" class="input-full"
                    placeholder="Escriba el número de la orden"></InputText>
            </div>

            <!-- Calificación -->
            <!-- <div class="form-input rating-section" v-if="selectedType == 8 || selectedType == 9">
                <h3 class="field">Califícanos</h3>
                <Rating v-model="rating" :cancel="false"></Rating>
            </div> -->

            <!-- Comentarios -->
            <div class="form-input" v-if="selectedType">
                <h3 class="field">Comentarios</h3>
                <Textarea v-model="comments" rows="5" class="textarea-full"
                    placeholder="Deja tus comentarios"></Textarea>
            </div>

            <!-- Información del Usuario -->
            <div class="form-input" v-if="selectedType">
                <h3 class="field">Nombre</h3>
                <InputText v-model="userName" class="input-full" placeholder="Escriba su nombre por favor"></InputText>
            </div>

            <div class="form-input" v-if="selectedType">
                <h3 class="field">Número de teléfono</h3>
                <InputNumber :useGrouping="false" v-model="userPhone" class="input-"
                    placeholder="Escriba su número de teléfono">
                </InputNumber>
            </div>

            <div class="form-input" v-if="selectedType">
                <h3 class="field">Correo Electrónico</h3>
                <InputText :useGrouping="false" v-model="userEmail" class="input-"
                    placeholder="Escriba su Correo electrónico">
                </InputText>
            </div>

            <div class="form-input" v-if="selectedType">
                <h3 class="field">Dirección</h3>
                <InputText v-model="userAddress" class="input-full" placeholder="Escriba su dirección"></InputText>
            </div>

            <!-- Botón de Envío -->
            <div class="form-input button-container">
                <Button label="Enviar" class="" @click="handleSubmit"></Button>
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
const userEmail = ref('')
const userAddress = ref('');
const comments = ref('');
const rating = ref(null);
const tags = ref([{}]);

// const update = async () => {
//     pqrs.value = await pqrsService.getPqrsByPlaceId(1);
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
            channel_id: 1, // Ajustar según el canal,
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
            email:userEmail.value
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
/* Estilos para los Diálogos */
.dialog-custom {
    width: 30rem;
    background-color: white;
    margin: 1rem;
}

.dialog-content {
    height: auto;
    color: rgb(0, 0, 0);
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

/* Estilos para los textos dentro de los diálogos */
.last-id {
    width: auto;
    font-size: 3rem;
    text-align: center;
}

.gracias-message {
    width: auto;
    font-size: 3rem;
    text-align: center;
}

.fondo img {
    position: fixed;
    left: -5%;
    right: 0;
    top: 0;
    height: 120vh;
    object-fit: cover;
    width: 120%;
    z-index: -1;
    filter: blur(10px);
}




/* Estilos para los botones dentro de los diálogos */
.button-center {
    margin: 1rem auto 0 auto;
    font-weight: bold;
}

/* Estilos para el contenedor principal */
.main-container {
    max-width: 600px;
    margin: 0rem auto 0 auto;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background-color: #00000088;
    /* border-radius: 0.5rem; */
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Estilos para el título */
.title {
    margin-bottom: 0;
    font-size: 1.5rem;
    text-align: center;
}

/* Estilos para el subtítulo */
.subtitle {
    color: var(--p-primary-color);
    margin: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
    text-align: center;
}

/* Estilos para la imagen principal */
.main-image {
    width: 100%;
    max-width: 300px;
    margin: 1rem 0;
}

/* Estilos para el formulario */
.form-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Estilos para cada input del formulario */
.form-input {
    width: 100%;
    display: flex;
    flex-direction: column;
}

/* Estilos para los campos */
.field {
    margin: 0.5rem 0;
    font-weight: bold;
    color: white;
}

/* Estilos para los Selects con texto en mayúsculas */
.select-uppercase {
    width: 100%;
    text-transform: uppercase;
}

/* Estilos para los Selects de ancho completo */
.select-full {
    width: 100%;
}

/* Estilos para las opciones de los Selects */
.option-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

/* Estilos para los Tags dentro de los Selects */
.tag-option {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 50%;
}

/* Estilos para el texto de las opciones */
.option-text {
    margin: 0;
    font-size: 1rem;
}

/* Estilos para los Inputs y Textareas */
.input-full {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
}

.textarea-full {
    width: 100%;
    resize: none;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
}

/* Estilos para la sección de calificación */
.rating-section {
    padding: 1rem;
    background-color: #00f3ff29;
    border-radius: 0.25rem;
}

/* Estilos para el contenedor del botón de envío */
.button-container {
    display: flex;
    justify-content: flex-end;
}

/* Estilos para el botón de envío */
.button-send {
    font-weight: bold;
}

/* Animaciones existentes */
@keyframes an_show_actions {
    0% {
        opacity: 0;
        transform: translateX(20px);
    }

    100% {
        opacity: 1;
    }
}

@keyframes an_show_actions_2 {
    100% {
        opacity: 0;
        transform: translateX(20px);
    }

    0% {
        opacity: 1;
    }
}

.button-visible {
    animation: an_show_actions 0.3s ease;
}

.button-hide {
    animation: an_show_actions_2 0.3s ease;
}

/* Transición de fade */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

/* Estilos Generales */
body {
    font-family: Arial, sans-serif;
}

h2,
h3,
p,
b,
h3 {
    margin: 0;
    padding: 0;
}
</style>
