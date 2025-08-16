<template>
  <div class="finalizar-compra-container">
    <Dialog
      :header="t('site_selector')"
      modal
      v-model:visible="see_sites"
      style="width: 100%;max-width: 30rem;margin: .5rem ;"
    >
      <template v-if="!user.user.order_type || user.user.order_type.id !== 2">
        <div style="display: flex;flex-direction: column;gap: 1rem;">
          <div class="form-group">
            <!-- Autocomplete de direcciones -->
            <AutoComplete
              size="large"
              style="min-width: 100%;"
              v-model="user.user.site"
              :suggestions="dir_options"
              optionLabel="description"
              :minLength="1"
              :delay="250"
              forceSelection
              :placeholder="t('address_placeholder')"
              @complete="search"
              class="w-full"
            >
              <!-- Cómo se pinta cada ítem -->
              <template #item="{ item }">
                <div class="flex flex-col">
                  <span>{{ item.description }}</span>
                  <small class="opacity-70">{{ item.place_id }}</small>
                </div>
              </template>
            </AutoComplete>
          </div>

          <Tag
            v-if="user.user.site?.nearest"
            style="width: max-content;"
            :severity="user.user.site?.nearest?.in_coverage? 'success' : 'danger'"
          >
            {{  user.user.site?.nearest?.in_coverage ? t('in_coverage') : t('not_in_coverage') }}
          </Tag>

          <span>
            <strong>{{ t('distance') }}: </strong>
            {{ user.user.site?.nearest?.distance_miles }} {{ t('miles') }}
          </span>

          <span v-if="user.user.site?.delivery_cost_usd">
            <strong>{{ t('ships_from_site') }}: </strong>
            {{ user.user.site?.nearest?.site?.site_name }}
          </span>

          <Tag v-if="user.user.site?.delivery_cost_usd" severity="success">
            <span>
              <strong>{{ t('delivery_price') }}: ${{ user.user.site?.delivery_cost_usd }}</strong>
            </span>
          </Tag>
        </div>
      </template>

      <template #footer>
        <div style="display: flex;gap: 1rem;">
          <Button
            @click="() => {see_sites = false ; user.user.site = {}}"
            :label="t('cancel')"
            severity="danger"
            text
          />
          <Button
            style="background-color: black;border: none;"
            :label="t('save')"
            @click="() => {see_sites = false ; siteStore.location.site = user.user.site?.nearest?.site ; siteStore.location.neigborhood.delivery_price = user.user.site?.delivery_cost_usd }"
            :disabled="!user.user.site?.nearest?.in_coverage"
          />
        </div>
      </template>
    </Dialog>

    <!-- <validate></validate> -->
    <p class="title">{{ t('finalize_purchase') }}</p>

    <!-- <span>Metodo Entrega</span> ... -->

    <div class="form-grid">
      <div class="form-column">
        <div
          style="position: sticky;background-color: #f8f4fc;transition: all .3s ease;z-index: 99999999;padding: .5rem; margin-bottom: 0rem;"
          :style="!sticky? '  top: 3.5rem;' : 'top: 0;'"
        >
          <div class="order-type-native" role="radiogroup" :aria-label="t('delivery_method')">
            <label
              v-for="opt in computedOrderTypes.filter(t => [1,2,3].includes(t.id))"
              :key="opt.id"
              style="border: none;outline: none;background-color: white;"
              class="order-type-pill"
              :class="{ 'is-active': orderTypeIdStr === String(opt.id) }"
            >
              <input
                type="radio"
                style="border: none;"
                class="sr-only"
                name="order_type"
                :value="String(opt.id)"
                v-model="orderTypeIdStr"
              />
              <span>{{ opt.name }}</span>
            </label>
          </div>
        </div>

        <span>{{ t('name') }}</span>
        <div class="form-group">
          <InputText id="username" :placeholder="t('name')" v-model="user.user.name" />
        </div>

        <!-- Mostrar dirección solo si el método no es "Pasar a recoger" (id 2) -->
        <template v-if="!user.user.order_type || user.user.order_type.id !== 2">
          <span>{{ t('address') }}</span>
          <div class="form-group">
            <InputText
              @click="() => see_sites = true"
              :value="user.user.site?.nearest?.site?.site_address"
              readonly
            />
          </div>
        </template>

        <span>{{ t('phone') }}</span>
        <div class="form-group">
          <InputText
            v-model="user.user.phone_number"
            id="phone_number"
            mask="999 999 9999"
            :placeholder="t('phone')"
          />
        </div>

        <span>{{ t('email') }}</span>
        <div class="form-group">
          <InputText
            v-model="user.user.email"
            id="email"
            :placeholder="t('email')"
          />
        </div>

        <!-- Mostrar campo de placa solo si el método es "Pasar a recoger" (id 2) y la sede es 33/35/36 -->
        <template v-if="user.user.order_type && user.user.order_type.id === 2 && [33,35,36].includes(siteStore.location?.site?.site_id)">
          <span>{{ t('vehicle_plate') }}</span>
          <div class="form-group">
            <InputText v-model="user.user.placa" id="placa" :placeholder="t('vehicle_plate')" />
          </div>
        </template>

        <span>{{ t('payment_method') }}</span>
        <div class="form-group">
          <Select
            style="width: 100%;"
            v-model="user.user.payment_method_option"
            id="payment_method"
            :placeholder="t('payment_method')"
                   :options="user.user.order_type.id === 1 ? paymen_rules?.[siteStore.location?.site?.site_id]?.filter(t => t.id !==8 ) : paymen_rules?.[siteStore.location?.site?.site_id]"
            :optionLabel="user.lang.name == 'en'? 'english_name':  'name'"
          />
        </div>

        <span>{{ t('notes') }}</span>
        <Textarea
          v-model="store.cart.order_notes"
          class="order-notes"
          :placeholder="t('additional_notes')"
        />

        <template>
          <Textarea
            v-model="store.cart.order_notes"
            class="order-notes"
            :placeholder="t('notes')"
          />
        </template>
      </div>

      <resumen class="resumen-column" style="margin:0 .3rem;"></resumen>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed ,onBeforeMount, onBeforeUnmount} from 'vue';
import resumen from './resumen.vue';
import { usecartStore } from '@/store/shoping_cart';
import { useSitesStore } from '@/store/site';
import { useUserStore } from '@/store/user';
import { Textarea } from 'primevue';
import { Tag } from 'primevue';
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { InputText } from 'primevue';
import { Select } from 'primevue';
import { fetchService } from '@/service/utils/fetchService';
import { URI } from '@/service/conection';
import AutoComplete from 'primevue/autocomplete';
import SelectButton from 'primevue/selectbutton';

const autocompleteError = ref(null); // { code, message_es, message_en, coverage_radius_miles } | null

// ───────────── I18N mínimo ─────────────
const user = useUserStore();
const lang = computed(() => {
  const v = (user?.lang?.name || 'es').toString().toLowerCase();
  return v === 'en' ? 'en' : 'es';
});
const DICT = {
  es: {
    site_selector: 'Seleccionar sede',
    address_placeholder: 'Escribe tu dirección',
    in_coverage: 'En cobertura',
    not_in_coverage: 'Fuera de cobertura',
    distance: 'Distancia',
    miles: 'Millas',
    ships_from_site: 'Sale de la sede',
    delivery_price: 'Costo de envío',
    cancel: 'Cancelar',
    save: 'Guardar',
    finalize_purchase: 'Finalizar compra',
    name: 'Nombre',
    address: 'Dirección',
    phone: 'Teléfono',
    email: 'Correo electrónico',
    vehicle_plate: 'Placa de tu vehículo',
    payment_method: 'Método de pago',
    notes: 'Notas',
    additional_notes: 'Notas adicionales',
    delivery_method: 'Método de entrega',
  },
  en: {
    site_selector: 'Site selector',
    address_placeholder: 'Type your address',
    in_coverage: 'In coverage',
    not_in_coverage: 'Out of coverage',
    distance: 'Distance',
    miles: 'Miles',
    ships_from_site: 'Ships from',
    delivery_price: 'Delivery price',
    cancel: 'Cancel',
    save: 'Save',
    finalize_purchase: 'Checkout',
    name: 'Name',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    vehicle_plate: 'Vehicle plate',
    payment_method: 'Payment method',
    notes: 'Notes',
    additional_notes: 'Additional notes',
    delivery_method: 'Delivery method',
  }
};
const t = (key) => (DICT[lang.value] && DICT[lang.value][key]) || (DICT.es[key] || key);

// Sticky
const lastScrollY = ref(0)
const sticky = ref(false)
const handleScroll = () => {
  const currentScroll = window.scrollY
  if (currentScroll > lastScrollY.value) sticky.value = true
  else if (currentScroll < lastScrollY.value) sticky.value = false
  lastScrollY.value = currentScroll
}
onMounted(() => {
  lastScrollY.value = window.scrollY
  window.addEventListener('scroll', handleScroll)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

const store = usecartStore();
const siteStore = useSitesStore();

const order_types = ref([]);
const payment_method_options = ref([]);
const paymen_rules = ref({})

const orderTypeIdStr = computed({
  get: () => (user.user.order_type?.id != null ? String(user.user.order_type.id) : null),
  set: (idStr) => {
    const id = Number(idStr);
    const opt = computedOrderTypes.value.find(o => o.id === id) || null;
    user.user.order_type = opt;
  }
});

const stripeApiBase = import.meta.env.VITE_STRIPE_API_URI || 'https://api.stripe.salchimonster.com';

const see_sites = ref(false)
const uri_api_google =  import.meta.env.VITE_STRIPE_API_URI || 'https://api.stripe.salchimonster.com';

// Estado del autocomplete
const addressQuery = ref('');
const dir_options = ref([]);

// Token de sesión para Autocomplete + Details (mismo ciclo)
const sessionToken = ref(null);

// Preferencias
const regionPref = computed(() => siteStore.location?.site?.country_code ?? 'co');
const maxSuggestions = 5;

// --- Helpers de sesión ---
const newSession = () => {
  sessionToken.value =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
};
const endSession = () => { sessionToken.value = null; };

const search = async (event) => {
  const query = (event?.query ?? '').trim();
  if (!query) {
    dir_options.value = [];
    autocompleteError.value = null;
    return;
  }
  if (!sessionToken.value) newSession();

  const params = new URLSearchParams({
    input: query,
    session_token: sessionToken.value,
    language: lang.value,
    region: regionPref.value || '',
    limit: String(maxSuggestions)
  });

  try {
    const url = `${uri_api_google}/places/autocomplete?${params.toString()}`;
    const res = await fetchService.get(url, false);

    const predictions = Array.isArray(res)
      ? res
      : Array.isArray(res?.predictions)
        ? res.predictions
        : [];

    dir_options.value = predictions.filter(p => p?.description && p?.place_id);

    // guarda el error opcional cuando ninguna está en cobertura (si tu backend lo envía)
    autocompleteError.value = (res && !Array.isArray(res) && res.error) ? res.error : null;
  } catch (err) {
    console.error('Autocomplete error:', err);
    dir_options.value = [];
    autocompleteError.value = null;
  }
};

const onAddressSelect = async (e) => {
  const item = e?.value;
  if (!item?.place_id) return;

  autocompleteError.value = null;

  user.user.place_id = item.place_id;
  try {
    const params = new URLSearchParams({
      place_id: item.place_id,
      session_token: sessionToken.value || '',
      language: lang.value
    });
    const url = `${uri_api_google}/places/details?${params.toString()}`;
    const details = await fetchService.get(url);

    const formatted =
      details?.result?.formatted_address ??
      details?.formatted_address ??
      item.description;

    const loc =
      details?.result?.geometry?.location ?? details?.geometry?.location ?? null;

    user.user.address = formatted || item.description;
    if (loc?.lat && loc?.lng) {
      user.user.lat = loc.lat;
      user.user.lng = loc.lng;
    }
  } catch (err) {
    console.error('Place Details error:', err);
    user.user.address = item.description;
  } finally {
    endSession();
  }
};

onMounted(async () => {

  paymen_rules.value = await fetchService.get(`${URI}/site-payments`);

  payment_method_options.value = await fetchService.get(`${URI}/payment_methods`);
  order_types.value = await fetchService.get(`${URI}/get_all_order_types`);

  if (!user.user.order_type) {
    user.user.order_type = order_types.value.find(o => o.id == 1) || null
  }


  // if (user.user.payment_method_option?.id != 7) {
  //   siteStore.setNeighborhoodPrice();
  // } else {
  //   siteStore.setNeighborhoodPriceCero();
  // }
});

watch(() => user.user.order_type, (new_val) => {
  if (new_val?.id == 2) {

    siteStore.location.neigborhood.delivery_price = 0;
  } else {
    siteStore.location.neigborhood.delivery_price =  user.user.site?.delivery_cost_usd;

  }
});

watch(() => siteStore.location?.site?.site_id,() => {
  user.user.order_type = null
})

watch(() => user.user.order_type,() => {
  user.user.placa = null
})

// Computed para filtrar los tipos de orden según la sede
const computedOrderTypes = computed(() => {
  const currentSiteId = siteStore.location?.site?.site_id;
  if ([33,35,36].includes(currentSiteId)) {
    return order_types.value.filter(option => option.id !== 3);
  } else {
    return order_types.value.filter(option => option.id !== 1);
  }
});
</script>

<style scoped>
/* Contenedor Principal */
.finalizar-compra-container {
  padding: 0;
  padding-bottom: 2rem;
}

/* Título */
.title {
  text-align: center;
  font-size: 2rem;
  margin: 2rem 0;
  font-weight: bold;
}

/* Raíz: que se vea en pill redondeado */
:deep(.order-type-select .p-selectbutton) {
  border-radius: .5rem;
  overflow: hidden;
}

/* Botones NO seleccionados: fondo negro, texto blanco */
:deep(.order-type-select .p-button) {
  background: #000;
  color: #fff;
  border-color: #000;
  box-shadow: none;
}

/* Hover en NO seleccionados (mantener el contraste) */
:deep(.order-type-select .p-button:not(.p-highlight):not(.p-disabled):hover) {
  background: #111;
  border-color: #111;
  color: #fff;
}

/* Seleccionados: fondo blanco, texto negro */
:deep(.order-type-select .p-button.p-highlight) {
  background: #fff;
  color: #000;
  border-color: #000;
}

/* Hover en seleccionados */
:deep(.order-type-select .p-button.p-highlight:not(.p-disabled):hover) {
  background: #f5f5f5;
  border-color: #000;
  color: #000;
}

/* Focus states coherentes */
:deep(.order-type-select .p-button:focus),
:deep(.order-type-select .p-button.p-highlight:focus) {
  box-shadow: 0 0 0 2px rgba(0,0,0,.15);
}

.advertice {
  animation: anim_status_tag 2s infinite ease;
  color: black;
  padding: 1rem;
  font-weight: 400;
  font-size: 1.1rem;
}

@keyframes anim_status_tag {
  20% { background-color: rgb(0, 255, 110); }
  50% { background-color: rgb(0, 255, 204); transform: scale(1.02); }
  80% { background-color: rgb(0, 255, 140); }
}

.order-type-native {
  display: flex;
  z-index: 10000;
  transition: all ease .3s;
  width: 100%;
  background-color: white;
  border: 1px solid #000;
  border-radius: .5rem;
  overflow: hidden;
}

/* Por defecto (NO seleccionado): negro con texto blanco */
.order-type-pill {
  flex: 1 1 0;
  transition: all ease .3s;

  display: grid;
  place-items: center;
  padding: .6rem 1rem;
  background: #ffffff !important;
  color: #000000 !important;
  border-radius: .5rem;
  cursor: pointer;
  border: none;
  outline: none;
  user-select: none;
}

/* Separador interno */
.order-type-pill + .order-type-pill {
  border-left: 1px solid #000;
  transition: all ease .3s;

}

/* Seleccionado */
.order-type-pill.is-active {
  background: #000000 !important;
  color: #ffffff !important;
  border: none;
}

/* Accesibilidad: foco */
.order-type-pill:focus-within {
  outline: 2px solid rgba(231, 41, 41, 0.25);
  outline-offset: 2px;
}

/* Hide radio but keep it accessible */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}

/* Grid del Formulario y Resumen */
.form-grid {
  display: grid;
  max-width: 1024px;
  margin: 0 auto;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .form-grid { grid-template-columns: 1fr 1fr; }
}

/* Columna del Formulario */
.form-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.25rem;
}

.form-group :deep(.p-autocomplete) {
  width: 100%;
  flex: 1 1 auto;
}

:deep(.p-autocomplete .p-inputtext),
:deep(.p-autocomplete-input) {
  width: 100%;
}

/* Grupo de Formularios */
.form-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

/* Área de Notas */
.order-notes {
  height: 8rem;
  resize: none;
  width: 100%;
}

/* Eliminar estilos en línea de elementos enfocados */
*:focus {
  outline: none;
  border: none;
}

input,
textarea,
select {
  width: 100%;
  box-sizing: border-box;
}

/* Personalizar Scrollbar */
::-webkit-scrollbar { width: 1rem; }
::-webkit-scrollbar-thumb {
  background-color: rgb(255, 0, 0);
  border-radius: 9px;
  border: 5px solid var(--primary-color);
  height: 10rem;
  width: 10rem;
}
</style>
