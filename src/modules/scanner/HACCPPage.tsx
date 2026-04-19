import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileCheck, Thermometer, AlertTriangle, RefreshCw, MapPin, Wrench, CheckCircle2 } from 'lucide-react';
import { Card, Badge, Button, CountUp } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';
import { formatDate, getExpiryStatus } from '../../utils/calculations';
import type { StorageZone, ZoneStatus } from '../../types';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } } };

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function buildSparklinePath(history: { t: string; temp: number }[], w: number, h: number): { path: string; lastX: number; lastY: number } {
  if (history.length === 0) return { path: '', lastX: 0, lastY: 0 };
  const temps = history.map((p) => p.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;
  const len = history.length;
  const points = history.map((p, i) => {
    const x = len === 1 ? w / 2 : (i / (len - 1)) * w;
    const y = h - ((p.temp - min) / range) * h;
    return { x, y };
  });
  const path = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`).join(' ');
  const last = points[points.length - 1];
  return { path, lastX: last.x, lastY: last.y };
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = d.getUTCHours().toString().padStart(2, '0');
    const mm = d.getUTCMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '--:--';
  }
}

function statusStroke(status: ZoneStatus): string {
  if (status === 'conforme') return 'var(--color-success, #22C55E)';
  if (status === 'attenzione') return 'var(--color-warning, #EAB308)';
  return 'var(--color-danger, #EF4444)';
}

function statusDotClass(status: ZoneStatus): string {
  if (status === 'conforme') return 'bg-success';
  if (status === 'attenzione') return 'bg-warning';
  return 'bg-danger';
}

function statusBorderClass(status: ZoneStatus): string {
  if (status === 'conforme') return 'border-l-4 border-l-success/50';
  if (status === 'attenzione') return 'border-l-4 border-l-warning';
  return 'border-l-4 border-l-danger';
}

function statusTextClass(status: ZoneStatus): string {
  if (status === 'conforme') return 'text-success';
  if (status === 'attenzione') return 'text-warning';
  return 'text-danger';
}

function statusActionLabel(status: ZoneStatus): string {
  if (status === 'attenzione') return 'Verificare guarnizione frigo';
  if (status === 'critica') return 'Intervento immediato richiesto';
  return 'Nessuna azione richiesta';
}

// ------------------------------------------------------------
// Sparkline mini-chart (used in each zone card)
// ------------------------------------------------------------

function Sparkline({ zone }: { zone: StorageZone }) {
  const w = 140;
  const h = 36;
  const { path, lastX, lastY } = buildSparklinePath(zone.history, w, h);
  const stroke = statusStroke(zone.status);
  return (
    <svg width={w} height={h} className="block">
      <motion.path
        d={path}
        stroke={stroke}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      />
      {path && (
        <motion.circle
          cx={lastX}
          cy={lastY}
          r={2.5}
          fill={stroke}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, duration: 0.3 }}
        />
      )}
    </svg>
  );
}

// ------------------------------------------------------------
// Detail chart (used when a zone is selected)
// ------------------------------------------------------------

function DetailChart({ zone }: { zone: StorageZone }) {
  const w = 680;
  const h = 180;
  const padLeft = 36;
  const padRight = 12;
  const padTop = 14;
  const padBottom = 22;
  const innerW = w - padLeft - padRight;
  const innerH = h - padTop - padBottom;
  const temps = zone.history.map((p) => p.temp);
  const minVal = Math.min(...temps, zone.targetTempMin);
  const maxVal = Math.max(...temps, zone.targetTempMax);
  const range = maxVal - minVal || 1;
  const mapY = (v: number) => padTop + innerH - ((v - minVal) / range) * innerH;
  const mapX = (i: number) => padLeft + (zone.history.length === 1 ? innerW / 2 : (i / (zone.history.length - 1)) * innerW);
  const pathPoints = zone.history.map((p, i) => ({ x: mapX(i), y: mapY(p.temp) }));
  const d = pathPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`).join(' ');
  const last = pathPoints[pathPoints.length - 1];

  const bandTop = mapY(zone.targetTempMax);
  const bandBottom = mapY(zone.targetTempMin);

  const gridTicks = 4;
  const yTicks: number[] = [];
  for (let i = 0; i <= gridTicks; i += 1) {
    yTicks.push(minVal + (range * i) / gridTicks);
  }

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
      <rect
        x={padLeft}
        y={Math.min(bandTop, bandBottom)}
        width={innerW}
        height={Math.abs(bandBottom - bandTop)}
        className="fill-accent-gold/10"
      />
      {yTicks.map((v, i) => (
        <g key={i}>
          <line
            x1={padLeft}
            x2={padLeft + innerW}
            y1={mapY(v)}
            y2={mapY(v)}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-gray-200"
          />
          <text x={padLeft - 6} y={mapY(v) + 3} textAnchor="end" className="fill-gray-400 text-[9px]">
            {v.toFixed(1)}
          </text>
        </g>
      ))}
      <line
        x1={last.x}
        x2={last.x}
        y1={padTop}
        y2={padTop + innerH}
        stroke="currentColor"
        strokeDasharray="3 3"
        strokeWidth={1}
        className="text-accent-gold/60"
      />
      <motion.path
        d={d}
        stroke="#C9A962"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      />
      <motion.circle
        cx={last.x}
        cy={last.y}
        r={4}
        fill="#C9A962"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, duration: 0.3 }}
      />
      <text x={padLeft} y={h - 4} className="fill-gray-400 text-[9px]">
        {formatTime(zone.history[0]?.t ?? '')}
      </text>
      <text x={padLeft + innerW} y={h - 4} textAnchor="end" className="fill-gray-400 text-[9px]">
        {formatTime(zone.history[zone.history.length - 1]?.t ?? '')}
      </text>
    </svg>
  );
}

// ------------------------------------------------------------
// Page
// ------------------------------------------------------------

export function HACCPPage() {
  const { haccp, storageZones, products } = useStore();

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [tempBumps, setTempBumps] = useState<Record<string, number>>({});

  const conforme = haccp.filter((h) => h.status === 'conforme');
  const nonConforme = haccp.filter((h) => h.status === 'non_conforme');
  const conformityRate = haccp.length > 0 ? (conforme.length / haccp.length) * 100 : 100;

  const alertZones = storageZones.filter((z) => z.status !== 'conforme');
  const selectedZone = selectedZoneId ? storageZones.find((z) => z.id === selectedZoneId) ?? null : null;

  const handleRefresh = (zoneId: string) => {
    setRefreshingId(zoneId);
    setTempBumps((prev) => ({ ...prev, [zoneId]: 0.1 }));
    window.setTimeout(() => {
      setTempBumps((prev) => {
        const next = { ...prev };
        delete next[zoneId];
        return next;
      });
      setRefreshingId((curr) => (curr === zoneId ? null : curr));
    }, 800);
  };

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

        {/* Zone di Stoccaggio */}
        <Section
          title="Zone di Stoccaggio · Temperatura in tempo reale"
          subtitle="Monitoraggio continuo delle aree di conservazione. Ogni prodotto in anagrafica e associato a una temperatura target: il sistema allerta quando la lettura esce dal range di conformita'."
        >
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {storageZones.map((zone) => {
              const bump = tempBumps[zone.id] ?? 0;
              const displayTemp = zone.currentTemp + bump;
              const isSelected = selectedZoneId === zone.id;
              return (
                <Card
                  key={zone.id}
                  padding="md"
                  className={`${statusBorderClass(zone.status)} ${isSelected ? 'ring-2 ring-accent-gold/40' : ''} flex flex-col gap-3 transition`}
                  onClick={() => setSelectedZoneId((curr) => (curr === zone.id ? null : zone.id))}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-accent-gold font-mono text-2xl font-bold tracking-tight">{zone.shortLabel}</span>
                    <motion.span
                      className={`w-2.5 h-2.5 rounded-full ${statusDotClass(zone.status)}`}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate" title={zone.name}>{zone.name}</p>
                  <div className="text-center py-1">
                    <p className={`text-3xl font-bold ${statusTextClass(zone.status)}`}>
                      <CountUp end={displayTemp} decimals={1} suffix="°C" duration={0.6} />
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-1">
                      Target {zone.targetTempMin}° / {zone.targetTempMax}°
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Sparkline zone={zone} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      {zone.productIds.length} prodotti
                    </span>
                    <span className="font-mono">{formatTime(zone.lastReading)}</span>
                  </div>
                </Card>
              );
            })}
          </motion.div>

          {/* Detail expansion panel */}
          <AnimatePresence>
            {selectedZone && (
              <motion.div
                key={selectedZone.id}
                initial={{ opacity: 0, y: 12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 12, height: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                className="mt-6 overflow-hidden"
              >
                <Card padding="lg" className={statusBorderClass(selectedZone.status)}>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center">
                        <span className="text-accent-gold font-mono text-xl font-bold">{selectedZone.shortLabel}</span>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{selectedZone.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedZone.location}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-2">
                          Ultima lettura · <span className="font-mono normal-case tracking-normal text-gray-500">{formatTime(selectedZone.lastReading)}</span>
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRefresh(selectedZone.id)}
                    >
                      <span className="inline-flex items-center gap-2">
                        <motion.span
                          animate={refreshingId === selectedZone.id ? { rotate: 360 } : { rotate: 0 }}
                          transition={refreshingId === selectedZone.id ? { duration: 0.8, ease: 'linear', repeat: Infinity } : { duration: 0 }}
                          className="inline-flex"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </motion.span>
                        Rileggi adesso
                      </span>
                    </Button>
                  </div>

                  <div className="rounded-xl bg-gray-50/60 border border-gray-100 p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Andamento 24h</p>
                      <p className="text-xs text-gray-500">
                        Range target <span className="font-mono text-gray-700">{selectedZone.targetTempMin}° / {selectedZone.targetTempMax}°</span>
                      </p>
                    </div>
                    <DetailChart zone={selectedZone} />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">Prodotti tracciati in questa zona</p>
                    {selectedZone.productIds.length === 0 ? (
                      <p className="text-sm text-gray-500 italic py-6 text-center border border-dashed border-gray-200 rounded-xl">
                        Nessun prodotto tracciato in questa zona
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 text-left bg-gray-50/60">
                              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Lotto</th>
                              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Scadenza</th>
                              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Conformita</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {products
                              .filter((p) => selectedZone.productIds.includes(p.id))
                              .map((p) => {
                                const expiry = getExpiryStatus(p.expiryDate);
                                const conforme = expiry === 'ok';
                                return (
                                  <tr key={p.id} className="hover:bg-gray-50/40">
                                    <td className="px-4 py-2 font-medium text-gray-900">{p.name}</td>
                                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{p.lot}</td>
                                    <td className="px-4 py-2 text-gray-600">{formatDate(p.expiryDate)}</td>
                                    <td className="px-4 py-2">
                                      <Badge variant={conforme ? 'success' : 'warning'} size="sm">
                                        {conforme ? 'Conforme' : 'Verifica'}
                                      </Badge>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* Alert attivi */}
        <Section title="Alert attivi" subtitle="Notifiche generate quando una zona esce dal range di conformita' previsto.">
          {alertZones.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="flex items-center gap-4 border-l-4 border-l-success/50">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Tutte le zone sono entro i parametri.</p>
                  <p className="text-sm text-gray-500">Nessuna azione richiesta.</p>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="space-y-3">
              {alertZones.map((zone) => {
                const severityIconColor = zone.status === 'critica' ? 'text-danger' : 'text-warning';
                const severityBg = zone.status === 'critica' ? 'bg-red-50' : 'bg-yellow-50';
                return (
                  <Card key={zone.id} className={statusBorderClass(zone.status)}>
                    <div className="flex flex-wrap items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${severityBg} flex items-center justify-center shrink-0`}>
                        <AlertTriangle className={`w-5 h-5 ${severityIconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">Zona {zone.name} oltre range di conformita</p>
                          <Badge variant={zone.status === 'critica' ? 'danger' : 'warning'} size="sm">
                            {zone.status === 'critica' ? 'Critica' : 'Attenzione'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Temperatura attuale <span className="font-mono">{zone.currentTemp.toFixed(1)}°C</span>
                          {' '}— range atteso <span className="font-mono">{zone.targetTempMin}° / {zone.targetTempMax}°</span>.
                          {' '}Prodotti a rischio: <span className="font-medium text-gray-900">{zone.productIds.length}</span>.
                        </p>
                        <p className={`text-sm mt-2 flex items-center gap-1.5 ${statusTextClass(zone.status)}`}>
                          <Wrench className="w-3.5 h-3.5" />
                          {statusActionLabel(zone.status)}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedZoneId(zone.id)}>
                            Dettagli zona
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => { /* no-op segnala guasto */ }}>
                            Segnala guasto
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </Section>

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
