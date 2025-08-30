import { defineStore } from "pinia";
import { URI } from "../service/conection";


export const useUserStore = defineStore('user-salchi-usa2', {

    persist: {

                key: 'user-salchi2',
                storage: localStorage,
                paths:[
                    'user','lang'

                    ]
    },
    state: () => {

        return {

            user: {
                name:'',
                neigborhood:'',
                address:'',
                phone_number:'',
                was_reserva:false,
                order_type:{} ,
                phone_code:{ "code": "US", "name": "United States of America", "dialCode": "+1", "flag": "https://flagcdn.com/h20/us.png", "label": "+1", "dialDigits": "1", "flagEmoji": "🇺🇸", "_imgError": false }

            },
            lang:   { name: 'en', label: 'English',  flag: 'https://flagcdn.com/w20/us.png' },



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

    },


})


