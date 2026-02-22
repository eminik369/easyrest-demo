import type { Sale } from '../types';

const recipeInfo = [
  { id: 'rec-tartare-tonno', name: 'Tartare di tonno rosso con avocado', price: 22, weight: 8 },
  { id: 'rec-burrata', name: 'Burrata pugliese con pomodorini confit', price: 18, weight: 7 },
  { id: 'rec-carpaccio-ricciola', name: 'Carpaccio di ricciola con agrumi', price: 24, weight: 6 },
  { id: 'rec-cacio-pepe', name: 'Cacio e Pepe con guanciale croccante', price: 18, weight: 12 },
  { id: 'rec-risotto-zafferano', name: 'Risotto allo zafferano con midollo', price: 24, weight: 10 },
  { id: 'rec-ravioli-brasato', name: 'Ravioli di brasato al tartufo nero', price: 28, weight: 8 },
  { id: 'rec-filetto-barolo', name: 'Filetto di manzo con riduzione al Barolo', price: 36, weight: 9 },
  { id: 'rec-baccala', name: 'Baccala mantecato su polenta croccante', price: 28, weight: 6 },
  { id: 'rec-anatra', name: "Petto d'anatra laccato con salsa all'arancia", price: 32, weight: 7 },
  { id: 'rec-tiramisu', name: 'Tiramisu destrutturato', price: 14, weight: 5 },
  { id: 'rec-millefoglie', name: 'Millefoglie alla vaniglia Bourbon', price: 16, weight: 4 },
  { id: 'rec-sfera-cioccolato', name: 'Sfera di cioccolato fondente', price: 15, weight: 4 },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generateSales(): Sale[] {
  const sales: Sale[] = [];
  const rand = seededRandom(42);
  const startDate = new Date('2025-12-01');
  const endDate = new Date('2026-02-22');
  let saleId = 1;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const month = d.getMonth();
    const baseOrders = isWeekend ? 35 : 22;
    const dailyOrders = baseOrders + Math.floor(rand() * 10) - 3;

    for (let i = 0; i < dailyOrders; i++) {
      const totalWeight = recipeInfo.reduce((s, r) => {
        let w = r.weight;
        // Seasonal boost: risotto more popular in winter
        if (r.id === 'rec-risotto-zafferano' && (month === 0 || month === 1 || month === 11)) w += 4;
        if (r.id === 'rec-carpaccio-ricciola' && (month === 0 || month === 1)) w -= 2;
        return s + Math.max(w, 1);
      }, 0);

      let cumWeight = 0;
      const pick = rand() * totalWeight;
      let chosen = recipeInfo[0];

      for (const r of recipeInfo) {
        let w = r.weight;
        if (r.id === 'rec-risotto-zafferano' && (month === 0 || month === 1 || month === 11)) w += 4;
        if (r.id === 'rec-carpaccio-ricciola' && (month === 0 || month === 1)) w = Math.max(w - 2, 1);
        cumWeight += w;
        if (pick <= cumWeight) {
          chosen = r;
          break;
        }
      }

      const dateStr = d.toISOString().split('T')[0];
      sales.push({
        id: `sale-${String(saleId++).padStart(5, '0')}`,
        date: dateStr,
        recipeId: chosen.id,
        recipeName: chosen.name,
        quantity: 1,
        revenue: chosen.price,
        orderType: rand() > 0.3 ? 'comanda' : 'scontrino',
      });
    }
  }

  return sales;
}

export const sales: Sale[] = generateSales();
