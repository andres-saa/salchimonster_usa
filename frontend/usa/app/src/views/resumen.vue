<template>
    <div class="p-1 my-5 md:my-0 col-12">
        <!-- Contenedor principal “Resumen” -->
        <div class="sticky-summary col-12 p-3 m-0">
            <h5><b>Resumen</b></h5>
            <h5><b>productos</b></h5>

            <!-- Lista de productos -->
            <div  v-for="product in store.cart"
                :key="product.productogeneral_id">

                <div class="mb-0 pb-0 product-line">
                    <div class="col-6 py-2 mb-0 m-0">
                    <h6 class="m-0">
                        <span class="span-minwidth">( {{ product.pedido_cantidad }} ) </span>
                       <span style="font-weight: 400;"> {{ product.pedido_nombre_producto }}</span>
                    </h6>

                    <h6 class="m-0 ml-3 " style="margin-left: 1rem;" v-for="i in product.lista_productocombo" :key="i.producto_id">
                        ( {{  product.pedido_cantidad }} ) <b style="margin-right: .5rem;">{{ parseInt(i.pedido_cantidad ) }}</b>
                        <span class="font-weight-400">{{ i.pedido_nombre   }}</span>
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
                                <span class="text adicion"><span><b>- ( {{ product.pedido_cantidad }} ) {{ item.modificadorseleccion_cantidad }}</b></span> {{ item.modificadorseleccion_nombre
                                    }}</span>

                                <span    v-if="item.pedido_precio > 0" class="pl-2 text-sm">
                                    <b>{{ formatoPesosColombianos(item.pedido_precio * item.modificadorseleccion_cantidad * product.pedido_cantidad) }}</b>
                                </span>
                            </div>
                    </div>

            </div>

            <!-- Adicionales agrupados -->
            <div class="col-12 p-0 mt-1">


            </div>

            <hr class="p-0 mt-2" />

            <!-- Subtotales y totales -->
            <div class="grid summary-grid">
                <div class="col-6 my-0 py-0">
                    <span><b>Subtotal</b></span>
                </div>
                <div class="col-6 my-0 text-right py-0 text-end">
                    <span>
                        <b>{{ formatoPesosColombianos(store.cartTotal) }}</b>
                    </span>
                </div>

                <div class="col-6 my-0 py-0" v-if=" siteStore.location.site.site_id  != 33">
                    <span :style="siteStore.location.neigborhood.delivery_price == 0
                        ? 'text-decoration: line-through;'
                        : ''
                        "><b>Domicilio</b></span>
                </div>
                <div v-if=" siteStore.location.site.site_id  != 33" class="col-6 my-0 text-right py-0 text-end">
                    <!-- {{ siteStore.location }} -->
                    <span v-if="siteStore.location.neigborhood.delivery_price === 0 && siteStore.location.site.site_id  != 33" class="primary-color">
                        <b>
                            {{
                                route.path.includes('reservas')
                                    ? 'Ir a la sede'
                                    : 'Recoger en local'
                            }}
                        </b>
                    </span>
                    <span v-else-if="siteStore.location.neigborhood.delivery_price > 0">
                        <b>{{ formatoPesosColombianos(siteStore.location.neigborhood.delivery_price) }}</b>
                    </span>

                </div>
                <div class="col-6 my-0 py-0">
                    <span><b>Total</b></span>
                </div>
                <div class="col-6 my-0 text-right py-0 text-end" v-if="siteStore.location.neigborhood.delivery_price || siteStore.location.neigborhood.delivery_price === 0">
                    <!-- {{ siteStore.location }} -->
                    <span><b>{{ formatoPesosColombianos(
                        store.cartTotal +
                        siteStore.location.neigborhood.delivery_price
                            ) }}</b></span>
                </div>

                <!-- <Button @click="siteStore.visibles.currentSite = true" v-else label="Calcular mi domicilio"
                    style="min-width: max-content;"></Button> -->
            </div>

            <!-- Botones de navegación y acciones -->
            <router-link to="/" v-if="route.path.includes('cart')">
                <Button outlined icon="pi pi-shopping-cart" label="Volver al menu'"
                    class="mt-4 button-common button-transparent button-fullwidth button-bold" severity="danger">
                </Button>
            </router-link>

            <router-link to="/cart" v-else-if="route.path != '/reservas'">
                <Button outlined icon="pi pi-arrow-left" label="Volver al carrito"
                    class="mt-4 button-common button-transparent button-fullwidth button-bold"
                    severity="danger"></Button>
            </router-link>

            <Tag v-if="siteStore.status?.status == 'closed' && route.path != '/reservas'" class="mt-2 tag-fullheight"
                severity="danger">
                Cerrado, abre a las {{ siteStore.status.next_opening_time }}
            </Tag>


            <div>

            </div>


            <router-link to="/pay"
                v-if="route.path.includes('cart') && (siteStore.status?.status !== 'closed' && route.path == '/reservas')">
                <Button iconPos="right" icon="pi pi-arrow-right" label="Pedir"
                    class="mt-2 button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
                    severity="help"></Button>
            </router-link>

                        <!-- Botón “Finalizar pedido” (ir a /pay) -->
              <router-link to="/pay" v-else-if="route.path == '/cart'">
                <Button
                  iconPos="right"
                  icon="pi pi-arrow-right"
                  label="Finalizar pedido"
                  class="mt-2 button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
                  severity="help"
                />
              </router-link>


              <Button
                :disabled="reportes.loading.visible"
                v-else-if="route.path == '/pay' && !reportes.loading.visible && siteStore.status?.status !== 'closed' && user.user.payment_method_option?.id != 9 "
                @click="orderService.sendOrder()"
                iconPos="right"
                icon="pi pi-arrow-right"
                label="Finalizar pedido"
                class="mt-2 button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
                severity="help"
              />

                            <Button
                :disabled="reportes.loading.visible" 
                v-else-if="route.path == '/pay' && !reportes.loading.visible && siteStore.status?.status !== 'closed' && user.user.payment_method_option?.id == 9 "
                @click="pay"
                iconPos="right"
                icon="pi pi-arrow-right"
                label="Pagar con tarjeta"
                class="mt-2 button-common button-black button-fullwidth button-bold button-no-border button-no-outline"
                severity="help"
              />



        </div>
    </div>


</template>

<script setup>
import { formatoPesosColombianos } from '@/service/utils/formatoPesos';
import { usecartStore } from '@/store/shoping_cart';
import { useSitesStore } from '@/store/site';
import { useRoute } from 'vue-router';
import { orderService } from '@/service/order/orderService';
import { onMounted, ref, watch } from 'vue';
import { useUserStore } from '@/store/user';
import { Button } from 'primevue';
import { Tag } from 'primevue';
import { useReportesStore } from '@/store/ventas';
import { orderServiceEpayco } from '@/service/order/orderServiceEpayco';
import { URI,URI_SOCKET,SELF_URI } from '@/service/conection';





const reportes = useReportesStore()

const sending = ref(false);
const route = useRoute();
const store = usecartStore();
const siteStore = useSitesStore();
const user = useUserStore();

const agrupados = ref({});
const epaycoPublicKey = import.meta.env.VITE_EPAYCO_PUBLIC_KEY;
console.log(epaycoPublicKey)

onMounted(() => {
    if (user.user.payment_method_option?.id != 7 && !route.path.includes('reservas'))
        siteStore.setNeighborhoodPrice();
    else {
        siteStore.setNeighborhoodPriceCero();
    }
});

watch(
    () => store.cart.additions,
    () => {
        update();
    },
    { deep: true }
);

const order_id = ref('')
const pay = async() => {
 order_id.value =  await orderServiceEpayco.sendOrder()

 if (!order_id.value) {
    console.error("Error al crear la orden, no se pudo obtener el order_id");
    return;
  }

  // Llamamos a la función para iniciar el pago con ePayco
 payWithEpayco(order_id.value)

}

const payWithEpayco = (order_id) => {
  // Verificamos que el objeto ePayco esté disponible en window
  if (!window.ePayco) {
    console.error("Epayco script no se ha cargado o no está disponible");
    return;
  }

  // Configuramos el Checkout
  const handler = window.ePayco.checkout.configure({
    key: epaycoPublicKey,  // Reemplaza con tu Public Key real
    test: false,                              // true = pruebas, false = producción
    response_type: 'redirect',
    onClosed: function () {
      console.log("Modal de Epayco cerrado");
    }
  });

  // Calcular total a pagar
  const totalAPagar = store.cartTotal +
  siteStore.location.neigborhood.delivery_price

  // Abrimos el modal con los datos necesarios
  handler.open({
    name: order_id,
    description: order_id,
    amount: totalAPagar,
    currency:siteStore?.location?.site?.time_zone == 'America/New_York'? "usd" : "cop",
    invoice: order_id,
    tax_base: "0",
    tax: "0",
    country: "co",
    lang: "es",
    external: "false",
    confirmation: `${URI}/confirmacion-epayco`, 
    response: `${SELF_URI}/gracias-epayco`,
    name_billing: user.user.name || '',
    address_billing: user.user.address || '',
    type_doc_billing: "cc",
    mobilephone_billing: user.user.phone_number || '',
    email_billing: user.user.email || '',
    methodsDisable: ["SP","CASH"]
     
  });
};

</script>

<style scoped>
/* --- Clases nuevas para reemplazar estilos en línea --- */

/* Contenedor “sticky” del resumen */
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

/* Línea de cada producto (display: flex; justify-content: space-between) */
.product-line {
    display: flex;
    justify-content: space-between;
}

/* Span con min-width: 3rem; y width: 100% */
.span-minwidth {
    min-width: 3rem;
    width: 100%;
}

/* Forzar texto a “end” */
.text-end {
    text-align: end;
}

/* Contenedor de adiciones agrupadas */
.addition-group {
    position: relative;
    border-radius: 0.3rem;
}

/* Cada ítem de adicional */
.addition-item {
    display: flex;
    margin-left: 1rem;
    gap: 1rem;
    align-items: center;
}

/* Contenedor interno de ítem adicional */
.addition-item-inner {
    display: flex;
    width: 100%;
    gap: 1rem;
    justify-content: space-between;
}

/* Grid para los subtotales y totales */
.summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

/* Texto con color primario */
.primary-color {
    color: var(--primary-color);
}

/* Ajustes de fuente para la descripción base (opcional) */
.font-weight-400 {
    font-weight: 400;
}

/* Botones y clases genéricas */
.button-common {
    outline: none;
    margin: .5rem 0;
}

.button-no-outline {
    outline: none;
}

.button-no-border {
    border: none;
}

.button-fullwidth {
    width: 100%;
}

.button-bold {
    font-weight: bold;
}

.button-transparent {
    background-color: rgba(0, 0, 0, 0);
}

.button-black {
    background-color: black;
}

/* Tag de aviso de “Restaurante cerrado” */
.tag-fullheight {
    width: 100%;
    height: 2.5rem;
}

/* Estilos globales ya existentes */
.p-shadow {
    box-shadow: 0 0.3rem 5px rgba(0, 0, 0, 0.15);
}

button {
    text-transform: uppercase;
}

* {
    text-transform: uppercase;
    font-size: 0.9rem;
}

*::first-letter {
    text-transform: uppercase;
}
</style>
