<template>
  <div
  class="container product-dialog"
  :style="dialogStyle"
>
  <!-- Botón para cerrar -->
  <Button
    class="add-cart-button"
    @click="store.setVisible('currentProduct', false)"
    severity="danger"
    icon="pi pi-times"
  ></Button>

  <!-- Encabezado -->
  <div class="header-container">

  </div>

  <!-- Contenido principal -->
  <div class="dialog-main-content">
    <div>
      <img
        style="position: sticky; top: 0;"
        class="product-image"
        :src="`${URI}/get-image?image_url=${store.currentProduct.productogeneral_urlimagen}`"
        alt=""
      />
    </div>

    <div class="details">
      <h3 class="text description">DESCRIPCION</h3>
      <p style="margin: 1rem 0;">
        {{ store.currentProduct.productogeneral_descripcionweb?.toLowerCase() }}
      </p>

      <!-- Agrupadores de modificadores -->
      <div
        v-for="i in store.currentProduct.lista_agrupadores"
        :key="i.modificador_id"
      >
        <h3 style="margin: 1rem 0;">
          <strong>{{ i.modificador_nombre }}</strong>
        </h3>

        <div>
          <div
            class="modificador-row"
            v-for="modificador in i.listaModificadores"
            :key="modificador.modificadorseleccion_id"
          >
            <Checkbox
              class="my-1 modificador-checkbox"
              @change="() => handleAdditionChange(modificador, i.modificador_id)"
              binary
              v-model="checkedAdition[modificador.modificadorseleccion_nombre]"
            />

            <div class="modificador-row-content">
              <span class="text-sm adicion modificador-nombre">
                {{ modificador.modificadorseleccion_nombre }}
              </span>

              <div class="modificador-price-quantity">
                <span
                  v-if="modificador.modificadorseleccion_precio > 0"
                  class="pl-2 py-1 text-sm modificador-price"
                >
                  <b
                    style="margin-right: 0.5rem;"
                    v-if="
                      selectedAdditions[modificador.modificadorseleccion_id]?.modificadorseleccion_cantidad > 0
                    "
                  >
                    {{
                      formatoPesosColombianos(
                        modificador.modificadorseleccion_precio *
                          parseInt(
                            selectedAdditions[modificador.modificadorseleccion_id]?.modificadorseleccion_cantidad
                          )
                      )
                    }}
                  </b>
                  <b v-else>
                    {{
                      formatoPesosColombianos(modificador.modificadorseleccion_precio)
                    }}
                  </b>
                </span>

                <div class="modificador-quantity-btns">
                  <Button
                    v-if="
                      checkedAdition[modificador.modificadorseleccion_nombre] &&
                      modificador.modificadorseleccion_precio > 0 &&
                      i.modificador_esmultiple > 0
                    "
                    @click="decrement(modificador)"
                    class="quantity-btn"
                    severity="danger"
                    icon="pi pi-minus"
                  />
                  <span
                    v-if="
                      checkedAdition[modificador.modificadorseleccion_nombre] &&
                      modificador.modificadorseleccion_precio > 0 &&
                      i.modificador_esmultiple > 0
                    "
                    readonly
                    class="quantity-input p-0 text-center"
                  >
                    {{
                      selectedAdditions[modificador.modificadorseleccion_id]?.modificadorseleccion_cantidad ||
                        1
                    }}
                  </span>
                  <Button
                    v-if="
                      checkedAdition[modificador.modificadorseleccion_nombre] &&
                      modificador.modificadorseleccion_precio > 0 &&
                      i.modificador_esmultiple > 0
                    "
                    @click="increment(modificador)"
                    class="quantity-btn"
                    severity="danger"
                    icon="pi pi-plus"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos base (INCLUYE) -->
      <h3
        v-if="store.currentProduct?.lista_productobase?.length > 0"
        class="includes-title"
      >
        <strong>INCLUYE</strong>
      </h3>

      <div class="product-base-grid">
        <div
          class="product-base-item"
          v-for="product_base in store.currentProduct.lista_productobase"
          :key="product_base.producto_id"
        >
          <h3 class="m-0 p-0 product-base-desc">
            {{ product_base.producto_descripcion }}
          </h3>
          <div class="product-base-item-header">
            <h3 class="m-0 p-0 text-2xl product-base-qty">
              {{ Math.round(product_base.productocombo_cantidad) }} x
            </h3>
            <img
              class="product-base-img"
              :src="`${URI}/get-image?image_url=${product_base.producto_urlimagen}`"
              alt=""
            />
            <Button
              class="product-base-change-btn"
              label="Cambiar"
              v-if="
                product_base.lista_productoCambio &&
                product_base.lista_productoCambio.length > 0
              "
              @click="changeProduct(product_base)"
            />
          </div>

          <div style="border-top: 0.3rem solid; margin-top: 0.5rem; opacity: 0.2"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div
    class="cart-addition-quantity-control ml-2"
    style="display: flex; align-items: center; margin-top: 1rem;"
  >
    <Button
      @click="quantity > 1 ? (quantity -= 1) : 0"
      severity="danger"
      style="border-radius: 0.5rem 0 0 0.5rem"
      class="cart-addition-quantity-btn-minus"
      icon="pi pi-minus"
    ></Button>

    <span readonly class="cart-addition-quantity-label p-0 text-center"
      >{{ quantity }}</span
    >

    <Button
      @click="quantity += 1"
      severity="danger"
      style="border-radius: 0 0.5rem 0.5rem 0"
      class="cart-addition-quantity-btn-plus"
      icon="pi pi-plus"
    ></Button>
  </div>

  <div class="footer-container" style="margin-top: 1rem;">
    <Button
      class="add-cart-footer-btn"
      @click="addToCart(store.currentProduct)"
      label="Agregar al carrito"
      icon="pi pi-shopping-cart"
    />
  </div>
</div>

</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref, computed } from 'vue';
import { formatoPesosColombianos } from '@/service/utils/formatoPesos';
import router from '@/router/index.js';
import { useRoute } from 'vue-router';
import { usecartStore } from '@/store/shoping_cart';
import { Button, Dialog } from 'primevue';
import {Checkbox} from 'primevue';

import { URI } from '@/service/conection';
import { useToast } from 'primevue/usetoast';

const store = usecartStore();
const route = useRoute();
const toast = useToast();

const see = ref(false);
const seeLeftHand = ref(false);
const seeRightHand = ref(false);
const quantity = ref(1);

watch(
  () => store.visibles.currentProduct,
  (newVal) => {
    if (!newVal) {
      see.value = seeLeftHand.value = seeRightHand.value = false;
      router.push({
        path: route.path,
        query: {},
      });
    }

    selectedAdditions.value = {};
    checkedAdition.value = {};
    quantity.value = 1;
  },
  { deep: true }
);

const productBaseToChange = ref(null);
const showChangeDialog = ref(false);

const selectAlternative = (option) => {
  const currentProduct = {
    producto_cambio_id: productBaseToChange.value.producto_id,
    producto_descripcion: productBaseToChange.value.producto_descripcion,
    producto_precio: productBaseToChange.value.producto_precio,
    producto_urlimagen: productBaseToChange.value.producto_urlimagen,
  };

  const optionIndex = productBaseToChange.value.lista_productoCambio.findIndex(
    (item) => item.producto_cambio_id === option.producto_cambio_id
  );

  if (optionIndex !== -1) {
    productBaseToChange.value.lista_productoCambio.splice(optionIndex, 1, currentProduct);
  }

  productBaseToChange.value.producto_id = option.producto_id;
  productBaseToChange.value.producto_descripcion = option.producto_descripcion;
  productBaseToChange.value.producto_precio = option.producto_precio;
  productBaseToChange.value.producto_urlimagen = option.producto_urlimagen;

  showChangeDialog.value = false;
  recalculateTotalPrice();
};

const recalculateTotalPrice = () => {
  let totalPrice = 0;

  store.currentProduct.lista_productobase.forEach((product) => {
    totalPrice +=
      parseFloat(product.producto_precio) * parseInt(product.productocombo_cantidad);
  });

  if (store.currentProduct.productogeneral_precio) {
    totalPrice += parseFloat(store.currentProduct.productogeneral_precio);
  }

  store.currentProduct.totalPrice = totalPrice;
};

const changeProduct = (product_base) => {
  productBaseToChange.value = product_base;
  showChangeDialog.value = true;
};

const selectedAdditions = ref({});
const checkedAdition = ref({});

const handleAdditionChange = (item, modificador_id) => {
  if (checkedAdition.value?.[item?.modificadorseleccion_nombre]) {
    const new_item = {
      ...item,
      modificadorseleccion_cantidad: 1,
      modificador_id: modificador_id,
    };
    selectedAdditions.value[new_item.modificadorseleccion_id] = new_item;
  } else {
    delete selectedAdditions.value[item.modificadorseleccion_id];
  }
};

const increment = (item) => {
  if (checkedAdition.value?.[item?.modificadorseleccion_nombre]) {
    selectedAdditions.value[item.modificadorseleccion_id].modificadorseleccion_cantidad++;
  }
};

const decrement = (item) => {
  if (
    selectedAdditions.value[item.modificadorseleccion_id].modificadorseleccion_cantidad > 1 &&
    selectedAdditions.value[item.modificadorseleccion_id]
  ) {
    selectedAdditions.value[item.modificadorseleccion_id].modificadorseleccion_cantidad--;
  }
};

const addToCart = (product) => {
  const additionsArray = Object.values(selectedAdditions.value);
  store.addProductToCart(product, quantity.value, additionsArray);

  selectedAdditions.value = {};
  store.setVisible('currentProduct', false);
};

watch(
  () => store.visibles.currentProduct,
  (newval) => {
    if (newval) {
      return;
    }
    const new_route = `/${route.params.menu_name}/${route.params.category_id}`;
    if (route.path != '/') {
      router.push(new_route);
    }
  }
);

const adicionales = ref([]);

watch(
  () => store.visibles.addAdditionToCart,
  async (new_val) => {
    if (!new_val) {
      selectedAdditions.value = {};
      adicionales.value = [];
    }
  },
  { deep: true }
);

const screenWidth = ref(window.innerWidth);

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

window.addEventListener('resize', updateScreenWidth);

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

const dialogStyle = computed(() => {
  return isBelow1200.value
    ? { width: '90%', 'max-width': '40rem' }
    : { width: '90%', 'max-width': '1200px' };
});

const isBelow1200 = computed(() => screenWidth.value < 1200);

onMounted(() => {

  store.currentProduct = {

            "productogeneral_id": "138",
            "productogeneral_descripcionweb": "SALCHIMONSTER, 2 LITRO 1,5 LT,  2 SHOW DE QUESO,  2 SHOW CHICHARRON",
            "productogeneral_descripcion": "KIT #1 CUMPLEAÑOS",
            "productogeneral_marca": "",
            "productogeneral_escombo": "1",
            "productogeneral_preciofijo": "1",
            "productogeneral_noalteratotalcambio": "0",
            "productogeneral_totalpreciomayor": "0",
            "productogeneral_leysunat": "0",
            "categoria_id": "12",
            "productogeneral_urlimagen": "salchimonsterrestaurantpe/productogeneral/fb6b8855-57b4-4161-ba53-6f8ac6940028.jpg",
            "productogeneral_estado": "Activo",
            "notas": [],
            "producto_id": "140",
            "productogeneral_precio": "299900.00",
            "lista_productobase": [
                {
                    "productogeneral_id": "10",
                    "producto_id": "12",
                    "producto_descripcion": "Coca Cola Sabor Original 1.5 Lt",
                    "productocombo_sepuedecambiar": "1",
                    "productocombo_sepuedeeliminar": "0",
                    "productocombo_cantidad": "2.000",
                    "productocombo_precio": "8900.0000000",
                    "producto_codigo": "",
                    "producto_codigointerno": "121",
                    "producto_urlimagen": "salchimonsterrestaurantpe/products/ba2a099b-73c8-4814-8cb7-ad4336f30d3d.webp",
                    "lista_productoCambio": []
                },
                {
                    "productogeneral_id": "40",
                    "producto_id": "42",
                    "producto_descripcion": "Salchimonster Para 6 Personas",
                    "productocombo_sepuedecambiar": "1",
                    "productocombo_sepuedeeliminar": "0",
                    "productocombo_cantidad": "1.000",
                    "productocombo_precio": "125900.0000000",
                    "producto_codigo": "",
                    "producto_codigointerno": "156",
                    "producto_urlimagen": "salchimonsterrestaurantpe/productos/7c39dc25-cb1a-461b-b95a-c9e2295888a2.png",
                    "lista_productoCambio": []
                },
                {
                    "productogeneral_id": "57",
                    "producto_id": "59",
                    "producto_descripcion": "Show Chicharron",
                    "productocombo_sepuedecambiar": "1",
                    "productocombo_sepuedeeliminar": "0",
                    "productocombo_cantidad": "2.000",
                    "productocombo_precio": "35000.0000000",
                    "producto_codigo": "",
                    "producto_codigointerno": null,
                    "producto_urlimagen": "salchimonsterrestaurantpe/productos/979cedee-d41d-4a62-bc7f-5ce2ed9d1f14.jpg",
                    "lista_productoCambio": []
                },
                {
                    "productogeneral_id": "56",
                    "producto_id": "58",
                    "producto_descripcion": "Show Queso",
                    "productocombo_sepuedecambiar": "1",
                    "productocombo_sepuedeeliminar": "0",
                    "productocombo_cantidad": "2.000",
                    "productocombo_precio": "19500.0000000",
                    "producto_codigo": "",
                    "producto_codigointerno": null,
                    "producto_urlimagen": "salchimonsterrestaurantpe/productos/25bbfe2d-b11f-422c-9267-891da85e5b1c.jpg",
                    "lista_productoCambio": []
                }
            ],
            "lista_productoadicional": []
        },
        {
            "productogeneral_id": "265",
            "productogeneral_descripcionweb": null,
            "productogeneral_descripcion": "LA BACON MONSTER 2 PERSONAS",
            "productogeneral_marca": "",
            "productogeneral_escombo": "0",
            "productogeneral_preciofijo": "1",
            "productogeneral_noalteratotalcambio": "0",
            "productogeneral_totalpreciomayor": "0",
            "productogeneral_leysunat": "0",
            "categoria_id": "110",
            "productogeneral_urlimagen": "salchimonsterrestaurantpe/productos/91f73b02-6ed9-4f0b-b1bc-814383174b78.png",
            "productogeneral_estado": "Activo",
            "notas": [],
            "lista_presentacion": [
                {
                    "productogeneral_id": "265",
                    "producto_id": "271",
                    "producto_presentacion": "Nueva",
                    "producto_precio": "27.00",
                    "producto_delivery": "0",
                    "producto_urlimagen": "salchimonsterrestaurantpe/productos/91f73b02-6ed9-4f0b-b1bc-814383174b78.png",
                    "producto_codigo": "",
                    "producto_codigointerno": null,
                    "producto_estado": "Activo"
                }
            ],
            "lista_agrupadores": [],
            "categoria_descripcion": "SALCHIPAPA PARA 2 PERSONAS NJ"
        },
        {
            "productogeneral_id": "266",
            "productogeneral_descripcionweb": null,
            "productogeneral_descripcion": "LA BACONMONSTER PERSONAL",
            "productogeneral_marca": "",
            "productogeneral_escombo": "0",
            "productogeneral_preciofijo": "1",
            "productogeneral_noalteratotalcambio": "0",
            "productogeneral_totalpreciomayor": "0",
            "productogeneral_leysunat": "0",
            "categoria_id": "112",
            "productogeneral_urlimagen": "salchimonsterrestaurantpe/productos/2ca795ea-f5d6-4472-90eb-95c8857a77a2.png",
            "productogeneral_estado": "Activo",
            "notas": [],
            "lista_presentacion": [
                {
                    "productogeneral_id": "266",
                    "producto_id": "272",
                    "producto_presentacion": "Nueva",
                    "producto_precio": "17.00",
                    "producto_delivery": "0",
                    "producto_urlimagen": "salchimonsterrestaurantpe/productos/2ca795ea-f5d6-4472-90eb-95c8857a77a2.png",
                    "producto_codigo": "",
                    "producto_codigointerno": null,
                    "producto_estado": "Activo"
                }
            ],
            "lista_agrupadores": [],
            "categoria_descripcion": "SALCHIPAPAS PERSONALES NJ"
        },
        {
            "productogeneral_id": "272",
            "productogeneral_descripcionweb": "Salchipapa para 2  Persona con Papa francesa, Salchicha Premium SM , Queso Gratinado, Ripio",
            "productogeneral_descripcion": "LA CLASIC MONSTER PARA 2 PEROSNAS",
            "productogeneral_marca": "",
            "productogeneral_escombo": "0",
            "productogeneral_preciofijo": "1",
            "productogeneral_noalteratotalcambio": "0",
            "productogeneral_totalpreciomayor": "0",
            "productogeneral_leysunat": "0",
            "categoria_id": "110",
            "productogeneral_urlimagen": "salchimonsterrestaurantpe/productos/608f3014-8d58-460b-865c-eaa1f93f1f6c.png",
            "productogeneral_estado": "Activo",
            "notas": [],
            "lista_presentacion": [
                {
                    "productogeneral_id": "272",
                    "producto_id": "278",
                    "producto_presentacion": "Nueva",
                    "producto_precio": "22.00",
                    "producto_delivery": "0",
                    "producto_urlimagen": "salchimonsterrestaurantpe/productos/608f3014-8d58-460b-865c-eaa1f93f1f6c.png",
                    "producto_codigo": "",
                    "producto_codigointerno": null,
                    "producto_estado": "Activo"
                }
            ],
            "lista_agrupadores": [],
            "categoria_descripcion": "SALCHIPAPA PARA 2 PERSONAS NJ"
        }

});
</script>

<style scoped>
/* Diálogo para cambiar un producto base */
.change-dialog {
  background-color: white;
  width: max-content;
  max-width: 20rem;
  max-height: 30rem;
  border-radius: 1rem;
}

/* Contenedor principal del contenido del diálogo de cambio */
.change-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

/* Opciones de cambio */
.change-option {
  cursor: pointer;
  background-color: white;
  color: black;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Imagen de cada opción */
.change-option-img {
  width: 140px;
  height: 140px;
  padding: 10px;
  border-radius: 0.5rem;
  object-fit: contain;
  box-shadow: 0rem 0rem 1rem #00000030;
}

/* Botón para cerrar el diálogo de cambio */
.close-change-dialog-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  position: absolute;
  right: -1rem;
  top: -1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

/* Diálogo principal (producto) */
.product-dialog {
  max-width: 91vw !important;
}

/* Botón flotante para cerrar el diálogo principal */
.add-cart-button {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  position: absolute;
  right: -1rem;
  top: -1rem;
  border-radius: 50%;
  z-index: 99;
}

/* Contenedor del header del diálogo */
.header-container {
  display: flex;
  width: 100%;
  justify-content: space-between;
  background-color: rgb(255, 255, 255);
  z-index: 99;
  top: 0rem;
  left: 0;
  height: min-content;
}

/* Contenedor del footer del diálogo */
.footer-container {
  display: flex;
  justify-content: center;
}

/* Botón en el footer para añadir al carrito */
.add-cart-footer-btn {
  min-width: max-content;
  pointer-events: all;
  background-color: black;
  color: white;
  width: auto;
  border: none;
  font-weight: bold;
}

/* Contenido principal del diálogo */
.dialog-main-content {
  position: relative;
  background-color: white;
  border-radius: 1rem;
  padding: 0;
  padding-bottom: 0;
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(2, 1fr);
}

.details {
  box-shadow: 0rem 1rem 3rem 1rem #00000010;
  padding: 1rem;
  margin-top: 2rem;
}

@media (width < 1200px) {
  .dialog-main-content {
    grid-template-columns: repeat(1, 1fr);
  }

  .product-dialog {
    max-width: 20rem !important;
  }

  .details {
    padding: 0;
    margin: 0;
    box-shadow: none;
  }
}

/* Imagen del producto */
.product-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 0.5rem;
  background-color: rgb(255, 255, 255);
  object-fit: cover;
}

/* Título "DESCRIPCION" */
.description {
  font-weight: bold;
  color: black;
  padding: 0.2rem 0;
}

/* Fila de modificador (checkbox + label + precio + botones) */
.modificador-row {
  display: flex;
  gap: 1rem;
  padding: 0.3rem;
  align-items: center;
}

/* Checkbox de modificador */
.modificador-checkbox {
  border-radius: 0.2rem;
}

/* Contenido de la fila (nombre y precio/cantidad a la derecha) */
.modificador-row-content {
  display: flex;
  width: 100%;
  gap: 1rem;
  justify-content: space-between;
}

/* Nombre del modificador */
.modificador-nombre {
  text-transform: lowercase;
}

/* Contenedor del precio y de los botones de cantidad */
.modificador-price-quantity {
  min-width: max-content;
  display: flex;
  align-items: center;
}

/* Precio */
.modificador-price {
  display: flex;
  align-items: center;
}

/* Botones + / - */
.modificador-quantity-btns {
  min-width: max-content;
  display: flex;
}

/* Botón genérico de + / - */
.quantity-btn {
  width: 2rem;
  height: 1.5rem;
  border: none;
}

/* Input de cantidad */
.quantity-input {
  width: 2rem;
  text-align: center;
  font-weight: bold;
  padding: 0;
  border: none;
  height: 1.5rem;
}

/* Sección de “INCLUYE” */
.includes-title {
  padding: 1rem 0;
}

/* Grid de productos base */
.product-base-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(1, 1fr);
}

/* Cada ítem de producto base */
.product-base-item {
  display: flex;
  border-radius: 0.5rem;
  background-color: #fff;
  flex-direction: column;
}

/* Encabezado del producto base */
.product-base-item-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  position: relative;
  border-radius: 0.5rem;
}

/* Cantidad (Ej.: “2 x”) */
.product-base-qty {
  max-width: 100%;
  min-width: max-content;
}

/* Imagen del producto base */
.product-base-img {
  width: 4rem;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  box-shadow: 0rem 0rem 1rem #00000080;
  border-radius: 0.5rem;
}

/* Descripción del producto base */
.product-base-desc {
  max-width: 100%;
}

/* Botón “Cambiar” del producto base */
.product-base-change-btn {
  background-color: black;
  max-width: min-content;
  border: none;
  color: white;
}

/* Filtro gradual en la parte inferior (opcional) */
.dialog-bottom-fade {
  pointer-events: none;
  display: flex;
  align-items: end;
  justify-content: center;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgb(255, 255, 255) 80%
  );
  height: 5rem;
  bottom: 0rem;
  right: 0;
}

/* Animaciones y transiciones */
.cargado {
  opacity: 0;
  animation: fadeIn 0.1s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-100px);
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInLeftHand {
  from {
    opacity: 0;
    transform: translateX(-1000px);
  }
  to {
    opacity: 1;
  }
}

.cargado-left-hand {
  opacity: 0;
  animation: fadeInLeftHand 0.1s ease-out forwards;
}

@keyframes fadeInRightHand {
  from {
    opacity: 0;
    transform: translateX(1000px);
  }
  to {
    opacity: 1;
  }
}

.cargado-right-hand {
  opacity: 0;
  animation: fadeInRightHand 0.1s ease-out forwards;
}

/* Scrollbars ocultos en WebKit */
*::-webkit-scrollbar {
  display: none;
}

/* Para texto en mayúsculas */
.mayuscula {
  text-transform: uppercase;
}

/* Ajuste de capitalización para la clase “adicion” */
.adicion::first-letter {
  text-transform: uppercase;
}

/* Control de la cantidad en el footer */
.cart-addition-quantity-control {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.411);
  align-items: center;
  display: flex;
  border-radius: 0.3rem;
}

/* Etiqueta de cantidad en el footer */
.cart-addition-quantity-label {
  width: 3rem;
  height: 1.5rem;
  font-weight: bold;
  text-align: center;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
