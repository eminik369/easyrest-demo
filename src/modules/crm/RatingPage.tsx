import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, Minus, Plus, Star, CheckCircle2, ArrowRight,
  RotateCcw, UserSearch, ChevronRight, TrendingDown, TrendingUp,
  MessageSquare, Sparkles, Scale, History,
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';

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

interface OpenTable {
  tableId: string;
  customer: string;
  reservedCovers: number;
  arrivalTime: string;
  elapsedMin: number;
}

const openTables: OpenTable[] = [
  { tableId: 'T3', customer: 'Gallo',      reservedCovers: 4, arrivalTime: '20:18', elapsedMin: 142 },
  { tableId: 'T1', customer: 'Pellegrini', reservedCovers: 6, arrivalTime: '19:32', elapsedMin: 168 },
  { tableId: 'T5', customer: 'Cattaneo',   reservedCovers: 2, arrivalTime: '19:45', elapsedMin: 155 },
  { tableId: 'T2', customer: 'Conti',      reservedCovers: 8, arrivalTime: '20:05', elapsedMin: 135 },
  { tableId: 'T7', customer: 'Marchetti',  reservedCovers: 2, arrivalTime: '20:02', elapsedMin: 138 },
  { tableId: 'T4', customer: 'Rinaldi',    reservedCovers: 4, arrivalTime: '21:35', elapsedMin: 45  },
];

const starLabels: Record<number, string> = {
  1: 'Difficile — reclami multipli',
  2: 'Sotto media',
  3: 'Normale',
  4: 'Ospite piacevole',
  5: 'Ospite eccezionale',
};

interface RecentCheckout {
  time: string;
  tableId: string;
  customer: string;
  reliabilityDelta: number;
  stars: number;
  behaviorDelta: number;
}

const recentCheckouts: RecentCheckout[] = [
  { time: '23:48', tableId: 'T6', customer: 'Ferraro',   reliabilityDelta:  0.00, stars: 4, behaviorDelta:  0.10 },
  { time: '23:32', tableId: 'T9', customer: 'Neri',      reliabilityDelta: -0.05, stars: 3, behaviorDelta:  0.00 },
  { time: '23:15', tableId: 'T8', customer: 'Villa',     reliabilityDelta: -0.35, stars: 2, behaviorDelta: -0.15 },
  { time: '22:58', tableId: 'T12', customer: 'Esposito', reliabilityDelta:  0.00, stars: 5, behaviorDelta:  0.20 },
  { time: '22:40', tableId: 'T10', customer: 'Palmieri', reliabilityDelta: -0.15, stars: 3, behaviorDelta:  0.00 },
  { time: '22:24', tableId: 'T11', customer: 'Bianchi',  reliabilityDelta:  0.00, stars: 4, behaviorDelta:  0.10 },
  { time: '22:08', tableId: 'T14', customer: 'Russo',    reliabilityDelta:  0.00, stars: 5, behaviorDelta:  0.20 },
  { time: '21:52', tableId: 'T13', customer: 'De Luca',  reliabilityDelta: -0.05, stars: 4, behaviorDelta:  0.10 },
];

function formatElapsed(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

function reliabilityImpact(deviation: number): number {
  if (deviation >= 0) return 0;
  if (deviation === -1) return -0.05;
  if (deviation === -2) return -0.15;
  return -0.35;
}

function behaviorImpact(stars: number): number {
  if (stars === 5) return 0.20;
  if (stars === 4) return 0.10;
  if (stars === 3) return 0.00;
  if (stars === 2) return -0.15;
  if (stars === 1) return -0.30;
  return 0;
}

function deviationColor(deviation: number): { text: string; bg: string; border: string; label: string } {
  if (deviation >= 0)   return { text: 'text-success', bg: 'bg-success/10',  border: 'border-success/30',  label: 'Allineato' };
  if (deviation === -1) return { text: 'text-warning', bg: 'bg-warning/10',  border: 'border-warning/30',  label: 'Lieve scostamento' };
  if (deviation === -2) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300',   label: 'Scostamento medio' };
  return                       { text: 'text-danger',  bg: 'bg-danger/10',   border: 'border-danger/30',   label: 'No-show rilevante' };
}

type Phase = 1 | 2 | 3;

export function RatingPage() {
  const [selectedTableId, setSelectedTableId] = useState<string>(openTables[0].tableId);
  const [phase, setPhase] = useState<Phase>(1);
  const [actualCovers, setActualCovers] = useState<number>(openTables[0].reservedCovers);
  const [stars, setStars] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  const selectedTable = useMemo(
    () => openTables.find((t) => t.tableId === selectedTableId) ?? openTables[0],
    [selectedTableId],
  );

  const deviation = actualCovers - selectedTable.reservedCovers;
  const reliabilityDelta = reliabilityImpact(deviation);
  const behaviorDelta = behaviorImpact(stars);
  const devStyle = deviationColor(deviation);
  const starDisplay = hoveredStar || stars;

  const handleSelectTable = (id: string) => {
    if (id === selectedTableId) return;
    const t = openTables.find((x) => x.tableId === id);
    if (!t) return;
    setSelectedTableId(id);
    setPhase(1);
    setActualCovers(t.reservedCovers);
    setStars(0);
    setHoveredStar(0);
    setNote('');
  };

  const resetFlow = () => {
    setPhase(1);
    setActualCovers(selectedTable.reservedCovers);
    setStars(0);
    setHoveredStar(0);
    setNote('');
  };

  const decrement = () => setActualCovers((v) => Math.max(0, v - 1));
  const increment = () => setActualCovers((v) => Math.min(selectedTable.reservedCovers + 4, v + 1));

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb
            items={[
              { label: 'Panoramica', href: '/overview' },
              { label: 'CRM', href: '/crm' },
              { label: 'Chiusura Tavolo' },
            ]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader
            title="Verifica Coperti e Feedback Comportamentale"
            subtitle="Alla chiusura del tavolo, il sistema confronta i coperti effettivi con quelli prenotati e chiede al cameriere un rapido feedback comportamentale. Entrambi alimentano il rating del cliente."
          />
        </motion.div>

        {/* Table picker strip */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Tavoli in chiusura</p>
            <p className="text-xs text-gray-400">{openTables.length} aperti adesso</p>
          </div>
          <div className="overflow-x-auto -mx-2 px-2 pb-2">
            <div className="flex gap-3 min-w-max">
              {openTables.map((t) => {
                const isSelected = t.tableId === selectedTableId;
                return (
                  <motion.button
                    key={t.tableId}
                    onClick={() => handleSelectTable(t.tableId)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`text-left rounded-2xl border px-5 py-4 w-56 shrink-0 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white border-accent-gold shadow-[0_0_0_4px_rgba(201,169,98,0.15)]'
                        : 'bg-white border-gray-300/50 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-lg font-bold ${isSelected ? 'text-accent-gold' : 'text-gray-900'}`}>
                        {t.tableId}
                      </span>
                      <Badge variant={isSelected ? 'gold' : 'default'} size="sm">
                        {t.reservedCovers} cop.
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{t.customer}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatElapsed(t.elapsedMin)}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span>arr. {t.arrivalTime}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Two-phase flow + side panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            {/* Phase indicator */}
            <motion.div variants={itemVariants} className="mb-4 flex items-center gap-2 text-xs">
              {[1, 2, 3].map((p, i) => {
                const active = phase === p;
                const done = phase > p;
                return (
                  <span key={p} className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border transition-colors ${
                        active
                          ? 'bg-accent-gold text-white border-accent-gold'
                          : done
                          ? 'bg-success/15 text-success border-success/30'
                          : 'bg-white text-gray-400 border-gray-300'
                      }`}
                    >
                      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : p}
                    </span>
                    <span className={active ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                      {p === 1 ? 'Coperti' : p === 2 ? 'Comportamento' : 'Chiusura'}
                    </span>
                    {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                  </span>
                );
              })}
            </motion.div>

            <motion.div variants={itemVariants}>
              <AnimatePresence mode="wait">
                {phase === 1 && (
                  <motion.div
                    key="phase-1"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Card padding="lg">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-accent-gold mb-1">
                            Fase 1 · {selectedTable.customer}
                          </p>
                          <h3 className="text-xl font-semibold text-gray-900">
                            Verifica Coperti Effettivi
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 max-w-md">
                            Conferma quanti commensali si sono effettivamente presentati al tavolo {selectedTable.tableId}.
                          </p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-accent-gold" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {/* Reserved covers display */}
                        <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5 text-center">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">
                            Prenotati
                          </p>
                          <p className="text-5xl font-bold text-gray-900 tabular-nums">
                            {selectedTable.reservedCovers}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">coperti sulla prenotazione</p>
                        </div>

                        {/* Actual covers stepper */}
                        <div className="rounded-2xl border border-accent-gold/30 bg-accent-gold/5 p-5 text-center">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-accent-gold mb-3">
                            Al tavolo
                          </p>
                          <div className="flex items-center justify-center gap-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.92 }}
                              onClick={decrement}
                              disabled={actualCovers <= 0}
                              className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="Riduci coperti"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <motion.p
                              key={actualCovers}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.18 }}
                              className="text-5xl font-bold text-gray-900 tabular-nums w-16 text-center"
                            >
                              {actualCovers}
                            </motion.p>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.92 }}
                              onClick={increment}
                              disabled={actualCovers >= selectedTable.reservedCovers + 4}
                              className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="Aumenta coperti"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <p className="text-xs text-gray-500 mt-3">coperti effettivi</p>
                        </div>
                      </div>

                      {/* Live deviation */}
                      <div className={`rounded-2xl border ${devStyle.border} ${devStyle.bg} p-5 mb-6`}>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">
                              Scostamento
                            </p>
                            <div className="flex items-baseline gap-3">
                              <p className={`text-3xl font-bold tabular-nums ${devStyle.text}`}>
                                {deviation > 0 ? '+' : ''}{deviation}
                              </p>
                              <span className={`text-sm font-medium ${devStyle.text}`}>
                                {devStyle.label}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">
                              Impatto Affidabilita'
                            </p>
                            <p className={`text-2xl font-bold tabular-nums ${reliabilityDelta < 0 ? 'text-danger' : 'text-success'}`}>
                              {reliabilityDelta === 0 ? '0.00' : reliabilityDelta.toFixed(2)}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1 justify-end">
                              {reliabilityDelta < 0 ? (
                                <><TrendingDown className="w-3 h-3" /> rating scende</>
                              ) : (
                                <><TrendingUp className="w-3 h-3" /> nessuna penalita'</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs text-gray-400">
                          Arrivo alle {selectedTable.arrivalTime} · permanenza {formatElapsed(selectedTable.elapsedMin)}
                        </p>
                        <Button onClick={() => setPhase(2)}>
                          <span className="flex items-center gap-2">
                            Conferma e prosegui
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {phase === 2 && (
                  <motion.div
                    key="phase-2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Card padding="lg">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-accent-gold mb-1">
                            Fase 2 · {selectedTable.customer}
                          </p>
                          <h3 className="text-xl font-semibold text-gray-900">
                            Comportamento del tavolo
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 max-w-md">
                            Una valutazione rapida da 1 a 5 stelle. Rimane privata, la vede solo il team di sala.
                          </p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-5 h-5 text-accent-gold" />
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-6 mb-6">
                        <div className="flex items-center justify-center gap-3 mb-4">
                          {[1, 2, 3, 4, 5].map((n) => {
                            const filled = n <= starDisplay;
                            return (
                              <motion.button
                                key={n}
                                onClick={() => setStars(n)}
                                onMouseEnter={() => setHoveredStar(n)}
                                onMouseLeave={() => setHoveredStar(0)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-1 cursor-pointer"
                                aria-label={`${n} stelle`}
                              >
                                <Star
                                  className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                                    filled ? 'fill-accent-gold text-accent-gold' : 'fill-transparent text-gray-300'
                                  }`}
                                />
                              </motion.button>
                            );
                          })}
                        </div>
                        <div className="h-6 text-center">
                          <AnimatePresence mode="wait">
                            {starDisplay > 0 && (
                              <motion.p
                                key={starDisplay}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.18 }}
                                className="text-sm font-medium text-gray-700"
                              >
                                {starDisplay} {starDisplay === 1 ? 'stella' : 'stelle'} — {starLabels[starDisplay]}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                        {stars > 0 && (
                          <div className="flex items-center justify-center mt-3">
                            <Badge variant={behaviorDelta >= 0 ? 'success' : 'danger'} size="sm">
                              Impatto comportamento: {behaviorDelta >= 0 ? '+' : ''}{behaviorDelta.toFixed(2)}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Note */}
                      <div className="mb-6">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block">
                          Note per il database cliente (opzionale)
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          placeholder="Es. richiede sempre tavolo in veranda, allergia ai crostacei dichiarata a voce, ama i vini piemontesi..."
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none resize-none transition-colors"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => setPhase(1)}
                          className="text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                        >
                          Indietro
                        </button>
                        <Button onClick={() => setPhase(3)} disabled={stars === 0}>
                          <span className="flex items-center gap-2">
                            Salva e chiudi tavolo
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {phase === 3 && (
                  <motion.div
                    key="phase-3"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Card padding="lg" className="bg-gradient-to-br from-white to-accent-gold/5">
                      <div className="text-center mb-6">
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.05 }}
                          className="w-20 h-20 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center mx-auto mb-4"
                        >
                          <motion.svg
                            viewBox="0 0 48 48"
                            className="w-10 h-10"
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.path
                              d="M12 24 L21 33 L36 16"
                              fill="transparent"
                              strokeWidth={4}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="stroke-success"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                            />
                          </motion.svg>
                        </motion.div>
                        <motion.h3
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                          className="text-2xl font-bold text-gray-900"
                        >
                          Tavolo {selectedTable.tableId} chiuso
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                          className="text-sm text-gray-500 mt-1"
                        >
                          Cliente {selectedTable.customer} · dati salvati nel database CRM
                        </motion.p>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.35 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
                      >
                        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">Prenotati</p>
                          <p className="text-xl font-bold text-gray-900 tabular-nums mt-1">{selectedTable.reservedCovers}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">Effettivi</p>
                          <p className="text-xl font-bold text-gray-900 tabular-nums mt-1">{actualCovers}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">Scostamento</p>
                          <p className={`text-xl font-bold tabular-nums mt-1 ${devStyle.text}`}>
                            {deviation > 0 ? '+' : ''}{deviation}
                          </p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">Comportamento</p>
                          <p className="text-xl font-bold text-accent-gold tabular-nums mt-1 flex items-center justify-center gap-1">
                            {stars}<Star className="w-4 h-4 fill-accent-gold" />
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.35 }}
                        className="rounded-2xl bg-gray-900 text-white p-5 mb-6"
                      >
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">
                          Impatto sul rating composito
                        </p>
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div>
                            <p className="text-[11px] text-gray-400">Affidabilita'</p>
                            <p className={`text-2xl font-bold tabular-nums ${reliabilityDelta < 0 ? 'text-danger' : 'text-success'}`}>
                              {reliabilityDelta >= 0 ? '+' : ''}{reliabilityDelta.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400">Comportamento</p>
                            <p className={`text-2xl font-bold tabular-nums ${behaviorDelta < 0 ? 'text-danger' : 'text-success'}`}>
                              {behaviorDelta >= 0 ? '+' : ''}{behaviorDelta.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400">Totale composito</p>
                            <p className={`text-2xl font-bold tabular-nums ${(reliabilityDelta + behaviorDelta) < 0 ? 'text-danger' : 'text-success'}`}>
                              {(reliabilityDelta + behaviorDelta) >= 0 ? '+' : ''}{(reliabilityDelta + behaviorDelta).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {note && (
                          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-300">
                            <span className="text-gray-500 uppercase tracking-wider text-[10px]">Nota salvata: </span>
                            <span className="italic">{note}</span>
                          </div>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.75 }}
                        className="flex flex-col sm:flex-row gap-3 justify-end"
                      >
                        <Button variant="secondary" onClick={resetFlow}>
                          <span className="flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Chiudi un altro tavolo
                          </span>
                        </Button>
                        <Button onClick={() => { window.location.href = '/crm/customers'; }}>
                          <span className="flex items-center gap-2">
                            <UserSearch className="w-4 h-4" />
                            Vedi cliente nel database
                          </span>
                        </Button>
                      </motion.div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Side panel — rules */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              <Card className="bg-gray-900 text-white border-gray-800" padding="lg">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-4 h-4 text-accent-gold" />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Regole di calcolo</p>
                </div>

                <div className="mb-5">
                  <p className="text-sm font-semibold text-white mb-2">Affidabilita'</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Coperti in meno rispetto al prenotato: il rating cala.
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Scostamento -1</span>
                      <span className="font-mono text-warning">-0.05</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Scostamento -2</span>
                      <span className="font-mono text-amber-400">-0.15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Scostamento -3 o piu'</span>
                      <span className="font-mono text-danger">-0.35</span>
                    </div>
                  </div>
                </div>

                <div className="mb-5 pt-4 border-t border-white/10">
                  <p className="text-sm font-semibold text-white mb-2">Comportamento</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Il feedback del cameriere modula direttamente il rating comportamentale.
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-gray-300">
                        5 <Star className="w-3 h-3 fill-accent-gold text-accent-gold" />
                      </span>
                      <span className="font-mono text-success">+0.20</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-gray-300">
                        1 <Star className="w-3 h-3 fill-accent-gold text-accent-gold" />
                      </span>
                      <span className="font-mono text-danger">-0.30</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Esempio</p>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <span className="font-semibold text-white">Gallo</span> prenota per 10,
                    si presentano in 6 - no-show di 4.
                    <br />
                    Rating Affidabilita': <span className="font-mono text-warning">4.2</span>
                    <ArrowRight className="inline w-3 h-3 mx-1 text-gray-500" />
                    <span className="font-mono text-danger">3.85</span>
                  </p>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Recent checkouts log */}
        <Section
          title="Ultime chiusure"
          subtitle="Gli otto tavoli chiusi piu' di recente. Ogni riga diventa un evento nel profilo del cliente corrispondente."
        >
          <motion.div variants={itemVariants}>
            <Card padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left font-medium text-[10px] uppercase tracking-[0.15em] text-gray-500 px-5 py-3">
                        <span className="flex items-center gap-1">
                          <History className="w-3 h-3" /> Orario
                        </span>
                      </th>
                      <th className="text-left font-medium text-[10px] uppercase tracking-[0.15em] text-gray-500 px-5 py-3">Tavolo</th>
                      <th className="text-left font-medium text-[10px] uppercase tracking-[0.15em] text-gray-500 px-5 py-3">Cliente</th>
                      <th className="text-right font-medium text-[10px] uppercase tracking-[0.15em] text-gray-500 px-5 py-3">&#916; Affidabilita'</th>
                      <th className="text-center font-medium text-[10px] uppercase tracking-[0.15em] text-gray-500 px-5 py-3">Stelle</th>
                      <th className="text-right font-medium text-[10px] uppercase tracking-[0.15em] text-gray-500 px-5 py-3">&#916; Comportamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCheckouts.map((row, i) => (
                      <motion.tr
                        key={`${row.time}-${row.tableId}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 * i, duration: 0.3 }}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-3 font-mono text-gray-600">{row.time}</td>
                        <td className="px-5 py-3">
                          <span className="font-semibold text-gray-900">{row.tableId}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-800">{row.customer}</td>
                        <td className={`px-5 py-3 text-right font-mono tabular-nums ${row.reliabilityDelta < 0 ? 'text-danger' : 'text-gray-500'}`}>
                          {row.reliabilityDelta === 0 ? '—' : row.reliabilityDelta.toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <span className="flex items-center justify-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`w-3.5 h-3.5 ${n <= row.stars ? 'fill-accent-gold text-accent-gold' : 'fill-transparent text-gray-300'}`}
                              />
                            ))}
                          </span>
                        </td>
                        <td className={`px-5 py-3 text-right font-mono tabular-nums ${
                          row.behaviorDelta > 0
                            ? 'text-success'
                            : row.behaviorDelta < 0
                            ? 'text-danger'
                            : 'text-gray-500'
                        }`}>
                          {row.behaviorDelta === 0 ? '—' : (row.behaviorDelta > 0 ? '+' : '') + row.behaviorDelta.toFixed(2)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </Section>

        {/* EE Partners branding */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-8 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );
}
