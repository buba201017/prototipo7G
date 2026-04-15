import { luggageData, flights, airports } from '../data/mockData';
import { findRoute } from './routePlanner';
import {
  addDays,
  cloneDeep,
  getDeliveryDeadlineDays,
  getFlightByRoute,
  isDateAfter,
  isSameContinent,
} from './simulationUtils';
import type {
  DailySimulationSnapshot,
  SimulatedLuggageState,
  SimulationConfig,
  SimulationResult,
} from './simulationTypes';

type FlightUsageMap = Record<string, number>;
type AirportStorageMap = Record<string, number>;

function initializeAirportStorage(): AirportStorageMap {
  const storage: AirportStorageMap = {};
  for (const airport of airports) {
    storage[airport.id] = airport.currentStorage;
  }
  return storage;
}

function initializeFlightUsage(): FlightUsageMap {
  const usage: FlightUsageMap = {};
  for (const flight of flights) {
    usage[flight.id] = flight.currentLoad;
  }
  return usage;
}

function buildInitialLuggage(config: SimulationConfig): SimulatedLuggageState[] {
  return cloneDeep(luggageData).map((item) => {
    const route = findRoute(item.originId, item.destinationId);
    const deadlineDays = getDeliveryDeadlineDays(item.originId, item.destinationId);

    return {
      id: item.id,
      originId: item.originId,
      destinationId: item.destinationId,
      currentLocationId: item.currentLocationId,
      status:
        item.status === 'delivered'
          ? 'delivered'
          : item.status === 'delayed'
          ? 'delayed'
          : 'waiting',
      quantity: item.quantity,
      route,
      routeIndex: 0,
      createdAt: config.startDate,
      deadlineAt: addDays(config.startDate, deadlineDays),
      deliveredAt: item.status === 'delivered' ? config.startDate : undefined,
    };
  });
}

export function runPeriodSimulation(config: SimulationConfig): SimulationResult {
  const luggage = buildInitialLuggage(config);
  const airportStorage = initializeAirportStorage();
  const snapshots: DailySimulationSnapshot[] = [];

  for (let day = 1; day <= config.periodDays; day++) {
    const currentDate = addDays(config.startDate, day - 1);

    const dayFlightUsage = initializeFlightUsage();

    // 1. Intentar mover maletas
    for (const item of luggage) {
      if (item.status === 'delivered' || item.status === 'delayed') continue;
      if (item.route.length <= 1) continue;
      if (item.routeIndex >= item.route.length - 1) continue;

      const currentStop = item.route[item.routeIndex];
      const nextStop = item.route[item.routeIndex + 1];
      const flight = getFlightByRoute(currentStop, nextStop);

      if (!flight) {
        continue;
      }

      const usedCapacity = dayFlightUsage[flight.id] ?? 0;
      const availableCapacity = flight.capacity - usedCapacity;

      if (availableCapacity < item.quantity) {
        item.status = 'waiting';
        continue;
      }

      // Embarcar
      dayFlightUsage[flight.id] = usedCapacity + item.quantity;
      item.status = 'in-transit';

      // Sale de almacén actual si había espacio registrado
      if (airportStorage[currentStop] !== undefined) {
        airportStorage[currentStop] = Math.max(0, airportStorage[currentStop] - item.quantity);
      }

      // Llegada al siguiente tramo
      item.currentLocationId = nextStop;
      item.routeIndex += 1;

      // Entra al almacén del siguiente aeropuerto
      if (airportStorage[nextStop] !== undefined) {
        airportStorage[nextStop] += item.quantity;
      }

      // Si ya llegó al destino final, se entrega
      if (nextStop === item.destinationId) {
        item.status = 'delivered';
        item.deliveredAt = currentDate;
      } else {
        item.status = 'waiting';
      }
    }

    // 2. Marcar retrasos
    for (const item of luggage) {
      if (item.status === 'delivered') continue;

      if (isDateAfter(currentDate, item.deadlineAt)) {
        item.status = 'delayed';
      }
    }

    // 3. Snapshot del día
    const delivered = luggage
      .filter((l) => l.status === 'delivered')
      .reduce((sum, l) => sum + l.quantity, 0);

    const delayed = luggage
      .filter((l) => l.status === 'delayed')
      .reduce((sum, l) => sum + l.quantity, 0);

    const inTransit = luggage
      .filter((l) => l.status === 'in-transit')
      .reduce((sum, l) => sum + l.quantity, 0);

    const waiting = luggage
      .filter((l) => l.status === 'waiting' || l.status === 'registered')
      .reduce((sum, l) => sum + l.quantity, 0);

    snapshots.push({
      day,
      date: currentDate,
      delivered,
      delayed,
      inTransit,
      waiting,
      airportStorage: { ...airportStorage },
      flightUsage: { ...dayFlightUsage },
    });
  }

  const totalDelivered = luggage
    .filter((l) => l.status === 'delivered')
    .reduce((sum, l) => sum + l.quantity, 0);

  const totalDelayed = luggage
    .filter((l) => l.status === 'delayed')
    .reduce((sum, l) => sum + l.quantity, 0);

  const totalInTransit = luggage
    .filter((l) => l.status === 'in-transit')
    .reduce((sum, l) => sum + l.quantity, 0);

  const totalWaiting = luggage
    .filter((l) => l.status === 'waiting' || l.status === 'registered')
    .reduce((sum, l) => sum + l.quantity, 0);

  return {
    config,
    totalDelivered,
    totalDelayed,
    totalInTransit,
    totalWaiting,
    snapshots,
    finalLuggage: luggage,
  };
}

export function getAverageDeliveryTimeDays(result: SimulationResult): number {
  const deliveredItems = result.finalLuggage.filter((l) => l.status === 'delivered');
  if (deliveredItems.length === 0) return 0;

  let totalDays = 0;

  for (const item of deliveredItems) {
    const created = new Date(item.createdAt).getTime();
    const delivered = new Date(item.deliveredAt ?? item.createdAt).getTime();
    const diffDays = Math.max(0, (delivered - created) / (1000 * 60 * 60 * 24));
    totalDays += diffDays;
  }

  return Number((totalDays / deliveredItems.length).toFixed(1));
}

export function getLatestStorageUtilization(result: SimulationResult): number {
  const latest = result.snapshots[result.snapshots.length - 1];
  if (!latest) return 0;

  let totalUsed = 0;
  let totalCapacity = 0;

  for (const airport of airports) {
    totalUsed += latest.airportStorage[airport.id] ?? 0;
    totalCapacity += airport.storageCapacity;
  }

  if (totalCapacity === 0) return 0;
  return Math.round((totalUsed / totalCapacity) * 100);
}

export function getLatestFlightUtilization(result: SimulationResult): number {
  const latest = result.snapshots[result.snapshots.length - 1];
  if (!latest) return 0;

  let totalUsed = 0;
  let totalCapacity = 0;

  for (const flight of flights) {
    totalUsed += latest.flightUsage[flight.id] ?? 0;
    totalCapacity += flight.capacity;
  }

  if (totalCapacity === 0) return 0;
  return Math.round((totalUsed / totalCapacity) * 100);
}