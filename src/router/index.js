import { createRouter, createWebHistory } from 'vue-router'
import Pokemon from '@/views/Pokemon.vue'
import PokemonFavourites from '@/views/PokemonFavourites.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', component: Pokemon},
    {path: '/favourites', component: PokemonFavourites}
  ],
})

export default router
