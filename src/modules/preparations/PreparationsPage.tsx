import { motion } from 'framer-motion';
import { Clock, Users, ChefHat, ListChecks, Timer, Package, UtensilsCrossed, CalendarCheck } from 'lucide-react';
import { Card, Badge, ProgressBar } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { useTutorial } from '../../components/Tutorial';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } } };

function getStatus(prep: { preparedAt: string | null; portionsAvailable: number; portionsNeeded: number }) {
  if (!prep.preparedAt) return { label: 'Da iniziare', variant: 'default' as const };
  if (prep.portionsAvailable >= prep.portionsNeeded) return { label: 'Completata', variant: 'success' as const };
  return { label: 'In corso', variant: 'warning' as const };
}

const tutorialSteps = [
  { title: 'Cosa sono le Preparazioni', description: 'Le preparazioni sono le lavorazioni di base che lo chef fa prima del servizio: fondi, salse, riduzioni, impasti, creme. Sono gli elementi che compongono i piatti del menu e vanno preparati in anticipo.' },
  { title: 'Il Calcolo Automatico', description: 'Il sistema sa quali piatti del menu usano ogni preparazione e quanti coperti sono prenotati. Da questi dati calcola quante porzioni di ogni preparazione servono per il servizio.' },
  { title: 'Conservazione e Scadenze', description: 'Ogni preparazione ha un tempo massimo di conservazione (es. un fondo dura 72h, una crema 24h). Il sistema avvisa quando una preparazione sta per scadere o va rifatta.' },
  { title: 'Lista della Spesa', description: 'Per ogni preparazione vengono elencati gli ingredienti necessari con le quantita. Il sistema verifica automaticamente che siano disponibili in magazzino.' },
];

export function PreparationsPage() {
  const { preparations, reservations } = useStore();
  const tutorial = useTutorial();

  const todayCovers = reservations
    .filter((r) => r.date === '2026-02-22')
    .reduce((s, r) => s + r.covers, 0);

  const completed = preparations.filter((p) => p.portionsAvailable >= p.portionsNeeded).length;
  const inProgress = preparations.filter((p) => p.preparedAt && p.portionsAvailable < p.portionsNeeded).length;
  const toStart = preparations.filter((p) => !p.preparedAt).length;

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'Preparazioni' }]} />
        </motion.div>
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <PageHeader
            title="Mise en Place Intelligente"
            subtitle="Le preparazioni base (fondi, salse, impasti, creme) sono le lavorazioni che lo chef esegue prima del servizio. Il sistema calcola automaticamente quante porzioni servono in base ai piatti del menu e ai coperti prenotati per il giorno."
          />
          <button
            onClick={() => tutorial?.startTutorial(tutorialSteps)}
            className="shrink-0 mt-2 px-4 py-2 rounded-xl bg-accent-gold/10 text-accent-gold text-sm font-medium hover:bg-accent-gold/20 transition-colors cursor-pointer"
          >
            Come Funziona
          </button>
        </motion.div>

        {/* What are preparations - clear explanation */}
        <motion.div variants={itemVariants} className="mb-10">
          <Card padding="none" className="overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 text-center mb-6">Come funziona</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-3xl mx-auto">
                {[
                  { icon: CalendarCheck, label: 'Prenotazioni', desc: `${todayCovers} coperti prenotati oggi` },
                  { icon: UtensilsCrossed, label: 'Menu Attivo', desc: 'Piatti che usano queste basi' },
                  { icon: ListChecks, label: 'Porzioni Necessarie', desc: 'Calcolate automaticamente' },
                  { icon: ChefHat, label: 'Lista per lo Chef', desc: 'Cosa preparare e quanto' },
                  { icon: Timer, label: 'Monitoraggio', desc: 'Scadenze e conservazione' },
                ].map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                    className="text-center flex-1"
                  >
                    <motion.div
                      className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center mx-auto mb-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ delay: 0.5 + i * 0.3, duration: 2, repeat: Infinity, repeatDelay: 4 }}
                    >
                      <step.icon className="w-5 h-5 text-accent-gold" />
                    </motion.div>
                    <p className="text-white text-xs font-semibold">{step.label}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Concrete example */}
        <motion.div variants={itemVariants} className="mb-10">
          <Card className="border-l-4 border-l-accent-gold" padding="lg">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Esempio pratico</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Il <strong>Fondo Bruno</strong> viene usato nel Filetto alla Rossini e nel Risotto al Barolo.
              Se oggi hai 79 coperti e storicamente il 20% ordina il filetto e il 15% il risotto, servono circa 28 porzioni di fondo.
              Il sistema confronta questo numero con le porzioni gia disponibili e ti dice se devi prepararne di piu.
            </p>
          </Card>
        </motion.div>

        {/* Context info */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <Card className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-gold" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Coperti Oggi</p>
              <p className="text-xl font-bold text-gray-900">{todayCovers}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Preparazioni</p>
              <p className="text-xl font-bold text-gray-900">{preparations.length}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pronte</p>
              <p className="text-xl font-bold text-success">{completed}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Timer className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Da Fare</p>
              <p className="text-xl font-bold text-gray-900">{inProgress + toStart}</p>
            </div>
          </Card>
        </motion.div>

        {/* Preparations list */}
        <Section title="Preparazioni del Giorno" subtitle="Le lavorazioni base necessarie per il servizio di oggi. Per ognuna: quante porzioni servono, quante sono gia pronte, e gli ingredienti necessari.">
          <div className="space-y-4">
            {preparations.map((prep) => {
              const progress = prep.portionsNeeded > 0 ? (prep.portionsAvailable / prep.portionsNeeded) * 100 : 100;
              const status = getStatus(prep);
              const deficit = Math.max(0, prep.portionsNeeded - prep.portionsAvailable);

              return (
                <motion.div key={prep.id} variants={itemVariants}>
                  <Card>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-base font-semibold text-gray-900">{prep.name}</h3>
                          <Badge variant={status.variant} size="sm">{status.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {prep.portionsAvailable} porzioni pronte su {prep.portionsNeeded} necessarie
                          {deficit > 0 && <span className="text-danger font-medium"> — mancano {deficit}</span>}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Conservazione massima: {prep.maxConservationHours}h
                          {prep.preparedAt && (
                            <> — Preparato il {new Date(prep.preparedAt).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</>
                          )}
                          {prep.expiresAt && (
                            <> — Scade il {new Date(prep.expiresAt).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</>
                          )}
                        </p>
                      </div>
                    </div>

                    <ProgressBar
                      value={prep.portionsAvailable}
                      max={prep.portionsNeeded}
                      color={progress >= 100 ? 'bg-success' : progress >= 50 ? 'bg-accent-gold' : 'bg-danger'}
                      showLabel
                    />

                    {/* Ingredients */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Ingredienti per questa preparazione</p>
                      <div className="flex flex-wrap gap-2">
                        {prep.ingredients.map((ing) => (
                          <span key={ing.productId} className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-gray-700">
                            {ing.productName}: {ing.quantity}{ing.unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Section>

        {/* Explanation card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-900 text-white border-gray-800 mt-8" padding="lg">
            <h3 className="font-semibold mb-2 text-sm">Perche le preparazioni sono importanti</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Le preparazioni base rappresentano una parte significativa del lavoro in cucina.
              Senza un sistema di pianificazione, lo chef deve stimare a occhio quanto preparare — rischiando di produrre troppo (spreco)
              o troppo poco (ritardi durante il servizio). EasyRest automatizza questo calcolo
              incrociando le prenotazioni, i piatti del menu e lo storico dei consumi.
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
