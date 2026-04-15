import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { airports, flights, luggageData, getAirportById, calculateDeliveryTime } from '../data/mockData';
import { Route, RefreshCw, AlertTriangle, CheckCircle2, MapPin, Clock, Plane } from 'lucide-react';

export function RoutePlanning() {
  const [selectedLuggage, setSelectedLuggage] = useState<string>('');
  const [routes, setRoutes] = useState<any[]>([]);

  const findRoute = (originId: string, destinationId: string) => {
    const origin = getAirportById(originId);
    const destination = getAirportById(destinationId);
    
    if (!origin || !destination) return [];

    // Simple routing: direct if available, otherwise through major hub
    const directFlight = flights.find(f => f.originId === originId && f.destinationId === destinationId);
    
    if (directFlight) {
      return [originId, destinationId];
    }

    // Find route through hub
    const majorHubs = ['lhr', 'jfk', 'sin', 'cdg', 'dxb']; // Major hubs
    
    for (const hub of majorHubs) {
      const toHub = flights.find(f => f.originId === originId && f.destinationId === hub);
      const fromHub = flights.find(f => f.originId === hub && f.destinationId === destinationId);
      
      if (toHub && fromHub) {
        return [originId, hub, destinationId];
      }
    }

    // If still no route, return direct anyway (will show as needing flight)
    return [originId, destinationId];
  };

  const handlePlanRoute = () => {
    if (!selectedLuggage) {
      toast.error('Seleccione un envío para planificar la ruta');
      return;
    }

    const luggage = luggageData.find(l => l.id === selectedLuggage);
    if (!luggage) return;

    const route = findRoute(luggage.originId, luggage.destinationId);
    const origin = getAirportById(luggage.originId);
    const destination = getAirportById(luggage.destinationId);
    
    if (!origin || !destination) return;

    const deliveryTime = calculateDeliveryTime(origin, destination);
    const isDirect = route.length === 2;
    
    const routePlan = {
      luggageId: luggage.id,
      origin: origin.city,
      destination: destination.city,
      route: route.map(id => getAirportById(id)?.code || id),
      stops: route.length - 1,
      isDirect,
      deliveryTime,
      estimatedArrival: new Date(Date.now() + deliveryTime * 24 * 60 * 60 * 1000).toISOString(),
      segments: route.slice(0, -1).map((id, index) => {
        const from = getAirportById(id);
        const to = getAirportById(route[index + 1]);
        const flight = flights.find(f => f.originId === id && f.destinationId === route[index + 1]);
        
        return {
          from: from?.code,
          to: to?.code,
          flight: flight?.id || 'N/A',
          capacity: flight?.capacity || 0,
          available: flight ? flight.capacity - flight.currentLoad : 0,
          departure: flight?.nextDeparture || 'Programar',
        };
      }),
    };

    setRoutes([routePlan, ...routes]);
    toast.success('Ruta planificada exitosamente', {
      description: `${route.length - 1} ${route.length === 2 ? 'vuelo' : 'vuelos'} programados`,
    });
  };

  const handleReplanRoute = (index: number) => {
    toast.info('Replanificando ruta...', {
      description: 'Buscando rutas alternativas',
    });
    
    // Simulate replanning
    setTimeout(() => {
      toast.success('Ruta alternativa encontrada');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl">Planificación de Rutas</h2>
        <p className="text-gray-600 mt-1">Planifique y optimice las rutas de envío de maletas</p>
      </div>

      {/* Planning Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            Planificador de Rutas
          </CardTitle>
          <CardDescription>Seleccione un envío para calcular la ruta óptima</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select value={selectedLuggage} onValueChange={setSelectedLuggage}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un envío" />
                </SelectTrigger>
                <SelectContent>
                  {luggageData.map(luggage => {
                    const origin = getAirportById(luggage.originId);
                    const destination = getAirportById(luggage.destinationId);
                    return (
                      <SelectItem key={luggage.id} value={luggage.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{luggage.id}</span>
                          <span>•</span>
                          <span>{origin?.code} → {destination?.code}</span>
                          <Badge variant="outline">{luggage.quantity} maletas</Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handlePlanRoute} size="lg">
              <Route className="w-4 h-4 mr-2" />
              Planificar Ruta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Route Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Rutas Planificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{routes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Rutas Directas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">
              {routes.filter(r => r.isDirect).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Con Escalas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">
              {routes.filter(r => !r.isDirect).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tiempo Prom. Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {routes.length > 0 
                ? (routes.reduce((sum, r) => sum + r.deliveryTime, 0) / routes.length).toFixed(1)
                : '0'
              } días
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Planned Routes */}
      {routes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rutas Planificadas</CardTitle>
            <CardDescription>Rutas calculadas y segmentos de vuelo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {routes.map((route, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  {/* Route Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">{route.luggageId}</Badge>
                        {route.isDirect ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Ruta Directa
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <MapPin className="w-3 h-3 mr-1" />
                            {route.stops} {route.stops === 1 ? 'escala' : 'escalas'}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {route.deliveryTime} {route.deliveryTime === 1 ? 'día' : 'días'}
                        </Badge>
                      </div>
                      <p className="font-semibold text-lg">
                        {route.origin} → {route.destination}
                      </p>
                      <p className="text-sm text-gray-600">
                        Ruta: {route.route.join(' → ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Llegada estimada: {new Date(route.estimatedArrival).toLocaleString('es')}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReplanRoute(index)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Replanificar
                    </Button>
                  </div>

                  {/* Flight Segments */}
                  <div className="border rounded overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vuelo</TableHead>
                          <TableHead>Origen</TableHead>
                          <TableHead>Destino</TableHead>
                          <TableHead>Capacidad</TableHead>
                          <TableHead>Disponible</TableHead>
                          <TableHead>Salida</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {route.segments.map((segment: any, segIndex: number) => {
                          const utilizationPercent = segment.capacity > 0 
                            ? ((segment.capacity - segment.available) / segment.capacity * 100)
                            : 0;
                          const hasCapacity = segment.available > 0;

                          return (
                            <TableRow key={segIndex}>
                              <TableCell className="font-mono text-sm">{segment.flight}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{segment.from}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{segment.to}</Badge>
                              </TableCell>
                              <TableCell>{segment.capacity}</TableCell>
                              <TableCell>
                                <span className={hasCapacity ? 'text-green-600' : 'text-red-600'}>
                                  {segment.available}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm">
                                {segment.departure !== 'Programar' 
                                  ? new Date(segment.departure).toLocaleString('es', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })
                                  : segment.departure
                                }
                              </TableCell>
                              <TableCell>
                                {hasCapacity ? (
                                  <Badge variant="default" className="bg-green-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Confirmado
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Lleno
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Warnings */}
                  {route.segments.some((s: any) => s.available === 0) && (
                    <div className="flex items-start gap-2 text-red-700 bg-red-50 p-3 rounded">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        Uno o más vuelos están llenos. Se recomienda replanificar la ruta o programar vuelo adicional.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flight Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Disponibilidad de Vuelos
          </CardTitle>
          <CardDescription>Capacidad actual de todos los vuelos activos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vuelo</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Ocupación</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Próxima Salida</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flights.slice(0, 10).map(flight => {
                const origin = getAirportById(flight.originId);
                const destination = getAirportById(flight.destinationId);
                const utilizationPercent = (flight.currentLoad / flight.capacity) * 100;
                const isIntercontinental = origin?.continent !== destination?.continent;

                return (
                  <TableRow key={flight.id}>
                    <TableCell className="font-mono">{flight.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{origin?.code}</Badge>
                        <span>→</span>
                        <Badge variant="outline">{destination?.code}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isIntercontinental ? "default" : "secondary"}>
                        {isIntercontinental ? 'Intercontinental' : 'Continental'}
                      </Badge>
                    </TableCell>
                    <TableCell>{flight.capacity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              utilizationPercent > 90 ? 'bg-red-500' :
                              utilizationPercent > 70 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${utilizationPercent}%` }}
                          />
                        </div>
                        <span className="text-sm">{utilizationPercent.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={
                        flight.capacity - flight.currentLoad > 50 ? 'text-green-600' :
                        flight.capacity - flight.currentLoad > 0 ? 'text-yellow-600' :
                        'text-red-600'
                      }>
                        {flight.capacity - flight.currentLoad}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(flight.nextDeparture).toLocaleString('es', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
