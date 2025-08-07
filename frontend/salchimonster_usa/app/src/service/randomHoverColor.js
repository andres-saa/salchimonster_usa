// randomHoverColor.js (o en el <script setup>)

// Función que devuelve RGBA aleatorio
function getRandomColor(opacity = 1) {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  
  export const randomHoverColor = {
    mounted(el, binding) {
      el.addEventListener('mouseover', () => {
        el.style.backgroundColor = getRandomColor(binding.value?.opacity || 0.239)
      })
      el.addEventListener('mouseout', () => {
        el.style.backgroundColor = ''
      })
    },
    // OPCIONAL: si quieres limpiar
    unmounted(el) {
      el.removeEventListener('mouseover', () => {})
      el.removeEventListener('mouseout', () => {})
    }
  }
  