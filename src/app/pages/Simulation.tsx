import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { PlayCircle, StopCircle, Pause, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { runPeriodSimulation, getAverageDeliveryTimeDays, getLatestFlightUtilization, getLatestStorageUtilization } from '../simulation/simulationEngine';
import type { SimulationPeriod } from '../simulation/simulationTypes';

type SimulationType = 'realtime' | 'period' | 'collapse';
type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed';

type SimulationChartData = {
  day: number;
  date: string;
  delivered: number;
  delayed: number;
  inTransit: number;
  waiting: number;
  storageUsed: number;
  storageCapacity: number;
  flightUsed: number;
  flightCapacity: number;
};

export function Simulation() {
  const [simulationType, setSimulationType] = useState<SimulationType>('period');
  const [periodDays, setPeriodDays] = useState<string>('5');
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState('2026-04-01');
  const [simulationData, setSimulationData] = useState<SimulationChartData[]>([]);
  const [metrics, setMetrics] = useState({
    totalLuggage: 0,
    delivered: 0,
    delayed: 0,
    averageDeliveryTime: 0,
    storageUtilization: 0,
    flightUtilization: 0,
  });

  const handleStartSimulation = () => {
    if (simulationType !== 'period') {
      toast.error('Por ahora solo implementaremos correctamente la simulación de período');
      return;
    }

    setStatus('running');
    setProgress(20);
    setSimulationData([]);

    toast.info('Iniciando simulación de período...', {
      description: `${periodDays} días desde ${startDate}`,
    });

    try {
      const result = runPeriodSimulation({
        startDate: new Date(startDate).toISOString(),
        periodDays: Number(periodDays) as SimulationPeriod,
      });

      setProgress(70);

      const chartData: SimulationChartData[] = result.snapshots.map((snapshot) => {
        const storageUsed = Object.values(snapshot.airportStorage).reduce((sum, value) => sum + value, 0);
        const storageCapacity = 10500; // suma fija de capacidades mock
        const flightUsed = Object.values(snapshot.flightUsage).reduce((sum, value) => sum + value, 0);
        const flightCapacity = 6100; // suma fija aproximada de capacidades mock

        return {
          day: snapshot.day,
          date: snapshot.date,
          delivered: snapshot.delivered,
          delayed: snapshot.delayed,
          inTransit: snapshot.inTransit,
          waiting: snapshot.waiting,
          storageUsed,
          storageCapacity,
          flightUsed,
          flightCapacity,
        };
      });

      setSimulationData(chartData);

      const totalProcessed =
        result.totalDelivered +
        result.totalDelayed +
        result.totalInTransit +
        result.totalWaiting;

      setMetrics({
        totalLuggage: totalProcessed,
        delivered: result.totalDelivered,
        delayed: result.totalDelayed,
        averageDeliveryTime: getAverageDeliveryTimeDays(result),
        storageUtilization: getLatestStorageUtilization(result),
        flightUtilization: getLatestFlightUtilization(result),
      });

      setProgress(100);
      setStatus('completed');

      toast.success('Simulación completada', {
        description: 'Resultados generados correctamente',
      });
    } catch (error) {
      console.error(error);
      setStatus('idle');
      setProgress(0);
      toast.error('Ocurrió un error al ejecutar la simulación');
    }
  };

  const handlePauseSimulation = () => {
    setStatus('paused');
    toast.info('Simulación pausada');
  };

  const handleResumeSimulation = () => {
    setStatus('running');
    toast.info('Simulación reanudada');
  };

  const handleStopSimulation = () => {
    setStatus('idle');
    setProgress(0);
    setSimulationData([]);
    setMetrics({
      totalLuggage: 0,
      delivered: 0,
      delayed: 0,
      averageDeliveryTime: 0,
      storageUtilization: 0,
      flightUtilization: 0,
    });
    toast.info('Simulación detenida');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl">Simulación de Operaciones</h2>
        <p className="text-gray-600 mt-1">Configure y ejecute simulaciones para análisis de escenarios</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            Configuración de Simulación
          </CardTitle>
          <CardDescription>Seleccione el tipo de simulación y parámetros</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Tipo de Simulación</Label>
              <Select
                value={simulationType}
                onValueChange={(value: SimulationType) => setSimulationType(value)}
                disabled={status === 'running'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Operaciones en Tiempo Real</SelectItem>
                  <SelectItem value="period">Simulación de Período</SelectItem>
                  <SelectItem value="collapse">Simulación hasta Colapso</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                {simulationType === 'realtime' && (
                  <p>Este escenario todavía no está conectado a la lógica real.</p>
                )}
                {simulationType === 'period' && (
                  <p>Este escenario sí usará vuelos, maletas y aeropuertos del mock para simular 3, 5 o 7 días.</p>
                )}
                {simulationType === 'collapse' && (
                  <p>Este escenario todavía no está conectado a la lógica real.</p>
                )}
              </div>
            </div>

            {simulationType === 'period' && (
              <div className="space-y-3">
                <Label>Duración del Período (días)</Label>
                <Select
                  value={periodDays}
                  onValueChange={setPeriodDays}
                  disabled={status === 'running'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 días</SelectItem>
                    <SelectItem value="5">5 días</SelectItem>
                    <SelectItem value="7">7 días</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <Label>Fecha de inicio</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={status === 'running'}
                  />
                </div>

                <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded">
                  <p className="font-semibold mb-1">Escenario implementado:</p>
                  <p>Simulación de período usando datos de maletas, vuelos y aeropuertos del proyecto.</p>
                </div>
              </div>
            )}

            {simulationType === 'collapse' && (
              <div className="space-y-3">
                <Label>Parámetros de Colapso</Label>
                <div className="space-y-2">
                  <Input type="number" defaultValue="15" disabled />
                  <Input type="number" defaultValue="1" disabled />
                </div>
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Esta parte aún no está implementada con lógica real.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {status === 'idle' && (
              <Button onClick={handleStartSimulation} size="lg">
                <PlayCircle className="w-4 h-4 mr-2" />
                Iniciar Simulación
              </Button>
            )}

            {status === 'running' && (
              <>
                <Button onClick={handlePauseSimulation} variant="outline" size="lg">
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </Button>
                <Button onClick={handleStopSimulation} variant="destructive" size="lg">
                  <StopCircle className="w-4 h-4 mr-2" />
                  Detener
                </Button>
              </>
            )}

            {status === 'paused' && (
              <>
                <Button onClick={handleResumeSimulation} size="lg">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Continuar
                </Button>
                <Button onClick={handleStopSimulation} variant="destructive" size="lg">
                  <StopCircle className="w-4 h-4 mr-2" />
                  Detener
                </Button>
              </>
            )}

            {status === 'completed' && (
              <Button onClick={handleStartSimulation} size="lg">
                <PlayCircle className="w-4 h-4 mr-2" />
                Nueva Simulación
              </Button>
            )}
          </div>

          {status !== 'idle' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Progreso de la simulación
                  {status === 'paused' && <Badge variant="secondary" className="ml-2">Pausado</Badge>}
                  {status === 'running' && <Badge className="ml-2">En ejecución</Badge>}
                  {status === 'completed' && <Badge variant="default" className="ml-2 bg-green-600">Completado</Badge>}
                </span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
      </Card>

      {(status === 'running' || status === 'paused' || status === 'completed') && (
        <>
          {status === 'completed' && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Maletas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{metrics.totalLuggage}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Entregadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-green-600">{metrics.delivered}</div>
                  <p className="text-xs text-gray-500">
                    {metrics.totalLuggage > 0 ? ((metrics.delivered / metrics.totalLuggage) * 100).toFixed(1) : 0}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Retrasadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-red-600">{metrics.delayed}</div>
                  <p className="text-xs text-gray-500">
                    {metrics.totalLuggage > 0 ? ((metrics.delayed / metrics.totalLuggage) * 100).toFixed(1) : 0}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tiempo Prom. Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{metrics.averageDeliveryTime}</div>
                  <p className="text-xs text-gray-500">días</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Uso Almacenamiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl ${metrics.storageUtilization > 90 ? 'text-red-600' : 'text-blue-600'}`}>
                    {metrics.storageUtilization}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Uso Vuelos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl ${metrics.flightUtilization > 90 ? 'text-red-600' : 'text-green-600'}`}>
                    {metrics.flightUtilization}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {simulationData.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Flujo de Maletas por Día</CardTitle>
                  <CardDescription>Procesamiento diario durante la simulación</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={simulationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" label={{ value: 'Día', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Maletas', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="delivered" stackId="1" stroke="#10b981" fill="#10b981" name="Entregadas" />
                      <Area type="monotone" dataKey="delayed" stackId="1" stroke="#ef4444" fill="#ef4444" name="Retrasadas" />
                      <Area type="monotone" dataKey="inTransit" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="En tránsito" />
                      <Area type="monotone" dataKey="waiting" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="En espera" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Utilización de Almacenamiento</CardTitle>
                    <CardDescription>Capacidad vs uso durante el período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={simulationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="storageUsed" stroke="#3b82f6" strokeWidth={2} name="Usado" />
                        <Line type="monotone" dataKey="storageCapacity" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Capacidad" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Utilización de Vuelos</CardTitle>
                    <CardDescription>Capacidad de vuelos vs uso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={simulationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="flightUsed" stroke="#8b5cf6" strokeWidth={2} name="Usado" />
                        <Line type="monotone" dataKey="flightCapacity" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Capacidad" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}