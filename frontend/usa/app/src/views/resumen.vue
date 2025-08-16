<template>
  <div class="p-1 my-5 md:my-0 col-12">
    <!-- Contenedor principal “Resumen” -->
    <div class="sticky-summary  col-12 p-3 m-0"  :style="!sticky? '  top: 3.5rem;' : 'top: 0rem;'">
      <h5><b> {{ t('summary') }} </b></h5>
      <h5><b>{{ t('products') }}</b></h5>

      <!-- Lista de productos -->
      <div v-for="product in store.cart" :key="product.productogeneral_id">
        <div class="mb-0 pb-0 product-line">
          <div class="col-6 py-2 mb-0 m-0">
            <h6 class="m-0">
              <span class="span-minwidth">( {{ product.pedido_cantidad }} ) </span>
              <span style="font-weight: 400;"> {{ product.pedido_nombre_producto }}</span>
            </h6>
          </div>

          <div class="col-6 my-0 text-right py-2">
            <h6 v-if="product.modificadorseleccionList.length < 1" class="text-end">
              {{ formatoPesosColombianos(product.pedido_precio * product.pedido_cantidad) }}
            </h6>
            <h6 v-else class="text-end">
              {{ formatoPesosColombianos(product.pedido_base_price * product.pedido_cantidad) }}
            </h6>
          </div>
        </div>

        <div class="addition-item" v-for="item in product.modificadorseleccionList" :key="item">
          <div class="addition-item-inner">
            <span class="text adicion">
              <span><b>- ( {{ product.pedido_cantidad }} ) {{ item.modificadorseleccion_cantidad }}</b></span>
              {{ item.modificadorseleccion_nombre }}
            </span>

            <span v-if="item.pedido_precio > 0" class="pl-2 text-sm">
              <b>
                {{ formatoPesosColombianos(item.pedido_precio * item.modificadorseleccion_cantidad * product.pedido_cantidad) }}
              </b>
            </span>
          </div>
        </div>
      </div>

      <div class="col-12 p-0 mt-1"></div>
      <hr class="p-0 mt-2" />

      <!-- Subtotales y totales -->
      <div class="grid summary-grid">
        <div class="col-6 my-0 py-0">
          <span><b>{{ t('subtotal') }}</b></span>
        </div>
        <div class="col-6 my-0 text-right py-0 text-end">
          <span><b>{{ formatoPesosColombianos(store.cartTotal) }}</b></span>
        </div>

        <div class="col-6 my-0 py-0" >
          <span :style="siteStore.location.neigborhood.delivery_price == 0 ? 'text-decoration: line-through;' : ''">
            <b>{{ t('delivery') }}</b>
          </span>
        </div>
        <div  class="col-6 my-0 text-right py-0 text-end">
          <span
            v-if="siteStore.location.neigborhood.delivery_price === 0 "
            class="primary-color"
          ><b>{{ route.path.includes('reservas') ? t('go_to_store') : t('pick_up_store') }}</b></span>
          <span v-else-if="siteStore.location.neigborhood.delivery_price > 0">
            <b>{{ formatoPesosColombianos(siteStore.location.neigborhood.delivery_price) }}</b>
          </span>
        </div>

        <div class="col-6 my-0 py-0">
          <span><b>{{ t('total') }}</b></span>
        </div>
        <div
          class="col-6 my-0 text-right py-0 text-end"
          v-if="siteStore.location.neigborhood.delivery_price || siteStore.location.neigborhood.delivery_price === 0"
        >
          <span>
            <b>
              {{ formatoPesosColombianos(store.cartTotal + siteStore.location.neigborhood.delivery_price) }}
            </b>
          </span>
        </div>
      </div>

      <!-- Navegación -->
      <RouterLink to="/" v-if="route.path.includes('cart')">
        <Button
          outlined
          icon="pi pi-shopping-cart"
          :label="t('back_to_menu')"
          class="mt-4 button-common button-transparent button-fullwidth button-bold"
          severity="danger"
        />
      </RouterLink>

      <RouterLink to="/cart" v-else-if="route.path != '/reservas'">
        <Button
          outlined
          icon="pi pi-arrow-left"
          :label="t('back_to_cart')"
          class="mt-4 button-common button-transparent button-fullwidth button-bold"
          severity="danger"
        />
      </RouterLink>

      <Tag
        v-if="siteStore.status?.status == 'closed' && route.path != '/reservas'"
        class="mt-2 tag-fullheight"
        severity="danger"
      >
        {{ t('closed_opens_at') }} {{ siteStore.status.next_opening_time }}
      </Tag>

      <!-- CTA principales (reservas) -->
      <RouterLink to="/pay" v-if="route.path == '/reservas' && siteStore.status?.status !== 'closed'">
        <Button
          iconPos="right"
          icon="pi pi-arrow-right"
          :label="t('order')"
          class="mt-2 button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
          severity="help"
        />
      </RouterLink>

      <!-- Botón “Finalizar pedido” (ir a /pay) -->
      <RouterLink to="/pay" v-else-if="route.path == '/cart'">
        <Button
          iconPos="right"
          icon="pi pi-arrow-right"
          :label="t('place_order')"
          class="mt-2 button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
          severity="help"
        />
      </RouterLink>

      <!-- Finalizar sin tarjeta (otros métodos) -->
      <Button
        :disabled="reportes.loading.visible"
        v-else-if="
          route.path == '/pay' &&
          !reportes.loading.visible &&
          siteStore.status?.status !== 'closed' &&
          user.user.payment_method_option?.id != 9
        "
        @click="orderService.sendOrder()"
        iconPos="right"
        icon="pi pi-arrow-right"
        :label="t('place_order')"
        class="mt-2 button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
        severity="help"
      />

      <!-- Stripe: inicializar Payment Element cuando el método es 9 (tarjeta) -->
      <Button
        :disabled="reportes.loading.visible || isCreatingPI"
        v-else-if="
          route.path == '/pay' &&
          !reportes.loading.visible &&
          siteStore.status?.status == 'closed' &&
          user.user.payment_method_option?.id == 9 &&
          !showPaymentForm
        "
        @click="pay"
        iconPos="right"
        icon="pi pi-arrow-right"
        :label="isCreatingPI ? t('preparing_payment') : t('pay_with_card')"
        class="mt-2 button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
        severity="help"
      />

      <!-- === Stripe en Dialog (único cambio) === -->
      <Dialog
        v-model:visible="showPaymentForm"
        modal
        :header="t('stripe_dialog_title')"
        :draggable="false"
        :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
        style="width: 500px; max-width: 95vw;"
        @hide="cancelStripeForm"
      >
        <div class="stripe-wrapper mt-3">
          <div class="stripe-card">
            <div id="payment-element"></div>
            <small style="margin: 1rem 0;" class="muted block mt-2">{{ t('stripe_secure_note') }}</small>

            <div class="mt-3 flex gap-2">
              <Button
                :disabled="isConfirming || !isFormReady"
                @click="confirmStripePayment"
                icon="pi pi-credit-card"
                :label="isConfirming ? t('confirming') : t('pay_now')"
                class="button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
                severity="help"
              />
              <Button
                :disabled="isConfirming"
                outlined
                @click="cancelStripeForm"
                icon="pi pi-times"
                :label="t('cancel')"
                class="button-common button-transparent button-fullwidth button-bold"
                severity="danger"
              />
            </div>

            <p v-if="errorMessage" class="error mt-2">{{ errorMessage }}</p>
          </div>
        </div>
      </Dialog>
      <!-- === /Stripe en Dialog === -->
    </div>
  </div>
</template>

<script setup>
import { formatoPesosColombianos } from '@/service/utils/formatoPesos';
import { usecartStore } from '@/store/shoping_cart';
import { useSitesStore } from '@/store/site';
import { useRoute } from 'vue-router';
import { orderService } from '@/service/order/orderService';
import { onMounted, ref, watch, nextTick, onBeforeUnmount, computed } from 'vue';
import { useUserStore } from '@/store/user';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import { useReportesStore } from '@/store/ventas';
import { URI, SELF_URI } from '@/service/conection';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

// ───────────── I18N mínimo ─────────────
const user = useUserStore();
const lang = computed(() => {
  const v = (user?.lang?.name || 'es').toString().toLowerCase();
  return v === 'en' ? 'en' : 'es';
});
const DICT = {
  es: {
    summary: 'Resumen',
    products: 'Productos',
    subtotal: 'Subtotal',
    delivery: 'Domicilio',
    pick_up_store: 'Recoger en local / $0',
    go_to_store: 'Ir a la sede',
    total: 'Total',
    back_to_menu: "Volver al menú",
    back_to_cart: 'Volver al carrito',
    closed_opens_at: 'Cerrado, abre a las',
    order: 'Pedir',
    place_order: 'Finalizar pedido',
    pay_with_card: 'Pagar con tarjeta',
    preparing_payment: 'Preparando pago…',
    stripe_secure_note: 'Tus datos se procesan de forma segura con Stripe.',
    confirming: 'Confirmando…',
    pay_now: 'Pagar ahora',
    cancel: 'Cancelar',
    stripe_dialog_title: 'Pagar con tarjeta',
    not_ready: 'El formulario de pago aún no está listo. Intenta de nuevo.',
    stripe_init_error: 'Stripe no inicializó correctamente',
    confirm_error: 'No se pudo confirmar el pago',
    unexpected_confirm_error: 'Error inesperado al confirmar',
    create_order_error: 'No se pudo crear la orden',
    start_payment_error: 'No se pudo iniciar el pago',
    site_required: 'Selecciona una sede antes de pagar.',
    invalid_site: 'La sede seleccionada no es válida.',
  },
  en: {
    summary: 'Summary',
    products: 'Products',
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    pick_up_store: 'Pick up in-store / $0',
    go_to_store: 'Go to the store',
    total: 'Total',
    back_to_menu: 'Back to menu',
    back_to_cart: 'Back to cart',
    closed_opens_at: 'Closed, opens at',
    order: 'Order',
    place_order: 'Place order',
    pay_with_card: 'Pay with card',
    preparing_payment: 'Preparing payment…',
    stripe_secure_note: 'Your data is processed securely with Stripe.',
    confirming: 'Confirming…',
    pay_now: 'Pay now',
    cancel: 'Cancel',
    stripe_dialog_title: 'Pay with card',
    not_ready: 'The payment form is not ready yet. Please try again.',
    stripe_init_error: 'Stripe failed to initialize',
    confirm_error: 'Could not confirm the payment',
    unexpected_confirm_error: 'Unexpected error when confirming',
    create_order_error: 'Order could not be created',
    start_payment_error: 'Could not start the payment',
    site_required: 'Select a site before paying.',
    invalid_site: 'The selected site is invalid.',
  },
};
const t = (key) => (DICT[lang.value] && DICT[lang.value][key]) || (DICT.es[key] || key);

// Sticky on scroll
const lastScrollY = ref(0)
const sticky = ref(false)
const handleScroll = () => {
  const currentScroll = window.scrollY
  if (currentScroll > lastScrollY.value) {
    sticky.value = true
  } else if (currentScroll < lastScrollY.value) {
    sticky.value = false
  }
  lastScrollY.value = currentScroll
}
onMounted(() => {
  lastScrollY.value = window.scrollY
  window.addEventListener('scroll', handleScroll)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Stores / ruta
const reportes = useReportesStore();
const route = useRoute();
const store = usecartStore();
const siteStore = useSitesStore();

// Estados de pago
const sending = ref(false);
const isCreatingPI = ref(false);
const isConfirming = ref(false);
const showPaymentForm = ref(false);
const errorMessage = ref('');
const order_id = ref('');
const clientSecret = ref('');
const isFormReady = ref(false);

// Instancias Stripe
const elements = ref(null);
const paymentElement = ref(null);
const lastStripe = ref(null);

// API base
const stripeApiBase = import.meta.env.VITE_STRIPE_API_URI || 'https://api.stripe.salchimonster.com';

// Site actual (multi-tenant)
const currentSiteId = computed(() => {
  return siteStore?.location?.site?.site_id || siteStore?.site?.site_id || '';
});

// Cache de Stripe por publishable key
const stripeCache = new Map();
const getStripeByKey = async (pk) => {
  if (!pk) return null;
  if (!stripeCache.has(pk)) {
    stripeCache.set(pk, loadStripe(pk));
  }
  return await stripeCache.get(pk);
};

// si tenías lógica en update(), la dejamos para evitar errores
const update = () => {};
watch(
  () => store.cart.additions,
  () => { update(); },
  { deep: true }
);

// Currencies helpers
const ZERO_DECIMAL = new Set([
  'bif','clp','djf','gnf','jpy','kmf','krw','mga','pyg','rwf','ugx','vnd','vuv','xaf','xof','xpf'
]);
const toMinor = (amountMajor, currency) => {
  const c = (currency || '').toLowerCase();
  return ZERO_DECIMAL.has(c) ? Math.round(amountMajor) : Math.round(amountMajor * 100);
};

// Flujo: crear PI y montar Payment Element
const pay = async () => {
  if (showPaymentForm.value || isCreatingPI.value) return;
  errorMessage.value = '';

  const siteId = String(currentSiteId.value || '').trim();
  if (!siteId) {
    errorMessage.value = t('site_required');
    return;
  }

  isCreatingPI.value = true;

  try {
    // 1) Crear/guardar la orden en backend (pendiente de pago)
    order_id.value = await orderService.sendOrder();
    if (!order_id.value) throw new Error(t('create_order_error'));

    // 2) Total y moneda
    const delivery = Number(siteStore?.location?.neigborhood?.delivery_price ?? 0);
    const totalAPagar = Number(store.cartTotal) + delivery;
    const currency = 'usd';
    const amountMinor = toMinor(totalAPagar, currency);

    // 3) PaymentIntent (enviamos site_id toplevel y en metadata)
    const url = `${stripeApiBase}/create-payment-intent?site=${encodeURIComponent(siteId)}`;
    const { data } = await axios.post(
      url,
      {
        amount: amountMinor,
        currency,
        metadata: {
          order_id: order_id.value,
          site_id: siteId,
          user_id: user?.user?.id || user?.user?.user_id || '',
        },
      },
      {
        headers: {
          'X-Site': siteId, // <- clave: el backend toma el site desde aquí
        },
      }
    );

    clientSecret.value = data.clientSecret;

    // Publishable key por sitio (si backend la envía). Si no, fallback al .env
    const publishableKey = data.publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) throw new Error(t('stripe_init_error'));

    // 4) Mostrar dialog y montar Payment Element
    showPaymentForm.value = true;
    await nextTick();

    const stripe = await getStripeByKey(publishableKey);
    if (!stripe) throw new Error(t('stripe_init_error'));

    lastStripe.value = stripe;

    try { paymentElement.value?.unmount(); } catch {}
    elements.value = stripe.elements({
      clientSecret: clientSecret.value,
      appearance: { theme: 'stripe' },
    });
    paymentElement.value = elements.value.create('payment');
    paymentElement.value.mount('#payment-element');

    isFormReady.value = true;
  } catch (err) {
    console.error('Error iniciando pago con Stripe:', err);
    errorMessage.value = err?.response?.data?.detail || err?.message || t('start_payment_error');
    try { paymentElement.value?.unmount(); } catch {}
    paymentElement.value = null;
    elements.value = null;
    lastStripe.value = null;
    isFormReady.value = false;
    showPaymentForm.value = false;
  } finally {
    isCreatingPI.value = false;
  }
};

// Confirmación del pago
const confirmStripePayment = async () => {
  try {
    errorMessage.value = '';
    if (!isFormReady.value || !elements.value || !lastStripe.value) {
      throw new Error(t('not_ready'));
    }

    isConfirming.value = true;

    const { error } = await lastStripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${SELF_URI}/gracias-stripe?order_id=${order_id.value}`,
      },
    });

    if (error) {
      errorMessage.value = error.message || t('confirm_error');
      isConfirming.value = false; // permitir reintento
    }
  } catch (err) {
    console.error('Error al confirmar el pago:', err);
    errorMessage.value = err?.message || t('unexpected_confirm_error');
    isConfirming.value = false;
  }
};

// Cancelación / limpieza
const cancelStripeForm = () => {
  errorMessage.value = '';
  try { paymentElement.value?.unmount(); } catch {}
  paymentElement.value = null;
  elements.value = null;
  lastStripe.value = null;
  isFormReady.value = false;
  showPaymentForm.value = false;
  isConfirming.value = false;
  clientSecret.value = '';
  const el = document.getElementById('payment-element');
  if (el) el.innerHTML = '';
};

onBeforeUnmount(() => {
  try { paymentElement.value?.unmount(); } catch {}
  paymentElement.value = null;
  elements.value = null;
  lastStripe.value = null;
  isFormReady.value = false;
});

// onMounted(() => {
//   if (user.user.payment_method_option?.id != 7 && !route.path.includes('reservas'))
//     siteStore.setNeighborhoodPrice();
//   else siteStore.setNeighborhoodPriceCero();
// });
</script>

<style scoped>
/* --- Clases nuevas para reemplazar estilos en línea --- */
.sticky-summary {
 position: sticky;
 transition: all ease .3s;
  padding: 1rem;
  max-height: min-content;
  background-color: white;
  box-shadow: 0 1rem 1rem #00000020;
  top: 1rem;
  border-radius: 0.5rem;
  z-index: 1000;
}
.product-line { display: flex; justify-content: space-between; }
.span-minwidth { min-width: 3rem; width: 100%; }
.text-end { text-align: end; }
.addition-group { position: relative; border-radius: 0.3rem; }
.addition-item { display: flex; margin-left: 1rem; gap: 1rem; align-items: center; }
.addition-item-inner { display: flex; width: 100%; gap: 1rem; justify-content: space-between; }
.summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
.primary-color { color: var(--primary-color); }
.font-weight-400 { font-weight: 400; }
.button-common { outline: none; margin: 0.5rem 0; }
.button-no-outline { outline: none; }
.button-no-border { border: none; }
.button-fullwidth { width: 100%; }
.button-bold { font-weight: bold; }
.button-transparent { background-color: rgba(0, 0, 0, 0); }
.button-black { background-color: black; }
.tag-fullheight { width: 100%; height: 2.5rem; }
.p-shadow { box-shadow: 0 0.3rem 5px rgba(0, 0, 0, 0.15); }

button { text-transform: uppercase; }
* { text-transform: uppercase; font-size: 0.9rem; }
*::first-letter { text-transform: uppercase; }

/* Stripe */
.stripe-wrapper { width: 100%; }
.stripe-card { background: #fff; border-radius: 0.5rem; padding: 1rem 0; }
.muted { color: #666; }
.error { color: #c0392b; }
</style>
