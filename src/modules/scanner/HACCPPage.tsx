import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileCheck } from 'lucide-react';
import { Card, Badge, CountUp } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { formatDate } from '../../utils/calculations';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } } };

export function HACCPPage() {
  const { haccp } = useStore();

  const conforme = haccp.filter((h) => h.status === 'conforme');
  const nonConforme = haccp.filter((h) => h.status === 'non_conforme');
  const conformityRate = haccp.length > 0 ? (conforme.length / haccp.length) * 100 : 100;

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'Scanner', href: '/scanner' }, { label: 'HACCP' }]} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Registro HACCP Automatico"
            subtitle="Ogni scansione genera automaticamente una voce nel registro HACCP. Il sistema verifica la conformita delle temperature, delle date di scadenza e delle condizioni di conservazione secondo la normativa vigente."
          />
        </motion.div>

        {/* Summary */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Controlli Totali</p>
              <p className="text-xl font-bold text-gray-900"><CountUp end={haccp.length} duration={1.5} /></p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Conformi</p>
              <p className="text-xl font-bold text-success"><CountUp end={conforme.length} duration={1.5} /></p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Non Conformi</p>
              <p className="text-xl font-bold text-danger"><CountUp end={nonConforme.length} duration={1.5} /></p>
            </div>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-gray-500 mb-1">Tasso Conformita</p>
            <p className="text-2xl font-bold text-success"><CountUp end={conformityRate} decimals={1} suffix="%" duration={2} /></p>
          </Card>
        </motion.div>

        {/* Non-conformities first */}
        {nonConforme.length > 0 && (
          <Section title="Non Conformita">
            <motion.div variants={itemVariants} className="space-y-3">
              {nonConforme.map((entry) => (
                <Card key={entry.id} className="border-l-4 border-l-danger">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{entry.productName}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Lotto {entry.lot} — Fornitore: {entry.supplier} — Ricevuto: {formatDate(entry.receivedDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Scadenza: {formatDate(entry.expiryDate)} — Temperatura: {entry.storageTemp}
                      </p>
                    </div>
                    <Badge variant="danger">Non Conforme</Badge>
                  </div>
                </Card>
              ))}
            </motion.div>
          </Section>
        )}

        {/* Full log */}
        <Section title="Registro Completo">
          <motion.div variants={itemVariants}>
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Ricevuto</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Fornitore</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Lotto</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Scadenza</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Temp.</th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Esito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {haccp.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-gray-600">{formatDate(entry.receivedDate)}</td>
                        <td className="px-5 py-3 font-medium text-gray-900">{entry.productName}</td>
                        <td className="px-5 py-3 text-gray-600">{entry.supplier}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs font-mono">{entry.lot}</td>
                        <td className="px-5 py-3 text-gray-600">{formatDate(entry.expiryDate)}</td>
                        <td className="px-5 py-3 text-gray-600">{entry.storageTemp}</td>
                        <td className="px-5 py-3">
                          <Badge variant={entry.status === 'conforme' ? 'success' : 'danger'} size="sm">
                            {entry.status === 'conforme' ? 'Conforme' : 'Non Conforme'}
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
            <h3 className="font-semibold mb-3">Conformita HACCP automatica</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Il registro HACCP viene compilato automaticamente ad ogni scansione. Il sistema verifica la temperatura di conservazione,
              la data di scadenza e la tracciabilita del lotto. In caso di non conformita, l'operatore riceve una notifica immediata
              e la voce viene evidenziata nel registro. Tutto il processo e documentato e disponibile per le ispezioni sanitarie.
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
