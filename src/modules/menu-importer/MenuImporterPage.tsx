import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, Check, Loader2, Sparkles, Upload, Phone,
  ArrowRight, CheckCircle2, Circle, X, Database, Zap,
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { formatCurrency } from '../../utils/calculations';
import type { ImportPlatform, ImportedDish, MenuImportSession } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

type Phase = 'idle' | 'connecting' | 'reading' | 'extracting' | 'mapping' | 'done';

type MappedCategory = 'antipasto' | 'primo' | 'secondo' | 'dessert';
type CategoryFilter = 'Tutti' | 'Antipasti' | 'Primi' | 'Secondi' | 'Dolci';
type SortKey = 'prezzo' | 'confidenza' | 'nome';

interface PlatformChip {
  id: ImportPlatform;
  label: string;
  accent: string;        // background + text when active
  ring: string;          // ring color when active
  mutedAccent: string;   // subdued look
}

const PLATFORMS: PlatformChip[] = [
  { id: 'pienissimo', label: 'Pienissimo', accent: 'bg-success/10 text-success border-success/40', ring: 'ring-success/30', mutedAccent: 'text-success/70 border-success/20' },
  { id: 'leggimenu', label: 'Leggimenu', accent: 'bg-warning/10 text-warning border-warning/40', ring: 'ring-warning/30', mutedAccent: 'text-warning/70 border-warning/20' },
  { id: 'tomato', label: 'Tomato', accent: 'bg-danger/10 text-danger border-danger/40', ring: 'ring-danger/30', mutedAccent: 'text-danger/70 border-danger/20' },
  { id: 'superb', label: 'Superb', accent: 'bg-violet-100 text-violet-700 border-violet-300', ring: 'ring-violet-300', mutedAccent: 'text-violet-500/70 border-violet-200' },
  { id: 'custom', label: 'Custom', accent: 'bg-gray-100 text-gray-800 border-gray-400', ring: 'ring-gray-300', mutedAccent: 'text-gray-500 border-gray-200' },
];

const EXAMPLE_URLS: { label: string; url: string; platform: ImportPlatform }[] = [
  { label: 'Pienissimo', url: 'https://pienissimo.it/ristorante-del-borgo/menu', platform: 'pienissimo' },
  { label: 'Leggimenu', url: 'https://leggimenu.com/osteria-milano', platform: 'leggimenu' },
  { label: 'Tomato', url: 'https://tomato.app/r/trattoria-del-mare', platform: 'tomato' },
];

const MAPPED_CATEGORY_LABEL: Record<MappedCategory, string> = {
  antipasto: 'Antipasto',
  primo: 'Primo',
  secondo: 'Secondo',
  dessert: 'Dessert',
};

const CATEGORY_FILTER_MATCH: Record<Exclude<CategoryFilter, 'Tutti'>, MappedCategory> = {
  Antipasti: 'antipasto',
  Primi: 'primo',
  Secondi: 'secondo',
  Dolci: 'dessert',
};

const FALLBACK_SESSION: MenuImportSession = {
  id: 'import-fallback',
  sourceUrl: 'https://pienissimo.it/demo/menu',
  sourcePlatform: 'pienissimo',
  sourceRestaurantName: 'Trattoria Demo',
  scrapedAt: '2026-02-22T10:00:00Z',
  dishCount: 3,
  mappingComplete: 90,
  dishes: [
    { id: 'fb-1', sourceName: 'Tagliatelle al ragu', sourceCategory: 'PRIMI', price: 14, description: 'Tagliatelle fresche con ragu bolognese.', mappedCategory: 'primo', confidence: 96, status: 'mapped', detectedAllergens: ['glutine', 'uova'] },
    { id: 'fb-2', sourceName: 'Tartare di fassona', sourceCategory: 'ANTIPASTI', price: 18, description: 'Fassona piemontese battuta al coltello.', mappedCategory: 'antipasto', confidence: 92, status: 'mapped' },
    { id: 'fb-3', sourceName: 'Panna cotta', sourceCategory: 'DOLCI', price: 8, description: 'Panna cotta ai frutti di bosco.', mappedCategory: 'dessert', confidence: 78, status: 'pending', detectedAllergens: ['lattosio'] },
  ],
};

function detectPlatform(url: string): ImportPlatform {
  return /pienissimo/i.test(url) ? 'pienissimo'
    : /leggimenu/i.test(url) ? 'leggimenu'
    : /tomato/i.test(url) ? 'tomato'
    : /superb/i.test(url) ? 'superb'
    : 'custom';
}

function confidenceVariant(c: number): 'success' | 'warning' | 'danger' {
  if (c >= 80) return 'success';
  if (c >= 60) return 'warning';
  return 'danger';
}

function statusVariant(s: ImportedDish['status']): 'success' | 'warning' | 'default' {
  if (s === 'mapped' || s === 'imported') return 'success';
  if (s === 'pending') return 'warning';
  return 'default';
}

function statusLabel(s: ImportedDish['status']): string {
  if (s === 'mapped') return 'Mappato';
  if (s === 'imported') return 'Importato';
  if (s === 'pending') return 'Da rivedere';
  return 'Ignorato';
}

const PHASE_ORDER: Phase[] = ['connecting', 'reading', 'extracting', 'mapping', 'done'];

const PHASE_DURATIONS: Record<Exclude<Phase, 'idle' | 'done'>, number> = {
  connecting: 800,
  reading: 1000,
  extracting: 1400,
  mapping: 1000,
};

export function MenuImporterPage() {
  const menuImports = useStore((s) => s.menuImports);
  const session: MenuImportSession = menuImports[0] ?? FALLBACK_SESSION;

  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [extractCount, setExtractCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Tutti');
  const [sortKey, setSortKey] = useState<SortKey>('confidenza');
  const [showToast, setShowToast] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [mappedOverrides, setMappedOverrides] = useState<Record<string, MappedCategory>>({});

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const platform = detectPlatform(url);
  const platformLabel = PLATFORMS.find((p) => p.id === platform)?.label ?? 'Custom';

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const clearTimers = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startImport = () => {
    if (!url.trim()) return;
    clearTimers();
    setSelectedIds(new Set());
    setExtractCount(0);
    setPhase('connecting');

    const t1 = setTimeout(() => setPhase('reading'), PHASE_DURATIONS.connecting);
    const t2 = setTimeout(() => {
      setPhase('extracting');
      const target = session.dishCount;
      let k = 0;
      const step = Math.max(30, Math.floor(PHASE_DURATIONS.extracting / target));
      intervalRef.current = setInterval(() => {
        k += 1;
        setExtractCount(Math.min(k, target));
        if (k >= target && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, step);
    }, PHASE_DURATIONS.connecting + PHASE_DURATIONS.reading);
    const t3 = setTimeout(
      () => setPhase('mapping'),
      PHASE_DURATIONS.connecting + PHASE_DURATIONS.reading + PHASE_DURATIONS.extracting,
    );
    const t4 = setTimeout(() => {
      setPhase('done');
      setSelectedIds(new Set(session.dishes.filter((d) => d.status === 'mapped').map((d) => d.id)));
    }, PHASE_DURATIONS.connecting + PHASE_DURATIONS.reading + PHASE_DURATIONS.extracting + PHASE_DURATIONS.mapping);

    timeoutsRef.current = [t1, t2, t3, t4];
  };

  const dishes = session.dishes;

  const filteredSortedDishes = useMemo(() => {
    let list = dishes.slice();
    if (categoryFilter !== 'Tutti') {
      const target = CATEGORY_FILTER_MATCH[categoryFilter];
      list = list.filter((d) => {
        const effective = mappedOverrides[d.id] ?? d.mappedCategory;
        return effective === target;
      });
    }
    list.sort((a, b) => {
      if (sortKey === 'prezzo') return b.price - a.price;
      if (sortKey === 'nome') return a.sourceName.localeCompare(b.sourceName, 'it');
      return b.confidence - a.confidence;
    });
    return list;
  }, [dishes, categoryFilter, sortKey, mappedOverrides]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filteredSortedDishes.map((d) => d.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const handleImport = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2500);
  };

  const setMappedFor = (id: string, cat: MappedCategory) => {
    setMappedOverrides((prev) => ({ ...prev, [id]: cat }));
  };

  const progressPct = useMemo(() => {
    if (phase === 'idle') return 0;
    if (phase === 'done') return 100;
    const phaseIndex = PHASE_ORDER.indexOf(phase);
    const phasesForProgress = 4;
    return Math.round(((phaseIndex + 1) / phasesForProgress) * 100);
  }, [phase]);

  return (
    <motion.div
      className="min-h-screen bg-gray-50/50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'Importazione Menu' }]} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader
            title="Universal Menu Importer"
            subtitle="Incolla l'URL del tuo menu attuale — Pienissimo, Leggimenu, Tomato o un sito custom. In 30 secondi il menu e' pronto in EasyRest. Alternativa: data-entry chiavi in mano dal nostro team."
            badge={<Badge variant="gold">Onboarding 0 &rarr; 1</Badge>}
          />
        </motion.div>

        {/* Platform ribbon */}
        <motion.div variants={itemVariants} className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">Piattaforme supportate</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const active = platform === p.id;
              return (
                <motion.div
                  key={p.id}
                  animate={{ opacity: active ? 1 : 0.4 }}
                  transition={{ duration: 0.3 }}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium ${active ? p.accent : p.mutedAccent} ${active ? `ring-2 ${p.ring}` : ''}`}
                >
                  <span>{p.label}</span>
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex w-4 h-4 rounded-full bg-accent-gold text-primary-black items-center justify-center"
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* URL input hero */}
        <motion.div variants={itemVariants} className="mb-6">
          <Card padding="lg" className="bg-gradient-to-br from-white via-white to-accent-gold/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Passo 1 &middot; Incolla URL</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') startImport(); }}
                  placeholder="https://..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold"
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={startImport}
                className="whitespace-nowrap"
              >
                {phase === 'idle' || phase === 'done' ? 'Importa menu' : 'Importazione...'}
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 mr-1">Prova con:</span>
              {EXAMPLE_URLS.map((ex) => (
                <button
                  key={ex.url}
                  onClick={() => setUrl(ex.url)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-accent-gold hover:text-gray-900 transition-colors cursor-pointer"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Manual data-entry toggle */}
        <motion.div variants={itemVariants} className="mb-10">
          <Card padding="md">
            <button
              onClick={() => setShowManual((s) => !s)}
              className="w-full flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative ${showManual ? 'bg-accent-gold' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showManual ? 'left-5' : 'left-0.5'}`} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Oppure richiedi data-entry chiavi in mano</p>
                  <p className="text-xs text-gray-500">Il nostro team digitalizza menu cartacei o foto per te.</p>
                </div>
              </div>
              <span className="text-xs text-accent-gold font-medium">{showManual ? 'Nascondi' : 'Scopri'}</span>
            </button>
            <AnimatePresence initial={false}>
              {showManual && (
                <motion.div
                  key="manual"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 pt-5 border-t border-gray-100 grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-4">
                        Il nostro team digitalizza il tuo menu cartaceo o foto in 48h. Incluso in fase di prevendita.
                      </p>
                      <ul className="space-y-2">
                        {['Upload foto o PDF', 'Data-entry da operatore EE', 'Mapping categorie e allergeni', 'Consegna entro 48h'].map((step, i) => (
                          <li key={step} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="w-5 h-5 rounded-full bg-accent-gold/10 text-accent-gold text-[10px] font-semibold flex items-center justify-center">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Nome e cognome"
                          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/30"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/30"
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="Telefono"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/30"
                      />
                      <label className="flex items-center gap-3 px-3 py-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500 cursor-pointer hover:border-accent-gold/60 transition-colors">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span>Carica foto menu (JPG, PNG, PDF)</span>
                        <input type="file" className="hidden" />
                      </label>
                      <Button variant="ghost" size="sm" className="w-full justify-center">
                        <span className="inline-flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Richiedi chiamata</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Import flow */}
        <AnimatePresence>
          {phase !== 'idle' && phase !== 'done' && (
            <motion.div
              key="flow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="mb-10"
            >
              <Card padding="lg" className="bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-accent-gold animate-spin" />
                    <p className="text-sm font-semibold tracking-wide">Importazione in corso</p>
                  </div>
                  <span className="text-xs text-gray-400 uppercase tracking-[0.2em]">{platformLabel}</span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-6">
                  <motion.div
                    className="h-full bg-accent-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </div>

                {/* Phase pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {(['connecting', 'reading', 'extracting', 'mapping'] as const).map((p, i) => {
                    const currentIndex = PHASE_ORDER.indexOf(phase);
                    const pIndex = PHASE_ORDER.indexOf(p);
                    const completed = currentIndex > pIndex;
                    const active = phase === p;
                    const labels: Record<typeof p, string> = {
                      connecting: 'Connessione',
                      reading: 'Lettura',
                      extracting: 'Estrazione',
                      mapping: 'Mapping',
                    };
                    return (
                      <motion.div
                        key={p}
                        initial={{ opacity: 0.4 }}
                        animate={{ opacity: active || completed ? 1 : 0.4 }}
                        transition={{ duration: 0.25 }}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${active ? 'border-accent-gold bg-accent-gold/10' : completed ? 'border-success/40 bg-success/5' : 'border-white/10 bg-white/5'}`}
                      >
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : active ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}>
                            <Loader2 className="w-4 h-4 text-accent-gold" />
                          </motion.div>
                        ) : (
                          <Circle className="w-4 h-4 text-gray-500" />
                        )}
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400">Fase {i + 1}</p>
                          <p className="font-semibold text-white">{labels[p]}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Phase copy */}
                <div className="min-h-[2.5rem]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={phase}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="text-sm text-gray-300"
                    >
                      {phase === 'connecting' && `Connessione a ${platformLabel}...`}
                      {phase === 'reading' && 'Lettura struttura pagina...'}
                      {phase === 'extracting' && `Estrazione piatti: ${extractCount}`}
                      {phase === 'mapping' && 'Mapping categorie EasyRest...'}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results panel */}
        <AnimatePresence>
          {phase === 'done' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Section
                title={`${session.dishCount} piatti importati da ${session.sourceRestaurantName}`}
                subtitle={`${session.mappingComplete}% mappati automaticamente nelle categorie EasyRest.`}
              >
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="flex flex-wrap gap-2">
                    {(['Tutti', 'Antipasti', 'Primi', 'Secondi', 'Dolci'] as CategoryFilter[]).map((cat) => {
                      const active = categoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${active ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Ordina per</label>
                    <select
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value as SortKey)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/30"
                    >
                      <option value="confidenza">Confidenza</option>
                      <option value="prezzo">Prezzo</option>
                      <option value="nome">Nome</option>
                    </select>
                  </div>
                </div>

                {/* Dish grid */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                >
                  {filteredSortedDishes.map((dish) => {
                    const currentMapped = mappedOverrides[dish.id] ?? dish.mappedCategory ?? 'antipasto';
                    const selected = selectedIds.has(dish.id);
                    return (
                      <motion.div
                        key={dish.id}
                        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
                      >
                        <Card className={`h-full ${selected ? 'ring-2 ring-accent-gold/40' : ''}`}>
                          <div className="flex items-start justify-between mb-2">
                            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-500 text-[10px] uppercase tracking-widest px-2 py-0.5">
                              {dish.sourceCategory}
                            </span>
                            <button
                              onClick={() => toggleSelect(dish.id)}
                              aria-label={selected ? 'Deseleziona' : 'Seleziona'}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${selected ? 'bg-accent-gold border-accent-gold text-primary-black' : 'bg-white border-gray-300 hover:border-accent-gold'}`}
                            >
                              {selected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                            </button>
                          </div>

                          <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{dish.sourceName}</h3>
                          <p
                            className="text-xs text-gray-500 mb-3 leading-relaxed overflow-hidden"
                            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}
                          >
                            {dish.description}
                          </p>

                          <div className="flex items-center justify-between mb-3">
                            <p className="text-base font-bold text-accent-gold">{formatCurrency(dish.price)}</p>
                            <div className="flex items-center gap-1.5">
                              <Badge variant={confidenceVariant(dish.confidence)} size="sm">
                                {dish.confidence}%
                              </Badge>
                              <Badge variant={statusVariant(dish.status)} size="sm">
                                {statusLabel(dish.status)}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            <label className="text-[10px] uppercase tracking-[0.15em] text-gray-500">Categoria</label>
                            <select
                              value={currentMapped}
                              onChange={(e) => setMappedFor(dish.id, e.target.value as MappedCategory)}
                              className="flex-1 px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/30"
                            >
                              {(Object.keys(MAPPED_CATEGORY_LABEL) as MappedCategory[]).map((k) => (
                                <option key={k} value={k}>{MAPPED_CATEGORY_LABEL[k]}</option>
                              ))}
                            </select>
                          </div>

                          {dish.detectedAllergens && dish.detectedAllergens.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {dish.detectedAllergens.map((a) => (
                                <span
                                  key={a}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Sticky batch bar */}
                <div className="sticky bottom-4 mt-6 z-20">
                  <div className="mx-auto rounded-2xl bg-primary-black text-white shadow-2xl border border-gray-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Database className="w-4 h-4 text-accent-gold" />
                      <p className="text-sm font-medium">
                        {selectedIds.size}/{filteredSortedDishes.length} selezionati
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAll}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        Seleziona tutti
                      </button>
                      <button
                        onClick={deselectAll}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        Deseleziona tutto
                      </button>
                      <button
                        onClick={handleImport}
                        className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-accent-gold text-primary-black hover:bg-accent-gold-dark transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        Importa in EasyRest
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Competitor comparison */}
        <motion.div variants={itemVariants}>
          <Section title="Perche' importare da noi?" subtitle="Confronto con le piattaforme piu' utilizzate dai ristoratori italiani.">
            <Card padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left font-medium text-gray-500 px-5 py-3 text-xs uppercase tracking-widest">Funzionalita'</th>
                      <th className="text-center px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-accent-gold font-semibold">
                          <Zap className="w-3.5 h-3.5" /> EasyRest
                        </span>
                      </th>
                      <th className="text-center px-5 py-3 text-gray-500 font-medium">Pienissimo</th>
                      <th className="text-center px-5 py-3 text-gray-500 font-medium">Zucchetti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feat: 'Import automatico da URL', e: true, p: true, z: false },
                      { feat: 'Data-entry chiavi in mano', e: true, p: false, z: false },
                      { feat: 'Mapping categorie automatico', e: true, p: true, z: true },
                      { feat: 'Allergeni estratti automaticamente', e: true, p: true, z: false },
                      { feat: 'Gratis fino a 50 piatti', e: true, p: false, z: false },
                    ].map((row, i) => (
                      <tr key={row.feat} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-5 py-3 text-gray-700">{row.feat}</td>
                        <td className="px-5 py-3 text-center">
                          <Check className="w-5 h-5 text-accent-gold mx-auto" strokeWidth={3} />
                        </td>
                        <td className="px-5 py-3 text-center">
                          {row.p
                            ? <Check className="w-5 h-5 text-gray-400 mx-auto" strokeWidth={2.5} />
                            : <X className="w-5 h-5 text-gray-300 mx-auto" strokeWidth={2.5} />}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {row.z
                            ? <Check className="w-5 h-5 text-gray-400 mx-auto" strokeWidth={2.5} />
                            : <X className="w-5 h-5 text-gray-300 mx-auto" strokeWidth={2.5} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Section>
        </motion.div>

        {/* EE Partners footer */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-8 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="rounded-xl bg-primary-black text-white px-5 py-3.5 shadow-2xl border border-accent-gold/30 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-accent-gold text-primary-black flex items-center justify-center">
                <Check className="w-4 h-4" strokeWidth={3} />
              </span>
              <p className="text-sm font-medium">Menu importato correttamente in EasyRest.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
