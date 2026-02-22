import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, ShieldCheck, CalendarCheck, Bell, Send, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const features = [
  {
    icon: ShieldCheck,
    title: 'Informazioni Allergeni',
    description:
      'Risposte automatiche e precise su allergeni e informazioni dettagliate sui piatti.',
  },
  {
    icon: CalendarCheck,
    title: 'Prenotazioni Automatiche',
    description:
      'Possibilita di prenotare e ordinare scegliendo l\'orario preferito direttamente dalla chat.',
  },
  {
    icon: Bell,
    title: 'Notifiche Intelligenti',
    description:
      'Notifiche automatiche in caso di mancata presa della comanda entro un certo tempo.',
  },
];

function buildSystemPrompt(menuData: string): string {
  return `Sei l'assistente virtuale del ristorante "Ristorante X", un ristorante italiano di alta fascia. Rispondi in italiano, in modo cordiale e professionale.

Le tue capacita:
1. ALLERGENI E INGREDIENTI: Conosci ogni piatto del menu con tutti gli ingredienti. Quando ti chiedono di allergeni, elenca TUTTI gli ingredienti del piatto e segnala quelli che contengono allergeni comuni (glutine, lattosio, uova, pesce, crostacei, frutta a guscio, sedano, senape, soia, arachidi, molluschi, lupini, sesamo, solfiti).
2. MENU E CONSIGLI: Puoi consigliare piatti in base a preferenze, intolleranze o gusti del cliente.
3. PRENOTAZIONI: Puoi aiutare con le prenotazioni. Il ristorante e' aperto dal martedi alla domenica, pranzo 12:00-14:30 e cena 19:30-22:30. Lunedi chiuso.
4. INFORMAZIONI GENERALI: Indirizzo, orari, parcheggio, dress code, ecc.

MENU COMPLETO DEL RISTORANTE:
${menuData}

Regole importanti:
- Sii conciso ma completo sugli allergeni — la sicurezza alimentare e' prioritaria
- Se non sei sicuro di un ingrediente, dillo chiaramente e suggerisci di chiedere al personale
- Non inventare piatti che non sono nel menu
- Per le prenotazioni, chiedi sempre: data, orario, numero di persone e nome
- Rispondi sempre in italiano`;
}

function buildMenuData(recipes: { name: string; category: string; sellingPrice: number; ingredients: { productName: string; quantity: number; unit: string }[] }[]): string {
  const categories: Record<string, string[]> = {};
  for (const r of recipes) {
    const cat = r.category.toUpperCase();
    if (!categories[cat]) categories[cat] = [];
    const ingredientList = r.ingredients.map(i => `${i.productName} (${i.quantity}${i.unit})`).join(', ');
    categories[cat].push(`- ${r.name} — EUR ${r.sellingPrice} | Ingredienti: ${ingredientList}`);
  }
  return Object.entries(categories).map(([cat, items]) => `${cat}:\n${items.join('\n')}`).join('\n\n');
}

async function callOpenAI(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return 'Chiave API non configurata. Inserisci VITE_OPENAI_API_KEY nel file .env per attivare il chatbot.';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Errore API: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Nessuna risposta ricevuta.';
}

const quickQuestions = [
  'Quali piatti sono senza glutine?',
  'Il risotto contiene lattosio?',
  'Consigliami un secondo di pesce',
  'Vorrei prenotare per sabato sera',
];

export function ChatbotPage() {
  const { recipes } = useStore();
  const activeRecipes = recipes.filter(r => r.active);
  const menuData = buildMenuData(activeRecipes);
  const systemPrompt = buildSystemPrompt(menuData);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Buonasera! Sono l\'assistente de Ristorante X. Posso aiutarla con informazioni sul menu, allergeni o prenotazioni. Come posso assisterla?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: msg };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...newMessages.map(m => ({ role: m.role, content: m.content })),
      ];
      const reply = await callOpenAI(apiMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Mi scusi, si e' verificato un errore: ${err instanceof Error ? err.message : 'errore sconosciuto'}. Riprovi tra un momento.` }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50/50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb
            items={[
              { label: 'Panoramica', href: '/overview' },
              { label: 'Chatbot AI' },
            ]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader
            title="Assistente AI del Ristorante"
            subtitle="Chatbot basato su GPT-4o con accesso completo al menu, ingredienti e allergeni. Prova a chiedere qualcosa."
          />
        </motion.div>

        {/* Chat */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gray-900 px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-gold/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent-gold" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Assistente Ristorante X</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-gray-400 text-xs">Online — GPT-4o</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="p-4 space-y-3 h-[480px] overflow-y-auto bg-gray-50/50">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gray-900 text-white rounded-br-md'
                        : 'bg-accent-gold/10 text-gray-800 border border-accent-gold/20 rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-accent-gold animate-spin" />
                    <span className="text-sm text-gray-500">Sto pensando...</span>
                  </div>
                </motion.div>
              )}
              <div />
            </div>

            {/* Quick questions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-white flex gap-2 flex-wrap">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-accent-gold/10 hover:text-accent-gold transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Scrivi un messaggio..."
                  disabled={loading}
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-accent-gold/30 transition-shadow disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-full bg-accent-gold flex items-center justify-center hover:bg-accent-gold/80 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <Section title="Funzionalita attive">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                custom={index}
              >
                <Card className="h-full hover:shadow-md transition-shadow duration-300">
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-accent-gold" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Value proposition */}
        <motion.div variants={itemVariants}>
          <Section title="Valore Aggiunto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-accent-gold p-8">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-2 shrink-0" />
                  <span className="text-gray-700">Il chatbot conosce ogni piatto, ingrediente e allergene del menu in tempo reale</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-2 shrink-0" />
                  <span className="text-gray-700">Riduzione del carico di lavoro per la sala sulle domande ripetitive</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-2 shrink-0" />
                  <span className="text-gray-700">Accessibile ai clienti via QR code al tavolo o dal sito del ristorante</span>
                </li>
              </ul>
            </div>
          </Section>
        </motion.div>

        {/* EE Partners branding */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-8 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );
}
