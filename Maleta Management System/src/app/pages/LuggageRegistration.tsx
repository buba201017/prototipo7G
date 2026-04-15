import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { airports, airlines, calculateDeliveryTime, getAirportById } from '../data/mockData';
import { Package, Calendar, MapPin, Plane, CheckCircle, AlertCircle } from 'lucide-react';

export function LuggageRegistration() {
  const [formData, setFormData] = useState({
    airlineId: '',
    originId: '',
    destinationId: '',
    quantity: '1',
  });
  
  const [registeredLuggage, setRegisteredLuggage] = useState<any[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.airlineId || !formData.originId || !formData.destinationId || !formData.quantity) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (formData.originId === formData.destinationId) {
      toast.error('El origen y destino deben ser diferentes');
      return;
    }

    const origin = getAirportById(formData.originId);
    const destination = getAirportById(formData.destinationId);
    
    if (!origin || !destination) {
      toast.error('Aeropuertos no válidos');
      return;
    }

    const deliveryDays = calculateDeliveryTime(origin, destination);
    const registrationDate = new Date();
    const estimatedDelivery = new Date(registrationDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);

    const newLuggage = {
      id: `LG${Date.now()}`,
      ...formData,
      quantity: parseInt(formData.quantity),
      registrationDate: registrationDate.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
      status: 'registered',
      deliveryDays,
    };

    setRegisteredLuggage([newLuggage, ...registeredLuggage]);
    
    toast.success('Maletas registradas exitosamente', {
      description: `ID: ${newLuggage.id} - ${formData.quantity} maletas registradas`,
    });

    // Reset form
    setFormData({
      airlineId: '',
      originId: '',
      destinationId: '',
      quantity: '1',
    });
  };

  const origin = formData.originId ? getAirportById(formData.originId) : null;
  const destination = formData.destinationId ? getAirportById(formData.destinationId) : null;
  const deliveryTime = origin && destination ? calculateDeliveryTime(origin, destination) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl">Registro de Maletas</h2>
        <p className="text-gray-600 mt-1">Registre nuevos envíos de equipaje entre aeropuertos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Nuevo Envío
              </CardTitle>
              <CardDescription>Complete la información del envío de maletas</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Airline Selection */}
                <div className="space-y-2">
                  <Label htmlFor="airline">Aerolínea Cliente</Label>
                  <Select value={formData.airlineId} onValueChange={(value) => setFormData({ ...formData, airlineId: value })}>
                    <SelectTrigger id="airline">
                      <SelectValue placeholder="Seleccione la aerolínea" />
                    </SelectTrigger>
                    <SelectContent>
                      {airlines.map(airline => (
                        <SelectItem key={airline.id} value={airline.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{airline.code}</Badge>
                            <span>{airline.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Origin Selection */}
                <div className="space-y-2">
                  <Label htmlFor="origin">Aeropuerto de Origen</Label>
                  <Select value={formData.originId} onValueChange={(value) => setFormData({ ...formData, originId: value })}>
                    <SelectTrigger id="origin">
                      <SelectValue placeholder="Seleccione el aeropuerto de origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map(airport => (
                        <SelectItem key={airport.id} value={airport.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{airport.code}</Badge>
                            <span>{airport.city}, {airport.country}</span>
                            <Badge className="ml-auto">{airport.continent}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {origin && (
                    <p className="text-sm text-gray-500">
                      Capacidad de almacenamiento: {origin.currentStorage}/{origin.storageCapacity} maletas
                    </p>
                  )}
                </div>

                {/* Destination Selection */}
                <div className="space-y-2">
                  <Label htmlFor="destination">Aeropuerto de Destino</Label>
                  <Select value={formData.destinationId} onValueChange={(value) => setFormData({ ...formData, destinationId: value })}>
                    <SelectTrigger id="destination">
                      <SelectValue placeholder="Seleccione el aeropuerto de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map(airport => (
                        <SelectItem key={airport.id} value={airport.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{airport.code}</Badge>
                            <span>{airport.city}, {airport.country}</span>
                            <Badge className="ml-auto">{airport.continent}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {destination && (
                    <p className="text-sm text-gray-500">
                      Capacidad de almacenamiento: {destination.currentStorage}/{destination.storageCapacity} maletas
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad de Maletas</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Ingrese la cantidad"
                  />
                  <p className="text-xs text-gray-500">
                    Máximo 50 maletas por envío
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Package className="w-4 h-4 mr-2" />
                  Registrar Envío
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Info Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveryTime !== null ? (
                <>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Plazo de Entrega</p>
                      <p className="text-2xl text-blue-600">{deliveryTime} {deliveryTime === 1 ? 'día' : 'días'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Plane className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Tipo de Vuelo</p>
                      <p className="text-sm text-gray-600">
                        {origin?.continent === destination?.continent ? 'Intracontinental' : 'Intercontinental'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Ruta</p>
                      <p className="text-sm text-gray-600">
                        {origin?.city} → {destination?.city}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {origin?.continent} → {destination?.continent}
                      </p>
                    </div>
                  </div>

                  {origin && destination && (
                    <div className="pt-4 border-t">
                      {origin.continent === destination.continent ? (
                        <div className="flex items-start gap-2 text-green-700 bg-green-50 p-3 rounded">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">
                            Mismo continente: Entrega garantizada en 1 día (tiempo de traslado: 12 horas)
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-blue-700 bg-blue-50 p-3 rounded">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">
                            Diferente continente: Entrega garantizada en 2 días (tiempo de traslado: 24 horas)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Seleccione origen y destino para ver información de entrega
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Capacidades de Vuelo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">Intracontinental</p>
                <p className="text-gray-600">150-250 maletas por vuelo</p>
                <p className="text-xs text-gray-500">Múltiples vuelos diarios</p>
              </div>
              <div>
                <p className="font-semibold">Intercontinental</p>
                <p className="text-gray-600">150-400 maletas por vuelo</p>
                <p className="text-xs text-gray-500">Al menos un vuelo diario</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recently Registered */}
      {registeredLuggage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Envíos Registrados en esta Sesión</CardTitle>
            <CardDescription>Últimos envíos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registeredLuggage.map((luggage) => {
                const origin = getAirportById(luggage.originId);
                const destination = getAirportById(luggage.destinationId);
                const airline = airlines.find(a => a.id === luggage.airlineId);
                
                return (
                  <div key={luggage.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">{luggage.id}</Badge>
                        <Badge>{airline?.code}</Badge>
                        <Badge variant="secondary">{luggage.quantity} maletas</Badge>
                      </div>
                      <p className="text-sm">
                        {origin?.city} ({origin?.code}) → {destination?.city} ({destination?.code})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-700">
                        Entrega: {luggage.deliveryDays} {luggage.deliveryDays === 1 ? 'día' : 'días'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(luggage.estimatedDelivery).toLocaleDateString('es')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
