import { create } from 'zustand';
import type {
  Recipe, Product, Preparation, Sale, HACCPEntry, Reservation,
  Customer, CustomerVisit, LoyaltyReward, RecipeTechCard,
  KDSOrder, StorageZone, MenuImportSession,
} from '../types';
import { recipes as initialRecipes } from '../data/recipes';
import { products as initialProducts } from '../data/products';
import { preparations as initialPreparations } from '../data/preparations';
import { sales as initialSales } from '../data/sales';
import { haccp as initialHaccp } from '../data/haccp';
import { reservations as initialReservations } from '../data/reservations';
import { customers as initialCustomers } from '../data/customers';
import { customerVisits as initialVisits } from '../data/customerVisits';
import { loyaltyRewards as initialRewards } from '../data/loyaltyRewards';
import { recipeCards as initialRecipeCards } from '../data/recipeCards';
import { kdsOrders as initialKdsOrders } from '../data/kdsOrders';
import { storageZones as initialZones } from '../data/storageZones';
import { menuImports as initialMenuImports } from '../data/menuImports';

interface EasyRestStore {
  // existing
  recipes: Recipe[];
  products: Product[];
  preparations: Preparation[];
  sales: Sale[];
  haccp: HACCPEntry[];
  reservations: Reservation[];
  reservedCovers: number;
  predictionMode: 'prenotati' | 'storico' | 'soglia';
  // new
  customers: Customer[];
  customerVisits: CustomerVisit[];
  loyaltyRewards: LoyaltyReward[];
  recipeCards: RecipeTechCard[];
  kdsOrders: KDSOrder[];
  storageZones: StorageZone[];
  menuImports: MenuImportSession[];
  // mutations / helpers
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  toggleRecipeActive: (id: string) => void;
  setReservedCovers: (covers: number) => void;
  setPredictionMode: (mode: 'prenotati' | 'storico' | 'soglia') => void;
  getRecipeById: (id: string) => Recipe | undefined;
  getProductById: (id: string) => Product | undefined;
  getRecipesForProduct: (productId: string) => Recipe[];
  getCustomerById: (id: string) => Customer | undefined;
  getVisitsForCustomer: (customerId: string) => CustomerVisit[];
  getRecipeCard: (recipeId: string) => RecipeTechCard | undefined;
  updateKdsOrder: (id: string, updates: Partial<KDSOrder>) => void;
  redeemReward: (id: string) => void;
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
  customers: initialCustomers,
  customerVisits: initialVisits,
  loyaltyRewards: initialRewards,
  recipeCards: initialRecipeCards,
  kdsOrders: initialKdsOrders,
  storageZones: initialZones,
  menuImports: initialMenuImports,
  addRecipe: (recipe) => set((s) => ({ recipes: [...s.recipes, recipe] })),
  updateRecipe: (id, updates) => set((s) => ({ recipes: s.recipes.map((r) => r.id === id ? { ...r, ...updates } : r) })),
  deleteRecipe: (id) => set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),
  toggleRecipeActive: (id) => set((s) => ({ recipes: s.recipes.map((r) => r.id === id ? { ...r, active: !r.active } : r) })),
  setReservedCovers: (covers) => set({ reservedCovers: covers }),
  setPredictionMode: (mode) => set({ predictionMode: mode }),
  getRecipeById: (id) => get().recipes.find((r) => r.id === id),
  getProductById: (id) => get().products.find((p) => p.id === id),
  getRecipesForProduct: (productId) => get().recipes.filter((r) => r.ingredients.some((i) => i.productId === productId)),
  getCustomerById: (id) => get().customers.find((c) => c.id === id),
  getVisitsForCustomer: (customerId) => get().customerVisits.filter((v) => v.customerId === customerId),
  getRecipeCard: (recipeId) => get().recipeCards.find((c) => c.recipeId === recipeId),
  updateKdsOrder: (id, updates) => set((s) => ({ kdsOrders: s.kdsOrders.map((o) => o.id === id ? { ...o, ...updates } : o) })),
  redeemReward: (id) => set((s) => ({
    loyaltyRewards: s.loyaltyRewards.map((r) => r.id === id ? { ...r, redeemedAt: new Date().toISOString() } : r),
  })),
}));
