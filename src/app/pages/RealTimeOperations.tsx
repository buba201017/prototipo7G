import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { airports, flights, luggageData, getAirportById } from '../data/mockData';
import { ChevronUp, ChevronDown, Plane, Clock3, MapPin, Package, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

// ===== Helpers =====
function getMapCoordinates(lat: number, lng: number) {
    const mapW = 1024;
    const x = ((lng + 180) / 360) * mapW;
    const latRad = (lat * Math.PI) / 180;
    const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * mapW;
    return { x, y };
}

function buildArcPath(px1: number, py1: number, px2: number, py2: number) {
    const mx = (px1 + px2) / 2;
    const my = Math.min(py1, py2) - Math.abs(px2 - px1) * 0.25;
    return `M ${px1} ${py1} Q ${mx} ${my} ${px2} ${py2}`;
}

function formatDateTime(date: Date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} - ${hh}:${mi}:${ss}`;
}

// ===== Page =====
export function RealTimeOperations() {
    const [isRunning] = useState(true);
    const [operationTime, setOperationTime] = useState(new Date());
    const [selectedFlightId, setSelectedFlightId] = useState<string>('f16');
    const [isActiveFlightMinimized, setIsActiveFlightMinimized] = useState(false);
    const [isSelectedAirportMinimized, setIsSelectedAirportMinimized] = useState(false);
    const [isMomentFlightsMinimized, setIsMomentFlightsMinimized] = useState(false);
    const [isFlightLuggageMinimized, setIsFlightLuggageMinimized] = useState(false);
    const [isLegendMinimized, setIsLegendMinimized] = useState(false);
    const [showFlightPopup, setShowFlightPopup] = useState(false);
    const [transform, setTransform] = useState({ x: 0, y: -256, k: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [selectedAirportId, setSelectedAirportId] = useState<string | null>(null);

    const [liveAirportStatus, setLiveAirportStatus] = useState<Record<string, {
        currentStorage: number;
        queueCount: number;
    }>>(
        airports.reduce((acc, airport) => {
            acc[airport.id] = {
                currentStorage: airport.currentStorage ?? Math.floor(airport.storageCapacity * 0.45),
                queueCount: Math.floor((airport.currentStorage ?? 0) * 0.08),
            };
            return acc;
        }, {} as Record<string, { currentStorage: number; queueCount: number }>)
    );
    useEffect(() => {
        const timer = setInterval(() => {
            setOperationTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveAirportStatus((prev) => {
                const next: Record<string, { currentStorage: number; queueCount: number }> = {};

                for (const airport of airports) {
                    const current = prev[airport.id] ?? {
                        currentStorage: airport.currentStorage ?? Math.floor(airport.storageCapacity * 0.45),
                        queueCount: 0,
                    };

                    const deltaStorage = Math.floor(Math.random() * 21) - 10;
                    const deltaQueue = Math.floor(Math.random() * 11) - 5;

                    const newStorage = Math.max(
                        0,
                        Math.min(airport.storageCapacity, current.currentStorage + deltaStorage)
                    );

                    const newQueue = Math.max(0, current.queueCount + deltaQueue);

                    next[airport.id] = {
                        currentStorage: newStorage,
                        queueCount: newQueue,
                    };
                }

                return next;
            });
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    const activeFlight = useMemo(() => {
        return flights.find((f) => f.id === selectedFlightId) ?? flights[0];
    }, [selectedFlightId]);

    const handleZoom = (factor: number) => {
        setTransform((prev) => {
            const newK = Math.max(0.5, Math.min(prev.k * factor, 6));
            const centerX = 1024 / 2;
            const centerY = 512 / 2;

            return {
                k: newK,
                x: centerX - (centerX - prev.x) * (newK / prev.k),
                y: centerY - (centerY - prev.y) * (newK / prev.k),
            };
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setTransform((prev) => ({
                ...prev,
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            }));
        }
    };

    const handleMouseUp = () => setIsDragging(false);
    const origin = getAirportById(activeFlight.originId);
    const destination = getAirportById(activeFlight.destinationId);

    const flightLuggage = useMemo(() => {
        const exactMatches = luggageData.filter(
            (item) =>
                item.originId === activeFlight.originId &&
                item.destinationId === activeFlight.destinationId
        );

        if (exactMatches.length > 0) {
            return exactMatches;
        }

        return luggageData.filter(
            (item) =>
                item.originId === activeFlight.originId ||
                item.destinationId === activeFlight.destinationId ||
                item.currentLocationId === activeFlight.originId
        ).slice(0, 6);
    }, [activeFlight]);

    const totalBags = flightLuggage.reduce((sum, item) => sum + item.quantity, 0);
    const expandedBagCodes = flightLuggage.flatMap((item) =>
        Array.from({ length: item.quantity }, (_, index) => `${item.id}-${index + 1}`)
    );
    const realTimeFlights = flights.slice(0, 8).map((flight, index) => {
        const origin = getAirportById(flight.originId);
        const destination = getAirportById(flight.destinationId);

        const statusOptions = ['En abordaje', 'En vuelo', 'Aterrizando', 'En descarga'];
        const status = statusOptions[index % statusOptions.length];

        return {
            ...flight,
            originCode: origin?.code ?? flight.originId.toUpperCase(),
            destinationCode: destination?.code ?? flight.destinationId.toUpperCase(),
            status,
        };
    });
    const animatedRealTimeFlights = flights.slice(0, 8).map((flight, index) => {
        const origin = getAirportById(flight.originId);
        const destination = getAirportById(flight.destinationId);

        if (!origin || !destination) return null;

        const start = getMapCoordinates(origin.coordinates.lat, origin.coordinates.lng);
        const end = getMapCoordinates(destination.coordinates.lat, destination.coordinates.lng);
        const intercontinental = origin.continent !== destination.continent;

        return {
            id: flight.id,
            path: buildArcPath(start.x, start.y, end.x, end.y),
            color: intercontinental ? '#ea580c' : '#2563eb',
            duration: `${6 + (index % 5) * 2}s`,
            scale: 0.9 + (index % 3) * 0.08,
        };
    }).filter(Boolean);

    const mapTiles: { x: number; y: number; url: string }[] = [];
    for (let keyX = 0; keyX < 4; keyX++) {
        for (let keyY = 0; keyY < 4; keyY++) {
            mapTiles.push({
                x: keyX,
                y: keyY,
                url: `https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/2/${keyX}/${keyY}.png`,
            });
        }
    }

    const mapW = 1024;
    const mapH = 512;

    const { x: x1, y: y1 } = origin
        ? getMapCoordinates(origin.coordinates.lat, origin.coordinates.lng)
        : { x: 300, y: 240 };

    const { x: x2, y: y2 } = destination
        ? getMapCoordinates(destination.coordinates.lat, destination.coordinates.lng)
        : { x: 520, y: 200 };

    const arcPath = buildArcPath(x1, y1, x2, y2);

    const selectedAirport = selectedAirportId
        ? airports.find((a) => a.id === selectedAirportId)
        : null;

    const selectedAirportLive = selectedAirport
        ? liveAirportStatus[selectedAirport.id]
        : null;

    const selectedAirportUtilization =
        selectedAirport && selectedAirportLive
            ? (selectedAirportLive.currentStorage / selectedAirport.storageCapacity) * 100
            : 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-semibold text-gray-800">Operación día a día</h2>
                <p className="text-gray-600 mt-1">
                    Monitoreo operativo en tiempo real de vuelos, maletas y aeropuertos.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                {/* MAPA */}
                <Card className="overflow-hidden">
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between gap-4">
                            <CardTitle className="flex items-center gap-2">
                                <Clock3 className="w-5 h-5 text-blue-600" />
                                Hora actual de operación
                            </CardTitle>

                            <div className="flex items-center gap-3">
                                <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                                    {formatDateTime(operationTime)}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="relative h-[620px] bg-[#dcf1fb] overflow-hidden">
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
                                    {mapTiles.map((tile) => (
                                        <image
                                            key={`${tile.x}-${tile.y}`}
                                            href={tile.url}
                                            x={tile.x * 256}
                                            y={tile.y * 256}
                                            width={256.5}
                                            height={256.5}
                                        />
                                    ))}

                                    {/* Rutas base */}
                                    {flights.slice(0, 12).map((flight) => {
                                        const o = airports.find((a) => a.id === flight.originId);
                                        const d = airports.find((a) => a.id === flight.destinationId);
                                        if (!o || !d) return null;

                                        const start = getMapCoordinates(o.coordinates.lat, o.coordinates.lng);
                                        const end = getMapCoordinates(d.coordinates.lat, d.coordinates.lng);
                                        const path = buildArcPath(start.x, start.y, end.x, end.y);

                                        return (
                                            <path
                                                key={flight.id}
                                                d={path}
                                                fill="none"
                                                stroke={flight.id === activeFlight.id ? '#ea580c' : '#7c3aed'}
                                                strokeWidth={flight.id === activeFlight.id ? 3 : 1.5}
                                                strokeDasharray={flight.id === activeFlight.id ? '0' : '6 4'}
                                                opacity={flight.id === activeFlight.id ? 0.9 : 0.5}
                                            />
                                        );
                                    })}
                                    {animatedRealTimeFlights.map((flight) => {
                                        if (!flight) return null;

                                        return (
                                            <g key={`rt-flight-${flight.id}`}>
                                                <g>
                                                    <animateMotion
                                                        dur={flight.duration}
                                                        repeatCount="indefinite"
                                                        path={flight.path}
                                                        rotate="auto"
                                                    />
                                                    <g
                                                        transform={`translate(-9,-9) scale(${flight.scale})`}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedFlightId(flight.id);
                                                            setShowFlightPopup(true);
                                                        }}
                                                    >
                                                        <circle
                                                            cx="9"
                                                            cy="9"
                                                            r="8"
                                                            fill={flight.color}
                                                            stroke="white"
                                                            strokeWidth="1"
                                                            opacity="0.96"
                                                        />
                                                        <text
                                                            x="9"
                                                            y="13"
                                                            textAnchor="middle"
                                                            fontSize="10"
                                                            fill="white"
                                                        >
                                                            ✈
                                                        </text>
                                                    </g>
                                                </g>
                                            </g>
                                        );
                                    })}
                                    {/* Aeropuertos */}
                                    {airports.map((airport) => {
                                        const point = getMapCoordinates(
                                            airport.coordinates.lat,
                                            airport.coordinates.lng
                                        );

                                        const currentStorage = liveAirportStatus[airport.id]?.currentStorage ?? airport.currentStorage ?? 0;
                                        const queueCount = liveAirportStatus[airport.id]?.queueCount ?? 0;
                                        const utilizationPct = (currentStorage / airport.storageCapacity) * 100;

                                        const airportColor =
                                            utilizationPct >= 100 || queueCount >= 220
                                                ? '#991b1b'
                                                : utilizationPct >= 95 || queueCount >= 140
                                                    ? '#ef4444'
                                                    : utilizationPct >= 50 || queueCount >= 60
                                                        ? '#f59e0b'
                                                        : '#22c55e';

                                        const hasActive = utilizationPct >= 50 || queueCount > 0;
                                        const isSelected = selectedAirportId === airport.id;

                                        return (
                                            <g
                                                key={airport.id}
                                                style={{ cursor: 'pointer' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedAirportId(airport.id);
                                                }}
                                            >
                                                {hasActive && (
                                                    <circle cx={point.x} cy={point.y} r="14" fill={airportColor} opacity="0.25">
                                                        <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                                                        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                                                    </circle>
                                                )}

                                                <circle
                                                    cx={point.x}
                                                    cy={point.y}
                                                    r={isSelected ? 8 : 5}
                                                    fill={airportColor}
                                                    stroke="white"
                                                    strokeWidth="1.5"
                                                />

                                                <text
                                                    x={point.x + 8}
                                                    y={point.y + 2}
                                                    fontSize="8"
                                                    fill="#1f2937"
                                                    fontFamily="monospace"
                                                    fontWeight="bold"
                                                >
                                                    {airport.code}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Avión activo */}
                                    <g
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            setSelectedFlightId(activeFlight.id);
                                            setShowFlightPopup((prev) => !prev);
                                        }}
                                    >
                                        {showFlightPopup && (
                                            <g>
                                                <animateMotion
                                                    dur="8s"
                                                    repeatCount="indefinite"
                                                    path={arcPath}
                                                    rotate="0"
                                                />
                                                <foreignObject x="18" y="-80" width="220" height="120">
                                                    <div
                                                        style={{
                                                            background: 'rgba(255,255,255,0.96)',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '12px',
                                                            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                                                            padding: '10px',
                                                            fontSize: '11px',
                                                            lineHeight: 1.35,
                                                            color: '#1f2937',
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: 700, marginBottom: '6px', color: '#ea580c' }}>
                                                            {activeFlight.id} · {origin?.code} → {destination?.code}
                                                        </div>



                                                        <div style={{ marginBottom: '4px' }}>
                                                            Maletas: <span style={{ fontWeight: 600 }}>{totalBags}</span>
                                                        </div>

                                                        <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                                                            Códigos:
                                                        </div>

                                                        <div style={{ color: '#4b5563' }}>
                                                            {expandedBagCodes.length > 0
                                                                ? expandedBagCodes.join(', ')
                                                                : 'Sin maletas asociadas'}
                                                        </div>
                                                    </div>
                                                </foreignObject>
                                            </g>
                                        )}

                                        <g>
                                            <animateMotion
                                                dur="8s"
                                                repeatCount="indefinite"
                                                path={arcPath}
                                                rotate="auto"
                                            />
                                            <g transform="translate(-10,-10)">
                                                <circle cx="10" cy="10" r="10" fill="#ea580c" stroke="white" strokeWidth="1.5" />
                                                <text
                                                    x="10"
                                                    y="14"
                                                    textAnchor="middle"
                                                    fontSize="11"
                                                    fill="white"
                                                >
                                                    ✈
                                                </text>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </svg>
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full shadow-md w-10 h-10 bg-white"
                                    onClick={() => handleZoom(1.3)}
                                >
                                    <ZoomIn className="w-5 h-5 text-gray-700" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full shadow-md w-10 h-10 bg-white"
                                    onClick={() => handleZoom(0.77)}
                                >
                                    <ZoomOut className="w-5 h-5 text-gray-700" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full shadow-md w-10 h-10 bg-white"
                                    onClick={() => setTransform({ x: 0, y: -256, k: 1 })}
                                >
                                    <RefreshCw className="w-5 h-5 text-gray-700" />
                                </Button>
                            </div>
                            <div className="absolute bottom-4 left-4 pointer-events-auto bg-white/95 backdrop-blur-md border border-gray-200 shadow-md rounded-lg p-3 w-max">
                                <div className="flex items-center justify-between gap-3 min-w-[190px]">
                                    <div className="text-gray-800 font-semibold text-sm">Leyenda</div>

                                    <button
                                        type="button"
                                        onClick={() => setIsLegendMinimized(!isLegendMinimized)}
                                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                    >
                                        {isLegendMinimized ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronUp className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {!isLegendMinimized && (
                                    <div className="space-y-3 mt-3">
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
                                                <span>[95% - 99%]</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600 text-[11px]">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#991b1b] border border-white shadow-sm shrink-0" />
                                                <span>Cola / Saturado</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-[11px] font-semibold text-gray-700">2. Vuelos</div>

                                            <div className="flex items-center gap-2 text-gray-600 text-xs">
                                                <div className="w-6 h-0.5 bg-[#ea580c] shrink-0" />
                                                <span>Vuelo intercontinental</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600 text-xs">
                                                <div className="w-6 h-0.5 bg-[#2563eb] shrink-0" />
                                                <span>Vuelo continental</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600 text-xs">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ea580c] border border-white shadow-sm shrink-0" />
                                                <span>Avión activo</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* PANEL DERECHO */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Plane className="w-5 h-5 text-orange-600" />
                                    Vuelo activo
                                </CardTitle>

                                <button
                                    type="button"
                                    onClick={() => setIsActiveFlightMinimized(!isActiveFlightMinimized)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                >
                                    {isActiveFlightMinimized ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronUp className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </CardHeader>

                        {!isActiveFlightMinimized && (
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Vuelo:</span>
                                        <span className="font-semibold">{activeFlight.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Ruta:</span>
                                        <span className="font-semibold">
                                            {origin?.code} → {destination?.code}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Salida:</span>
                                        <span>{new Date(activeFlight.nextDeparture).toLocaleString('es-PE')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Duración:</span>
                                        <span>{activeFlight.duration} h</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Carga actual:</span>
                                        <span>{activeFlight.currentLoad} / {activeFlight.capacity}</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t">
                                    <div className="text-sm font-semibold text-gray-800 mb-2">
                                        Estado operacional
                                    </div>
                                    <Badge className="bg-orange-500 text-white hover:bg-orange-500">
                                        En vuelo
                                    </Badge>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-amber-600" />
                                    Aeropuerto seleccionado
                                </CardTitle>

                                <button
                                    type="button"
                                    onClick={() => setIsSelectedAirportMinimized(!isSelectedAirportMinimized)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                >
                                    {isSelectedAirportMinimized ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronUp className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </CardHeader>

                        {!isSelectedAirportMinimized && (
                            <CardContent>
                                {selectedAirport && selectedAirportLive ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Aeropuerto:</span>
                                                <span className="font-semibold">{selectedAirport.code}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Ciudad:</span>
                                                <span>{selectedAirport.city}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Capacidad usada:</span>
                                                <span>{selectedAirportLive.currentStorage} / {selectedAirport.storageCapacity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Cola:</span>
                                                <span>{selectedAirportLive.queueCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Utilización:</span>
                                                <span>{selectedAirportUtilization.toFixed(0)}%</span>
                                            </div>
                                        </div>

                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${selectedAirportUtilization >= 95
                                                    ? 'bg-red-600'
                                                    : selectedAirportUtilization >= 50
                                                        ? 'bg-amber-500'
                                                        : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${Math.min(selectedAirportUtilization, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        Haz click en un aeropuerto para ver su capacidad.
                                    </p>
                                )}
                            </CardContent>
                        )}
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Plane className="w-5 h-5 text-blue-600" />
                                    Vuelos del momento
                                </CardTitle>

                                <button
                                    type="button"
                                    onClick={() => setIsMomentFlightsMinimized(!isMomentFlightsMinimized)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                >
                                    {isMomentFlightsMinimized ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronUp className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </CardHeader>

                        {!isMomentFlightsMinimized && (
                            <CardContent className="p-0">
                                <div className="max-h-[260px] overflow-y-auto px-6 pb-6 space-y-2 hide-scrollbar">
                                    {realTimeFlights.map((flight) => (
                                        <button
                                            key={flight.id}
                                            onClick={() => setSelectedFlightId(flight.id)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${selectedFlightId === flight.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-mono text-sm font-semibold">{flight.id}</span>
                                                <Badge
                                                    className={
                                                        flight.status === 'En vuelo'
                                                            ? 'bg-orange-500 text-white hover:bg-orange-500'
                                                            : flight.status === 'En abordaje'
                                                                ? 'bg-blue-600 text-white hover:bg-blue-600'
                                                                : flight.status === 'Aterrizando'
                                                                    ? 'bg-green-600 text-white hover:bg-green-600'
                                                                    : 'bg-gray-500 text-white hover:bg-gray-500'
                                                    }
                                                >
                                                    {flight.status}
                                                </Badge>
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                {flight.originCode} → {flight.destinationCode}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    Maletas del vuelo
                                </CardTitle>

                                <button
                                    type="button"
                                    onClick={() => setIsFlightLuggageMinimized(!isFlightLuggageMinimized)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                >
                                    {isFlightLuggageMinimized ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronUp className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </CardHeader>

                        {!isFlightLuggageMinimized && (
                            <CardContent className="space-y-3">
                                <div className="text-sm text-gray-500">
                                    Total asociado: <span className="font-semibold text-gray-800">{totalBags} maletas</span>
                                </div>

                                {flightLuggage.length > 0 ? (
                                    <div className="max-h-[280px] overflow-y-auto space-y-2 hide-scrollbar">
                                        {flightLuggage.map((item) => {
                                            const originAirport = getAirportById(item.originId);
                                            const destinationAirport = getAirportById(item.destinationId);
                                            const currentAirport = getAirportById(item.currentLocationId);

                                            return (
                                                <div key={item.id} className="p-3 border rounded-lg bg-gray-50">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge variant="outline" className="font-mono">
                                                            {item.id}
                                                        </Badge>
                                                        <Badge>
                                                            {item.quantity} maletas
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-1 text-xs text-gray-600">
                                                        <div>
                                                            Ruta: <span className="font-medium text-gray-800">
                                                                {originAirport?.code ?? item.originId.toUpperCase()} → {destinationAirport?.code ?? item.destinationId.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            Ubicación actual: <span className="font-medium text-gray-800">
                                                                {currentAirport?.code ?? item.currentLocationId.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            Estado: <span className="font-medium text-gray-800">
                                                                {item.status}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            ETA: <span className="font-medium text-gray-800">
                                                                {new Date(item.estimatedDelivery).toLocaleString('es-PE')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        No hay maletas asociadas directamente a esta ruta en los datos mock.
                                    </p>
                                )}
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>

        </div>
    );
}