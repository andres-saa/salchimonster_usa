<template>
  <img
    style="width: 100%; position: fixed; left: -10%; top: 0; width: 120vw; height: 100vh; object-fit: cover; z-index: -1; filter: blur(10px);"
    :src="currentPlayback?.currentSong?.thumbnail"
    alt=""
  />

  <div class="main-container">
    <div class="salchimonster-container" style="overflow: hidden;">
      <h2 style="margin:0 2rem 0 1rem;">
        <i class="fa-solid fa-play" style="margin-right: 1rem;"></i>
        SONANDO EN <span>SM {{ siteStore?.sonando?.site_name }}</span>
      </h2>

      <div style="display: flex; gap: 1rem; justify-content: center;">
        <Button
          size="small"
          @click="dialogPedirTema = true"
          style="margin: 1rem 0;"
          label="Pedir tema"
          icon="fa-solid fa-forward"
        ></Button>

        <Button
          size="small"
          icon="fa-solid fa-sync"
          @click="siteStore.visibles.sonandoCurrentSite = true"
          style="margin: 1rem 0;"
          label="Cambiar sede"
        ></Button>
      </div>

      <!-- YouTube Player -->
      <div class="player-wrapper" style="pointer-events: none;">
        <div ref="playerElement" style="width: 100% !important; max-width: 100% !important;" id="youtube-player"></div>
      </div>

      <!-- Current Song Info -->
      <div v-if="currentPlayback?.currentSong" class="current-song-info">
        <h2>{{ currentPlayback.currentSong.title }}</h2>
        <p><strong>Solicitada por:</strong> {{ currentPlayback.currentSong.requestedBy }}</p>
      </div>

      <div class="progress-bar-container">
        <ProgressBar :value="progressValue" :show-value="false" style="width: 100%;" />
      </div>

      <div class="controls-container">
        <Button disabled rounded icon="fa-solid fa-backward" class="previous-button" />

        <Button
          v-if="!isLocalPaused"
          rounded
          icon="fa-solid fa-pause"
          @click="pausePlayback"
          label="Pausa"
        />
        <Button
          v-else
          rounded
          icon="fa-solid fa-play"
          @click="resumePlayback"
          label="Reanudar"
        />

        <Button disabled rounded icon="fa-solid fa-forward" @click="advanceToNextSong" class="next-button" />
      </div>

      <!-- Queue -->
      <div class="queue-container">
        <h3>Cola de Reproducción</h3>
        <ul class="queue-list">
          <li
            v-for="(song, index) in displayedQueue"
            :key="`${song.id}-${index}`"
            :class="{ 'current-song': (startIndex + index) === currentPlayback?.currentIndex }"
            :style="{ opacity: getOpacity(index), transition: 'opacity 0.5s ease' }"
          >
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

  <!-- Dialog: Solicitar Tema -->
  <Dialog
    v-model:visible="dialogPedirTema"
    modal
    style="max-width: 94%; width: 40rem; min-height: 90vh; border: none;"
  >
    <template #header>
      <div>
        <h4 style="color: black;">Solicitar una Canción</h4>
        <!-- *** Single Input for BOTH local & YouTube *** -->
        <div style="margin-top: 1rem;">
          <InputText
            v-model="searchTerm"
            placeholder="Buscar canción..."
            style="width: 100%; color: black;"
          />
        </div>
      </div>
    </template>

    <!-- If there are local songs, show them (with pagination) -->
    <div v-if="filteredSongs.length > 0">
      <ul class="queue-list">
        <li
          class="song"
          style="transition: all none;"
          v-for="(song, index) in songsPaginated"
          :key="`${song.id}-${index}`"
          :class="{ 'selected-song': selectedAvailableSong === song }"
          @click="selectedAvailableSong = song"
        >
          <img :src="song.thumbnail" alt="Thumbnail" class="thumbnail" />
          <div class="song-info">
            <span style="color: black !important;">{{ song.title }}</span>
          </div>
        </li>
      </ul>

      <!-- Paginación -->
      <div
        style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;"
      >
        <Button
          label="Anterior"
          icon="pi pi-chevron-left"
          :disabled="currentPage === 0"
          @click="goToPrevPage"
        />
        <span style="color: black !important;">
          {{ currentPage + 1 }} de {{ totalPages }}
        </span>
        <Button
          label="Siguiente"
          icon="pi pi-chevron-right"
          iconPos="right"
          :disabled="currentPage >= totalPages - 1"
          @click="goToNextPage"
        />
      </div>
    </div>

    <!-- Otherwise, if no local results but YouTube results exist, show them -->
    <div v-else-if="youtubeSearchResults.length > 0">
      <p style="color: black; font-weight: bold;">Resultados de YouTube:</p>
      <ul class="queue-list">
        <li
          class="song"
          style="transition: all none;"
          v-for="(song, index) in youtubeSearchResults"
          :key="index"
          :class="{ 'selected-song': selectedYoutubeSong === song }"
          @click="selectedYoutubeSong = song"
        >
          <img :src="song.thumbnail" alt="Thumbnail" class="thumbnail" />
          <div class="song-info">
            <span style="color: black !important;">{{ song.title }}</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- If neither local nor YouTube has results, show a message -->
    <div v-else>
      <h3 style="color: black;">No hay resultados, la estamos buscando en Youtube... espera un poco</h3>
      <Tag  class="status-tag"><h2>Buscando en youtube, ya casi la tengo...</h2></Tag>


    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-text"
          @click="dialogPedirTema = false"
        />

        <!-- If we have local results, we show the button to request a local song -->
        <Button
          v-if="filteredSongs.length > 0"
          label="Solicitar"
          icon="pi pi-check"
          :disabled="!selectedAvailableSong"
          @click="openSolicitarNombreDialog"
          class="p-button"
        />

        <!-- Else, if we have YouTube results, the button requests the YouTube song -->
        <Button
          v-else-if="youtubeSearchResults.length > 0"
          label="Solicitar"
          icon="pi pi-check"
          :disabled="!selectedYoutubeSong"
          @click="openSolicitarNombreDialogYouTube"
          class="p-button"
        />
      </div>
    </template>
  </Dialog>

  <!-- Dialog: Nombre para canción local -->
  <Dialog v-model:visible="dialogSolicitarNombre" modal style="max-width: 94%; width: 30rem;">
    <template #header>
      <h2 style="color: black;">Proporciona tu Nombre</h2>
    </template>

    <div class="solicitar-nombre-container">
      <h3 style="color: black !important;">{{ selectedAvailableSong?.title }}</h3>
      <img :src="selectedAvailableSong?.thumbnail" alt="Thumbnail" class="thumbnail-large" />
      <InputText
        style="width: 100%; color: black;"
        v-model="requesterName"
        placeholder="Tu nombre"
        class="input-text"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-text"
          @click="dialogSolicitarNombre = false"
        />
        <Button
          label="Solicitar"
          icon="pi pi-check"
          :disabled="!requesterName.trim()"
          @click="handleAddSongWithName"
        />
      </div>
    </template>
  </Dialog>

  <!-- Dialog: Nombre para canción de YouTube -->
  <Dialog
    v-model:visible="dialogSolicitarNombreYouTube"
    modal
    style="max-width: 94%; width: 30rem;"
  >
    <template #header>
      <h2 style="color: black;">Proporciona tu Nombre</h2>
    </template>

    <div class="solicitar-nombre-container">
      <h3 style="color: black !important;">{{ selectedYoutubeSong?.title }}</h3>
      <img :src="selectedYoutubeSong?.thumbnail" alt="Thumbnail" class="thumbnail-large" />
      <InputText
        style="width: 100%; color: black;"
        v-model="requesterNameYouTube"
        placeholder="Tu nombre"
        class="input-text"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-text"
          @click="dialogSolicitarNombreYouTube = false"
        />
        <Button
          label="Solicitar"
          icon="pi pi-check"
          :disabled="!requesterNameYouTube.trim()"
          @click="handleAddYoutubeSongWithName"
        />
      </div>
    </template>
  </Dialog>

  <!-- Dialog para cambiar de Sede -->
  <siteDialogSonando></siteDialogSonando>
</template>

<script setup>
import {Tag} from 'primevue'
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import axios from 'axios'
import ProgressBar from 'primevue/progressbar'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { Dialog } from 'primevue'
import { useSitesStore } from '@/store/site'
import siteDialogSonando from '@/components/Dialogs/siteDialogSonando.vue'

const API_BASE = 'https://backend-musica.salchimonster.com'
const WS_BASE = 'wss://backend-musica.salchimonster.com/ws'

const siteStore = useSitesStore()

// Dialog refs
const dialogPedirTema = ref(false)
const dialogSolicitarNombre = ref(false)
const dialogSolicitarNombreYouTube = ref(false)

// Playback control
const isLocalPaused = ref(true)
function pausePlayback() {
  if (player && playerState.isPlayerReady) {
    player.pauseVideo()
    isLocalPaused.value = true
  }
}
function resumePlayback() {
  if (player && playerState.isPlayerReady) {
    player.seekTo(currentPlayback.value.currentTime, true)
    player.playVideo()
    isLocalPaused.value = false
  }
}

// Selected songs + requesters
const selectedAvailableSong = ref(null)
const requesterName = ref('')
const selectedYoutubeSong = ref(null)
const requesterNameYouTube = ref('')

// ========== Single Input for Both Local & YouTube ==========
const searchTerm = ref('')

// We will debounce the YouTube search if local library yields no results.
let searchDebounce = null

// On each change of searchTerm, we show local results immediately (computed filter).
// If no local matches, after 2s we automatically do a YouTube search.
watch(searchTerm, () => {
  // Clear old YouTube results each time user starts new search
  youtubeSearchResults.value = []

  // Reset page to 0 for local
  currentPage.value = 0

  // Cancel any pending search
  clearTimeout(searchDebounce)

  // If user cleared the input, do nothing
  if (!searchTerm.value.trim()) return

  // After 2 seconds of no typing, see if local results are empty; if yes, do YouTube search
  searchDebounce = setTimeout(() => {
    if (filteredSongs.value.length === 0) {
      searchOnYouTube(searchTerm.value.trim())
    }
  }, 2000)
})

// Function to open second dialog for local track
function openSolicitarNombreDialog() {
  if (selectedAvailableSong.value) {
    dialogSolicitarNombre.value = true
  } else {
    alert('Por favor, selecciona una canción de la lista primero.')
  }
}

// Function to open second dialog for YouTube track
function openSolicitarNombreDialogYouTube() {
  if (selectedYoutubeSong.value) {
    dialogSolicitarNombreYouTube.value = true
  } else {
    alert('Por favor, selecciona una canción de los resultados de YouTube.')
  }
}

// --- Local library logic ---
const availableSongs = ref([])

const filteredSongs = computed(() => {
  return availableSongs.value.filter(song =>
    song.title.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Pagination
const currentPage = ref(0)
const itemsPerPage = 100
const totalPages = computed(() => Math.ceil(filteredSongs.value.length / itemsPerPage))

function goToNextPage() {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}
function goToPrevPage() {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}
const songsPaginated = computed(() => {
  const start = currentPage.value * itemsPerPage
  const end = start + itemsPerPage
  return filteredSongs.value.slice(start, end)
})

// --- YouTube Search ---
const youtubeSearchResults = ref([])

async function searchOnYouTube(query) {
  try {
    if (!query) return
    const resp = await axios.get(`${API_BASE}/search_youtube`, {
      params: { q: query }
    })
    youtubeSearchResults.value = resp.data
  } catch (error) {
    console.error('Error al buscar en YouTube:', error)
    alert('No se pudieron obtener resultados de YouTube. Revisa la consola.')
  }
}

// --- Request songs to queue (WebSocket) ---
let socket = null

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
      // Clean up
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

async function handleAddYoutubeSongWithName() {
  if (!selectedYoutubeSong.value || !requesterNameYouTube.value.trim()) {
    alert('Por favor, selecciona una canción y proporciona tu nombre.')
    return
  }
  try {
    const message = {
      type: 'add_song_external',
      youtubeId: selectedYoutubeSong.value.videoId,
      title: selectedYoutubeSong.value.title,
      thumbnail: selectedYoutubeSong.value.thumbnail,
      requestedBy: requesterNameYouTube.value.trim()
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
      // Clean up
      selectedYoutubeSong.value = null
      requesterNameYouTube.value = ''
      dialogSolicitarNombreYouTube.value = false
      dialogPedirTema.value = false
    } else {
      alert('No estás conectado al servidor. Intenta recargar la página.')
    }
  } catch (error) {
    console.error('Error al agregar la canción de YouTube a la cola:', error)
  }
}

// --- WebSocket and playback state ---
const currentPlayback = ref(null)
const videoQueue = ref([])

const currentTime = ref(0)
const totalDuration = ref(0)

const playerState = reactive({
  isPlayerReady: false,
  showPlayButton: false
})

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}
const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedTotalDuration = computed(() => formatTime(totalDuration.value))

const progressValue = computed(() => {
  if (totalDuration.value > 0) {
    return (currentTime.value / totalDuration.value) * 100
  }
  return 0
})

// Display portion of the queue
const startIndex = computed(() => {
  if (!currentPlayback.value || currentPlayback.value.currentIndex === undefined) return 0
  return Math.max(currentPlayback.value.currentIndex - 4, 0)
})
const displayedQueue = computed(() => videoQueue.value.slice(startIndex.value))

function getOpacity(index) {
  const total = displayedQueue.value.length
  if (total === 1) return 1
  const minOpacity = 0.2
  const maxOpacity = 1
  const opacityRange = maxOpacity - minOpacity
  const opacity = minOpacity + (index / (total - 1)) * opacityRange
  return opacity
}

// --- Connect WebSocket for this sede ---
const sedeID = computed(() => siteStore.sonando?.site_id || 'default')
let lastLoadedSongId = ref(null)

function connectWebSocket() {
  if (socket) {
    socket.close()
    socket = null
  }
  const wsUrl = `${WS_BASE}/${sedeID.value}`
  socket = new WebSocket(wsUrl)

  socket.onopen = () => {
    console.log(`Conectado al WebSocket de la sede: ${sedeID.value}`)
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'queue_update') {
        videoQueue.value = data.queue
        currentPlayback.value = data.status

        currentTime.value = data.status.currentTime
        totalDuration.value = data.status.totalDuration

        const currentSongId = data.status.currentSong ? data.status.currentSong.id : null
        if (currentSongId !== lastLoadedSongId.value) {
          loadCurrentSong(currentSongId)
          lastLoadedSongId.value = currentSongId
        }
        // If not playing, show play button
        playerState.showPlayButton = !data.status.isPlaying
      }
    } catch (error) {
      console.error('Error al parsear mensaje del WebSocket:', error)
    }
  }

  socket.onerror = (error) => {
    console.error('Error en el WebSocket:', error)
  }

  socket.onclose = () => {
    console.warn(`WebSocket cerrado para sede: ${sedeID.value}. Reintentando en 3s...`)
    setTimeout(() => {
      connectWebSocket()
    }, 3000)
  }
}

// --- YouTube Player ---
let player = null
const playerElement = ref(null)

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
      rel: 0
    },
    events: {
      onReady,
      onStateChange
    }
  })
}

function onPlayerReady(event) {
  playerState.isPlayerReady = true
  if (currentPlayback.value?.isPlaying) {
    event.target.playVideo()
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
      break
    case PlayerState.PAUSED:
      break
    case PlayerState.ENDED:
      advanceToNextSong()
      break
    default:
      break
  }
}

function loadCurrentSong(songId) {
  if (window.YT && window.YT.Player && songId) {
    if (!player) {
      player = createYouTubePlayer(playerElement.value, songId, onPlayerReady, onPlayerStateChange)
    } else {
      player.loadVideoById({
        videoId: songId,
        startSeconds: currentTime.value
      })
      if (currentPlayback.value.isPlaying) {
        player.playVideo()
      } else {
        player.pauseVideo()
      }
    }
  }
}

async function advanceToNextSong() {
  try {
    await axios.post(`${API_BASE}/next/${sedeID.value}`)
    // The backend will send a queue_update via WebSocket
  } catch (error) {
    console.error('Error al avanzar a la siguiente canción:', error)
  }
}

async function loadInitialData() {
  try {
    const [availableResp, queueResp, currentResp] = await Promise.all([
      axios.get(`${API_BASE}/available`),
      axios.get(`${API_BASE}/queue/${sedeID.value}`),
      axios.get(`${API_BASE}/current/${sedeID.value}`)
    ])

    availableSongs.value = availableResp.data
    videoQueue.value = queueResp.data
    currentPlayback.value = currentResp.data

    currentTime.value = currentPlayback.value.currentTime
    totalDuration.value = currentPlayback.value.totalDuration

    lastLoadedSongId.value = currentPlayback.value.currentSong
      ? currentPlayback.value.currentSong.id
      : null

    loadCurrentSong(lastLoadedSongId.value)
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
  }
}

onMounted(() => {
  loadYouTubeAPI(() => {
    if (currentPlayback.value?.currentSong?.id) {
      player = createYouTubePlayer(
        playerElement.value,
        currentPlayback.value.currentSong.id,
        onPlayerReady,
        onPlayerStateChange
      )
    }
  })

  // Whenever sede changes, reload data and connect WS
  watch(
    () => sedeID.value,
    async (newVal, oldVal) => {
      console.log(`Cambio de sede: ${oldVal} -> ${newVal}`)
      await loadInitialData()
      connectWebSocket()
    },
    { immediate: true }
  )
})

onUnmounted(() => {
  if (socket) {
    socket.close()
  }
})
</script>

<style scoped>
.salchimonster-container {
  max-width: 640px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

* {
  color: white;
}

.player-wrapper {
  position: relative;
  width: 100%;
}

#youtube-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.current-song-info {
  margin-top: 20px;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
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
  transition: opacity 0.5s ease, background-color 0.3s ease;
  cursor: pointer;
}

.queue-list li.current-song {
  background-color: var(--p-primary-color);
}

.queue-list li.selected-song {
  background-color: rgba(255, 166, 0, 0.239);
  font-weight: bold;
}

.song:hover {
  background-color: rgba(0, 3, 182, 0.239);
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
  min-height: 120vh;
  padding-bottom: 4rem;
}

.controls-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  position: sticky;
  top: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
}

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
  align-items: center;
  gap: 1rem;
  color: red;
}

@media (max-width: 600px) {
  .solicitar-nombre-container {
    padding: 0 1rem;
  }
}

.status-tag {
  padding: 1rem;
  animation: anim_status_tag infinite 1s;
  color: black;
  background-color: rgba(255, 0, 0, 0.582);

}


@keyframes anim_status_tag {
  20% {
    background-color: rgb(160, 45, 0);
  }

  50% {
    background-color: rgb(255, 115, 0);
  }

  80% {
    background-color: rgb(53, 0, 0);
  }
}
</style>
