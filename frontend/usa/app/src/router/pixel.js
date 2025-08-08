export default {
  init() {
    // Inicialización del código de Facebook Pixel
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Reemplaza el ID por tu propio Pixel de Facebook
    fbq('init', '9692941457447887');
  },

  sendTrackingEvent(eventName, eventParams = {}) {
    if (window.fbq) {
      if (eventName === 'Purchase') {
        fbq('track', 'Purchase', {
          value: eventParams.value,
          currency: 'COP',  // Ajustar si usas otra moneda
          content_type: 'product',
          content_ids: eventParams.items.map(item => item.id)
        });
      } else {
        fbq('track', eventName);
      }
    }
  }
};
