import type { Recipe, Product, Sale, ExpiryStatus } from '../types';

export function calculateRecipeCost(recipe: Recipe, products: Product[]): number {
  return recipe.ingredients.reduce((total, ing) => {
    const product = products.find((p) => p.id === ing.productId);
    if (!product) return total;
    const qtyInUnit = ing.unit === 'g' ? ing.quantity / 1000 : ing.unit === 'ml' ? ing.quantity / 1000 : ing.quantity;
    return total + qtyInUnit * product.unitPrice;
  }, 0);
}

export function calculateMargin(recipe: Recipe, products: Product[]): number {
  return recipe.sellingPrice - calculateRecipeCost(recipe, products);
}

export function calculateMarginPercentage(recipe: Recipe, products: Product[]): number {
  const cost = calculateRecipeCost(recipe, products);
  if (recipe.sellingPrice === 0) return 0;
  return ((recipe.sellingPrice - cost) / recipe.sellingPrice) * 100;
}

export function getExpiryStatus(expiryDate: string, today: string = '2026-02-22'): ExpiryStatus {
  const diffDays = daysUntilExpiry(expiryDate, today);
  if (diffDays <= 0) return 'danger';
  if (diffDays <= 3) return 'warning';
  return 'ok';
}

export function daysUntilExpiry(expiryDate: string, today: string = '2026-02-22'): number {
  return Math.ceil((new Date(expiryDate).getTime() - new Date(today).getTime()) / 86400000);
}

export function calculateTheoreticalConsumption(productId: string, sales: Sale[], recipes: Recipe[], dateFrom?: string, dateTo?: string): number {
  const filtered = sales.filter((s) => {
    if (dateFrom && s.date < dateFrom) return false;
    if (dateTo && s.date > dateTo) return false;
    return true;
  });
  return filtered.reduce((total, sale) => {
    const recipe = recipes.find((r) => r.id === sale.recipeId);
    if (!recipe) return total;
    const ing = recipe.ingredients.find((i) => i.productId === productId);
    if (!ing) return total;
    const qtyKg = ing.unit === 'g' ? ing.quantity / 1000 : ing.unit === 'ml' ? ing.quantity / 1000 : ing.quantity;
    return total + qtyKg * sale.quantity;
  }, 0);
}

export function averageDailyConsumption(productId: string, sales: Sale[], recipes: Recipe[], days = 30): number {
  const from = new Date('2026-02-22');
  from.setDate(from.getDate() - days);
  return calculateTheoreticalConsumption(productId, sales, recipes, from.toISOString().split('T')[0], '2026-02-22') / days;
}

export function calculateReorderSuggestion(product: Product, sales: Sale[], recipes: Recipe[]) {
  const avgDaily = averageDailyConsumption(product.id, sales, recipes);
  const avgWeekly = avgDaily * 7;
  const daysLeft = product.quantity > 0 && avgDaily > 0 ? product.quantity / avgDaily : 999;
  const belowThreshold = product.quantity < product.minimumThreshold;
  const suggestedQty = Math.max(avgWeekly - product.quantity + product.minimumThreshold, 0);

  if (belowThreshold || daysLeft < 3) {
    return {
      shouldReorder: true,
      quantity: Math.ceil(suggestedQty * 10) / 10,
      reason: belowThreshold
        ? `Scorta attuale ${product.quantity}${product.unit} sotto soglia minima di ${product.minimumThreshold}${product.unit}. Consumo medio settimanale: ${avgWeekly.toFixed(1)}${product.unit}.`
        : `Scorta sufficiente per soli ${daysLeft.toFixed(0)} giorni.`,
      urgency: (daysLeft < 1 ? 'alta' : 'media') as 'alta' | 'media' | 'bassa',
    };
  }
  return {
    shouldReorder: daysLeft < 7,
    quantity: daysLeft < 7 ? Math.ceil(suggestedQty * 10) / 10 : 0,
    reason: daysLeft < 7
      ? `Scorta sufficiente per ${daysLeft.toFixed(0)} giorni. Riordino consigliato.`
      : `Scorta sufficiente per ${daysLeft.toFixed(0)} giorni. Nessun riordino urgente.`,
    urgency: 'bassa' as const,
  };
}

export function getSalesTrendByMonth(sales: Sale[]) {
  const months: Record<string, { total: number; revenue: number }> = {};
  sales.forEach((s) => {
    const m = s.date.substring(0, 7);
    if (!months[m]) months[m] = { total: 0, revenue: 0 };
    months[m].total += s.quantity;
    months[m].revenue += s.revenue;
  });
  return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([month, d]) => ({ month, ...d }));
}

export function getTopSellingRecipes(sales: Sale[], limit = 5) {
  const totals: Record<string, { recipeName: string; totalSold: number; totalRevenue: number }> = {};
  sales.forEach((s) => {
    if (!totals[s.recipeId]) totals[s.recipeId] = { recipeName: s.recipeName, totalSold: 0, totalRevenue: 0 };
    totals[s.recipeId].totalSold += s.quantity;
    totals[s.recipeId].totalRevenue += s.revenue;
  });
  return Object.entries(totals).map(([id, d]) => ({ recipeId: id, ...d })).sort((a, b) => b.totalSold - a.totalSold).slice(0, limit);
}

export const formatCurrency = (n: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
export const formatWeight = (kg: number) => kg < 1 ? `${(kg * 1000).toFixed(0)}g` : `${kg.toFixed(1)}kg`;
export const formatDate = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
export const formatDateShort = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
