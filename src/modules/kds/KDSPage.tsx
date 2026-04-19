import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Volume2,
  ChevronDown,
  FastForward,
  Flame,
  Utensils,
  Snowflake,
  Cookie,
  CircleDot,
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import type { KDSOrder, KDSItem, KDSStation } from '../../types';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

type ItemStatus = KDSItem['status'];
type Priority = KDSOrder['priority'];
type StationFilter = 'all' | KDSStation;

const STATION_META: Record<KDSStation, { label: string; dot: string; ring: string; avgWait: number; icon: typeof Flame }> = {
  freddo: { label: 'Freddo', dot: 'bg-sky-500', ring: 'border-sky-500/40 text-sky-600', avgWait: 4, icon: Snowflake },
  caldo: { label: 'Caldo', dot: 'bg-amber-500', ring: 'border-amber-500/40 text-amber-600', avgWait: 8, icon: Utensils },
  pasta: { label: 'Pasta', dot: 'bg-violet-500', ring: 'border-violet-500/40 text-violet-600', avgWait: 12, icon: CircleDot },
  grill: { label: 'Grill', dot: 'bg-red-600', ring: 'border-red-600/40 text-red-700', avgWait: 18, icon: Flame },
  pasticceria: { label: 'Pasticceria', dot: 'bg-pink-500', ring: 'border-pink-500/40 text-pink-600', avgWait: 6, icon: Cookie },
};

const STATIONS_ORDER: KDSStation[] = ['freddo', 'caldo', 'pasta', 'grill', 'pasticceria'];

function cycleStatus(s: ItemStatus): ItemStatus {
  if (s === 'attesa') return 'preparazione';
  if (s === 'preparazione') return 'pronto';
  return 'attesa';
}

function statusPillClasses(s: ItemStatus) {
  switch (s) {
    case 'attesa':
      return 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200';
    case 'preparazione':
      return 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/25';
    case 'pronto':
      return 'bg-success/15 text-success border-success/30 hover:bg-success/25';
  }
}

function statusLabel(s: ItemStatus) {
  if (s === 'attesa') return 'Attesa';
  if (s === 'preparazione') return 'In preparazione';
  return 'Pronto';
}

function priorityHeaderClasses(p: Priority) {
  if (p === 'critico') return 'bg-danger text-white';
  if (p === 'urgente') return 'bg-warning/80 text-white';
  return 'bg-gray-900 text-white';
}

function priorityBorderClasses(p: Priority) {
  if (p === 'critico') return 'border-2 border-danger/70';
  if (p === 'urgente') return 'border-2 border-accent-gold/70';
  return 'border border-gray-200';
}

function priorityBadgeVariant(p: Priority): 'danger' | 'warning' | 'default' {
  if (p === 'critico') return 'danger';
  if (p === 'urgente') return 'warning';
  return 'default';
}

function formatTimer(elapsedMinutes: number, tick: number): string {
  // Uses a rolling second value derived from the clock for visual variation.
  const totalSeconds = Math.max(0, elapsedMinutes) * 60 + (tick % 60);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function computePriority(elapsed: number, avg: number): Priority {
  if (elapsed > avg * 1.5) return 'critico';
  if (elapsed > avg + 2) return 'urgente';
  return 'normale';
}

interface DisplayOrder extends KDSOrder {
  elapsedDisplay: number;
  priorityDisplay: Priority;
  itemsDisplay: (KDSItem & { statusDisplay: ItemStatus })[];
}

export function KDSPage() {
  const { kdsOrders } = useStore();
  const [timeOffset, setTimeOffset] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  const [stationFilter, setStationFilter] = useState<StationFilter>('all');
  const [viewMode, setViewMode] = useState<'order' | 'station'>('order');
  const [localItemStatuses, setLocalItemStatuses] = useState<Map<string, ItemStatus>>(() => new Map());
  const [priorityOverrides, setPriorityOverrides] = useState<Map<string, Priority>>(() => new Map());
  const [secondTick, setSecondTick] = useState(() => Math.floor(Date.now() / 1000));

  // Drive a gentle re-render each second so the mm:ss readout animates.
  useEffect(() => {
    const id = window.setInterval(() => setSecondTick(Math.floor(Date.now() / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const displayOrders: DisplayOrder[] = useMemo(() => {
    return kdsOrders.map((o) => {
      const elapsedDisplay = o.elapsedMinutes + timeOffset;
      const computed = computePriority(elapsedDisplay, o.avgPrepTime);
      const override = priorityOverrides.get(o.id);
      const priorityDisplay = override ?? computed;
      const itemsDisplay = o.items.map((it) => ({
        ...it,
        statusDisplay: localItemStatuses.get(it.id) ?? it.status,
      }));
      return { ...o, elapsedDisplay, priorityDisplay, itemsDisplay };
    });
  }, [kdsOrders, timeOffset, priorityOverrides, localItemStatuses]);

  const lateCount = displayOrders.filter((o) => o.priorityDisplay === 'urgente' || o.priorityDisplay === 'critico').length;

  const criticoQueue = displayOrders.filter(
    (o) => o.priorityDisplay === 'critico' && !dismissedIds.has(o.id),
  );
  const activePopupOrder: DisplayOrder | null = criticoQueue[0] ?? null;

  // ESC dismisses the popup for 30s (adds to dismissedIds for a window; we just add it).
  useEffect(() => {
    if (!activePopupOrder) return;
    const popupId = activePopupOrder.id;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDismissedIds((prev) => {
          const next = new Set(prev);
          next.add(popupId);
          return next;
        });
        window.setTimeout(() => {
          setDismissedIds((prev) => {
            const next = new Set(prev);
            next.delete(popupId);
            return next;
          });
        }, 30000);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activePopupOrder]);

  const filteredForOrderView = useMemo(() => {
    if (stationFilter === 'all') return displayOrders;
    return displayOrders.filter((o) => o.itemsDisplay.some((it) => it.station === stationFilter));
  }, [displayOrders, stationFilter]);

  // Count items currently in 'preparazione' per station (with local overrides applied).
  const stationPrepCounts = useMemo(() => {
    const counts: Record<KDSStation, number> = { freddo: 0, caldo: 0, pasta: 0, grill: 0, pasticceria: 0 };
    for (const o of displayOrders) {
      for (const it of o.itemsDisplay) {
        if (it.statusDisplay === 'preparazione') counts[it.station] += 1;
      }
    }
    return counts;
  }, [displayOrders]);

  function cycleItem(id: string, current: ItemStatus) {
    setLocalItemStatuses((prev) => {
      const next = new Map(prev);
      next.set(id, cycleStatus(current));
      return next;
    });
  }

  function markOrderReady(orderId: string) {
    const order = displayOrders.find((o) => o.id === orderId);
    if (!order) return;
    setLocalItemStatuses((prev) => {
      const next = new Map(prev);
      for (const it of order.itemsDisplay) next.set(it.id, 'pronto');
      return next;
    });
  }

  function takeOver(orderId: string) {
    const order = displayOrders.find((o) => o.id === orderId);
    if (!order) return;
    setLocalItemStatuses((prev) => {
      const next = new Map(prev);
      for (const it of order.itemsDisplay) {
        if (it.statusDisplay === 'attesa') next.set(it.id, 'preparazione');
      }
      return next;
    });
    setDismissedIds((prev) => {
      const n = new Set(prev);
      n.add(orderId);
      return n;
    });
  }

  function declassa(orderId: string) {
    setPriorityOverrides((prev) => {
      const next = new Map(prev);
      next.set(orderId, 'urgente');
      return next;
    });
    setDismissedIds((prev) => {
      const n = new Set(prev);
      n.add(orderId);
      return n;
    });
  }

  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: 'KDS Cucina' }]} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader
            title="Kitchen Display System"
            subtitle="Tutte le comande attive, in tempo reale. Le preparazioni in ritardo bloccano l'interfaccia finche' lo chef non le prende in carico."
          />
        </motion.div>

        {/* Service control bar */}
        <motion.div variants={itemVariants} className="sticky top-0 z-30 -mx-6 px-6 pb-4 pt-2 backdrop-blur bg-gray-50/80 border-b border-gray-200 mb-8">
          <Card className="bg-white" padding="md">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Servizio</span>
                <span className="font-mono text-3xl font-bold text-gray-900 tracking-tight">20:42</span>
              </div>

              <div className="flex items-center gap-5 border-l border-gray-200 pl-5">
                <Counter label="Comande attive" value={kdsOrders.length} tone="neutral" />
                <Counter label="In ritardo" value={lateCount} tone={lateCount > 0 ? 'danger' : 'neutral'} />
                <Counter label="Completate oggi" value={46} tone="success" />
              </div>

              <div className="flex flex-wrap items-center gap-2 border-l border-gray-200 pl-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mr-1">Stazione</span>
                {(['all', ...STATIONS_ORDER] as StationFilter[]).map((s) => {
                  const active = stationFilter === s;
                  const label = s === 'all' ? 'Tutte' : STATION_META[s].label;
                  return (
                    <button
                      key={s}
                      onClick={() => setStationFilter(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                        active
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 border border-gray-200 rounded-full p-1 ml-auto">
                <button
                  onClick={() => setViewMode('order')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === 'order' ? 'bg-accent-gold text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Per comanda
                </button>
                <button
                  onClick={() => setViewMode('station')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === 'station' ? 'bg-accent-gold text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Per stazione
                </button>
              </div>

              <Button variant="secondary" size="sm" onClick={() => setTimeOffset((t) => t + 1)}>
                <span className="inline-flex items-center gap-2">
                  <FastForward className="w-3.5 h-3.5" />
                  Avanza tempo +1 min
                </span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {viewMode === 'order' ? (
          <Section
            title="Comande in corso"
            subtitle="Ordinate dal piu' urgente. Clicca una pietanza per avanzare lo stato (attesa → preparazione → pronto)."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredForOrderView.length === 0 && (
                <Card padding="lg" className="col-span-full text-center text-gray-500">
                  Nessuna comanda per la stazione selezionata.
                </Card>
              )}
              {filteredForOrderView.map((order, i) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={i}
                  tick={secondTick}
                  onCycleItem={cycleItem}
                  onMarkReady={markOrderReady}
                  onDeclassa={declassa}
                />
              ))}
            </div>
          </Section>
        ) : (
          <Section
            title="Vista per stazione"
            subtitle="Ogni colonna raccoglie le pietanze che la relativa postazione deve preparare, ordinate per urgenza."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {STATIONS_ORDER.map((station) => {
                const meta = STATION_META[station];
                const itemsForStation = displayOrders
                  .flatMap((o) => o.itemsDisplay.map((it) => ({ it, parent: o })))
                  .filter((x) => x.it.station === station)
                  .sort((a, b) => b.parent.elapsedDisplay - a.parent.elapsedDisplay);
                return (
                  <motion.div key={station} variants={itemVariants}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                        <h3 className="text-sm font-semibold text-gray-900">{meta.label}</h3>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-gray-400">
                        {itemsForStation.length} pz
                      </span>
                    </div>
                    <div className="space-y-3">
                      {itemsForStation.length === 0 && (
                        <Card padding="sm" className="text-center text-xs text-gray-400">
                          Stazione libera
                        </Card>
                      )}
                      {itemsForStation.map(({ it, parent }) => (
                        <Card key={it.id} padding="none" className="overflow-hidden">
                          <div className={`h-1.5 ${meta.dot}`} />
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-sm font-semibold text-gray-900">{parent.orderNumber}</span>
                              <span className="text-[10px] uppercase tracking-widest text-gray-400">
                                {parent.tableNumber}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 leading-snug">
                              <span className="font-semibold">{it.quantity}×</span> {it.name}
                            </p>
                            {it.notes && <p className="text-xs text-gray-500 italic mt-1">{it.notes}</p>}
                            <div className="mt-2">
                              <StatusPill status={it.statusDisplay} onClick={() => cycleItem(it.id, it.statusDisplay)} />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Section>
        )}

        <Section title="Stazioni — stato corrente" subtitle="Carico di lavoro per ogni postazione della brigata.">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {STATIONS_ORDER.map((station) => {
              const meta = STATION_META[station];
              const count = stationPrepCounts[station];
              const bg = count >= 6 ? 'bg-danger/15 border-danger/30' : count >= 3 ? 'bg-warning/15 border-warning/30' : 'bg-gray-50 border-gray-200';
              const Icon = meta.icon;
              return (
                <motion.div key={station} variants={itemVariants}>
                  <Card className={`${bg}`} padding="md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-white/70 border border-white flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Stazione</p>
                        <h4 className="text-sm font-semibold text-gray-900">{meta.label}</h4>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                        <p className="text-[11px] text-gray-500">in preparazione</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Tempo medio</p>
                        <p className="text-sm font-semibold text-gray-800">{meta.avgWait}m</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Section>

        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-8 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {activePopupOrder && (
          <UrgentPopup
            key={activePopupOrder.id}
            order={activePopupOrder}
            onTakeOver={() => takeOver(activePopupOrder.id)}
            onDeclassa={() => declassa(activePopupOrder.id)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface CounterProps {
  label: string;
  value: number;
  tone: 'neutral' | 'danger' | 'success';
}
function Counter({ label, value, tone }: CounterProps) {
  const color = tone === 'danger' ? 'text-danger' : tone === 'success' ? 'text-success' : 'text-gray-900';
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

interface StatusPillProps {
  status: ItemStatus;
  onClick?: () => void;
}
function StatusPill({ status, onClick }: StatusPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${statusPillClasses(status)}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'pronto' ? 'bg-success' : status === 'preparazione' ? 'bg-warning' : 'bg-gray-400'
        }`}
      />
      {statusLabel(status)}
    </button>
  );
}

interface OrderCardProps {
  order: DisplayOrder;
  index: number;
  tick: number;
  onCycleItem: (itemId: string, current: ItemStatus) => void;
  onMarkReady: (orderId: string) => void;
  onDeclassa: (orderId: string) => void;
}

function OrderCard({ order, index, tick, onCycleItem, onMarkReady, onDeclassa }: OrderCardProps) {
  const p = order.priorityDisplay;
  const timer = formatTimer(order.elapsedDisplay, tick);
  const pulsing = p === 'urgente' || p === 'critico';
  const allReady = order.itemsDisplay.every((it) => it.statusDisplay === 'pronto');
  const showServi = order.status === 'completato' || allReady;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
    >
      <Card padding="none" className={`overflow-hidden ${priorityBorderClasses(p)}`}>
        <div className={`px-5 py-3 flex items-center justify-between ${priorityHeaderClasses(p)}`}>
          <span className="font-mono text-2xl font-bold tracking-tight">{order.orderNumber}</span>
          <span className="text-sm font-semibold tracking-widest opacity-90">{order.tableNumber}</span>
        </div>

        <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>{order.covers} coperti</span>
            <span className="text-gray-300">·</span>
            <span>Cameriere {order.waiter}</span>
          </div>
          <Badge variant={priorityBadgeVariant(p)} size="sm">
            {p === 'critico' ? 'Critico' : p === 'urgente' ? 'Urgente' : 'Normale'}
          </Badge>
        </div>

        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Tempo trascorso</p>
          <motion.p
            className={`font-mono text-3xl font-bold ${p === 'critico' ? 'text-danger' : p === 'urgente' ? 'text-warning' : 'text-gray-900'}`}
            animate={pulsing ? { scale: [1, 1.05, 1] } : undefined}
            transition={pulsing ? { duration: 1.4, repeat: Infinity } : undefined}
          >
            {timer}
          </motion.p>
          <p className="text-[11px] text-gray-500 mt-1">
            Media attesa: {order.avgPrepTime} min
          </p>
        </div>

        <div className="px-5 py-3 space-y-2">
          {order.itemsDisplay.map((it) => {
            const meta = STATION_META[it.station];
            return (
              <div key={it.id} className="flex items-start gap-3">
                <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-800 leading-snug">
                      <span className="font-semibold">{it.quantity}×</span> {it.name}
                    </p>
                    <span className={`shrink-0 text-[10px] uppercase tracking-widest font-medium border rounded-full px-2 py-0.5 ${meta.ring} bg-white`}>
                      {meta.label}
                    </span>
                  </div>
                  {it.notes && <p className="text-xs text-gray-500 italic mt-0.5">{it.notes}</p>}
                  <div className="mt-1.5">
                    <StatusPill status={it.statusDisplay} onClick={() => onCycleItem(it.id, it.statusDisplay)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2 bg-gray-50/70">
          {showServi ? (
            <Button variant="primary" size="sm">
              Servi
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => onMarkReady(order.id)}>
              Segna pronto
            </Button>
          )}

          {(p === 'urgente' || p === 'critico') && (
            <button
              onClick={() => onDeclassa(order.id)}
              title="Declassa urgenza"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Declassa
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

interface UrgentPopupProps {
  order: DisplayOrder;
  onTakeOver: () => void;
  onDeclassa: () => void;
}

function UrgentPopup({ order, onTakeOver, onDeclassa }: UrgentPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-danger/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        <motion.div
          animate={{
            scale: [1, 1.01, 1],
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0.6)',
              '0 0 0 22px rgba(239, 68, 68, 0)',
              '0 0 0 0 rgba(239, 68, 68, 0)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="rounded-3xl"
        >
          <div className="bg-white border-4 border-danger rounded-3xl max-w-lg p-8 shadow-2xl">
            <div className="flex items-start gap-4 mb-5">
              <motion.div
                animate={{ rotate: [0, -6, 6, -6, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.8 }}
                className="shrink-0 w-14 h-14 rounded-2xl bg-danger/10 border-2 border-danger/40 flex items-center justify-center"
              >
                <AlertTriangle className="w-8 h-8 text-danger" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.25em] text-danger font-bold">Allerta ritardo</p>
                <h2 className="text-xl font-bold text-gray-900 leading-tight mt-1">
                  URGENTE · COMANDA {order.orderNumber} OLTRE {order.elapsedDisplay} MINUTI
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span className="font-semibold text-gray-900">Tavolo {order.tableNumber}</span>
              <span className="text-gray-300">·</span>
              <span>{order.covers} coperti</span>
              <span className="text-gray-300">·</span>
              <span>Cameriere {order.waiter}</span>
            </div>

            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 mb-5 space-y-2">
              {order.itemsDisplay.map((it) => {
                const meta = STATION_META[it.station];
                return (
                  <div key={it.id} className="flex items-center gap-3 text-sm">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
                    <span className="text-gray-800">
                      <span className="font-semibold">{it.quantity}×</span> {it.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
              <Volume2 className="w-4 h-4 text-danger" />
              <span>Segnalazione sonora attiva</span>
            </div>

            <div className="space-y-3">
              <Button variant="primary" size="lg" onClick={onTakeOver} className="w-full">
                PRESA IN CARICO
              </Button>
              <Button variant="secondary" size="md" onClick={onDeclassa} className="w-full">
                DECLASSA URGENZA
              </Button>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-gray-400 text-center mt-4">
              Premi ESC per ignorare per 30s
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
