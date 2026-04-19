import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat, Send, Calculator, ShieldAlert, RefreshCw, Flame, Sparkles, Clock,
} from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { formatWeight } from '../../utils/calculations';
import type { Recipe, RecipeTechCard, RecipeIngredient } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  time: string;
  recipeId?: string;
}

type Intent =
  | 'composizione'
  | 'dosi'
  | 'tempo'
  | 'plating'
  | 'allergeni'
  | 'procedura'
  | 'default';

const stationLabel: Record<RecipeTechCard['station'], string> = {
  freddo: 'Freddo',
  caldo: 'Caldo',
  pasta: 'Pasta',
  grill: 'Grill',
  pasticceria: 'Pasticceria',
};

const difficultyBadgeVariant: Record<RecipeTechCard['difficulty'], 'success' | 'warning' | 'danger'> = {
  facile: 'success',
  media: 'warning',
  difficile: 'danger',
};

const quickActions = [
  'Composizione Cacio e Pepe',
  'Dosi tiramisu per 12 persone',
  'Tempo di cottura Risotto allo zafferano',
  'Allergeni Burrata',
  'Plating Sfera di cioccolato',
];

function nowHHMM(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'da', 'del', 'della', 'dei', 'delle',
  'dal', 'dalla', 'in', 'su', 'con', 'per', 'tra', 'fra', 'al', 'alla', 'ai', 'alle',
  'e', 'ed', 'o', 'che', 'cui', 'si', 'mi', 'ti', 'ci', 'vi',
  'composizione', 'composto', 'composta', 'ingredienti', 'ingrediente',
  'dosi', 'dose', 'quantita', 'quantitativo',
  'tempo', 'tempi', 'cottura', 'cuoce', 'cuociono', 'minuti',
  'plating', 'impiattamento', 'impiattare',
  'allergeni', 'allergene',
  'procedura', 'procedimento', 'come',
  'persone', 'persona', 'coperti', 'coperto', 'porzione', 'porzioni', 'piatto', 'piatti',
]);

function detectIntent(q: string): Intent {
  if (/\b(composizione|composto|composta|ingredient)\b/.test(q)) return 'composizione';
  if (/\b(dosi|dose|quantit|porzion)\b/.test(q)) return 'dosi';
  if (/\b(tempo|tempi|cottura|cuoce|cuocion|minut)\b/.test(q)) return 'tempo';
  if (/\b(plating|impiattament|impiattar)\b/.test(q)) return 'plating';
  if (/\b(allergen)\b/.test(q)) return 'allergeni';
  if (/\b(procedura|procediment|come si fa|come si prepar|step|passagg)\b/.test(q)) return 'procedura';
  return 'default';
}

function detectMultiplier(q: string): number | undefined {
  const m = q.match(/per\s+(\d+)\s+person/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n > 0 && n < 100) return n;
  }
  const m2 = q.match(/x\s*(\d+)/);
  if (m2) {
    const n = parseInt(m2[1], 10);
    if (n > 0 && n < 100) return n;
  }
  return undefined;
}

function scoreRecipe(q: string, recipe: Recipe): number {
  const rNorm = normalize(recipe.name);
  if (!q) return 0;
  let score = 0;
  if (rNorm && q.includes(rNorm)) score += 6;
  const rTokens = rNorm.split(' ').filter((t) => t.length > 2 && !STOP_WORDS.has(t));
  const qTokens = q.split(' ').filter((t) => t.length > 2 && !STOP_WORDS.has(t));
  for (const token of rTokens) {
    if (q.includes(token)) score += 3;
  }
  for (const qt of qTokens) {
    if (rNorm.includes(qt)) score += 1;
  }
  return score;
}

function formatIngredientLine(ing: RecipeIngredient, multiplier: number): string {
  const qty = ing.quantity * multiplier;
  if (ing.unit === 'g') {
    const kg = qty / 1000;
    const pretty = kg < 1 ? `${qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(1)}g` : formatWeight(kg);
    return `${ing.productName} — ${pretty}`;
  }
  if (ing.unit === 'ml') {
    const pretty = qty < 1000 ? `${qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(1)}ml` : `${(qty / 1000).toFixed(2)}l`;
    return `${ing.productName} — ${pretty}`;
  }
  const unit = qty === 1 ? 'pz' : 'pz';
  return `${ing.productName} — ${qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(1)} ${unit}`;
}

function buildReply(
  query: string,
  recipe: Recipe,
  card: RecipeTechCard,
  intent: Intent,
  multiplier: number | undefined,
): string {
  const effectiveMult = multiplier ?? 1;

  if (intent === 'composizione') {
    const lines = recipe.ingredients.map((i) => `  - ${formatIngredientLine(i, effectiveMult)}`).join('\n');
    const scaleNote = effectiveMult === 1 ? '' : ` (scalato x${effectiveMult})`;
    return `${recipe.name}${scaleNote}:\n${lines}\n\nStazione: ${stationLabel[card.station]} · Tempo: ${card.cookingTimeMinutes} min · Difficolta: ${card.difficulty}.`;
  }

  if (intent === 'dosi') {
    const lines = recipe.ingredients.map((i) => `  - ${formatIngredientLine(i, effectiveMult)}`).join('\n');
    const title = effectiveMult === 1
      ? `Dosi standard (1 porzione) per ${recipe.name}:`
      : `Dosi riscalate x${effectiveMult} per ${recipe.name}:`;
    return `${title}\n${lines}`;
  }

  if (intent === 'tempo') {
    return `${recipe.name} richiede ${card.cookingTimeMinutes} minuti totali, difficolta ${card.difficulty} sulla stazione ${stationLabel[card.station]}. ${card.chefNotes ? `Nota dello chef: ${card.chefNotes}` : ''}`.trim();
  }

  if (intent === 'plating') {
    return `Plating per ${recipe.name}:\n${card.platingDescription}`;
  }

  if (intent === 'allergeni') {
    const allergens = card.allergeni.length
      ? card.allergeni.map((a) => `  - ${a}`).join('\n')
      : '  - nessun allergene dichiarato';
    return `Allergeni in ${recipe.name}:\n${allergens}`;
  }

  if (intent === 'procedura') {
    const steps = card.procedure.map((s, i) => `  ${i + 1}. ${s}`).join('\n');
    return `Procedura ${recipe.name}:\n${steps}`;
  }

  // default: summary
  const ingList = recipe.ingredients
    .slice(0, 4)
    .map((i) => formatIngredientLine(i, effectiveMult))
    .join(' · ');
  return `${recipe.name} — stazione ${stationLabel[card.station]}, ${card.cookingTimeMinutes} min, ${card.difficulty}.\nComposizione base: ${ingList}${recipe.ingredients.length > 4 ? ' · …' : ''}\nChiedimi \"composizione\", \"dosi\", \"plating\", \"allergeni\" o \"procedura\" per il dettaglio. (query: ${query.trim() || '—'})`;
}

interface RespondResult {
  text: string;
  recipeId?: string;
  multiplier?: number;
}

function respond(query: string, recipes: Recipe[], cards: RecipeTechCard[]): RespondResult {
  const norm = normalize(query);
  const intent = detectIntent(norm);
  const multiplier = detectMultiplier(norm);

  const scored = recipes
    .map((r) => ({ recipe: r, score: scoreRecipe(norm, r) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      text: 'Non ho trovato una ricetta corrispondente. Prova: Tartare di tonno, Burrata, Cacio e Pepe, Risotto allo zafferano, Filetto al Barolo, Tiramisu, Sfera di cioccolato.',
    };
  }

  const best = scored[0].recipe;
  const card = cards.find((c) => c.recipeId === best.id);
  if (!card) {
    return {
      text: `Ho trovato ${best.name} ma la scheda tecnica non e indicizzata. Controlla il ricettario.`,
      recipeId: best.id,
      multiplier,
    };
  }

  return {
    text: buildReply(query, best, card, intent, multiplier),
    recipeId: best.id,
    multiplier,
  };
}

const featureCallouts = [
  {
    icon: Calculator,
    title: 'Dosi scalabili istantanee',
    description: 'Ogni ricetta si adatta al numero di coperti con un comando. Riduzioni e aumenti senza calcolatrice.',
  },
  {
    icon: ShieldAlert,
    title: 'Allergeni sempre aggiornati',
    description: 'Risposta diretta sugli allergeni certificati per ogni piatto. Nessun dubbio in partenza servizio.',
  },
  {
    icon: ChefHat,
    title: 'Tecnica + plating memorizzati',
    description: 'Procedure, tempi di cottura, note dello chef e descrizione del plating sempre a portata di brigata.',
  },
  {
    icon: RefreshCw,
    title: 'Sincronizzato col ricettario attivo',
    description: 'La memoria vive sul ricettario EasyRest. Cambi una scheda, l assistente sa la versione nuova.',
  },
];

export function KitchenAssistantPage() {
  const recipes = useStore((s) => s.recipes);
  const recipeCards = useStore((s) => s.recipeCards);

  const initialMessage: ChatMessage = useMemo(
    () => ({
      role: 'assistant',
      content: 'Pronto. Chiedimi qualsiasi cosa sul ricettario: composizione, dosi, tempo di cottura, plating, allergeni. Posso riscalare le dosi a piacere.',
      time: nowHHMM(),
    }),
    [],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [focusedRecipeId, setFocusedRecipeId] = useState<string | null>(null);
  const [focusedMultiplier, setFocusedMultiplier] = useState<number>(1);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const thinkingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current !== null) window.clearTimeout(thinkingTimerRef.current);
    };
  }, []);

  const focusedRecipe = focusedRecipeId ? recipes.find((r) => r.id === focusedRecipeId) : undefined;
  const focusedCard = focusedRecipeId ? recipeCards.find((c) => c.recipeId === focusedRecipeId) : undefined;

  const submitQuery = (text?: string) => {
    const raw = (text ?? input).trim();
    if (!raw || thinking) return;

    const userMsg: ChatMessage = { role: 'user', content: raw, time: nowHHMM() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    const delay = 600 + Math.floor(Math.random() * 300);
    thinkingTimerRef.current = window.setTimeout(() => {
      const result = respond(raw, recipes, recipeCards);
      const asstMsg: ChatMessage = {
        role: 'assistant',
        content: result.text,
        time: nowHHMM(),
        recipeId: result.recipeId,
      };
      setMessages((prev) => [...prev, asstMsg]);
      if (result.recipeId) {
        setFocusedRecipeId(result.recipeId);
        setFocusedMultiplier(result.multiplier ?? 1);
      }
      setThinking(false);
      inputRef.current?.focus();
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery();
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50/50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb
            items={[
              { label: 'Panoramica', href: '/overview' },
              { label: 'Assistente AI Cucina' },
            ]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader
            badge={<Badge variant="gold">Solo personale di cucina</Badge>}
            title="Assistente AI Cucina"
            subtitle="La memoria del tuo brigata. Chiedi dosi, procedure, tempi di cottura, plating. Risposte immediate, ricettario sempre sincronizzato."
          />
        </motion.div>

        {/* Split layout */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-16"
        >
          {/* LEFT - Chat card */}
          <div className="bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
            {/* Header bar */}
            <div className="bg-gray-900 px-5 py-4 flex items-center gap-3 border-b border-gray-800">
              <motion.div
                className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center shrink-0"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <ChefHat className="w-5 h-5 text-accent-gold" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold tracking-tight">
                  EasyRest · Ricettario Vivo
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-gray-400 text-xs">
                    Online · {recipeCards.length} ricette indicizzate
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                <Sparkles className="w-3 h-3 text-accent-gold" />
                <span>Local</span>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="h-[520px] overflow-y-auto bg-gray-950 p-4 flex flex-col gap-3"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex flex-col gap-1 max-w-[85%] ${
                      m.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={
                        m.role === 'user'
                          ? 'text-gray-900 bg-accent-gold rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm'
                          : 'bg-accent-gold/10 text-gray-100 border border-accent-gold/20 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap'
                      }
                    >
                      {m.content}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono px-1">{m.time}</span>
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {thinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex justify-start"
                  >
                    <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick actions */}
            {messages.length <= 2 && (
              <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/60 flex flex-wrap gap-2">
                {quickActions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => submitQuery(q)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 hover:bg-accent-gold/20 hover:text-accent-gold hover:border-accent-gold/30 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className="px-4 py-3 bg-gray-900 border-t border-gray-800">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Chiedi al ricettario..."
                  disabled={thinking}
                  className="flex-1 bg-gray-800 rounded-full px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-accent-gold/40 border border-gray-700 transition-shadow disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={thinking || !input.trim()}
                  className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center hover:bg-accent-gold-dark transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-4 h-4 text-gray-900" />
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT - Ricetta in focus */}
          <Card padding="lg" className="h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500">Ricetta in focus</h3>
              {focusedMultiplier !== 1 && focusedRecipe && (
                <Badge variant="gold" size="sm">Scalata x{focusedMultiplier}</Badge>
              )}
            </div>

            {focusedRecipe && focusedCard ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-[120px] h-[120px] rounded-2xl ring-2 ring-accent-gold/30 shadow-sm shrink-0"
                    style={{ background: focusedCard.platingVisual, transform: 'rotate(3deg)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold tracking-tight text-gray-900 leading-tight">
                      {focusedRecipe.name}
                    </h4>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge variant="default" size="sm">{focusedRecipe.category}</Badge>
                      <Badge variant="info" size="sm">{stationLabel[focusedCard.station]}</Badge>
                    </div>
                  </div>
                </div>

                {/* Cooking time + difficulty */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-gold" />
                    <span className="text-2xl font-bold text-gray-900 tabular-nums">
                      <CountingTime minutes={focusedCard.cookingTimeMinutes} />
                    </span>
                  </div>
                  <div className="h-6 w-px bg-gray-300" />
                  <Badge variant={difficultyBadgeVariant[focusedCard.difficulty]} size="sm">
                    <Flame className="w-3 h-3 mr-1" />
                    {focusedCard.difficulty}
                  </Badge>
                </div>

                {/* Procedure */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Procedura</p>
                  <ol className="space-y-2">
                    {focusedCard.procedure.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-accent-gold/20 text-accent-gold text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Ingredients table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                      Ingredienti {focusedMultiplier !== 1 ? `(x${focusedMultiplier})` : '(per porzione)'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {focusedRecipe.ingredients.map((ing, idx) => {
                          const qty = ing.quantity * focusedMultiplier;
                          const qtyStr = qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(2);
                          return (
                            <tr
                              key={idx}
                              className={`${idx !== 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}
                            >
                              <td className="px-3 py-2 font-mono text-xs text-gray-900 tabular-nums text-right w-20">
                                {qtyStr}
                              </td>
                              <td className="px-2 py-2 text-xs text-gray-500 w-10">
                                {ing.unit}
                              </td>
                              <td className="px-3 py-2 text-gray-700">{ing.productName}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Allergeni */}
                {focusedCard.allergeni.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Allergeni</p>
                    <div className="flex flex-wrap gap-1.5">
                      {focusedCard.allergeni.map((a) => (
                        <Badge key={a} variant="warning" size="sm">
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chef notes */}
                {focusedCard.chefNotes && (
                  <blockquote className="border-l-4 border-accent-gold bg-accent-gold/5 px-4 py-3 italic text-sm text-gray-700 rounded-r-xl">
                    {focusedCard.chefNotes}
                  </blockquote>
                )}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-accent-gold/10 flex items-center justify-center mb-3">
                  <ChefHat className="w-7 h-7 text-accent-gold" />
                </div>
                <p className="text-sm font-medium text-gray-700">Chiedimi qualcosa per iniziare.</p>
                <p className="text-xs text-gray-500 mt-1 max-w-[220px]">
                  La scheda tecnica della ricetta comparira qui con procedura, dosi e allergeni.
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick catalog */}
        <Section title="Ricettario attivo" subtitle="Tocca una ricetta per interrogare l assistente.">
          <motion.div variants={itemVariants}>
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin">
              {recipes.map((r) => {
                const card = recipeCards.find((c) => c.recipeId === r.id);
                if (!card) return null;
                const active = focusedRecipeId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => submitQuery(`Composizione di ${r.name}`)}
                    className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-full border transition-all cursor-pointer ${
                      active
                        ? 'bg-accent-gold/10 border-accent-gold/40 text-gray-900'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-accent-gold/40 hover:bg-accent-gold/5'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-lg shrink-0"
                      style={{ background: card.platingVisual }}
                    />
                    <span className="text-sm font-medium whitespace-nowrap">{r.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 border-l border-gray-200 pl-2">
                      {stationLabel[card.station]}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </Section>

        {/* Feature callouts */}
        <Section title="Perche lo chef la ama">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featureCallouts.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Card padding="md" className="h-full">
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center mb-3">
                    <f.icon className="w-5 h-5 text-accent-gold" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* EE Partners branding */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-3 pt-8 pb-4"
        >
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Small presentational counter for cooking time (keeps CountUp import chain tidy).
function CountingTime({ minutes }: { minutes: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    setVal(0);
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(minutes * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [minutes]);
  return <span>{val} min</span>;
}
