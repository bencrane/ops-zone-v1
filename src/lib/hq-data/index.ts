/**
 * HQ Master Data API Client
 *
 * Public API for fetching people and company data from Revenue Infrastructure.
 *
 * Usage:
 *   import { searchPeople, searchCompanies } from '@/lib/hq-data';
 *   const people = await searchPeople({ industry: 'SaaS', limit: 50 });
 *   const companies = await searchCompanies({ size_range: '51-200' });
 */

// Client
export {
  createHQClient,
  getHQClient,
  resetHQClient,
  HQDataError,
  type ClientConfig,
  type RequestOptions,
  type HQDataClient,
} from './client';

// Services
export {
  searchPeople,
  getPerson,
  searchCompanies,
  getCompanyByDomain,
} from './services';

// Types
export type {
  Person,
  PeopleFilters,
  Company,
  CompaniesFilters,
  Pagination,
  PaginatedResponse,
  ApiError,
} from './types';

