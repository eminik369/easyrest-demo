import { motion } from 'framer-motion';
import { Armchair, RefreshCw, Shuffle, Users, Calendar } from 'lucide-react';
import { Badge, Card, CountUp } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';

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

interface TableDef {
  id: number;
  x: number;
  y: number;
  type: 'round' | 'rect';
  width?: number;
  height?: number;
  radius?: number;
  status: 'available' | 'reserved' | 'occupied';
  seats: number;
}

const tables: TableDef[] = [
  { id: 1, x: 80, y: 80, type: 'round', radius: 28, status: 'available', seats: 2 },
  { id: 2, x: 200, y: 80, type: 'round', radius: 28, status: 'reserved', seats: 2 },
  { id: 3, x: 320, y: 70, type: 'rect', width: 70, height: 44, status: 'available', seats: 4 },
  { id: 4, x: 480, y: 80, type: 'round', radius: 28, status: 'occupied', seats: 2 },
  { id: 5, x: 600, y: 70, type: 'rect', width: 70, height: 44, status: 'reserved', seats: 4 },
  { id: 6, x: 80, y: 200, type: 'rect', width: 70, height: 44, status: 'occupied', seats: 4 },
  { id: 7, x: 220, y: 200, type: 'round', radius: 36, status: 'available', seats: 6 },
  { id: 8, x: 380, y: 200, type: 'round', radius: 28, status: 'reserved', seats: 2 },
  { id: 9, x: 500, y: 190, type: 'rect', width: 90, height: 50, status: 'available', seats: 6 },
  { id: 10, x: 650, y: 200, type: 'round', radius: 28, status: 'available', seats: 2 },
  { id: 11, x: 120, y: 330, type: 'round', radius: 36, status: 'reserved', seats: 6 },
  { id: 12, x: 280, y: 330, type: 'rect', width: 70, height: 44, status: 'available', seats: 4 },
  { id: 13, x: 440, y: 330, type: 'round', radius: 28, status: 'occupied', seats: 2 },
  { id: 14, x: 580, y: 320, type: 'rect', width: 90, height: 50, status: 'reserved', seats: 8 },
];

const statusColors: Record<string, { fill: string; stroke: string }> = {
  available: { fill: '#dcfce7', stroke: '#22c55e' },
  reserved: { fill: '#fef3c7', stroke: '#d97706' },
  occupied: { fill: '#f3f4f6', stroke: '#6b7280' },
};

const features = [
  {
    icon: Armchair,
    title: 'Selezione Tavolo',
    description:
      'Visualizzazione dei tavoli disponibili con scelta diretta del posto, come la selezione posti in aereo o al cinema.',
  },
  {
    icon: RefreshCw,
    title: 'Aggiornamento Tempo Reale',
    description:
      'Disponibilita aggiornata in tempo reale in caso di cancellazioni o modifiche.',
  },
  {
    icon: Shuffle,
    title: 'Riassegnazione Automatica',
    description:
      'Riassegnazione automatica dei tavoli in base al numero effettivo di coperti presenti.',
  },
];

const available = tables.filter((t) => t.status === 'available');
const reserved = tables.filter((t) => t.status === 'reserved');
const totalSeats = tables.reduce((s, t) => s + t.seats, 0);

export function FloorPlanPage() {
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
              { label: 'Gestione Sala' },
            ]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader
            badge={<Badge variant="development" size="lg">In Fase di Sviluppo</Badge>}
            title="Gestione Intelligente della Sala e delle Prenotazioni"
            subtitle="Un sistema avanzato di prenotazione che consente al cliente e al personale di sala di gestire i tavoli in modo dinamico e trasparente."
          />
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tavoli Totali</p>
              <p className="text-xl font-bold text-gray-900"><CountUp end={tables.length} duration={1.5} /></p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Armchair className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Disponibili</p>
              <p className="text-xl font-bold text-success"><CountUp end={available.length} duration={1.5} /></p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Prenotati</p>
              <p className="text-xl font-bold text-warning"><CountUp end={reserved.length} duration={1.5} /></p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Posti Totali</p>
              <p className="text-xl font-bold text-gray-900"><CountUp end={totalSeats} duration={1.5} /></p>
            </div>
          </Card>
        </motion.div>

        {/* Floor Plan SVG */}
        <motion.div variants={itemVariants}>
          <Card className="mb-12 overflow-hidden" padding="lg">
            <div className="flex justify-center">
              <svg
                viewBox="0 0 740 420"
                className="w-full max-w-3xl"
                style={{ minHeight: 320 }}
              >
                {/* Room outline */}
                <rect
                  x="10" y="10" width="720" height="400"
                  rx="16" ry="16"
                  fill="#f9fafb" stroke="#d1d5db" strokeWidth="2"
                />

                {/* Entrance indicator */}
                <rect x="330" y="390" width="80" height="20" rx="4" fill="#e5e7eb" />
                <text x="370" y="405" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="system-ui, sans-serif">
                  INGRESSO
                </text>

                {/* Bar area */}
                <rect x="620" y="30" width="90" height="14" rx="4" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
                <text x="665" y="60" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="system-ui, sans-serif">
                  BAR
                </text>

                {/* Tables */}
                {tables.map((table) => {
                  const colors = statusColors[table.status];
                  if (table.type === 'round') {
                    return (
                      <g key={table.id}>
                        <circle
                          cx={table.x} cy={table.y} r={table.radius ?? 28}
                          fill={colors.fill} stroke={colors.stroke} strokeWidth="2"
                        />
                        <text
                          x={table.x} y={table.y + 1}
                          textAnchor="middle" dominantBaseline="central"
                          fontSize="13" fontWeight="600" fill={colors.stroke}
                          fontFamily="system-ui, sans-serif"
                        >
                          {table.id}
                        </text>
                        <text
                          x={table.x} y={table.y + (table.radius ?? 28) + 14}
                          textAnchor="middle" fontSize="9" fill="#9ca3af"
                          fontFamily="system-ui, sans-serif"
                        >
                          {table.seats}p
                        </text>
                      </g>
                    );
                  }
                  const w = table.width ?? 70;
                  const h = table.height ?? 44;
                  return (
                    <g key={table.id}>
                      <rect
                        x={table.x - w / 2} y={table.y - h / 2}
                        width={w} height={h} rx="8" ry="8"
                        fill={colors.fill} stroke={colors.stroke} strokeWidth="2"
                      />
                      <text
                        x={table.x} y={table.y + 1}
                        textAnchor="middle" dominantBaseline="central"
                        fontSize="13" fontWeight="600" fill={colors.stroke}
                        fontFamily="system-ui, sans-serif"
                      >
                        {table.id}
                      </text>
                      <text
                        x={table.x} y={table.y + h / 2 + 14}
                        textAnchor="middle" fontSize="9" fill="#9ca3af"
                        fontFamily="system-ui, sans-serif"
                      >
                        {table.seats}p
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Disponibile</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                <span className="text-sm text-gray-600">Prenotato</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-gray-500" />
                <span className="text-sm text-gray-600">Occupato</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Features in development */}
        <Section title="Funzionalita in sviluppo">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                custom={index}
              >
                <Card className="h-full hover:shadow-md transition-shadow duration-300">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-amber-600" />
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-amber-400 p-8">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span className="text-gray-700">Ottimizzazione dell'uso dei tavoli</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span className="text-gray-700">Riduzione dei buchi di sala</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span className="text-gray-700">Migliore esperienza per il cliente e per il personale</span>
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
