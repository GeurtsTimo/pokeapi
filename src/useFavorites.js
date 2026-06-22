import { ref } from "vue";

const STORAGE_KEY = "pokedex-favorites";

export class FavoriteService {
  constructor() {
    this.storage = ref({
      items: [],
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
      console.error('Fout bij laden favorieten:', e);
    }
    return false;
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.storage.value.items));
    } catch (e) {
      console.error('Fout bij opslaan favorieten:', e);
    }
  }

  toggleFavorite(pokemonId) {
    const index = this.storage.value.items.indexOf(pokemonId);
    if (index !== -1) {
      this.storage.value.items.splice(index, 1);
    } else {
      this.storage.value.items.push(pokemonId);
    }
    this.saveToStorage();
  }

  isFavorite(pokemonId) {
    return this.storage.value.items.includes(pokemonId);
  }

  removeFavorite(pokemonId) {
    const index = this.storage.value.items.indexOf(pokemonId);
    if (index !== -1) {
      this.storage.value.items.splice(index, 1);
      this.saveToStorage();
    }
  }
}

// Singleton — import this instead of calling new FavoriteService()
export const favoriteService = new FavoriteService()
