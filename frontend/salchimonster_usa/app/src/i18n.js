// src/i18n.js
import { createI18n } from 'vue-i18n';

// Función auxiliar para detectar el idioma del navegador
function getBrowserLocale() {
  let lang = navigator.language || navigator.userLanguage; // "en-US", "es-ES", etc.
  // Normalmente tomamos solo la parte "en", "es", "fr"...
  lang = lang.split('-')[0];

  // Opcional: Asegurarte de que esté entre tus idiomas soportados
  if (!['es', 'en'].includes(lang)) {
    lang = 'es'; // fallback
  }
  return lang;
}

// Mensajes de ejemplo
const messages = {
  es: {
    navbar: {
      home: 'Domicilios',
      menu: 'Carta',
      // ...resto de traducciones
    },
    // ... más secciones
  },
  en: {
    navbar: {
      home: 'Home Delivery',
      menu: 'Menu',
      // ...resto de traducciones
    },
    // ... más secciones
  },
};

// Detectamos el idioma: si hay algo guardado en localStorage, lo tomamos; sino, usamos el del navegador
const savedLocale = localStorage.getItem('lang') || getBrowserLocale();

export const i18n = createI18n({
  legacy: false,          // Usar la API Composition
  locale: savedLocale,    // Idioma actual (lo que se haya guardado o detectado)
  fallbackLocale: 'es',   // Idioma de respaldo
  globalInjection: true,  // Inyecta $t globalmente
  messages,
});
