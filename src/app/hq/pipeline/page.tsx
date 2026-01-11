'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal, Layers, Loader2, RefreshCw, Calendar, ExternalLink, ClipboardCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// =============================================================================
// TYPES - Matches Modal Deals API response
// =============================================================================

interface Deal {
  id: string;
  status: 'active' | 'cancelled' | 'won' | 'lost';
  stage: 'booked' | 'met' | 'proposal' | 'negotiation' | 'closed';
  notes: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  company_id: string;
  company_name: string;
  company_domain: string;
  contact_id: string;
  contact_name: string;
  contact_email: string;
  booking_id: string | null;
  booking_title: string | null;
  booking_start: string | null;
  booking_end: string | null;
  booking_status: 'ACCEPTED' | 'CANCELLED' | 'PENDING' | null;
  booking_attended: boolean | null;
  booking_video_url: string | null;
}

interface PipelineResponse {
  data: Deal[];
  pagination?: {
    total: number;
    hasMore: boolean;
  };
}

// =============================================================================
// STAGE & STATUS COLORS
// =============================================================================

const STAGE_COLORS: Record<string, string> = {
  'booked': 'bg-blue-900/80 text-blue-200 border-blue-700',
  'met': 'bg-emerald-900/80 text-emerald-200 border-emerald-700',
  'proposal': 'bg-amber-900/80 text-amber-200 border-amber-700',
  'negotiation': 'bg-orange-900/80 text-orange-200 border-orange-700',
  'closed': 'bg-green-900/80 text-green-200 border-green-700',
};

const STATUS_COLORS: Record<string, string> = {
  'active': 'bg-zinc-800 text-zinc-300',
  'cancelled': 'bg-red-950 text-red-300',
  'won': 'bg-green-950 text-green-300',
  'lost': 'bg-zinc-900 text-zinc-500',
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
  'ACCEPTED': 'text-emerald-400',
  'CANCELLED': 'text-red-400',
  'PENDING': 'text-yellow-400',
};

// =============================================================================
// FORMAT HELPERS
// =============================================================================

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string | null>(null);

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (stageFilter) params.set('stage', stageFilter);
      
      const queryString = params.toString();
      const url = queryString ? `/api/hq/pipeline?${queryString}` : '/api/hq/pipeline';
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch pipeline: ${res.status}`);
      }
      
      const json: PipelineResponse = await res.json();
      setDeals(json.data || []);
      setTotal(json.pagination?.total || json.data?.length || 0);
    } catch (err) {
      console.error('Pipeline fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [statusFilter, stageFilter]);

  // Group deals by stage for summary
  const stageCounts = deals.reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/hq"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
              title="Back to HQ"
            >
              <Terminal className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-zinc-400" />
              <h1 className="text-lg font-semibold">Pipeline</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-400">
              <span className="text-white font-medium">{total}</span> deals
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDeals}
              disabled={loading}
              className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Stage:</span>
            <div className="flex gap-1">
              {['booked', 'met', 'proposal'].map((stage) => (
                <button
                  key={stage}
                  onClick={() => setStageFilter(stageFilter === stage ? null : stage)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    stageFilter === stage 
                      ? STAGE_COLORS[stage] 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {stage} {stageCounts[stage] ? `(${stageCounts[stage]})` : ''}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Status:</span>
            <div className="flex gap-1">
              {['active', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    statusFilter === status 
                      ? STATUS_COLORS[status] 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          {(statusFilter || stageFilter) && (
            <button
              onClick={() => { setStatusFilter(null); setStageFilter(null); }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {error ? (
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={fetchDeals}
              className="border-red-800 text-red-400 hover:bg-red-950"
            >
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : deals.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <Layers className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">No deals found</h3>
            <p className="text-zinc-500">
              {statusFilter || stageFilter ? 'Try adjusting your filters.' : 'Pipeline is empty.'}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-medium">Company</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Contact</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Stage</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Meeting</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Status</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Notes</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow 
                    key={deal.id}
                    className="border-zinc-800/50 hover:bg-zinc-900/50 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{deal.company_name}</div>
                        <div className="text-xs text-zinc-500">{deal.company_domain}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-zinc-300">{deal.contact_name}</div>
                        <div className="text-xs text-zinc-500">{deal.contact_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${STAGE_COLORS[deal.stage] || 'bg-zinc-800'} border`}>
                        {deal.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {deal.booking_start ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          <div>
                            <div className={`text-sm ${BOOKING_STATUS_COLORS[deal.booking_status || ''] || 'text-zinc-300'}`}>
                              {formatDateTime(deal.booking_start)}
                            </div>
                            {deal.booking_attended && (
                              <div className="text-xs text-emerald-500">✓ Attended</div>
                            )}
                          </div>
                          {deal.booking_video_url && (
                            <a 
                              href={deal.booking_video_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-zinc-500 hover:text-white"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[deal.status]}`}>
                        {deal.status}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="text-zinc-400 text-sm truncate block">
                        {deal.notes || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {deal.booking_id && (
                          <>
                            <Link
                              href={`/hq/pipeline/outcome/${deal.booking_id}`}
                              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                              title="Record meeting outcome"
                            >
                              <ClipboardCheck className="h-3 w-3" />
                              Outcome
                            </Link>
                            <Link
                              href={`/hq/pipeline/proposal/${deal.booking_id}`}
                              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                              title="Generate proposal"
                            >
                              <FileText className="h-3 w-3" />
                              Proposal
                            </Link>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
