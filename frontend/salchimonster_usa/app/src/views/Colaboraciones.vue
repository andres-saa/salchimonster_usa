<template>
    <div class="main-container" style="background-color: var(--p-primary-color);">

        <p class="copy-title">LA PRE-PAGO</p>
        <p class="copy-title">SALCHIMONSTER X PAPI KEICY</p> <br>

        <!-- Video de YouTube -->
        <iframe class="video-iframe" :src="embedUrl"
            title="Como hacer la salchipapa Pre-pago | Colaboración ​⁠​⁠@papi-keicy salchimonster la mejor de Colombia"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Ref reactivo para el ID del video de YouTube
const videoId = ref('VR6N9AhyRVQ'); // Reemplaza con el ID real del video

// Ref reactivo para la URL de inserción
const embedUrl = ref('');

// Construir la URL de inserción cuando el componente se monta
onMounted(() => {
    embedUrl.value = `https://www.youtube.com/embed/${videoId.value}`;
});
</script>

<style scoped>
/* Contenedor principal */
.main-container {
    position: relative;
    /* max-width: 1024px; */
    display: flex;
    width: 100%;
    flex-direction: column;
    margin: 0 auto;
    padding: 2rem 1rem;
    padding-bottom: 1rem;
    background-color: transparent;
}

/* Contenedores de imágenes laterales */
.left-images,
.right-images {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: 4rem;
}

/* Posicionamiento de las imágenes a la izquierda */
.left-images {
    left: 0;
}

/* Posicionamiento de las imágenes a la derecha */
.right-images {
    right: 0;
}

/* Estilos para las imágenes */
.left-images img,
.right-images img {
    width: 15vw;
    max-width: 100px;
    /* Evita que las imágenes sean demasiado grandes en pantallas grandes */
}

/* Estilos para los títulos */
.copy-title {
    text-transform: uppercase;
    font-family: 'Titan One', sans-serif;
    font-weight: 400;
    font-style: normal;
    text-align: center;
    font-weight: bold;

    font-size: 2rem;
    margin: 0rem 0;
    color: #fff;
}

/* Estilos para el iframe del video */
.video-iframe {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 0.5rem;
    max-width: 1024px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    /* Sombra de ejemplo */
    margin-top: 2rem;
    margin: 0 auto;
}

/* Media Queries para pantallas medianas */
@media (min-width: 768px) {
    .copy-title {
        font-size: 2rem;
        /* Equivalente a md:text-2xl */
    }
}

/* Media Queries para pantallas grandes */
@media (min-width: 1024px) {
    .copy-title {
        font-size: 3.75rem;
        /* Equivalente a lg:text-6xl */
    }
}

/* Media Queries para pantallas pequeñas */
@media (max-width: 768px) {
    .main-container {
        background-color: var(--primary-color);
        padding: 1rem;
    }

    /* Reorganizar las imágenes en una sola columna con desplazamiento */
    .left-images,
    .right-images {
        position: static;
        flex-direction: column;
        gap: 4rem;
        overflow-y: auto;
        max-height: 80vh;
    }

    /* Ajustar el ancho de las imágenes */
    .left-images img,
    .right-images img {
        width: 15vw;
        max-width: 100%;
    }

    /* Ajustes adicionales para el iframe */
    .video-iframe {
        aspect-ratio: 16 / 9;
        width: 100%;
        border-radius: 0.5rem;
    }
}
</style>
