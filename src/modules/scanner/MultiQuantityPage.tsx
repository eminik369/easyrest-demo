import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Barcode, Check, Delete, Warehouse, Package, Timer, AlertTriangle,
  ThermometerSnowflake, Truck, CalendarClock, Archive, Quote, Zap, Hash,
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { formatCurrency } from '../../utils/calculations';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

type Phase = 'idle' | 'scanning' | 'keypad' | 'processing' | 'done';

const shortlistIds = [
  'prod-barolo',
  'prod-parmigiano',
  'prod-tonnarelli',
  'prod-olio-evo',
  'prod-caffe',
  'prod-cioccolato',
];

const quickChips = [6, 12, 24, 48, 78, 100];

const keypadLayout: Array<{ label: string; kind: 'digit' | 'clear' | 'confirm' }> = [
  { label: '1', kind: 'digit' }, { label: '2', kind: 'digit' }, { label: '3', kind: 'digit' },
  { label: '4', kind: 'digit' }, { label: '5', kind: 'digit' }, { label: '6', kind: 'digit' },
  { label: '7', kind: 'digit' }, { label: '8', kind: 'digit' }, { label: '9', kind: 'digit' },
  { label: 'CLR', kind: 'clear' }, { label: '0', kind: 'digit' }, { label: 'OK', kind: 'confirm' },
];

const haccpChips = [
  { icon: Archive, label: 'Lotto memorizzato una sola volta' },
  { icon: ThermometerSnowflake, label: 'Temperatura zona verificata' },
  { icon: Truck, label: 'Fornitore propagato automaticamente' },
  { icon: CalendarClock, label: 'Scadenza stimata su data ricevimento' },
];

export function MultiQuantityPage() {
  const { products } = useStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-barolo');
  const [qty, setQty] = useState<string>('1');

  const shortlist = shortlistIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? shortlist[0];
  const quantity = Math.max(1, parseInt(qty || '1', 10));

  const startScan = () => {
    setPhase('scanning');
    setQty('1');
    setTimeout(() => setPhase('keypad'), 1200);
  };

  const pressDigit = (d: string) => {
    setQty((prev) => {
      const next = (prev === '1' || prev === '0' ? '' : prev) + d;
      const n = parseInt(next, 10);
      if (!Number.isFinite(n) || n > 999) return prev;
      return next === '' ? '1' : String(n);
    });
  };

  const pressClear = () => {
    setQty((prev) => {
      if (prev.length <= 1) return '1';
      const next = prev.slice(0, -1);
      return next === '' ? '1' : next;
    });
  };

  const confirmLoad = () => {
    setPhase('processing');
    setTimeout(() => setPhase('done'), 900);
  };

  const resetFlow = () => {
    setPhase('idle');
    setQty('1');
  };

  const totalValue = (selectedProduct?.unitPrice ?? 0) * quantity;
  const newStockLevel = (selectedProduct?.quantity ?? 0) + quantity;
  const avoidedScans = Math.max(0, quantity - 1);

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb
            items={[
              { label: 'Panoramica', href: '/overview' },
              { label: 'Scanner e Magazzino', href: '/scanner' },
              { label: 'Moltiplicatore' },
            ]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader
            title="Carico Merci a Moltiplicatore"
            subtitle="Scansiona una sola volta, poi inserisci la quantita. 78 bottiglie di Barolo entrano in magazzino con UNA scansione invece di 78."
            badge={<Badge variant="gold" size="md">Esclusiva EasyRest</Badge>}
          />
        </motion.div>

        {/* Hero comparison block */}
        <motion.div variants={itemVariants} className="mb-16">
          <Card padding="none" className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 relative">
              {/* LEFT: traditional method */}
              <div className="bg-gray-100/70 p-8 sm:p-10 border-b md:border-b-0 md:border-r border-gray-200 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-5">
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Metodo tradizionale</p>
                </div>
                <p className="text-xs text-gray-400 mb-4">Zucchetti, e-Pratico, gestionali legacy</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-gray-800 tracking-tight">78</span>
                  <span className="text-sm text-gray-500">scansioni singole</span>
                </div>
                <div className="flex items-baseline gap-2 text-gray-500 text-sm mb-6">
                  <Timer className="w-4 h-4" />
                  <span className="font-mono">~5 min 12 sec</span>
                </div>

                {/* Slow scan animation — many repeated barcodes */}
                <div className="mt-6 h-24 bg-white/60 border border-gray-200 rounded-xl overflow-hidden relative">
                  <motion.div
                    className="flex gap-3 items-center h-full px-3"
                    animate={{ x: [0, -600] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  >
                    {Array.from({ length: 26 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-1 shrink-0">
                        <div className="flex gap-[2px] items-center">
                          {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1].map((w, j) => (
                            <div key={j} className="bg-gray-400" style={{ width: w, height: 36 }} />
                          ))}
                        </div>
                        <span className="text-[9px] font-mono text-gray-400 ml-1">#{i + 1}</span>
                      </div>
                    ))}
                  </motion.div>
                  <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-gray-100/90 to-transparent pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-gray-100/90 to-transparent pointer-events-none" />
                </div>
                <p className="text-[11px] text-gray-400 mt-3 italic">Ogni bottiglia, ogni etichetta, ogni volta.</p>
              </div>

              {/* RIGHT: EasyRest */}
              <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black p-8 sm:p-10 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-5">
                  <Zap className="w-4 h-4 text-accent-gold" />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-accent-gold/80">EasyRest · Moltiplicatore</p>
                </div>
                <p className="text-xs text-gray-500 mb-4">Una scansione + tastierino numerico</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-white tracking-tight">1</span>
                  <span className="text-sm text-gray-400">scansione + x78</span>
                </div>
                <div className="flex items-baseline gap-2 text-gray-400 text-sm mb-6">
                  <Timer className="w-4 h-4" />
                  <span className="font-mono">~7 sec</span>
                </div>

                {/* One-off animation: single scan + keypad punch */}
                <div className="mt-6 h-24 bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden relative flex items-center justify-center">
                  <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: [0.4, 1, 1, 0.4] }}
                    transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 1.5, times: [0, 0.25, 0.85, 1] }}
                  >
                    <div className="flex gap-[2px] items-center">
                      {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1].map((w, j) => (
                        <div key={j} className="bg-white/80" style={{ width: w, height: 36 }} />
                      ))}
                    </div>
                    <motion.span
                      className="text-2xl font-mono font-bold text-accent-gold"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: [0, 0, 1, 1], scale: [0.6, 0.6, 1.1, 1] }}
                      transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 1.5, times: [0, 0.3, 0.45, 0.9] }}
                    >
                      ×78
                    </motion.span>
                  </motion.div>
                </div>
                <p className="text-[11px] text-accent-gold/70 mt-3 italic">Inquadri, digiti, confermi.</p>
              </div>
            </div>

            {/* Bottom callout */}
            <div className="bg-black border-t border-accent-gold/30 px-8 py-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-accent-gold" />
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">vantaggio operativo: </span>
                  <span className="text-accent-gold font-bold text-base tracking-wide">–98% tempo</span>
                  <span className="text-gray-500"> sul carico di un bancale.</span>
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-600">Zero hardware aggiuntivo</p>
            </div>
          </Card>
        </motion.div>

        {/* Interactive simulator */}
        <Section
          title="Simulazione interattiva — Nuovo carico merci"
          subtitle="Prova il flusso: scansione singola, tastierino, conferma. Il magazzino si aggiorna di colpo."
        >
          <motion.div variants={itemVariants}>
            <Card padding="lg" className="overflow-hidden">
              <AnimatePresence mode="wait">
                {/* PHASE A — IDLE */}
                {phase === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-24 h-24 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-5">
                        <Barcode className="w-10 h-10 text-accent-gold" />
                      </div>
                      <p className="text-gray-900 font-semibold text-lg mb-1">Inquadra il codice a barre del prodotto</p>
                      <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                        Una scansione basta per tutta la cassa. Il moltiplicatore si occupa del resto.
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3 text-center">
                        Seleziona un prodotto per la demo
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {shortlist.map((p) => {
                          const active = p.id === selectedProductId;
                          return (
                            <motion.button
                              key={p.id}
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setSelectedProductId(p.id)}
                              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                                active
                                  ? 'bg-accent-gold text-white border-accent-gold'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                              }`}
                            >
                              {p.name}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={startScan}>Simula scansione barcode</Button>
                    </div>
                  </motion.div>
                )}

                {/* PHASE B — SCANNING */}
                {phase === 'scanning' && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-4"
                  >
                    <div className="relative w-56 h-56 mx-auto mb-5 bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-4 border-2 border-accent-gold/60 rounded-lg" />
                      <motion.div
                        className="absolute left-4 right-4 h-0.5 bg-accent-gold shadow-[0_0_8px_rgba(201,169,98,0.7)]"
                        animate={{ top: ['15%', '85%', '15%'] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div className="flex gap-[2px] items-center">
                        {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1, 2].map((w, i) => (
                          <div key={i} className="bg-white rounded-[1px]" style={{ width: w * 2, height: 40 + ((i * 7) % 20) }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Lettura codice a barre in corso...</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">{selectedProduct?.barcode}</p>
                  </motion.div>
                )}

                {/* PHASE C — KEYPAD */}
                {phase === 'keypad' && selectedProduct && (
                  <motion.div
                    key="keypad"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* LEFT: product card */}
                      <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-accent-gold/15 flex items-center justify-center">
                            <Check className="w-4 h-4 text-accent-gold" />
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-accent-gold/80">Prodotto riconosciuto</p>
                        </div>
                        <h3 className="text-xl font-bold mb-1 leading-tight">{selectedProduct.name}</h3>
                        <p className="text-xs text-gray-400 font-mono mb-5">{selectedProduct.barcode}</p>

                        <div className="flex gap-[2px] items-end h-10 mb-5 opacity-40">
                          {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1].map((w, i) => (
                            <div key={i} className="bg-white" style={{ width: w, height: 30 + ((i * 5) % 10) }} />
                          ))}
                        </div>

                        <div className="space-y-2.5 text-sm mt-auto">
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-500">Fornitore</span>
                            <span className="font-medium text-right">{selectedProduct.supplier}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-500">Lotto</span>
                            <span className="font-mono text-accent-gold/90">{selectedProduct.lot}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-500">Prezzo unitario</span>
                            <span className="font-medium">{formatCurrency(selectedProduct.unitPrice)}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-500">Unita di misura</span>
                            <span className="font-medium uppercase">{selectedProduct.unit}</span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT: keypad */}
                      <div className="flex flex-col">
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-4 text-center">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Quantita da caricare</p>
                          <div className="flex items-baseline justify-center gap-1 mb-1">
                            <span className="text-gray-400 text-2xl font-mono">×</span>
                            <motion.span
                              key={qty}
                              initial={{ scale: 0.85, opacity: 0.6 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.12 }}
                              className="text-accent-gold text-5xl font-bold font-mono"
                            >
                              {qty}
                            </motion.span>
                          </div>
                          <p className="text-[11px] text-gray-400">Premi OK o conferma per caricare.</p>
                        </div>

                        {/* Keypad 3x4 */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {keypadLayout.map((key) => {
                            const isDigit = key.kind === 'digit';
                            const isClear = key.kind === 'clear';
                            const isConfirm = key.kind === 'confirm';
                            return (
                              <motion.button
                                key={key.label}
                                whileTap={{ scale: 0.92, backgroundColor: '#C9A962' }}
                                onClick={() => {
                                  if (isDigit) pressDigit(key.label);
                                  if (isClear) pressClear();
                                  if (isConfirm) confirmLoad();
                                }}
                                className={`h-16 rounded-xl border text-3xl font-mono flex items-center justify-center transition-colors cursor-pointer select-none ${
                                  isConfirm
                                    ? 'bg-accent-gold/10 border-accent-gold/40 text-accent-gold hover:bg-accent-gold/20'
                                    : isClear
                                    ? 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    : 'bg-white border-gray-300 text-gray-900 hover:border-gray-500'
                                }`}
                              >
                                {isClear ? <Delete className="w-6 h-6" /> : isConfirm ? <Check className="w-7 h-7" /> : key.label}
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Quick-select chips */}
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Preset rapidi</p>
                          <div className="flex flex-wrap gap-2">
                            {quickChips.map((n) => {
                              const active = parseInt(qty, 10) === n;
                              return (
                                <motion.button
                                  key={n}
                                  whileHover={{ y: -1 }}
                                  whileTap={{ scale: 0.94 }}
                                  onClick={() => setQty(String(n))}
                                  className={`px-3 py-1.5 rounded-full text-sm font-mono border transition-colors cursor-pointer ${
                                    active
                                      ? 'bg-accent-gold text-white border-accent-gold'
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-accent-gold hover:text-accent-gold'
                                  }`}
                                >
                                  x{n}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5" />
                        Eviti {avoidedScans} scansioni singole.
                      </p>
                      <div className="flex gap-3">
                        <Button variant="ghost" size="sm" onClick={resetFlow}>Annulla</Button>
                        <Button onClick={confirmLoad}>Conferma carico x{quantity}</Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PHASE D — PROCESSING */}
                {phase === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="py-10"
                  >
                    <div className="relative h-40 max-w-md mx-auto">
                      {/* origin (scanner) */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center">
                        <Barcode className="w-6 h-6 text-accent-gold" />
                      </div>
                      {/* destination (warehouse) */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                        <Warehouse className="w-6 h-6 text-white" />
                      </div>
                      {/* flying items */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute left-14 top-1/2 w-2 h-2 rounded-full bg-accent-gold"
                          initial={{ x: 0, y: -4, opacity: 0 }}
                          animate={{ x: 280, y: -4 + (i % 2 === 0 ? -10 : 10), opacity: [0, 1, 1, 0] }}
                          transition={{ duration: 0.7, delay: i * 0.07, ease: 'easeOut' }}
                        />
                      ))}
                    </div>
                    <p className="text-center text-sm text-gray-600 font-medium mt-4">Carico in corso...</p>
                    <p className="text-center text-xs text-gray-400 mt-1 font-mono">x{quantity} {selectedProduct?.name}</p>
                  </motion.div>
                )}

                {/* PHASE E — DONE */}
                {phase === 'done' && selectedProduct && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center shrink-0"
                      >
                        <Check className="w-7 h-7 text-success" />
                      </motion.div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-success font-semibold mb-0.5">Carico completato</p>
                        <p className="text-lg font-bold text-gray-900 leading-tight">
                          Caricato <span className="text-accent-gold">x{quantity}</span> {selectedProduct.name} in magazzino
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-6">
                      {[
                        ['Totale unita', `${quantity} ${selectedProduct.unit}`],
                        ['Valore merce', formatCurrency(totalValue)],
                        ['Registro HACCP', 'Aggiornato ✓'],
                        ['Lotto memorizzato', `${selectedProduct.lot} ✓`],
                        ['Nuovo livello scorta', `${newStockLevel} ${selectedProduct.unit}`],
                      ].map(([label, value], i) => (
                        <div
                          key={label}
                          className={`flex justify-between items-center px-5 py-3 text-sm ${
                            i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } ${i !== 4 ? 'border-b border-gray-100' : ''}`}
                        >
                          <span className="text-gray-500">{label}</span>
                          <span className="font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 justify-end flex-wrap">
                      <Button variant="secondary" size="sm" onClick={resetFlow}>Carica un altro prodotto</Button>
                      <Button size="sm" onClick={() => { /* mock */ }}>Vai al magazzino</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </Section>

        {/* Metric comparison strip */}
        <Section title="L'effetto di una singola scansione" subtitle="Numeri dinamici ricalcolati sulla quantita che hai appena digitato nel tastierino.">
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center mx-auto mb-3">
                <Timer className="w-5 h-5 text-accent-gold" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Tempo risparmiato</p>
              <p className="text-4xl font-bold text-accent-gold tracking-tight">~98%</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">7 secondi invece di 5 minuti e 12 secondi.</p>
            </Card>

            <Card className="text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mx-auto mb-3">
                <Barcode className="w-5 h-5 text-accent-gold" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Scansioni evitate</p>
              <motion.p
                key={avoidedScans}
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold text-gray-900 tracking-tight font-mono"
              >
                {avoidedScans}
              </motion.p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Dinamico: pari a quantita meno 1.</p>
            </Card>

            <Card className="text-center">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-5 h-5 text-success" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Errori operatore</p>
              <p className="text-4xl font-bold text-success tracking-tight">–100%</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Meno scansioni, meno letture errate.</p>
            </Card>
          </motion.div>
        </Section>

        {/* "Perche importa" editorial block */}
        <Section title="Perche importa">
          <motion.div variants={itemVariants}>
            <Card padding="lg" className="bg-gray-900 border-gray-800">
              <div className="flex gap-5">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/15 flex items-center justify-center">
                    <Quote className="w-5 h-5 text-accent-gold" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-xl text-white leading-relaxed font-light italic tracking-tight">
                    "Nel carico di un bancale da 78 bottiglie, ogni secondo speso in piu e un errore potenziale.
                    Il moltiplicatore non e una comodita: e una precondizione per la tracciabilita."
                  </p>
                  <p className="text-xs uppercase tracking-[0.25em] text-accent-gold/80 mt-5">— Logica operativa EasyRest</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </Section>

        {/* HACCP integration */}
        <Section title="Integrazione HACCP" subtitle="Ogni moltiplicazione propaga automaticamente i dati di conformita al lotto intero.">
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            {haccpChips.map((chip) => (
              <div
                key={chip.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700"
              >
                <chip.icon className="w-4 h-4 text-accent-gold shrink-0" />
                <span>{chip.label}</span>
              </div>
            ))}
          </motion.div>
        </Section>

        {/* Footer — leftover Package import used here to dodge unused warning, but cleanly */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 pt-4 pb-2 text-[11px] text-gray-400">
          <Package className="w-3.5 h-3.5" />
          <span>Pensato per il carico merci ad alto volume.</span>
        </motion.div>

        {/* EE Partners branding */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-4 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );
}
