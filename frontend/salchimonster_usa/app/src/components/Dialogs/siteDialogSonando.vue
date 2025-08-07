<template>
    <Dialog class="dialog-content" style="background-color: #000000ba;   ; color: white;max-width: 94%; padding: 0;"
        v-model:visible="store.visibles.sonandoCurrentSite" header="Selección de sede" :modal="true"
        :style="`width: 60rem ; border: 3px solid  red`">
        <div class="dialog-content">
            <b class="dialog-title">
                <!-- Puedes mostrar información adicional aquí si lo deseas -->
            </b>

            <!-- Contenedor principal -->
            <div class="form-container">
                <!-- Indicador de carga -->
                <div v-if="isLoading" class="loading-container">
                    <ProgressSpinner class="spinner" strokeWidth="8" fill="var(--white)" animationDuration=".5s"
                        aria-label="Cargando sedes" />
                    <p class="loading-text">Cargando sedes...</p>
                </div>

                <!-- Cuadrícula de sedes -->
                <div v-else class="sites-grid">
                    <div :style="`box-shadow: 0 .5rem 1rem red `"
                        v-for="site in sites.filter(s => s.show_on_web == true)" :key="site.id" class="site-card"
                        :class="{ selected: selectedSite?.site_id === site.site_id }" @click="selectSite(site)">
                        <img :src="`${URI}/read-product-image/300/site-${site.site_id}`" :alt="site.name"
                            class="site-image" />
                        <div class="site-info">
                            <p class="site-name">{{ site.site_name }}</p>
                        </div>
                    </div>
                </div>



            </div>
        </div>
        <!-- Botón Aplicar -->
        <template #footer>
            <div class="button-container">
                <Button label="Aplicar" @click="applySelection" :disabled="!selectedSite" class="apply-" />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { Dialog } from 'primevue';
import { Button } from 'primevue';
import { ProgressSpinner } from 'primevue';
import { useSitesStore } from '@/store/site'; // Ajusta la ruta según tu estructura
import router from '@/router';
import { URI } from '@/service/conection';

// Instancia del store
const store = useSitesStore();

// Estados reactivos
const sites = ref([]);
const isLoading = ref(false);
const selectedSite = ref(null);


const neonColors = [
    '#FF6EC7', // Neón Rosa
    '#39FF14', // Neón Verde
    '#00FFFF', // Neón Cyan
    '#FF073A', // Neón Rojo
    '#9400D3', // Neón Púrpura
    '#FFFF33', // Neón Amarillo
    '#FF00FF', // Neón Magenta
    '#00FFEF', // Neón Azul
    '#FF4500', // Neón Naranja
    '#7CFC00', // Neón Verde Césped
];


function getRandomNeonColor() {
    const randomIndex = Math.floor(Math.random() * neonColors.length);
    return neonColors[randomIndex];
}

// Función para obtener las sedes desde la API
const fetchSites = async () => {
    isLoading.value = true;
    try {
        const response = await fetch(`${URI}/sites`);
        if (response.ok) {
            const data = await response.json();
            sites.value = data;
        } else {
            console.error('Error al obtener las sedes:', response.statusText);
        }
    } catch (error) {
        console.error('Error al obtener las sedes:', error);
    } finally {
        isLoading.value = false;
    }
};

// Función para seleccionar una sede
const selectSite = (site) => {
    selectedSite.value = site;
};

// Función para aplicar la selección
const applySelection = () => {
    if (selectedSite.value) {
        store.sonando = selectedSite.value; // Guarda la sede en el store
        store.visibles.sonandoCurrentSite = false; // Cierra el diálogo
        // router.push('/'); // Redirige a la página principal o a donde desees
    }
};

// Obtener las sedes al montar el componente
onMounted(() => {
    fetchSites();
});

// Reiniciar la selección cuando se abre el diálogo
watch(
    () => store.visibles.currentSite,
    (newVal) => {
        if (newVal) {
            selectedSite.value = null;
        }
    }
);
</script>

<style scoped>
/* Estilos del Dialog */
.dialog {
    background-color: white;
    position: relative;
    border-radius: 1rem;
    padding-top: 2rem;
}

/* Contenedor del contenido del dialog */
.dialog-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Título del dialog */
.dialog-title {
    color: black;
    margin-bottom: 1rem;
}

/* Contenedor del formulario */
.form-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Indicador de carga */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 30rem;
}

.spinner {
    width: 50px;
    height: 50px;
    margin-bottom: 1rem;
}

.loading-text {
    color: black;
    font-size: 1.2rem;
}

/* Cuadrícula de sedes */
.sites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    width: 100%;
    /* padding: 1rem; */
}

/* Tarjeta de sede */
.site-card {
    /* border: 2px solid rgb(0, 0, 0); */

    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    transition: border 0.3s ease, transform 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.site-card:hover {
    /* border: 2px solid var(--primary-color); */
    transform: scale(1.05);
    filter: brightness(1.3);
}

.site-card.selected {
    /* border: 2px solid var(--p-primary-color); */
    background-color: var(--p-primary-color)
}

.site-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
}

.site-info {
    padding: 0.5rem;
    text-align: center;
}

.site-name {
    font-size: 1rem;
    font-weight: bold;
    color: #000000;
}

.dialog-content::-webkit-scrollbar {
    width: 12px;
}

.dialog-content::-webkit-scrollbar-track {
    background: #000000;
    /* Fondo negro */
}

.dialog-content::-webkit-scrollbar-thumb {
    background-color: var(--primary-color);
    border-radius: 6px;
    border: 3px solid #000000;
}

.dialog-content {
    scrollbar-width: thin;
    scrollbar-color: var(--primary-color) #000000;
}

/* Botón Aplicar */
.button-container {
    width: 100%;
    margin-top: 2rem;
    display: flex;
    justify-content: end;
}

.apply-button {
    /* width: 100%; */
    padding: 0.75rem 1.5rem;
    background-color: var(--primary-color);
    border: none;
    border-radius: 0.5rem;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.apply-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.apply-button:not(:disabled):hover {
    background-color: darken(var(--primary-color), 10%);
}

/* Responsividad */
@media (max-width: 1024px) {
    .sites-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }

    .site-image {
        height: 120px;
    }
}

* {
    color: white !important;
}

@media (max-width: 600px) {
    .dialog {
        width: 90%;
    }

    .sites-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }

    .site-image {
        height: 100px;
    }
}
</style>