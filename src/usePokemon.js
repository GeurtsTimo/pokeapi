import { ref } from 'vue'

const STORAGE_KEY = 'pokedex-pokemon-list';

export class PokemonService {
  constructor() {
    this.storage = ref({
      items: [],
      loading: false,
      error: null,
    });
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.storage.value.items = JSON.parse(raw);
        return true;
      }
    } catch (e) {
      console.error('Fout bij laden Pokémon-lijst:', e);
    }
    return false;
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.storage.value.items));
    } catch (e) {
      console.error('Fout bij opslaan Pokémon-lijst:', e);
    }
  }

  async fetchAllPokemon() {
    if (this.storage.value.items.length > 0) return;
    if (this.loadFromStorage()) return;

    this.storage.value.loading = true;
    this.storage.value.error = null;

    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=999999');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      this.storage.value.items = data.results.map((pokemon) => {
        const parts = pokemon.url.split('/').filter((x) => x.length > 0);
        const id = Number(parts[parts.length - 1]);
        return {
          id,
          name: pokemon.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        };
      });

      this.saveToStorage();
    } catch (e) {
      this.storage.value.error = 'Er is een fout opgetreden: ' + e.message;
    } finally {
      this.storage.value.loading = false;
    }
  }

  async fetchPokemonById(pokemonId) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error('Fout bij ophalen Pokémon details:', e);
      return null;
    }
  }

  getPokemonById(id) {
    return this.storage.value.items.find((pokemon) => pokemon.id === id) || null;
  }
}

export const pokemonService = new PokemonService()
