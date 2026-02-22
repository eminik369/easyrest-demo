import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChefHat, ScanLine, BarChart3, ClipboardList, MapPin, MessageCircle, Briefcase } from 'lucide-react';

const modules = [
  { icon: ChefHat, label: 'Ricette e Costi', desc: 'Gestione completa del ricettario con calcolo automatico dei costi per porzione e dei margini operativi' },
  { icon: ScanLine, label: 'Scanner Intelligente', desc: 'Scansione delle etichette dei prodotti tramite smartphone con registrazione automatica di lotto, scadenza e fornitore' },
  { icon: ClipboardList, label: 'Preparazioni', desc: 'Pianificazione delle preparazioni base in funzione delle prenotazioni e del consumo storico' },
  { icon: BarChart3, label: 'Analisi Predittiva', desc: 'Dashboard analitica con trend di vendita, previsioni dei consumi e collegamento al sistema POS' },
  { icon: MapPin, label: 'Gestione Sala', desc: 'Mappa interattiva dei tavoli con prenotazioni in tempo reale e seat selection per il cliente' },
  { icon: MessageCircle, label: 'Chatbot AI', desc: 'Assistente virtuale per i clienti: allergeni, prenotazioni automatiche e notifiche intelligenti' },
];

export function CoverPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-black text-white overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(201,169,98,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(201,169,98,0.05) 0%, transparent 50%)',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Top bar with EE Partners logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative flex items-center justify-between px-8 pt-8"
      >
        <img src="/logos/ee-white.png" alt="EE Partners" className="h-12 w-auto opacity-90" />
        <span className="text-xs text-gray-500 tracking-widest uppercase">Presentazione Prodotto</span>
      </motion.div>

      {/* Hero section */}
      <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center">
        {/* Main EE Partners logo — large */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          className="mb-10"
        >
          <img src="/logos/ee-white.png" alt="EE Partners" className="h-32 sm:h-44 w-auto mx-auto" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-xs uppercase tracking-[0.3em] text-accent-gold font-medium mb-6"
        >
          presenta
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          className="text-6xl sm:text-8xl font-bold tracking-tight leading-[1.05]"
        >
          Easy<span className="text-accent-gold">Rest</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.6 }}
          className="mt-6 mb-2"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-accent-gold/30 text-accent-gold text-sm font-medium tracking-wide">
            La cucina intelligente
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed"
        >
          Una piattaforma integrata di strumenti basati su intelligenza artificiale per la gestione operativa
          del ristorante. Dalla scansione delle etichette al controllo dei costi, dalle previsioni
          di consumo alla conformita HACCP — tutto in un unico sistema.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="flex gap-4 mt-10"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/overview')}
            className="flex items-center gap-3 bg-accent-gold text-primary-black px-8 py-3.5 rounded-xl text-base font-semibold cursor-pointer transition-colors hover:bg-accent-gold-dark"
          >
            Esplora la Demo
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/business-case')}
            className="flex items-center gap-3 border border-white/20 text-white px-8 py-3.5 rounded-xl text-base font-medium cursor-pointer transition-colors hover:bg-white/5"
          >
            <Briefcase className="w-4 h-4" />
            Business Case
          </motion.button>
        </motion.div>
      </div>

      {/* Animated separator line */}
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent"
        />
      </div>

      {/* Modules section */}
      <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="text-xs uppercase tracking-[0.2em] text-gray-500 text-center mb-10"
        >
          Sei moduli integrati
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 + i * 0.1, duration: 0.5 }}
              className="border border-white/8 rounded-2xl p-7 hover:border-accent-gold/25 hover:bg-white/[0.02] transition-all duration-300 group"
            >
              <mod.icon className="w-7 h-7 text-accent-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-sm font-semibold text-white mb-2 tracking-wide">{mod.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{mod.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Animated workflow preview */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 sm:p-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 text-center mb-8">Come funziona</p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
            {[
              { step: '01', title: 'Scansiona', desc: 'Il prodotto entra in cucina e viene scansionato con lo smartphone' },
              { step: '02', title: 'Analizza', desc: 'Il sistema registra automaticamente tutti i dati e aggiorna il magazzino' },
              { step: '03', title: 'Prevedi', desc: 'L\'AI calcola consumi, sprechi e suggerisce riordini e preparazioni' },
              { step: '04', title: 'Ottimizza', desc: 'I costi si riducono, la conformita HACCP e garantita, i margini crescono' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.6 + i * 0.15, duration: 0.5 }}
                className="flex-1 text-center"
              >
                <div className="w-12 h-12 rounded-full border-2 border-accent-gold/40 flex items-center justify-center mx-auto mb-3">
                  <span className="text-accent-gold font-bold text-sm">{item.step}</span>
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden sm:block absolute">
                    <ArrowRight className="w-4 h-4 text-gray-600 mt-2" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2, duration: 0.6 }}
        className="relative flex flex-col items-center pb-12"
      >
        <img src="/logos/ee-white.png" alt="EE Partners" className="h-8 w-auto opacity-40 mb-3" />
        <p className="text-xs text-gray-600">
          Ambiente dimostrativo — Dati simulati a scopo illustrativo
        </p>
      </motion.div>
    </div>
  );
}
