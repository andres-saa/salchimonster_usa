<template>
  <div class="finalizar-compra-container">
    <Dialog
      :header="t('site_selector')"
      modal
      :closable="false"
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
              v-model="addressQuery"
              :suggestions="dir_options"
              optionLabel="description"
              :minLength="1"
              :delay="250"
              forceSelection
              :placeholder="t('address_placeholder')"
              @complete="search"
              @item-select="onAddressSelect"
              class="w-full"
            >
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
            :severity="user.user.site?.nearest?.in_coverage ? 'success' : 'danger'"
          >
            {{ user.user.site?.nearest?.in_coverage ? t('in_coverage') : t('not_in_coverage') }}
          </Tag>

          <div v-if="user.user.site?.error" class="p-2" style="border:1px solid #ff6b6b;border-radius:.5rem;background:#fff0f0;padding: 1rem;">
            <strong style="color:#b00020;">{{ t('coverage_error') }}:</strong>
            <div style="margin-top:.25rem;">
              {{ lang === 'en' ? user.user.site.error.message_en : user.user.site.error.message_es }}
            </div>
            <small style="opacity:.8;">(code: {{ user.user.site.error.code }})</small>
          </div>

          <span v-if="user.user.site?.distance_miles != null">
            <strong>{{ t('distance') }}: </strong>
            {{ user.user.site?.distance_miles }} {{ t('km') }}
          </span>

          <span v-if="user.user.site?.nearest?.site?.site_name">
            <strong>{{ t('ships_from_site') }}: </strong>
            {{ user.user.site?.nearest?.site?.site_name }}
          </span>

          <Tag v-if="user.user.site?.delivery_cost_cop != null" severity="success">
            <span><strong>{{ t('delivery_price') }}: {{ formatCOP(user.user.site?.delivery_cost_cop) }}</strong></span>
          </Tag>
        </div>
      </template>

      <template #footer>
        <div style="display: flex;gap: 1rem;">
          <Button
            @click="() => {see_sites = false ; user.user.site = {}; addressQuery=''}"
            :label="t('cancel')"
            severity="danger"
            text
          />
          <Button
            style="background-color: black;border: none;"
            :label="t('save')"
            @click="save"
            :disabled="!user.user.site?.nearest?.in_coverage"
          />
        </div>
      </template>
    </Dialog>

    <p class="title">{{ t('finalize_purchase') }}</p>

    <div class="form-grid">
      <div class="form-column">
        <div
          style="position: sticky;background-color: #f8f4fc;transition: all .3s ease;z-index: 99999999;margin-bottom: 0rem; padding-top: .5rem;"
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

        <template v-if="!user.user.order_type || user.user.order_type.id !== 2">
          <span>{{ t('address') }}</span>
          <div class="form-group">
            <InputText
              @click="() => see_sites = true"
              :value="user.user.site?.formatted_address || user.user.site?.description"
              readonly
            />
          </div>
        </template>

        <template v-if="!user.user.order_type || user.user.order_type.id == 2">
          <span>{{ t('site_recoger') }}</span>
          <div class="form-group" style="display: flex;flex-direction: column;justify-content: start;align-items: start;">
            <InputText
              @click="siteStore.setVisible('currentSite', true)"
              :modelValue="siteStore?.location?.site?.site_name"
              id="neighborhood"
              placeholder="Ubicacion"
              readonly
            />
            <Tag> {{ siteStore?.location?.site?.site_address }}</Tag>
          </div>
        </template>

        <span>{{ t('phone') }}</span>
        <div class="form-group phone-row" style="display: flex;">
          <!-- === País (AutoComplete con código como label) === -->

            <!-- overlay con bandera + código -->

            <AutoComplete style="width: min-content;"
              v-model="user.user.phone_code"
              :suggestions="countrySuggestions"
              optionLabel="dialCode"

              forceSelection
              :placeholder="t('search_country_or_code')"
              @complete="countryComplete"
              class="cc-autocomplete"
            >

            <template #option="slotProps">
                <div class="flex items-center" style="display: flex;gap: 1rem;">
                    <img :alt="slotProps.option.flag" :src="slotProps.option.flag" />

                    <div>{{ slotProps.option.name }}  {{ slotProps.option.dialCode }} </div>
                </div>
            </template>

            <template #selectedItem="slotProps">
                  <div class="flex items-center gap-2" style="display: flex;gap: 1rem;">
                    <img :alt="slotProps.value.flag" :src="slotProps.value.flag" style="width: 20px; height: 14px;" />
                    <span>{{ slotProps.value.dialCode }}</span>
                  </div>
            </template>


            </AutoComplete>


          <!-- Número -->
          <div class="phone-number" style="width: 100%;">

            <InputText style="" :disabled="!user.user.phone_code?.dialCode"
              v-model="user.user.phone_number"
              id="phone_number"
              :placeholder="t('phone')"
              @blur="formatPhoneOnBlur"
            />
            <div v-if="phoneError" class="phone-error">
              {{ phoneError }}
            </div>
          </div>
        </div>

        <span>{{ t('email') }}</span>
        <div class="form-group">
          <InputText
            v-model="user.user.email"
            id="email"
            :placeholder="t('email')"
          />
        </div>

        <template v-if="user?.user?.order_type && user?.user?.order_type?.id === 2 && [33,35,36].includes(siteStore.location?.site?.site_id)">
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
            :options="user?.user?.order_type?.id === 1 ? paymen_rules?.[siteStore.location?.site?.site_id]?.filter(t => t.id !== 8) : paymen_rules?.[siteStore.location?.site?.site_id]"
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

      <resumen class="resumen-column" style="margin:0 .3rem;padding-top: .5rem;"></resumen>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed ,onBeforeUnmount} from 'vue'
import resumen from './resumen.vue'
import { usecartStore } from '@/store/shoping_cart'
import { useSitesStore } from '@/store/site'
import { useUserStore } from '@/store/user'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { fetchService } from '@/service/utils/fetchService'
import { URI } from '@/service/conection'
import AutoComplete from 'primevue/autocomplete'
import { buildCountryOptions } from '@/service/utils/countries'
import { parsePhoneNumberFromString } from 'libphonenumber-js/min'

const autocompleteError = ref(null)

const user = useUserStore()
const siteStore = useSitesStore()
const store = usecartStore()

const lang = computed(() => {
  const v = (user?.lang?.name || 'es').toString().toLowerCase()
  return v === 'en' ? 'en' : 'es'
})

const DICT = {
  es: {
    site_selector: 'Seleccionar sede',
    address_placeholder: 'Escribe tu dirección',
    in_coverage: 'En cobertura',
    not_in_coverage: 'Fuera de cobertura',
    coverage_error: 'Error de cobertura',
    distance: 'Distancia',
    miles: 'Millas',
    km: 'km',
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
    site_recoger: 'Sede donde vas a recoger',
    search_country_or_code: 'Buscar país o código (+57, 57, US, +1 929)...'
  },
  en: {
    site_selector: 'Site selector',
    address_placeholder: 'Type your address',
    in_coverage: 'In coverage',
    not_in_coverage: 'Out of coverage',
    coverage_error: 'Coverage error',
    distance: 'Distance',
    miles: 'Miles',
    km: 'km',
    ships_from_site: 'Ships from',
    delivery_price: 'Delivery price',
    cancel: 'Cancel',
    save: 'Save',
    finalize_purchase: 'Checkout',
    name: 'Name',
    address: 'Address',
    site_recoger: 'Pick-up place',
    phone: 'Phone',
    email: 'Email',
    vehicle_plate: 'Vehicle plate',
    payment_method: 'Payment method',
    notes: 'Notes',
    additional_notes: 'Additional notes',
    delivery_method: 'Delivery method',
    search_country_or_code: 'Search country or code (+57, 57, US, +1 929)...'
  }
}
const t = (key) => (DICT[lang.value] && DICT[lang.value][key]) || (DICT.es[key] || key)

const formatCOP = (v) => {
  try {
    return new Intl.NumberFormat(lang.value === 'en' ? 'en-CO' : 'es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v || 0))
  } catch {
    return `COP ${Number(v || 0).toLocaleString()}`
  }
}

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

const order_types = ref([])
const payment_method_options = ref([])
const paymen_rules = ref({})
const sites = ref([])

// Países/telefonía
const countries = ref([])
const countrySuggestions = ref([])

// normalizadores
const norm = (s) => (s || '').toString().trim().toLowerCase()
const onlyDigits = (s) => (s || '').replace(/\D+/g, '')

// ISO -> emoji banderita
const toFlagEmoji = (iso2) => {
  if (!iso2) return '🏳️'
  return iso2
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('')
}

const countryComplete = (e) => {
  const q = (e?.query ?? '')
  const qNorm = norm(q)
  const qDigits = onlyDigits(q)

  if (!qNorm) {
    countrySuggestions.value = countries.value.slice(0, 25)
    return
  }

  let list = countries.value.filter(c => {
    const name = norm(c.name)
    const iso  = norm(c.code)
    const dialDigits = c.dialDigits

    if (name.includes(qNorm) || iso.includes(qNorm)) return true
    if (!qDigits) return false

    // Soporta "+1 929", "1-929", "(+1)929" comparando solo dígitos
    if (dialDigits.startsWith(qDigits) || qDigits.startsWith(dialDigits)) return true
    return false
  })

  countrySuggestions.value = list
    .filter(o => o && typeof o === 'object' && typeof o.name === 'string')
    .slice(0, 50)
}

// Control tipo de orden
const orderTypeIdStr = computed({
  get: () => (user.user.order_type?.id != null ? String(user.user.order_type.id) : null),
  set: (idStr) => {
    const id = Number(idStr)
    const opt = computedOrderTypes.value.find(o => o.id === id) || null
    user.user.order_type = opt
  }
})

const see_sites = ref(false)
const uri_api_google =  'https://api.stripe.salchimonster.com'

// Autocomplete direcciones
const addressQuery = ref('')
const dir_options = ref([])
const sessionToken = ref(null)

const regionPref = computed(() => {
  return (user.phone_code?.code || siteStore.location?.site?.country_code || 'CO').toLowerCase()
})
const maxSuggestions = 5

const newSession = () => {
  sessionToken.value =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`
}
const endSession = () => { sessionToken.value = null }

const search = async (event) => {
  const query = (event?.query ?? '').trim()
  if (!query) {
    dir_options.value = []
    autocompleteError.value = null
    return
  }
  if (!sessionToken.value) newSession()

  const params = new URLSearchParams({
    input: query,
    session_token: sessionToken.value,
    language: lang.value,
    limit: String(maxSuggestions)
  })

  try {
    const url = `${uri_api_google}/places/autocomplete?${params.toString()}`
    const res = await fetchService.get(url, false)

    const predictions = Array.isArray(res)
      ? res
      : Array.isArray(res?.predictions)
        ? res.predictions
        : []

    dir_options.value = predictions.filter(p => p?.description && p?.place_id)
    autocompleteError.value = (res && !Array.isArray(res) && res.error) ? res.error : null
  } catch (err) {
    console.error('Autocomplete error:', err)
    dir_options.value = []
    autocompleteError.value = null
  }
}

const onAddressSelect = async (e) => {
  const item = e?.value
  if (!item?.place_id) return

  autocompleteError.value = null
  user.user.place_id = item.place_id
  try {
    const params = new URLSearchParams({
      place_id: item.place_id,
      session_token: sessionToken.value || '',
      language: lang.value
    })
    const url = `${uri_api_google}/places/coverage-details?${params.toString()}`
    const details = await fetchService.get(url)

    user.user.site = details || {}
    user.user.site.description = details?.formatted_address || item.description
    user.user.lat = details?.lat || null
    user.user.lng = details?.lng || null
    store.address_details = details
    addressQuery.value = user.user.site.description  || item.description
    autocompleteError.value = details?.error || null

    if (details?.delivery_cost_cop != null) {
      siteStore.location.neigborhood.delivery_price = details.delivery_cost_cop
    } else {
      siteStore.location.neigborhood.delivery_price = null
    }
  } catch (err) {
    console.error('Coverage Details error:', err)
    user.user.address = item.description
    user.user.site = {}
  } finally {
    endSession()
  }
}

// === Teléfono: validación y formateo ===
const phoneError = ref(null)

const formatPhoneOnBlur = () => {
  const countryIso = user.user.phone_code?.code || undefined
  const phone = parsePhoneNumberFromString(user.user.phone_number || '', countryIso)
  if (phone && phone.isValid()) {
    user.user.phone_number = phone.formatNational()
  }
}

watch([() => user.user.phone_number, () => user.user.phone_code], ([num, country]) => {
  phoneError.value = null

  const raw = (num || '').toString().trim()
  if (!raw) {
    user.user.phone_e164 = null
    return
  }

  const countryIso = country?.code || undefined
  const phone = parsePhoneNumberFromString(raw, countryIso)

  if (phone && phone.isValid()) {
    user.user.phone_e164 = phone.number        // +573001234567 para backend
  } else {
    user.user.phone_e164 = null
    phoneError.value = lang.value === 'en'
      ? 'Invalid phone number for selected country.'
      : 'Número inválido para el país seleccionado.'
  }
}, { immediate: true })

onMounted(async () => {
  // Países con bandera (FlagCDN) + emoji fallback y dialDigits
  countries.value = buildCountryOptions(lang.value).map(c => ({
    ...c,
    dialDigits: (c.dialCode || '').replace(/\D+/g, ''),
    flag: `https://flagcdn.com/h20/${c.code.toLowerCase()}.png`,
    flagEmoji: toFlagEmoji(c.code),
    _imgError: false



  }))

  countrySuggestions.value = countries.value.slice(0, 25)

  const bySite = siteStore.location?.site?.country_code?.toUpperCase?.()
  const defIso = bySite && countries.value.some(c => c.code === bySite)
    ? bySite
    : (lang.value === 'en' ? 'US' : 'CO')

  // Normaliza si llega string viejo
  if (typeof user.user.phone_code === 'string') {
    const raw = user.user.phone_code.trim().toLowerCase()
    let found = countries.value.find(c => c.code.toLowerCase() === raw)
    if (!found) found = countries.value.find(c => c.name.toLowerCase() === raw)
    if (!found) found = countries.value.find(c => c.dialDigits === raw.replace(/\D+/g,''))
    user.user.phone_code = found || null
  }

  if (!user.user.phone_code) {
    user.user.phone_code = countries.value.find(c => c.code === defIso) || null
  }

  paymen_rules.value = await fetchService.get(`${URI}/site-payments`)
  sites.value = await fetchService.get(`${URI}/sites`)
  payment_method_options.value = await fetchService.get(`${URI}/payment_methods`)
  order_types.value = await fetchService.get(`${URI}/get_all_order_types`)

  if (!user.user.order_type?.name) {
    user.user.order_type = order_types?.value.find(o => o.id == 1)
  }

  if (user?.user?.order_type?.id == 1) {
    siteStore.location.neigborhood.delivery_price = user.user.site?.delivery_cost_cop ?? null
  }


})

watch(() => user.user.order_type, (new_val) => {
  if (new_val?.id == 2) {
    siteStore.location.neigborhood.delivery_price = 0
  } else {
    siteStore.location.site = user.user.site?.nearest?.site
    siteStore.location.neigborhood.delivery_price = user.user.site?.delivery_cost_cop ?? null
  }
})

watch(lang , (new_val) => {
  const prev = user.user.phone_code?.code
  countries.value = buildCountryOptions(new_val).map(c => ({
    ...c,
    dialDigits: (c.dialCode || '').replace(/\D+/g, ''),
    flag: `https://flagcdn.com/h20/${c.code.toLowerCase()}.png`,
    flagEmoji: toFlagEmoji(c.code),
    _imgError: false
  }))
  countrySuggestions.value = countries.value.slice(0, 25)
  user.user.phone_code = countries.value.find(c => c.code === prev) || countries.value.find(c => c.code === (new_val === 'en' ? 'US' : 'CO'))
})

watch(() => user.user.order_type, () => {
  user.user.placa = null
})

const save = () => {
  see_sites.value = false
  siteStore.location.site = user.user.site?.nearest?.site
  siteStore.location.neigborhood.delivery_price = user.user.site?.delivery_cost_cop ?? null

}

const computedOrderTypes = computed(() => {
  const currentSiteId = siteStore.location?.site?.site_id
  if ([33,35,36].includes(currentSiteId)) {
    return order_types.value.filter(option => option.id !== 3)
  } else {
    return order_types.value.filter(option => option.id !== 1)
  }
})
</script>

<style scoped>
.finalizar-compra-container { padding: 0; padding-bottom: 2rem; }
.title { text-align: center; font-size: 2rem; margin: 2rem 0; font-weight: bold; }

.order-type-native {
  display: flex; z-index: 10000; transition: all ease .3s; width: 100%;
  background-color: white; border: 1px solid #000; border-radius: .5rem; overflow: hidden;
}
.order-type-pill { flex: 1 1 0; display: grid; place-items: center; padding: .6rem 1rem; background: #fff !important; color: #000 !important; border-radius: .5rem; cursor: pointer; border: none; }
.order-type-pill + .order-type-pill { border-left: 1px solid #000; }
.order-type-pill.is-active { background: #000 !important; color: #fff !important; border: none; }
.order-type-pill:focus-within { outline: 2px solid rgba(231, 41, 41, 0.25); outline-offset: 2px; }

.form-grid { display: grid; max-width: 1024px; margin: 0 auto; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .form-grid { grid-template-columns: 1fr 1fr; } }
.form-column { display: flex; flex-direction: column; gap: .5rem; padding: .5rem; }

.form-group :deep(.p-autocomplete) { width: 100%; flex: 1 1 auto; }
:deep(.p-autocomplete .p-inputtext), :deep(.p-autocomplete-input) { width: 100%; }

/* ====== Teléfono ====== */
.phone-row { align-items: start; gap: .75rem; width: 100%; }
.cc-wrapper { position: relative; width: 20rem; max-width: 100%; }
.cc-autocomplete :deep(.p-inputtext) { width: 5rem !important; } /* espacio para overlay */
.cc-overlay {
  position: absolute; top: 50%; left: .5rem; transform: translateY(-50%);
  display: inline-flex; align-items: center; gap: .35rem; pointer-events: none;
}
.flag-img { width: 20px; height: 15px; object-fit: cover; border-radius: 2px; box-shadow: 0 0 0 1px rgba(0,0,0,.06); }
.flag-emoji { font-size: 16px; line-height: 1; }
.cc-code { font-weight: 600; font-size: .95rem; }


.phone-error { color:#b00020; font-size:.85rem; margin-top:.25rem; }
input{
  width: 100%;
}
/* Notas */
.order-notes { height: 8rem; resize: none; width: 100%; }

/* Scrollbar demo */
::-webkit-scrollbar { width: 1rem; }
::-webkit-scrollbar-thumb { background-color: rgb(255, 0, 0); border-radius: 9px; border: 5px solid var(--primary-color); height: 10rem; width: 10rem; }
</style>
