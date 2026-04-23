import { airports, flights, type Airport, type Flight } from '../data/mockData';

export function getAirportByIdSafe(id: string): Airport | undefined {
  return airports.find((a) => a.id === id);
}

export function getFlightByRoute(originId: string, destinationId: string): Flight | undefined {
  return flights.find((f) => f.originId === originId && f.destinationId === destinationId);
}

export function isSameContinent(originId: string, destinationId: string): boolean {
  const origin = getAirportByIdSafe(originId);
  const destination = getAirportByIdSafe(destinationId);

  if (!origin || !destination) return false;
  return origin.continent === destination.continent;
}

export function getDeliveryDeadlineDays(originId: string, destinationId: string): number {
  return isSameContinent(originId, destinationId) ? 1 : 2;
}

export function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function isDateAfter(dateA: string, dateB: string): boolean {
  return new Date(dateA).getTime() > new Date(dateB).getTime();
}

export function cloneDeep<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}