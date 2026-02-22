import { motion } from 'framer-motion';
import { Card, Badge } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { getExpiryStatus, daysUntilExpiry, formatDate } from '../../utils/calculations';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } } };

export function ExpiryPage() {
  const { products } = useStore();

  const sorted = [...products].sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));
  const expired = sorted.filter((p) => getExpiryStatus(p.expiryDate) === 'danger');
  const warning = sorted.filter((p) => getExpiryStatus(p.expiryDate) === 'warning');
  const ok = sorted.filter((p) => getExpiryStatus(p.expiryDate) === 'ok');

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'Scanner', href: '/scanner' }, { label: 'Scadenze' }]} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <PageHeader title="Monitoraggio Scadenze" subtitle="Il sistema monitora automaticamente le date di scadenza di tutti i prodotti registrati tramite scanner e genera alert quando un prodotto si avvicina alla data limite." />
        </motion.div>

        {/* Summary */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mb-10">
          <Card className="text-center border-l-4 border-l-danger">
            <p className="text-3xl font-bold text-danger">{expired.length}</p>
            <p className="text-xs text-gray-500 mt-1">Scaduti</p>
          </Card>
          <Card className="text-center border-l-4 border-l-warning">
            <p className="text-3xl font-bold text-warning">{warning.length}</p>
            <p className="text-xs text-gray-500 mt-1">In Scadenza (3 giorni)</p>
          </Card>
          <Card className="text-center border-l-4 border-l-success">
            <p className="text-3xl font-bold text-success">{ok.length}</p>
            <p className="text-xs text-gray-500 mt-1">Regolari</p>
          </Card>
        </motion.div>

        {/* Expired */}
        {expired.length > 0 && (
          <Section title="Prodotti Scaduti">
            <motion.div variants={itemVariants}>
              <Card padding="none" className="border-danger/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left">
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Lotto</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Scadenza</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Giorni</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Azione</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {expired.map((p) => (
                        <tr key={p.id} className="bg-danger/[0.02]">
                          <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                          <td className="px-5 py-3 text-gray-600">{p.lot}</td>
                          <td className="px-5 py-3 text-gray-600">{formatDate(p.expiryDate)}</td>
                          <td className="px-5 py-3 text-right text-danger font-medium">{daysUntilExpiry(p.expiryDate)}</td>
                          <td className="px-5 py-3"><Badge variant="danger" size="sm">Rimuovere</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </Section>
        )}

        {/* Warning */}
        {warning.length > 0 && (
          <Section title="In Scadenza">
            <motion.div variants={itemVariants}>
              <Card padding="none" className="border-warning/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left">
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Lotto</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Scadenza</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Giorni Rimasti</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Priorita</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {warning.map((p) => (
                        <tr key={p.id}>
                          <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                          <td className="px-5 py-3 text-gray-600">{p.lot}</td>
                          <td className="px-5 py-3 text-gray-600">{formatDate(p.expiryDate)}</td>
                          <td className="px-5 py-3 text-right font-medium text-warning">{daysUntilExpiry(p.expiryDate)}</td>
                          <td className="px-5 py-3"><Badge variant="warning" size="sm">Usare subito</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </Section>
        )}

        {/* How it works */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-900 text-white border-gray-800" padding="lg">
            <h3 className="font-semibold mb-3">Come funziona il monitoraggio</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ad ogni scansione, il sistema registra la data di scadenza del prodotto. Un algoritmo monitora continuamente
              tutti i prodotti in magazzino e genera tre livelli di alert: regolare (piu di 3 giorni), in scadenza (meno di 3 giorni)
              e scaduto. Il personale riceve notifiche in tempo reale per gestire le priorita di utilizzo.
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
