import { flights } from '../data/mockData';

const MAJOR_HUBS = ['jfk', 'lhr', 'sin', 'cdg', 'dxb'];

export function findRoute(originId: string, destinationId: string): string[] {
  if (originId === destinationId) {
    return [originId];
  }

  const directFlight = flights.find(
    (f) => f.originId === originId && f.destinationId === destinationId
  );

  if (directFlight) {
    return [originId, destinationId];
  }

  for (const hub of MAJOR_HUBS) {
    if (hub === originId || hub === destinationId) continue;

    const toHub = flights.find(
      (f) => f.originId === originId && f.destinationId === hub
    );
    const fromHub = flights.find(
      (f) => f.originId === hub && f.destinationId === destinationId
    );

    if (toHub && fromHub) {
      return [originId, hub, destinationId];
    }
  }

  // Si no encuentra ruta real, igual devuelve origen-destino
  // para que el engine lo trate como no planificable.
  return [originId, destinationId];
}