/**
 * HQ People API Route
 *
 * Proxies requests to the HQ Master Data API people endpoint.
 * GET /api/hq/people
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchPeople, HQDataError } from '@/lib/hq-data';
import type { PeopleFilters } from '@/lib/hq-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build filters from query params
    const filters: PeopleFilters = {};

    const limit = searchParams.get('limit');
    if (limit) filters.limit = parseInt(limit, 10);

    const offset = searchParams.get('offset');
    if (offset) filters.offset = parseInt(offset, 10);

    const name = searchParams.get('name');
    if (name) filters.name = name;

    const job_title = searchParams.get('job_title');
    if (job_title) filters.job_title = job_title;

    const company_name = searchParams.get('company_name');
    if (company_name) filters.company_name = company_name;

    const company_domain = searchParams.get('company_domain');
    if (company_domain) filters.company_domain = company_domain;

    const industry = searchParams.get('industry');
    if (industry) filters.industry = industry;

    const size_range = searchParams.get('size_range');
    if (size_range) filters.size_range = size_range;

    const location = searchParams.get('location');
    if (location) filters.location = location;

    const country = searchParams.get('country');
    if (country) filters.country = country;

    const result = await searchPeople(filters);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[API /hq/people] Error:', error);

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

