import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Brain, Sliders } from 'lucide-react';
import { Card, CountUp } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { useTutorial } from '../../components/Tutorial';
import { getSalesTrendByMonth, getTopSellingRecipes, formatCurrency } from '../../utils/calculations';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } } };

const COLORS = ['#C9A962', '#22C55E', '#3B82F6', '#8B5CF6', '#EF4444'];

function formatMonth(key: string): string {
  const [y, m] = key.split('-');
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  return `${months[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}

const tutorialSteps = [
  { title: 'Dashboard Analitica', description: 'Questa sezione raccoglie tutti i dati di vendita del ristorante. I dati vengono importati dal sistema POS oppure registrati internamente da EasyRest.' },
  { title: 'Trend e Top Piatti', description: 'Il grafico del fatturato mostra l\'andamento mensile delle vendite. La classifica dei piatti piu venduti aiuta a capire quali sono i piatti di punta del menu.' },
  { title: 'Sistema di Previsione', description: 'Il cuore del modulo: tre modalita di previsione dei consumi. Per Prenotati usa i coperti gia prenotati, Storico usa la media dei giorni precedenti, Soglia Minima garantisce un livello base.' },
  { title: 'Collegamento POS', description: 'EasyRest puo importare i dati di vendita direttamente dal POS del ristorante. In alternativa funziona come sistema autonomo.' },
];

export function AnalyticsPage() {
  const { sales, recipes, reservedCovers, predictionMode, setReservedCovers, setPredictionMode } = useStore();
  const tutorial = useTutorial();

  const trendData = getSalesTrendByMonth(sales).map((d) => ({
    ...d,
    month: formatMonth(d.month),
  }));
  const topSelling = getTopSellingRecipes(sales, 5);
  const totalRevenue = sales.reduce((s, sale) => s + sale.revenue, 0);
  const totalSold = sales.reduce((s, sale) => s + sale.quantity, 0);

  // Prediction simulation
  const predictionMultiplier = predictionMode === 'prenotati' ? reservedCovers / 45 : predictionMode === 'storico' ? 1 : 0.8;

  const predictionData = topSelling.map((ts) => {
    const avgDaily = ts.totalSold / 84;
    const predicted = Math.round(avgDaily * predictionMultiplier * 10) / 10;
    return {
      name: ts.recipeName,
      storico: Math.round(avgDaily * 10) / 10,
      predetto: predicted,
    };
  });

  // Category breakdown
  const categoryData = recipes.reduce<Record<string, number>>((acc, r) => {
    const cat = r.category;
    const recipeSales = sales.filter((s) => s.recipeId === r.id).reduce((s, sale) => s + sale.quantity, 0);
    acc[cat] = (acc[cat] || 0) + recipeSales;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const predictionModes = [
    { key: 'prenotati' as const, label: 'Per Prenotati', icon: TrendingUp, desc: 'Basato sui coperti gia prenotati' },
    { key: 'storico' as const, label: 'Storico', icon: Brain, desc: 'Media dei consumi precedenti' },
    { key: 'soglia' as const, label: 'Soglia Minima', icon: Sliders, desc: 'Livello minimo garantito' },
  ];

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'Analisi' }]} />
        </motion.div>
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <PageHeader
            title="Analisi Vendite e Previsioni"
            subtitle="Dashboard analitica con dati di vendita, trend mensili, piatti piu venduti e sistema di previsione dei consumi basato su prenotazioni e dati storici. I dati vengono importati dal sistema POS o registrati internamente."
          />
          <button
            onClick={() => tutorial?.startTutorial(tutorialSteps)}
            className="shrink-0 mt-2 px-4 py-2 rounded-xl bg-accent-gold/10 text-accent-gold text-sm font-medium hover:bg-accent-gold/20 transition-colors cursor-pointer"
          >
            Come Funziona
          </button>
        </motion.div>

        {/* KPIs */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mb-12">
          <Card className="text-center">
            <p className="text-xs text-gray-500 mb-1">Fatturato Totale</p>
            <p className="text-2xl font-bold text-gray-900">
              <CountUp end={totalRevenue} prefix="EUR " separator="." duration={2} />
            </p>
            <p className="text-xs text-gray-400">ultimi 3 mesi</p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-gray-500 mb-1">Piatti Venduti</p>
            <p className="text-2xl font-bold text-gray-900">
              <CountUp end={totalSold} separator="." duration={2} />
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-gray-500 mb-1">Prezzo Medio Piatto</p>
            <p className="text-2xl font-bold text-gray-900">
              <CountUp end={totalRevenue / totalSold} prefix="EUR " decimals={2} duration={2} />
            </p>
          </Card>
        </motion.div>

        {/* Revenue trend */}
        <Section title="Trend Fatturato Mensile">
          <motion.div variants={itemVariants}>
            <Card padding="lg">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} formatter={(v) => [formatCurrency(Number(v)), 'Fatturato']} />
                    <Line type="monotone" dataKey="revenue" stroke="#C9A962" strokeWidth={3} dot={{ r: 5, fill: '#C9A962' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Section>

        {/* Top selling + Category pie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          <Section title="Top 5 Piatti Venduti">
            <motion.div variants={itemVariants}>
              <Card padding="none">
                <div className="divide-y divide-gray-50">
                  {topSelling.map((ts, i) => (
                    <div key={ts.recipeId} className="flex items-center gap-4 px-5 py-4">
                      <span className="w-7 h-7 rounded-full bg-accent-gold/10 flex items-center justify-center text-xs font-bold text-accent-gold">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{ts.recipeName}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(ts.totalRevenue)}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{ts.totalSold}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </Section>

          <Section title="Vendite per Categoria">
            <motion.div variants={itemVariants}>
              <Card padding="lg">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {pieData.map((_entry, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [Number(v), 'Piatti venduti']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </Section>
        </div>

        {/* Prediction system */}
        <Section title="Sistema di Previsione Consumi" subtitle="Stima delle porzioni necessarie per il servizio sulla base della modalita di previsione selezionata. Questo e il cuore dell'intelligenza predittiva di EasyRest.">
          <motion.div variants={itemVariants}>
            {/* Prediction mode cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {predictionModes.map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setPredictionMode(mode.key)}
                  className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    predictionMode === mode.key
                      ? 'border-accent-gold bg-accent-gold/5 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${predictionMode === mode.key ? 'bg-accent-gold/10' : 'bg-gray-100'}`}>
                      <mode.icon className={`w-4 h-4 ${predictionMode === mode.key ? 'text-accent-gold' : 'text-gray-400'}`} />
                    </div>
                    <span className={`text-sm font-semibold ${predictionMode === mode.key ? 'text-accent-gold' : 'text-gray-700'}`}>{mode.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{mode.desc}</p>
                </button>
              ))}
            </div>

            <Card padding="lg">
              {predictionMode === 'prenotati' && (
                <div className="flex items-center gap-4 mb-6 bg-gray-50 rounded-xl p-4">
                  <label className="text-sm text-gray-600">Coperti prenotati:</label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={reservedCovers}
                    onChange={(e) => setReservedCovers(Number(e.target.value))}
                    className="flex-1 accent-accent-gold"
                  />
                  <span className="text-lg font-bold text-gray-900 w-12 text-right">{reservedCovers}</span>
                </div>
              )}

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictionData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} angle={-20} textAnchor="end" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
                    <Legend />
                    <Bar dataKey="storico" name="Media Storica" fill="#d1d5db" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="predetto" name="Previsione" fill="#C9A962" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Section>

        {/* POS info */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-900 text-white border-gray-800" padding="lg">
            <h3 className="font-semibold mb-3">Collegamento al Sistema POS</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              I dati di vendita possono essere importati automaticamente dal sistema POS del ristorante tramite integrazione diretta.
              In alternativa, EasyRest funziona come sistema autonomo registrando internamente le vendite.
              Il collegamento con il POS permette di avere dati in tempo reale per previsioni piu accurate e una gestione ottimale delle scorte.
            </p>
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
