<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { pokemonService } from '@/usePokemon.js'

const pageSize = 20
const currentPage = ref(0)
const route = useRoute()

const searchTerm = computed(() => (route.query.search ?? '').toLowerCase())

const filteredItems = computed(() => {
  if (!searchTerm.value) return pokemonService.storage.value.items
  return pokemonService.storage.value.items.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.value)
  )
})

const page = computed(() => {
  const start = currentPage.value * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize)))

const next = () => { if (currentPage.value + 1 < totalPages.value) currentPage.value++ }
const prev = () => { if (currentPage.value > 0) currentPage.value-- }

watch(searchTerm, () => { currentPage.value = 0 })

const selecteerPokemon = (id) => {
  if (window.openPokemonDetails) window.openPokemonDetails(id)
}

onMounted(async () => {
  await pokemonService.fetchAllPokemon()
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

    <p v-if="!page.length" class="empty-message">Geen Pokémon gevonden voor "{{ searchTerm }}".</p>

    <template v-else>
      <div class="page-nav">
        <button class="nav-btn" @click="prev" :disabled="currentPage === 0" aria-label="Vorige">&#8249;</button>
        <span class="page-label">Pagina {{ currentPage + 1 }} / {{ totalPages }}</span>
        <button class="nav-btn" @click="next" :disabled="currentPage + 1 >= totalPages" aria-label="Volgende">&#8250;</button>
      </div>

      <div class="pokemon-grid">
        <button
          v-for="pokemon in page"
          :key="pokemon.id"
          class="pokemon-card"
          @click="selecteerPokemon(pokemon.id)"
        >
          <img :src="pokemon.image" :alt="pokemon.name" loading="lazy" />
          <span class="pokemon-id">#{{ String(pokemon.id).padStart(3, '0') }}</span>
          <span class="pokemon-name">{{ pokemon.name }}</span>
        </button>
      </div>

      <div class="page-nav page-nav--bottom">
        <button class="nav-btn" @click="prev" :disabled="currentPage === 0" aria-label="Vorige">&#8249;</button>
        <span class="page-label">Pagina {{ currentPage + 1 }} / {{ totalPages }}</span>
        <button class="nav-btn" @click="next" :disabled="currentPage + 1 >= totalPages" aria-label="Volgende">&#8250;</button>
      </div>
    </template>

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
}

.page-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 12px 0;
}

.page-nav--bottom { margin-top: 16px; }

.page-label { font-size: 0.875rem; font-weight: 500; color: #555; min-width: 120px; text-align: center; }

.nav-btn {
  background: white;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px; height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  color: #3b4cca;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  transition: background 0.15s;
  line-height: 1;
  flex-shrink: 0;
}

.nav-btn:hover:not(:disabled) { background: #f0f2ff; }
.nav-btn:disabled { color: #ccc; cursor: not-allowed; box-shadow: none; }

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