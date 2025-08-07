<template>
    <div>
        <div class="cart-has-products" v-if="store.cart.length > 0">
            <h1 class="cart-title text-center text-2xl my-8">
                <b>CARRITO DE COMPRAS</b>
            </h1>

            <div class="cart-grid">

                <div class="cart-items-container col-12 text-sm md:col-6 p-3 md:px-4">
                    <div class="cart-product-item col-12 py-3 p-shadow shadow-6" v-for="product in store.cart"
                        :key="product.pedido_productoid">




                        <div>    <div class="cart-product-description-container">
                                    <span class="p-0 m-0">{{ product.pedido_nombre_producto }}</span>
                                </div>

                            <img class="cart-product-img p-1"
                            :src="`${URI}/get-image?image_url=${product.productogeneral_urlimagen}`" alt="" />



                        <Button class="cart-delete-product-button ml-2"
                            @click="store.removeProductFromCart(product.signature)" icon="pi pi-trash"
                            severity="danger" rounded />

                        <div class="cart-product-info">
                            <div class="cart-product-info-inner">


                                <div class="cart-product-quantity-container">
                                    <div class="cart-product-quantity-control p-0">
                                        <Button class="cart-quantity-btn-minus"
                                            @click="store.decrementProduct(product.signature)"
                                            icon="pi pi-minus" severity="danger"></Button>

                                        <span class="cart-product-quantity-label" readonly>{{ product.pedido_cantidad }}</span>

                                        <Button class="cart-quantity-btn-plus"
                                            @click=" store.incrementProduct (product.signature)" icon="pi pi-plus"
                                            severity="danger"></Button>
                                    </div>


                        <h5 class="p-0 m-0 " style="margin-left: 1rem;">
                            <b>{{ formatoPesosColombianos(product.pedido_precio  * product.pedido_cantidad) }}</b>
                        </h5>

                                </div>

                                <div >


                                    <div v-if="product?.modificadorseleccionList?.length > 0" class="mt-2 " style="box-shadow: 0 0 1rem #00000030;width: 100%;  padding: .5rem;margin-top: 1rem;border-radius: .5rem;">
                                    <div class="cart-additions-item" v-for="item in product.modificadorseleccionList"
                                       >
                                        <!-- <Button text rounded @click="deleteAd(item)"
                                            class="cart-delete-addition-button p-0 m-0" severity="danger"
                                            icon="pi pi-trash m-0"></Button> -->

                                        <div class="cart-additions-item-container">
                                            <span class="text adicion" style="text-transform: capitalize;">( {{ product.pedido_cantidad }} ) <span> <b>{{item.modificadorseleccion_cantidad}}</b></span> {{ item.modificadorseleccion_nombre
                                                }}</span>
                                            <span class="cart-addition-item-price">
                                                <span v-if="item.pedido_precio > 0" class="">
                                                    <b>{{ formatoPesosColombianos(item.pedido_precio * item.modificadorseleccion_cantidad * product.pedido_cantidad) }}</b>

                                                </span>

                                                <div
                                                    class="cart-addition-quantity-control ml-2">
                                                    <Button style="border-radius:.3rem 0 0 .3rem"  @click="store.decrementAdditional(product.signature, item)"
                                                        severity="danger" class="cart-addition-quantity-btn-minus"
                                                        icon="pi pi-minus"></Button>

                                                    <span  :modelValue="item.quantity" readonly
                                                        class="cart-addition-quantity-label p-0 text-center">{{
                                                            item.modificadorseleccion_cantidad * product.pedido_cantidad  }}</span>

                                                    <Button  style="border-radius:0  .3rem   .3rem 0" @click="store.incrementAdditional(product.signature, item)"
                                                        severity="danger" class="cart-addition-quantity-btn-plus"
                                                        icon="pi pi-plus"></Button>
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    </div>


                </div>

                <resumen class="md:col-6 shadow-6"></resumen>
            </div>
        </div>

        <div v-else class="cart-empty-container ">

            <img style="border-radius: 0;width: 100%;" src="/public/images/empty-cart.jpg" alt="">
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeMount } from 'vue';
import resumen from './resumen.vue';
import { usecartStore } from '@/store/shoping_cart';
import { formatoPesosColombianos } from '@/service/utils/formatoPesos';
import { useSitesStore } from '@/store/site';
import { orderService } from '@/service/order/orderService';
import { useUserStore } from '@/store/user';
import { Button } from 'primevue';
import { URI } from '@/service/conection';

const store = usecartStore()
const siteStore = useSitesStore()
const selectedAdditions = ref({})
const agrupados = ref({})
const user = useUserStore()


const mycart = ref([])


onMounted( () => {
    console.log(store.cart)
})

onBeforeMount(() => {

    if (!siteStore.location.site?.site_id) {
        siteStore.visibles.currentSite = true
    }
})

const update = () => {
    // agrupados.value = store.cart.additions.reduce((acumulador, elemento) => {
    //     let grupo = elemento.group;
    //     if (!acumulador[grupo]) {
    //         acumulador[grupo] = [];
    //     }
    //     acumulador[grupo].push(elemento);
    //     return acumulador;
    // }, {});
};

watch(
    () => store.cart.additions,
    () => {
        update();
    },
    { deep: true }
);

// orderService.preparar_orden();

const increment = (adition) => {
    const new_adition = { ...adition };
    new_adition.quantity = 1;
    store.addAdditionToCart(new_adition);
};

const decrement = (adition) => {
    if (adition.quantity > 1) {
        store.removeAdditionFromCart(adition.id);
    }
};

const deleteAd = (adicion) => {
    store.removeAdditionCompletelyFromCart(adicion.id);
    update();
};

const deleteGroup = (items) => {
    items.forEach((item) => {
        deleteAd(item);
    });
};

watch(
    () => store.visibles.addAdditionToCart,
    (newval) => {
        if (newval) {
            selectedAdditions.value = {};
        }
    },
    { deep: true }
);

onMounted(async () => {
    if (user.user.payment_method_option?.productogeneral_id != 7)
        siteStore.setNeighborhoodPrice();
    else {
        siteStore.setNeighborhoodPriceCero();
    }

    const product_id = 53;
    // if (product_id) {
    //   adicionales.value = await adicionalesService.getAditional(product_id)
    // }

    // agrupados.value = store.cart.additions.reduce((acumulador, elemento) => {
    //     let grupo = elemento.group;
    //     if (!acumulador[grupo]) {
    //         acumulador[grupo] = [];
    //     }
    //     acumulador[grupo].push(elemento);
    //     return acumulador;
    // }, {});
});

// const getAditional = () => {
//     const ids = store.cart.map((p) => p.product.producto_id);
//     // console.log(ids);

//     const menu = store.menu.data.map((p) => p.lista_agrupadores);
//     // console.log(menu);
// };

// getAditional();
</script>

<style scoped>
/* ------ Clases nuevas para reemplazar estilos en línea ------ */

/* Sección principal cuando hay productos en el carrito */
.cart-has-products {
    /* Puedes agregar estilos generales si deseas */
}

/* Título del carrito */
.cart-title {
    text-align: center;
    margin: 2rem auto;
}

/* Grid principal para dividir en 2 columnas */
.cart-grid {
    max-width: 1024px;
    margin: 0 auto;
    margin-top: 3rem;
    display: grid;
    grid-template-columns: 2fr  2fr;
    gap: 2rem;
}

/* Contenedor de la columna de productos */
.cart-items-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
}

/* Cada producto dentro del carrito */
.cart-product-item {
    /* display: flex; */
    align-items: end;
    position: relative;
    background-color: white;
    padding: 1rem;
    gap: 1rem;
    border-radius: 0.3rem;
}

/* Imagen del producto */
.cart-product-img {
    width: 5rem;
    height: 5rem;
    object-fit: cover;
    aspect-ratio: 1 / 1;
    border: 3px solid var(--primary-color);
    border-radius: 50%;
    /* si deseas conservar el borde redondo */
}

/* Botón para eliminar un producto completo del carrito */
.cart-delete-product-button {
    border: none;
    right: -0.5rem;
    top: -0.5rem;
    position: absolute;
    outline: none;
    width: 2rem;
    height: 2rem;
}

/* Información del producto */
.cart-product-info {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    width: 100%;
}

.cart-product-info-inner {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    width: 100%;
}

/* Contenedor descripción del producto */
.cart-product-description-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1rem;
}

/* Contenedor para el control de cantidad */
.cart-product-quantity-container {
    display: flex;
    align-items: center;
}

.cart-product-quantity-control {
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
    background-color: #ff620000;
    border-radius: 5rem;
    display: flex;
}

/* Botones de + / - de los productos */
.cart-quantity-btn-minus,
.cart-quantity-btn-plus {
    border: none;
    outline: none;
    width: 2rem;
    height: 1.5rem;
}

/* Bordes distintos si lo deseas */
.cart-quantity-btn-minus {
    border-radius: 0.4rem 0 0 0.4rem;
}

.cart-quantity-btn-plus {
    font-weight: bold;
    border-radius: 0 0.3rem 0.3rem 0;
}

/* Label que muestra la cantidad */
.cart-product-quantity-label {
    background-color: transparent;
    text-align: center;
    width: 3rem;
    font-weight: bold;
    height: 1.5rem;
    color: black;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Sección de “adicionales” */
.cart-additions-group {
    position: relative;
    border-radius: 0.3rem;
    padding: 1rem;
    margin-bottom: 1rem;
    background-color: white;
}

/* Botón para eliminar todo un grupo de adicionales */
.cart-delete-group-button {
    border: none;
    right: -0.5rem;
    top: -0.5rem;
    position: absolute;
    outline: none;
    width: 2rem;
    height: 2rem;
}

@media (width < 900px) {
    .cart-grid {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
}

/* Cada ítem adicional */
.cart-additions-item {
    display: flex;
    margin-top: .5rem;
    gap: 1rem;
    width: 100%;
    align-items: center;
}

/* Botón para eliminar un adicional puntual */
.cart-delete-addition-button {
    width: 2rem;
    height: 2rem;
    border: none;
}

/* Contenedor de nombre y precio del adicional */
.cart-additions-item-container {
    display: flex;
    width: 100%;
    gap: 1rem;
    justify-content: space-between;
}

/* Precio y posible control de cantidad */
.cart-addition-item-price {
    display: flex;
    align-items: center;
}

/* Botones + / - para los adicionales */
.cart-addition-quantity-control {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.411);
    margin-left: 1rem;
    align-items: center;
    display: flex;
    border-radius: 0.3rem;
}

.cart-addition-quantity-btn-minus,
.cart-addition-quantity-btn-plus {
    width: 2rem;
    height: 1.5rem;
    border: none;
}

/* Label de cantidad del adicional */
.cart-addition-quantity-label {
    width: 2rem;
    height: 1.5rem;
    font-weight: bold;
    text-align: center;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Cuando no hay productos en el carrito */
.cart-empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0;
    height: calc(100vh - 8rem);
    width: 100%;
    padding: 1rem;
    max-width: 50rem;
    margin: auto;
}

/* ------ Estilos ya existentes ------ */
*:focus {
    border: none;
}

.led {
    animation: cambiaColor 1s infinite;
}

.name-product::first-letter {
    text-transform: uppercase;
}

img {
    border-radius: 50%;
}

.domi-name {
    text-transform: capitalize;
}

.descripcion::first-letter {
    text-transform: uppercase;
}

@keyframes cambiaColor {
    0% {
        background-color: rgb(0, 0, 0);
    }

    50% {
        background-color: rgb(30, 255, 0);
    }

    100% {
        background-color: var(--primary-color);
    }
}

h6,
span {
    text-transform: uppercase;
    font-size: 0.9rem;
}

.triangulo {
    width: 0;
    height: 0;
    border-left: 1rem solid transparent;
    border-right: 1rem solid transparent;
    border-bottom: 2rem solid #ffede1;
    transform: rotate(-65deg);
    position: absolute;
    top: -1rem;
    left: -1.2rem;
}

.container {
    background-color: rgb(0, 0, 0);
}

.scrollit {
    float: left;
    width: 71%;
}

.sumary {}

.izq {}

.contenedor-producto {
    align-items: center;
    border-radius: 0.5rem;
    overflow: hidden;
    height: 7rem;
    position: relative;
}

@media (max-width: 991px) {
    .contenedor-producto {}
}

.nombre-sesion {
    font-weight: bold;
    border-radius: 5rem;
}

.contenedor-principal {}

.producto {
    border-bottom: 2px solid #00000020;
}

.cantidad:focus {
    outline: none;
}

.imagen {
    height: 100px;
    object-fit: contain;
}

.contador {
    background-color: white;
    display: flex;
    border-radius: 0.1rem;
    padding: 0.1rem 1rem;
    box-shadow: 0 0.3rem 5px rgba(0, 0, 0, 0.174);
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    width: 8rem;
    height: 2.5rem;
}

i {
    font-weight: bold;
}

i:hover {
    color: var(--primary-color);
}

button:hover {
    cursor: pointer;
}

@media (min-width: 768px) and (max-width: 991px) {
    .clase {
        min-width: 720px;
    }
}

@media (min-width: 1200px) and (max-width: 1920px) {
    .clase {
        min-width: 1024px;
    }

    .productos-scroll {
        overflow-y: auto;
        border-radius: 2rem;
    }

}

::-webkit-scrollbar {
    width: 1rem;
    padding-top: 1rem;
    position: absolute;
}

::-webkit-scrollbar-thumb {
    background-color: rgb(255, 0, 0);
    border-radius: 9px;
    border: 5px solid var(--primary-color);
    height: 10rem;
    width: 10rem;
}

.p-shadow {
    box-shadow: 0 0.2rem 5px rgba(0, 0, 0, 0.15);
}
</style>
