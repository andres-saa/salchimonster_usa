<template>
  <div>
    <Dialog
      v-if="order?.order_id"
      v-model:visible="showDialog"
      modal
      :closable="false"
      style="margin: .5rem; width: 30rem; height: 95vh; border-radius: .3rem;"
    >
      <div class="p-2" style="display: flex; justify-content: center; align-items: center; width: 100%;">
        <div
          class="shadow-7 p-0"
          style="border-radius: 0.5rem; max-width: 95vw; width: 100%; display: flex; flex-direction: column; gap: 0.5rem; font-size: 1rem; background-color: white;"
        >
          <!-- Encabezados -->
          <p class="text-4xl text-center" style="font-weight: bold;">
            🤩{{ clienteNombresUpper }} {{ clienteApellidosUpper }}🤩
          </p>
          <p class="text-2xl text-center" style="font-weight: bold;">🔥 ¡MUCHAS GRACIAS POR TU COMPRA! 🔥</p>

          <!-- Factura -->
          <div id="factura" style="width: 100%; text-transform: uppercase;">
            <Tag class="tag mb-2" severity="success" v-if="order.responsible_id">Pago autorizado</Tag><br />
            <Tag class="tag" severity="success" v-if="order.responsible_id">{{ order.name }}</Tag>

            <div>
              <p id="id" style="font-weight: bold; text-align: center; color: black; margin:0;">
                ID: {{ order.order_id }}
              </p>
              <p style="font-weight: bold; text-align: center; color: black; margin:0;">
                {{ order.user_name }} {{ order.second_name }} {{ order.first_last_name }} {{ order.second_last_name }}
              </p>

              <p style="color: black; text-align: center; margin: .5rem 0 1rem 0; display: flex; flex-direction: column;">
                <b>Fecha: {{ fechaISO }}</b>
                <b>Hora: {{ horaISO }}</b>
              </p>

              <!-- Cabecera productos -->
              <div
                style="font-weight: bold; color:white; margin: 0; background-color: black; display: grid; grid-template-columns: 1fr auto;"
              >
                <div class="px-2"><b>productos</b></div>
                <div class="px-2" style="text-align: end;"><b>total</b></div>
              </div>

              <!-- Lista de productos -->
              <div v-for="(product, idx) in order.pe_json?.listaPedidos || []" :key="idx">
                <div style="display: grid; gap: 0 1rem; grid-template-columns: 1fr auto; align-items: start;">
                  <!-- Nombre y cantidad -->
                  <p class="p-0 m-0" v-if="order.site_id === 32">
                    <b>({{ product.pedido_cantidad }} kg)</b> {{ product.pedido_nombre_producto }}
                    ({{ product.pedido_cantidad / product.presentacion }} {{ product.presentation_unit_measure }})
                  </p>
                  <p class="p-0 m-0" v-else>
                    <b>({{ product.pedido_cantidad }})</b> {{ product.pedido_nombre_producto }}
                  </p>

                  <!-- Total por producto -->
                  <p class="p-0 m-0" style="text-align: end; color: black;">
                    {{
                      formatoPesosColombianos(
                        (product.pedido_base_price ?? product.pedido_precio ?? 0) * (product.pedido_cantidad ?? 0)
                      )
                    }}
                  </p>
                </div>

                <!-- Combo incluye -->
                <p v-if="product.lista_productocombo?.length > 0" class="p-0 m-0"><b>COMBO INCLUYE</b></p>
                <p
                  v-for="(i, k) in product.lista_productocombo || []"
                  :key="k"
                  class="p-0 m-0 ml-5"
                >
                  -- <b>{{ i.pedido_cantidad }}</b> {{ i.pedido_nombre }}
                </p>

                <!-- Modificadores -->
                <div
                  v-for="(i, j) in product.modificadorseleccionList || []"
                  :key="j"
                  style="display: flex; justify-content: space-between;"
                  class="p-0 m-0"
                >
                  <p class="p-0 m-0">- ({{ product.pedido_cantidad }}) <b>{{ i.modificadorseleccion_cantidad }}</b> {{ i.modificadorseleccion_nombre }}</p>
                  <p class="p-0 m-0" style="text-align: end;">
                    {{
                      formatoPesosColombianos(
                        (i.pedido_precio ?? 0) * (i.modificadorseleccion_cantidad ?? 0) * (product.pedido_cantidad ?? 0)
                      )
                    }}
                  </p>
                </div>

                <div style="background-color: rgba(0, 0, 0, 0.286); height: 1px;"></div>
              </div>

              <!-- Totales -->
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 0;">
                <div><span style="font-weight: bold;">Subtotal</span></div>
                <div>
                  <p style="text-align: end; font-weight: bold; color: black;">
                    <b>{{ formatoPesosColombianos(subtotal) }}</b>
                  </p>
                </div>

                <template v-if="descuento > 0">
                  <div><span style="font-weight: bold;">Descuento</span></div>
                  <p style="text-align: end; font-weight: bold; color: black;">
                    <b>- <span style="text-decoration: line-through; margin: 0; padding: 0;">{{ formatoPesosColombianos(descuento) }}</span></b>
                  </p>
                </template>

                <div><span class="m-0" style="font-weight: bold;">Domicilio</span></div>
                <div>
                  <p class="m-0 p-0" style="text-align: end; font-weight: bold; color: black;">
                    <b>{{ formatoPesosColombianos(envio) }}</b>
                  </p>
                </div>

                <div><span style="font-weight: bold; color: black;">Total</span></div>
                <div>
                  <p class="m-0 p-0" style="text-align: end; color: black; font-weight: bold;">
                    <b>{{ formatoPesosColombianos(pagocon) }}</b>
                  </p>
                </div>
              </div>

              <!-- Notas -->
              <p class="px-2" style="font-weight: bold; background-color: black; color: white; margin-top: .5rem;">Notas</p>
              <p class="notas p-2 m-0" style="border: 1px solid; color: black; padding: .5rem;">
                {{ (order.order_notes || '').toLowerCase() }}
              </p>

              <!-- Datos del cliente -->
              <p class="px-2" style="background-color: black; font-weight: bold; margin: 1rem 0; color: white;">cliente</p>
              <div style="display: grid; gap: .25rem 2rem; grid-template-columns: auto 1fr; align-items: start;">
                <div><span><b>Nombre</b></span></div>
                <div><span style="color: black;">{{ order.user_name }} {{ order.second_name }} {{ order.first_last_name }} {{ order.second_last_name }}</span></div>

                <template v-if="order.site_id === 32">
                  <div><span><b>Cédula / NIT</b></span></div>
                  <div><span style="color: black;">{{ order.cedula_nit }}</span></div>
                </template>

                <div><span><b>Método de entrega</b></span></div>
                <div><span style="color: black;">{{ order.order_type }}</span></div>

                <template v-if="order.site_id === 32">
                  <div><span><b>Fecha de entrega</b></span></div>
                  <div><span style="color: black;">{{ order.pe_json?.delivery?.delivery_horaentrega }}</span></div>
                </template>

                <template v-if="order.placa">
                  <div><span><b>Placa del vehículo</b></span></div>
                  <div><span style="color: black;">{{ order.placa }}</span></div>
                </template>

                <div><span><b>Teléfono</b></span></div>
                <div><span style="color: black;">{{ order.user_phone }}</span></div>

                <template v-if="order.site_id === 32">
                  <div><span><b>Correo</b></span></div>
                  <div><span style="color: black;">{{ order.email }}</span></div>
                </template>

                <template v-if="order.order_type !== 'Pasar a recoger'">
                  <div><span><b>Dirección</b></span></div>
                  <div><span style="color: black;">{{ (order.user_address || '').toLowerCase() }}</span></div>
                </template>

                <div><span><b>Método de pago</b></span></div>
                <div><span style="color: black;">{{ (order.payment_method || '').toLowerCase() }}</span></div>
              </div>
            </div>
          </div>

          <!-- Info de pago (si viene de ePayco) -->
          <div v-if="route.query?.ref_payco">
            <h4>Información de pago</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr;">
              <div><h5>Ref. Comercio</h5></div><div><h5 style="font-weight: 300;">{{ epayco_data?.x_id_factura }}</h5></div>
              <div><h5>Ref. ePayco</h5></div><div><h5 style="font-weight: 300;">{{ epayco_data?.x_ref_payco }}</h5></div>
              <div><h5>Banco</h5></div><div><h5 style="font-weight: 300;">{{ epayco_data?.x_bank_name }}</h5></div>
              <div><h5>Estado</h5></div><div><h5 style="font-weight: 300;">{{ epayco_data?.x_transaction_state }}</h5></div>
              <div><h5>Autorización</h5></div><div><h5 style="font-weight: 300;">{{ epayco_data?.x_approval_code }}</h5></div>
              <div><h5>Tarjeta</h5></div><div><h5 style="font-weight: 300;">{{ epayco_data?.x_cardnumber }}</h5></div>
              <div><h5>Total</h5></div><div><h5 style="font-weight: 300;">{{ formatoPesosColombianos(epayco_data?.x_amount) }}</h5></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer botones -->
      <template #footer>
        <div style="display: flex; gap: .5rem; flex-wrap: wrap; justify-content: end;">
          <router-link to="/rastrear-pedido">
            <Button class="mt-3" severity="warning" style="font-weight: bold; width: 100%;" label="PUEDES RASTREARLO AQUÍ" />
          </router-link>

          <!-- Botón Transferencia (payment_method_id === 6) -->
          <a v-if="showBtnTransferencia" :href="whatsappUrlTransferencia" target="_blank">
            <Button
              class="wsp"
              style="font-weight: bold; background-color: #00b66c; border: none; width: 100%; min-width: 100%;"
              icon="pi pi-whatsapp"
              severity="danger"
              label="REALIZAR TRANSFERENCIA"
            />
          </a>

          <!-- Botón Confirmar pedido (payment_method_id ∈ [5,8]) -->
          <a v-if="showBtnConfirmar" :href="whatsappUrlConfirmar" target="_blank">
            <Button
              class="wsp"
              style="font-weight: bold; background-color: #00b66c; border: none; width: 100%;"
              icon="pi pi-whatsapp"
              severity="danger"
              label="Confirmar mi pedido"
            />
          </a>

          <router-link to="/">
            <Button icon="pi pi-arrow-left" severity="danger" outlined style="font-weight: bold; border: none; width: 100%;" label="VOLVER AL MENÚ" />
          </router-link>
        </div>
      </template>
    </Dialog>

    <div v-else style="display: flex; align-items: center; justify-content: center; height: 90vh; width: 100vw;">
      <h2>Cargando tu pedido...</h2>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import  Dialog  from "primevue/dialog";
import  Button  from "primevue/button";
import  Tag  from "primevue/tag";

// Utilidad local (formato COP)
const formatoPesosColombianos = (n) => {
  const v = Number(n ?? 0);
  return v.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
};

// CONFIG: URIs (ajusta a tu entorno)
import { URI, SELF_URI } from "@/service/conection";
import { fetchService } from "@/service/utils/fetchService";

const route = useRoute();

// Estado principal de la orden (toda la vista depende de esto)
const order = ref(null);
const showDialog = ref(false);

// Datos opcionales de ePayco si vienes de response
const epayco_data = ref({});

// Helpers derivados de la orden
const clienteNombresUpper = computed(() => (order.value?.pe_json?.cliente?.cliente_nombres || "").toUpperCase());
const clienteApellidosUpper = computed(() => (order.value?.pe_json?.cliente?.cliente_apellidos || "").toUpperCase());

const fechaISO = computed(() => (order.value?.latest_status_timestamp || "").split("T")?.[0] || "");
const horaISO = computed(() => (order.value?.latest_status_timestamp || "").split("T")?.[1]?.split(":")?.slice(0, 2)?.join(":") || "");

// Totales basados 100% en la orden
const envio = computed(() => Number(order.value?.pe_json?.delivery?.delivery_costoenvio ?? 0));
const pagocon = computed(() => Number(order.value?.pe_json?.delivery?.delivery_pagocon ?? 0));
const descuento = computed(() => Number(order.value?.pe_json?.delivery?.total_descuento ?? 0));
const subtotal = computed(() => pagocon.value + descuento.value - envio.value);

// Lógica de teléfono por prefijo de la orden
const phoneByOrder = computed(() => {
  const id = order.value?.order_id || "";
  const prefix = id.split("-")?.[0] || "";
  return ["UNI", "NEK", "FIL", "NYK"].includes(prefix) ? "573053447255" : "573053447255";
});

// Textos de WhatsApp generados desde la orden
const textTransferencia = computed(() => {
  const c = order.value?.pe_json?.cliente || {};
  const productos = (order.value?.pe_json?.listaPedidos || []).map((p) => {
    if (order.value?.site_id === 32) {
      return `*(${p?.pedido_cantidad || 0} kilos)* de ${p?.pedido_nombre_producto || ""} (${(p?.pedido_cantidad || 0) / (p?.presentacion || 1)} ${p?.presentation_unit_measure || ""})`;
    }
    return `*(${p?.pedido_cantidad || 0})* ${p?.pedido_nombre_producto || ""}`;
    }).join("\n");

  return `Hola soy *${(c.cliente_nombres || "").toUpperCase()} ${(c.cliente_apellidos || "").toUpperCase()}* 🤗 acabo de hacer el siguiente pedido en la página web.
${productos ? "\n" + productos + "\n" : ""}
El número de la orden es *#${order.value?.order_id || ""}*.

*Escribo para Realizar la Transferencia* 🙏`;
});

const textConfirmar = computed(() => {
  return `Hola, para validar el pedido 🔥 *#${order.value?.order_id || ""}* 🔥`;
});

// URLs de WhatsApp
const whatsappUrlTransferencia = computed(() => {
  const baseUrl = "https://api.whatsapp.com/send";
  const urlParams = new URLSearchParams({ phone: phoneByOrder.value, text: textTransferencia.value });
  return `${baseUrl}?${urlParams.toString()}`;
});

const whatsappUrlConfirmar = computed(() => {
  const baseUrl = "https://api.whatsapp.com/send";
  const urlParams = new URLSearchParams({ phone: phoneByOrder.value, text: textConfirmar.value });
  return `${baseUrl}?${urlParams.toString()}`;
});

// Visibilidad de botones por payment_method_id de la orden cargada
const showBtnTransferencia = computed(() => Number(order.value?.payment_method_id) === 6);
const showBtnConfirmar = computed(() => [5, 8].includes(Number(order.value?.payment_method_id)));

// Carga asíncrona de la orden (única fuente de verdad)
const loadOrder = async () => {
  const order_id = route.query?.order_id;
  if (!order_id) return;
  try {
    const data = await fetchService.get(`${URI}/order-by-id/${order_id}`);
    order.value = data || null;
    showDialog.value = !!order.value?.order_id;
  } catch (e) {
    console.error("Error al obtener la orden:", e);
    order.value = null;
    showDialog.value = false;
  }
};

// Si vienes de ePayco response, aquí podrías poblar epayco_data (opcional)
const loadEpaycoDataIfAny = () => {
  // Si manejas retorno por query, parsea aquí y asigna a epayco_data.value
  // Ejemplo:
  // epayco_data.value = {
  //   x_id_factura: route.query?.x_id_factura,
  //   x_ref_payco: route.query?.x_ref_payco,
  //   ...
  // }
};

onMounted(async () => {
  await loadOrder();
  loadEpaycoDataIfAny();
});
</script>

<style scoped>
@keyframes parpadeo {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.1); transform: scale(1.01); }
}
.wsp { animation: parpadeo ease infinite 0.5s; transition: all ease 0.5s; }
</style>
