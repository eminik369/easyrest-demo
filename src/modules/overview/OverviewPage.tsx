import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChefHat, ScanLine, ClipboardList, BarChart3, MapPin, MessageCircle,
  AlertTriangle, TrendingUp, Calendar, ArrowRight,
  Users, Monitor, Bot, FileDown,
} from 'lucide-react';
import { Card, Badge, CountUp } from '../../components/ui';
import { PageHeader } from '../../components/layout';
import { useStore } from '../../store';
import { useTutorial } from '../../components/Tutorial';
import { calculateMarginPercentage, getExpiryStatus } from '../../utils/calculations';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

type ModuleCard = {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  color: string;
  dev?: boolean;
  nuovo?: boolean;
};

const moduleCards: ModuleCard[] = [
  { to: '/recipes', icon: ChefHat, label: 'Ricette e Costi', desc: 'Gestisci il ricettario completo, calcola costi per porzione e margini operativi in tempo reale', color: 'bg-amber-50 text-amber-600' },
  { to: '/scanner', icon: ScanLine, label: 'Scanner e Magazzino', desc: 'Scansiona etichette con lo smartphone, monitora scadenze, inventario e conformita HACCP', color: 'bg-blue-50 text-blue-600' },
  { to: '/menu-importer', icon: FileDown, label: 'Importazione Menu', desc: 'Incolla un URL Pienissimo, Leggimenu o Tomato: il menu e pronto in EasyRest in 30 secondi', color: 'bg-teal-50 text-teal-600', nuovo: true },
  { to: '/preparations', icon: ClipboardList, label: 'Preparazioni', desc: 'Pianifica le preparazioni giornaliere in base a prenotazioni e consumo storico', color: 'bg-purple-50 text-purple-600' },
  { to: '/kds', icon: Monitor, label: 'KDS Cucina', desc: 'Kitchen Display System con pop-up bloccante sulle comande in ritardo', color: 'bg-slate-100 text-slate-700', nuovo: true },
  { to: '/kitchen-assistant', icon: Bot, label: 'Assistente Cucina AI', desc: "Chatbot per la brigata: composizione, dosi scalabili, plating e tempi di cottura", color: 'bg-orange-50 text-orange-600', nuovo: true },
  { to: '/crm', icon: Users, label: 'CRM e Rating', desc: 'Rating bidirezionale del cliente: puntualita, affidabilita, comportamento. Premi Top Customer mensili', color: 'bg-yellow-50 text-yellow-700', nuovo: true },
  { to: '/analytics', icon: BarChart3, label: 'Analisi e Previsioni', desc: 'Dashboard con trend di vendita, previsioni dei consumi e collegamento al POS', color: 'bg-emerald-50 text-emerald-600' },
  { to: '/floor-plan', icon: MapPin, label: 'Gestione Sala', desc: 'Mappa interattiva dei tavoli con prenotazioni in tempo reale', color: 'bg-rose-50 text-rose-600', dev: true },
  { to: '/chatbot', icon: MessageCircle, label: 'Chatbot Sala', desc: 'Assistente AI basato su GPT-4o per informazioni allergeni, menu e prenotazioni', color: 'bg-cyan-50 text-cyan-600' },
];

const tutorialSteps = [
  { title: 'Panoramica del Sistema', description: 'Questa e la dashboard principale di EasyRest. Da qui puoi vedere lo stato operativo del ristorante con un colpo d\'occhio: ricette attive, margini, prodotti in scadenza e coperti previsti.' },
  { title: 'I Numeri Chiave', description: 'I KPI in alto mostrano le metriche piu importanti in tempo reale. Il margine medio viene calcolato automaticamente sulla base dei costi degli ingredienti e dei prezzi di vendita.' },
  { title: 'I Moduli del Sistema', description: 'Ogni card rappresenta un modulo funzionale di EasyRest. Clicca su una card per esplorare il modulo in dettaglio. I moduli con il badge DEV sono in fase di sviluppo.' },
  { title: 'Fatturato e Statistiche', description: 'La barra in basso mostra il fatturato degli ultimi 3 mesi, il numero di prodotti monitorati in magazzino e le prenotazioni di oggi. Tutti i dati si aggiornano in tempo reale.' },
];

export function OverviewPage() {
  const navigate = useNavigate();
  const { recipes, products, sales, reservations } = useStore();
  const tutorial = useTutorial();

  const activeRecipes = recipes.filter((r) => r.active).length;
  const avgMargin = recipes.filter((r) => r.active).reduce((sum, r) => sum + calculateMarginPercentage(r, products), 0) / (activeRecipes || 1);
  const expiringProducts = products.filter((p) => getExpiryStatus(p.expiryDate) !== 'ok').length;
  const todayReservations = reservations.filter((r) => r.date === '2026-02-22');
  const todayCovers = todayReservations.reduce((s, r) => s + r.covers, 0);
  const totalRevenue = sales.reduce((s, sale) => s + sale.revenue, 0);

  const kpis = [
    { label: 'Ricette Attive', value: activeRecipes, icon: ChefHat },
    { label: 'Margine Medio', value: avgMargin, suffix: '%', decimals: 1, icon: TrendingUp },
    { label: 'Prodotti in Scadenza', value: expiringProducts, icon: AlertTriangle },
    { label: 'Coperti Oggi', value: todayCovers, icon: Calendar },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gray-50/50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <PageHeader
            title="Panoramica"
            subtitle="Una visione completa dello stato operativo del ristorante. Tutti i dati si aggiornano automaticamente sulla base delle informazioni raccolte dai singoli moduli."
          />
          <button
            onClick={() => tutorial?.startTutorial(tutorialSteps)}
            className="shrink-0 mt-2 px-4 py-2 rounded-xl bg-accent-gold/10 text-accent-gold text-sm font-medium hover:bg-accent-gold/20 transition-colors cursor-pointer"
          >
            Come Funziona
          </button>
        </motion.div>

        {/* KPIs */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
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
                    <CountUp end={kpi.value} suffix={kpi.suffix || ''} decimals={kpi.decimals || 0} duration={2} separator="." />
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Module cards */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Moduli del Sistema</h2>
          <p className="text-sm text-gray-500">Clicca su un modulo per esplorare le funzionalita in dettaglio</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {moduleCards.map((mod) => (
            <motion.div key={mod.to} variants={itemVariants}>
              <Card
                hoverable
                onClick={() => navigate(mod.to)}
                className="h-full cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${mod.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">{mod.label}</h3>
                      {mod.dev && <Badge variant="development" size="sm">DEV</Badge>}
                      {mod.nuovo && <Badge variant="gold" size="sm">NUOVO</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{mod.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-accent-gold group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-1" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick stats bar */}
        <motion.div variants={itemVariants} className="mt-12">
          <Card className="bg-gray-900 border-gray-800" padding="lg">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Fatturato 3 Mesi</p>
                <p className="text-2xl font-bold text-accent-gold">
                  <CountUp end={totalRevenue} prefix="EUR " decimals={0} separator="." duration={2.5} />
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Prodotti Monitorati</p>
                <p className="text-2xl font-bold text-accent-gold">
                  <CountUp end={products.length} duration={2} />
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Prenotazioni Oggi</p>
                <p className="text-2xl font-bold text-accent-gold">
                  <CountUp end={todayReservations.length} duration={2} />
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
