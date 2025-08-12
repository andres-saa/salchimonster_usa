<template>
  <div class="p-1 my-5 md:my-0 col-12">
    <!-- Contenedor principal “Resumen” -->
    <div class="sticky-summary col-12 p-3 m-0">
      <h5><b>Resumen</b></h5>
      <h5><b>productos</b></h5>

      <!-- Lista de productos -->
      <div v-for="product in store.cart" :key="product.productogeneral_id">
        <div class="mb-0 pb-0 product-line">
          <div class="col-6 py-2 mb-0 m-0">
            <h6 class="m-0">
              <span class="span-minwidth">( {{ product.pedido_cantidad }} ) </span>
              <span style="font-weight: 400;"> {{ product.pedido_nombre_producto }}</span>
            </h6>

            <h6
              class="m-0 ml-3"
              style="margin-left: 1rem;"
              v-for="i in product.lista_productocombo"
              :key="i.producto_id"
            >
              ( {{ product.pedido_cantidad }} )
              <b style="margin-right: .5rem;">{{ parseInt(i.pedido_cantidad) }}</b>
              <span class="font-weight-400">{{ i.pedido_nombre }}</span>
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
          <span><b>Subtotal</b></span>
        </div>
        <div class="col-6 my-0 text-right py-0 text-end">
          <span><b>{{ formatoPesosColombianos(store.cartTotal) }}</b></span>
        </div>

        <div class="col-6 my-0 py-0" v-if="siteStore.location.site.site_id != 33">
          <span :style="siteStore.location.neigborhood.delivery_price == 0 ? 'text-decoration: line-through;' : ''">
            <b>Domicilio</b>
          </span>
        </div>
        <div v-if="siteStore.location.site.site_id != 33" class="col-6 my-0 text-right py-0 text-end">
          <span
            v-if="siteStore.location.neigborhood.delivery_price === 0 && siteStore.location.site.site_id != 33"
            class="primary-color"
          ><b>{{ route.path.includes('reservas') ? 'Ir a la sede' : 'Recoger en local' }}</b></span>
          <span v-else-if="siteStore.location.neigborhood.delivery_price > 0">
            <b>{{ formatoPesosColombianos(siteStore.location.neigborhood.delivery_price) }}</b>
          </span>
        </div>

        <div class="col-6 my-0 py-0">
          <span><b>Total</b></span>
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
          label="Volver al menu'"
          class="mt-4 button-common button-transparent button-fullwidth button-bold"
          severity="danger"
        />
      </RouterLink>

      <RouterLink to="/cart" v-else-if="route.path != '/reservas'">
        <Button
          outlined
          icon="pi pi-arrow-left"
          label="Volver al carrito"
          class="mt-4 button-common button-transparent button-fullwidth button-bold"
          severity="danger"
        />
      </RouterLink>

      <Tag
        v-if="siteStore.status?.status == 'closed' && route.path != '/reservas'"
        class="mt-2 tag-fullheight"
        severity="danger"
      >
        Cerrado, abre a las {{ siteStore.status.next_opening_time }}
      </Tag>

      <!-- CTA principales (reservas) -->
      <RouterLink to="/pay" v-if="route.path == '/reservas' && siteStore.status?.status !== 'closed'">
        <Button
          iconPos="right"
          icon="pi pi-arrow-right"
          label="Pedir"
          class="mt-2 button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
          severity="help"
        />
      </RouterLink>

      <!-- Botón “Finalizar pedido” (ir a /pay) -->
      <RouterLink to="/pay" v-else-if="route.path == '/cart'">
        <Button
          iconPos="right"
          icon="pi pi-arrow-right"
          label="Finalizar pedido"
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
        label="Finalizar pedido"
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
        :label="isCreatingPI ? 'Preparando pago…' : 'Pagar con tarjeta'"
        class="mt-2 button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
        severity="help"
      />

      <!-- Contenedor del Payment Element de Stripe -->
      <div v-if="showPaymentForm" class="stripe-wrapper mt-3">
        <div class="stripe-card p-shadow">
          <div id="payment-element"></div>
          <small class="muted block mt-2">Tus datos se procesan de forma segura con Stripe.</small>

          <div class="mt-3 flex gap-2">
            <Button
              :disabled="isConfirming || !isFormReady"
              @click="confirmStripePayment"
              icon="pi pi-credit-card"
              :label="isConfirming ? 'Confirmando…' : 'Pagar ahora'"
              class="button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
              severity="help"
            />
            <Button
              :disabled="isConfirming"
              outlined
              @click="cancelStripeForm"
              icon="pi pi-times"
              label="Cancelar"
              class="button-common button-transparent button-fullwidth button-bold"
              severity="danger"
            />
          </div>

          <p v-if="errorMessage" class="error mt-2">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatoPesosColombianos } from '@/service/utils/formatoPesos';
import { usecartStore } from '@/store/shoping_cart';
import { useSitesStore } from '@/store/site';
import { useRoute } from 'vue-router';
import { orderService } from '@/service/order/orderService';
import { onMounted, ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/store/user';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { useReportesStore } from '@/store/ventas';
import { URI, SELF_URI } from '@/service/conection';
import axios from 'axios';

// Stripe
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const reportes = useReportesStore();
const route = useRoute();
const store = usecartStore();
const siteStore = useSitesStore();
const user = useUserStore();

const sending = ref(false);
const isCreatingPI = ref(false);
const isConfirming = ref(false);
const showPaymentForm = ref(false);
const errorMessage = ref('');
const order_id = ref('');
const clientSecret = ref('');
const isFormReady = ref(false);      // ✅ listo para confirmar

// Instancias Stripe como refs
const elements = ref(null);          // Stripe Elements
const paymentElement = ref(null);    // Payment Element

onMounted(() => {
  if (user.user.payment_method_option?.id != 7 && !route.path.includes('reservas'))
    siteStore.setNeighborhoodPrice();
  else siteStore.setNeighborhoodPriceCero();
});

// si tenías lógica en update(), la dejas aquí para evitar errores
const update = () => {};

watch(
  () => store.cart.additions,
  () => {
    update();
  },
  { deep: true }
);

const ZERO_DECIMAL = new Set([
  'bif','clp','djf','gnf','jpy','kmf','krw','mga','pyg','rwf','ugx','vnd','vuv','xaf','xof','xpf'
]);
const toMinor = (amountMajor, currency) => {
  const c = (currency || '').toLowerCase();
  return ZERO_DECIMAL.has(c) ? Math.round(amountMajor) : Math.round(amountMajor * 100);
};

const stripeApiBase = import.meta.env.VITE_STRIPE_API_URI || 'https://api.stripe.salchimonster.com';

const pay = async () => {
  if (showPaymentForm.value || isCreatingPI.value) return;
  errorMessage.value = '';
  isCreatingPI.value = true;

  try {
    // 1) Crear/guardar la orden en backend (pendiente de pago)
    order_id.value = await orderService.sendOrder();
    if (!order_id.value) throw new Error('No se pudo crear la orden');

    // 2) Total y moneda
    const totalAPagar = store.cartTotal + siteStore.location.neigborhood.delivery_price;
    const currency = siteStore?.location?.site?.time_zone === 'America/New_York' ? 'usd' : 'cop';
    const amountMinor = toMinor(totalAPagar, currency);

    // 3) PaymentIntent
    const { data } = await axios.post(`${stripeApiBase}/create-payment-intent`, {
      amount: amountMinor,
      currency,
      metadata: {
        order_id: order_id.value,
        site_id: siteStore?.location?.site?.site_id || '',
        user_id: user?.user?.id || user?.user?.user_id || '',
      },
    });

    clientSecret.value = data.clientSecret;

    // 4) Mostrar contenedor y esperar a que exista en el DOM
    showPaymentForm.value = true;
    await nextTick();

    // 5) Inicializar y montar el Payment Element
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe no inicializó correctamente');

    elements.value = stripe.elements({
      clientSecret: clientSecret.value,
      appearance: { theme: 'stripe' },
    });

    // evitar múltiples instancias
    try { paymentElement.value?.unmount(); } catch {}
    paymentElement.value = elements.value.create('payment');
    paymentElement.value.mount('#payment-element');

    isFormReady.value = true;  // ✅ ahora sí se puede confirmar
  } catch (err) {
    console.error('Error iniciando pago con Stripe:', err);
    errorMessage.value = err?.response?.data?.detail || err?.message || 'No se pudo iniciar el pago';
    // rollback de estado
    try { paymentElement.value?.unmount(); } catch {}
    paymentElement.value = null;
    elements.value = null;
    isFormReady.value = false;
    showPaymentForm.value = false;
  } finally {
    isCreatingPI.value = false;
  }
};

const confirmStripePayment = async () => {
  try {
    errorMessage.value = '';

    if (!isFormReady.value || !elements.value) {
      throw new Error('El formulario de pago aún no está listo. Intenta de nuevo.');
    }

    isConfirming.value = true;

    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe no inicializó correctamente');

    // (Opcional) validar campos antes de confirmar:
    // const { error: submitError } = await elements.value.submit();
    // if (submitError) throw submitError;

    const { error } = await stripe.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${SELF_URI}/gracias-stripe?order_id=${order_id.value}`,
      },
    });

    if (error) {
      errorMessage.value = error.message || 'No se pudo confirmar el pago';
      isConfirming.value = false; // permitir reintento
    }
  } catch (err) {
    console.error('Error al confirmar el pago:', err);
    errorMessage.value = err?.message || 'Error inesperado al confirmar';
    isConfirming.value = false;
  }
};

const cancelStripeForm = () => {
  errorMessage.value = '';
  try { paymentElement.value?.unmount(); } catch {}
  paymentElement.value = null;
  elements.value = null;
  isFormReady.value = false;
  showPaymentForm.value = false;
  isConfirming.value = false;
  clientSecret.value = '';
  // limpiar contenedor
  const el = document.getElementById('payment-element');
  if (el) el.innerHTML = '';
};

onBeforeUnmount(() => {
  try { paymentElement.value?.unmount(); } catch {}
  paymentElement.value = null;
  elements.value = null;
  isFormReady.value = false;
});
</script>

<style scoped>
/* --- Clases nuevas para reemplazar estilos en línea --- */
.sticky-summary {
  position: sticky;
  padding: 1rem;
  max-height: min-content;
  background-color: white;
  box-shadow: 0 1rem 1rem #00000020;
  top: 5rem;
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
.stripe-card { background: #fff; border-radius: 0.5rem; padding: 1rem; }
.muted { color: #666; }
.error { color: #c0392b; }
</style>
