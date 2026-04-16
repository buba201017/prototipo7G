import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { airports, luggageData, getAirportById, getAirlineById, flights } from '../data/mockData';
import { MapPin, Package, Plane, RefreshCw, ZoomIn, ZoomOut, PlayCircle, Settings2, Database, ChevronUp, ChevronDown } from 'lucide-react';
import { runPeriodSimulation } from '../simulation/simulationEngine';
import type { SimulationPeriod } from '../simulation/simulationTypes';

// Pre-generate the 16 tiles for zoom level 2 Web Mercator grid to achieve HD rendering
const mapTiles: { x: number; y: number; url: string }[] = [];
for (let keyX = 0; keyX < 4; keyX++) {
  for (let keyY = 0; keyY < 4; keyY++) {
    mapTiles.push({ x: keyX, y: keyY, url: `https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/2/${keyX}/${keyY}.png` });
  }
}

/** 
 * Maps Lat/Lng exactly to our 1024x1024 pixel Web Mercator base map projection.
 */
function getMapCoordinates(lat: number, lng: number) {
  const mapW = 1024;
  const x = ((lng + 180) / 360) * mapW;
  const latRad = (lat * Math.PI) / 180;
  const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * mapW;
  return { x, y };
}

/** Cubic bezier arc between two pixel coordinates */
function buildArcPath(px1: number, py1: number, px2: number, py2: number) {
  const mx = (px1 + px2) / 2;
  const my = Math.min(py1, py2) - Math.abs(px2 - px1) * 0.25;
  return `M ${px1} ${py1} Q ${mx} ${my} ${px2} ${py2}`;
}

function buildSimulationTimeline(startDate: string, days: number) {
  const start = new Date(`${startDate}T00:00:00`);
  const timeline: string[] = [];

  for (let hour = 0; hour <= days * 24; hour += 6) {
    const point = new Date(start);
    point.setHours(point.getHours() + hour);
    timeline.push(point.toISOString());
  }

  return timeline;
}

function formatBadgeDateTime(value: string) {
  const date = new Date(value);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${dd}/${mm}/${yyyy} - ${hh}:${mi}:${ss}`;
}
export function MapMonitoring() {
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [selectedLuggage, setSelectedLuggage] = useState<string | null>(null);

  // Sidebar navigation state
  const [activePanel, setActivePanel] = useState<'simulacion' | 'maletas' | 'aeropuertos' | 'configuracion' | 'capacidad_aeropuertos' | 'detalle_vuelo' | null>('simulacion');

  // Airport capacities state (between 500 and 800)
  const [airportCapacities, setAirportCapacities] = useState<Record<string, number>>(
    airports.reduce((acc, airport) => {
      // Create a deterministic capacity between 500 and 800
      const defaultCap = 500 + ((airport.city.length * 17) % 300);
      acc[airport.id] = defaultCap;
      return acc;
    }, {} as Record<string, number>)
  );

  // Simulation Configuration state
  const [demanda, setDemanda] = useState(100);
  const [vuelos, setVuelos] = useState(100);
  const [capacidad, setCapacidad] = useState(100);
  const [espera, setEspera] = useState(2);

  // Simulation Results
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    status: string;
    time: string;
    delivered: number;
    delayed: number;
    waiting: number;
    inTransit: number;
  } | null>(null);
  const [simulationType, setSimulationType] = useState<'weekly' | 'collapse'>('weekly');
  const [simulationStartDate, setSimulationStartDate] = useState('2025-08-24');
  const [isSimulationMinimized, setIsSimulationMinimized] = useState(false);
  const [simulationPeriodDays, setSimulationPeriodDays] = useState<'3' | '5' | '7'>('7');
  const [simulationSnapshots, setSimulationSnapshots] = useState<any[]>([]);
  const [simulationTimeline, setSimulationTimeline] = useState<string[]>([]);
  const [simulationTimelineIndex, setSimulationTimelineIndex] = useState<number | null>(null);
  const [showSimulationLayers, setShowSimulationLayers] = useState(false);
  const handleStartSimulation = () => {
    setSimulationResult(null);
    setSimulationSnapshots([]);
    setSimulationTimeline([]);
    setSimulationTimelineIndex(null);
    setShowSimulationLayers(true);

    try {
      if (simulationType === 'collapse') {
        setIsSimulating(false);
        setSimulationResult({
          status: 'No implementada',
          time: 'Pendiente',
          delivered: 0,
          delayed: 0,
          waiting: 0,
          inTransit: 0,
        });
        return;
      }

      const selectedDays = Number(simulationPeriodDays) as SimulationPeriod;

      const result = runPeriodSimulation({
        startDate: new Date(simulationStartDate).toISOString(),
        periodDays: selectedDays,
      });

      const timeline = buildSimulationTimeline(simulationStartDate, Number(simulationPeriodDays));

      setSimulationSnapshots(result.snapshots);
      setSimulationTimeline(timeline);
      setSimulationTimelineIndex(0);
      setIsSimulating(true);

      setSimulationResult({
        status: 'Finalizada',
        time: `${simulationPeriodDays} días / ${Number(simulationPeriodDays) * 24} horas`,
        delivered: result.totalDelivered,
        delayed: result.totalDelayed,
        waiting: result.totalWaiting,
        inTransit: result.totalInTransit,
      });
    } catch (error) {
      console.error(error);
      setIsSimulating(false);
      setSimulationResult({
        status: 'Error',
        time: 'No calculado',
        delivered: 0,
        delayed: 0,
        waiting: 0,
        inTransit: 0,
      });
    }
  };
  useEffect(() => {
    if (!isSimulating) return;
    if (simulationTimelineIndex === null) return;
    if (simulationTimeline.length === 0) return;

    if (simulationTimelineIndex >= simulationTimeline.length - 1) {
      setIsSimulating(false);
      return;
    }

    const timer = setTimeout(() => {
      setSimulationTimelineIndex((prev) => (prev === null ? null : prev + 1));
    }, 800);

    return () => clearTimeout(timer);
  }, [isSimulating, simulationTimelineIndex, simulationTimeline.length]);
  // Custom Pan/Zoom state hooks
  const [transform, setTransform] = useState({ x: 0, y: -256, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoom = (factor: number) => {
    setTransform(prev => {
      const newK = Math.max(0.5, Math.min(prev.k * factor, 6));
      const centerX = 1024 / 2;
      const centerY = 512 / 2;
      return {
        k: newK,
        x: centerX - (centerX - prev.x) * (newK / prev.k),
        y: centerY - (centerY - prev.y) * (newK / prev.k)
      };
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
    }
  };
  const handleMouseUp = () => setIsDragging(false);

  const filteredAirports = selectedContinent === 'all'
    ? airports
    : airports.filter(a => a.continent === selectedContinent);

  const activeLuggage = luggageData.filter(l => l.status === 'in-transit' || l.status === 'registered');
  const currentSimulationDayIndex =
    simulationTimelineIndex === null
      ? null
      : Math.min(
        simulationSnapshots.length > 0 ? simulationSnapshots.length - 1 : 0,
        Math.floor(simulationTimelineIndex / 4)
      );

  const currentSimulationSnapshot =
    currentSimulationDayIndex !== null && simulationSnapshots.length > 0
      ? simulationSnapshots[currentSimulationDayIndex]
      : null;

  const displayedDateTime =
    simulationTimelineIndex !== null && simulationTimeline.length > 0
      ? formatBadgeDateTime(simulationTimeline[simulationTimelineIndex])
      : '24/08/2025 - 00:00:00';

  const simulationPeriodText =
    simulationPeriodDays === '7'
      ? 'Simulación semanal'
      : `Simulación de ${simulationPeriodDays} días`;
  // Map dimensions reference
  const mapW = 1024;
  const mapH = 512;

  // Find exact locations for featured flight
  const originJFK = airports.find(a => a.code === 'JFK');
  const destLHR = airports.find(a => a.code === 'LHR');
  const { x: jfkX, y: jfkY } = originJFK
    ? getMapCoordinates(originJFK.coordinates.lat, originJFK.coordinates.lng)
    : { x: 302, y: 385 }; // Absolute fallback px
  const { x: lhrX, y: lhrY } = destLHR
    ? getMapCoordinates(destLHR.coordinates.lat, destLHR.coordinates.lng)
    : { x: 508, y: 337 };

  // Arc path for sample intercontinental flight
  const arcPath = buildArcPath(
    jfkX, jfkY,
    lhrX, lhrY
  );

  return (
    <div className="relative w-full h-[calc(100vh-2rem)] min-h-[600px] bg-[#dcf1fb] overflow-hidden rounded-xl border border-gray-200 flex shadow-sm">
      {/* ── MAP CONTAINER ── */}
      <svg
        viewBox={`0 0 ${mapW} ${mapH}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ userSelect: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          {/* Render high-def 4x4 Web Mercator tile grid seamlessly */}
          {mapTiles.map(tile => (
            <image
              key={`${tile.x}-${tile.y}`}
              href={tile.url}
              x={tile.x * 256}
              y={tile.y * 256}
              width={256.5}
              height={256.5}
              style={{ pointerEvents: 'none' }}
            />
          ))}

          {/* ── Flight routes (thin lines) ── */}
          {showSimulationLayers && flights.slice(0, 18).map((flight) => {
            const origin = airports.find(a => a.id === flight.originId);
            const dest = airports.find(a => a.id === flight.destinationId);
            if (!origin || !dest) return null;
            if (
              selectedContinent !== 'all' &&
              origin.continent !== selectedContinent &&
              dest.continent !== selectedContinent
            ) return null;

            const { x: x1, y: y1 } = getMapCoordinates(origin.coordinates.lat, origin.coordinates.lng);
            const { x: x2, y: y2 } = getMapCoordinates(dest.coordinates.lat, dest.coordinates.lng);
            const intercontinental = origin.continent !== dest.continent;

            // Arc control point
            const mx = (x1 + x2) / 2;
            const my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.18;

            return (
              <path
                key={flight.id}
                d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                fill="none"
                stroke={intercontinental ? '#7e22ce' : '#3b82f6'}
                strokeWidth={intercontinental ? 1.5 : 1}
                strokeDasharray={intercontinental ? '6 4' : '0'}
                opacity="0.6"
              />
            );
          })}

          {showSimulationLayers && (
            <>
              {/* ── FEATURED FLIGHT: JFK → LHR (with animated plane) ── */}
              <path
                d={arcPath}
                fill="none"
                stroke="#ea580c"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.9"
                filter="url(#glow)"
              />
              <path
                d={arcPath}
                fill="none"
                stroke="#fff"
                strokeWidth="1.2"
                strokeDasharray="10 8"
                strokeLinecap="round"
                opacity="0.8"
              />

              <g>
                <animateMotion
                  dur="8s"
                  repeatCount="indefinite"
                  path={arcPath}
                  rotate="auto"
                />
                <g transform="translate(-10,-10) scale(1.1)" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setActivePanel('detalle_vuelo'); }}>
                  <circle cx="10" cy="10" r="9" fill="#ea580c" stroke="white" strokeWidth="1" opacity="0.95" />
                  <text
                    x="10" y="14"
                    textAnchor="middle"
                    fontSize="11"
                    fill="white"
                  >✈</text>
                </g>
              </g>

              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </>
          )}

          {/* ── Airport markers ── */}
          {showSimulationLayers && filteredAirports.map((airport) => {
            const { x, y } = getMapCoordinates(airport.coordinates.lat, airport.coordinates.lng);
            const currentStorage = currentSimulationSnapshot?.airportStorage?.[airport.id] ?? airport.currentStorage;
            const utilizationPct = (currentStorage / airport.storageCapacity) * 100;
            const hasActive = utilizationPct >= 50;

            const color =
              utilizationPct >= 95
                ? '#ef4444'   // rojo
                : utilizationPct >= 50
                  ? '#f59e0b' // ámbar
                  : '#22c55e'; // verde

            return (
              <g key={airport.id} style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLuggage(airport.id);
                  setActivePanel('maletas');
                }}>
                {hasActive && (
                  <circle cx={x} cy={y} r="14" fill={color} opacity="0.28">
                    <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={x} cy={y} r="5" fill={color} stroke="white" strokeWidth="1.5" />
                <rect
                  x={x + 7} y={y - 9}
                  width={airport.code.length * 5.5 + 4} height="12"
                  rx="2" fill="rgba(255,255,255,0.85)"
                  stroke="#e5e7eb" strokeWidth="1"
                />
                <text x={x + 9} y={y} fontSize="7.5" fill="#1f2937" fontFamily="monospace" fontWeight="bold">
                  {airport.code}
                </text>
              </g>
            );
          })}

          {showSimulationLayers && (
            <>
              {/* ── Origin & destination markers for featured flight ── */}
              <g>
                <circle cx={jfkX} cy={jfkY} r="8" fill="#ea580c" stroke="white" strokeWidth="2" />
                <text
                  x={jfkX} y={jfkY - 13}
                  textAnchor="middle" fontSize="9" fill="#c2410c" fontWeight="bold"
                  stroke="white" strokeWidth="2" paintOrder="stroke"
                >JFK</text>
              </g>
              <g>
                <circle cx={lhrX} cy={lhrY} r="8" fill="#ea580c" stroke="white" strokeWidth="2" />
                <text
                  x={lhrX} y={lhrY - 13}
                  textAnchor="middle" fontSize="9" fill="#c2410c" fontWeight="bold"
                  stroke="white" strokeWidth="2" paintOrder="stroke"
                >LHR</text>
              </g>
            </>
          )}
        </g>
      </svg>

      {/* ── OVERLAYS ── */}
      <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex justify-between">

        {/* Left Elements: Date & Controls */}
        <div className="flex flex-col gap-4 pointer-events-none">
          {/* Top-Left Date Badge */}
          <div className="bg-[#0275d8] text-white px-4 py-2 rounded-md shadow-md max-w-max pointer-events-auto">
            {simulationResult ? (
              <>
                <div className="text-sm font-semibold">{displayedDateTime}</div>
                <div className="text-[11px] text-blue-100">{simulationPeriodText}</div>
              </>
            ) : (
              <div className="text-sm font-semibold">{displayedDateTime}</div>
            )}
          </div>

          <div className="mt-2 flex flex-col gap-2 pointer-events-auto">
            <Button variant="outline" size="icon" className="rounded-full shadow-md w-10 h-10 bg-white" onClick={() => handleZoom(1.3)}>
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full shadow-md w-10 h-10 bg-white" onClick={() => handleZoom(0.77)}>
              <ZoomOut className="w-5 h-5 text-gray-700" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full shadow-md w-10 h-10 bg-white" onClick={() => {
              setTransform({ x: 0, y: -256, k: 1 });
            }}>
              <RefreshCw className="w-5 h-5 text-gray-700" />
            </Button>
          </div>
          {showSimulationLayers && (
            <div className="mt-auto pointer-events-auto bg-white/95 backdrop-blur-md border border-gray-200 shadow-md rounded-lg p-3 space-y-3 w-max">
              <div className="text-gray-800 font-semibold text-sm">Leyenda</div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-gray-700">1. Capacidad Aeropuerto</div>

                <div className="flex items-center gap-2 text-gray-600 text-[11px]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-white shadow-sm shrink-0" />
                  <span>&lt; 50%</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-[11px]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-white shadow-sm shrink-0" />
                  <span>[50% - 94%]</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-[11px]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] border border-white shadow-sm shrink-0" />
                  <span>[95% - 100%]</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-gray-700">2. Vuelos</div>

                <div className="flex items-center gap-2 text-gray-600 text-xs">
                  <div className="w-6 h-0.5 bg-[#ea580c] shrink-0" />
                  <span>Vuelo en curso</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Panel Content & Icon Sidebar */}
        <div className="flex gap-4 items-start max-h-full">

          {/* Active Panel Content */}
          {activePanel && (
            <div className="w-[360px] pointer-events-auto flex flex-col max-h-full overflow-y-auto hide-scrollbar">

              {activePanel === 'simulacion' && (
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md flex flex-col shrink-0">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-[#0d6efd]" />
                        Simulación
                      </CardTitle>

                      <button
                        type="button"
                        onClick={() => setIsSimulationMinimized(!isSimulationMinimized)}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        title={isSimulationMinimized ? 'Expandir panel' : 'Minimizar panel'}
                      >
                        {isSimulationMinimized ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </CardHeader>
                  {!isSimulationMinimized && (
                    <CardContent className="pt-4 space-y-5">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">Tipo de simulación</label>
                        <div className="flex flex-col gap-2.5">
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                              type="radio"
                              name="sim_type"
                              checked={simulationType === 'weekly'}
                              onChange={() => setSimulationType('weekly')}
                              disabled={isSimulating}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            Periodo
                          </label>

                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                              type="radio"
                              name="sim_type"
                              checked={simulationType === 'collapse'}
                              onChange={() => setSimulationType('collapse')}
                              disabled={isSimulating}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            Hasta el colapso
                          </label>
                        </div>
                      </div>
                      {simulationType === 'weekly' && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Duración del período</label>
                          <Select value={simulationPeriodDays} onValueChange={(value: '3' | '5' | '7') => setSimulationPeriodDays(value)} disabled={isSimulating}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 días</SelectItem>
                              <SelectItem value="5">5 días</SelectItem>
                              <SelectItem value="7">7 días (semanal)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Fecha de inicio</label>
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
                          value={simulationStartDate}
                          onChange={(e) => setSimulationStartDate(e.target.value)}
                          disabled={isSimulating}
                        />
                      </div>

                      <Button
                        className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] text-white py-2.5 text-sm font-medium transition-all"
                        onClick={handleStartSimulation}
                        disabled={isSimulating}
                      >
                        {isSimulating ? (
                          <div className="flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Ejecutando...
                          </div>
                        ) : 'Iniciar simulación'}
                      </Button>

                      {simulationResult && (
                        <div className="mt-4 pt-5 border-t border-gray-100 space-y-3.5" style={{ animation: 'fadeIn 0.5s ease' }}>
                          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Resultados
                          </h3>

                          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3.5 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Estado:</span>
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                                {simulationResult.status}
                              </Badge>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Tiempo total:</span>
                              <span className="font-medium text-gray-800">{simulationResult.time}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Paquetes entregados:</span>
                              <span className="font-semibold text-[#0d6efd]">
                                {simulationResult.delivered.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Retrasados:</span>
                              <span className="font-semibold text-red-600">
                                {simulationResult.delayed.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">En espera:</span>
                              <span className="font-semibold text-amber-600">
                                {simulationResult.waiting.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">En tránsito:</span>
                              <span className="font-semibold text-sky-600">
                                {simulationResult.inTransit.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )}

              {activePanel === 'configuracion' && (
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md flex flex-col overflow-y-auto max-h-full hide-scrollbar shrink-0">
                  <CardHeader className="pb-3 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-10 shrink-0">
                    <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                      <Settings2 className="w-5 h-5 text-[#0d6efd]" />
                      Configuración de Simulación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-7 pb-6">

                    {/* Nivel de demanda */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm font-semibold text-gray-800">
                        <label>Nivel de demanda</label>
                        <span className="text-[#0d6efd] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{demanda}%</span>
                      </div>
                      <input
                        type="range" min="10" max="300"
                        value={demanda} onChange={e => setDemanda(Number(e.target.value))}
                        className="w-full accent-[#0d6efd] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 leading-tight">
                        Multiplica la demanda histórica/esperada. Ej: 120% = 20% más envíos que lo normal. Default: 100%.
                      </p>
                    </div>

                    {/* Disponibilidad de vuelos */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm font-semibold text-gray-800">
                        <label>Disponibilidad de vuelos</label>
                        <span className="text-[#0d6efd] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{vuelos}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={vuelos} onChange={e => setVuelos(Number(e.target.value))}
                        className="w-full accent-[#0d6efd] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 leading-tight">
                        Factor global que reduce/incrementa la cantidad de vuelos disponibles. Default: 100%.
                      </p>
                    </div>

                    {/* Capacidad de aviones */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm font-semibold text-gray-800">
                        <label>Capacidad de aviones</label>
                        <span className="text-[#0d6efd] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{capacidad}%</span>
                      </div>
                      <input
                        type="range" min="10" max="150"
                        value={capacidad} onChange={e => setCapacidad(Number(e.target.value))}
                        className="w-full accent-[#0d6efd] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 leading-tight">
                        Escala la capacidad nominal por vuelo de los datos estáticos. Ej: 80% de 360 = 288. Default: 100%.
                      </p>
                    </div>

                    {/* Tiempo máximo de espera */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm font-semibold text-gray-800">
                        <label>Tiempo máx de espera</label>
                        <span className="text-[#0d6efd] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 min-w-[3.2rem] text-center">{espera} hrs</span>
                      </div>
                      <input
                        type="range" min="0.5" max="48" step="0.5"
                        value={espera} onChange={e => setEspera(Number(e.target.value))}
                        className="w-full accent-[#0d6efd] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 leading-tight">
                        Tiempo límite antes de que un paquete se cuente como retraso relevante. Default: 2 hrs (política MoraPack).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activePanel === 'detalle_vuelo' && (
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md flex flex-col overflow-y-auto max-h-full hide-scrollbar shrink-0">
                  <CardHeader className="pb-3 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-10 shrink-0">
                    <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                      <Plane className="w-5 h-5 text-[#ea580c]" />
                      Detalle de Vuelo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4 pb-6">
                    <div className="flex gap-2 justify-between items-center mb-2 px-1">
                      <span className="text-xs text-gray-500">Ruta: <span className="font-semibold text-gray-700">JFK → LHR</span></span>
                      <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">280 paquetes</span>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { id: "PK-8192-A", to: "LHR", weight: "12 kg", type: "Equipaje" },
                        { id: "PK-1102-B", to: "LHR", weight: "24 kg", type: "Equipaje" },
                        { id: "PKG-992-C", to: "CDG (Conex.)", weight: "8 kg", type: "Carga" },
                        { id: "PK-2311-A", to: "LHR", weight: "15 kg", type: "Equipaje" },
                        { id: "PKG-455-X", to: "FRA (Conex.)", weight: "32 kg", type: "Carga" },
                        { id: "PK-0012-Y", to: "LHR", weight: "10 kg", type: "Equipaje" },
                        { id: "PKG-775-Z", to: "LHR", weight: "21 kg", type: "Carga" }
                      ].map((pkg, i) => (
                        <div key={i} className="p-2.5 border border-orange-100 bg-orange-50/40 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <Badge variant="outline" className="bg-white border-orange-200 text-[#ea580c]" style={{ fontSize: '10px' }}>
                              {pkg.id}
                            </Badge>
                            <Badge style={{ fontSize: '9px', backgroundColor: '#ea580c', fontWeight: 600 }} className="border-0 text-white">En vuelo</Badge>
                          </div>
                          <div className="text-[11px] text-gray-600 flex justify-between items-center">
                            <span>Destino: <span className="font-semibold text-gray-700">{pkg.to}</span></span>
                            <span className="text-gray-500">{pkg.type} • {pkg.weight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activePanel === 'capacidad_aeropuertos' && (
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md flex flex-col overflow-y-auto max-h-full hide-scrollbar shrink-0">
                  <CardHeader className="pb-3 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-10 shrink-0">
                    <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-600" />
                      Almacenamiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4 pb-6">
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      Ajuste la capacidad máxima de maletas para cada aeropuerto (500 - 800).
                    </p>
                    <div className="space-y-5">
                      {filteredAirports.map(airport => (
                        <div key={airport.id} className="space-y-2.5 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center text-sm font-semibold text-gray-800">
                            <label className="flex flex-col">
                              <span>{airport.code}</span>
                              <span className="text-[10px] text-gray-400 font-normal">{airport.city}</span>
                            </label>
                            <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 min-w-[3.2rem] text-center">
                              {airportCapacities[airport.id]}
                            </span>
                          </div>
                          <input
                            type="range" min="500" max="800" step="10"
                            value={airportCapacities[airport.id] || 500}
                            onChange={e => setAirportCapacities({ ...airportCapacities, [airport.id]: Number(e.target.value) })}
                            className="w-full accent-purple-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activePanel === 'maletas' && (
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md flex flex-col overflow-y-auto max-h-full hide-scrollbar shrink-0">
                  <CardHeader className="pb-2 sticky top-0 bg-white/95 backdrop-blur-md z-10 shrink-0">
                    <CardTitle className="text-sm flex items-center gap-2 text-gray-800">
                      <Package className="w-4 h-4 text-[#0d6efd]" />
                      Maletas en Tránsito
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <div className="space-y-2">
                      {activeLuggage.map(luggage => {
                        const current = getAirportById(luggage.currentLocationId);
                        const destination = getAirportById(luggage.destinationId);
                        const airline = getAirlineById(luggage.airlineId);

                        return (
                          <div
                            key={luggage.id}
                            className={`p-2 border rounded-lg cursor-pointer transition-colors ${selectedLuggage === luggage.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:bg-gray-50 border-gray-100 bg-white'
                              }`}
                            onClick={() => setSelectedLuggage(luggage.id)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="font-mono bg-white" style={{ fontSize: '10px' }}>
                                {luggage.id}
                              </Badge>
                              <Badge
                                variant={luggage.status === 'in-transit' ? 'default' : 'secondary'}
                                style={{ fontSize: '10px' }}
                              >
                                {luggage.status === 'in-transit' ? 'En tránsito' : 'Registrado'}
                              </Badge>
                            </div>
                            <div className="space-y-0.5" style={{ fontSize: '11px' }}>
                              <div className="flex items-center gap-1 text-gray-600">
                                <MapPin className="w-3 h-3" />
                                <span>{current?.code} — {current?.city}</span>
                              </div>
                              <div className="text-gray-400">
                                → {destination?.code} ({destination?.city})
                              </div>
                              <div className="flex items-center justify-between text-gray-500 pt-1">
                                <span>{airline?.code}</span>
                                <span>{luggage.quantity} maletas</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activePanel === 'aeropuertos' && (
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md flex flex-col overflow-y-auto max-h-full hide-scrollbar shrink-0">
                  <CardHeader className="pb-2 flex flex-col gap-3 sticky top-0 bg-white/95 backdrop-blur-md z-10 shrink-0 border-b border-gray-100">
                    <CardTitle className="text-sm flex items-center gap-2 text-gray-800">
                      <Plane className="w-4 h-4 text-[#0d6efd]" />
                      Estado de Aeropuertos
                    </CardTitle>
                    <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                      <SelectTrigger className="w-full h-8 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">Todos los Continentes</SelectItem>
                        <SelectItem value="America" className="text-xs">América</SelectItem>
                        <SelectItem value="Europe" className="text-xs">Europa</SelectItem>
                        <SelectItem value="Asia" className="text-xs">Asia</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent className="pt-3 flex-1 pb-4">
                    <div className="space-y-2.5">
                      {filteredAirports.map(airport => {
                        const currentStorage = currentSimulationSnapshot?.airportStorage?.[airport.id] ?? airport.currentStorage;
                        const pct = (currentStorage / airport.storageCapacity) * 100;
                        const activeLuggageCount = activeLuggage.filter(
                          l => l.currentLocationId === airport.id
                        ).length;

                        return (
                          <div key={airport.id} className="p-2.5 border border-gray-100 rounded-lg bg-white">
                            <div className="flex items-center justify-between mb-1.5">
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 600 }} className="text-gray-800">{airport.code}</div>
                                <div className="text-gray-500" style={{ fontSize: '11px' }}>{airport.city}, {airport.country}</div>
                              </div>
                              <Badge variant="outline" className="bg-gray-50 text-gray-600" style={{ fontSize: '10px' }}>{airport.continent}</Badge>
                            </div>

                            <div>
                              <div className="flex justify-between text-gray-500 mb-0.5" style={{ fontSize: '11px' }}>
                                <span>Capacidad</span>
                                <span className={pct > 90 ? 'text-red-600 font-bold' : ''}>{pct.toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="text-gray-400 mt-1" style={{ fontSize: '10px' }}>
                                {currentStorage} / {airport.storageCapacity}
                              </div>
                            </div>

                            {activeLuggageCount > 0 && (
                              <div className="flex items-center gap-1 text-[#0d6efd] mt-2" style={{ fontSize: '11px', fontWeight: 500 }}>
                                <Package className="w-3.5 h-3.5" />
                                <span>{activeLuggageCount} envíos activos</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          )}

          {/* Right Sidebar Menu (Icons only) */}
          <div className="w-16 bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200 rounded-xl flex flex-col items-center py-5 gap-4 pointer-events-auto shrink-0 h-fit">

            <button
              onClick={() => setActivePanel(activePanel === 'simulacion' ? null : 'simulacion')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${activePanel === 'simulacion' ? 'bg-[#0d6efd] text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:bg-blue-50 hover:text-[#0d6efd]'}`}
              title="Panel de Simulación"
            >
              <PlayCircle className="w-5 h-5" />
            </button>

            {/* <button
              onClick={() => setActivePanel(activePanel === 'configuracion' ? null : 'configuracion')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${activePanel === 'configuracion' ? 'bg-[#0d6efd] text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:bg-blue-50 hover:text-[#0d6efd]'}`}
              title="Configuración de Simulación"
            >
              <Settings2 className="w-5 h-5" />
            </button> */}

            <div className="w-8 h-px bg-gray-200 my-1"></div>

            {/* <button
              onClick={() => setActivePanel(activePanel === 'capacidad_aeropuertos' ? null : 'capacidad_aeropuertos')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${activePanel === 'capacidad_aeropuertos' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'}`}
              title="Capacidad de Aeropuertos"
            >
              <Database className="w-5 h-5" />
            </button> */}

            <button
              onClick={() => setActivePanel(activePanel === 'maletas' ? null : 'maletas')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${activePanel === 'maletas' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'}`}
              title="Maletas en Tránsito"
            >
              <Package className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActivePanel(activePanel === 'aeropuertos' ? null : 'aeropuertos')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${activePanel === 'aeropuertos' ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
              title="Estado de Aeropuertos"
            >
              <Plane className="w-5 h-5" />
            </button>

          </div>

        </div>
      </div>

      {/* Scrollbar style fix for panels */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(200, 205, 215, 0.6);
          border-radius: 20px;
        }
        .hide-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.8);
        }
      `}</style>
    </div>
  );
}
