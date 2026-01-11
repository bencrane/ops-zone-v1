'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Layers, Loader2, RefreshCw, Calendar, ExternalLink, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// =============================================================================
// TYPES
// =============================================================================

interface Deal {
  id: string;
  status: string;
  stage: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  company_name: string;
  company_domain: string;
  contact_name: string;
  contact_email: string;
  booking_id: string | null;
  booking_title: string | null;
  booking_start: string | null;
  booking_status: string | null;
  booking_attended: boolean | null;
  booking_video_url: string | null;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateString: string | null): string {
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

export default function WorkstreamPipelinePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hq/pipeline');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setDeals(result.data);
    } catch (err) {
      console.error('Pipeline fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-zinc-400" />
            <h1 className="text-lg font-semibold">Pipeline</h1>
            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
              {slug}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDeals}
            disabled={loading}
            className="gap-2 text-zinc-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading && deals.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-6 text-center">
            <p className="text-red-400">{error}</p>
            <Button
              variant="outline"
              onClick={fetchDeals}
              className="mt-4 border-red-800 text-red-400 hover:bg-red-950"
            >
              Retry
            </Button>
          </div>
        ) : deals.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <Layers className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No deals in pipeline</p>
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
                  <TableHead className="text-zinc-400 font-medium text-center">Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id} className="border-zinc-800 hover:bg-zinc-900/50">
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
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          deal.stage === 'proposal'
                            ? 'border-blue-800 text-blue-400'
                            : deal.stage === 'met'
                            ? 'border-green-800 text-green-400'
                            : 'border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {deal.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        <div>
                          <div className="text-sm text-zinc-300">{formatDate(deal.booking_start)}</div>
                          {deal.booking_attended && (
                            <div className="text-xs text-green-500">✓ Attended</div>
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
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${deal.status === 'active' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {deal.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {deal.booking_id ? (
                        <Link
                          href={`/admin/workstreams/${slug}/meeting-outcome/${deal.booking_id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                        >
                          <ClipboardCheck className="h-3.5 w-3.5" />
                          Record Outcome
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-600">No booking</span>
                      )}
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

