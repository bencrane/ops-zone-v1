/**
 * People Service
 *
 * Fetches people profiles from api.vw_people view.
 */

import { getHQClient } from '../client';
import type { Person, PeopleFilters, PaginatedResponse } from '../types';

/**
 * Search people with optional filters.
 */
export async function searchPeople(
  filters: PeopleFilters = {}
): Promise<PaginatedResponse<Person>> {
  const client = getHQClient();

  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };

  // Add optional filters
  if (filters.name) params.name = filters.name;
  if (filters.job_title) params.job_title = filters.job_title;
  if (filters.company_name) params.company_name = filters.company_name;
  if (filters.company_domain) params.company_domain = filters.company_domain;
  if (filters.industry) params.industry = filters.industry;
  if (filters.size_range) params.size_range = filters.size_range;
  if (filters.location) params.location = filters.location;
  if (filters.country) params.country = filters.country;

  return client.get<PaginatedResponse<Person>>('/api/views/people', { params });
}

/**
 * Get a single person by ID.
 * Note: This filters the list endpoint - no dedicated single-record endpoint.
 */
export async function getPerson(id: string): Promise<Person | null> {
  // For now, we don't have a single-record endpoint
  // This would need to be added to the API if needed
  console.warn('getPerson not implemented - API needs single-record endpoint');
  return null;
}

