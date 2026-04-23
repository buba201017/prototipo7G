import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Package, TrendingUp, AlertCircle, CheckCircle, Clock, Plane } from 'lucide-react';
import { airports, luggageData, flights } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export function Dashboard() {
  // Calculate metrics
  const totalLuggage = luggageData.reduce((sum, item) => sum + item.quantity, 0);
  const inTransit = luggageData.filter(l => l.status === 'in-transit').reduce((sum, item) => sum + item.quantity, 0);
  const delivered = luggageData.filter(l => l.status === 'delivered').reduce((sum, item) => sum + item.quantity, 0);
  const delayed = luggageData.filter(l => l.status === 'delayed').reduce((sum, item) => sum + item.quantity, 0);
  
  const totalFlights = flights.length;
  const averageCapacity = flights.reduce((sum, f) => sum + (f.currentLoad / f.capacity * 100), 0) / flights.length;
  
  // Storage utilization by airport
  const storageData = airports.slice(0, 8).map(airport => ({
    name: airport.code,
    utilization: Math.round((airport.currentStorage / airport.storageCapacity) * 100),
    capacity: airport.storageCapacity,
    current: airport.currentStorage,
  }));

  // Status distribution
  const statusData = [
    { name: 'En Tránsito', value: inTransit, color: '#3b82f6' },
    { name: 'Entregado', value: delivered, color: '#10b981' },
    { name: 'Registrado', value: luggageData.filter(l => l.status === 'registered').reduce((sum, item) => sum + item.quantity, 0), color: '#f59e0b' },
    { name: 'Retrasado', value: delayed, color: '#ef4444' },
  ];

  // Luggage by continent
  const continentData = [
    { name: 'América', value: luggageData.filter(l => airports.find(a => a.id === l.currentLocationId)?.continent === 'America').reduce((sum, item) => sum + item.quantity, 0) },
    { name: 'Europa', value: luggageData.filter(l => airports.find(a => a.id === l.currentLocationId)?.continent === 'Europe').reduce((sum, item) => sum + item.quantity, 0) },
    { name: 'Asia', value: luggageData.filter(l => airports.find(a => a.id === l.currentLocationId)?.continent === 'Asia').reduce((sum, item) => sum + item.quantity, 0) },
  ];

  // Performance trends (mock data)
  const performanceData = [
    { day: 'Lun', onTime: 92, delayed: 8 },
    { day: 'Mar', onTime: 95, delayed: 5 },
    { day: 'Mie', onTime: 88, delayed: 12 },
    { day: 'Jue', onTime: 93, delayed: 7 },
    { day: 'Vie', onTime: 90, delayed: 10 },
    { day: 'Sab', onTime: 94, delayed: 6 },
    { day: 'Dom', onTime: 96, delayed: 4 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Panel de Control</h2>
        <p className="text-gray-600 mt-1">Vista general de las operaciones de Tasf.B2B</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total de Maletas</CardTitle>
            <Package className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalLuggage}</div>
            <p className="text-xs text-gray-500 mt-1">
              {luggageData.length} envíos activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">En Tránsito</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{inTransit}</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((inTransit / totalLuggage) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Entregadas</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{delivered}</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((delivered / totalLuggage) * 100)}% tasa de entrega
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Retrasadas</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{delayed}</div>
            <p className="text-xs text-gray-500 mt-1">
              {delayed > 0 ? 'Requiere atención' : 'Sin retrasos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flight Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Operaciones de Vuelo
            </CardTitle>
            <CardDescription>Capacidad y utilización de flota</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de Rutas Activas</span>
              <span className="text-xl">{totalFlights}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Utilización Promedio</span>
              <span className="text-xl">{averageCapacity.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vuelos Intracontinentales</span>
              <Badge variant="outline">{flights.filter(f => {
                const origin = airports.find(a => a.id === f.originId);
                const dest = airports.find(a => a.id === f.destinationId);
                return origin?.continent === dest?.continent;
              }).length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vuelos Intercontinentales</span>
              <Badge variant="outline">{flights.filter(f => {
                const origin = airports.find(a => a.id === f.originId);
                const dest = airports.find(a => a.id === f.destinationId);
                return origin?.continent !== dest?.continent;
              }).length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>Estado actual de las maletas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Utilización de Almacenamiento por Aeropuerto</CardTitle>
            <CardDescription>Capacidad de almacenamiento actual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm text-gray-600">Utilización: {data.utilization}%</p>
                          <p className="text-sm text-gray-600">Actual: {data.current} maletas</p>
                          <p className="text-sm text-gray-600">Capacidad: {data.capacity} maletas</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="utilization" fill="#3b82f6" name="Utilización (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Entregas - Última Semana</CardTitle>
            <CardDescription>Porcentaje de entregas a tiempo vs retrasadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="onTime" stroke="#10b981" strokeWidth={2} name="A tiempo (%)" />
                <Line type="monotone" dataKey="delayed" stroke="#ef4444" strokeWidth={2} name="Retrasadas (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Continent Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Continente</CardTitle>
          <CardDescription>Maletas actualmente en cada continente</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={continentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" name="Maletas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimos envíos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {luggageData.slice(0, 5).map((luggage) => {
              const origin = airports.find(a => a.id === luggage.originId);
              const destination = airports.find(a => a.id === luggage.destinationId);
              const current = airports.find(a => a.id === luggage.currentLocationId);
              
              return (
                <div key={luggage.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{luggage.id}</span>
                      <Badge variant={
                        luggage.status === 'delivered' ? 'default' :
                        luggage.status === 'in-transit' ? 'secondary' :
                        luggage.status === 'delayed' ? 'destructive' :
                        'outline'
                      }>
                        {luggage.status === 'delivered' ? 'Entregado' :
                         luggage.status === 'in-transit' ? 'En tránsito' :
                         luggage.status === 'delayed' ? 'Retrasado' :
                         'Registrado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {origin?.city} ({origin?.code}) → {destination?.city} ({destination?.code})
                    </p>
                    <p className="text-xs text-gray-500">
                      Ubicación actual: {current?.city} | {luggage.quantity} maletas
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>ETA: {new Date(luggage.estimatedDelivery).toLocaleDateString('es')}</div>
                    <div className="text-xs">{new Date(luggage.estimatedDelivery).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
