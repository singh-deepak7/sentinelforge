import { incidents } from "../data/incidents.js";

export function getIncident(incidentId: string) {
  return incidents.find((incident) => incident.id === incidentId) ?? null;
}