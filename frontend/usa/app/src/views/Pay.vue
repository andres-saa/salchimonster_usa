<template>
    <div class="finalizar-compra-container">
      <!-- <validate></validate> -->
      <p class="title">FINALIZAR COMPRA</p>

      <div style="margin: auto; max-width: 800px;">
        <div class="title" style="margin: 3rem .5rem">
          <Tag severity="success" class="advertice">
            El tiempo promedio de entrega es de 60 a 75 minutos, por favor téngalo en cuenta antes de ordenar
          </Tag>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-column">
          <span>NOMBRE</span>
          <div class="form-group">
            <InputText id="username" placeholder="NOMBRE" v-model="user.user.name" />
          </div>
          <span>Ubicacio'n</span>
          <div class="form-group">
            <InputText
              @click="siteStore.setVisible('currentSite', true)"
              :modelValue="siteStore.location.neigborhood.name"
              id="neighborhood"
              placeholder="Ubicacion"
              readonly
            />
          </div>

          <span>Metodo Entrega</span>
          <div class="form-group">
            <Select
              style="width: 100%;"
              v-model="user.user.order_type"
              id="metodo_de_entrega"
              placeholder="Metodo de entrega"
              :options="computedOrderTypes.filter(t => [1,2,3].includes( t.id))"
              optionLabel="name"
            />
          </div>

          <!-- Mostrar dirección solo si el método no es "Pasar a recoger" (id 2) -->
          <template v-if="!user.user.order_type || user.user.order_type.id !== 2">
            <span>Direccio'n</span>
            <div class="form-group">
              <InputText v-model="user.user.address" id="address" placeholder="DIRECCION" />
            </div>
          </template>

          <span>Telefono</span>
          <div class="form-group">
            <InputText
              v-model="user.user.phone_number"
              id="phone_number"
              mask="999 999 9999"
              placeholder="TELEFONO"
            />
          </div>

          <span>Correo Electrónico</span>
          <div class="form-group">
            <InputText
              v-model="user.user.email"
              id="phone_number"
              mask="999 999 9999"
              placeholder="Correo Electronico"
            />
          </div>





          <!-- Mostrar campo de placa solo si el método es "Pasar a recoger" (id 2) y la sede es 33 -->
          <template v-if="user.user.order_type && user.user.order_type.id === 2 && siteStore.location?.site?.site_id === 33">
            <span>Placa de tu vehiculo</span>
            <div class="form-group">
              <InputText v-model="user.user.placa" id="placa" placeholder="Placa de tu vehiculo" />
            </div>
          </template>

          <span>Metodo de pago</span>
          <div class="form-group">
            <Select
              style="width: 100%;"
              v-model="user.user.payment_method_option"
              id="payment_method"
              placeholder="METODO DE PAGO"
              :options="
                siteStore.location?.site?.site_id === 33
                  ? payment_method_options.filter(option => [6, 8].includes(option.id))
                  : siteStore.location?.site?.site_id !== 33
                  ? payment_method_options.filter(option => ![7,6].includes(option.id))
                  : payment_method_options
              "
              optionLabel="name"
            />
          </div>
          <span>Notas</span>

          <Textarea
            v-model="store.cart.order_notes"
            class="order-notes"
            placeholder="Notas adicionales"
          />

          <!-- En otros casos, muestra un textarea normal -->
          <template>
            <Textarea
              v-model="store.cart.order_notes"
              class="order-notes"
              placeholder="Notas"
            />
          </template>
        </div>

        <resumen class="resumen-column"></resumen>
      </div>
    </div>
  </template>

  <script setup>
  import { ref, onMounted, watch, computed } from 'vue';
  import resumen from './resumen.vue';
  import { usecartStore } from '@/store/shoping_cart';
  import { useSitesStore } from '@/store/site';
  import { useUserStore } from '@/store/user';
  import { Textarea } from 'primevue';
  import { Tag } from 'primevue';
  import { InputText } from 'primevue';
  import { Select } from 'primevue';
  import { fetchService } from '@/service/utils/fetchService';
  import { URI } from '@/service/conection';

  const store = usecartStore();
  const siteStore = useSitesStore();
  const user = useUserStore();

  const order_types = ref([]);
  const payment_method_options = ref([]);

  onMounted(async () => {
    user.user.order_type = null

    payment_method_options.value = await fetchService.get(`${URI}/payment_methods`);
    order_types.value = await fetchService.get(`${URI}/get_all_order_types`);

    if (user.user.payment_method_option?.id != 7) {
      siteStore.setNeighborhoodPrice();
    } else {
      siteStore.setNeighborhoodPriceCero();
    }
  });

  watch(() => user.user.order_type, (new_val) => {
    if (new_val.id == 2) {
      siteStore.current_delivery = siteStore.location.neigborhood.delivery_price;
      siteStore.location.neigborhood.delivery_price = 0;
    } else {
      siteStore.setNeighborhoodPrice();
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
    if (currentSiteId === 33) {
      // Para la sede 33: permitir "Enviar por uber" (id: 1) y "Pasar a recoger" (id: 2)
      return order_types.value.filter(option => option.id !== 3);
    } else {
      // Para las demás sedes: permitir "Pasar a recoger" (id: 2) y "Enviar a domicilio" (id: 3)
      return order_types.value.filter(option => option.id !== 1);
    }
  });
  </script>

  <style scoped>
  /* Contenedor Principal */
  .finalizar-compra-container {
    padding: 0;
    margin-bottom: 2rem;
  }

  /* Título */
  .title {
    text-align: center;
    font-size: 2rem;
    margin: 2rem 0;
    font-weight: bold;
  }

  .advertice {
    animation: anim_status_tag 2s infinite ease;
    color: black;
    padding: 1rem;
    font-weight: 400;
    font-size: 1.1rem;
  }

  @keyframes anim_status_tag {
    20% {
      background-color: rgb(0, 255, 110);
    }
    50% {
      background-color: rgb(0, 255, 204);
      transform: scale(1.02);
    }
    80% {
      background-color: rgb(0, 255, 140);
    }
  }

  /* Grid del Formulario y Resumen */
  .form-grid {
    display: grid;
    max-width: 800px;
    margin: 0 auto;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (min-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  /* Columna del Formulario */
  .form-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.25rem;
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
  ::-webkit-scrollbar {
    width: 1rem;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgb(255, 0, 0);
    border-radius: 9px;
    border: 5px solid var(--primary-color);
    height: 10rem;
    width: 10rem;
  }
  </style>
