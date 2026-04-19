import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Trophy, Medal, Gift, Mail, QrCode, Sparkles,
  Smartphone, CalendarClock, Send, CheckCircle2, X, Ticket, Wallet,
} from 'lucide-react';
import { Card, Badge, Button, CountUp } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { formatCurrency, formatDate } from '../../utils/calculations';
import type { Customer, LoyaltyReward } from '../../types';

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

const CURRENT_MONTH = '2026-02';
const CURRENT_MONTH_LABEL = 'Febbraio 2026';

// ---------------------------------------------------------------------------
// QR SVG (deterministic, 21x21 cells, viewBox 0 0 21 21)
// ---------------------------------------------------------------------------

function cellFilled(seed: string, x: number, y: number): boolean {
  let acc = 0;
  for (let i = 0; i < seed.length; i++) {
    acc += seed.charCodeAt(i) + x * 13 + y * 7 + i * 31;
  }
  return acc % 2 === 0;
}

function isPositioningCell(x: number, y: number): boolean {
  // top-left 7x7
  if (x < 7 && y < 7) return true;
  // top-right 7x7
  if (x >= 14 && y < 7) return true;
  // bottom-left 7x7
  if (x < 7 && y >= 14) return true;
  return false;
}

function positioningFill(x: number, y: number): boolean {
  // Normalize into the 7x7 marker
  const lx = x >= 14 ? x - 14 : x;
  const ly = y >= 14 ? y - 14 : y;
  // outer ring (rows 0,6 or cols 0,6) -> filled
  if (lx === 0 || lx === 6 || ly === 0 || ly === 6) return true;
  // inner 3x3 block at cols/rows 2-4 -> filled
  if (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) return true;
  return false;
}

interface QrSvgProps {
  seed: string;
  size?: number;
  className?: string;
}

function QrSvg({ seed, size = 220, className = '' }: QrSvgProps) {
  const cells: { x: number; y: number; filled: boolean }[] = [];
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const filled = isPositioningCell(x, y)
        ? positioningFill(x, y)
        : cellFilled(seed, x, y);
      cells.push({ x, y, filled });
    }
  }
  return (
    <svg
      viewBox="0 0 21 21"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect x={0} y={0} width={21} height={21} fill="#FFFFFF" />
      {cells.filter((c) => c.filled).map((c) => (
        <rect
          key={`${c.x}-${c.y}`}
          x={c.x}
          y={c.y}
          width={1}
          height={1}
          fill={isPositioningCell(c.x, c.y) ? '#0A0A0A' : '#0A0A0A'}
        />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const rewardTypeMeta: Record<LoyaltyReward['rewardType'], { label: string; color: string; text: string }> = {
  tasting:   { label: 'Menu degustazione', color: 'bg-accent-gold',    text: 'text-white' },
  bottiglia: { label: 'Bottiglia in omaggio', color: 'bg-primary-black', text: 'text-white' },
  upgrade:   { label: 'Upgrade tavolo',    color: 'bg-gray-600',       text: 'text-white' },
  aperitivo: { label: 'Aperitivo della casa', color: 'bg-accent-gold-dark', text: 'text-white' },
  dessert:   { label: 'Dessert omaggio',   color: 'bg-[#a16207]',      text: 'text-white' },
};

function rankLabel(n: number): string {
  return n.toString().padStart(2, '0');
}

function mediumDate(d: string): string {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Podium block (one of 3)
// ---------------------------------------------------------------------------

interface PodiumBlockProps {
  reward: LoyaltyReward;
  customer?: Customer;
  rank: 1 | 2 | 3;
  delay: number;
  origin: 'left' | 'center' | 'right';
  onShowQr: () => void;
  showingQr: boolean;
}

function PodiumBlock({ reward, customer, rank, delay, origin, onShowQr, showingQr }: PodiumBlockProps) {
  const rankMeta = {
    1: { order: 'order-1 md:order-2', height: 'h-56 md:h-64', accent: 'bg-accent-gold', ring: 'ring-accent-gold', icon: Crown, chip: 'text-accent-gold', tone: 'bg-gradient-to-b from-accent-gold/15 to-white' },
    2: { order: 'order-2 md:order-1', height: 'h-48 md:h-56', accent: 'bg-gray-400',     ring: 'ring-gray-300',    icon: Trophy, chip: 'text-gray-500', tone: 'bg-gradient-to-b from-gray-100 to-white' },
    3: { order: 'order-3 md:order-3', height: 'h-40 md:h-48', accent: 'bg-[#a16207]',    ring: 'ring-[#d4a862]',    icon: Medal,  chip: 'text-[#a16207]', tone: 'bg-gradient-to-b from-[#f2e0bf]/60 to-white' },
  }[rank];

  const RankIcon = rankMeta.icon;
  const initials = customer?.initials ?? reward.customerName.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();
  const hue = customer?.hue ?? 40;
  const compositeScore = customer?.compositeScore ?? 0;
  const meta = rewardTypeMeta[reward.rewardType];

  const initial = origin === 'center'
    ? { opacity: 0, scale: 0.8, y: 24 }
    : origin === 'left'
      ? { opacity: 0, x: -48 }
      : { opacity: 0, x: 48 };

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      transition={{ delay, duration: 0.6, type: 'spring', stiffness: 110, damping: 14 }}
      className={`flex flex-col items-center ${rankMeta.order} w-full md:w-1/3`}
    >
      {/* Crown / trophy icon */}
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 + rank, delay: delay + 0.2 }}
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${rank === 1 ? 'bg-accent-gold text-white shadow-lg shadow-accent-gold/40' : rank === 2 ? 'bg-gray-200 text-gray-600' : 'bg-[#e6c78a] text-[#6b3f00]'}`}
      >
        <RankIcon className="w-5 h-5" />
      </motion.div>

      {/* Avatar */}
      <div className={`w-16 h-16 rounded-full ring-4 ${rankMeta.ring} ring-offset-2 ring-offset-white flex items-center justify-center text-white text-lg font-semibold shrink-0 mb-3`}
        style={{ backgroundColor: `hsl(${hue}, 55%, 42%)` }}
      >
        {initials}
      </div>

      {/* Block */}
      <div className={`relative w-full ${rankMeta.height} ${rankMeta.tone} rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col items-center justify-start px-4 pt-5`}
      >
        <div className={`absolute top-0 left-0 right-0 h-1 ${rankMeta.accent}`} />

        <span className={`text-[10px] uppercase tracking-[0.22em] font-medium ${rankMeta.chip}`}>
          {rank === 1 ? '1o posto' : rank === 2 ? '2o posto' : '3o posto'}
        </span>

        <p className="mt-2 text-base font-semibold text-gray-900 text-center leading-tight">
          {reward.customerName}
        </p>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">{compositeScore.toFixed(0)}</span>
          <span className="text-xs text-gray-500">/100</span>
        </div>

        <div className="mt-3 w-full">
          <div className={`text-[10px] uppercase tracking-widest text-gray-500 text-center`}>Premio assegnato</div>
          <div className={`mt-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-center ${meta.color} ${meta.text} mx-auto w-fit`}>
            {meta.label}
          </div>
          <p className="mt-2 text-xs text-gray-600 text-center leading-snug px-1">
            {reward.rewardLabel}
          </p>
        </div>

        <button
          onClick={onShowQr}
          className={`mt-auto mb-4 inline-flex items-center gap-1.5 text-[11px] font-medium ${showingQr ? 'text-accent-gold' : 'text-gray-600 hover:text-accent-gold'} transition-colors cursor-pointer`}
        >
          <QrCode className="w-3.5 h-3.5" />
          {showingQr ? 'QR in anteprima' : 'Mostra QR'}
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function LoyaltyPage() {
  const { customers, loyaltyRewards, redeemReward, getCustomerById } = useStore();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [justRedeemed, setJustRedeemed] = useState<string | null>(null);

  const monthRewards = useMemo(
    () => loyaltyRewards
      .filter((r) => r.month === CURRENT_MONTH)
      .sort((a, b) => a.rank - b.rank),
    [loyaltyRewards],
  );

  const top3 = monthRewards.slice(0, 3);
  const ranks4to10 = monthRewards.slice(3, 10);

  const issuedCount = monthRewards.length;
  const redeemedCount = loyaltyRewards.filter((r) => r.redeemedAt).length;
  const totalValue = monthRewards.reduce((sum, r) => sum + r.value, 0);

  const preview = useMemo(
    () => previewId ? loyaltyRewards.find((r) => r.id === previewId) : undefined,
    [loyaltyRewards, previewId],
  );

  const handleRedeem = (id: string) => {
    redeemReward(id);
    setJustRedeemed(id);
    setTimeout(() => setJustRedeemed(null), 1800);
  };

  // Reward type distribution (month)
  const distribution = useMemo(() => {
    const counts: Record<LoyaltyReward['rewardType'], number> = {
      tasting: 0, bottiglia: 0, upgrade: 0, aperitivo: 0, dessert: 0,
    };
    monthRewards.forEach((r) => { counts[r.rewardType] += 1; });
    const total = monthRewards.length || 1;
    const slices: { type: LoyaltyReward['rewardType']; count: number; pct: number; color: string; label: string }[] = [];
    (Object.keys(counts) as LoyaltyReward['rewardType'][]).forEach((type) => {
      if (counts[type] > 0) {
        slices.push({
          type,
          count: counts[type],
          pct: (counts[type] / total) * 100,
          color: { tasting: '#C9A962', bottiglia: '#0A0A0A', upgrade: '#4B5563', aperitivo: '#A88B4A', dessert: '#a16207' }[type],
          label: rewardTypeMeta[type].label,
        });
      }
    });
    return slices;
  }, [monthRewards]);

  // Donut path generation
  const donutSlices = useMemo(() => {
    let cumulative = 0;
    const radius = 60;
    const innerRadius = 38;
    const cx = 80;
    const cy = 80;
    const toXY = (angle: number, r: number) => [
      cx + r * Math.cos(angle),
      cy + r * Math.sin(angle),
    ];
    return distribution.map((s) => {
      const startAngle = (cumulative / 100) * Math.PI * 2 - Math.PI / 2;
      cumulative += s.pct;
      const endAngle = (cumulative / 100) * Math.PI * 2 - Math.PI / 2;
      const [x1, y1] = toXY(startAngle, radius);
      const [x2, y2] = toXY(endAngle, radius);
      const [x3, y3] = toXY(endAngle, innerRadius);
      const [x4, y4] = toXY(startAngle, innerRadius);
      const largeArc = s.pct > 50 ? 1 : 0;
      const d = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
        'Z',
      ].join(' ');
      return { ...s, d };
    });
  }, [distribution]);

  const kpis = [
    { label: 'Premi emessi questo mese', value: issuedCount,    icon: Ticket, decimals: 0, prefix: '', suffix: '' },
    { label: 'Premi gia riscattati',     value: redeemedCount,  icon: CheckCircle2, decimals: 0, prefix: '', suffix: '' },
    { label: 'Valore totale in premi',   value: totalValue,     icon: Wallet, decimals: 0, prefix: 'EUR ', suffix: '' },
  ];

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
              { label: 'CRM', href: '/crm' },
              { label: 'Loyalty e Premi' },
            ]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader
            title="Top Customer del Mese"
            subtitle="Ogni mese, il sistema premia automaticamente i 10 clienti con il composite score piu' alto. Il QR code viene inviato via email/push ed e' riscattabile al POS."
            badge={<Badge variant="gold">{CURRENT_MONTH_LABEL}</Badge>}
          />
        </motion.div>

        {/* KPI strip */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
            >
              <Card className="flex items-center gap-4">
                <motion.div
                  className="w-11 h-11 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ delay: 1 + i * 0.3, duration: 2, repeat: Infinity, repeatDelay: 4 }}
                >
                  <kpi.icon className="w-5 h-5 text-accent-gold" />
                </motion.div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                  <p className="text-xl font-bold text-gray-900">
                    <CountUp end={kpi.value} decimals={kpi.decimals} prefix={kpi.prefix} suffix={kpi.suffix} duration={2} separator="." />
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Hero podium */}
        <Section title="Il podio del mese" subtitle="Il sistema ha calcolato il composite score a fine periodo e premiato i primi tre profili.">
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-white via-white to-accent-gold/5" padding="lg">
              {top3.length >= 3 ? (
                <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6">
                  <PodiumBlock
                    reward={top3[1]}
                    customer={getCustomerById(top3[1].customerId)}
                    rank={2}
                    delay={0.35}
                    origin="left"
                    onShowQr={() => setPreviewId(top3[1].id)}
                    showingQr={previewId === top3[1].id}
                  />
                  <PodiumBlock
                    reward={top3[0]}
                    customer={getCustomerById(top3[0].customerId)}
                    rank={1}
                    delay={0.05}
                    origin="center"
                    onShowQr={() => setPreviewId(top3[0].id)}
                    showingQr={previewId === top3[0].id}
                  />
                  <PodiumBlock
                    reward={top3[2]}
                    customer={getCustomerById(top3[2].customerId)}
                    rank={3}
                    delay={0.55}
                    origin="right"
                    onShowQr={() => setPreviewId(top3[2].id)}
                    showingQr={previewId === top3[2].id}
                  />
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-accent-gold/10 flex items-center justify-center mb-4">
                    <Crown className="w-6 h-6 text-accent-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">In attesa del calcolo mensile</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    I premi di {CURRENT_MONTH_LABEL} verranno generati automaticamente alla chiusura del mese, in base al composite score di ogni cliente.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </Section>

        {/* Ranks 4-10 */}
        <Section title="Dal 4o al 10o posto" subtitle="Sette profili che ricevono comunque un riconoscimento automatico.">
          <motion.div variants={itemVariants}>
            <Card padding="none">
              {ranks4to10.length > 0 ? (
                <ul className="divide-y divide-gray-200/70">
                  {ranks4to10.map((reward, i) => {
                    const customer = getCustomerById(reward.customerId);
                    const initials = customer?.initials ?? reward.customerName.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();
                    const hue = customer?.hue ?? 30;
                    const score = customer?.compositeScore ?? 0;
                    const meta = rewardTypeMeta[reward.rewardType];
                    const isOpen = previewId === reward.id;

                    return (
                      <motion.li
                        key={reward.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.06, duration: 0.35 }}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        <div className="w-12 shrink-0 text-right">
                          <span className="text-2xl font-bold font-mono text-accent-gold">
                            {rankLabel(reward.rank)}
                          </span>
                        </div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                          style={{ backgroundColor: `hsl(${hue}, 55%, 42%)` }}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{reward.customerName}</p>
                          <p className="text-[11px] text-gray-500 truncate">{reward.rewardLabel}</p>
                        </div>
                        <div className="hidden sm:block w-20 text-right">
                          <p className="text-[10px] uppercase tracking-widest text-gray-400">Score</p>
                          <p className="text-sm font-bold text-gray-900">{score.toFixed(0)}<span className="text-gray-400 text-xs">/100</span></p>
                        </div>
                        <div className="hidden md:block">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${meta.color} ${meta.text}`}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="w-24 text-right">
                          {reward.redeemedAt ? (
                            <Badge variant="success" size="sm">Riscattato</Badge>
                          ) : (
                            <Badge variant="gold" size="sm">Da riscattare</Badge>
                          )}
                        </div>
                        <button
                          onClick={() => setPreviewId(isOpen ? null : reward.id)}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${isOpen ? 'border-accent-gold text-accent-gold bg-accent-gold/5' : 'border-gray-200 text-gray-600 hover:border-accent-gold hover:text-accent-gold'}`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          {isOpen ? 'QR aperto' : 'Mostra QR'}
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-5 py-10 text-center text-sm text-gray-500">
                  La classifica 4o-10o verra' popolata quando i dati del mese saranno consolidati.
                </div>
              )}
            </Card>
          </motion.div>
        </Section>

        {/* QR Preview panel */}
        <AnimatePresence>
          {preview && (
            <motion.div
              key={preview.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setPreviewId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-primary-black text-white px-6 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-accent-gold font-medium">Premio #{rankLabel(preview.rank)}</p>
                    <h3 className="text-lg font-semibold mt-0.5">{preview.customerName}</h3>
                  </div>
                  <button
                    onClick={() => setPreviewId(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Chiudi"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* QR frame */}
                <div className="px-6 py-6 bg-gradient-to-b from-accent-gold/5 to-white">
                  <div className="relative mx-auto w-fit">
                    <div className="rounded-2xl border-2 border-accent-gold p-4 bg-white shadow-sm">
                      <QrSvg seed={preview.qrCode} size={220} />
                    </div>

                    <AnimatePresence>
                      {justRedeemed === preview.id && (
                        <motion.div
                          key="ok"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.2 }}
                          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                          className="absolute inset-0 rounded-2xl bg-success/15 flex items-center justify-center backdrop-blur-[1px]"
                        >
                          <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: [0.5, 1.15, 1] }}
                            transition={{ duration: 0.7 }}
                            className="w-20 h-20 rounded-full bg-success text-white flex items-center justify-center shadow-xl"
                          >
                            <CheckCircle2 className="w-10 h-10" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="mt-3 text-center text-[11px] text-gray-500 font-mono tracking-widest">
                    {preview.qrCode}
                  </p>
                </div>

                {/* Details */}
                <div className="px-6 pb-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">Tipo</p>
                      <p className="text-sm font-semibold text-gray-900">{rewardTypeMeta[preview.rewardType].label}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">Valore</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(preview.value)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">Emesso il</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(preview.issuedAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">Scade il</p>
                      <p className="text-sm font-semibold text-gray-900">{mediumDate(preview.expiresAt)}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200/70">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Premio</p>
                    <p className="text-sm text-gray-800">{preview.rewardLabel}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">Stato</span>
                    {preview.redeemedAt ? (
                      <Badge variant="success" size="md">
                        Riscattato il {formatDate(preview.redeemedAt)}
                      </Badge>
                    ) : (
                      <Badge variant="gold" size="md">Da riscattare</Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between gap-3 bg-white">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewId(null)}>
                    Chiudi
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => !preview.redeemedAt && handleRedeem(preview.id)}
                    disabled={!!preview.redeemedAt}
                  >
                    {preview.redeemedAt ? 'Gia riscattato' : 'Segna come riscattato'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works ribbon */}
        <Section title="Come funziona la premiazione" subtitle="Un flusso completamente automatico, dal calcolo al POS.">
          <motion.div variants={itemVariants}>
            <Card className="bg-primary-black text-white border-gray-800" padding="lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { number: '01', icon: Sparkles,     title: 'Calcolo automatico',   desc: 'A fine mese viene aggiornato il composite score di ogni cliente sulla base di puntualita\', affidabilita\' e comportamento.' },
                  { number: '02', icon: Trophy,       title: 'Selezione Top 10',      desc: 'Il sistema ordina i clienti per rating, frequenza di visita e spesa complessiva.' },
                  { number: '03', icon: QrCode,       title: 'QR unico per premio',   desc: 'Ogni ricompensa riceve un codice univoco, tracciabile e non duplicabile.' },
                  { number: '04', icon: Send,         title: 'Invio e tracking POS',  desc: 'Email e push al cliente, riscatto tracciato alla cassa alla visita successiva.' },
                ].map((step, i) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[11px] font-mono tracking-widest text-accent-gold">{step.number}</span>
                      <span className="h-px flex-1 bg-gray-800" />
                      <motion.div
                        className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 + i, delay: i * 0.4 }}
                      >
                        <step.icon className="w-5 h-5 text-accent-gold" />
                      </motion.div>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-accent-gold" />
                    <span>Notifica email</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-accent-gold" />
                    <span>Push app</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-accent-gold" />
                    <span>Validita' 60 giorni</span>
                  </div>
                </div>
                <p className="text-[11px] uppercase tracking-widest text-gray-500">
                  Tracking integrato al POS
                </p>
              </div>
            </Card>
          </motion.div>
        </Section>

        {/* Reward type distribution */}
        <Section title="Tipologia di premio" subtitle="Ripartizione delle ricompense emesse questo mese.">
          <motion.div variants={itemVariants}>
            <Card padding="lg">
              {distribution.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <motion.div
                    initial={{ rotate: -90, opacity: 0 }}
                    whileInView={{ rotate: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                    className="shrink-0"
                  >
                    <svg viewBox="0 0 160 160" width={180} height={180}>
                      {donutSlices.map((slice, i) => (
                        <motion.path
                          key={slice.type}
                          d={slice.d}
                          fill={slice.color}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                        />
                      ))}
                      <circle cx={80} cy={80} r={36} fill="#FFFFFF" />
                      <text x={80} y={74} textAnchor="middle" className="font-bold" style={{ fill: '#0A0A0A', fontSize: 18 }}>
                        {issuedCount}
                      </text>
                      <text x={80} y={94} textAnchor="middle" style={{ fill: '#6B7280', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                        PREMI
                      </text>
                    </svg>
                  </motion.div>
                  <div className="flex-1 w-full">
                    <ul className="space-y-3">
                      {distribution.map((s, i) => (
                        <motion.li
                          key={s.type}
                          initial={{ opacity: 0, x: 12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                          className="flex items-center gap-4"
                        >
                          <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">{s.label}</span>
                              <span className="text-xs text-gray-500">
                                {s.count} · {s.pct.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: s.color }}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${s.pct}%` }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 + i * 0.08, duration: 0.8 }}
                              />
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-accent-gold/10 flex items-center justify-center mb-3">
                    <Gift className="w-5 h-5 text-accent-gold" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Nessun premio emesso in {CURRENT_MONTH_LABEL}.<br />
                    I dati popoleranno automaticamente la distribuzione.
                  </p>
                </div>
              )}
              <p className="mt-6 pt-4 border-t border-gray-100 text-[11px] uppercase tracking-widest text-gray-400 text-center">
                {customers.length} clienti monitorati nel ciclo di calcolo
              </p>
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
