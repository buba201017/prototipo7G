import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { PlayCircle, StopCircle, Pause, SkipForward, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

type SimulationType = 'realtime' | 'period' | 'collapse';
type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed';

export function Simulation() {
  const [simulationType, setSimulationType] = useState<SimulationType>('period');
  const [periodDays, setPeriodDays] = useState<string>('5');
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalLuggage: 0,
    delivered: 0,
    delayed: 0,
    averageDeliveryTime: 0,
    storageUtilization: 0,
    flightUtilization: 0,
  });

  const handleStartSimulation = () => {
    setStatus('running');
    setProgress(0);
    setSimulationData([]);
    
    toast.info('Iniciando simulación...', {
      description: `Tipo: ${
        simulationType === 'realtime' ? 'Tiempo Real' :
        simulationType === 'period' ? `Período (${periodDays} días)` :
        'Hasta Colapso'
      }`,
    });

    // Simulate data generation
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setStatus('completed');
          generateFinalResults();
          toast.success('Simulación completada', {
            description: 'Resultados disponibles para análisis',
          });
          return 100;
        }
        
        // Generate incremental data
        if (newProgress % 10 === 0) {
          addSimulationDataPoint(newProgress / 10);
        }
        
        return newProgress;
      });
    }, 300); // Faster simulation for demo
  };

  const addSimulationDataPoint = (day: number) => {
    const baseLoad = 150;
    const variance = Math.random() * 50;
    
    let newDataPoint;
    if (simulationType === 'collapse') {
      // Exponential growth for collapse simulation
      const growthFactor = 1 + (day * 0.15);
      newDataPoint = {
        day,
        luggage: Math.floor(baseLoad * growthFactor + variance),
        delivered: Math.floor(baseLoad * growthFactor * 0.7),
        delayed: Math.floor(baseLoad * growthFactor * 0.2),
        inTransit: Math.floor(baseLoad * growthFactor * 0.1),
        storageCapacity: 800,
        storageUsed: Math.min(800, Math.floor(300 + day * 40)),
        flightCapacity: 2000,
        flightUsed: Math.floor(1200 + day * 80),
      };
    } else {
      // Normal operations
      newDataPoint = {
        day,
        luggage: Math.floor(baseLoad + variance),
        delivered: Math.floor((baseLoad + variance) * 0.85),
        delayed: Math.floor((baseLoad + variance) * 0.08),
        inTransit: Math.floor((baseLoad + variance) * 0.07),
        storageCapacity: 800,
        storageUsed: Math.floor(300 + Math.random() * 100),
        flightCapacity: 2000,
        flightUsed: Math.floor(1200 + Math.random() * 300),
      };
    }

    setSimulationData(prev => [...prev, newDataPoint]);
  };

  const generateFinalResults = () => {
    const days = parseInt(periodDays);
    const totalLuggage = 150 * days + Math.floor(Math.random() * 100);
    
    if (simulationType === 'collapse') {
      setMetrics({
        totalLuggage: totalLuggage * 2,
        delivered: Math.floor(totalLuggage * 0.45),
        delayed: Math.floor(totalLuggage * 0.40),
        averageDeliveryTime: 3.5,
        storageUtilization: 98,
        flightUtilization: 95,
      });
    } else {
      setMetrics({
        totalLuggage,
        delivered: Math.floor(totalLuggage * 0.92),
        delayed: Math.floor(totalLuggage * 0.05),
        averageDeliveryTime: 1.3,
        storageUtilization: 65,
        flightUtilization: 78,
      });
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
    toast.info('Simulación detenida');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl">Simulación de Operaciones</h2>
        <p className="text-gray-600 mt-1">Configure y ejecute simulaciones para análisis de escenarios</p>
      </div>

      {/* Configuration Panel */}
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
            {/* Simulation Type */}
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
                  <SelectItem value="realtime">
                    <div>
                      <div className="font-semibold">Operaciones en Tiempo Real</div>
                      <div className="text-xs text-gray-500">Simulación día a día</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="period">
                    <div>
                      <div className="font-semibold">Simulación de Período</div>
                      <div className="text-xs text-gray-500">Semanal, 5 días o 3 días (30-90 min)</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="collapse">
                    <div>
                      <div className="font-semibold">Simulación hasta Colapso</div>
                      <div className="text-xs text-gray-500">Prueba de límites del sistema</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Description based on type */}
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                {simulationType === 'realtime' && (
                  <p>Simula operaciones diarias normales en tiempo real con eventos aleatorios.</p>
                )}
                {simulationType === 'period' && (
                  <p>Simula un período específico (3, 5 o 7 días) con ejecución de 30-90 minutos. Ideal para análisis de rendimiento semanal.</p>
                )}
                {simulationType === 'collapse' && (
                  <p>Incrementa progresivamente la carga hasta encontrar el punto de colapso del sistema. Identifica límites operacionales.</p>
                )}
              </div>
            </div>

            {/* Period Selection */}
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
                    <SelectItem value="5">5 días (recomendado)</SelectItem>
                    <SelectItem value="7">7 días (semanal)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded">
                  <p className="font-semibold mb-1">Tiempo estimado de ejecución:</p>
                  <p>
                    {periodDays === '3' && '30-45 minutos'}
                    {periodDays === '5' && '45-75 minutos'}
                    {periodDays === '7' && '60-90 minutos'}
                  </p>
                </div>
              </div>
            )}

            {simulationType === 'collapse' && (
              <div className="space-y-3">
                <Label>Parámetros de Colapso</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-gray-600">Incremento de Carga (%)</Label>
                    <Input type="number" defaultValue="15" disabled={status === 'running'} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Intervalo (días simulados)</Label>
                    <Input type="number" defaultValue="1" disabled={status === 'running'} />
                  </div>
                </div>
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Esta simulación puede tomar tiempo considerable y mostrar fallos del sistema.</p>
                </div>
              </div>
            )}
          </div>

          {/* Control Buttons */}
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

          {/* Progress Bar */}
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

      {/* Results */}
      {(status === 'running' || status === 'paused' || status === 'completed') && (
        <>
          {/* Metrics */}
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
                    {((metrics.delivered / metrics.totalLuggage) * 100).toFixed(1)}%
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
                    {((metrics.delayed / metrics.totalLuggage) * 100).toFixed(1)}%
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
                  {metrics.storageUtilization > 90 && (
                    <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Crítico</span>
                    </div>
                  )}
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
                  {metrics.flightUtilization > 90 && (
                    <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Sobrecarga</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
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

          {/* Collapse Warning */}
          {status === 'completed' && simulationType === 'collapse' && metrics.storageUtilization > 95 && (
            <Card className="border-red-500 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Punto de Colapso Alcanzado
                </CardTitle>
              </CardHeader>
              <CardContent className="text-red-700">
                <div className="space-y-2">
                  <p>El sistema ha alcanzado su capacidad máxima:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Almacenamiento: {metrics.storageUtilization}% utilizado</li>
                    <li>Vuelos: {metrics.flightUtilization}% utilizados</li>
                    <li>Tasa de retraso: {((metrics.delayed / metrics.totalLuggage) * 100).toFixed(1)}%</li>
                  </ul>
                  <p className="mt-4 font-semibold">
                    Recomendaciones: Ampliar capacidad de almacenamiento y/o agregar más vuelos.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
