import { defineStore } from "pinia";
import { URI } from "../service/conection";


export const useUserStore = defineStore('user-salchi-usa', {

    persist: {

                key: 'user-salchi',
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
            },
            lang:   { name: 'en', label: 'English',  flag: 'https://flagcdn.com/w20/us.png' }



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


