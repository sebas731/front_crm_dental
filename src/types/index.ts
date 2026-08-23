/**
 * Shared TypeScript types for the dental CRM.
 *
 * Business entity types (Patient, Appointment, ClinicalRecord, …) go here
 * as you build them. Only generic, cross-cutting types below for now.
 */

/** Shape of DRF's PageNumberPagination responses. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
