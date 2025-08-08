<template>


<Dialog header="TU PEDIDO" v-if="order.order_id" v-model:visible="order.order_id" modal :closable="false">

  
  <div 
    class="p-2 col-12 my-6"
    style="height: auto; min-height: 90vh; padding: 0rem; display: flex; gap: 1rem; justify-content: center; align-items: center;"
  >
    <div
      class="shadow-7 p-4"
      style="border-radius: 0.5rem; max-width: 500px; display: flex; flex-direction: column; gap: 0.5rem; font-size: 1rem; background-color: white;padding: 1rem;"
    >
      <!-- Nombre de usuario (null-check con ?.) -->
      <p
        class="text-4xl text-center mt-5"
        style="font-weight: bold; text-align: center;"
      >
        🤩{{ order?.pe_json?.cliente?.cliente_nombres?.toUpperCase() }} {{ order?.pe_json?.cliente?.cliente_nombres?.cliente_apellidos?.toUpperCase() }}🤩
      </p>

      <p
        class="text-2xl text-center"
        style="font-weight: bold; text-align: center;"
      >
        🔥MUCHAS GRACIAS POR TU COMPRA!🔥
      </p>


      <div id="factura" style="width: 100%; text-transform: uppercase;">
              <div id="factura" style="width: 100%;">
  
        <!-- {{ order.pe_json }} -->
  
        <Tag style="" class="tag mb-2" severity="success" v-if="order.responsible_id">  Pago autorizado </Tag> <br> 
        
        <Tag class="tag" severity="success" v-if="order.responsible_id">  {{order.name}}</Tag>
  
       
      
        <div class="" style="width: auto;">
         
            <p class="" id="id" style="font-weight: bold;min-width: 100%; width: max-content; text-align: center; color: black; margin:0rem;"> ID:{{ order.order_id }} </p>
  
  
            <p class="" id="id" style="font-weight: bold;min-width: 100%; width: max-content; text-align: center; color: black; margin:0rem;">              {{ order.user_name }} {{ order.second_name }} {{ order.first_last_name }} {{ order.second_last_name }} </p>
  
  
  
            
                <p style="padding: 0;color: black;text-align: center; margin: auto; margin-bottom: 1rem; width: max-content;min-width: max-content;display: flex;justify-content: center; flex-direction: column ">
                  <b>
                    fecha: {{ order.latest_status_timestamp?.split('T')[0] }}
                  </b>
  
                  <b>
                    Hora: {{ order.latest_status_timestamp?.split('T')[1]?.split(':')?.slice(0,2)?.join(':') }}
  
                  </b>
                </p>
             
  
   <!-- <img src="https://cocina.salchimonster.com/images/logo.png" alt="" style="width: 2cm;"> -->
            <div class=""
              style="font-weight: bold;color:white;margin: 0; background-color: black;align-items: center;display: grid; grid-template-columns: auto auto; ">
  
              <div class="px-2" style="width: 100%;" >
  
                <b> productos</b>
  
  
              </div>
            
              <div class="px-2">
                <p style="text-align: end;font-weight: bold;">
                  <b>
                    total
                  </b>
                  
                </p>
              </div>
  
            </div>
  
           
            <div  v-for="product in order.pe_json?.listaPedidos">
  
              <div style="display: grid; gap:0 1rem; grid-template-columns: auto auto;">
               
                <p v-if="store.currentOrder?.site_id == 32" class="p-0 m-0">
                  <b>
                    (    {{ product.pedido_cantidad  }} kg )      </b>
                    {{ product.pedido_nombre_producto }}
             
           ( {{  product.pedido_cantidad /  product.presentacion  }} {{product.presentation_unit_measure}})
                  <br>
                </p>
            

                <p v-else class="p-0 m-0">
                  <b>
                    ( {{ product.pedido_cantidad }} )  </b>
                    {{ product.pedido_nombre_producto }}
             
           
                  <br>
                </p>
                
                
            
              <!-- <div >
                <p style="text-align: end;color: black;">
                  {{ formatoPesosColombianos(product.price) }}
                </p>
              </div> -->
              <div >
                <p v-if="product.pedido_base_price" style="text-align: end;color: black;">
                  <!-- {{ formatoPesosColombianos(product.price) }} -->
                  {{ formatoPesosColombianos(product.pedido_base_price * product.pedido_cantidad) }}
                </p>
  
                <p v-else style="text-align: end;color: black;">
                  <!-- {{ formatoPesosColombianos(product.price) }} -->
                  {{ formatoPesosColombianos(product.pedido_precio) }}
                </p>
              </div>
  
  
              </div>
  
              <p v-if="product.lista_productocombo?.length > 0" class="p-0 m-0"><b>COMBO INCLUYE</b></p>
              <p v-if="product.lista_productocombo" class="p-0 m-0 ml-5" style="" v-for="i in product.lista_productocombo" > -- <b>{{i.pedido_cantidad  }}</b>  {{i.pedido_nombre  }} </p> 
  
  
              <!-- <p> {{ product.modificadorseleccionList }} </p> -->
  
  
              <!-- {{ product.modificadorseleccionList.filter(p => p.pedido_productoid == product.pedido_productoid) }} -->
  
       
                <div style="display: flex;width: ; justify-content: space-between;" class="p-0 m-0" v-for="i in  product.modificadorseleccionList">
           
                  <p class="p-0 m-0 " style="">
         
                    - ( {{ product.pedido_cantidad }} ) <b>{{ i.modificadorseleccion_cantidad  }}</b> {{ i.modificadorseleccion_nombre }}
                  </p>
  
                  <p class="p-0 m-0" style="text-align: end;"> {{ formatoPesosColombianos(i.pedido_precio * i.modificadorseleccion_cantidad * product.pedido_cantidad)  }} </p>
  
              </div>
  
              <div style="background-color: rgba(0, 0, 0, 0.286); height: 1px;">
  
  </div>  
  
            </div>
            
  
  
  
  <!-- 
            <div s  v-for="(items, grupo) in order.additional_items" :key="grupo"
              style="position: relative; margin-top: 0.5rem;">
  
  
  
              <p style="background-color: black;font-weight: bold; color: white; width: 100%;margin: 0;">
                <b>{{ grupo }}</b>
  
              </p>
  
  
              <div   v-for="aditional in items">
                <div style="display: grid; grid-template-columns: auto 20%;align-items: center;">
  
                  <div >
                    <p >
                      {{ aditional.aditional_quantity }}  {{ aditional.aditional_name }}
                    </p>
                  </div>
  
                  <div >
                    <p style="text-align: end;color: black;">
                      {{ formatoPesosColombianos(aditional.total_aditional_price) }}
                    </p>
                  </div>
                </div>
                <div style="background-color: rgba(0, 0, 0, 0.286); height: 1px;">
  
                </div>
  
  
  
  
  
  
              </div>
  
            </div>
   -->
  
  
  
  
   
  
  
  
  
  
  
            <div class="" style="display: grid ;margin-top: 1rem; grid-template-columns: auto auto">
              <div class="">
                <span style="font-weight: bold;"><b>Subtotal</b></span>
              </div>
              <div class="">
                <p  style="text-align: end;font-weight: bold; color: black;">
                  <b >{{ formatoPesosColombianos(order.pe_json.delivery.delivery_pagocon -  order.pe_json?.delivery?.delivery_costoenvio) }}</b>
                 
                </p>
              </div>
  
  
              <div class="">
                <span class="m-0 " style="font-weight: bold;"><b>Domicilio</b></span>
              </div>
  
              <div class="">
                <p class="m-0 p-0" style="text-align: end;font-weight: bold;color: black;"> <b>
                 
                    {{ formatoPesosColombianos(order.pe_json?.delivery?.delivery_costoenvio) }}
                  </b>
                </p>
              </div>
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
              <div class="">
                <span  style="font-weight: bold;color: black;" ><b>Total</b></span>
              </div>
              <div class="">
  
                <p class="m-0 p-0" style="text-align: end;color: black;font-weight: bold;"><b>{{ formatoPesosColombianos(order.pe_json.delivery.delivery_pagocon)
                }}</b></p>
  
              </div>
              <div class="">
                
              </div>
  
            </div>
            <p class="px-2"  style="font-weight: bold;background-color: black;color: white;padding: 0; margin: 0; margin-top: 0.5rem;"><b>Notas</b></p>
            <p
                class="notas p-2 m-0"
                style="border: 1px solid; margin: 0; color: black; padding: 0.5rem;"
               
              >  {{ order.order_notes?.toLowerCase() }}</p>
  
             
  
  
  
                <p class="px-2"  style="background-color: black;font-weight: bold;margin: 1rem 0; color: white;">
                <b>cliente</b>
                </p>
  
                <div style="display: grid;gap:0rem 2rem; grid-template-columns: auto auto; align-items: start;">
  
  
  
  
                  <div class="" style="">
                <span><b>Nombre</b></span>
              </div>
              <div class="">
                <span style="text-align: start;color: black; ">
  
                  {{ order.user_name }} {{ order.second_name }} {{ order.first_last_name }} {{ order.second_last_name }}
                </span>
  
              </div>
  


              <div v-if="order.site_id == 32" class="" style="">
                <span><b>Cedula / Nit</b></span>
              </div>
              <div v-if="order.site_id == 32" class="">
                <span style="text-align: start;color: black;">
  
                  {{ order.cedula_nit }} 
                </span>
  
              </div>
  
  
  
  
  
              <div class="" style="">
                <span><b>Metodo de entrega</b></span>
              </div>
              <div class="">
                <span style="text-align: start;color: black;">
  
                  {{ order.order_type }}
                </span>
  
              </div>
  
              
              <div v-if="order.site_id == 32" class="" style="">
                <span><b>Fecha de entrega</b></span>
              </div>
              <div v-if="order.site_id == 32" class="">
                <p style="text-align: start;color: black; ">
                  {{order.pe_json.delivery.delivery_horaentrega }}
                </p>
  
              </div>
  
  
  
  
              <div class="" style=""  v-if="order.placa">
                <span><b>Placa del vehiculo</b></span>
              </div>
              <div class=""  v-if="order.placa">
                <p style="text-align: start;color: black; ">
  
                  {{ order.placa }}
                </p>
  
              </div>
  
  
  
  
  
              <div  style="">
                <span><b>telefono</b></span>
              </div>
              <div>
                <span style="text-align: start;color: black; ">
  
                  {{ order.user_phone }}
  
                  
                </span>
              </div>



              
  
              <div v-if="order.site_id == 32"  style="">
                <span><b>Correo</b></span>
              </div>
              <div v-if="order.site_id == 32">
                <span  style="text-align: start;color: black; ">
  
                  {{ order.email }}
  
                  
                </span>
              </div>









              <div style="" v-if="order.order_type != 'Pasar a recoger'">
                <span><b>direccion </b></span>
              </div>
              <div style="" v-if="order.order_type != 'Pasar a recoger'" >
                <span style="text-align: start;color: black;">
  
                  {{ order.user_address?.toLowerCase() }}
  
  
                </span>
              </div>
  
  
  
  
              <div>
                <span><b>metodo de pago</b></span>
              </div>
              <div >
                <span style="text-align: start;color: black;">
  
                  {{ order.payment_method?.toLowerCase() }}
                </span>
              </div>
  
                </div>
             
            <!-- 
              <router-link to="/SALCHIPAPAS/3" v-if="route.path.includes('cart')">
                  <Button outlined icon="pi pi-shopping-cart" label="Seguir comprando" class="mt-4" severity="danger"
                      style="outline: none;width: 100%;font-weight: bold; background-color: rgba(0, 0, 0, 0);"></Button>
  
              </router-link>
  
              <router-link to="/cart" v-else>
                  <Button outlined icon="pi pi-arrow-left" label="Volver al carrito" class="mt-4" severity="danger"
                      style="outline: none;width: 100%;font-weight: bold; background-color: rgba(0, 0, 0, 0);"></Button>
  
              </router-link>
  
  
              <router-link to="/pay" v-if="route.path.includes('cart')">
                  <Button iconPos="right" icon="pi pi-arrow-right" label="Pedir" class="mt-2" severity="help"
                      style="outline: none;width: 100%; border: none;font-weight: bold; background-color: black;"></Button>
              </router-link>
  
              <router-link to="/pay" v-else>
                  <Button @click="orderService.sendOrder()" iconPos="right" icon="pi pi-arrow-right" label="Finalizar pedido"
                      class="mt-2" severity="help"
                      style="outline: none;width: 100%; border: none;font-weight: bold; background-color: black;"></Button>
              </router-link> -->
  
     
  
  
  
  
  
  
  
  
        </div>
  
  
  
  
  
      </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1rem;">


   


        <a
         
          :href="whatsappUrl3"
          target="_blank"
        >
          <Button
            icon="pi pi-whatsapp"
            severity="danger"
            class="wsp"
            style="font-weight: bold; background-color: #00b66c; border: none; width: 100%;"
            label="TIENES DUDAS ? ESCRIBENOS"
          ></Button>
        </a>

        <!-- <router-link to="/">
          <Button
            icon="pi pi-arrow-left"
            severity="danger"
            outlined
            style="font-weight: bold; border: none; width: 100%;"
            label="VOLVER AL MENU"
          ></Button>
        </router-link> -->
      </div>





      <div v-if="route.query?.ref_payco">

        <h4>Información de pago</h4>


<div  style="display: grid; grid-template-columns: 1fr 1fr;">

  <div>
     <h5> Ref. Comercio</h5>
  </div>

  <div>
    <h5 style="font-weight: 300;"> {{epayco_data?.x_id_factura}}</h5>
  </div>





  <div>
     <h5> Ref. ePayco</h5>
  </div>

  <div>
    <h5 style="font-weight: 300;"> {{epayco_data?.x_ref_payco}}</h5>
  </div>


  <div>
     <h5> Banco </h5>
  </div>

  <div>
    <h5 style="font-weight: 300;"> {{epayco_data?.x_bank_name}}</h5>
  </div>


  <div>
     <h5> Estado </h5>
  </div>

  <div>
    <h5 style="font-weight: 300;"> {{epayco_data?.x_transaction_state}}</h5>
  </div>


  <div>
     <h5> Autorización </h5>
  </div>

  <div>
    <h5 style="font-weight: 300;"> {{epayco_data?.x_approval_code}}</h5>
  </div>
  <div>
     <h5> Tarjeta </h5>
  </div>

  <div>
    <h5 style="font-weight: 300;"> {{epayco_data?.x_cardnumber}}</h5>
  </div>


  <div>
     <h5> Total </h5>
  </div>

  <div>
    <h5 style="font-weight: 300;"> {{ formatoPesosColombianos(epayco_data?.x_amount)  }}</h5>
  </div>


</div>

      </div>


      <div style="display: flex;justify-content: end; gap:1rem;text-decoration: none; margin:1rem 0" :href="`https://secure.epayco.co/landingresume?ref_payco=${route.query.ref_payco}`">


        <!-- <Button icon="pi pi-print" style="background-color: black;width:50%; border:none;outline:none" label="Imprimir 0 guardar" ></Button> -->
        <Button @click="pay" icon="pi pi-ticket" style="width:50%; border:none;outline:none" label="pagar" ></Button>
      </div>

    </div>






  </div>


</Dialog>



  <div v-else style="display: flex; align-items: center;justify-content: center;height: 90vh;width: 100vw;">
    <h2>
      Cargando tu pedido...
    </h2>
  </div>


    
</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, onUnmounted } from "vue";
import { usecartStore } from "@/store/shoping_cart";
import { useUserStore } from "@/store/user";
import { useSitesStore } from "@/store/site";
import { Button } from "primevue";
import resumen from "./resumen.vue";
import resumenGracias from "./ResumenGracias.vue";
import router from "@/router";
import { formatoPesosColombianos } from "@/service/utils/formatoPesos";
import { useReportesStore } from "@/store/ventas";
import { useRoute } from "vue-router";
import { fetchService } from "@/service/utils/fetchService";
import { URI } from "@/service/conection";
import {Tag} from "primevue";
import {Dialog} from "primevue";
import { orderServiceEpayco } from '@/service/order/orderServiceEpayco';
import { SELF_URI } from "@/service/conection";
import {ProgressSpinner} from "primevue";
// Stores
const store = usecartStore();
const user = useUserStore();
const epaycoPublicKey = import.meta.env.VITE_EPAYCO_PUBLIC_KEY;
console.log(epaycoPublicKey)
const sitestore = useSitesStore();
const reportes = useReportesStore();
const route = useRoute()
const epayco_data = ref({})

  const getOrderMessage = (order) => {
      const hora = order.latest_status_timestamp?.split('T')[1]?.split(':')?.slice(0,2)?.join(':') 
      switch (order.current_status) {
          case "enviada":
              return `El pedido fue enviado a su domicilio a las ${hora}`;
          case "cancelada":
              return `El pedido fue cancelado a las ${hora}\nResponsable: ${order.responsible}\nRazón: ${order.reason}`;
          case "en preparacion":
              return `El pedido está en preparación desde las ${hora} y será enviado en breve.`;
          case "generada":
              return `Hemos recibido su pedido a las ${hora} y empezaremos a prepararlo en breve. Gracias por su espera.`;
          default:
              return "";
      }
  };
  



  const getOrder = async () => {
    store.setLoading(true, "Buscando orden...");
    try {
        const response = await fetch(`${URI}/order-by-id/${order_id.value}`);
        if (!response.ok) throw new Error("Error al obtener la orden");
        order.value = await response.json();
    } catch (error) {
        console.error("Error al obtener la orden:", error);
        order.value = {};
    } finally {
        store.setLoading(false, "Buscando orden...");
    }
};



const pay = async() => {

 payWithEpayco(order.value.order_id)

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
  const totalAPagar = order.value.pe_json.delivery.delivery_pagocon 

  const user = order.value.pe_json.cliente;

  // Abrimos el modal con los datos necesarios
  handler.open({
    name: order_id,
    description: order_id,
    amount: totalAPagar,
    currency:"cop",
    invoice: order_id,
    tax_base: "0",
    tax: "0",
    country: "co",
    lang: "es",
    external: "false",
    confirmation: `${URI}/confirmacion-epayco`, 
    response: `${SELF_URI}/gracias-epayco`,
    name_billing: `${user.cliente_nombres} ${user.cliente_apellidos }` || '',
    address_billing: user.cliente_direccion || '',
    type_doc_billing: "cc",
    mobilephone_billing: user.cliente_telefono || '',
    methodsDisable: ["SP","CASH"]
  });
};
  
const order  = ref({
  "order_id":null,
  "user_id": null,
  "site_id": null,
  "site_name": "",
  "delivery_person_id": null,
  "order_notes": "",
  "delivery_price": null,
  "payment_method": "",
  "total_order_price": null,
  "current_status": "",
  "latest_status_timestamp": "",
  "responsible": null,
  "reason": null,
  "user_name": "",
  "user_address": "",
  "user_phone": "",
  "calcel_sol_state": null,
  "calcel_sol_asnwer": null,
  "cancelation_solve_responsible": null,
  "responsible_observation": null,
  "authorized": null,
  "responsible_id": null,
  "name": "",
  "inserted_by_id": null,
  "inserted_by_name": null,
  "inserted_by": null,
  "pe_json": {
    "cliente": {
      "cliente_nombres": "",
      "cliente_telefono": "",
      "cliente_apellidos": "",
      "cliente_direccion": ""
    },
    "delivery": {
      "local_id": null,
      "canaldelivery_id": null,
      "delivery_pagocon": null,
      "delivery_tipopago": null,
      "delivery_costoenvio": null,
      "delivery_horaentrega": "",
      "delivery_notageneral": "",
      "delivery_direccionenvio": "",
      "delivery_codigointegracion": "",
      "delivery_codigolimadelivery": ""
    },
    "listaPedidos": [
      {
        "signature": "",
        "pedido_precio": null,
        "pedido_escombo": "",
        "pedido_cantidad": null,
        "pedido_base_price": "",
        "pedido_productoid": "",
        "lista_productocombo": [],
        "pedido_nombre_producto": "",
        "modificadorseleccionList": [],
        "productogeneral_urlimagen": ""
      }
    ]
  },
  "payment_method_id": null,
  "rol_id": null,
  "placa": null,
  "order_type_id": null,
  "order_type": "",
  "cedula_nit": null,
  "email": "",
  "second_name": null,
  "first_last_name": null,
  "second_last_name": null,
  "sede_recoger": null,
  "epayco_ref": "",
  "id": "",
  "is_reserva": null,
  "reserva_date": null
}
)

onMounted( async() => {

})

const text = ref("");
const text2 = ref("");
const text3 = ref("");

const obtenerHoraFormateadaAMPM = (fecha) => {
  const fechaParseada = new Date(fecha);
  const horas = fechaParseada.getHours();
  const minutos = fechaParseada.getMinutes();
  const ampm = horas >= 12 ? "pm" : "am";
  const hora12 = horas % 12 || 12;
  const horaFormateada = hora12 < 10 ? "0" + hora12 : hora12;
  const minutosFormateados = minutos < 10 ? "0" + minutos : minutos;
  return `${horaFormateada}:${minutosFormateados} ${ampm}`;
};

onMounted(async() => {


  const order_id = route.params?.order_id




  order.value = await fetchService.get(`${URI}/order-by-id/${order_id}`);


  reportes?.setLoading(false, "enviando tu pedido");

  const message_products = [];

  // Null-check sobre store.cart
  (store?.cart || []).forEach((element) => {
    message_products.push(
      `*(${element?.pedido_cantidad  || 0} kilos)* de ${
        element?.pedido_nombre_producto || ""
      } ( ${element?.pedido_cantidad  / element?.presentacion} ${element.presentation_unit_measure})`
    );
  });

  text.value = `Hola soy *${
    (user.user?.name?.toUpperCase() || "") +
    " " +
    (user.user?.second_name?.toUpperCase() || "") +
    "  " +
    (user.user?.first_last_name?.toUpperCase() || "") +
    " " +
    (user.user?.second_last_name?.toUpperCase() || "")
  }* 🤗 acabo de hacer el siguiente pedido en la página web *distrimonster.com*

${(message_products || []).join("\n")}

El número de la orden es *#${store?.last_order || ""}*.
la pagina indica que es para recoger en la sede *${
    sitestore.location?.site?.site_name || ""
  }* el  *${store?.delivery_horaentrega || ""}*

*Escribo para Realizar la Transferecia*\n
*Muchas Gracias* 🙏`;

  text2.value = `Hola soy *${
    (user.user?.name?.toUpperCase() || "") +
    " " +
    (user.user?.second_name?.toUpperCase() || "") +
    "  " +
    (user.user?.first_last_name?.toUpperCase() || "") +
    " " +
    (user.user?.second_last_name?.toUpperCase() || "")
  }*

🤗 acabo de hacer el siguiente pedido en la página web *distrimonster.com*

${(message_products || []).join("\n")}

El número de la orden es *#${store?.last_order || ""}*.
la pagina indica que es para recoger en la sede *${
    sitestore.location?.site?.site_name || ""
  }* el  *${store?.delivery_horaentrega || ""}*

*Escribo para Confirmar el pedido*\n
*Muchas Gracias* 🙏`;


text3.value = `Hola soy *${
    (user.user?.name?.toUpperCase() || "") +
    " " +
    (user.user?.second_name?.toUpperCase() || "") +
    "  " +
    (user.user?.first_last_name?.toUpperCase() || "") +
    " " +
    (user.user?.second_last_name?.toUpperCase() || "")
  }*

🤗 acabo de hacer el siguiente pedido en la página web *salchimonster.com*

El número de la orden es *#${store?.last_order || ""}*.

Realice' el pago con la tarjeta *${epayco_data.value?.x_cardnumber}*
Y la referencia del pago es *${epayco_data.value?.x_ref_payco}*

*Muchas Gracias* 🙏`;
});





const whatsappUrl = computed(() => {
  const baseUrl = "https://api.whatsapp.com/send";
  const urlParams = new URLSearchParams({
    phone: "573053447255",
    text: text.value,
  });
  return `${baseUrl}?${urlParams.toString()}`;
});

const whatsappUrl2 = computed(() => {
  const baseUrl = "https://api.whatsapp.com/send";
  const urlParams = new URLSearchParams({
    phone: "573053447255",
    text: text2.value,
  });
  return `${baseUrl}?${urlParams.toString()}`;
});

const whatsappUrl3 = computed(() => {
  const baseUrl = "https://api.whatsapp.com/send";
  const urlParams = new URLSearchParams({
    phone: "573053447255"
  });
  return `${baseUrl}?${urlParams.toString()}`;
});

onUnmounted(() => {
  // Ejemplo de limpiar user.user si se quisiera:
  // user.user = {
  //   name: '',
  //   neigborhood: '',
  //   address: '',
  //   phone_number: '',
  //   payment_method_option: '',
  //   was_reserva: false
  // },

  // Null-check antes de reasignar:
  if (store?.cart) {
    store.cart = [];
  }
});
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
  animation: parpadeo ease infinite 0.5s;
  transition: all ease 0.5s;
}
</style>
