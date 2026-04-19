import { Fragment, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, Star, Wallet, Repeat, ChevronDown, ArrowUpDown,
  UsersRound, PhoneCall, CalendarDays, Sparkles,
} from 'lucide-react';
import { Card, Badge, CountUp, Button } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { formatCurrency, formatDate, formatDateShort } from '../../utils/calculations';
import type { Customer, CustomerTier } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

type TierFilter = 'tutti' | CustomerTier;
type SortKey = 'composite' | 'lastVisit' | 'totalVisits' | 'totalSpent';
type SortDir = 'asc' | 'desc';

const tierFilterOptions: { id: TierFilter; label: string }[] = [
  { id: 'tutti',    label: 'Tutti' },
  { id: 'platinum', label: 'Platinum' },
  { id: 'gold',     label: 'Gold' },
  { id: 'silver',   label: 'Silver' },
  { id: 'bronze',   label: 'Bronze' },
  { id: 'new',      label: 'Nuovo' },
];

const sortOptions: { id: SortKey; label: string }[] = [
  { id: 'composite',   label: 'Composite Score' },
  { id: 'lastVisit',   label: 'Ultima visita' },
  { id: 'totalVisits', label: 'Visite totali' },
  { id: 'totalSpent',  label: 'Spesa totale' },
];

const tierSwatches: Record<CustomerTier, string> = {
  platinum: 'bg-primary-black',
  gold:     'bg-accent-gold',
  silver:   'bg-gray-500',
  bronze:   'bg-[#a16207]',
  new:      'bg-gray-300',
};

const tierLabel: Record<CustomerTier, string> = {
  platinum: 'Platinum',
  gold:     'Gold',
  silver:   'Silver',
  bronze:   'Bronze',
  new:      'Nuovo',
};

function TierBadge({ tier }: { tier: CustomerTier }) {
  if (tier === 'platinum') {
    return (
      <span className="inline-flex items-center rounded-full font-medium border px-3 py-1 text-xs bg-primary-black text-accent-gold border-accent-gold">
        Platinum
      </span>
    );
  }
  if (tier === 'gold')   return <Badge variant="gold" size="md">Gold</Badge>;
  if (tier === 'silver') return <Badge variant="default" size="md">Silver</Badge>;
  if (tier === 'bronze') {
    return (
      <span className="inline-flex items-center rounded-full font-medium border px-3 py-1 text-xs bg-amber-100 text-amber-800 border-amber-300">
        Bronze
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full font-medium border border-dashed px-3 py-1 text-xs bg-accent-gold/10 text-accent-gold border-accent-gold/40">
      Nuovo
    </span>
  );
}

function RatingMini({ ratings }: { ratings: Customer['ratings'] }) {
  const cols: { label: string; value: number }[] = [
    { label: 'P', value: ratings.punctuality },
    { label: 'A', value: ratings.reliability },
    { label: 'C', value: ratings.behavior },
  ];
  return (
    <div className="flex items-end gap-1.5">
      {cols.map((c) => (
        <div key={c.label} className="flex flex-col items-center gap-1">
          <div className="h-10 w-2 rounded-full bg-gray-100 overflow-hidden flex items-end">
            <motion.div
              className="w-full bg-accent-gold rounded-full"
              initial={{ height: 0 }}
              animate={{ height: `${(c.value / 5) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
            />
          </div>
          <span className="text-[9px] font-mono text-gray-500 tracking-wider">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function RatingRing({ value, label }: { value: number; label: string }) {
  const pct = Math.min(100, (value / 5) * 100);
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[60px] h-[60px]">
        <svg width="60" height="60" viewBox="0 0 60 60" className="-rotate-90">
          <circle cx="30" cy="30" r={r} fill="none" stroke="#F3F4F6" strokeWidth="5" />
          <motion.circle
            cx="30" cy="30" r={r}
            fill="none"
            stroke="#C9A962"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-900">{value.toFixed(1)}</span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-gray-500">{label}</span>
    </div>
  );
}

export function CustomersPage() {
  const { customers, customerVisits, getVisitsForCustomer } = useStore();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('tutti');
  const [sortKey, setSortKey] = useState<SortKey>('composite');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const recurringCount = useMemo(
    () => customers.filter((c) => c.totalVisits >= 3).length,
    [customers],
  );

  const avgScore = useMemo(() => {
    if (customers.length === 0) return 0;
    return customers.reduce((s, c) => s + c.compositeScore, 0) / customers.length;
  }, [customers]);

  const avgSpend = useMemo(() => {
    if (customers.length === 0) return 0;
    return customers.reduce((s, c) => s + c.avgSpendPerVisit, 0) / customers.length;
  }, [customers]);

  const tierCounts = useMemo(() => {
    const counts: Record<CustomerTier, number> = { platinum: 0, gold: 0, silver: 0, bronze: 0, new: 0 };
    customers.forEach((c) => { counts[c.tier] += 1; });
    return counts;
  }, [customers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = customers.filter((c) => {
      if (tierFilter !== 'tutti' && c.tier !== tierFilter) return false;
      if (!q) return true;
      const hay = `${c.name} ${c.firstName ?? ''} ${c.phone}`.toLowerCase();
      return hay.includes(q);
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'composite')   cmp = a.compositeScore - b.compositeScore;
      if (sortKey === 'lastVisit')   cmp = a.lastVisit < b.lastVisit ? -1 : a.lastVisit > b.lastVisit ? 1 : 0;
      if (sortKey === 'totalVisits') cmp = a.totalVisits - b.totalVisits;
      if (sortKey === 'totalSpent')  cmp = a.totalSpent - b.totalSpent;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [customers, search, tierFilter, sortKey, sortDir]);

  const totalForDistribution = customers.length || 1;

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[
            { label: 'Panoramica', href: '/overview' },
            { label: 'CRM', href: '/crm' },
            { label: 'Database Clienti' },
          ]} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader
            title="Database Clienti"
            subtitle="Storico completo, rating multidimensionale, spesa e visite. Ogni record si aggiorna automaticamente a ogni interazione in sala."
          />
        </motion.div>

        {/* KPI strip */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Clienti totali',           value: customers.length, icon: Users,  decimals: 0 },
            { label: 'Clienti ricorrenti',       value: recurringCount,   icon: Repeat, decimals: 0 },
            { label: 'Rating medio composito',   value: avgScore,         icon: Star,   decimals: 1 },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
            >
              <Card className="flex items-center gap-4">
                <motion.div
                  className="w-11 h-11 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ delay: 1 + i * 0.3, duration: 2, repeat: Infinity, repeatDelay: 4 }}
                >
                  <kpi.icon className="w-5 h-5 text-accent-gold" />
                </motion.div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                  <p className="text-xl font-bold text-gray-900">
                    <CountUp end={kpi.value} decimals={kpi.decimals} duration={2} separator="." />
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + 3 * 0.08, duration: 0.5 }}
          >
            <Card className="flex items-center gap-4">
              <motion.div
                className="w-11 h-11 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ delay: 1 + 3 * 0.3, duration: 2, repeat: Infinity, repeatDelay: 4 }}
              >
                <Wallet className="w-5 h-5 text-accent-gold" />
              </motion.div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Spesa media per visita</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(avgSpend)}</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filter toolbar */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca per cognome, nome, telefono"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {tierFilterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTierFilter(opt.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  tierFilter === opt.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="appearance-none pl-3 pr-9 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold"
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              aria-label="Inverti ordinamento"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">{sortDir === 'asc' ? 'Asc' : 'Desc'}</span>
            </button>
          </div>
        </motion.div>

        {/* Customers table */}
        <motion.div variants={itemVariants} className="mb-16">
          {customers.length === 0 ? (
            <Card padding="lg">
              <div className="py-12 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <UsersRound className="w-7 h-7 text-gray-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900 mb-1">Nessun cliente ancora</p>
                  <p className="text-sm text-gray-500 max-w-md">
                    I record verranno popolati dopo le prime visite registrate via QR check-in.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Visite</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ultima visita</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Spesa totale</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Score</th>
                      <th className="px-5 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((c, i) => {
                      const isOpen = expandedId === c.id;
                      const visits = getVisitsForCustomer(c.id)
                        .slice()
                        .sort((a, b) => (a.date < b.date ? 1 : -1))
                        .slice(0, 8);
                      return (
                        <Fragment key={c.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.04 * i, duration: 0.35 }}
                            className={`cursor-pointer transition-colors ${isOpen ? 'bg-accent-gold/5' : 'hover:bg-gray-50/60'}`}
                            onClick={() => setExpandedId(isOpen ? null : c.id)}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                                  style={{ backgroundColor: `hsl(${c.hue}, 40%, 35%)` }}
                                >
                                  {c.initials}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">
                                    {c.firstName ? `${c.firstName} ${c.name}` : c.name}
                                  </p>
                                  <p className="text-[11px] text-gray-500 font-mono">{c.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <TierBadge tier={c.tier} />
                            </td>
                            <td className="px-5 py-4">
                              <RatingMini ratings={c.ratings} />
                            </td>
                            <td className="px-5 py-4 text-right font-semibold text-gray-900 tabular-nums">
                              {c.totalVisits}
                            </td>
                            <td className="px-5 py-4 text-gray-600">
                              {formatDate(c.lastVisit)}
                            </td>
                            <td className="px-5 py-4 text-right text-gray-900 tabular-nums">
                              {formatCurrency(c.totalSpent)}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="text-lg font-bold text-accent-gold tabular-nums">
                                {c.compositeScore.toFixed(0)}
                              </span>
                              <span className="text-xs text-gray-400 font-mono">/100</span>
                            </td>
                            <td className="px-3 py-4 text-right">
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
                                className="inline-flex w-7 h-7 items-center justify-center rounded-full text-gray-400"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </motion.div>
                            </td>
                          </motion.tr>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.tr
                                key={`${c.id}-expand`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-gray-50/60"
                              >
                                <td colSpan={8} className="p-0">
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-6 py-6 border-t border-gray-200/70">
                                      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
                                        <div className="flex items-center gap-6">
                                          <RatingRing value={c.ratings.punctuality} label="Puntualita'" />
                                          <RatingRing value={c.ratings.reliability} label="Affidabilita'" />
                                          <RatingRing value={c.ratings.behavior}    label="Comportamento" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                              <CalendarDays className="w-3.5 h-3.5 text-accent-gold" />
                                              <span className="text-[10px] uppercase tracking-widest text-gray-500">
                                                Ultime {visits.length} visite
                                              </span>
                                            </div>
                                            <span className="text-[11px] text-gray-400">
                                              Cliente dal {formatDate(c.firstVisit)}
                                            </span>
                                          </div>
                                          {visits.length > 0 ? (
                                            <div className="flex gap-3 overflow-x-auto pb-2">
                                              {visits.map((v) => {
                                                const isLate = v.lateMinutes > 5;
                                                return (
                                                  <div
                                                    key={v.id}
                                                    className="shrink-0 w-[164px] rounded-xl border border-gray-200 bg-white p-3"
                                                  >
                                                    <div className="flex items-center justify-between mb-1.5">
                                                      <span className="text-xs font-semibold text-gray-900">
                                                        {formatDateShort(v.date)}
                                                      </span>
                                                      {isLate && (
                                                        <span className="text-[10px] font-medium text-danger bg-danger/10 px-1.5 py-0.5 rounded">
                                                          +{v.lateMinutes}'
                                                        </span>
                                                      )}
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 font-mono mb-2">
                                                      {v.reservationTime} → {v.arrivalTime}
                                                    </p>
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-[11px] text-gray-600">
                                                        {v.actualCovers}/{v.reservedCovers} cop.
                                                      </span>
                                                      <div className="flex items-center gap-0.5">
                                                        {Array.from({ length: 5 }).map((_, idx) => (
                                                          <Star
                                                            key={idx}
                                                            className={`w-2.5 h-2.5 ${idx < v.behaviorRating ? 'fill-accent-gold text-accent-gold' : 'text-gray-200'}`}
                                                          />
                                                        ))}
                                                      </div>
                                                    </div>
                                                    <p className="text-xs font-semibold text-gray-900 tabular-nums">
                                                      {formatCurrency(v.spend)}
                                                    </p>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          ) : (
                                            <p className="text-sm text-gray-500">Nessuna visita registrata.</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="mt-6 pt-5 border-t border-gray-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-start gap-2 text-sm text-gray-600 max-w-2xl">
                                          <PhoneCall className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                                          <div>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Note</p>
                                            <p className="leading-relaxed">{c.notes ?? '—'}</p>
                                          </div>
                                        </div>
                                        <Button variant="secondary" size="sm">
                                          Visualizza lo storico completo
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </Fragment>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500">
                          Nessun cliente corrisponde ai filtri selezionati.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Segmentazione automatica */}
        {customers.length > 0 && (
          <Section
            title="Segmentazione automatica"
            subtitle="La tier viene assegnata automaticamente in base al composite score, alle visite negli ultimi 12 mesi e alla spesa media."
          >
            <motion.div variants={itemVariants}>
              <Card padding="lg">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-gold" />
                    <span className="text-xs uppercase tracking-widest text-gray-500">Distribuzione tier</span>
                  </div>
                  <span className="text-xs text-gray-500">{customerVisits.length} visite analizzate</span>
                </div>
                <div className="flex h-12 rounded-xl overflow-hidden border border-gray-200/80 mb-5">
                  {(['platinum', 'gold', 'silver', 'bronze', 'new'] as CustomerTier[]).map((tier) => {
                    const count = tierCounts[tier];
                    if (count === 0) return null;
                    const pct = (count / totalForDistribution) * 100;
                    return (
                      <motion.div
                        key={tier}
                        className={`${tierSwatches[tier]} flex items-center justify-center text-xs font-medium text-white overflow-hidden`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                      >
                        {pct > 10 && (
                          <span className="whitespace-nowrap px-2">
                            {tierLabel[tier]} <span className="opacity-80">· {pct.toFixed(0)}%</span>
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(['platinum', 'gold', 'silver', 'bronze', 'new'] as CustomerTier[]).map((tier) => {
                    const count = tierCounts[tier];
                    const pct = (count / totalForDistribution) * 100;
                    return (
                      <div key={tier} className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${tierSwatches[tier]} shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{tierLabel[tier]}</p>
                          <p className="text-[11px] text-gray-500">{count} · {pct.toFixed(0)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </Section>
        )}

        {/* EE Partners branding */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-8 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );
}
