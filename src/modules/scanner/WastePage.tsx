import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Brain, BarChart3 } from 'lucide-react';
import { Card, Badge, CountUp } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { formatWeight, formatCurrency } from '../../utils/calculations';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } } };

const confidenceVariant = (c: string) => c === 'alta' ? 'success' as const : c === 'media' ? 'warning' as const : 'danger' as const;
const confidenceLabel = (c: string) => c === 'alta' ? 'Alta' : c === 'media' ? 'Media' : 'Bassa';

export function WastePage() {
  const { products } = useStore();

  const wasteData = products
    .filter((p) => p.wastePercentage > 0)
    .map((p) => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      fullName: p.name,
      pct: p.wastePercentage,
      wasteKg: p.quantity * (p.wastePercentage / 100),
      wasteCost: p.quantity * (p.wastePercentage / 100) * p.unitPrice,
      confidence: p.wasteConfidence,
    }))
    .sort((a, b) => b.wasteCost - a.wasteCost)
    .slice(0, 12);

  const totalWasteCost = wasteData.reduce((s, d) => s + d.wasteCost, 0);
  const avgWaste = wasteData.reduce((s, d) => s + d.pct, 0) / (wasteData.length || 1);
  const totalWasteKg = wasteData.reduce((s, d) => s + d.wasteKg, 0);

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'Scanner', href: '/scanner' }, { label: 'Sprechi' }]} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Stima Intelligente degli Sprechi"
            subtitle="Il sistema stima gli scarti per ogni prodotto sulla base dei dati storici. La percentuale di scarto viene affinata nel tempo tramite un algoritmo di apprendimento: piu dati vengono raccolti, piu la stima diventa accurata."
          />
        </motion.div>

        {/* KPIs */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Costo Sprechi</p>
              <p className="text-lg font-bold text-danger">{formatCurrency(totalWasteCost)}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Scarto Medio</p>
              <p className="text-lg font-bold text-gray-900"><CountUp end={avgWaste} decimals={1} suffix="%" duration={2} /></p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Kg Stimati Persi</p>
              <p className="text-lg font-bold text-gray-900">{formatWeight(totalWasteKg)}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Prodotti Monitorati</p>
              <p className="text-lg font-bold text-gray-900"><CountUp end={wasteData.length} duration={1.5} /></p>
            </div>
          </Card>
        </motion.div>

        {/* Chart */}
        <Section title="Scarto per Prodotto">
          <motion.div variants={itemVariants}>
            <Card padding="lg">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wasteData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} angle={-35} textAnchor="end" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Scarto']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                    <Bar dataKey="pct" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Section>

        {/* Detail table */}
        <Section title="Dettaglio per Prodotto">
          <motion.div variants={itemVariants}>
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">% Scarto</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Kg Stimati</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Costo</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Affidabilita</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {wasteData.map((d) => (
                      <tr key={d.fullName} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-900">{d.fullName}</td>
                        <td className="px-5 py-3 text-right text-gray-900">{d.pct}%</td>
                        <td className="px-5 py-3 text-right text-gray-600">{formatWeight(d.wasteKg)}</td>
                        <td className="px-5 py-3 text-right text-danger font-medium">{formatCurrency(d.wasteCost)}</td>
                        <td className="px-5 py-3">
                          <Badge variant={confidenceVariant(d.confidence)} size="sm">
                            {confidenceLabel(d.confidence)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </Section>

        {/* How it works */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-900 text-white border-gray-800" padding="lg">
            <h3 className="font-semibold mb-3">Come funziona la stima degli sprechi</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Il sistema calcola la differenza tra la quantita acquistata (registrata tramite scanner) e la quantita teoricamente consumata
              (calcolata in base alle vendite e alle porzioni delle ricette). La differenza rappresenta lo scarto stimato.
              L'indice di affidabilita indica quanti dati storici il sistema ha a disposizione: piu operazioni vengono registrate,
              piu la stima diventa precisa.
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
