/**
 * HQ Companies API Route
 *
 * Proxies requests to the HQ Master Data API companies endpoint.
 * GET /api/hq/companies
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchCompanies, HQDataError } from '@/lib/hq-data';
import type { CompaniesFilters } from '@/lib/hq-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build filters from query params
    const filters: CompaniesFilters = {};

    const limit = searchParams.get('limit');
    if (limit) filters.limit = parseInt(limit, 10);

    const offset = searchParams.get('offset');
    if (offset) filters.offset = parseInt(offset, 10);

    const name = searchParams.get('name');
    if (name) filters.name = name;

    const domain = searchParams.get('domain');
    if (domain) filters.domain = domain;

    const industry = searchParams.get('industry');
    if (industry) filters.industry = industry;

    const size_range = searchParams.get('size_range');
    if (size_range) filters.size_range = size_range;

    const country = searchParams.get('country');
    if (country) filters.country = country;

    const min_employees = searchParams.get('min_employees');
    if (min_employees) filters.min_employees = parseInt(min_employees, 10);

    const max_employees = searchParams.get('max_employees');
    if (max_employees) filters.max_employees = parseInt(max_employees, 10);

    const founded_after = searchParams.get('founded_after');
    if (founded_after) filters.founded_after = parseInt(founded_after, 10);

    const founded_before = searchParams.get('founded_before');
    if (founded_before) filters.founded_before = parseInt(founded_before, 10);

    const result = await searchCompanies(filters);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[API /hq/companies] Error:', error);

    if (error instanceof HQDataError) {
      return NextResponse.json(
        { error: { code: 'UPSTREAM_ERROR', message: error.message } },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

