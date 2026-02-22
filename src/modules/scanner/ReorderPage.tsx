import { motion } from 'framer-motion';
import { ShoppingCart, AlertTriangle, Clock } from 'lucide-react';
import { Card, Badge, CountUp } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { calculateReorderSuggestion, formatWeight } from '../../utils/calculations';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } } };

export function ReorderPage() {
  const { products, sales, recipes } = useStore();

  const suggestions = products
    .map((p) => ({ product: p, ...calculateReorderSuggestion(p, sales, recipes) }))
    .sort((a, b) => {
      const urgencyOrder = { alta: 0, media: 1, bassa: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

  const urgent = suggestions.filter((s) => s.urgency === 'alta');
  const medium = suggestions.filter((s) => s.urgency === 'media');
  const toReorder = suggestions.filter((s) => s.shouldReorder);

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'Scanner', href: '/scanner' }, { label: 'Riordino' }]} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Suggerimenti di Riordino"
            subtitle="Il sistema analizza i consumi medi settimanali e le scorte attuali per suggerire automaticamente quali prodotti riordinare e in che quantita. I suggerimenti tengono conto delle soglie minime definite per ogni prodotto."
          />
        </motion.div>

        {/* Summary */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mb-10">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Urgenza Alta</p>
              <p className="text-xl font-bold text-danger"><CountUp end={urgent.length} duration={1.5} /></p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Urgenza Media</p>
              <p className="text-xl font-bold text-warning"><CountUp end={medium.length} duration={1.5} /></p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-accent-gold" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Da Riordinare</p>
              <p className="text-xl font-bold text-accent-gold"><CountUp end={toReorder.length} duration={1.5} /></p>
            </div>
          </Card>
        </motion.div>

        {/* Reorder list */}
        <Section title="Lista Riordino">
          <motion.div variants={itemVariants}>
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Fornitore</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Scorta</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Qta Suggerita</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Urgenza</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Motivazione</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {suggestions.filter((s) => s.shouldReorder).map((s) => (
                      <tr key={s.product.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-900">{s.product.name}</td>
                        <td className="px-5 py-3 text-gray-600">{s.product.supplier}</td>
                        <td className="px-5 py-3 text-right text-gray-600">{formatWeight(s.product.quantity)}</td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatWeight(s.quantity)}</td>
                        <td className="px-5 py-3">
                          <Badge
                            variant={s.urgency === 'alta' ? 'danger' : s.urgency === 'media' ? 'warning' : 'info'}
                            size="sm"
                          >
                            {s.urgency.charAt(0).toUpperCase() + s.urgency.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500 max-w-xs">{s.reason}</td>
                      </tr>
                    ))}
                    {!suggestions.some((s) => s.shouldReorder) && (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-gray-500">Nessun riordino necessario al momento</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </Section>

        {/* How it works */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-900 text-white border-gray-800" padding="lg">
            <h3 className="font-semibold mb-3">Come funzionano i suggerimenti</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Il sistema calcola il consumo medio settimanale di ogni prodotto sulla base delle vendite registrate.
              Confronta la scorta attuale con la soglia minima definita e con il consumo previsto per i prossimi giorni.
              Se la scorta rischia di scendere sotto il livello minimo, viene generato un suggerimento di riordino
              con la quantita consigliata e il livello di urgenza.
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
