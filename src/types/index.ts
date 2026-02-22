export interface Recipe {
  id: string;
  name: string;
  category: 'antipasto' | 'primo' | 'secondo' | 'dessert';
  active: boolean;
  sellingPrice: number;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  productId: string;
  productName: string;
  quantity: number;
  unit: 'g' | 'ml' | 'pz';
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  supplier: string;
  lot: string;
  expiryDate: string;
  receivedDate: string;
  quantity: number;
  unit: 'kg' | 'l' | 'pz';
  unitPrice: number;
  category: string;
  wastePercentage: number;
  wasteConfidence: 'bassa' | 'media' | 'alta';
  wasteRegistrations: number;
  minimumThreshold: number;
  thresholdPeriod: 'giornaliero' | 'settimanale';
}

export interface Preparation {
  id: string;
  name: string;
  ingredients: PreparationIngredient[];
  maxConservationHours: number;
  preparedAt: string | null;
  expiresAt: string | null;
  portionsAvailable: number;
  portionsNeeded: number;
}

export interface PreparationIngredient {
  productId: string;
  productName: string;
  quantity: number;
  unit: 'g' | 'ml';
  expiryDate: string;
}

export interface Sale {
  id: string;
  date: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  revenue: number;
  orderType: 'comanda' | 'scontrino';
}

export interface HACCPEntry {
  id: string;
  productId: string;
  productName: string;
  receivedDate: string;
  lot: string;
  supplier: string;
  expiryDate: string;
  storageTemp: string;
  status: 'conforme' | 'non_conforme';
}

export interface Reservation {
  id: string;
  date: string;
  time: string;
  covers: number;
  name: string;
  tableId: string | null;
}

export type ExpiryStatus = 'ok' | 'warning' | 'danger';
export type ModuleId = 'recipes' | 'scanner' | 'preparations' | 'analytics' | 'floor-plan' | 'chatbot';
