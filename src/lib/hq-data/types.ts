/**
 * HQ Master Data API Types
 *
 * Types for the Revenue Infrastructure API views.
 * Base URL: https://api.revenueinfra.com
 */

// =============================================================================
// PAGINATION
// =============================================================================

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// =============================================================================
// PEOPLE (api.vw_people)
// =============================================================================

export interface Person {
  id: string;
  linkedin_url: string | null;
  linkedin_slug: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  initials: string | null;
  picture_url: string | null;
  job_title: string | null;
  headline: string | null;
  company_name: string | null;
  company_domain: string | null;
  company_linkedin_url: string | null;
  country: string | null;
  location_name: string | null;
  work_locality: string | null;
  is_current_role: boolean | null;
  industry: string | null;
  size_range: string | null;
  employee_count: number | null;
  company_country: string | null;
  connections: number | null;
  followers: number | null;
  source_last_refresh: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PeopleFilters {
  limit?: number;
  offset?: number;
  name?: string;
  job_title?: string;
  company_name?: string;
  company_domain?: string;
  industry?: string;
  size_range?: string;
  location?: string;
  country?: string;
}

// =============================================================================
// COMPANIES (api.vw_companies)
// =============================================================================

export interface Company {
  id: string;
  domain: string | null;
  linkedin_url: string | null;
  linkedin_slug: string | null;
  name: string | null;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  company_type: string | null;
  industry: string | null;
  founded_year: number | null;
  size_range: string | null;
  employee_count: number | null;
  country: string | null;
  locality: string | null;
  primary_location: Record<string, unknown> | null;
  linkedin_followers: number | null;
  specialties: string[] | null;
  source_last_refresh: string | null;
  created_at: string | null;
}

export interface CompaniesFilters {
  limit?: number;
  offset?: number;
  name?: string;
  domain?: string;
  industry?: string;
  size_range?: string;
  country?: string;
  min_employees?: number;
  max_employees?: number;
  founded_after?: number;
  founded_before?: number;
}

// =============================================================================
// API ERROR
// =============================================================================

export interface ApiError {
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
    message: string;
    details?: Record<string, unknown>;
  };
}

