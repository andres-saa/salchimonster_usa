<!-- src/components/Salchimonster.vue -->
<template>
    <div class="salchimonster-container">
        <h1>Salchimonster - Reproductor de YouTube</h1>

        <!-- Sección del Reproductor de YouTube -->
        <div class="player-wrapper">
            <div ref="playerElement" id="youtube-player"></div>
            <div class="overlay"></div>
        </div>

        <!-- Información de la Canción Actual -->
        <div v-if="currentPlayback?.currentSong" class="current-song-info">
            <h2>{{ currentPlayback.currentSong.title }}</h2>
            <p><strong>Solicitada por:</strong> {{ currentPlayback.currentSong.requestedBy }}</p>
        </div>

        <!-- Barra de Progreso -->
        <div class="progress-bar-container">
            <ProgressBar :value="progressValue" :show-value="false" style="width: 100%;" />
            <span>{{ formattedCurrentTime }} / {{ formattedTotalDuration }}</span>
        </div>

        <!-- Botón para Iniciar Reproducción si Autoplay Falla o si el Player no está listo -->
        <Button v-if="playerState.showPlayButton || !playerState.isPlayerReady" label="Iniciar Reproducción"
            icon="pi pi-play" @click="startPlayback" class="play-button" />

        <!-- Lista de la Cola de Reproducción -->
        <div class="queue-container">
            <h3>Cola de Reproducción</h3>
            <ul class="queue-list">
                <li v-for="(song, index) in videoQueue" :key="`${song.id}-${index}`"
                    :class="{ 'current-song': index === currentPlayback?.currentIndex }">
                    <img :src="song.thumbnail" alt="Thumbnail" class="thumbnail" />
                    <div class="song-info">
                        <span class="song-title">{{ song.title }}</span>
                        <span class="requested-by">Solicitada por: {{ song.requestedBy }}</span>
                    </div>
                </li>
            </ul>
        </div>

        <!-- Sección para Agregar Canciones a la Cola -->
        <div class="add-song-container">
            <h3>Agregar Canción a la Cola</h3>
            <Dropdown v-model="selectedSong" :options="availableSongs" optionLabel="title" optionValue="id"
                placeholder="Selecciona una canción" class="dropdown" />
            <InputText v-model="requesterName" placeholder="Tu nombre" class="input-text" />
            <Button label="Agregar" icon="pi pi-plus" @click="addSongToQueue" class="add-button" />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import ProgressBar from 'primevue/progressbar'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'

// Configuración del Backend
const API_BASE = 'http://localhost:8000' // Cambia según corresponda
const WS_URL = 'ws://localhost:8000/ws'  // Cambia según corresponda

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
            // sendTimeUpdate(time)
        }
    }, 1000)
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
    max-width: 800px;
    margin: auto;
    padding: 20px;
    text-align: center;
}

.player-wrapper {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
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

.queue-list {
    list-style: none;
    padding: 0;
}

.queue-list li {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

.queue-list li.current-song {
    background-color: #f0f8ff;
}

.thumbnail {
    width: 80px;
    height: 60px;
    object-fit: cover;
    margin-right: 15px;
    border-radius: 4px;
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
}

.add-song-container .dropdown,
.add-song-container .input-text {
    width: 300px;
    margin-bottom: 15px;
}

.add-button {
    width: 150px;
}
</style>
