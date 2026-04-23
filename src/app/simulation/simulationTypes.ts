export type SimulationPeriod = 3 | 5 | 7;

export type SimulationMode = 'period';

export interface SimulationConfig {
  startDate: string;
  periodDays: SimulationPeriod;
}

export interface SimulatedLuggageState {
  id: string;
  originId: string;
  destinationId: string;
  currentLocationId: string;
  status: 'registered' | 'waiting' | 'in-transit' | 'delivered' | 'delayed';
  quantity: number;
  route: string[];
  routeIndex: number;
  createdAt: string;
  deliveredAt?: string;
  deadlineAt: string;
}

export interface DailySimulationSnapshot {
  day: number;
  date: string;
  delivered: number;
  delayed: number;
  inTransit: number;
  waiting: number;
  airportStorage: Record<string, number>;
  flightUsage: Record<string, number>;
}

export interface SimulationResult {
  config: SimulationConfig;
  totalDelivered: number;
  totalDelayed: number;
  totalInTransit: number;
  totalWaiting: number;
  snapshots: DailySimulationSnapshot[];
  finalLuggage: SimulatedLuggageState[];
}