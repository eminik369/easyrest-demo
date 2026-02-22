import { create } from 'zustand';
import type { Recipe, Product, Preparation, Sale, HACCPEntry, Reservation } from '../types';
import { recipes as initialRecipes } from '../data/recipes';
import { products as initialProducts } from '../data/products';
import { preparations as initialPreparations } from '../data/preparations';
import { sales as initialSales } from '../data/sales';
import { haccp as initialHaccp } from '../data/haccp';
import { reservations as initialReservations } from '../data/reservations';

interface EasyRestStore {
  recipes: Recipe[];
  products: Product[];
  preparations: Preparation[];
  sales: Sale[];
  haccp: HACCPEntry[];
  reservations: Reservation[];
  reservedCovers: number;
  predictionMode: 'prenotati' | 'storico' | 'soglia';
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  toggleRecipeActive: (id: string) => void;
  setReservedCovers: (covers: number) => void;
  setPredictionMode: (mode: 'prenotati' | 'storico' | 'soglia') => void;
  getRecipeById: (id: string) => Recipe | undefined;
  getProductById: (id: string) => Product | undefined;
  getRecipesForProduct: (productId: string) => Recipe[];
}

export const useStore = create<EasyRestStore>((set, get) => ({
  recipes: initialRecipes,
  products: initialProducts,
  preparations: initialPreparations,
  sales: initialSales,
  haccp: initialHaccp,
  reservations: initialReservations,
  reservedCovers: initialReservations.filter(r => r.date === '2026-02-22').reduce((s, r) => s + r.covers, 0),
  predictionMode: 'prenotati',
  addRecipe: (recipe) => set((s) => ({ recipes: [...s.recipes, recipe] })),
  updateRecipe: (id, updates) => set((s) => ({ recipes: s.recipes.map((r) => r.id === id ? { ...r, ...updates } : r) })),
  deleteRecipe: (id) => set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),
  toggleRecipeActive: (id) => set((s) => ({ recipes: s.recipes.map((r) => r.id === id ? { ...r, active: !r.active } : r) })),
  setReservedCovers: (covers) => set({ reservedCovers: covers }),
  setPredictionMode: (mode) => set({ predictionMode: mode }),
  getRecipeById: (id) => get().recipes.find((r) => r.id === id),
  getProductById: (id) => get().products.find((p) => p.id === id),
  getRecipesForProduct: (productId) => get().recipes.filter((r) => r.ingredients.some((i) => i.productId === productId)),
}));
