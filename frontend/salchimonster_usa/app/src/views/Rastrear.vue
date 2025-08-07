<template>
    <div class="">
        <div class="container">
            <p class="title">Consultar estado de mi pedido</p>
            <div class="input-container">
                <InputText v-model="order_id" class="input-text" placeholder="Número de pedido" />
                <Button label="Buscar" class="search-button" @click="getOrder" />
            </div>

            <p v-if="order?.status" :class="`estado ${order.status?.split(' ').join('-')}`">
                {{ getOrderMessage(order) }}
            </p>

            <p v-else class="estado no-existe">
                Digita el numero de tu pedido ejemplo <strong style="text-transform: uppercase;">LAU-3034</strong>
            </p>
        </div>


        <div v-if="order.id" id="factura" style="width: 100%;margin: auto; max-width: 30rem;">

<!-- {{ order?.pe_json }} -->

<Tag style="" class="tag mb-2" severity="success" v-if="order?.responsible_id"> <i class="pi pi-whatsapp mr-2"></i>   TRANSFERENCIA APROBADA</Tag> <br> 

<Tag class="tag" severity="success" v-if="order?.responsible_id">  {{order?.name}}</Tag>



<div class="" style="width: auto;">



<!-- <img src="https://cocina.salchimonster.com/images/logo.png" alt="" style="width: 2cm;"> -->
    <div class=""
      style="font-weight: bold;color:white;margin: 0; background-color: black;align-items: center;display: grid; grid-template-columns: auto auto; ">

      <div style="width: 100%;" >

        <b> productos</b>


      </div>
    
      <div >
        <p style="text-align: end;font-weight: bold;">
          <b>
            total
          </b>
          
        </p>
      </div>

    </div>

   
    <div  v-for="product in order?.pe_json?.listaPedidos">

      <div style="display: grid; grid-template-columns: auto auto;">
       
        <p class="p-0 m-0">
      (    {{ product.pedido_cantidad }} )
          {{ product.pedido_nombre_producto }}
          <br>
        </p>
    
        
        
    
      <!-- <div >
        <p style="text-align: end;color: black;">
          {{ formatoPesosColombianos(product.price) }}
        </p>
      </div> -->
      <div >
        <p style="text-align: end;color: black;">
          <!-- {{ formatoPesosColombianos(product.price) }} -->
          {{ formatoPesosColombianos(product.pedido_base_price * product.pedido_cantidad) }}
        </p>
      </div>


      </div>

      <p v-if="product.lista_productocombo.length > 0" class="p-0 m-0"><b>COMBO INCLUYE</b></p>
      <p v-if="product.lista_productocombo" class="p-0 m-0 ml-5" style="" v-for="i in product.lista_productocombo" > -- <b>{{i.pedido_cantidad  }}</b>  {{i.pedido_nombre  }} </p> 


      <!-- <p> {{ product.modificadorseleccionList }} </p> -->


      <!-- {{ product.modificadorseleccionList.filter(p => p.pedido_productoid == product.pedido_productoid) }} -->


        <div style="display: flex;width: ; justify-content: space-between;" class="p-0 m-0" v-for="i in  product.modificadorseleccionList?.filter(p => p.pedido_productoid == product.pedido_productoid)">
   
          <p class="p-0 m-0 " style="">
 
            - ( {{ product.pedido_cantidad }} ) <b>{{ i.modificadorseleccion_cantidad / product.pedido_cantidad }}</b> {{ i.modificador_nombre }}
          </p>

          <p class="p-0 m-0" style="text-align: end;"> {{ formatoPesosColombianos(i.pedido_precio * i.modificadorseleccion_cantidad)  }} </p>

      </div>

      <div style="background-color: rgba(0, 0, 0, 0.286); height: 1px;">

</div>  

    </div>
    



<!-- 
    <div s  v-for="(items, grupo) in order?.additional_items" :key="grupo"
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











    <div class="" style="display: grid ;color: ;margin-top: 0.5rem; grid-template-columns: auto auto">
      <div class="">
        <span style="font-weight: bold;"><b>Subtotal</b></span>
      </div>
      <div class="">
        <p  style="text-align: end;font-weight: bold; color: black;">
          <b >{{ formatoPesosColombianos(order?.pe_json?.delivery.delivery_pagocon -  order?.pe_json?.delivery.delivery_costoenvio) }}</b>
         
        </p>
      </div>
      <div class="">
        <span style="font-weight: bold;"><b>Domicilio</b></span>
      </div>
      <div class="">

      
        <p style="text-align: end;font-weight: bold;color: black;"> <b>
         
            {{ formatoPesosColombianos(order?.pe_json?.delivery.delivery_costoenvio) }}
            <!-- {{ order }} -->
          </b>
        </p>
      </div>
      <div class="">
        <span  style="font-weight: bold;color: black;" ><b>Total</b></span>
      </div>
      <div class="">

        <p style="text-align: end;color: black;font-weight: bold;"><b>{{ formatoPesosColombianos(order?.pe_json?.delivery.delivery_pagocon)
        }}</b></p>

      </div>
      <div class="">
        
      </div>

    </div>
    <p  style="font-weight: bold;background-color: black;color: white;padding: 0; margin: 0; margin-top: 0.5rem;"><b>Notas</b></p>
        <p class="notas" style="border: 1px solid;margin: 0;color: black; padding: 0.5rem;">
          {{ order?.order_notes }}
        </p>




     
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
</template>

<script setup>
import { ref, onMounted } from "vue";
import { InputText } from "primevue";
import { Button } from "primevue";
import { URI } from "@/service/conection";
import { usecartStore } from "@/store/shoping_cart";
import { useReportesStore } from "@/store/ventas";
import MenuSection from "./MenuSection.vue";
import { formatoPesosColombianos } from "@/service/utils/formatoPesos";
const order = ref({});
const order_id = ref();
const store = useReportesStore();
const order_store = usecartStore();

const getOrder = async () => {
    store.setLoading(true, "Buscando orden...");
    try {
        const response = await fetch(`${URI}/order/${order_id.value}`);
        if (!response.ok) throw new Error("Error al obtener la orden");
        order.value = await response.json();
    } catch (error) {
        console.error("Error al obtener la orden:", error);
        order.value = {};
    } finally {
        store.setLoading(false, "Buscando orden...");
    }
};

onMounted(() => {
    order_id.value = order_store.last_order || "";
});

const getOrderMessage = (order) => {
    const hora = obtenerHoraFormateadaAMPM(order.timestamp);
    switch (order.status) {
        case "enviada":
            return `El pedido fue enviado a su domicilio a las ${hora}`;
        case "validacion pendiente":
            return `Tu pedido se encuentra en etapa de validacio'n en breve te contactaremos`;
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

const obtenerHoraFormateadaAMPM = (fecha) => {
    const date = new Date(fecha);
    const horas = date.getHours();
    const minutos = date.getMinutes();
    const ampm = horas >= 12 ? "pm" : "am";
    const hora12 = horas % 12 || 12;
    return `${hora12.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")} ${ampm}`;
};
</script>

<style scoped>
/* Contenedor principal */
.sticky-header {
    /* background-color: white; */
    position: sticky;
    top: 3rem;
    z-index: -1;
}

.container {
    max-width: 1024px;
    margin: 0 auto;
    padding: 1rem;
}


#factura{
    text-transform: uppercase;
}


/* Título */
.title {
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    padding: 1rem 0;
}

/* Contenedor de entrada */
.input-container {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.input-text {
    flex: 1;
    padding: 0.5rem;
    /* border: 1px solid; */
    /* box-shadow: 0 0 10px #00000030; */
    width: 3rem
}

.search-button {
    /* background-color: var(--p-primary-color); */
    font-weight: bold;
    border: none;
    padding: 0.5rem 1.5rem;
    min-width: max-content;
}

/* Mensajes de estado */
.estado {
    font-size: 1.25rem;
    text-transform: lowercase;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
}

/* Colores por estado */
.generada {
    background-color: rgba(255, 255, 0, 0.8);
}

.enviada {
    background-color: rgb(153, 255, 0);
}

.en-preparacion {
    background-color: rgb(84, 212, 255);
}

.validacion-pendiente {
    background-color: rgb(237, 147, 255);
}

.cancelada {
    background-color: rgba(255, 84, 84, 0.7);
}

.no-existe {
    background-color: #f9741632;
    text-align: center;
}

/* Capitalización del primer carácter */
.estado::first-letter {
    text-transform: capitalize;
}
</style>
