import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, Package, AlertTriangle, ShieldCheck, Trash2, ShoppingCart, ArrowLeftRight,
  Camera, Check, Smartphone, Database, Bell,
} from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { useTutorial } from '../../components/Tutorial';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const subPages = [
  { to: '/scanner/inventory', icon: Package, label: 'Inventario', desc: 'Stato completo del magazzino con quantita e soglie minime per ogni prodotto' },
  { to: '/scanner/expiry', icon: AlertTriangle, label: 'Scadenze', desc: 'Monitoraggio automatico delle date di scadenza con alert in tempo reale' },
  { to: '/scanner/haccp', icon: ShieldCheck, label: 'HACCP', desc: 'Registro di conformita generato automaticamente ad ogni scansione' },
  { to: '/scanner/waste', icon: Trash2, label: 'Sprechi', desc: 'Stima intelligente degli scarti con indice di affidabilita crescente nel tempo' },
  { to: '/scanner/reorder', icon: ShoppingCart, label: 'Riordino', desc: 'Suggerimenti automatici basati su consumo medio e soglie minime' },
  { to: '/scanner/comparison', icon: ArrowLeftRight, label: 'Confronto', desc: 'Analisi delle differenze tra quantita acquistate e consumate' },
];

const tutorialSteps = [
  { title: 'La Scansione', description: 'Il cuoco prende lo smartphone e inquadra il codice a barre sull\'etichetta del prodotto. Non serve hardware aggiuntivo: basta la fotocamera del telefono.' },
  { title: 'Registrazione Automatica', description: 'Il sistema legge il codice e registra automaticamente: nome prodotto, fornitore, numero di lotto, data di scadenza, quantita e prezzo. Zero inserimento manuale.' },
  { title: 'Aggiornamento Magazzino', description: 'Il magazzino si aggiorna in tempo reale. Le scorte vengono monitorate, gli alert di scadenza vengono generati, il registro HACCP viene compilato automaticamente.' },
  { title: 'Intelligenza Predittiva', description: 'Il sistema analizza i dati nel tempo e impara a stimare gli sprechi, suggerire riordini e prevedere i consumi futuri. Piu dati raccoglie, piu diventa preciso.' },
];

type ScanPhase = 'idle' | 'scanning' | 'analyzing' | 'done';

export function ScannerPage() {
  const navigate = useNavigate();
  const { products } = useStore();
  const tutorial = useTutorial();
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [scannedProduct, setScannedProduct] = useState(products[0]);

  const startScan = () => {
    setPhase('scanning');
    setTimeout(() => setPhase('analyzing'), 2200);
    setTimeout(() => {
      setScannedProduct(products[Math.floor(Math.random() * products.length)]);
      setPhase('done');
    }, 3800);
  };

  const resetScan = () => setPhase('idle');

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'Scanner e Magazzino' }]} />
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <PageHeader
            title="Scanner Etichette e Gestione Magazzino"
            subtitle="Ogni prodotto che entra in cucina viene scansionato tramite lo smartphone. Il sistema legge automaticamente il codice a barre dall'etichetta e registra tutte le informazioni: fornitore, lotto, data di scadenza, quantita e prezzo. Nessun inserimento manuale, nessun errore umano."
          />
          <button
            onClick={() => tutorial?.startTutorial(tutorialSteps)}
            className="shrink-0 mt-2 px-4 py-2 rounded-xl bg-accent-gold/10 text-accent-gold text-sm font-medium hover:bg-accent-gold/20 transition-colors cursor-pointer"
          >
            Come Funziona
          </button>
        </motion.div>

        {/* Animated workflow visualization */}
        <motion.div variants={itemVariants} className="mb-16">
          <Card padding="none" className="overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-8 sm:p-12">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 text-center mb-8">Il Processo di Scansione</p>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4 max-w-3xl mx-auto">
                {[
                  { icon: Smartphone, label: 'Scansione', desc: 'Lo smartphone legge il codice a barre' },
                  { icon: Database, label: 'Registrazione', desc: 'Dati salvati automaticamente' },
                  { icon: ShieldCheck, label: 'Conformita', desc: 'Registro HACCP aggiornato' },
                  { icon: Bell, label: 'Alert', desc: 'Notifiche scadenze e riordini' },
                ].map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
                    className="flex-1 text-center"
                  >
                    <motion.div
                      className="w-14 h-14 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center mx-auto mb-3"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ delay: 0.5 + i * 0.3, duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <step.icon className="w-6 h-6 text-accent-gold" />
                    </motion.div>
                    <p className="text-white text-sm font-semibold mb-1">{step.label}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Animated connection lines */}
              <div className="hidden sm:flex items-center justify-center gap-0 max-w-2xl mx-auto -mt-[72px] mb-[72px]">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="flex-1 h-px bg-accent-gold/20 mx-8"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8 + i * 0.3, duration: 0.6 }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Interactive scanner simulation */}
        <Section title="Simulazione Interattiva" subtitle="Prova la scansione: clicca il pulsante per simulare la lettura di un codice a barre.">
          <motion.div variants={itemVariants}>
            <Card padding="lg" className="max-w-lg mx-auto">
              <AnimatePresence mode="wait">
                {phase === 'idle' && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                    <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                      <Camera className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-800 font-semibold mb-2">Inquadra il codice a barre</p>
                    <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
                      Nella realta, il cuoco punta la fotocamera dello smartphone verso l'etichetta del prodotto.
                      Il riconoscimento avviene in meno di un secondo.
                    </p>
                    <Button onClick={startScan}>Simula Scansione</Button>
                  </motion.div>
                )}

                {phase === 'scanning' && (
                  <motion.div key="scanning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
                    <div className="relative w-52 h-52 mx-auto mb-6 bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-4 border-2 border-accent-gold/60 rounded-lg" />
                      <motion.div
                        className="absolute left-4 right-4 h-0.5 bg-accent-gold shadow-[0_0_8px_rgba(201,169,98,0.6)]"
                        animate={{ top: ['15%', '85%', '15%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div className="flex gap-[2px] items-center">
                        {[3,1,2,1,3,2,1,1,3,1,2,3,1,2,1,3,2,1,1,2].map((w, i) => (
                          <div key={i} className="bg-white rounded-[1px]" style={{ width: w * 2, height: 40 + Math.random() * 20 }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Lettura codice a barre in corso...</p>
                  </motion.div>
                )}

                {phase === 'analyzing' && (
                  <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                    <div className="w-24 h-24 rounded-2xl bg-accent-gold/10 flex items-center justify-center mx-auto mb-6">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <ScanLine className="w-10 h-10 text-accent-gold" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Analisi e registrazione dei dati...</p>
                    <p className="text-xs text-gray-400 mt-1">Il sistema verifica il prodotto nel database fornitori</p>
                  </motion.div>
                )}

                {phase === 'done' && (
                  <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-left">
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center"
                      >
                        <Check className="w-6 h-6 text-success" />
                      </motion.div>
                      <div>
                        <p className="font-bold text-gray-900">Prodotto Registrato</p>
                        <p className="text-xs text-gray-500">Dati salvati nel sistema, magazzino aggiornato, registro HACCP compilato</p>
                      </div>
                    </div>

                    <div className="space-y-3 bg-gray-50 rounded-xl p-5 mb-6">
                      {[
                        ['Prodotto', scannedProduct.name],
                        ['Codice a Barre', scannedProduct.barcode],
                        ['Fornitore', scannedProduct.supplier],
                        ['Lotto', scannedProduct.lot],
                        ['Scadenza', new Date(scannedProduct.expiryDate).toLocaleDateString('it-IT')],
                        ['Quantita', `${scannedProduct.quantity} ${scannedProduct.unit}`],
                        ['Categoria', scannedProduct.category],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Button variant="secondary" size="sm" onClick={resetScan}>Nuova Scansione</Button>
                      <Button size="sm" onClick={() => navigate('/scanner/inventory')}>Vai al Magazzino</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </Section>

        {/* Sub-pages */}
        <Section title="Strumenti di Gestione" subtitle="Ogni aspetto del magazzino e monitorato automaticamente a partire dai dati raccolti con lo scanner.">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subPages.map((page) => (
              <motion.div key={page.to} variants={itemVariants}>
                <Card hoverable onClick={() => navigate(page.to)} className="cursor-pointer h-full">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <page.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{page.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{page.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* EE Partners branding */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-8 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );
}
