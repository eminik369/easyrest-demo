import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, ScanLine, Check, Clock, Users, UserCircle2, ArrowRight,
  Smartphone, Tablet, Database, RotateCcw, TrendingDown, TrendingUp,
} from 'lucide-react';
import { Card, Badge, Button, CountUp, ProgressBar } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import type { Reservation, Customer } from '../../types';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

type Phase = 'idle' | 'scanning' | 'computing' | 'done';

// 7x7 QR-like pattern (1 = filled, 0 = empty). The three 3x3 positioning
// markers at top-left, top-right, bottom-left are drawn separately.
const qrGrid: number[][] = [
  [0, 0, 0, 1, 0, 0, 0],
  [0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0],
  [0, 1, 1, 1, 0, 0, 1],
  [1, 1, 0, 1, 1, 0, 1],
  [0, 0, 1, 0, 0, 1, 0],
  [1, 0, 1, 1, 0, 1, 0],
];

function StylizedQR({ size = 160 }: { size?: number }) {
  const cells = 11; // 7 data + 4 quiet margin (2 each side conceptually)
  // Build a 11x11 grid: pad the 7x7 centrally, then paint 3x3 finder markers.
  const grid: number[][] = Array.from({ length: cells }, () => Array.from({ length: cells }, () => 0));
  const offset = Math.floor((cells - 7) / 2);
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      grid[y + offset][x + offset] = qrGrid[y][x];
    }
  }
  // paint finder markers as 3x3 outlined squares at top-left, top-right, bottom-left
  const paintFinder = (r: number, c: number) => {
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        const isEdge = dy === 0 || dy === 2 || dx === 0 || dx === 2;
        grid[r + dy][c + dx] = isEdge ? 1 : 0;
      }
    }
  };
  paintFinder(0, 0);
  paintFinder(0, cells - 3);
  paintFinder(cells - 3, 0);

  const cellSize = size / cells;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <rect width={size} height={size} fill="#FFFFFF" rx={8} />
      {grid.map((row, y) =>
        row.map((val, x) =>
          val ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize + 1}
              y={y * cellSize + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              fill="#0A0A0A"
              rx={1}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

interface ScanResult {
  delayMinutes: number;
  arrivalTime: string;
  delta: number;
  badge: { label: string; variant: 'success' | 'warning' | 'danger' };
}

function addMinutesToTime(time: string, delta: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + delta;
  const hours = ((Math.floor(total / 60) % 24) + 24) % 24;
  const mins = ((total % 60) + 60) % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function computeResult(reservationTime: string): ScanResult {
  const delayMinutes = Math.floor(Math.random() * 46) - 5; // -5..+40
  const arrivalTime = addMinutesToTime(reservationTime, delayMinutes);
  let delta = 0;
  let badge: ScanResult['badge'];
  if (delayMinutes <= 15) {
    delta = delayMinutes <= 0 ? 0.02 : 0;
    badge = { label: 'Puntuale', variant: 'success' };
  } else if (delayMinutes <= 30) {
    delta = -0.15;
    badge = { label: 'Ritardo lieve', variant: 'warning' };
  } else {
    delta = -0.35;
    badge = { label: 'Ritardo grave', variant: 'danger' };
  }
  return { delayMinutes, arrivalTime, delta, badge };
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs uppercase tracking-widest text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-gray-900 font-mono">{value.toFixed(2)}</span>
      </div>
      <ProgressBar value={value} max={5} color="bg-accent-gold" />
    </div>
  );
}

export function CheckinPage() {
  const { reservations, customers } = useStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);

  const todayReservations = useMemo(
    () => reservations.filter((r) => r.date === '2026-02-22'),
    [reservations],
  );

  const defaultId = todayReservations.find((r) => r.id === 'res-011')?.id ?? todayReservations[0]?.id ?? '';
  const [selectedId, setSelectedId] = useState<string>(defaultId);

  const reservation: Reservation | undefined = todayReservations.find((r) => r.id === selectedId);

  const customer: Customer | undefined = useMemo(() => {
    if (!reservation) return undefined;
    return customers.find(
      (c) => c.name.toLowerCase() === reservation.name.toLowerCase(),
    );
  }, [customers, reservation]);

  const startScan = () => {
    if (!reservation) return;
    setPhase('scanning');
    setTimeout(() => setPhase('computing'), 1500);
    setTimeout(() => {
      setResult(computeResult(reservation.time));
      setPhase('done');
    }, 2300);
  };

  const resetScan = () => {
    setPhase('idle');
    setResult(null);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    resetScan();
  };

  const afterPunctuality = customer && result
    ? Math.max(1, Math.min(5, customer.ratings.punctuality + result.delta))
    : undefined;

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb
            items={[
              { label: 'Panoramica', href: '/overview' },
              { label: 'CRM', href: '/crm' },
              { label: 'Check-in QR' },
            ]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader
            title="Check-in Cliente con QR Code"
            subtitle="All'arrivo, lo staff inquadra il QR code della prenotazione. Il sistema calcola lo scostamento orario e aggiorna automaticamente il rating di puntualita del cliente."
          />
        </motion.div>

        {/* Two-column layout */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-5">
            {/* Reservation selector */}
            <Card padding="md">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">
                Prenotazione in arrivo
              </p>
              <div className="relative">
                <select
                  value={selectedId}
                  onChange={(e) => handleSelect(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-300/70 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-900 focus:outline-none focus:border-accent-gold cursor-pointer"
                >
                  {todayReservations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.time} — {r.name} — {r.covers} {r.covers === 1 ? 'coperto' : 'coperti'}
                    </option>
                  ))}
                </select>
                <ArrowRight className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>

              {reservation && (
                <div className="mt-5 grid grid-cols-2 gap-3 pt-5 border-t border-gray-200">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Cliente</p>
                    <p className="text-base font-semibold text-gray-900">{reservation.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Orario prenotato</p>
                    <p className="text-base font-semibold text-gray-900 font-mono flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-accent-gold" />
                      {reservation.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Coperti</p>
                    <p className="text-base font-semibold text-gray-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-accent-gold" />
                      {reservation.covers}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Storico visite</p>
                    {customer ? (
                      <p className="text-base font-semibold text-gray-900">
                        {customer.totalVisits} visite
                        <span className="text-xs text-gray-500 font-normal ml-1.5">
                          score {customer.compositeScore}
                        </span>
                      </p>
                    ) : (
                      <p className="text-base font-semibold text-accent-gold">Nuovo cliente</p>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* QR scan simulator */}
            <Card padding="none" className="overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-black border-0">
              <div className="p-6 sm:p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-6 text-center">
                  Simulatore Scansione QR
                </p>

                <AnimatePresence mode="wait">
                  {phase === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="relative w-[180px] h-[180px] rounded-2xl bg-white/95 p-2.5 mb-6 shadow-[0_0_40px_rgba(201,169,98,0.15)]">
                        <StylizedQR size={160} />
                      </div>
                      <p className="text-white font-semibold mb-1.5">Inquadra il QR code della prenotazione</p>
                      <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-6">
                        Il cliente mostra il codice sul telefono o stampato.
                        Un tap dell'iPad lo registra in sistema.
                      </p>
                      <Button onClick={startScan}>Simula Scansione</Button>
                    </motion.div>
                  )}

                  {phase === 'scanning' && (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="relative w-[180px] h-[180px] rounded-2xl bg-white/95 p-2.5 mb-6 overflow-hidden">
                        <StylizedQR size={160} />
                        {/* corner brackets */}
                        <div className="absolute inset-2.5 pointer-events-none">
                          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-accent-gold rounded-tl" />
                          <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-accent-gold rounded-tr" />
                          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-accent-gold rounded-bl" />
                          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-accent-gold rounded-br" />
                        </div>
                        {/* scan line */}
                        <motion.div
                          className="absolute left-2.5 right-2.5 h-0.5 bg-accent-gold shadow-[0_0_12px_rgba(201,169,98,0.8)]"
                          initial={{ top: 10 }}
                          animate={{ top: [10, 170, 10] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </div>
                      <p className="text-white font-medium mb-1">Lettura QR in corso...</p>
                      <p className="text-xs text-gray-400">Verifica prenotazione nel database</p>
                    </motion.div>
                  )}

                  {phase === 'computing' && (
                    <motion.div
                      key="computing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center py-8"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center mb-6">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <ScanLine className="w-8 h-8 text-accent-gold" />
                        </motion.div>
                      </div>
                      <p className="text-white font-medium mb-1">Calcolo scostamento orario...</p>
                      <p className="text-xs text-gray-400">Aggiornamento rating di puntualita</p>
                    </motion.div>
                  )}

                  {phase === 'done' && result && reservation && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="relative w-[180px] h-[180px] rounded-2xl bg-white/95 p-2.5 mb-6">
                        <StylizedQR size={160} />
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.15, 1], opacity: 1 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <motion.div
                            className="w-16 h-16 rounded-full bg-success flex items-center justify-center shadow-[0_0_28px_rgba(34,197,94,0.5)]"
                            animate={{ scale: [1, 1.06, 1] }}
                            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1 }}
                          >
                            <Check className="w-8 h-8 text-white" strokeWidth={3} />
                          </motion.div>
                        </motion.div>
                      </div>

                      <Badge variant={result.badge.variant} size="lg" className="mb-4">
                        {result.badge.label}
                      </Badge>

                      <p className="text-white font-semibold mb-1">Check-in registrato</p>
                      <p className="text-xs text-gray-400 mb-6">
                        Arrivo alle <span className="font-mono text-white">{result.arrivalTime}</span>
                        {' '}·{' '}
                        {result.delayMinutes > 0
                          ? `${result.delayMinutes} min di ritardo`
                          : result.delayMinutes < 0
                            ? `${Math.abs(result.delayMinutes)} min in anticipo`
                            : 'in orario esatto'}
                      </p>

                      <Button variant="secondary" size="sm" onClick={resetScan} className="!border-white !text-white hover:!bg-white hover:!text-gray-900">
                        <span className="inline-flex items-center gap-2">
                          <RotateCcw className="w-3.5 h-3.5" />
                          Nuova scansione
                        </span>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN — Rating impact */}
          <div className="flex flex-col gap-5">
            <Card padding="lg" className="h-full">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                    Impatto sul Rating
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900">Puntualita</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-gold" />
                </div>
              </div>

              {/* Customer preview */}
              {customer ? (
                <>
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                      style={{ background: `hsl(${customer.hue}, 55%, 45%)` }}
                    >
                      {customer.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {customer.firstName ? `${customer.firstName} ` : ''}{customer.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Score composito {customer.compositeScore} · tier {customer.tier}
                      </p>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {phase !== 'done' && (
                      <motion.div
                        key="before"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">
                          Rating attuali
                        </p>
                        <RatingBar label="Puntualita" value={customer.ratings.punctuality} />
                        <RatingBar label="Affidabilita" value={customer.ratings.reliability} />
                        <RatingBar label="Comportamento" value={customer.ratings.behavior} />
                      </motion.div>
                    )}

                    {phase === 'done' && result && afterPunctuality !== undefined && (
                      <motion.div
                        key="after"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4">
                          Puntualita — Prima / Dopo
                        </p>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-5">
                          <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-200">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Prima</p>
                            <p className="text-3xl font-bold text-gray-900 font-mono">
                              {customer.ratings.punctuality.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex flex-col items-center">
                            {result.delta < 0 ? (
                              <TrendingDown className="w-7 h-7 text-danger" />
                            ) : result.delta > 0 ? (
                              <TrendingUp className="w-7 h-7 text-success" />
                            ) : (
                              <ArrowRight className="w-7 h-7 text-gray-400" />
                            )}
                            <p
                              className={`text-xs font-mono font-semibold mt-1 ${
                                result.delta < 0 ? 'text-danger' : result.delta > 0 ? 'text-success' : 'text-gray-500'
                              }`}
                            >
                              {result.delta > 0 ? '+' : ''}
                              {result.delta.toFixed(2)}
                            </p>
                          </div>
                          <div
                            className={`text-center p-4 rounded-xl border-2 ${
                              result.delta < 0 ? 'bg-danger/5 border-danger/30' : result.delta > 0 ? 'bg-success/5 border-success/30' : 'bg-gray-50 border-gray-300'
                            }`}
                          >
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Dopo</p>
                            <p className={`text-3xl font-bold font-mono ${
                              result.delta < 0 ? 'text-danger' : result.delta > 0 ? 'text-success' : 'text-gray-900'
                            }`}>
                              <CountUp end={afterPunctuality} decimals={2} duration={1.2} />
                            </p>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-900 text-white mb-4">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">
                            Registrazione
                          </p>
                          <p className="text-sm leading-relaxed">
                            Arrivo registrato alle{' '}
                            <span className="font-mono font-semibold text-accent-gold">{result.arrivalTime}</span>
                            {' — '}
                            <span className="font-semibold">
                              {result.delayMinutes > 0
                                ? `${result.delayMinutes} min in ritardo`
                                : result.delayMinutes < 0
                                  ? `${Math.abs(result.delayMinutes)} min in anticipo`
                                  : 'in orario'}
                            </span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <UserCircle2 className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Nessuno storico</p>
                  <p className="text-sm text-gray-500 mb-6 max-w-xs">
                    Il cliente non risulta nel database. Sara creato automaticamente al check-in.
                  </p>
                  <div className="w-full max-w-[240px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-widest text-gray-400">Puntualita</span>
                      <span className="text-sm font-mono text-gray-400">— —</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-widest text-gray-400">Affidabilita</span>
                      <span className="text-sm font-mono text-gray-400">— —</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-gray-400">Comportamento</span>
                      <span className="text-sm font-mono text-gray-400">— —</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rule card */}
              <div className="mt-auto pt-6 border-t border-gray-200">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Regola applicata
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Scostamento &gt; 15 min{' '}
                  <ArrowRight className="w-3 h-3 inline text-gray-400 mx-0.5" />
                  {' '}Puntualita riduce di{' '}
                  <span className="font-mono font-semibold text-warning">0.15</span>{' '}
                  punti. Scostamento &gt; 30 min{' '}
                  <ArrowRight className="w-3 h-3 inline text-gray-400 mx-0.5" />
                  {' '}
                  <span className="font-mono font-semibold text-danger">-0.35</span>
                  {' '}punti.
                </p>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Below: Come funziona in sala */}
        <Section
          title="Come funziona in sala"
          subtitle="Tre gesti, nessun inserimento manuale. Il check-in diventa un rituale invisibile."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { num: '01', title: 'Il cliente arriva', desc: "Presenta il QR code via smartphone o stampato", icon: Smartphone },
              { num: '02', title: 'Staff scansiona', desc: "Un tap dall'app EasyRest sull'iPad", icon: Tablet },
              { num: '03', title: 'Rating aggiornato', desc: 'In automatico, nel database cliente', icon: Database },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card padding="lg" className="h-full">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-accent-gold flex items-center justify-center text-primary-black font-bold text-sm shrink-0">
                      {step.num}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <step.icon className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1.5">{step.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Summary strip */}
        <motion.div variants={itemVariants} className="mb-16">
          <Card padding="lg" className="bg-gradient-to-r from-gray-900 via-gray-900 to-black border-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-white">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Prenotazioni oggi</p>
                <p className="text-2xl font-bold">
                  <CountUp end={todayReservations.length} duration={1.5} />
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Clienti a catalogo</p>
                <p className="text-2xl font-bold">
                  <CountUp end={customers.length} duration={1.5} />
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Tempo scansione</p>
                <p className="text-2xl font-bold">
                  <QrCode className="inline w-5 h-5 text-accent-gold mr-1.5" />
                  &lt; 2s
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Soglia ritardo</p>
                <p className="text-2xl font-bold">
                  <Clock className="inline w-5 h-5 text-accent-gold mr-1.5" />
                  15 min
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* EE Partners branding */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-8 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );
}
