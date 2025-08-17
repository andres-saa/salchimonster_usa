import { defineStore } from "pinia";
import { URI,URI_SOCKET } from "../service/conection";
import axios from "axios";



export const useSitesStore = defineStore('sites-salchimonster-usa', {

    persist: {

                key: 'sites-salchimonster-usa',
                storage: localStorage,
                paths:[
                    'location-usa'

                    ]
    },
    state: () => {

        return {

            location: {
              "site":{
                 "site_id":33,
                 "site_name":"Union city",
                 "site_address":"2100 kerrigan ave union city nj 07087",
                 "site_phone":"3477929350",
                 "site_business_hours":"string",
                 "horario_semanal":[
                    null
                 ],
                 "wsp_link":"https://wa.link/6v0usl",
                 "city_id":15,
                 "maps":"https://www.google.com/maps/place/40%C2%B044'32.9%22N+74%C2%B003'42.3%22W/@40.7424583,-74.0643348,17z/data=!3m1!4b1!4m4!3m3!8m2!3d40.7424583!4d-74.0617599?hl=es&entry=ttu&g_ep=EgoyMDI1MDIxOS4xIKXMDSoASAFQAw%3D%3D",
                 "show_on_web":true,
                 "email_address":"hola@.com",
                 "status":true,
                 "comming_soon":false,
                 "open":true,
                 "pe_site_id":16,
                 "exist":true,
                 "invoice_identifier":"NEW JERSEY",
                 "time_zone":"America/New_York",
                 "restaurant_id":1
              },
              "neigborhood":{
                 "neighborhood_id":15308,
                 "name":"UNION CITY ",
                 "delivery_price":0,
                 "site_id":33,
                 "city_id":15
              },
              "siteReservas":{

              },
              "city":{
                 "city_id":15,
                 "city_name":"Union City - EE.UU",
                 "visible":true,
                 "index":1
              }
           },

            sonando: {

            },
            visibles: {
                currentSite: false,
                sonandoCurrentSite:false
            },
            current_delivery:0,
            webSocket: null,
            status:'closed'


        }
    },

    getters: {
        fucion: (state) => {
            return 0
        }
    },



    actions: {

        async func() {
            return func
        },

        setLocation(location){

            this.location = location
        },
        setVisible(item,status){
            this.visibles[item]=status
        },
        async connectWebSocket(siteId) {


        },
        async setNeighborhoodPrice(){

                try {
                    const response = await axios.get(`${URI}/neighborhood/${this.location.neigborhood.neighborhood_id}/`);
                    if (response.status === 200) {
                        this.location.neigborhood = response.data
                        return response.data;
                    } else {
                        console.error('An error occurred while fetching the ingredients:', response.status);
                        return null;
                    }
                } catch (error) {
                    console.error('An error occurred while fetching the ingredients:', error);
                    return null;
                }

        },
        async setNeighborhoodPriceCero(){

           this.location.neigborhood.delivery_price = 0
    }




    },


})


