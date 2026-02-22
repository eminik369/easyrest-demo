import { motion } from 'framer-motion';
import {
  Smartphone,
  BrainCircuit,
  Plug,
  ShieldCheck,
  TrendingDown,
  Clock,
  BarChart3,
  ChefHat,
  ScanLine,
  ClipboardList,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CountUp } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const kpis = [
  {
    label: 'Risparmio Annuo Stimato',
    value: 32000,
    prefix: '€',
    suffix: '',
    sub: 'per ristorante (fatturato EUR 1M)',
  },
  {
    label: 'Riduzione Sprechi',
    value: 26,
    prefix: '',
    suffix: '%',
    sub: 'sulle materie prime',
  },
  {
    label: 'Ristoranti Target',
    value: 57500,
    prefix: '',
    suffix: '',
    sub: 'media-alta fascia in Italia',
  },
  {
    label: 'Ore Risparmiate',
    value: 20,
    prefix: '',
    suffix: '',
    sub: 'a settimana per locale',
  },
];

const roiItems = [
  { icon: TrendingDown, label: 'Riduzione sprechi materie prime', saving: '-26% anno 1', desc: 'Media verificata su 114 ristoranti in 12 paesi (WRI Champions 12.3). Lo spreco alimentare costa EUR 25.000-40.000/anno per un ristorante di media-alta fascia' },
  { icon: Clock, label: 'Eliminazione lavoro manuale', saving: '20h/settimana', desc: 'Inventari (5-7h), HACCP (4-8h), ordini fornitori (4-6h), calcolo food cost (3-5h): 24-36h manuali ridotte del 75%' },
  { icon: BarChart3, label: 'Ottimizzazione acquisti', saving: '3-5% food cost', desc: 'Confronto fornitori, riordini automatici su par level, riduzione stockout. Su EUR 300K di acquisti annui: EUR 9.000-15.000 risparmiati' },
  { icon: ShieldCheck, label: 'Conformita HACCP garantita', saving: 'Sanzioni evitate', desc: 'Le sanzioni HACCP vanno da EUR 1.000 a EUR 6.000 per violazione (D.Lgs. 193/2007), fino a EUR 30.000 nei casi gravi' },
];

const modules = [
  { icon: ChefHat, label: 'Ricette e Costi', desc: 'Calcolo automatico del food cost per ogni piatto, aggiornato in tempo reale' },
  { icon: ScanLine, label: 'Scanner e Magazzino', desc: 'Scansione etichette da smartphone, inventario automatico, tracciabilita completa' },
  { icon: ClipboardList, label: 'Preparazioni', desc: 'Pianificazione delle preparazioni base in funzione delle prenotazioni' },
  { icon: BarChart3, label: 'Analisi Predittiva', desc: 'Previsione consumi, trend vendite, collegamento al sistema POS' },
  { icon: MapPin, label: 'Gestione Sala', desc: 'Mappa tavoli interattiva, prenotazioni in tempo reale, seat selection' },
  { icon: MessageCircle, label: 'Chatbot AI', desc: 'Assistente per i clienti: allergeni, prenotazioni, notifiche automatiche' },
];

const marketData = [
  { name: 'QSR / Catene', value: 4000, highlighted: false },
  { name: 'Pizzerie', value: 45000, highlighted: false },
  { name: 'Trattorie / Osterie', value: 75000, highlighted: false },
  { name: 'Media-alta fascia', value: 57500, highlighted: true },
];


const advantages = [
  {
    icon: Smartphone,
    title: 'Zero Hardware',
    description: 'Nessun dispositivo aggiuntivo: basta lo smartphone che il personale ha gia in tasca',
  },
  {
    icon: BrainCircuit,
    title: 'AI che Apprende',
    description: 'Il sistema diventa piu preciso con l\'uso: stime sprechi e previsioni migliorano nel tempo',
  },
  {
    icon: Plug,
    title: 'Integrazione Flessibile',
    description: 'Si collega al POS esistente oppure funziona in modo completamente autonomo',
  },
  {
    icon: ShieldCheck,
    title: 'Conformita Automatica',
    description: 'HACCP, tracciabilita dei lotti e registro delle temperature senza nessun lavoro manuale',
  },
];


export function BusinessCasePage() {
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
              { label: 'Business Case' },
            ]}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <PageHeader
            title="Perche EasyRest"
            subtitle="Dati basati su benchmark di settore: FIPE Rapporto Ristorazione 2025, WRI Champions 12.3 (114 ristoranti, 12 paesi), WRAP, ISTAT e CCNL Pubblici Esercizi"
          />
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-12 w-auto opacity-60 shrink-0 mt-2" />
        </motion.div>

        {/* KPI Hero */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="bg-gray-900 rounded-2xl p-8 sm:p-12">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 text-center mb-8">Impatto stimato per ristorante</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="text-center">
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                    {kpi.label}
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-accent-gold">
                    <CountUp
                      end={kpi.value}
                      prefix={kpi.prefix}
                      suffix={kpi.suffix}
                      duration={2.5}
                      separator="."
                    />
                  </p>
                  <p className="text-sm text-gray-400 mt-2">{kpi.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ROI Breakdown */}
        <Section title="Dove si genera il valore" subtitle="Impatto calcolato su un ristorante con fatturato annuo di EUR 800K-1.2M, food cost 28-35% e 24-36 ore settimanali di lavoro amministrativo manuale.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {roiItems.map((item, index) => (
              <motion.div key={item.label} variants={itemVariants} custom={index}>
                <Card className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-accent-gold" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{item.label}</h3>
                        <span className="text-sm font-bold text-accent-gold">{item.saving}</span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* What's included */}
        <Section title="Cosa include la piattaforma" subtitle="Sei moduli integrati che coprono l'intera gestione operativa del ristorante, dalla cucina alla sala.">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod, index) => (
              <motion.div key={mod.label} variants={itemVariants} custom={index}>
                <Card className="h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <mod.icon className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{mod.label}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{mod.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Scale advantage */}
        <motion.div variants={itemVariants} className="mb-16">
          <Card className="bg-gray-900 text-white border-gray-800" padding="lg">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Il vantaggio di scala</p>
              <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed mb-6">
                Il segmento catene e fondi cresce del 9-17% annuo in Italia (AIGRIM 2025, 2.700 punti vendita).
                Con EasyRest, un unico sistema centralizza il controllo di costi, sprechi e conformita
                su tutti i locali — con un risparmio che si moltiplica per ogni ristorante in portfolio.
              </p>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-accent-gold">1</p>
                  <p className="text-xs text-gray-400 mt-1">Piattaforma unica</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-gold">N</p>
                  <p className="text-xs text-gray-400 mt-1">Ristoranti gestiti</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-gold">
                    <CountUp end={32000} prefix="€" separator="." duration={2.5} />
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Risparmio x locale/anno</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Market chart */}
        <Section title="Mercato di Riferimento">
          <motion.div variants={itemVariants}>
            <Card padding="lg" className="mb-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={marketData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 13, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        `${(v / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        Number(value).toLocaleString('it-IT'),
                        'Ristoranti',
                      ]}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={56}>
                      {marketData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.highlighted ? '#C9A962' : '#d1d5db'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <p className="text-gray-500 leading-relaxed max-w-3xl">
              Su 195.000 ristoranti in Italia (FIPE 2025), EasyRest si rivolge ai circa 57.500
              di media e alta fascia — il segmento con food cost del 28-35% e margini netti del 3-10%,
              dove anche piccoli miglioramenti di efficienza hanno un impatto significativo sulla redditivita.
            </p>
          </motion.div>
        </Section>

        {/* Competitive Advantages */}
        <Section title="Vantaggi Competitivi">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((item, index) => (
              <motion.div key={item.title} variants={itemVariants} custom={index}>
                <Card className="h-full hover:shadow-md transition-shadow duration-300">
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-accent-gold" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Sources */}
        <motion.div variants={itemVariants} className="mb-16">
          <Card className="border-gray-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Fonti e metodologia</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs text-gray-500 leading-relaxed">
              <p>Sprechi alimentari: WRI Champions 12.3 — studio su 114 ristoranti in 12 paesi, riduzione media 26% al primo anno, ROI 7:1</p>
              <p>Mercato italiano: FIPE Rapporto Ristorazione 2025 — 195.471 ristoranti, mercato fuori casa EUR 96 miliardi</p>
              <p>Costo lavoro: CCNL Pubblici Esercizi 2024-2027, ISTAT Struttura Retribuzioni 2022</p>
              <p>Food cost benchmark: Confcommercio Le Bussole, FoodTag.it — media-alta fascia 28-35%</p>
              <p>Sanzioni HACCP: D.Lgs. 193/2007, Reg. CE 852/2004 — EUR 1.000-6.000 per violazione</p>
              <p>Ore manuali: inventari 5-7h, HACCP 4-8h, ordini 4-6h, food cost 3-5h/settimana (media settore)</p>
            </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-gray-800" padding="lg">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xl font-semibold text-white mb-4">
                Ogni installazione e' costruita su misura
              </p>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                Non esiste un EasyRest uguale a un altro. Ogni implementazione viene progettata
                intorno alle esigenze specifiche del ristorante: il menu, i fornitori, i flussi di lavoro,
                il sistema POS gia in uso, il numero di locali. Dalla configurazione iniziale alla
                formazione del personale, ogni dettaglio viene adattato.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                <div>
                  <p className="text-lg font-bold text-accent-gold">Menu</p>
                  <p className="text-xs text-gray-400 mt-1">Ricette, allergeni e food cost del vostro ristorante</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-accent-gold">Fornitori</p>
                  <p className="text-xs text-gray-400 mt-1">Integrazione con i vostri canali di approvvigionamento</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-accent-gold">POS</p>
                  <p className="text-xs text-gray-400 mt-1">Collegamento al sistema di cassa esistente</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-accent-gold">Team</p>
                  <p className="text-xs text-gray-400 mt-1">Formazione dedicata per cucina e sala</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* EE Partners branding */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-8 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-10 w-auto opacity-40" />
        </motion.div>
      </div>
    </motion.div>
  );
}
