// randomHoverColor.js (o en el <script setup>)

// Función que devuelve RGBA aleatorio
function getRandomColor(opacity = 1) {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  
  export const randomHoverBorderColor = {
    mounted(el, binding) {
      el.addEventListener('mouseover', () => {
        el.style.outline = `3px solid ${getRandomColor(binding.value?.opacity || 1)}` 
        // el.style.border = '3px solid red'
      })
      el.addEventListener('mouseout', () => {
        el.style.outline = ''
      })
    },
    // OPCIONAL: si quieres limpiar
    unmounted(el) {
      el.removeEventListener('mouseover', () => {})
      el.removeEventListener('mouseout', () => {})
    }
  }
  