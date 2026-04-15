import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { airports, luggageData, flights, airlines, getAirportById, getAirlineById } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { BarChart3, Download, Filter, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export function Reports() {
  const [reportPeriod, setReportPeriod] = useState('week');
  const [selectedContinent, setSelectedContinent] = useState('all');

  // Performance by airline
  const airlinePerformance = airlines.map(airline => {
    const airlineLuggage = luggageData.filter(l => l.airlineId === airline.id);
    const total = airlineLuggage.reduce((sum, l) => sum + l.quantity, 0);
    const delivered = airlineLuggage
      .filter(l => l.status === 'delivered')
      .reduce((sum, l) => sum + l.quantity, 0);
    const delayed = airlineLuggage
      .filter(l => l.status === 'delayed')
      .reduce((sum, l) => sum + l.quantity, 0);

    return {
      name: airline.code,
      fullName: airline.name,
      total,
      delivered,
      delayed,
      onTimeRate: total > 0 ? ((delivered / total) * 100).toFixed(1) : '0',
    };
  }).filter(a => a.total > 0);

  // Airport performance
  const airportPerformance = airports.map(airport => {
    const throughput = luggageData.filter(
      l => l.originId === airport.id || l.currentLocationId === airport.id
    ).reduce((sum, l) => sum + l.quantity, 0);
    
    const utilization = (airport.currentStorage / airport.storageCapacity) * 100;

    return {
      name: airport.code,
      city: airport.city,
      continent: airport.continent,
      throughput,
      utilization: utilization.toFixed(1),
      capacity: airport.storageCapacity,
      current: airport.currentStorage,
    };
  }).sort((a, b) => b.throughput - a.throughput);

  // Continent distribution
  const continentData = [
    { 
      name: 'América', 
      value: luggageData.filter(l => {
        const airport = getAirportById(l.currentLocationId);
        return airport?.continent === 'America';
      }).reduce((sum, l) => sum + l.quantity, 0),
      color: '#3b82f6'
    },
    { 
      name: 'Europa', 
      value: luggageData.filter(l => {
        const airport = getAirportById(l.currentLocationId);
        return airport?.continent === 'Europe';
      }).reduce((sum, l) => sum + l.quantity, 0),
      color: '#10b981'
    },
    { 
      name: 'Asia', 
      value: luggageData.filter(l => {
        const airport = getAirportById(l.currentLocationId);
        return airport?.continent === 'Asia';
      }).reduce((sum, l) => sum + l.quantity, 0),
      color: '#f59e0b'
    },
  ];

  // Weekly trends (mock data)
  const weeklyTrends = [
    { week: 'Sem 1', luggage: 1250, onTime: 1150, delayed: 100, deliveryRate: 92 },
    { week: 'Sem 2', luggage: 1380, onTime: 1310, delayed: 70, deliveryRate: 95 },
    { week: 'Sem 3', luggage: 1420, onTime: 1250, delayed: 170, deliveryRate: 88 },
    { week: 'Sem 4', luggage: 1550, onTime: 1450, delayed: 100, deliveryRate: 94 },
  ];

  // Route efficiency
  const routeEfficiency = [
    { route: 'JFK-LHR', flights: 7, capacity: 2450, used: 1960, efficiency: 80 },
    { route: 'LAX-SIN', flights: 7, capacity: 2800, used: 2310, efficiency: 82 },
    { route: 'CDG-NRT', flights: 7, capacity: 2660, used: 2170, efficiency: 82 },
    { route: 'LHR-CDG', flights: 28, capacity: 4480, used: 3080, efficiency: 69 },
    { route: 'FRA-MAD', flights: 14, capacity: 2520, used: 1750, efficiency: 69 },
  ];

  // KPI radar chart
  const kpiData = [
    { metric: 'Puntualidad', value: 92, fullMark: 100 },
    { metric: 'Capacidad', value: 78, fullMark: 100 },
    { metric: 'Eficiencia', value: 85, fullMark: 100 },
    { metric: 'Satisfacción', value: 88, fullMark: 100 },
    { metric: 'Utilización', value: 75, fullMark: 100 },
  ];

  const handleExportReport = () => {
    // Simulate export
    const blob = new Blob(['Report data...'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasf-b2b-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl">Reportes y Análisis</h2>
          <p className="text-gray-600 mt-1">Métricas de desempeño y análisis operacional</p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Hoy</SelectItem>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mes</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Último Año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Continentes</SelectItem>
                  <SelectItem value="America">América</SelectItem>
                  <SelectItem value="Europe">Europa</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tasa de Entrega a Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl text-green-600">92%</div>
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                +3%
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tiempo Promedio de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl">1.3 días</div>
              <div className="flex items-center text-green-600 text-sm">
                <TrendingDown className="w-4 h-4 mr-1" />
                -0.2
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Utilización de Capacidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl text-blue-600">78%</div>
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5%
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tasa de Retrasos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl text-yellow-600">5%</div>
              <div className="flex items-center text-red-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                +1%
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">vs período anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different reports */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="airlines">Por Aerolínea</TabsTrigger>
          <TabsTrigger value="airports">Por Aeropuerto</TabsTrigger>
          <TabsTrigger value="routes">Por Ruta</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia Semanal</CardTitle>
                <CardDescription>Volumen y tasa de entrega por semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="luggage" stroke="#3b82f6" strokeWidth={2} name="Total Maletas" />
                    <Line yAxisId="right" type="monotone" dataKey="deliveryRate" stroke="#10b981" strokeWidth={2} name="Tasa Entrega (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Continente</CardTitle>
                <CardDescription>Maletas actualmente en cada continente</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={continentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {continentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores Clave de Rendimiento</CardTitle>
                <CardDescription>Métricas principales del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={kpiData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Rendimiento" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entregas vs Retrasos</CardTitle>
                <CardDescription>Comparación semanal</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="onTime" fill="#10b981" name="A Tiempo" />
                    <Bar dataKey="delayed" fill="#ef4444" name="Retrasadas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Airlines Tab */}
        <TabsContent value="airlines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Aerolínea</CardTitle>
              <CardDescription>Comparación de desempeño entre aerolíneas cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aerolínea</TableHead>
                    <TableHead>Total Maletas</TableHead>
                    <TableHead>Entregadas</TableHead>
                    <TableHead>Retrasadas</TableHead>
                    <TableHead>Tasa a Tiempo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {airlinePerformance.map((airline) => (
                    <TableRow key={airline.name}>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{airline.fullName}</div>
                          <div className="text-sm text-gray-500">{airline.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{airline.total}</TableCell>
                      <TableCell className="text-green-600">{airline.delivered}</TableCell>
                      <TableCell className="text-red-600">{airline.delayed}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                parseFloat(airline.onTimeRate) > 90 ? 'bg-green-500' :
                                parseFloat(airline.onTimeRate) > 80 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${airline.onTimeRate}%` }}
                            />
                          </div>
                          <span>{airline.onTimeRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {parseFloat(airline.onTimeRate) > 90 ? (
                          <Badge className="bg-green-600">Excelente</Badge>
                        ) : parseFloat(airline.onTimeRate) > 80 ? (
                          <Badge variant="secondary">Bueno</Badge>
                        ) : (
                          <Badge variant="destructive">Necesita Mejora</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparación de Volumen</CardTitle>
              <CardDescription>Total de maletas procesadas por aerolínea</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={airlinePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="Total" />
                  <Bar dataKey="delivered" fill="#10b981" name="Entregadas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Airports Tab */}
        <TabsContent value="airports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Aeropuerto</CardTitle>
              <CardDescription>Throughput y utilización de capacidad</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aeropuerto</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Continente</TableHead>
                    <TableHead>Throughput</TableHead>
                    <TableHead>Utilización</TableHead>
                    <TableHead>Capacidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {airportPerformance.slice(0, 10).map((airport) => (
                    <TableRow key={airport.name}>
                      <TableCell>
                        <Badge variant="outline">{airport.name}</Badge>
                      </TableCell>
                      <TableCell>{airport.city}</TableCell>
                      <TableCell>
                        <Badge>{airport.continent}</Badge>
                      </TableCell>
                      <TableCell>{airport.throughput} maletas</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                parseFloat(airport.utilization) > 90 ? 'bg-red-500' :
                                parseFloat(airport.utilization) > 70 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${airport.utilization}%` }}
                            />
                          </div>
                          <span>{airport.utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {airport.current} / {airport.capacity}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 10 Aeropuertos por Throughput</CardTitle>
              <CardDescription>Aeropuertos con mayor volumen procesado</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={airportPerformance.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="throughput" fill="#8b5cf6" name="Throughput (maletas)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eficiencia de Rutas</CardTitle>
              <CardDescription>Rendimiento de las principales rutas operativas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Vuelos/Semana</TableHead>
                    <TableHead>Capacidad Total</TableHead>
                    <TableHead>Utilizada</TableHead>
                    <TableHead>Eficiencia</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routeEfficiency.map((route) => (
                    <TableRow key={route.route}>
                      <TableCell className="font-mono font-semibold">{route.route}</TableCell>
                      <TableCell>{route.flights}</TableCell>
                      <TableCell>{route.capacity} maletas</TableCell>
                      <TableCell>{route.used} maletas</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                route.efficiency > 80 ? 'bg-green-500' :
                                route.efficiency > 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${route.efficiency}%` }}
                            />
                          </div>
                          <span>{route.efficiency}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {route.efficiency > 80 ? (
                          <Badge className="bg-green-600">Óptima</Badge>
                        ) : route.efficiency > 60 ? (
                          <Badge variant="secondary">Normal</Badge>
                        ) : (
                          <Badge variant="outline">Baja</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Utilización de Rutas</CardTitle>
              <CardDescription>Comparación de eficiencia entre rutas principales</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={routeEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="route" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="capacity" fill="#94a3b8" name="Capacidad" />
                  <Bar dataKey="used" fill="#3b82f6" name="Utilizada" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
