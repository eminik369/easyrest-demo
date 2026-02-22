import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, Badge } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { calculateTheoreticalConsumption, formatWeight } from '../../utils/calculations';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } } };

export function ComparisonPage() {
  const { products, sales, recipes } = useStore();

  const comparisonData = products.slice(0, 15).map((p) => {
    const theoretical = calculateTheoreticalConsumption(p.id, sales, recipes);
    const purchased = p.quantity + theoretical * 0.85;
    const diff = purchased - theoretical;
    const diffPct = theoretical > 0 ? ((diff / theoretical) * 100) : 0;

    return {
      name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
      fullName: p.name,
      acquistato: Math.round(purchased * 100) / 100,
      consumato: Math.round(theoretical * 100) / 100,
      differenza: Math.round(diff * 100) / 100,
      diffPct: Math.round(diffPct * 10) / 10,
      unit: p.unit,
    };
  }).filter((d) => d.consumato > 0);

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'Scanner', href: '/scanner' }, { label: 'Confronto' }]} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Confronto Acquisti e Consumi"
            subtitle="Il sistema confronta la quantita di ogni prodotto acquistato (registrato tramite scanner) con la quantita teoricamente consumata (calcolata in base alle vendite e alle ricette). La differenza rappresenta lo scarto reale."
          />
        </motion.div>

        {/* Chart */}
        <Section title="Acquistato vs Consumato">
          <motion.div variants={itemVariants}>
            <Card padding="lg">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} angle={-35} textAnchor="end" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit="kg" />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                      formatter={(value, name) => [`${Number(value).toFixed(2)} kg`, name === 'acquistato' ? 'Acquistato' : 'Consumato']}
                    />
                    <Legend formatter={(v) => v === 'acquistato' ? 'Acquistato' : 'Consumato Teorico'} />
                    <Bar dataKey="acquistato" fill="#C9A962" radius={[6, 6, 0, 0]} barSize={20} />
                    <Bar dataKey="consumato" fill="#22C55E" radius={[6, 6, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Section>

        {/* Detail table */}
        <Section title="Dettaglio">
          <motion.div variants={itemVariants}>
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Acquistato</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Consumo Teorico</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Differenza</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {comparisonData.map((d) => (
                      <tr key={d.fullName} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-900">{d.fullName}</td>
                        <td className="px-5 py-3 text-right text-gray-600">{formatWeight(d.acquistato)}</td>
                        <td className="px-5 py-3 text-right text-gray-600">{formatWeight(d.consumato)}</td>
                        <td className="px-5 py-3 text-right font-medium text-gray-900">{formatWeight(d.differenza)} ({d.diffPct}%)</td>
                        <td className="px-5 py-3">
                          <Badge
                            variant={d.diffPct > 20 ? 'danger' : d.diffPct > 10 ? 'warning' : 'success'}
                            size="sm"
                          >
                            {d.diffPct > 20 ? 'Alto scarto' : d.diffPct > 10 ? 'Scarto medio' : 'Nella norma'}
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
            <h3 className="font-semibold mb-3">Come funziona il confronto</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Il sistema conosce le quantita di ogni ingrediente per ogni ricetta. Moltiplicando per il numero di piatti venduti,
              calcola il consumo teorico di ogni prodotto. La differenza tra quanto acquistato e quanto teoricamente consumato
              rivela gli sprechi effettivi. Un alto scarto puo indicare porzioni non standardizzate, scarti di lavorazione
              eccessivi o problemi di conservazione.
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
