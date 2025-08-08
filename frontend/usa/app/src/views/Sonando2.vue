<!-- src/components/Salchimonster.vue -->
<template>
    <img style="width: 100%; position: fixed;left: -10%; top: 0;width: 120vw;height: 100vh;object-fit: cover;z-index: -1;filter: blur(10px);"
        :src="currentPlayback?.currentSong?.thumbnail" alt="">

    <div class="main-container">

        <div class="salchimonster-container" style="overflow: hidden;">
            <h1 style="margin:0 2rem 0 1rem;">
                <i class="fa-solid fa-play" style="margin-right: 1rem;"></i> SONANDO EN SALCHIMONSTER
            </h1>

            <Button @click="dialogPedirTema = true" style="margin: 1rem 0;" label="Pedite un tema"
                icon="fa-solid fa-forward"></Button>

            <!-- Sección del Reproductor de YouTube -->
            <div class="player-wrapper" style="position: absolute;right: 100%;opacity: 0;pointer-events: none;">
                <div ref="playerElement" id="youtube-player"></div>
                <!-- <div class="overlay"></div> -->
            </div>

            <img style="width: 100%;aspect-ratio: 1 / 1;object-fit: cover;border-radius: 1rem; "
                :src="currentPlayback?.currentSong?.thumbnail" alt="">
            <!-- Información de la Canción Actual -->
            <div v-if="currentPlayback?.currentSong" class="current-song-info">
                <h2>{{ currentPlayback.currentSong.title }}</h2>
                <p><strong>Solicitada por:</strong> {{ currentPlayback.currentSong.requestedBy }}</p>
            </div>

            <div class="progress-bar-container" style="">
                <ProgressBar :value="progressValue" :show-value="false" style="width: 100%;" />
                <!-- <span>{{ formattedCurrentTime }} / {{ formattedTotalDuration }}</span> -->
            </div>

            <div class="controls-container">
                <!-- Botón para Iniciar Reproducción si Autoplay Falla o si el Player no está listo -->
                <!-- <Button v-if="playerState.showPlayButton || !playerState.isPlayerReady" label="Iniciar Reproducción"
                    icon="pi pi-play" @click="startPlayback" class="play-button" />
 -->
                <!-- Botón "Conectarse y Escuchar" -->
                <Button rounded icon="fa-solid fa-backward" disabled class="previous-button" />

                <Button rounded size="large" icon="fa-solid fa-sync" @click="startPlayback" class="restart-button" />

                <!-- Botón "Retroceder" -->

                <!-- Botón "Avanzar" -->
                <Button rounded icon="fa-solid fa-forward" disabled @click="advanceToNextSong" class="next-button" />
            </div>

            <div class="queue-container">
                <h3>Cola de Reproducción</h3>
                <ul class="queue-list">
                    <li v-for="(song, index) in displayedQueue" :key="`${song.id}-${index}`"
                        :class="{ 'current-song': (startIndex + index) === currentPlayback?.currentIndex }"
                        :style="{ opacity: getOpacity(index), transition: 'opacity 0.5s ease' }">
                        <img :src="song.thumbnail" alt="Thumbnail" class="thumbnail" />
                        <div class="song-info">
                            <span class="song-title">{{ song.title }}</span>
                            <span class="requested-by">Solicitada por: {{ song.requestedBy }}</span>
                        </div>
                    </li>
                </ul>
            </div>

        </div>

    </div>

    <!-- Primer Diálogo: Seleccionar una Canción -->
    <Dialog v-model:visible="dialogPedirTema" modal style="max-width: 94%;">
        <template #header>
            <h2 style="color: black;">Solicitar una Canción</h2>
        </template>

        <ul class="queue-list">
            <li class="song" v-for="(song, index) in availableSongs" :key="`${song.id}-${index}`"
                :class="{ 'selected-song': selectedAvailableSong === song }" @click="selectedAvailableSong = song">
                <img :src="song.thumbnail" alt="Thumbnail" class="thumbnail" />
                <div class="song-info">
                    <span class="" style="color: black !important;">{{ song.title }}</span>
                    <!-- <span class="requested-by">Solicitada por: {{ song.requestedBy }}</span> -->
                </div>
            </li>
        </ul>

        <template #footer>
            <div class="dialog-footer">
                <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="dialogPedirTema = false" />
                <Button label="Solicitar" icon="pi pi-check" :disabled="!selectedAvailableSong"
                    @click="openSolicitarNombreDialog" class="p-button-success" />
            </div>
        </template>
    </Dialog>


    <!-- Segundo Diálogo: Ingresar Nombre -->
    <Dialog v-model:visible="dialogSolicitarNombre" modal style="max-width: 94%;width: 30rem;">
        <template #header>
            <h2 style="color: black;">Proporciona tu Nombre</h2>
        </template>

        <div class="solicitar-nombre-container">

            <h3 style="color: black !important;">{{ selectedAvailableSong?.title }}</h3>
            <img :src="selectedAvailableSong?.thumbnail" alt="Thumbnail" class="thumbnail-large" />
            <InputText style="border: 1px solid  black; color: black;width: 100%;" v-model="requesterName"
                placeholder="Tu nombre" class="input-text" />
        </div>

        <template #footer>
            <div class="dialog-footer">
                <!-- <Button style="background-color: black;" label="Cancelar" severity="danger" icon="pi pi-times" -->
                @click="dialogSolicitarNombre = false" />
                <Button label="Solicitar" icon="pi pi-check" :disabled="!requesterName.trim()"
                    @click="handleAddSongWithName" />
            </div>
        </template>
    </Dialog>



</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import ProgressBar from 'primevue/progressbar'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { Dialog } from 'primevue'

// Configuración del Backend
const API_BASE = 'https://backend-musica.salchimonster.com' // Cambia según corresponda
const WS_URL = 'wss://backend-musica.salchimonster.com/ws'  // Cambia según corresponda

const dialogPedirTema = ref(false)


const dialogSolicitarNombre = ref(false) // Segundo diálogo para solicitar el nombre
const selectedAvailableSong = ref(null) // Canción seleccionada en el primer diálogo

// Función para abrir el segundo diálogo
function openSolicitarNombreDialog() {
    if (selectedAvailableSong.value) {
        dialogSolicitarNombre.value = true
    } else {
        alert('Por favor, selecciona una canción primero.')
    }
}

// Función para manejar la adición de una canción con nombre y cerrar los diálogos
async function handleAddSongWithName() {
    if (!selectedAvailableSong.value || !requesterName.value.trim()) {
        alert('Por favor, selecciona una canción y proporciona tu nombre.')
        return
    }

    try {
        const message = {
            type: 'add_song',
            song_id: selectedAvailableSong.value.id,
            requestedBy: requesterName.value.trim()
        }
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message))
            // Limpiar campos después de enviar
            selectedAvailableSong.value = null
            requesterName.value = ''
            dialogSolicitarNombre.value = false
            dialogPedirTema.value = false
        } else {
            alert('No estás conectado al servidor. Intenta recargar la página.')
        }
    } catch (error) {
        console.error('Error al agregar la canción a la cola:', error)
    }
}






// Computed para el índice de inicio
const startIndex = computed(() => {
    if (!currentPlayback.value || currentPlayback.value.currentIndex === undefined) return 0
    return Math.max(currentPlayback.value.currentIndex - 4, 0)
})

// Computed para la cola mostrada
const displayedQueue = computed(() => {
    return videoQueue.value.slice(startIndex.value)
})

// Referencia al elemento del YouTube Player
const playerElement = ref(null)
let player = null

// Estado de reproducción
const currentPlayback = ref(null)

// Cola de reproducción
const videoQueue = ref([])

// Biblioteca de canciones disponibles
const availableSongs = ref([])

// Selección de canción para agregar
const selectedSong = ref(null)
const requesterName = ref('')

// Control de la barra de progreso
const currentTime = ref(0)
const totalDuration = ref(0)

// Estado adicional para verificar si el reproductor está listo y mostrar el botón de reproducción
const playerState = reactive({
    isPlayerReady: false,
    showPlayButton: false
})

// Computed para el valor de la barra de progreso
const progressValue = computed(() => {
    if (totalDuration.value > 0) {
        return (currentTime.value / totalDuration.value) * 100
    }
    return 0
})

// Computed para formatear el tiempo
const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedTotalDuration = computed(() => formatTime(totalDuration.value))

// Variable para controlar si el cambio de canción ha sido gestionado
const lastLoadedSongId = ref(null)

// Función para formatear segundos a mm:ss
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

// Función para conectar al WebSocket
let socket = null
function connectWebSocket() {
    socket = new WebSocket(WS_URL)

    socket.onopen = () => {
        console.log('Conectado al WebSocket')
    }

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'queue_update') {
                videoQueue.value = data.queue;
                currentPlayback.value = data.status;

                currentTime.value = data.status.currentTime;
                totalDuration.value = data.status.totalDuration;

                const currentSongId = data.status.currentSong ? data.status.currentSong.id : null;
                if (currentSongId !== lastLoadedSongId.value) {
                    loadCurrentSong(currentSongId);
                    lastLoadedSongId.value = currentSongId;
                } else {
                    // Ajustar el tiempo sin recargar
                    if (player && data.status.isPlaying) {
                        syncPlayerWithCurrentTime();
                    } else if (player) {
                        player.pauseVideo();
                    }
                }
                playerState.showPlayButton = !data.status.isPlaying;
            }
        } catch (error) {
            console.error('Error al parsear mensaje del WebSocket:', error);
        }
    };

    socket.onerror = (error) => {
        console.error('Error en el WebSocket:', error)
    }

    socket.onclose = () => {
        console.warn('WebSocket cerrado. Reintentando en 3 segundos...')
        setTimeout(connectWebSocket, 3000)
    }
}

function syncPlayerWithCurrentTime() {
    if (player && typeof player.getCurrentTime === 'function') {
        const playerTime = player.getCurrentTime();
        if (Math.abs(playerTime - currentPlayback.value.currentTime) > 1) {
            player.seekTo(currentPlayback.value.currentTime, true);
        }
        if (!player.getPlayerState || player.getPlayerState() !== YT.PlayerState.PLAYING) {
            player.playVideo();
        }
    }
}

// Función para crear el YouTube Player
function loadYouTubeAPI(onAPIReady) {
    if (window.YT && window.YT.Player) {
        onAPIReady()
        return
    }
    window.onYouTubeIframeAPIReady = () => {
        onAPIReady()
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)
}

function createYouTubePlayer(element, videoId, onReady, onStateChange) {
    return new window.YT.Player(element, {
        videoId,
        playerVars: {
            autoplay: 1,
            controls: 1,
            disablekb: 0,
            fs: 1,
            playsinline: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
        },
        events: {
            onReady,
            onStateChange,
        },
    })
}

function onPlayerReady(event) {
    playerState.isPlayerReady = true;
    if (currentPlayback.value?.isPlaying) {
        // Reproducir el video
        event.target.playVideo()
        // Buscar al tiempo actual
        if (currentTime.value > 0) {
            event.target.seekTo(currentTime.value, true)
        }
    } else {
        event.target.pauseVideo()
        playerState.showPlayButton = true
    }
}

function onPlayerStateChange(event) {
    const PlayerState = window.YT.PlayerState
    switch (event.data) {
        case PlayerState.PLAYING:
            // Iniciar intervalo para actualizar el tiempo
            startTimeUpdater()
            break
        case PlayerState.PAUSED:
            // Detener intervalo
            stopTimeUpdater()
            break
        case PlayerState.ENDED:
            // Avanzar a la siguiente canción
            advanceToNextSong()
            break
        default:
            break
    }
}

let timeUpdater = null
function startTimeUpdater() {
    if (timeUpdater) return
    timeUpdater = setInterval(() => {
        if (player && player.getCurrentTime) {
            const time = player.getCurrentTime()
            currentTime.value = time
            // Enviar actualización al backend vía WebSocket

        }
    }, 10000)
}

function stopTimeUpdater() {
    if (timeUpdater) {
        clearInterval(timeUpdater)
        timeUpdater = null
    }
}

// Función para avanzar a la siguiente canción
async function advanceToNextSong() {
    try {
        // Envía una solicitud POST para avanzar a la siguiente canción
        // Puedes cambiar esto para que también sea vía WebSocket si lo prefieres
        await axios.post(`${API_BASE}/next`)
        // El backend emitirá la actualización vía WebSocket
    } catch (error) {
        console.error('Error al avanzar a la siguiente canción:', error)
    }
}

// Función para reportar el tiempo actual al backend vía WebSocket
function sendTimeUpdate(time) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        const message = {
            type: 'update_time',
            time: time
        }
        socket.send(JSON.stringify(message))
    }
}

// Función para iniciar reproducción manualmente
function startPlayback() {
    if (player && playerState.isPlayerReady) {
        player.playVideo()
        playerState.showPlayButton = false
    } else {
        alert('El reproductor aún no está listo. Por favor, espera un momento.')
    }
}

// Función para agregar una canción a la cola vía WebSocket
function addSongToQueue() {
    if (!selectedSong.value || !requesterName.value.trim()) {
        alert('Por favor, selecciona una canción y proporciona tu nombre.')
        return
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
        const message = {
            type: 'add_song',
            song_id: selectedSong.value,
            requestedBy: requesterName.value.trim()
        }
        socket.send(JSON.stringify(message))
        // Limpiar campos después de enviar
        selectedSong.value = null
        requesterName.value = ''
    } else {
        alert('No estás conectado al servidor. Intenta recargar la página.')
    }
}

// Función para manejar la adición de una canción y cerrar el diálogo
function handleAddSong() {
    addSongToQueue()
    // Cerrar el diálogo
    dialogPedirTema.value = false
    // Limpiar los campos
    selectedSong.value = null
    requesterName.value = ''
}

// Función para cargar la canción actual en el reproductor
function loadCurrentSong(songId) {
    if (window.YT && window.YT.Player && songId) {
        if (!player) {
            player = createYouTubePlayer(playerElement.value, songId, onPlayerReady, onPlayerStateChange);
        } else {
            player.loadVideoById({
                videoId: songId,
                startSeconds: currentTime.value // Iniciar desde el tiempo actual
            });
            if (currentPlayback.value.isPlaying) {
                player.playVideo();
            } else {
                player.pauseVideo();
            }
        }
    }
}

// Función para cargar datos iniciales
async function loadInitialData() {
    try {
        const [availableResp, queueResp, currentResp] = await Promise.all([
            axios.get(`${API_BASE}/available`),
            axios.get(`${API_BASE}/queue`),
            axios.get(`${API_BASE}/current`),
        ])

        availableSongs.value = availableResp.data
        videoQueue.value = queueResp.data
        currentPlayback.value = currentResp.data

        // Establecer el tiempo y duración
        currentTime.value = currentPlayback.value.currentTime
        totalDuration.value = currentPlayback.value.totalDuration

        // Establecer la última canción cargada
        lastLoadedSongId.value = currentPlayback.value.currentSong
            ? currentPlayback.value.currentSong.id
            : null

        // Cargar la canción actual en el reproductor
        loadCurrentSong(lastLoadedSongId.value)
    } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
    }
}

// Función para calcular la opacidad basada en el índice
function getOpacity(index) {
    const total = displayedQueue.value.length
    if (total === 1) return 1
    // Opacidad entre 0.2 y 1
    const minOpacity = 0.2
    const maxOpacity = 1
    const opacityRange = maxOpacity - minOpacity
    const opacity = minOpacity + (index / (total - 1)) * opacityRange
    return opacity
}

// Ciclo de vida del componente
onMounted(() => {
    // Cargar datos iniciales
    loadInitialData()

    // Conectar al WebSocket
    connectWebSocket()

    // Inicializar el reproductor de YouTube
    loadYouTubeAPI(() => {
        const currentSong = currentPlayback.value?.currentSong
        const videoId = currentSong ? currentSong.id : ''
        if (videoId) {
            player = createYouTubePlayer(
                playerElement.value,
                videoId,
                onPlayerReady,
                onPlayerStateChange
            )
        }
    })
})

onUnmounted(() => {
    // Cerrar el WebSocket
    if (socket) {
        socket.close()
    }

    // Detener el intervalo de actualización de tiempo
    stopTimeUpdater()
})
</script>

<style scoped>
.salchimonster-container {
    max-width: 640px;
    margin: auto;
    padding: 20px;
    text-align: center;
    /* background-color: black; */
}

* {
    color: white;
}

.player-wrapper {
    position: relative;
    width: 100%;
    /* padding-top: 56.25%; */
    /* 16:9 Aspect Ratio */
}

#youtube-player {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* Puedes agregar estilos para overlays si es necesario */
}

.current-song-info {
    margin-top: 20px;
}

.progress-bar-container {
    display: flex;
    align-items: center;
    margin-top: 10px;
}

.progress-bar-container span {
    margin-left: 10px;
}

.play-button {
    margin-top: 20px;
}

.queue-container {
    margin-top: 30px;
    text-align: left;
}

span {
    color: white !important;
}

.queue-list {
    list-style: none;
    padding: 0;
}


/* ... (tus estilos existentes) */

/* Resaltar la canción seleccionada */
.queue-list li.selected-song {
    background-color: rgba(255, 166, 0, 0.239);
    /* Fondo semi-transparente */
    color: white !important;
    font-weight: bold;
}

/* Cambiar el cursor a pointer para elementos clicables */
.queue-list li {
    cursor: pointer;
    transition: opacity 0.5s ease, background-color 0.3s ease;
}

/* Estilos para el segundo diálogo */
.thumbnail-large {
    width: 100%;
    max-width: 300px;
    height: auto;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.solicitar-nombre-container {
    display: flex;
    flex-direction: column;
    color: red;
    align-items: center;
    gap: 1rem;
}

/* Opcional: Ajustes para dispositivos móviles */
@media (max-width: 600px) {

    .add-song-container,
    .solicitar-nombre-container {
        padding: 0 1rem;
    }
}

.queue-list li {
    display: flex;
    align-items: center;
    padding: 10px;
    /* border-bottom: 1px solid #ddd; */
}

.song:hover {
    /* background-color: var(--p-primary-color); */
    background-color: rgba(255, 166, 0, 0.239);

}

.controls-container {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
    position: sticky;
    top: 0;
}

.queue-list li.current-song {
    background-color: var(--p-primary-color)
}

.thumbnail {
    width: 80px;
    height: 60px;
    object-fit: cover;
    margin-right: 15px;
    border-radius: 4px;
}

.main-container {
    background-color: rgba(0, 0, 0, 0.591);
}

.song-info {
    display: flex;
    flex-direction: column;
}

.song-title {
    font-weight: bold;
}

.requested-by {
    font-size: 0.9em;
    color: #555;
}

.add-song-container {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.add-song-container .dropdown,
.add-song-container .input-text {
    width: 100%;
    max-width: 300px;
    margin-bottom: 15px;
}

.add-button {
    width: 150px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;

    gap: 0.5rem;
    width: 100%;
}

.dialog-footer .p-button {
    min-width: 120px;
}
</style>
