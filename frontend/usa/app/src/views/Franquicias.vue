<template>
    <!-- Diálogo de confirmación (al enviar el formulario) -->
    <Dialog class="dialog-container mx-4" v-model:visible="visibleDialog" modal>
        <div class="dialog-content">
            <h4>Hemos recibido tu solicitud y ha quedado registrada con el ID:</h4>
            <p class="dialog-id">{{ last_id[0]['id'] }}</p>
            <h4>Pronto te contactaremos</h4>

            <router-link to="/">
                <Button class="btn-close-dialog" severity="info" label="Listo"></Button>
            </router-link>
        </div>
    </Dialog>

    <!-- Contenedor principal -->
    <div class="franchise-main">
        <div
            style="position: fixed;z-index: -1;top: 0  ; width: 100vw;height: 100vh;background-color: black; object-fit: cover;">
            <img style="object-fit: cover;opacity: .4;width: 120vw;filter: blur(12px);"
                src="https://backend.salchimonster.com/read-product-image/600/site-9" alt="">
        </div>

        <div class="franchise-inner">
            <!-- Sección imágenes (izquierda) -->
            <div class="sedes">
                <img v-for="i in [29, 3, 9, 1, 4]" :key="`left-sede-${i}`" class="sede-img"
                    :src="`https://backend.salchimonster.com/read-product-image/600/site-${i}`" alt="Sede Izquierda" />
            </div>

            <!-- Formulario -->
            <div class="form-container">
                <h3><b>Formulario de Pre-Inscripción - Salchimonster Somos Todos</b></h3>
                <br>

                <div class="intro-text">
                    <p>
                        Salchimonster es una Empresa que nace en el año 2017 a partir de
                        una vitrina, siendo este el claro ejemplo que con Disciplina y
                        perseverancia los sueños se cumplen. Actualmente contamos con 11
                        Imperios, Valle, Bogotá y Medellín, contamos con un Centro de
                        distribución para garantizar la estandarización y calidad de los
                        productos.
                    </p>
                    <p>
                        Estamos comprometidos con los buenos valores donde nuestros
                        mounstruos (empleados) que cada día le meten a Fuego y salen a todo
                        por el todo. Hemos logrado reconocimiento Nacional como los
                        fundadores de las Salchipapas dejando el nombre de Cali en Alto.
                    </p>
                    <p>
                        Construimos una cadena de restaurantes atractiva, rentable y
                        sostenible para inversionistas con el fin de proyectarnos como la
                        mejor salchipaperia del país.
                    </p> <br>
                    <p><b>¡¡¡AQUÍ EL MOUNSTRUO SOS VOS!!!</b></p> <br>
                    <p><b>PAPIII NO ES POR VENDERTE PERO DONDE LLEGAMOS ROMPEMOS</b></p>
                </div>

                <form @submit.prevent="enviarFormulario" class="form-grid">
                    <p class="my-2">Nombre Completo:</p>
                    <InputText class="select" v-model="formulario.nombre" placeholder="Ingrese su nombre completo" />

                    <p class="my-2">Teléfono:</p>
                    <InputText class="select" v-model="formulario.telefono"
                        placeholder="Ingrese su número de teléfono" />

                    <p class="my-2">Correo electrónico:</p>
                    <InputText class="select" v-model="formulario.email" placeholder="Correo electrónico" />

                    <p class="my-2">
                        ¿Por qué quieres una franquicia de Salchimonster?
                    </p>
                    <Textarea rows="5" class="textarea-razon" v-model="formulario.razon" placeholder="Cuéntanos..." />

                    <p class="my-2">Capacidad de Inversión:</p>
                    <Select class="select" optionValue="value" :options="opcionesInversion" optionLabel="label"
                        v-model="formulario.inversion" placeholder="Seleccione un rango" />

                    <p class="my-2">Zona de Interés:</p>
                    <Select class="select" optionValue="value" :options="zonas" optionLabel="label"
                        v-model="formulario.zona" placeholder="Seleccione una zona" />

                    <p class="my-2">¿En qué ciudad se ubicará la franquicia?</p>
                    <InputText class="select" v-model="formulario.ciudad" placeholder="Ciudad" />

                    <p class="my-2">
                        ¿Haces parte del sector gastronómico?
                    </p>
                    <Select class="select" optionValue="value" optionLabel="label" :options="opcionesBooleanas"
                        v-model="formulario.sectorGastronomico" placeholder="Seleccione una opción" />

                    <p class="my-2">
                        ¿Participarás en la operación de la franquicia?
                    </p>
                    <Select class="select" optionValue="value" optionLabel="label" :options="opcionesBooleanas"
                        v-model="formulario.operacionFranquicia" placeholder="Seleccione una opción" />

                    <p class="my-2">Confirma la fuente de tus ingresos:</p>
                    <Select class="select" optionValue="value" optionLabel="label" :options="opcionesFuenteIngresos"
                        v-model="formulario.fuenteIngresos" placeholder="Seleccione una opción" />

                    <!-- Botón de envío -->
                    <Button type="submit" severity="" class="btn-submit" label="Enviar" />
                </form>
            </div>

            <!-- Sección imágenes (derecha) -->
            <div class="sedes">
                <img v-for="i in [2, 11, 30, 10, 7]" :key="`right-sede-${i}`" class="sede-img"
                    :src="`https://backend.salchimonster.com/read-product-image/600/site-${i}`" alt="Sede Derecha" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { fetchService } from "@/service/utils/fetchService";
import { URI } from "@/service/conection";
import { InputText } from "primevue";
import { Button } from "primevue";
import { Textarea } from "primevue";
import { Select } from "primevue";
import { Dialog } from "primevue";

const visibleDialog = ref(false);
const last_id = ref("");
const formulario = ref({
    nombre: "",
    telefono: "",
    email: "",
    razon: "",
    inversion: null,
    zona: null,
    ciudad: "",
    sectorGastronomico: null,
    operacionFranquicia: null,
    fuenteIngresos: "",
    status: "Pendiente"
});

const opcionesInversion = [
    {
        label: "$250.000.000 - $300.000.000 (1 franquicia)",
        value: "$250.000.000 - $300.000.000 1 franquicia"
    },
    {
        label: "$500.000.000 - $600.000.000 (2 franquicias)",
        value: "$500.000.000 - $600.000.000 2 franquicias"
    },
    {
        label: "$750.000.000 - $900.000.000 (3 franquicias)",
        value: "$750.000.000 - $900.000.000 3 franquicias"
    }
];

const zonas = [
    { label: "Eje Cafetero", value: "Eje Cafetero" },
    { label: "Cundinamarca", value: "Cundinamarca" },
    { label: "Caribe", value: "Caribe" },
    { label: "Otros", value: "Otros" }
];

const opcionesBooleanas = [
    { label: "Sí", value: true },
    { label: "No", value: false }
];

const opcionesFuenteIngresos = [
    { label: "Recurso propio", value: "Propio" },
    { label: "Recurso prestado", value: "Prestado" },
    { label: "Recurso Mixto", value: "Mixto" }
];

const fieldMapping = {
    nombre: "name",
    telefono: "phone",
    email: "email",
    razon: "reason",
    inversion: "investment_capacity",
    zona: "zone_of_interest",
    ciudad: "city",
    sectorGastronomico: "is_in_gastronomic_sector",
    operacionFranquicia: "will_participate_in_operation",
    fuenteIngresos: "source_of_income",
    status: "status"
};

const validarFormulario = () => {
    if (!formulario.value.nombre.trim()) {
        alert("Por favor, ingrese su nombre completo.");
        return false;
    }
    if (!formulario.value.telefono.trim()) {
        alert("Por favor, ingrese su número de teléfono.");
        return false;
    }
    if (!formulario.value.email.trim() || !formulario.value.email.includes("@")) {
        alert("Por favor, ingrese un correo electrónico válido.");
        return false;
    }
    if (!formulario.value.razon.trim()) {
        alert("Por favor, explique su motivo de inversión.");
        return false;
    }
    if (!formulario.value.inversion) {
        alert("Por favor, seleccione un rango de inversión.");
        return false;
    }
    if (!formulario.value.zona) {
        alert("Por favor, seleccione una zona.");
        return false;
    }
    if (!formulario.value.ciudad.trim()) {
        alert("Por favor, describa la ciudad.");
        return false;
    }
    if (formulario.value.sectorGastronomico === null) {
        alert("Por favor, indique si forma parte del sector gastronómico.");
        return false;
    }
    if (formulario.value.operacionFranquicia === null) {
        alert("Por favor, indique si participará en la operación de la franquicia.");
        return false;
    }
    if (!formulario.value.fuenteIngresos) {
        alert("Por favor, seleccione una fuente de ingresos.");
        return false;
    }
    return true;
};

const enviarFormulario = async () => {
    if (!validarFormulario()) return;

    // Mapeo de campos
    const jsonData = {
        [fieldMapping.nombre]: formulario.value.nombre,
        [fieldMapping.telefono]: formulario.value.telefono,
        [fieldMapping.email]: formulario.value.email,
        [fieldMapping.razon]: formulario.value.razon,
        [fieldMapping.inversion]: formulario.value.inversion,
        [fieldMapping.zona]: formulario.value.zona,
        [fieldMapping.ciudad]: formulario.value.ciudad,
        [fieldMapping.sectorGastronomico]: formulario.value.sectorGastronomico,
        [fieldMapping.operacionFranquicia]: formulario.value.operacionFranquicia,
        [fieldMapping.fuenteIngresos]: formulario.value.fuenteIngresos,
        [fieldMapping.status]: "Pendiente"
    };

    last_id.value = await fetchService.post(
        `${URI}/create_franquicia_request`,
        jsonData
    );
    visibleDialog.value = true;
};
</script>

<style scoped>
/* ====== Diálogo ====== */
.dialog-container {
    width: 30rem;
    background-color: white;
}

.dialog-content {
    height: auto;
    color: black;
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: center;
    padding: 1rem;
    gap: 0.5rem;
}

.dialog-id {
    font-size: 3rem;
    text-align: center;
}

.btn-close-dialog {
    font-weight: bold;
    margin: 0 auto;
}

/* ====== Contenedor principal ====== */
.franchise-main {
    width: 100%;
    /* background-color: var(--p-primary-color); */
    min-height: 100%;
    /* margin-top: 1rem; */
}

/* Contenedor interno */
.franchise-inner {
    width: 100%;
    max-width: 1600px;
    margin: auto;
    align-items: start;
    display: flex;
    padding: 1rem 0;
    gap: 1rem;
}

/* Sección de imágenes */
.sedes {
    display: flex;
    flex-direction: column;
    width: 20%;
    gap: 1rem;
}

.sede-img {
    aspect-ratio: 4 / 3;
    width: 100%;
    object-fit: cover;
    border-radius: 0.5rem;
}

/* Contenedor del formulario */
.form-container {
    width: 60%;
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin: .5rem;
}

/* Texto introductorio */
.intro-text p {
    margin-bottom: 0.5rem;
    text-align: justify;
    width: 100%class="select";
}

/* ====== Formulario ====== */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    align-items: center;
    justify-content: end;
}

/* Textarea de razón */
.textarea-razon {
    resize: none;
    width: 100%;
}


.select {
    width: 100%;
}

/* Botón de envío */
.btn-submit {
    margin-top: 1rem;
    border: none;
    grid-column: 2 / 3;
    /* Para ubicarlo al final de la segunda columna */
}

/* ====== Responsividad ====== */
@media (max-width: 1100px) {
    .form-grid {
        grid-template-columns: repeat(1, 1fr);
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        /* background-color: red; */

    }
}

@media (max-width: 1100px) {
    .sedes {
        display: none;
    }

    .form-container {
        width: 100%;
        /* margin: 0 1rem; */
    }
}
</style>