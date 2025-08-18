<template>
  <Dialog style="max-width: 95vw;" :header="t('your_order')" v-if="order.order_id" v-model:visible="order.order_id" modal :closable="false">

    <template #header>

      <div style="display: flex;width: 100%;align-items: center; justify-content: space-between;">

        <span>
          <b>
            {{ t('your_order') }}
          </b>


        </span>

<Select
v-model="user.lang"
:options="languages"
optionLabel="label"
style="max-width: min-content;padding: 0;background-color: transparent  ;color: white;border: 1px solid var(--p-primary-color);"
class="lang-dropdown"
>
<template #value="sp">
  <img v-if="sp.value" :src="sp.value.flag" class="flag-img" />
              <span style="margin-left: .5rem;">{{ sp.value.label }}</span>

</template>
<template #option="sp">
  <div class="flag-option">
    <img :src="sp.option.flag" class="flag-img" />
    <span style="margin-left: .5rem;">{{ sp.option.label }}</span>
  </div>
</template>
</Select>
      </div>



</template>


<div
      class="p-2 col-12 my-2"
      style="height: auto;  padding: 0rem; display: flex; gap: 1rem; justify-content: center; align-items: center;"
    >






      <div
        class="shadow-7 p-4"
        style="border-radius: 0.5rem; max-width: 500px; display: flex; flex-direction: column; gap: 0.5rem; font-size: 1rem; background-color: white;padding: 0rem;"
      >
        <!-- Nombre de usuario -->
        <p class="text-4xl text-center mt-5" style="font-weight: bold; text-align: center;">
          🤩{{ order?.pe_json?.cliente?.cliente_nombres?.toUpperCase() }}
          {{ order?.pe_json?.cliente?.cliente_apellidos?.toUpperCase() }}🤩
        </p>

        <p class="text-2xl text-center" style="font-weight: bold; text-align: center;">
          🔥{{ t('thanks') }}🔥
        </p>

        <div id="factura" style="width: 100%; text-transform: uppercase;">
          <div id="factura" style="width: 100%;">
            <Tag class="tag mb-2" severity="success" v-if="order.responsible_id">{{ t('payment_authorized') }}</Tag> <br />
            <Tag class="tag" severity="success" v-if="order.responsible_id">{{ order.name }}</Tag>

            <div style="width: auto;">
              <p id="id" style="font-weight: bold;min-width: 100%; width: max-content; text-align: center; color: black; margin:0rem;">
                ID: {{ order.order_id }}
              </p>

              <p id="id" style="font-weight: bold;min-width: 100%; width: max-content; text-align: center; color: black; margin:0rem;">
                {{ order.user_name }} {{ order.second_name }} {{ order.first_last_name }} {{ order.second_last_name }}
              </p>

              <p style="padding: 0;color: black;text-align: center; margin: auto; margin-bottom: 1rem; width: max-content;min-width: max-content;display: flex;justify-content: center; flex-direction: column ">
                <b>{{ t('date') }}: {{ order.latest_status_timestamp?.split('T')[0] }}</b>
                <b>{{ t('time') }}: {{ order.latest_status_timestamp?.split('T')[1]?.split(':')?.slice(0,2)?.join(':') }}</b>
              </p>

              <div style="font-weight: bold;color:white;margin: 0; background-color: black;align-items: center;display: grid; grid-template-columns: auto auto;">
                <div class="px-2" style="width: 100%;"><b>{{ t('products') }}</b></div>
                <div class="px-2"><p style="text-align: end;font-weight: bold;"><b>{{ t('total') }}</b></p></div>
              </div>

              <div v-for="product in order.pe_json?.listaPedidos" :key="product.signature">
                <div style="display: grid; gap:0 1rem; grid-template-columns: auto auto;">
                  <p v-if="store.currentOrder?.site_id == 32" class="p-0 m-0">
                    <b>( {{ product.pedido_cantidad }} kg )</b> {{ product.pedido_nombre_producto }}
                    ( {{ product.pedido_cantidad / product.presentacion }} {{ product.presentation_unit_measure }} )
                  </p>
                  <p v-else class="p-0 m-0">
                    <b>( {{ product.pedido_cantidad }} )</b> {{ product.pedido_nombre_producto }}
                  </p>

                  <div>
                    <p v-if="product.pedido_base_price" style="text-align: end;color: black;">
                      {{ formatoPesosColombianos(product.pedido_base_price * product.pedido_cantidad) }}
                    </p>
                    <p v-else style="text-align: end;color: black;">
                      {{ formatoPesosColombianos(product.pedido_precio) }}
                    </p>
                  </div>
                </div>

                <p v-if="product.lista_productocombo?.length > 0" class="p-0 m-0"><b>{{ t('combo_includes') }}</b></p>
                <p v-for="i in product.lista_productocombo" :key="i.pedido_nombre" class="p-0 m-0 ml-5"> -- <b>{{ i.pedido_cantidad }}</b> {{ i.pedido_nombre }}</p>

                <div class="p-0 m-0" style="display: flex; justify-content: space-between;" v-for="i in product.modificadorseleccionList" :key="i.modificadorseleccion_nombre">
                  <p class="p-0 m-0">- ( {{ product.pedido_cantidad }} ) <b>{{ i.modificadorseleccion_cantidad }}</b> {{ i.modificadorseleccion_nombre }}</p>
                  <p class="p-0 m-0" style="text-align: end;">
                    {{ formatoPesosColombianos(i.pedido_precio * i.modificadorseleccion_cantidad * product.pedido_cantidad) }}
                  </p>
                </div>

                <div style="background-color: rgba(0, 0, 0, 0.286); height: 1px;"></div>
              </div>

              <div style="display: grid ;margin-top: 1rem; grid-template-columns: auto auto">
                <div><span style="font-weight: bold;"><b>{{ t('subtotal') }}</b></span></div>
                <div>
                  <p style="text-align: end;font-weight: bold; color: black;">
                    <b>{{ formatoPesosColombianos(order.pe_json.delivery.delivery_pagocon - order.pe_json?.delivery?.delivery_costoenvio) }}</b>
                  </p>
                </div>

                <div><span class="m-0" style="font-weight: bold;"><b>{{ t('delivery_fee') }}</b></span></div>
                <div>
                  <p class="m-0 p-0" style="text-align: end;font-weight: bold;color: black;">
                    <b>{{ formatoPesosColombianos(order.pe_json?.delivery?.delivery_costoenvio) }}</b>
                  </p>
                </div>

                <div><span style="font-weight: bold;color: black;"><b>{{ t('total') }}</b></span></div>
                <div>
                  <p class="m-0 p-0" style="text-align: end;color: black;font-weight: bold;">
                    <b>{{ formatoPesosColombianos(order.pe_json.delivery.delivery_pagocon) }}</b>
                  </p>
                </div>
              </div>

              <p class="px-2" style="font-weight: bold;background-color: black;color: white;padding: 0; margin: 0; margin-top: 0.5rem;"><b>{{ t('notes') }}</b></p>
              <p class="notas p-2 m-0" style="border: 1px solid; margin: 0; color: black; padding: 0.5rem;">
                {{ order.order_notes?.toLowerCase() }}
              </p>

              <p class="px-2" style="background-color: black;font-weight: bold;margin: 1rem 0; color: white;"><b>{{ t('client') }}</b></p>

              <div style="display: grid;gap:0rem 2rem; grid-template-columns: auto auto; align-items: start;">
                <div><span><b>{{ t('name') }}</b></span></div>
                <div><span style="text-align: start;color: black;">{{ order.user_name }} {{ order.second_name }} {{ order.first_last_name }} {{ order.second_last_name }}</span></div>

                <div v-if="order.site_id == 32"><span><b>{{ t('id_number') }}</b></span></div>
                <div v-if="order.site_id == 32"><span style="text-align: start;color: black;">{{ order.cedula_nit }}</span></div>

                <div><span><b>{{ t('delivery_method') }}</b></span></div>
                <div><span style="text-align: start;color: black;">{{ translatedOrderType }}</span></div>

                <div v-if="order.site_id == 32"><span><b>{{ t('delivery_time') }}</b></span></div>
                <div v-if="order.site_id == 32"><p style="text-align: start;color: black;">{{ order.pe_json.delivery.delivery_horaentrega }}</p></div>

                <div v-if="order.placa"><span><b>{{ t('plate') }}</b></span></div>
                <div v-if="order.placa"><p style="text-align: start;color: black;">{{ order.placa }}</p></div>

                <div><span><b>{{ t('phone') }}</b></span></div>
                <div><span style="text-align: start;color: black;">{{ order.user_phone }}</span></div>

                <div v-if="order.site_id == 32"><span><b>{{ t('email') }}</b></span></div>
                <div v-if="order.site_id == 32"><span style="text-align: start;color: black;">{{ order.email }}</span></div>

                <div v-if="!isPickup"><span><b>{{ t('address') }}</b></span></div>
                <div v-if="!isPickup"><span style="text-align: start;color: black;">{{ order.user_address?.toLowerCase() }}</span></div>

                <div><span><b>{{ t('payment_method') }}</b></span></div>
                <div><span style="text-align: start;color: black;">{{ order.payment_method?.toLowerCase() }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- (Opcional) información si regresas con session_id -->
        <div v-if="route.query?.session_id" style="margin-top:1rem;">
          <h4>{{ t('payment_info') }}</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr;">
            <div><h5> {{ t('session_id') }} </h5></div>
            <div><h5 style="font-weight: 300;"> {{ route.query.session_id }}</h5></div>
            <div><h5> {{ t('status') }} </h5></div>
            <div><h5 style="font-weight: 300;"> {{ t('verified_webhook') }} </h5></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Footer (grises) ===== -->
    <template #footer>
      <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
        <Button
          :disabled="isCreatingPI"
          @click="pay"
          icon="pi pi-credit-card"
          style="width:100%; border:none; outline:none; background-color:#000; color:#fff;"
          :label="isCreatingPI ? t('preparing_payment') : t('pay')"
        />
        <a :href="whatsappUrl3" target="_blank" style="width: 100%;">
          <Button
            icon="pi pi-whatsapp"
            severity="secondary"
            class="wsp"
            style="font-weight: bold; background-color: #333; color:#fff; border: none; width: 100%;"
            :label="t('contact_us')"
          />
        </a>
      </div>
    </template>
    <!-- ===== /Footer ===== -->
  </Dialog>

  <div v-else style="display: flex; align-items: center;justify-content: center;height: 90vh;width: 100vw;">
    <h2>{{ t('loading') }}</h2>
  </div>

  <!-- === Stripe en Dialog (grises + textos con i18n) === -->
  <Dialog
    v-model:visible="showPaymentForm"
    modal
    :header="t('pay_with_card')"
    :draggable="false"
    :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
    style="width: 500px; max-width: 95vw;"
    @hide="cancelStripeForm"
  >
    <div class="stripe-wrapper mt-3">
      <div class="stripe-card">
        <div id="payment-element"></div>
        <small style="margin: 1rem 0;" class="muted block mt-2">
          {{ t('secure_stripe') }}
        </small>

        <div class="mt-3 flex gap-2">
          <Button
            :disabled="isConfirming || !isFormReady"
            @click="confirmStripePayment"
            icon="pi pi-credit-card"
            :label="isConfirming ? t('confirming') : t('pay_now')"
            class="button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
            severity="secondary"
            style="background-color:#000; color:#fff;"
          />
          <Button
            :disabled="isConfirming"
            outlined
            @click="cancelStripeForm"
            icon="pi pi-times"
            :label="t('cancel')"
            severity="secondary"
            style="border-color:#666; color:#333;"
            class="button-common button-transparent button-fullwidth button-bold"
          />
        </div>

        <p v-if="errorMessage" class="error mt-2">{{ errorMessage }}</p>
      </div>
    </div>
  </Dialog>
  <!-- === /Stripe en Dialog === -->
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from "vue";
import { usecartStore } from "@/store/shoping_cart";
import { useUserStore } from "@/store/user";
import { useSitesStore } from "@/store/site";
import Button from "primevue/button";
import router from "@/router";
import { formatoPesosColombianos } from "@/service/utils/formatoPesos";
import { useReportesStore } from "@/store/ventas";
import { useRoute } from "vue-router";
import { fetchService } from "@/service/utils/fetchService";
import { URI, SELF_URI } from "@/service/conection";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import Select from 'primevue/select'
// Stores
const store = usecartStore();
const user = useUserStore();
const sitestore = useSitesStore();
const reportes = useReportesStore();
const route = useRoute();

const languages = [
  { name: 'es', label: 'Español', flag: 'https://flagcdn.com/w20/co.png' },
  { name: 'en', label: 'English',  flag: 'https://flagcdn.com/w20/us.png' }
]

// ===== i18n simple (ES/EN) =====
const lang = computed(() => (user?.lang?.name || 'es').toLowerCase() === 'es' ? 'es' : 'en');

const MESSAGES = {
  es: {
    your_order: "Tu pedido",
    thanks: "¡Muchas gracias por tu compra!",
    payment_authorized: "Pago autorizado",
    date: "Fecha",
    time: "Hora",
    products: "Productos",
    total: "Total",
    combo_includes: "Combo incluye",
    subtotal: "Subtotal",
    delivery_fee: "Domicilio",
    notes: "Notas",
    client: "Cliente",
    name: "Nombre",
    id_number: "Cédula / NIT",
    delivery_method: "Método de entrega",
    delivery_time: "Fecha de entrega",
    plate: "Placa del vehículo",
    phone: "Teléfono",
    email: "Correo",
    address: "Dirección",
    payment_method: "Método de pago",
    payment_info: "Información de pago",
    session_id: "Session ID",
    status: "Estado",
    verified_webhook: "Verificado por webhook",
    loading: "Cargando tu pedido...",
    // Buttons / Stripe
    pay: "Pagar",
    preparing_payment: "Preparando pago…",
    contact_us: "Contáctanos",
    pay_with_card: "Pagar con tarjeta",
    pay_now: "Pagar ahora",
    cancel: "Cancelar",
    confirming: "Confirmando…",
    secure_stripe: "Tus datos se procesan de forma segura con Stripe.",
    // Errors
    err_select_site: "Selecciona una sede antes de pagar.",
    err_invalid_total: "Total inválido para el pago.",
    err_stripe_pk: "Stripe no inicializó correctamente (publishable key).",
    err_stripe_init: "Stripe no inicializó correctamente.",
    err_start_payment: "No se pudo iniciar el pago.",
    err_form_not_ready: "El formulario de pago aún no está listo. Intenta de nuevo.",
    err_confirm_payment: "No se pudo confirmar el pago.",
    err_unexpected_confirm: "Error inesperado al confirmar.",
    pickup: "Pasar a recoger",
    delivery: "Domicilio"
  },
  en: {
    your_order: "Your order",
    thanks: "Thank you for your purchase!",
    payment_authorized: "Payment authorized",
    date: "Date",
    time: "Time",
    products: "Products",
    total: "Total",
    combo_includes: "Combo includes",
    subtotal: "Subtotal",
    delivery_fee: "Delivery fee",
    notes: "Notes",
    client: "Customer",
    name: "Name",
    id_number: "ID / Tax ID",
    delivery_method: "Delivery method",
    delivery_time: "Delivery date",
    plate: "Vehicle plate",
    phone: "Phone",
    email: "Email",
    address: "Address",
    payment_method: "Payment method",
    payment_info: "Payment info",
    session_id: "Session ID",
    status: "Status",
    verified_webhook: "Verified by webhook",
    loading: "Loading your order...",
    // Buttons / Stripe
    pay: "Pay",
    preparing_payment: "Preparing payment…",
    contact_us: "Contact us",
    pay_with_card: "Pay with card",
    pay_now: "Pay now",
    cancel: "Cancel",
    confirming: "Confirming…",
    secure_stripe: "Your data is processed securely with Stripe.",
    // Errors
    err_select_site: "Select a site before paying.",
    err_invalid_total: "Invalid total for payment.",
    err_stripe_pk: "Stripe did not initialize correctly (publishable key).",
    err_stripe_init: "Stripe did not initialize correctly.",
    err_start_payment: "Could not start payment.",
    err_form_not_ready: "The payment form is not ready yet. Try again.",
    err_confirm_payment: "Could not confirm payment.",
    err_unexpected_confirm: "Unexpected error when confirming.",
    pickup: "Pickup",
    delivery: "Delivery"
  }
};
const t = (key) => MESSAGES[lang.value][key] || key;

// WhatsApp contacto
const whatsappUrl3 = computed(() => {
  const baseUrl = "https://api.whatsapp.com/send";
  const urlParams = new URLSearchParams({ phone: "13477929350" });
  return `${baseUrl}?${urlParams.toString()}`;
});

// ===== Stripe (Payment Element) =====
const stripeApiBase = import.meta.env.VITE_STRIPE_API_URI || "https://api.stripe.salchimonster.com";
const DEFAULT_CURRENCY = import.meta.env.VITE_STRIPE_CURRENCY || "usd";

// Estados de pago
const isCreatingPI = ref(false);
const isConfirming = ref(false);
const showPaymentForm = ref(false);
const errorMessage = ref("");
const clientSecret = ref("");
const isFormReady = ref(false);

// Instancias Stripe
const elements = ref(null);
const paymentElement = ref(null);
const lastStripe = ref(null);

// Zero-decimal helpers
const ZERO_DECIMAL = new Set([
  "bif","clp","djf","gnf","jpy","kmf","krw","mga","pyg","rwf","ugx","vnd","vuv","xaf","xof","xpf"
]);
const toMinor = (amountMajor, currency) => {
  const c = (currency || "").toLowerCase();
  return ZERO_DECIMAL.has(c) ? Math.round(amountMajor) : Math.round(amountMajor * 100);
};

// Cache Stripe por PK
const stripeCache = new Map();
const getStripeByKey = async (pk) => {
  if (!pk) return null;
  if (!stripeCache.has(pk)) stripeCache.set(pk, loadStripe(pk));
  return await stripeCache.get(pk);
};

// Site actual (multi-tenant)
const currentSiteId = computed(() => {
  return order.value?.site_id || sitestore?.location?.site?.site_id || sitestore?.site?.site_id || store?.currentOrder?.site_id || "";
});

// Orden
const order = ref({
  order_id: null,
  user_id: null,
  site_id: null,
  site_name: "",
  delivery_person_id: null,
  order_notes: "",
  delivery_price: null,
  payment_method: "",
  total_order_price: null,
  current_status: "",
  latest_status_timestamp: "",
  responsible: null,
  reason: null,
  user_name: "",
  user_address: "",
  user_phone: "",
  authorized: null,
  responsible_id: null,
  name: "",
  pe_json: {
    cliente: {
      cliente_nombres: "",
      cliente_telefono: "",
      cliente_apellidos: "",
      cliente_direccion: "",
    },
    delivery: {
      local_id: null,
      canaldelivery_id: null,
      delivery_pagocon: null,
      delivery_tipopago: null,
      delivery_costoenvio: null,
      delivery_horaentrega: "",
      delivery_notageneral: "",
      delivery_direccionenvio: "",
      delivery_codigointegracion: "",
      delivery_codigolimadelivery: "",
    },
    listaPedidos: [],
  },
  payment_method_id: null,
  placa: null,
  order_type_id: null,
  order_type: "",
  cedula_nit: null,
  email: "",
  second_name: null,
  first_last_name: null,
  second_last_name: null,
  sede_recoger: null,
  epayco_ref: "",
  id: "",
  is_reserva: null,
  reserva_date: null,
});

onMounted(async () => {
  const id = route.params?.order_id;
  reportes?.setLoading(true, "Buscando orden...");
  try {
    order.value = await fetchService.get(`${URI}/order-by-id/${id}`);
  } catch (e) {
    console.error(e);
  } finally {
    reportes?.setLoading(false, "Buscando orden...");
  }
});

// Mostrar "Pickup" traducido manteniendo el valor original de backend
const translatedOrderType = computed(() => {
  const raw = (order.value?.order_type || "").toLowerCase();
  if (raw.includes("recoger")) return t('pickup');
  if (raw.includes("domic")) return t('delivery');
  // fallback: capitaliza y respeta original
  return order.value?.order_type || "";
});

// Determina si se oculta dirección (pickup)
const isPickup = computed(() => {
  const ot = (order.value?.order_type || "").toLowerCase();
  return ot.includes("recoger") || ot === "pickup";
});

// Abrir diálogo y montar Payment Element
const pay = async () => {
  if (showPaymentForm.value || isCreatingPI.value) return;
  errorMessage.value = "";

  const siteId = String(currentSiteId.value || "").trim();
  if (!siteId) {
    errorMessage.value = t('err_select_site');
    return;
  }

  const totalAPagar = Number(order.value?.pe_json?.delivery?.delivery_pagocon || 0);
  if (!(totalAPagar > 0)) {
    errorMessage.value = t('err_invalid_total');
    return;
  }

  isCreatingPI.value = true;
  try {
    // Crear PaymentIntent en backend (multi-tenant)
    const url = `${stripeApiBase}/create-payment-intent?site=${encodeURIComponent(siteId)}`;
    const currency = DEFAULT_CURRENCY.toLowerCase();
    const amountMinor = toMinor(totalAPagar, currency);

    const { data } = await axios.post(
      url,
      {
        amount: amountMinor,
        currency,
        metadata: {
          order_id: order.value.order_id,
          site_id: siteId,
          user_id: user?.user?.id || user?.user?.user_id || "",
        },
      },
      { headers: { "X-Site": siteId } }
    );

    clientSecret.value = data.clientSecret;
    const publishableKey = data.publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) throw new Error(t('err_stripe_pk'));

    // Mostrar diálogo y montar elemento
    showPaymentForm.value = true;
    await nextTick();

    const stripe = await getStripeByKey(publishableKey);
    if (!stripe) throw new Error(t('err_stripe_init'));

    lastStripe.value = stripe;

    try { paymentElement.value?.unmount(); } catch {}
    elements.value = stripe.elements({
      clientSecret: clientSecret.value,
      appearance: { theme: "stripe" },
    });
    paymentElement.value = elements.value.create("payment");
    paymentElement.value.mount("#payment-element");

    isFormReady.value = true;
  } catch (err) {
    console.error("Error iniciando pago con Stripe:", err);
    errorMessage.value = err?.response?.data?.detail || err?.message || t('err_start_payment');
    // limpiar
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

// Confirmar pago
const confirmStripePayment = async () => {
  try {
    errorMessage.value = "";
    if (!isFormReady.value || !elements.value || !lastStripe.value) {
      throw new Error(t('err_form_not_ready'));
    }

    isConfirming.value = true;

    const { error } = await lastStripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${SELF_URI}/gracias-stripe?order_id=${order.value.order_id}`,
      },
    });

    if (error) {
      errorMessage.value = error.message || t('err_confirm_payment');
      isConfirming.value = false; // permitir reintento
    }
  } catch (err) {
    console.error("Error al confirmar el pago:", err);
    errorMessage.value = err?.message || t('err_unexpected_confirm');
    isConfirming.value = false;
  }
};

// Cancelar/limpiar diálogo
const cancelStripeForm = () => {
  errorMessage.value = "";
  try { paymentElement.value?.unmount(); } catch {}
  paymentElement.value = null;
  elements.value = null;
  lastStripe.value = null;
  isFormReady.value = false;
  showPaymentForm.value = false;
  isConfirming.value = false;
  clientSecret.value = "";
  const el = document.getElementById("payment-element");
  if (el) el.innerHTML = "";
};

onBeforeUnmount(() => {
  try { paymentElement.value?.unmount(); } catch {}
  paymentElement.value = null;
  elements.value = null;
  lastStripe.value = null;
  isFormReady.value = false;
  if (store?.cart) store.cart = [];
});

watch(()=> route.query , (newval) => {
  if (!newval?.producto){
    store.visibles.currentProduct = false
  }
})
</script>

<style scoped>
@keyframes parpadeo {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.1); transform: scale(1.01); }
}
.wsp { animation: parpadeo ease infinite 0.5s; transition: all ease 0.5s; }
button { text-transform: uppercase; }
* { text-transform: uppercase; font-size: 0.9rem; }
*::first-letter { text-transform: uppercase; }

/* Stripe */
.stripe-wrapper { width: 100%; }
.stripe-card { background: #fff; border-radius: 0.5rem; padding: 1rem 0; }
.muted { color: #666; }
.error { color: #444; } /* gris en lugar de rojo */
</style>
