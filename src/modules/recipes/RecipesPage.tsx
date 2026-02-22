import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { Card, Badge } from '../../components/ui';
import { Breadcrumb, PageHeader } from '../../components/layout';
import { useStore } from '../../store';
import { useTutorial } from '../../components/Tutorial';
import { calculateRecipeCost, calculateMarginPercentage, formatCurrency } from '../../utils/calculations';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const categories = ['Tutti', 'Antipasto', 'Primo', 'Secondo', 'Dessert'];

const tutorialSteps = [
  { title: 'Il Ricettario Digitale', description: 'L\'utente inserisce ogni piatto del menu con la lista completa degli ingredienti e le quantita esatte per porzione singola. Puoi aggiungere nuove ricette, modificare le quantita e gestire il menu in autonomia.' },
  { title: 'Calcolo Automatico dei Costi', description: 'Il costo di ogni piatto viene calcolato automaticamente sulla base dei prezzi dei fornitori registrati tramite lo scanner. Quando il prezzo di un ingrediente cambia con una nuova consegna, il costo del piatto si aggiorna in tempo reale.' },
  { title: 'Margine Operativo', description: 'Per ogni piatto il sistema calcola il margine operativo: la differenza tra il prezzo di vendita e il costo degli ingredienti. Un margine sano per la ristorazione e sopra il 65%.' },
  { title: 'Filtri e Ricerca', description: 'Puoi filtrare i piatti per categoria (antipasti, primi, secondi, dessert) e cercare per nome. Lo switch permette di attivare o disattivare un piatto dal menu.' },
];

export function RecipesPage() {
  const navigate = useNavigate();
  const { recipes, products, toggleRecipeActive } = useStore();
  const tutorial = useTutorial();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tutti');

  const filtered = recipes.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'Tutti' && r.category !== category.toLowerCase()) return false;
    return true;
  });

  return (
    <motion.div
      className="min-h-screen bg-gray-50/50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'Ricette' }]} />
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <PageHeader
            title="Gestione Ricette e Costi"
            subtitle="L'utente inserisce ogni piatto del menu con gli ingredienti e le quantita esatte per porzione. Il sistema calcola automaticamente il costo sulla base dei prezzi registrati dallo scanner e aggiorna tutto in tempo reale."
          />
          <div className="flex items-center gap-2 shrink-0 mt-2">
            <button
              onClick={() => navigate('/recipes/new')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-gold text-primary-black text-sm font-semibold hover:bg-accent-gold-dark transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nuova Ricetta
            </button>
            <button
              onClick={() => tutorial?.startTutorial(tutorialSteps)}
              className="px-4 py-2 rounded-xl bg-accent-gold/10 text-accent-gold text-sm font-medium hover:bg-accent-gold/20 transition-colors cursor-pointer"
            >
              Come Funziona
            </button>
          </div>
        </motion.div>

        {/* How cost calculation works */}
        <motion.div variants={itemVariants} className="mb-10">
          <Card padding="none" className="overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 text-center mb-6">Come funziona il calcolo</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 max-w-2xl mx-auto">
                {[
                  { label: 'Tu inserisci', desc: 'Ricetta e quantita per porzione' },
                  { label: 'Lo scanner', desc: 'Registra i prezzi fornitori' },
                  { label: 'Il sistema', desc: 'Calcola il costo per piatto' },
                  { label: 'Il margine', desc: 'Prezzo vendita - costo' },
                ].map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                    className="text-center flex-1"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center mx-auto mb-2">
                      <span className="text-accent-gold font-bold text-sm">{i + 1}</span>
                    </div>
                    <p className="text-white text-xs font-semibold">{step.label}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca ricetta..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold"
            />
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recipe grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((recipe) => {
            const cost = calculateRecipeCost(recipe, products);
            const margin = calculateMarginPercentage(recipe, products);
            const marginColor = margin >= 70 ? 'success' : margin >= 60 ? 'warning' : 'danger';

            return (
              <motion.div key={recipe.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card
                  hoverable
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                  className={`h-full cursor-pointer ${!recipe.active ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="info" size="sm">{recipe.category}</Badge>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleRecipeActive(recipe.id); }}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${recipe.active ? 'bg-success' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${recipe.active ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{recipe.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{recipe.ingredients.length} ingredienti</p>

                  <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Costo</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(cost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Prezzo</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(recipe.sellingPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Margine</p>
                      <Badge variant={marginColor} size="sm">{margin.toFixed(1)}%</Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* EE Partners branding */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-8 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );
}
