import type { MenuImportSession } from '../types';

// 1 import session from Pienissimo platform with 25 dishes.
export const menuImports: MenuImportSession[] = [
  {
    id: 'import-001',
    sourceUrl: 'https://pienissimo.it/ristorante-del-borgo/menu',
    sourcePlatform: 'pienissimo',
    sourceRestaurantName: 'Ristorante del Borgo',
    scrapedAt: '2026-02-20T14:32:00Z',
    dishCount: 25,
    mappingComplete: 88,
    dishes: [
      // ANTIPASTI (6)
      { id: 'dish-001', sourceName: 'Tagliere di salumi misti', sourceCategory: 'ANTIPASTI', price: 18, description: 'Selezione di salumi DOP stagionati in casa, serviti con pane caldo.', mappedCategory: 'antipasto', confidence: 96, status: 'mapped', detectedAllergens: ['glutine'] },
      { id: 'dish-002', sourceName: 'Burrata con pomodorini confit', sourceCategory: 'ANTIPASTI', price: 16, description: 'Burrata pugliese con datterini confit e basilico fresco.', mappedCategory: 'antipasto', confidence: 98, status: 'mapped', detectedAllergens: ['lattosio'] },
      { id: 'dish-003', sourceName: 'Tartare di tonno al coltello', sourceCategory: 'ANTIPASTI', price: 22, description: 'Tonno rosso tagliato al coltello con avocado e lime.', mappedCategory: 'antipasto', confidence: 94, status: 'mapped', detectedAllergens: ['pesce'] },
      { id: 'dish-004', sourceName: 'Carpaccio di ricciola agli agrumi', sourceCategory: 'ANTIPASTI', price: 24, description: 'Ricciola siciliana con arancia tarocco e pompelmo rosa.', mappedCategory: 'antipasto', confidence: 92, status: 'mapped', detectedAllergens: ['pesce'] },
      { id: 'dish-005', sourceName: 'Vitello tonnato classico', sourceCategory: 'ANTIPASTI', price: 17, description: 'Noce di vitello rosa con salsa tonnata e capperi di Pantelleria.', mappedCategory: 'antipasto', confidence: 88, status: 'mapped', detectedAllergens: ['uova', 'pesce'] },
      { id: 'dish-006', sourceName: 'Parmigiana di melanzane', sourceCategory: 'ANTIPASTI', price: 13, description: 'Melanzane, mozzarella di bufala e parmigiano 36 mesi.', mappedCategory: 'antipasto', confidence: 72, status: 'pending', detectedAllergens: ['lattosio'] },
      // PRIMI (8)
      { id: 'dish-007', sourceName: 'Tonnarelli cacio e pepe', sourceCategory: 'PRIMI PIATTI', price: 16, description: 'Tonnarelli freschi con pecorino romano DOP e pepe Tellicherry.', mappedCategory: 'primo', confidence: 97, status: 'mapped', detectedAllergens: ['glutine', 'uova', 'lattosio'] },
      { id: 'dish-008', sourceName: 'Risotto allo zafferano con midollo', sourceCategory: 'PRIMI PIATTI', price: 22, description: 'Carnaroli mantecato con zafferano DOP e midollo di bue.', mappedCategory: 'primo', confidence: 96, status: 'mapped', detectedAllergens: ['lattosio'] },
      { id: 'dish-009', sourceName: 'Ravioli di brasato al tartufo', sourceCategory: 'PRIMI PIATTI', price: 26, description: 'Ravioli fatti a mano con brasato di manzo e tartufo nero di Norcia.', mappedCategory: 'primo', confidence: 93, status: 'mapped', detectedAllergens: ['glutine', 'uova', 'lattosio'] },
      { id: 'dish-010', sourceName: 'Spaghetti alla chitarra ai frutti di mare', sourceCategory: 'PRIMI PIATTI', price: 24, description: 'Gamberi rossi, scampi e vongole veraci con pomodorini.', mappedCategory: 'primo', confidence: 90, status: 'mapped', detectedAllergens: ['glutine', 'crostacei', 'molluschi'] },
      { id: 'dish-011', sourceName: 'Gnocchi ai 4 formaggi', sourceCategory: 'PRIMI PIATTI', price: 15, description: 'Gnocchi di patate con parmigiano, gorgonzola, taleggio e fontina.', mappedCategory: 'primo', confidence: 89, status: 'mapped', detectedAllergens: ['glutine', 'lattosio'] },
      { id: 'dish-012', sourceName: 'Linguine al pesto genovese', sourceCategory: 'PRIMI PIATTI', price: 14, description: 'Linguine con pesto fresco, pinoli e parmigiano.', mappedCategory: 'primo', confidence: 85, status: 'mapped', detectedAllergens: ['glutine', 'frutta a guscio', 'lattosio'] },
      { id: 'dish-013', sourceName: 'Lasagne alla Bolognese', sourceCategory: 'PRIMI PIATTI', price: 16, description: 'Lasagne con ragu di manzo, besciamella e parmigiano.', mappedCategory: 'primo', confidence: 94, status: 'mapped', detectedAllergens: ['glutine', 'uova', 'lattosio'] },
      { id: 'dish-014', sourceName: 'Paccheri allo scoglio', sourceCategory: 'PRIMI PIATTI', price: 22, description: 'Paccheri con calamari, vongole e pomodorini.', mappedCategory: 'primo', confidence: 87, status: 'mapped', detectedAllergens: ['glutine', 'molluschi'] },
      // SECONDI (7)
      { id: 'dish-015', sourceName: 'Filetto di Fassona al Barolo', sourceCategory: 'SECONDI', price: 38, description: 'Filetto piemontese con riduzione al Barolo DOCG.', mappedCategory: 'secondo', confidence: 97, status: 'mapped' },
      { id: 'dish-016', sourceName: "Petto d'anatra all'arancia", sourceCategory: 'SECONDI', price: 30, description: 'Anatra francese laccata con salsa agrumata.', mappedCategory: 'secondo', confidence: 95, status: 'mapped', detectedAllergens: ['lattosio'] },
      { id: 'dish-017', sourceName: 'Baccala mantecato su polenta', sourceCategory: 'SECONDI', price: 26, description: 'Baccala norvegese dissalato su polenta croccante.', mappedCategory: 'secondo', confidence: 93, status: 'mapped', detectedAllergens: ['pesce'] },
      { id: 'dish-018', sourceName: 'Branzino al forno in crosta', sourceCategory: 'SECONDI', price: 32, description: 'Branzino selvaggio in crosta di sale con verdure al vapore.', mappedCategory: 'secondo', confidence: 92, status: 'mapped', detectedAllergens: ['pesce'] },
      { id: 'dish-019', sourceName: 'Carre di agnello alle erbe', sourceCategory: 'SECONDI', price: 34, description: 'Agnello del Lazio con crosta di erbe aromatiche.', mappedCategory: 'secondo', confidence: 88, status: 'mapped' },
      { id: 'dish-020', sourceName: 'Tagliata di manzo con rucola', sourceCategory: 'SECONDI', price: 28, description: 'Tagliata di controfiletto con rucola e parmigiano a scaglie.', mappedCategory: 'secondo', confidence: 85, status: 'mapped', detectedAllergens: ['lattosio'] },
      { id: 'dish-021', sourceName: 'Polpo alla piastra con patate', sourceCategory: 'SECONDI', price: 24, description: 'Polpo cotto a bassa temperatura con patate gialle della Sila.', mappedCategory: 'secondo', confidence: 65, status: 'pending', detectedAllergens: ['molluschi'] },
      // DOLCI (4)
      { id: 'dish-022', sourceName: 'Tiramisu della casa', sourceCategory: 'DOLCI', price: 12, description: 'Tiramisu destrutturato con mascarpone e savoiardi artigianali.', mappedCategory: 'dessert', confidence: 97, status: 'mapped', detectedAllergens: ['glutine', 'uova', 'lattosio'] },
      { id: 'dish-023', sourceName: 'Millefoglie alla vaniglia', sourceCategory: 'DOLCI', price: 14, description: 'Millefoglie con crema alla vaniglia Bourbon del Madagascar.', mappedCategory: 'dessert', confidence: 94, status: 'mapped', detectedAllergens: ['glutine', 'uova', 'lattosio'] },
      { id: 'dish-024', sourceName: 'Sfera di cioccolato fondente', sourceCategory: 'DOLCI', price: 13, description: 'Cioccolato 70% Valrhona con cuore di lamponi.', mappedCategory: 'dessert', confidence: 96, status: 'mapped', detectedAllergens: ['lattosio', 'soia'] },
      { id: 'dish-025', sourceName: 'Semifreddo al pistacchio', sourceCategory: 'DOLCI', price: 11, description: 'Semifreddo con pistacchio di Bronte DOP e crumble di mandorle.', mappedCategory: 'dessert', confidence: 62, status: 'skipped', detectedAllergens: ['frutta a guscio', 'lattosio', 'uova'] },
    ],
  },
];
