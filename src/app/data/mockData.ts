export type Continent = 'America' | 'Asia' | 'Europe';

export interface Airport {
  id: string;
  name: string;
  city: string;
  country: string;
  continent: Continent;
  code: string;
  storageCapacity: number;
  currentStorage: number;
  coordinates: { lat: number; lng: number };
}

export interface Flight {
  id: string;
  originId: string;
  destinationId: string;
  capacity: number;
  currentLoad: number;
  frequency: number; // times per day
  duration: number; // in hours
  nextDeparture: string;
}

export interface Luggage {
  id: string;
  airlineId: string;
  originId: string;
  destinationId: string;
  status: 'registered' | 'in-transit' | 'delivered' | 'delayed';
  currentLocationId: string;
  registrationDate: string;
  estimatedDelivery: string;
  route: string[];
  quantity: number;
}

export interface Airline {
  id: string;
  name: string;
  code: string;
}

export const airports: Airport[] = [
  // America
  { id: 'jfk', code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', continent: 'America', storageCapacity: 800, currentStorage: 450, coordinates: { lat: 40.6413, lng: -73.7781 } },
  { id: 'lax', code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', continent: 'America', storageCapacity: 750, currentStorage: 380, coordinates: { lat: 34.0522, lng: -118.2437 } },
  { id: 'mex', code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', continent: 'America', storageCapacity: 600, currentStorage: 320, coordinates: { lat: 19.4363, lng: -99.0721 } },
  { id: 'gru', code: 'GRU', name: 'São Paulo/Guarulhos International', city: 'São Paulo', country: 'Brazil', continent: 'America', storageCapacity: 650, currentStorage: 290, coordinates: { lat: -23.4356, lng: -46.4731 } },
  { id: 'bog', code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia', continent: 'America', storageCapacity: 500, currentStorage: 210, coordinates: { lat: 4.7016, lng: -74.1469 } },
  
  // Europe
  { id: 'lhr', code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', continent: 'Europe', storageCapacity: 800, currentStorage: 520, coordinates: { lat: 51.4700, lng: -0.4543 } },
  { id: 'cdg', code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', continent: 'Europe', storageCapacity: 750, currentStorage: 480, coordinates: { lat: 49.0097, lng: 2.5479 } },
  { id: 'fra', code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', continent: 'Europe', storageCapacity: 700, currentStorage: 410, coordinates: { lat: 50.0379, lng: 8.5622 } },
  { id: 'mad', code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', continent: 'Europe', storageCapacity: 650, currentStorage: 350, coordinates: { lat: 40.4983, lng: -3.5676 } },
  { id: 'ams', code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', continent: 'Europe', storageCapacity: 600, currentStorage: 330, coordinates: { lat: 52.3105, lng: 4.7683 } },
  
  // Asia
  { id: 'nrt', code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', continent: 'Asia', storageCapacity: 750, currentStorage: 440, coordinates: { lat: 35.7720, lng: 140.3929 } },
  { id: 'sin', code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', continent: 'Asia', storageCapacity: 800, currentStorage: 510, coordinates: { lat: 1.3644, lng: 103.9915 } },
  { id: 'hkg', code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China', continent: 'Asia', storageCapacity: 700, currentStorage: 390, coordinates: { lat: 22.3080, lng: 113.9185 } },
  { id: 'dxb', code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', continent: 'Asia', storageCapacity: 750, currentStorage: 470, coordinates: { lat: 25.2532, lng: 55.3657 } },
  { id: 'icn', code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', continent: 'Asia', storageCapacity: 650, currentStorage: 360, coordinates: { lat: 37.4602, lng: 126.4407 } },
];

export const airlines: Airline[] = [
  { id: 'aa', name: 'American Airlines', code: 'AA' },
  { id: 'ba', name: 'British Airways', code: 'BA' },
  { id: 'lh', name: 'Lufthansa', code: 'LH' },
  { id: 'af', name: 'Air France', code: 'AF' },
  { id: 'sq', name: 'Singapore Airlines', code: 'SQ' },
  { id: 'jl', name: 'Japan Airlines', code: 'JL' },
  { id: 'am', name: 'Aeroméxico', code: 'AM' },
  { id: 'la', name: 'LATAM', code: 'LA' },
];

export const flights: Flight[] = [
  // Same continent flights (America)
  { id: 'f1', originId: 'jfk', destinationId: 'lax', capacity: 200, currentLoad: 145, frequency: 3, duration: 12, nextDeparture: '2026-04-01T14:00:00' },
  { id: 'f2', originId: 'lax', destinationId: 'mex', capacity: 180, currentLoad: 120, frequency: 2, duration: 12, nextDeparture: '2026-04-01T16:00:00' },
  { id: 'f3', originId: 'mex', destinationId: 'gru', capacity: 220, currentLoad: 160, frequency: 1, duration: 12, nextDeparture: '2026-04-01T18:00:00' },
  { id: 'f4', originId: 'gru', destinationId: 'bog', capacity: 150, currentLoad: 90, frequency: 2, duration: 12, nextDeparture: '2026-04-01T20:00:00' },
  { id: 'f5', originId: 'jfk', destinationId: 'bog', capacity: 190, currentLoad: 130, frequency: 1, duration: 12, nextDeparture: '2026-04-01T22:00:00' },
  
  // Same continent flights (Europe)
  { id: 'f6', originId: 'lhr', destinationId: 'cdg', capacity: 160, currentLoad: 110, frequency: 4, duration: 12, nextDeparture: '2026-04-01T10:00:00' },
  { id: 'f7', originId: 'cdg', destinationId: 'fra', capacity: 170, currentLoad: 115, frequency: 3, duration: 12, nextDeparture: '2026-04-01T12:00:00' },
  { id: 'f8', originId: 'fra', destinationId: 'mad', capacity: 180, currentLoad: 125, frequency: 2, duration: 12, nextDeparture: '2026-04-01T14:00:00' },
  { id: 'f9', originId: 'mad', destinationId: 'ams', capacity: 190, currentLoad: 135, frequency: 2, duration: 12, nextDeparture: '2026-04-01T16:00:00' },
  { id: 'f10', originId: 'ams', destinationId: 'lhr', capacity: 200, currentLoad: 140, frequency: 3, duration: 12, nextDeparture: '2026-04-01T18:00:00' },
  
  // Same continent flights (Asia)
  { id: 'f11', originId: 'nrt', destinationId: 'sin', capacity: 250, currentLoad: 180, frequency: 2, duration: 12, nextDeparture: '2026-04-01T08:00:00' },
  { id: 'f12', originId: 'sin', destinationId: 'hkg', capacity: 230, currentLoad: 170, frequency: 2, duration: 12, nextDeparture: '2026-04-01T10:00:00' },
  { id: 'f13', originId: 'hkg', destinationId: 'dxb', capacity: 240, currentLoad: 175, frequency: 1, duration: 12, nextDeparture: '2026-04-01T12:00:00' },
  { id: 'f14', originId: 'dxb', destinationId: 'icn', capacity: 220, currentLoad: 155, frequency: 1, duration: 12, nextDeparture: '2026-04-01T14:00:00' },
  { id: 'f15', originId: 'icn', destinationId: 'nrt', capacity: 210, currentLoad: 145, frequency: 2, duration: 12, nextDeparture: '2026-04-01T16:00:00' },
  
  // Intercontinental flights
  { id: 'f16', originId: 'jfk', destinationId: 'lhr', capacity: 350, currentLoad: 280, frequency: 1, duration: 24, nextDeparture: '2026-04-01T20:00:00' },
  { id: 'f17', originId: 'lhr', destinationId: 'nrt', capacity: 380, currentLoad: 310, frequency: 1, duration: 24, nextDeparture: '2026-04-01T22:00:00' },
  { id: 'f18', originId: 'lax', destinationId: 'sin', capacity: 400, currentLoad: 330, frequency: 1, duration: 24, nextDeparture: '2026-04-02T00:00:00' },
  { id: 'f19', originId: 'cdg', destinationId: 'jfk', capacity: 360, currentLoad: 290, frequency: 1, duration: 24, nextDeparture: '2026-04-02T02:00:00' },
  { id: 'f20', originId: 'sin', destinationId: 'fra', capacity: 370, currentLoad: 300, frequency: 1, duration: 24, nextDeparture: '2026-04-02T04:00:00' },
  { id: 'f21', originId: 'dxb', destinationId: 'lax', capacity: 390, currentLoad: 320, frequency: 1, duration: 24, nextDeparture: '2026-04-02T06:00:00' },
  { id: 'f22', originId: 'gru', destinationId: 'cdg', capacity: 340, currentLoad: 270, frequency: 1, duration: 24, nextDeparture: '2026-04-02T08:00:00' },
  { id: 'f23', originId: 'mad', destinationId: 'mex', capacity: 330, currentLoad: 260, frequency: 1, duration: 24, nextDeparture: '2026-04-02T10:00:00' },
];

export const luggageData: Luggage[] = [
  { id: 'lg001', airlineId: 'aa', originId: 'jfk', destinationId: 'lax', status: 'in-transit', currentLocationId: 'jfk', registrationDate: '2026-04-01T08:00:00', estimatedDelivery: '2026-04-01T20:00:00', route: ['jfk', 'lax'], quantity: 5 },
  { id: 'lg002', airlineId: 'ba', originId: 'lhr', destinationId: 'nrt', status: 'in-transit', currentLocationId: 'lhr', registrationDate: '2026-04-01T06:00:00', estimatedDelivery: '2026-04-02T22:00:00', route: ['lhr', 'nrt'], quantity: 3 },
  { id: 'lg003', airlineId: 'sq', originId: 'sin', destinationId: 'fra', status: 'registered', currentLocationId: 'sin', registrationDate: '2026-04-01T10:00:00', estimatedDelivery: '2026-04-03T04:00:00', route: ['sin', 'fra'], quantity: 8 },
  { id: 'lg004', airlineId: 'lh', originId: 'fra', destinationId: 'mad', status: 'in-transit', currentLocationId: 'fra', registrationDate: '2026-04-01T09:00:00', estimatedDelivery: '2026-04-01T14:00:00', route: ['fra', 'mad'], quantity: 4 },
  { id: 'lg005', airlineId: 'af', originId: 'cdg', destinationId: 'jfk', status: 'in-transit', currentLocationId: 'cdg', registrationDate: '2026-04-01T07:00:00', estimatedDelivery: '2026-04-02T02:00:00', route: ['cdg', 'jfk'], quantity: 6 },
  { id: 'lg006', airlineId: 'am', originId: 'mex', destinationId: 'gru', status: 'delivered', currentLocationId: 'gru', registrationDate: '2026-03-31T12:00:00', estimatedDelivery: '2026-04-01T18:00:00', route: ['mex', 'gru'], quantity: 2 },
  { id: 'lg007', airlineId: 'jl', originId: 'nrt', destinationId: 'sin', status: 'in-transit', currentLocationId: 'nrt', registrationDate: '2026-04-01T05:00:00', estimatedDelivery: '2026-04-01T08:00:00', route: ['nrt', 'sin'], quantity: 7 },
  { id: 'lg008', airlineId: 'la', originId: 'gru', destinationId: 'cdg', status: 'registered', currentLocationId: 'gru', registrationDate: '2026-04-01T11:00:00', estimatedDelivery: '2026-04-02T08:00:00', route: ['gru', 'cdg'], quantity: 5 },
  { id: 'lg009', airlineId: 'aa', originId: 'lax', destinationId: 'sin', status: 'in-transit', currentLocationId: 'lax', registrationDate: '2026-04-01T08:30:00', estimatedDelivery: '2026-04-02T00:00:00', route: ['lax', 'sin'], quantity: 10 },
  { id: 'lg010', airlineId: 'ba', originId: 'lhr', destinationId: 'cdg', status: 'delayed', currentLocationId: 'lhr', registrationDate: '2026-04-01T06:30:00', estimatedDelivery: '2026-04-01T10:00:00', route: ['lhr', 'cdg'], quantity: 3 },
];

export const getAirportById = (id: string): Airport | undefined => {
  return airports.find(a => a.id === id);
};

export const getAirlineById = (id: string): Airline | undefined => {
  return airlines.find(a => a.id === id);
};

export const getFlightsByOrigin = (originId: string): Flight[] => {
  return flights.filter(f => f.originId === originId);
};

export const calculateDeliveryTime = (origin: Airport, destination: Airport): number => {
  // Returns delivery time in days
  if (origin.continent === destination.continent) {
    return 1; // 1 day for same continent
  } else {
    return 2; // 2 days for different continents
  }
};
