<template>
    <div class="p-2 col-12 my-6"
        style="height: auto;min-height: 90vh;padding: .5rem; display: flex;gap:rem; justify-content: center; align-items: center;">
        <div class="shadow-7 p-4"
            style="border-radius: 0.5rem; max-width: 500px;display: flex;flex-direction: column;gap: .5rem;font-size: 1.3rem;">
            <p class="text-4xl text-center mt-5" style="font-weight: bold;text-align: center;"> 🤩{{ user.user.name.toUpperCase() }}🤩</p>
            <p class="text-2xl text-center " style="font-weight: bold;text-align: center;">🔥MUCHAS GRACIAS POR TU COMPRA!🔥</p>

            <p class="text-4xl text-center my-5" style="font-weight: bold; text-transform: uppercase;text-align: center;"> <span
                    class="text-2xl">ID DEL PEDIDO</span> <br> #{{ store.last_order }}</p>




            <p class="text-2xl text-center my-3 p-3"
                style=" border-radius: .3rem; background-color: var(--p-primary-color); padding: 1rem; color: white;">
                Hemos recibido tu
                pedido y en breve será despachado</p>

<div>

</div>


            <div id="factura" style="width: 100%;text-transform: uppercase;">






                <resumenGracias></resumenGracias>




            </div>


            <div style="display: flex;flex-direction: column;gap: 1rem;">


                <router-link to="/rastrear-pedido">
                    <Button class="mt-3" icon="pi " iconPos="right" severity="warning"
                        style="font-weight: bold; width: 100%;" label="PUEDES RASTREARLO AQUI"></Button>
                </router-link>


                <a v-if="user.user.payment_method_option.id == 6" :href="whatsappUrl" target="_blank"> <Button
                        icon="pi pi-whatsapp" severity="danger" class="wsp"
                        style="font-weight: bold;background-color: #00b66c; border: none; width: 100%;"
                        label="REALIZAR TRANSFERENCIA"></Button>
                </a>


                <a v-if="[5,8].includes(user.user.payment_method_option.id) " :href="whatsappUrlConfirmar" target="_blank"> <Button
                    icon="pi pi-whatsapp" severity="danger" class="wsp"
                    style="font-weight: bold;background-color: #00b66c; border: none; width: 100%;"
                    label="Confirmar mi pedido"></Button>
                </a>



                <router-link to="/">
                    <Button icon="pi pi-arrow-left" severity="danger" outlined
                        style="font-weight: bold; border: none; width: 100%;" label="VOLVER AL MENU"></Button>
                </router-link>




            </div>

        </div>
    </div>
</template>

<script setup>

import { ref, onMounted, onBeforeUnmount, onBeforeMount, computed, onUnmounted } from 'vue';
import { usecartStore } from '@/store/shoping_cart';
import { useUserStore } from '@/store/user'
import { useSitesStore } from "@/store/site";
import { Button } from 'primevue';
import resumen from './resumen.vue';
import resumenGracias from './ResumenGracias.vue';
import router from '@/router';
const site = useSitesStore();
import { formatoPesosColombianos } from '@/service/utils/formatoPesos';
const text = ref('');
const textConfirmar = ref('');
const store = usecartStore();
const user = useUserStore()
import { useReportesStore } from '@/store/ventas';

const reportes = useReportesStore()

const obtenerHoraFormateadaAMPM = (fecha) => {
    const fechaParseada = new Date(fecha);
    const horas = fechaParseada.getHours();
    const minutos = fechaParseada.getMinutes();
    const ampm = horas >= 12 ? 'pm' : 'am';
    const hora12 = horas % 12 || 12;
    const horaFormateada = hora12 < 10 ? '0' + hora12 : hora12;
    const minutosFormateados = minutos < 10 ? '0' + minutos : minutos;

    return `${horaFormateada}:${minutosFormateados} ${ampm}`;
};






onMounted(() => {
    reportes.setLoading(false, "enviando tu pedido");

    text.value = `Hola soy *${user.user.name.toUpperCase()}* 🤗 acabo de hacer el siguiente pedido en la página web. El número de la orden es *#${store.last_order}*.\n

    *Escribo para Realizar la Transferecia*\n

    *Muchas Gracias* 🙏`;

    console.log(text.value);

    
    textConfirmar.value = `Hola, para validar el pedido 🔥 *#${store.last_order}* 🔥`;

});




const whatsappUrl = computed(() => {
    const baseUrl = 'https://api.whatsapp.com/send';
    let phone = 573053447255
    store.last_order.split('-')[0] == 'NEW'?  phone = 13477929350 :  phone = 573053447255
    const urlParams = new URLSearchParams({
        phone: phone,
        text: text.value
    });
    return `${baseUrl}?${urlParams.toString()}`;
});




const whatsappUrlConfirmar = computed(() => {
    const baseUrl = 'https://api.whatsapp.com/send';
    let phone = 573053447255
    store.last_order.split('-')[0] == 'NEW'?  phone = 13477929350 :  phone = 573053447255
    const urlParams = new URLSearchParams({
        phone: phone,
        text: textConfirmar.value
    });
    return `${baseUrl}?${urlParams.toString()}`;
});





onUnmounted(() => {
    user.user = {
          name:'',
          neigborhood:'',
          address:'',
          phone_number:'',
          payment_method_option:'',
          was_reserva:false
      },

    store.cart = []
})

// onBeforeMount(() => {
//     store.cart.length <= 0? router.push('/'):''
// })

</script>


<style scoped>
@keyframes parpadeo {
    0% {
        filter: brightness(1);
    }

    50% {
        filter: brightness(1.1);
        transform: scale(1.01);
    }

}

.wsp {
    animation: parpadeo ease infinite .5s;
    transition: all ease .5s;
}


*{
    /* font-size: 1.3rem; */
    /* margin: 0; */

}
</style>
