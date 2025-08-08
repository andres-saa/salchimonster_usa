import { defineStore } from 'pinia'
import { URI } from '../service/conection.js'
import { menu } from './menu.js';
export const usecarReservastStore = defineStore('salchi_cart_reservas2', {
  persist: {
    key: 'salchi_cart_reservas2',
    storage: sessionStorage,
    paths: ['last_order', 'menu'],
  },
  state: () => ({
    currentProduct:         {
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
      "lista_productoadicional": [],
      "categoria_descripcion": "Combo CumpleaÑos"
  },
    currentSection: {},
    currentVideoIndex: 0,
    currentVideoTime: 0,

    visibles: {
      currentProduct: false,
      addAdditionToCart: false,
      loading:true,
      last_order: '',
    },

    cart: [],
    last_order: '',
    sending_order: false,
    was_reserva: false,
    menu:menu
  }),

  getters: {
    // cartTotal(state) {
    //   return state.cart.reduce((acc, item) => acc + item.pedido_precio, 0)
    // },

    cartTotal(state){
      if (!Array.isArray(state.cart) || state.cart.length === 0) return 0;

      return state.cart.reduce((total, product) => total + this.calculateTotalProduct(product), 0);
  },




    // Getter para verificar si existe un producto por ID en el carrito
    isProductInCart: (state) => (productId) => {
      return state.cart.some((item) => {
        return item.pedido_productoid === productId
      })
    },

    // (Esta parecía repetida en tu código original)
    isProductInCart2: (state) => (productId) => {
      return state.cart.products?.some((product) => {
        return product.product.productogeneral_id === productId
      })
    },

    // Ejemplo de getter para calcular el total de un producto fuera de las actions
    getProductTotal: () => (product) => {
      // Si el combo ya tiene su precio final, NO sumamos sus "sub-productos"
      // sino que solo usamos el precio general y los adicionales.
      const productBasePrice = this.getProductPrice(product)
      let total = productBasePrice

      // Adicionales (si aplica)
      if (product.modificadorseleccionList && product.modificadorseleccionList.length > 0) {
        product.modificadorseleccionList.forEach(ad => {
          const adPrice    = parseInt(ad.pedido_precio) || 0
          const adQuantity = parseInt(ad.modificadorseleccion_cantidad) || 1
          total += adPrice * adQuantity
        })
      }
      return total * product.pedido_cantidad
    },
  },

  actions: {
    setCurrentVideoIndex(index) {
      this.currentVideoIndex = index
    },
    setCurrentVideoTime(time) {
      this.currentVideoTime = time
    },
    calculateTotalProduct (product){
      if (!product || typeof product !== "object") return 0;

      // Destructuración con valores por defecto
      const {
          pedido_base_price = 0,
          pedido_cantidad = 1,
          modificadorseleccionList = []
      } = product;

      // Convertir a números para evitar errores con strings numéricos
      const basePrice = Number(pedido_base_price) || 0;
      const cantidad = Number(pedido_cantidad) || 1;

      // Validar y calcular modificadores
      const adiciones = Array.isArray(modificadorseleccionList)
          ? modificadorseleccionList.reduce(
              (total, { pedido_precio = 0, modificadorseleccion_cantidad = 1 }) =>
                  total + (Number(pedido_precio) || 0) * (Number(modificadorseleccion_cantidad) || 1),
              0
          )
          : 0;

      return (basePrice + adiciones) * cantidad;
  },


    setCurrentProduct(product) {
      this.currentProduct = product
    },
    setVisible(item, status) {
      this.visibles[item] = status
    },


    getProductId(product) {
      if  (product.lista_presentacion && product.lista_presentacion.length > 0 ){
          return product.lista_presentacion[0].producto_id
      }else if (product.productogeneral_id){
          return product.productogeneral_id
      }
  },

   getProductPrice(product) {

    if (product.productogeneral_precio){
        return product.productogeneral_precio
    }else if (product.lista_presentacion && product.lista_presentacion.length > 0 ){
        return product.lista_presentacion[0].producto_precio
    } else return 0

  },

   buildSignature(product_id,modificadores=[]) {

    const aditions = modificadores.map(p => {
        return {
            "id" : p.modificadorseleccion_id,
            "quantity" : p.modificadorseleccion_cantidad
        }
    })
    return `${product_id}-${JSON.stringify(aditions) }`
},


    calculateTotalPrice(product, quantity, modificadores = []) {

    },


     addProductToCart(product, quantity = 1, additionalItems = []) {

      const newProduct = {
          "pedido_precio": this.getProductPrice(product),
          "pedido_escombo":product.productogeneral_escombo,
          "pedido_cantidad": quantity,
          "pedido_base_price": this.getProductPrice(product),
          "pedido_productoid": this.getProductId(product),
          "lista_productocombo": product.lista_productobase?  product.lista_productobase.map( product => {
              return {
                      "pedido_productoid": product.producto_id,
                      "pedido_cantidad": product.productocombo_cantidad,
                      "pedido_precio": product.productocombo_precio,
                      "pedido_nombre": product.producto_descripcion,
                    }
          }) : [],
          "pedido_nombre_producto": product.productogeneral_descripcion,
          "modificadorseleccionList": additionalItems.map( add => {
              return {

                  "modificador_id":add.modificador_id ,
                  "modificadorseleccion_id": add.modificadorseleccion_id,
                  "pedido_precio": add.modificadorseleccion_precio,
                  "modificadorseleccion_cantidad": add.modificadorseleccion_cantidad || 1,
                  "modificadorseleccion_nombre":add.modificadorseleccion_nombre

              }
          }

          ),
          "productogeneral_urlimagen":product.productogeneral_urlimagen
      }

      const signature = this.buildSignature(newProduct.pedido_productoid,newProduct.modificadorseleccionList)
      newProduct.signature = signature

      console.log(newProduct)

      const existIndex = this.cart.findIndex(p => p.signature == signature)

      if (existIndex != -1){
        const existingProduct = this.cart[existIndex]
        existingProduct.pedido_cantidad += quantity
        console.log(this.cart[existIndex])
      }
      else {
        this.cart.push(newProduct)
      }

  },


    removeProductFromCart(signature) {
      const existIndex = this.cart.findIndex(p => p.signature === signature)
      this.cart.splice(existIndex, 1)
    },

    // Decrementar la cantidad de un producto
    decrementProduct(signature) {
      const existIndex = this.cart.findIndex(p => p.signature === signature)
      const existingProduct = this.cart[existIndex]
      if (existIndex !== -1 &&  existingProduct.pedido_cantidad >1) {

        existingProduct.pedido_cantidad -= 1

        // Si la cantidad es 0 o menor, eliminar el producto del arreglo
        if (existingProduct.pedido_cantidad <= 0) {
          this.cart.splice(existIndex, 1)
        }
      }
    },

    incrementProduct(signature) {
      const existIndex = this.cart.findIndex(p => p.signature == signature)
      if (existIndex != -1){
        const existingProduct = this.cart[existIndex]
        existingProduct.pedido_cantidad += 1
        console.log(this.cart[existIndex])
      }
    },


    // Incrementar la cantidad de un adicional específico
    incrementAdditional(signature, additionalItem) {
      const existIndex = this.cart.findIndex(p => p.signature == signature)
      if (existIndex != -1){
        const existingProduct = this.cart[existIndex]
        const aditional = existingProduct.modificadorseleccionList.find(a => a === additionalItem)
        aditional.modificadorseleccion_cantidad++
      }
    },

    // Decrementar la cantidad de un adicional específico
    decrementAdditional(signature, additionalItem) {
      const existIndex = this.cart.findIndex(p => p.signature === signature)
      if (existIndex !== -1) {
        const existingProduct = this.cart[existIndex]

        // Encontramos el índice del adicional en 'modificadorseleccionList'
        const aditionalIndex = existingProduct.modificadorseleccionList.findIndex(a => a === additionalItem)

        if (aditionalIndex !== -1) {
          // Decrementar la cantidad
          existingProduct.modificadorseleccionList[aditionalIndex].modificadorseleccion_cantidad--

          // Si después de la resta queda 0 o menos, eliminarlo del arreglo
          if (existingProduct.modificadorseleccionList[aditionalIndex].modificadorseleccion_cantidad < 1) {
            existingProduct.modificadorseleccionList.splice(aditionalIndex, 1)
          }
        }
      }
    }
  },
})
