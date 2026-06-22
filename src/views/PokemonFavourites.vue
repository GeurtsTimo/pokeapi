<script setup>
import { onMounted, computed } from 'vue'
import { pokemonService } from '@/usePokemon.js'
import { favoriteService } from '@/useFavorites.js'

const favoritePokemon = computed(() =>
  pokemonService.storage.value.items.filter((p) => favoriteService.isFavorite(p.id))
)

const selecteerPokemon = (id) => {
  if (window.openPokemonDetails) window.openPokemonDetails(id)
}

onMounted(async () => {
  await pokemonService.fetchAllPokemon()
  favoriteService.loadFromStorage()
})
</script>

<template>
  <div v-if="pokemonService.storage.value.loading" class="status-center">
    <p>Pokémon worden geladen...</p>
  </div>

  <div v-else-if="pokemonService.storage.value.error" class="status-center">
    <p style="color: #b00020;">{{ pokemonService.storage.value.error }}</p>
  </div>

  <div v-else class="pokedex-page">

    <p v-if="!favoritePokemon.length" class="empty-message">
      Je hebt nog geen favoriete Pokémon. Tik op het hartje in de detailweergave om er een toe te voegen.
    </p>

    <div v-else class="pokemon-grid">
      <button
        v-for="pokemon in favoritePokemon"
        :key="pokemon.id"
        class="pokemon-card"
        @click="selecteerPokemon(pokemon.id)"
      >
        <img :src="pokemon.image" :alt="pokemon.name" loading="lazy" />
        <span class="pokemon-id">#{{ String(pokemon.id).padStart(3, '0') }}</span>
        <span class="pokemon-name">{{ pokemon.name }}</span>
      </button>
    </div>

  </div>
</template>

<style scoped>
.status-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: #666;
}

.pokedex-page { padding: 12px; max-width: 1200px; margin: 0 auto; }

.empty-message {
  text-align: center;
  color: #666;
  margin-top: 40px;
  padding: 0 24px;
}

.pokemon-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }

@media (max-width: 600px) {
  .pokemon-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
}

@media (min-width: 601px) and (max-width: 900px) {
  .pokemon-grid { grid-template-columns: repeat(3, 1fr); }
}

.pokemon-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  transition: transform 0.15s, box-shadow 0.15s;
  width: 100%;
}

.pokemon-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: #3b4cca;
}

.pokemon-card img { width: 80px; height: 80px; }

@media (max-width: 600px) {
  .pokemon-card img { width: 64px; height: 64px; }
}

.pokemon-id { font-size: 0.7rem; color: #aaa; font-weight: 500; margin-top: 4px; }
.pokemon-name { font-size: 0.8rem; font-weight: 600; text-transform: capitalize; color: #212121; margin-top: 2px; }
</style>
