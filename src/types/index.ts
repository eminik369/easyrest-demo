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
  temperatureTarget?: {
    min: number;
    max: number;
    zoneId: string;
  };
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
export type ModuleId =
  | 'recipes' | 'scanner' | 'preparations' | 'analytics' | 'floor-plan' | 'chatbot'
  | 'crm' | 'kds' | 'kitchen-assistant' | 'menu-importer';

// =======================================================================
// CRM / RATING / LOYALTY
// =======================================================================

export type CustomerTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'new';

export interface CustomerRatings {
  /** 1.0–5.0 — higher means less late on average */
  punctuality: number;
  /** 1.0–5.0 — higher means actual covers match reservation */
  reliability: number;
  /** 1.0–5.0 — avg behavioural rating from waitstaff */
  behavior: number;
}

export interface Customer {
  id: string;
  name: string;            // Cognome / surname
  firstName?: string;
  phone: string;
  email?: string;
  firstVisit: string;      // ISO date
  lastVisit: string;       // ISO date
  totalVisits: number;
  totalSpent: number;      // EUR lifetime
  avgSpendPerVisit: number;
  ratings: CustomerRatings;
  compositeScore: number;  // 0–100
  tier: CustomerTier;
  notes?: string;
  // For avatar: two-letter initials + deterministic hue
  initials: string;
  hue: number;             // 0–360
}

export interface CustomerVisit {
  id: string;
  customerId: string;
  reservationId?: string;
  date: string;
  reservationTime: string;  // "20:00"
  arrivalTime: string;      // "20:18"
  lateMinutes: number;      // positive = late, negative = early
  reservedCovers: number;
  actualCovers: number;
  coverDeviation: number;   // actual - reserved, negative = no-show
  behaviorRating: number;   // 1–5
  spend: number;
  tableId?: string;
  notes?: string;
}

export interface LoyaltyReward {
  id: string;
  customerId: string;
  customerName: string;
  month: string;            // "2026-02"
  rank: number;             // 1=first
  rewardType: 'aperitivo' | 'dessert' | 'bottiglia' | 'tasting' | 'upgrade';
  rewardLabel: string;      // "Aperitivo della casa per 2"
  qrCode: string;           // unique code (displayed in QR SVG)
  issuedAt: string;
  redeemedAt?: string;
  expiresAt: string;
  value: number;            // EUR equivalent
}

// =======================================================================
// RECIPE TECH CARDS (Kitchen AI Assistant knowledge base)
// =======================================================================

export interface RecipeTechCard {
  recipeId: string;
  procedure: string[];              // ordered steps
  platingDescription: string;
  /** key for a gradient / emoji placeholder used in the demo */
  platingVisual: string;
  cookingTimeMinutes: number;
  difficulty: 'facile' | 'media' | 'difficile';
  allergeni: string[];
  chefNotes?: string;
  station: KDSStation;
}

// =======================================================================
// KDS (Kitchen Display System)
// =======================================================================

export type KDSStation = 'freddo' | 'caldo' | 'pasta' | 'grill' | 'pasticceria';

export interface KDSItem {
  id: string;
  recipeId: string;
  name: string;
  category: 'antipasto' | 'primo' | 'secondo' | 'dessert';
  quantity: number;
  notes?: string;
  station: KDSStation;
  status: 'attesa' | 'preparazione' | 'pronto';
  startedAt?: string;
}

export interface KDSOrder {
  id: string;
  orderNumber: string;           // "#042"
  tableNumber: string;           // "T3"
  covers: number;
  waiter: string;
  items: KDSItem[];
  status: 'nuovo' | 'in_corso' | 'completato' | 'servito';
  /** Minutes elapsed since ticket creation (simulated) */
  elapsedMinutes: number;
  /** Avg expected prep time in minutes for comparison */
  avgPrepTime: number;
  priority: 'normale' | 'urgente' | 'critico';
}

// =======================================================================
// MENU IMPORTER
// =======================================================================

export type ImportPlatform = 'pienissimo' | 'leggimenu' | 'tomato' | 'superb' | 'custom';

export interface ImportedDish {
  id: string;
  sourceName: string;
  sourceCategory: string;       // raw category from source
  price: number;
  description: string;
  mappedCategory?: 'antipasto' | 'primo' | 'secondo' | 'dessert';
  confidence: number;           // 0–100
  status: 'pending' | 'mapped' | 'imported' | 'skipped';
  detectedAllergens?: string[];
}

export interface MenuImportSession {
  id: string;
  sourceUrl: string;
  sourcePlatform: ImportPlatform;
  sourceRestaurantName: string;
  scrapedAt: string;
  dishCount: number;
  dishes: ImportedDish[];
  mappingComplete: number;      // 0–100 %
}

// =======================================================================
// HACCP TEMPERATURE ZONES
// =======================================================================

export type ZoneStatus = 'conforme' | 'attenzione' | 'critica';

export interface StorageZone {
  id: string;
  name: string;            // "Frigo 1 — Latticini"
  shortLabel: string;      // "F1"
  currentTemp: number;     // °C
  targetTempMin: number;
  targetTempMax: number;
  location: string;        // "Cucina principale"
  lastReading: string;     // ISO timestamp
  status: ZoneStatus;
  productIds: string[];    // which products should be stored here
  category: 'refrigerato' | 'surgelato' | 'secco' | 'ambiente';
  /** Last 24h of temperature samples for charting */
  history: { t: string; temp: number }[];
}
