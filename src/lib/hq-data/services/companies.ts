/**
 * Companies Service
 *
 * Fetches company firmographics from api.vw_companies view.
 */

import { getHQClient } from '../client';
import type { Company, CompaniesFilters, PaginatedResponse } from '../types';

/**
 * Search companies with optional filters.
 */
export async function searchCompanies(
  filters: CompaniesFilters = {}
): Promise<PaginatedResponse<Company>> {
  const client = getHQClient();

  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };

  // Add optional filters
  if (filters.name) params.name = filters.name;
  if (filters.domain) params.domain = filters.domain;
  if (filters.industry) params.industry = filters.industry;
  if (filters.size_range) params.size_range = filters.size_range;
  if (filters.country) params.country = filters.country;
  if (filters.min_employees) params.min_employees = filters.min_employees;
  if (filters.max_employees) params.max_employees = filters.max_employees;
  if (filters.founded_after) params.founded_after = filters.founded_after;
  if (filters.founded_before) params.founded_before = filters.founded_before;

  return client.get<PaginatedResponse<Company>>('/api/views/companies', { params });
}

/**
 * Get a single company by domain.
 */
export async function getCompanyByDomain(domain: string): Promise<Company | null> {
  const result = await searchCompanies({ domain, limit: 1 });
  return result.data[0] ?? null;
}

