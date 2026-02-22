import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Pencil, Save, X, Trash2, Plus } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { Breadcrumb, Section } from '../../components/layout';
import { useStore } from '../../store';
import type { Recipe, RecipeIngredient } from '../../types';
import { calculateRecipeCost, calculateMargin, calculateMarginPercentage, formatCurrency } from '../../utils/calculations';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const categories: Recipe['category'][] = ['antipasto', 'primo', 'secondo', 'dessert'];

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipes, products, updateRecipe, deleteRecipe, addRecipe } = useStore();

  const isNew = id === 'new';
  const existing = recipes.find((r) => r.id === id);

  const emptyRecipe: Recipe = {
    id: `recipe-${Date.now()}`,
    name: '',
    category: 'primo',
    active: true,
    sellingPrice: 0,
    ingredients: [],
  };

  const [editing, setEditing] = useState(isNew);
  const [draft, setDraft] = useState<Recipe>(isNew ? emptyRecipe : existing ?? emptyRecipe);
  const [showAddIngredient, setShowAddIngredient] = useState(false);

  if (!isNew && !existing) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Ricetta non trovata</p>
          <Button onClick={() => navigate('/recipes')}>Torna alle Ricette</Button>
        </div>
      </div>
    );
  }

  const recipe = editing ? draft : (existing ?? draft);
  const cost = calculateRecipeCost(recipe, products);
  const margin = calculateMargin(recipe, products);
  const marginPct = recipe.sellingPrice > 0 ? calculateMarginPercentage(recipe, products) : 0;
  const marginColor = marginPct >= 70 ? 'success' : marginPct >= 60 ? 'warning' : 'danger';

  const startEdit = () => {
    setDraft({ ...(existing ?? emptyRecipe) });
    setEditing(true);
  };

  const cancelEdit = () => {
    if (isNew) {
      navigate('/recipes');
      return;
    }
    setEditing(false);
    setDraft(existing ?? emptyRecipe);
    setShowAddIngredient(false);
  };

  const saveEdit = () => {
    if (!draft.name.trim()) return;
    if (isNew) {
      addRecipe(draft);
      navigate(`/recipes/${draft.id}`, { replace: true });
    } else {
      updateRecipe(draft.id, draft);
    }
    setEditing(false);
    setShowAddIngredient(false);
  };

  const handleDelete = () => {
    if (existing) {
      deleteRecipe(existing.id);
    }
    navigate('/recipes');
  };

  const updateIngredient = (idx: number, updates: Partial<RecipeIngredient>) => {
    const newIngs = [...draft.ingredients];
    newIngs[idx] = { ...newIngs[idx], ...updates };
    setDraft({ ...draft, ingredients: newIngs });
  };

  const removeIngredient = (idx: number) => {
    setDraft({ ...draft, ingredients: draft.ingredients.filter((_, i) => i !== idx) });
  };

  const addIngredient = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (draft.ingredients.some((i) => i.productId === productId)) return;
    const unit: RecipeIngredient['unit'] = product.unit === 'kg' ? 'g' : product.unit === 'l' ? 'ml' : 'pz';
    setDraft({
      ...draft,
      ingredients: [...draft.ingredients, { productId: product.id, productName: product.name, quantity: 0, unit }],
    });
    setShowAddIngredient(false);
  };

  // Products not yet in this recipe
  const availableProducts = products.filter(
    (p) => !draft.ingredients.some((i) => i.productId === p.id)
  );

  return (
    <motion.div
      className="min-h-screen bg-gray-50/50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[
            { label: 'Panoramica', href: '/overview' },
            { label: 'Ricette', href: '/recipes' },
            { label: isNew ? 'Nuova Ricetta' : recipe.name },
          ]} />
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/recipes')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Nome del piatto"
                  className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-accent-gold/40 focus:border-accent-gold outline-none w-full pb-1"
                />
                <div className="flex items-center gap-4">
                  <select
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value as Recipe['category'] })}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-gold/30"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Prezzo vendita:</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={draft.sellingPrice || ''}
                        onChange={(e) => setDraft({ ...draft, sellingPrice: parseFloat(e.target.value) || 0 })}
                        className="w-24 pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
                  <Badge variant="info" size="sm">{recipe.category}</Badge>
                  {!recipe.active && <Badge variant="default" size="sm">Disattivato</Badge>}
                </div>
                <p className="text-gray-500 text-sm">Porzione singola — {recipe.ingredients.length} ingredienti</p>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {editing ? (
              <>
                <Button variant="secondary" size="sm" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-1" /> Annulla
                </Button>
                <Button size="sm" onClick={saveEdit} disabled={!draft.name.trim()}>
                  <Save className="w-4 h-4 mr-1" /> Salva
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={startEdit}>
                  <Pencil className="w-4 h-4 mr-1" /> Modifica
                </Button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  title="Elimina ricetta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Cost summary */}
        {!isNew && (
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mb-10">
            <Card className="text-center">
              <p className="text-xs text-gray-500 mb-1">Costo Ingredienti</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(cost)}</p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-gray-500 mb-1">Prezzo di Vendita</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(recipe.sellingPrice)}</p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-gray-500 mb-1">Margine</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(margin)}</p>
              {recipe.sellingPrice > 0 && <Badge variant={marginColor} size="sm" className="mt-1">{marginPct.toFixed(1)}%</Badge>}
            </Card>
          </motion.div>
        )}

        {/* Visual margin bar */}
        {!isNew && recipe.sellingPrice > 0 && (
          <motion.div variants={itemVariants} className="mb-10">
            <Card padding="lg">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Composizione del prezzo</p>
              <div className="relative h-8 rounded-full overflow-hidden bg-gray-100">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gray-300 rounded-l-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - marginPct}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
                <motion.div
                  className={`absolute inset-y-0 right-0 rounded-r-full ${marginPct >= 70 ? 'bg-success/70' : marginPct >= 60 ? 'bg-warning/70' : 'bg-danger/70'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${marginPct}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Costo ingredienti: {(100 - marginPct).toFixed(1)}%</span>
                <span>Margine: {marginPct.toFixed(1)}%</span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Ingredients table */}
        <Section title="Ingredienti">
          <motion.div variants={itemVariants}>
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Prodotto</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Quantita per porzione</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Prezzo Unit.</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Costo</th>
                      {editing && <th className="px-4 py-3 w-10" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recipe.ingredients.map((ing, idx) => {
                      const product = products.find((p) => p.id === ing.productId);
                      const qtyKg = ing.unit === 'g' ? ing.quantity / 1000 : ing.unit === 'ml' ? ing.quantity / 1000 : ing.quantity;
                      const ingCost = product ? qtyKg * product.unitPrice : 0;
                      return (
                        <tr key={ing.productId} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3.5 font-medium text-gray-900">{ing.productName}</td>
                          <td className="px-6 py-3.5 text-right text-gray-600">
                            {editing ? (
                              <div className="flex items-center justify-end gap-2">
                                <input
                                  type="number"
                                  step={ing.unit === 'pz' ? 1 : 5}
                                  min="0"
                                  value={draft.ingredients[idx]?.quantity || ''}
                                  onChange={(e) => updateIngredient(idx, { quantity: parseFloat(e.target.value) || 0 })}
                                  className="w-20 text-right px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold/30 text-sm"
                                />
                                <span className="text-xs text-gray-400 w-6">{ing.unit}</span>
                              </div>
                            ) : (
                              <>{ing.quantity}{ing.unit}</>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-right text-gray-600">
                            {product ? `${formatCurrency(product.unitPrice)}/${product.unit}` : '-'}
                          </td>
                          <td className="px-6 py-3.5 text-right font-medium text-gray-900">{formatCurrency(ingCost)}</td>
                          {editing && (
                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => removeIngredient(idx)}
                                className="p-1 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {recipe.ingredients.length === 0 && (
                      <tr>
                        <td colSpan={editing ? 5 : 4} className="px-6 py-8 text-center text-gray-400">
                          Nessun ingrediente. {editing && 'Clicca "Aggiungi Ingrediente" per iniziare.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {recipe.ingredients.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-gray-200">
                        <td colSpan={editing ? 4 : 3} className="px-6 py-3 text-right font-semibold text-gray-900">Totale</td>
                        <td className={`px-6 py-3 text-right font-bold text-gray-900 ${editing ? '' : ''}`}>{formatCurrency(cost)}</td>
                        {editing && <td />}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Add ingredient */}
              {editing && (
                <div className="border-t border-gray-100 px-6 py-4">
                  {showAddIngredient ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Seleziona prodotto dal magazzino</p>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {availableProducts.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => addIngredient(p.id)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent-gold/5 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>{p.name}</span>
                            <span className="text-xs text-gray-400">{formatCurrency(p.unitPrice)}/{p.unit}</span>
                          </button>
                        ))}
                        {availableProducts.length === 0 && (
                          <p className="text-sm text-gray-400 py-2">Tutti i prodotti sono gia stati aggiunti</p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowAddIngredient(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        Chiudi
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddIngredient(true)}
                      className="flex items-center gap-2 text-sm text-accent-gold hover:text-accent-gold-dark font-medium cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Aggiungi Ingrediente
                    </button>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </Section>

        {/* Info box */}
        {!editing && (
          <motion.div variants={itemVariants}>
            <Card className="bg-gray-900 text-white border-gray-800 mt-8" padding="lg">
              <h3 className="font-semibold mb-2 text-sm">Come funziona il calcolo</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Il costo della porzione viene calcolato moltiplicando la quantita di ogni ingrediente per il prezzo unitario
                registrato tramite lo scanner. Quando il prezzo di un ingrediente cambia (nuova consegna dal fornitore),
                il costo del piatto si aggiorna automaticamente.
              </p>
            </Card>
          </motion.div>
        )}

        {/* EE Partners branding */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-8 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );
}
