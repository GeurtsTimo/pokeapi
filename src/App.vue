<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { MDCDrawer } from '@material/drawer'
import { MDCTopAppBar } from '@material/top-app-bar'
import { pokemonService } from '@/usePokemon.js'
import { favoriteService } from '@/useFavorites.js'

let drawer = null
let topAppBar = null
let drawerList = null
let sheetTopAppBar = null

const router = useRouter()

const showSheet = ref(false)
const detailLoading = ref(false)
const pokemonDetails = ref(null)
const currentIndex = ref(null)

const showSearch = ref(false)
const searchTerm = ref('')

const favorites = favoriteService

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) searchTerm.value = ''
}

const onSearchEnter = () => {
  router.push(searchTerm.value ? `/?search=${encodeURIComponent(searchTerm.value)}` : '/')
}

const fetchPokemonById = async (pokemonId) => {
  detailLoading.value = true
  pokemonDetails.value = null
  pokemonDetails.value = await pokemonService.fetchPokemonById(pokemonId)
  detailLoading.value = false
}

const openDetails = async (pokemonId) => {
  showSheet.value = true

  const allIds = pokemonService.storage.value.items.map((p) => p.id)
  const index = allIds.indexOf(pokemonId)
  currentIndex.value = index !== -1 ? index : null

  await fetchPokemonById(pokemonId)
}

const goToPrevious = () => {
  if (currentIndex.value === null || detailLoading.value) return
  if (currentIndex.value > 0) {
    const newIndex = currentIndex.value - 1
    currentIndex.value = newIndex
    fetchPokemonById(pokemonService.storage.value.items[newIndex].id)
  }
}

const goToNext = () => {
  if (currentIndex.value === null || detailLoading.value) return
  if (currentIndex.value < pokemonService.storage.value.items.length - 1) {
    const newIndex = currentIndex.value + 1
    currentIndex.value = newIndex
    fetchPokemonById(pokemonService.storage.value.items[newIndex].id)
  }
}

const closeSheet = () => { showSheet.value = false }

const isCurrentFavorite = computed(() => {
  if (!pokemonDetails.value) return false
  return favorites.isFavorite(pokemonDetails.value.id)
})

const onToggleFavorite = () => {
  if (!pokemonDetails.value) return
  favorites.toggleFavorite(pokemonDetails.value.id)
}

onMounted(() => {
  favorites.loadFromStorage()

  window.openPokemonDetails = openDetails

  const drawerEl = document.querySelector('.mdc-drawer')
  drawer = MDCDrawer.attachTo(drawerEl)
  drawerList = drawer.list
  if (drawerList) drawerList.wrapFocus = true

  document.querySelectorAll('.mdc-drawer .mdc-list-item').forEach((item) => {
    item.addEventListener('click', () => {
      setTimeout(() => { drawer.open = false }, 50)
    })
  })

  const scrimEl = document.querySelector('.mdc-drawer-scrim')
  scrimEl?.addEventListener('click', () => { drawer.open = false })

  const topAppBarEl = document.querySelector('.mdc-top-app-bar')
  topAppBar = MDCTopAppBar.attachTo(topAppBarEl)
  topAppBar.listen('MDCTopAppBar:nav', () => { drawer.open = !drawer.open })

  const sheetTopAppBarEl = document.querySelector('.sheet-header .mdc-top-app-bar')
  if (sheetTopAppBarEl) sheetTopAppBar = MDCTopAppBar.attachTo(sheetTopAppBarEl)
})

</script>

<template>
  <div class="mdc-app">

    <aside class="mdc-drawer mdc-drawer--modal">
      <div class="mdc-drawer__content">
        <nav class="mdc-list">
          <RouterLink to="/" class="mdc-list-item" active-class="mdc-list-item--activated" aria-current-value="page">
            <span class="mdc-list-item__ripple"></span>
            <i class="material-icons mdc-list-item__graphic" aria-hidden="true">catching_pokemon</i>
            <span class="mdc-list-item__text">Pokémons</span>
          </RouterLink>
          <RouterLink to="/favourites" class="mdc-list-item" active-class="mdc-list-item--activated" aria-current-value="page">
            <span class="mdc-list-item__ripple"></span>
            <i class="material-icons mdc-list-item__graphic" aria-hidden="true">favorite</i>
            <span class="mdc-list-item__text">Favorites</span>
          </RouterLink>
        </nav>
      </div>
    </aside>

    <div class="mdc-drawer-scrim"></div>

    <header class="mdc-top-app-bar">
      <div class="mdc-top-app-bar__row">
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
          <button class="mdc-icon-button material-icons mdc-top-app-bar__navigation-icon" aria-label="Menu">menu</button>
          <span class="mdc-top-app-bar__title" v-if="!showSearch">Pokédex</span>
          <input
            v-else
            v-model="searchTerm"
            @keyup.enter="onSearchEnter"
            type="text"
            class="search-input"
            placeholder="Zoek een Pokémon..."
            autofocus
          />
        </section>
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end">
          <button class="mdc-icon-button material-icons" @click="toggleSearch" aria-label="Zoeken">
            {{ showSearch ? 'close' : 'search' }}
          </button>
        </section>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>

    <section class="sheet" :class="{ 'sheet-out-of-view': !showSheet }">
      <header class="sheet-header">
        <div class="mdc-top-app-bar">
          <div class="mdc-top-app-bar__row">
            <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
              <button class="mdc-icon-button material-icons" @click="closeSheet" aria-label="Sluiten">close</button>
              <span class="mdc-top-app-bar__title" style="text-transform: capitalize;">
                {{ pokemonDetails ? pokemonDetails.name : 'Laden...' }}
              </span>
            </section>
          </div>
        </div>
      </header>

      <main class="sheet-body">
        <div v-if="detailLoading" class="sheet-center">
          <p>Gegevens worden opgehaald...</p>
        </div>

        <div v-else-if="pokemonDetails" class="sheet-content">
          <div class="pokemon-id-badge">#{{ String(pokemonDetails.id).padStart(3, '0') }}</div>

          <div class="sheet-img-container">
            <img
              :src="pokemonDetails.sprites.other['official-artwork'].front_default || pokemonDetails.sprites.front_default"
              :alt="pokemonDetails.name">
          </div>

          <div class="info-card">
            <div class="types-container">
              <span v-for="t in pokemonDetails.types" :key="t.type.name"
                :class="['type-badge', t.type.name]">{{ t.type.name }}</span>
            </div>
            <p class="sheet-measurements">
              <strong>Lengte:</strong> {{ pokemonDetails.height / 10 }} m &nbsp;|&nbsp;
              <strong>Gewicht:</strong> {{ pokemonDetails.weight / 10 }} kg
            </p>
          </div>

          <div class="stats-card">
            <h3 class="stats-title">Basis Statistieken</h3>
            <div v-for="s in pokemonDetails.stats" :key="s.stat.name" class="stat-row">
              <span class="stat-name">{{ s.stat.name.replace('special-', 'sp. ') }}</span>
              <div class="stat-bar-bg">
                <div class="stat-bar" :style="{ width: Math.min((s.base_stat / 150) * 100, 100) + '%' }"></div>
              </div>
              <span class="stat-val">{{ s.base_stat }}</span>
            </div>
          </div>
        </div>
      </main>

      <footer class="sheet-footer">
        <button class="mdc-icon-button material-icons" aria-label="Vorige Pokémon"
          :disabled="currentIndex === null || currentIndex <= 0 || detailLoading"
          @click="goToPrevious">chevron_left</button>
        <button class="mdc-icon-button material-icons favorite-toggle"
          :class="{ 'favorite-toggle--active': isCurrentFavorite }"
          :aria-label="isCurrentFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'"
          @click="onToggleFavorite">{{ isCurrentFavorite ? 'favorite' : 'favorite_border' }}</button>
        <button class="mdc-icon-button material-icons" aria-label="Volgende Pokémon"
          :disabled="currentIndex === null || currentIndex >= pokemonService.storage.value.items.length - 1 || detailLoading"
          @click="goToNext">chevron_right</button>
      </footer>
    </section>

  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  background: #f5f5f5;
  color: #212121;
}

.mdc-app { min-height: 100vh; }

.mdc-top-app-bar {
  background: #3b4cca;
  color: white;
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.mdc-top-app-bar__row {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 4px;
}

.mdc-top-app-bar__section {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.mdc-top-app-bar__section--align-end {
  justify-content: flex-end;
  flex: 0 0 auto;
}

.mdc-top-app-bar__title {
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.0125em;
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-input {
  flex: 1;
  margin-left: 8px;
  border: none;
  background: rgba(255,255,255,0.15);
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  padding: 8px 12px;
  outline: none;
}

.search-input::placeholder { color: rgba(255,255,255,0.7); }

.app-main {
  padding-top: 56px;
  min-height: 100vh;
}

.mdc-drawer {
  position: fixed;
  top: 0; left: 0;
  width: 256px;
  height: 100%;
  background: white;
  z-index: 200;
  box-shadow: 4px 0 8px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.mdc-drawer--open,
.mdc-drawer--opening { transform: translateX(0); }
.mdc-drawer--closing  { transform: translateX(-100%); }

.mdc-drawer__content { flex: 1; overflow-y: auto; }
.mdc-list { list-style: none; margin: 0; padding: 8px 0; }

.mdc-list-item {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  cursor: pointer;
  transition: background 0.15s;
  text-decoration: none;
  color: #212121;
  position: relative;
  overflow: hidden;
}

.mdc-list-item:hover { background: rgba(59,76,202,0.08); }
.mdc-list-item--activated { color: #3b4cca; background: rgba(59,76,202,0.08); }

.mdc-list-item__graphic { color: #3b4cca; margin-right: 16px; font-size: 24px; }
.mdc-list-item__text { font-size: 0.875rem; font-weight: 500; }

.mdc-drawer-scrim {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 199;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.mdc-drawer--open + .mdc-drawer-scrim,
.mdc-drawer--opening + .mdc-drawer-scrim {
  opacity: 1;
  pointer-events: auto;
}

.mdc-icon-button {
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  padding: 0;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.mdc-icon-button:disabled {
  color: rgba(255,255,255,0.3);
  cursor: default;
  pointer-events: none;
}

.favorite-toggle--active { color: #ff5252; }

.sheet {
  position: fixed;
  inset: 0;
  background: white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  transition: transform 0.35s ease-in-out;
}

.sheet-out-of-view { transform: translateX(-100vw); }

.sheet-header {
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.sheet-header .mdc-top-app-bar { position: static; box-shadow: none; }

.sheet-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  background: #f5f5f5;
}

.sheet-footer {
  flex-shrink: 0;
  background: #3b4cca;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  padding: 0 16px;
}

.sheet-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: #666;
}

.sheet-content { max-width: 560px; margin: 0 auto; text-align: center; width: 100%; }

.pokemon-id-badge { font-size: 1.5rem; font-weight: 700; color: #aaa; margin-bottom: 4px; }

.sheet-img-container {
  width: 200px; height: 200px;
  background: white;
  border-radius: 50%;
  margin: 12px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.sheet-img-container img { width: 75%; height: auto; }

.info-card, .stats-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 16px;
  margin-bottom: 12px;
  text-align: left;
}

.sheet-measurements { margin: 8px 0 0; color: #444; font-size: 0.9rem; text-align: center; }

.types-container { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }

.type-badge {
  padding: 4px 14px;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
}

.stats-title { margin: 0 0 12px; font-size: 1rem; font-weight: 500; }

.stat-row { display: flex; align-items: center; margin-bottom: 8px; }

.stat-name {
  width: 70px;
  flex-shrink: 0;
  text-transform: capitalize;
  color: #666;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-bar-bg {
  flex: 1; min-width: 0;
  background: #e0e0e0;
  height: 8px;
  border-radius: 4px;
  margin: 0 8px;
  overflow: hidden;
}

.stat-bar { background: #3b4cca; height: 100%; border-radius: 4px; transition: width 0.5s ease; }

.stat-val { flex-shrink: 0; font-weight: 700; width: 28px; text-align: right; font-size: 0.8rem; }

.normal   { background: #A8A77A; } .fire     { background: #EE8130; }
.water    { background: #6390F0; } .electric { background: #F7D02C; }
.grass    { background: #7AC74C; } .ice      { background: #96D9D6; }
.fighting { background: #C22E28; } .poison   { background: #A33EA1; }
.ground   { background: #E2BF65; } .flying   { background: #A98FF3; }
.psychic  { background: #F95587; } .bug      { background: #A6B91A; }
.rock     { background: #B6A136; } .ghost    { background: #735797; }
.dragon   { background: #6F35FC; } .dark     { background: #705746; }
.steel    { background: #B7B7CE; } .fairy    { background: #D685AD; }
</style>
