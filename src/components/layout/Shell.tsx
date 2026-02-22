import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat, ScanLine, ClipboardList, BarChart3, MapPin, MessageCircle,
  Briefcase, LayoutDashboard, Menu, X, HelpCircle,
} from 'lucide-react';
import { useTutorial } from '../Tutorial';

const nav = [
  { to: '/overview', label: 'Panoramica', icon: LayoutDashboard },
  { to: '/recipes', label: 'Ricette', icon: ChefHat },
  { to: '/scanner', label: 'Scanner e Magazzino', icon: ScanLine },
  { to: '/preparations', label: 'Preparazioni', icon: ClipboardList },
  { to: '/analytics', label: 'Analisi', icon: BarChart3 },
  { to: '/floor-plan', label: 'Gestione Sala', icon: MapPin, dev: true },
  { to: '/chatbot', label: 'Chatbot', icon: MessageCircle },
  { to: '/business-case', label: 'Business Case', icon: Briefcase },
];

const globalTutorialSteps = [
  {
    title: 'Benvenuto in EasyRest',
    description: 'Questa e una demo interattiva della piattaforma EasyRest, un sistema integrato di strumenti per la gestione operativa del ristorante. Utilizza il menu laterale per navigare tra i moduli.',
  },
  {
    title: 'Modulo Ricette',
    description: 'Qui trovi il ricettario completo del ristorante. Ogni piatto ha i suoi ingredienti con le quantita esatte. Il sistema calcola automaticamente il costo per porzione e il margine operativo, aggiornandosi quando cambiano i prezzi dei fornitori.',
  },
  {
    title: 'Scanner e Magazzino',
    description: 'Ogni prodotto che entra in cucina viene scansionato con lo smartphone. Il sistema legge il codice a barre e registra automaticamente: fornitore, lotto, data di scadenza, quantita e prezzo. Da qui si controllano scadenze, conformita HACCP, sprechi e riordini.',
  },
  {
    title: 'Preparazioni',
    description: 'Le preparazioni base (fondi, salse, impasti) vengono pianificate in anticipo sulla base delle prenotazioni e del menu attivo. Il sistema calcola le quantita necessarie e monitora lo stato di avanzamento.',
  },
  {
    title: 'Analisi Predittiva',
    description: 'Dashboard completa con trend di vendita, piatti piu venduti, distribuzione per categoria e un sistema di previsione dei consumi che funziona in tre modalita: per coperti prenotati, per storico, o per soglia minima.',
  },
  {
    title: 'Moduli in Sviluppo',
    description: 'La Gestione Sala (prenotazioni e mappa tavoli interattiva) e il Chatbot AI per i clienti sono in fase di sviluppo. Le pagine mostrano un\'anteprima delle funzionalita previste.',
  },
  {
    title: 'Business Case',
    description: 'Nella sezione Business Case trovi il modello di revenue, il mercato target, la roadmap prodotto e i vantaggi competitivi. Utile per presentazioni a investitori.',
  },
];

export function Shell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const tutorial = useTutorial();

  const handleTutorial = () => {
    tutorial?.startTutorial(globalTutorialSteps);
  };

  return (
    <div className="flex min-h-screen bg-gray-100/60">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary-black text-white shrink-0 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <NavLink to="/" className="flex items-center justify-center px-6 py-6 border-b border-white/10">
          <img src="/logos/ee-white.png" alt="EE Partners" className="h-10 w-auto opacity-90" />
        </NavLink>

        {/* Product name */}
        <div className="px-6 py-4 border-b border-white/5">
          <p className="text-lg font-bold tracking-tight">
            Easy<span className="text-accent-gold">Rest</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">La cucina intelligente</p>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-accent-gold border-r-2 border-accent-gold' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
              {item.dev && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-dashed border-gray-600 text-gray-500">DEV</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Tutorial button */}
        <div className="px-4 py-3 border-t border-white/10">
          <button
            onClick={handleTutorial}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-400 hover:text-white cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Guida Interattiva</span>
          </button>
        </div>

        {/* Footer with logo */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center gap-3">
          <img src="/logos/ee-white.png" alt="EE Partners" className="h-5 w-auto opacity-40" />
          <span className="text-[10px] text-gray-600">Demo v1.0</span>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-primary-black text-white flex items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-3">
          <img src="/logos/ee-white.png" alt="EE Partners" className="h-7 w-auto" />
          <span className="font-semibold text-sm">Easy<span className="text-accent-gold">Rest</span></span>
        </NavLink>
        <div className="flex items-center gap-2">
          <button onClick={handleTutorial} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
            <HelpCircle className="w-5 h-5 text-gray-400" />
          </button>
          <button onClick={() => setOpen(!open)} className="p-1">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="relative w-64 h-full bg-primary-black text-white overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <img src="/logos/ee-white.png" alt="EE Partners" className="h-8 w-auto" />
                <button onClick={() => setOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              <nav className="py-4">
                {nav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                        isActive ? 'bg-white/10 text-accent-gold' : 'text-gray-400 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
