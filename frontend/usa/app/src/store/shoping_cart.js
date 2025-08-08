import { defineStore } from 'pinia'
import { URI } from '../service/conection'
import { menu } from './menu.js';
export const usecartStore = defineStore('salchi_super_cart_web443', {
  persist: {
    key: 'salchi_super_cart_web443',
    storage: sessionStorage,
    paths: ['cart', 'last_order', 'menu'],
  },
  state: () => ({
    currentProduct: {},
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
      if (existIndex !== -1) {
        const existingProduct = this.cart[existIndex]
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
