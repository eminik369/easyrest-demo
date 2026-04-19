import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Star, CalendarClock, Gift, QrCode, ClipboardCheck,
  Award, ArrowRight, Clock, ShieldCheck, Sparkles,
} from 'lucide-react';
import { Card, Badge, CountUp } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { formatDate } from '../../utils/calculations';
import type { CustomerTier } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const TODAY = '2026-02-22';

const tierMeta: Record<CustomerTier, { label: string; color: string; text: string }> = {
  platinum: { label: 'Platinum', color: 'bg-primary-black', text: 'text-white' },
  gold:     { label: 'Gold',     color: 'bg-accent-gold',  text: 'text-white' },
  silver:   { label: 'Silver',   color: 'bg-gray-500',     text: 'text-white' },
  bronze:   { label: 'Bronze',   color: 'bg-[#a16207]',    text: 'text-white' },
  new:      { label: 'Nuovi',    color: 'bg-gray-300',     text: 'text-gray-700' },
};

const tierOrder: CustomerTier[] = ['platinum', 'gold', 'silver', 'bronze', 'new'];

const subPages = [
  {
    to: '/crm/checkin',
    icon: QrCode,
    title: 'Check-in con QR',
    desc: "All'arrivo, lo staff scansiona il QR code della prenotazione. Il sistema calcola lo scostamento orario e aggiorna la Puntualita'.",
  },
  {
    to: '/crm/rating',
    icon: ClipboardCheck,
    title: 'Verifica Coperti & Feedback',
    desc: 'Alla chiusura tavolo, verifica dei coperti effettivi e feedback comportamentale 1-5 stelle.',
  },
  {
    to: '/crm/customers',
    icon: Users,
    title: 'Database Clienti',
    desc: 'Storico completo, rating per dimensione, visite, spesa media.',
  },
  {
    to: '/crm/loyalty',
    icon: Award,
    title: 'Loyalty & Premi',
    desc: 'Classifica mensile Top Customer con generazione automatica di QR premio.',
  },
];

const ratingSteps = [
  {
    number: '01',
    icon: Clock,
    title: "Puntualita'",
    desc: 'Se il ritardo supera i 15 minuti, la puntualita\' cala.',
  },
  {
    number: '02',
    icon: ShieldCheck,
    title: "Affidabilita'",
    desc: 'Scostamento negativo tra coperti prenotati ed effettivi incide sull\'affidabilita\'.',
  },
  {
    number: '03',
    icon: Star,
    title: 'Comportamento',
    desc: 'Al checkout, il cameriere assegna 1-5 stelle.',
  },
];

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
}

export function CRMPage() {
  const navigate = useNavigate();
  const { customers, customerVisits, loyaltyRewards, getCustomerById } = useStore();

  const avgScore = useMemo(() => {
    if (customers.length === 0) return 0;
    const sum = customers.reduce((s, c) => s + c.compositeScore, 0);
    return sum / customers.length;
  }, [customers]);

  const visitsLast30 = useMemo(
    () => customerVisits.filter((v) => {
      const d = daysBetween(v.date, TODAY);
      return d >= 0 && d <= 30;
    }).length,
    [customerVisits],
  );

  const activeRewards = useMemo(
    () => loyaltyRewards.filter((r) => !r.redeemedAt).length,
    [loyaltyRewards],
  );

  const tierCounts = useMemo(() => {
    const counts: Record<CustomerTier, number> = { platinum: 0, gold: 0, silver: 0, bronze: 0, new: 0 };
    customers.forEach((c) => { counts[c.tier] += 1; });
    return counts;
  }, [customers]);

  const totalForDistribution = customers.length || 1;

  const recentVisits = useMemo(
    () => [...customerVisits]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 6),
    [customerVisits],
  );

  const kpis = [
    { label: 'Clienti totali',           value: customers.length,   icon: Users,         decimals: 0, suffix: '' },
    { label: 'Rating medio',             value: avgScore,           icon: Star,          decimals: 1, suffix: '' },
    { label: 'Visite ultimi 30 giorni',  value: visitsLast30,       icon: CalendarClock, decimals: 0, suffix: '' },
    { label: 'Premi attivi',             value: activeRewards,      icon: Gift,          decimals: 0, suffix: '' },
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
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'CRM e Rating Clienti' }]} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader
            title="CRM e Rating Bidirezionale"
            subtitle="Ogni cliente ha un rating costruito su dati oggettivi - puntualita' all'arrivo, affidabilita' sui coperti prenotati, comportamento in sala. I top customer del mese ricevono premi automatici."
            badge={<Badge variant="gold">Nuovo modulo</Badge>}
          />
        </motion.div>

        {/* KPI strip */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ delay: 1 + i * 0.3, duration: 2, repeat: Infinity, repeatDelay: 4 }}
                >
                  <kpi.icon className="w-5 h-5 text-accent-gold" />
                </motion.div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                  <p className="text-xl font-bold text-gray-900">
                    <CountUp end={kpi.value} decimals={kpi.decimals} suffix={kpi.suffix} duration={2} separator="." />
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Rating distribution */}
        <Section
          title="Distribuzione dei tier"
          subtitle="La composizione attuale del parco clienti per fascia di rating."
        >
          <motion.div variants={itemVariants}>
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-gold" />
                  <span className="text-xs uppercase tracking-widest text-gray-500">Parco clienti</span>
                </div>
                <span className="text-xs text-gray-500">
                  {customers.length} profili attivi
                </span>
              </div>

              <div className="flex h-14 rounded-xl overflow-hidden border border-gray-200/80">
                {tierOrder.map((tier) => {
                  const count = tierCounts[tier];
                  const pct = (count / totalForDistribution) * 100;
                  if (count === 0) return null;
                  const meta = tierMeta[tier];
                  return (
                    <motion.div
                      key={tier}
                      className={`${meta.color} ${meta.text} flex items-center justify-center text-xs font-medium overflow-hidden`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                    >
                      {pct > 10 && (
                        <span className="whitespace-nowrap px-2">
                          {meta.label} <span className="opacity-70">· {count}</span>
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-5 gap-3 mt-5">
                {tierOrder.map((tier) => {
                  const count = tierCounts[tier];
                  const pct = (count / totalForDistribution) * 100;
                  const meta = tierMeta[tier];
                  return (
                    <div key={tier} className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${meta.color} shrink-0`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{meta.label}</p>
                        <p className="text-[11px] text-gray-500">{count} · {pct.toFixed(0)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </Section>

        {/* Sub-pages grid */}
        <Section
          title="Come lavora il modulo"
          subtitle="Quattro superfici operative, un unico flusso di rating."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {subPages.map((page, i) => (
              <motion.div
                key={page.to}
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              >
                <Card
                  hoverable
                  onClick={() => navigate(page.to)}
                  className="h-full cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-accent-gold/10 text-accent-gold flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <page.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{page.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{page.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-accent-gold group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-1" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Recent guest ratings feed */}
        <Section
          title="Ultimi rating in sala"
          subtitle="Le visite piu' recenti elaborate dal sistema con il dettaglio delle tre metriche."
        >
          <motion.div variants={itemVariants}>
            <Card padding="none">
              <ul className="divide-y divide-gray-200/70">
                {recentVisits.map((visit, i) => {
                  const customer = getCustomerById(visit.customerId);
                  const initials = customer?.initials ?? '··';
                  const hue = customer?.hue ?? 200;
                  const name = customer?.name ?? 'Ospite';
                  const punctScore = Math.max(1, 5 - Math.max(visit.lateMinutes, 0) / 5);
                  const punctPct = Math.min(100, (punctScore / 5) * 100);
                  const relScore = visit.reservedCovers > 0
                    ? Math.max(1, 5 - Math.abs(visit.coverDeviation) * (5 / visit.reservedCovers))
                    : 3;
                  const relPct = Math.min(100, (relScore / 5) * 100);
                  const behaviorPct = (visit.behaviorRating / 5) * 100;
                  const composite = (punctScore + relScore + visit.behaviorRating) / 3;

                  return (
                    <motion.li
                      key={visit.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.06, duration: 0.4 }}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                        style={{ backgroundColor: `hsl(${hue}, 55%, 42%)` }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 w-28 sm:w-36">
                        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                        <p className="text-[11px] text-gray-500">{formatDate(visit.date)}</p>
                      </div>
                      <div className="flex-1 hidden sm:grid grid-cols-3 gap-3">
                        <div>
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                            <span>Punt.</span>
                            <span className="text-gray-600 font-semibold">{punctScore.toFixed(1)}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-accent-gold"
                              initial={{ width: 0 }}
                              animate={{ width: `${punctPct}%` }}
                              transition={{ duration: 0.8, delay: 0.1 + i * 0.06 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                            <span>Affid.</span>
                            <span className="text-gray-600 font-semibold">{relScore.toFixed(1)}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gray-900"
                              initial={{ width: 0 }}
                              animate={{ width: `${relPct}%` }}
                              transition={{ duration: 0.8, delay: 0.15 + i * 0.06 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                            <span>Compor.</span>
                            <span className="text-gray-600 font-semibold">{visit.behaviorRating.toFixed(1)}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-success"
                              initial={{ width: 0 }}
                              animate={{ width: `${behaviorPct}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + i * 0.06 }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 w-20">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Impatto</p>
                        <p className="text-sm font-bold text-gray-900">
                          {composite.toFixed(1)}<span className="text-gray-400 text-xs">/5</span>
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
                {recentVisits.length === 0 && (
                  <li className="px-5 py-10 text-center text-sm text-gray-500">
                    Nessuna visita registrata al momento.
                  </li>
                )}
              </ul>
            </Card>
          </motion.div>
        </Section>

        {/* How the rating works */}
        <Section title="Come si costruisce il rating" subtitle="Tre dimensioni, una sola sintesi.">
          <motion.div variants={itemVariants}>
            <Card className="bg-primary-black text-white border-gray-800" padding="lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {ratingSteps.map((step, i) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                    className="relative"
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
                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Composite score 0-100 · aggiornato in tempo reale
                </p>
                <p className="text-xs text-gray-400">
                  Media ponderata delle tre dimensioni su scala 1-5.
                </p>
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
