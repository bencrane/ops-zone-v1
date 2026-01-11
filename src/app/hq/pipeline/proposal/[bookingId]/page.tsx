'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Terminal, FileText, Loader2, ArrowLeft, DollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// =============================================================================
// TYPES
// =============================================================================

interface BookingContext {
  booking: {
    id: string;
    calcom_uid: string;
    title: string;
    event_type: string;
    start_time: string;
    end_time: string;
    status: string;
    attended: boolean;
    video_url: string | null;
    location: string;
    person_id: string;
    person_name: string;
    person_email: string;
    person_phone: string | null;
    company_id: string;
    company_name: string;
    company_domain: string;
    deal_id: string;
    deal_status: string;
    deal_stage: string;
    deal_notes: string | null;
  };
}

interface ProposalFormData {
  proposalType: string;
  monthlyValue: string;
  paymentType: string;
  scopeSummary: string;
  specialTerms: string;
}

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function ProposalGenerationPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [context, setContext] = useState<BookingContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProposalFormData>({
    proposalType: '',
    monthlyValue: '',
    paymentType: 'one_time', // Default to one_time
    scopeSummary: '',
    specialTerms: '',
  });

  useEffect(() => {
    async function fetchContext() {
      try {
        const res = await fetch(`/api/hq/bookings/${bookingId}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Booking not found');
          }
          throw new Error(`Failed to fetch booking: ${res.status}`);
        }

        const data = await res.json();
        setContext(data);
      } catch (err) {
        console.error('Error fetching booking context:', err);
        setError(err instanceof Error ? err.message : 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      fetchContext();
    }
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setSubmissionState('submitting');
    setError(null);

    try {
      const payload = {
        booking_id: bookingId,
        proposal_type: formData.proposalType,
        monthly_value: parseFloat(formData.monthlyValue),
        payment_type: formData.paymentType,
        scope_summary: formData.scopeSummary,
        special_terms: formData.specialTerms || null,
      };

      const res = await fetch('/api/forms/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || errorData.error?.details || 'Submission failed');
      }

      const result = await res.json();
      setSubmissionId(result.submission_id);
      setSubmissionState('success');
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit proposal');
      setSubmissionState('error');
    }
  };

  const isFormValid = formData.proposalType && formData.monthlyValue && formData.paymentType && formData.scopeSummary;

  // Success state
  if (submissionState === 'success') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="rounded-full bg-green-500/10 p-4 w-fit mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Proposal Submitted</h1>
          <p className="text-zinc-400 mb-6">
            Your proposal has been successfully submitted.
            {submissionId && (
              <span className="block text-xs text-zinc-600 mt-2">
                Submission ID: {submissionId}
              </span>
            )}
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/hq/pipeline">
              <Button className="w-full bg-white text-black hover:bg-zinc-200">
                Return to Pipeline
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                setSubmissionState('idle');
                setFormData({
                  proposalType: '',
                  monthlyValue: '',
                  paymentType: 'one_time',
                  scopeSummary: '',
                  specialTerms: '',
                });
              }}
              className="text-zinc-400 hover:text-white"
            >
              Create Another Proposal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/hq"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
              title="Back to HQ"
            >
              <Terminal className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-zinc-400" />
              <h1 className="text-lg font-semibold">Generate Proposal</h1>
            </div>
          </div>
          
          <Link href="/hq/pipeline">
            <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Pipeline
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : error && submissionState !== 'error' ? (
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Link href="/hq/pipeline">
              <Button variant="outline" className="border-red-800 text-red-400 hover:bg-red-950">
                Back to Pipeline
              </Button>
            </Link>
          </div>
        ) : context ? (
          <div className="space-y-8">
            {/* Context Header */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-medium">
                  Proposal for {context.booking.company_name}
                </h2>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>{context.booking.person_name}</span>
                  <span>{context.booking.company_domain}</span>
                  <span>{context.booking.deal_stage}</span>
                </div>
              </div>
              {context.booking.deal_notes && (
                <p className="text-xs text-zinc-500 mt-1">{context.booking.deal_notes}</p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Proposal Type */}
              <div className="space-y-2">
                <Label htmlFor="proposalType" className="text-zinc-300">
                  Proposal Type <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.proposalType}
                  onValueChange={(value) => setFormData({ ...formData, proposalType: value })}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                    <SelectValue placeholder="Select proposal type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="standard">Standard — Monthly retainer</SelectItem>
                    <SelectItem value="custom">Custom — Tailored scope</SelectItem>
                    <SelectItem value="enterprise">Enterprise — Full engagement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Monthly Value + Payment Type (grouped) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Monthly Value */}
                <div className="space-y-2">
                  <Label htmlFor="monthlyValue" className="text-zinc-300">
                    Value <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="monthlyValue"
                      type="number"
                      placeholder="10000"
                      value={formData.monthlyValue}
                      onChange={(e) => setFormData({ ...formData, monthlyValue: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-white pl-10 placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Payment Type */}
                <div className="space-y-2">
                  <Label htmlFor="paymentType" className="text-zinc-300">
                    Payment Type <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.paymentType}
                    onValueChange={(value) => setFormData({ ...formData, paymentType: value })}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="one_time">One-Time Payment</SelectItem>
                      <SelectItem value="monthly">Monthly Subscription</SelectItem>
                      <SelectItem value="quarterly">Quarterly Subscription</SelectItem>
                      <SelectItem value="annual">Annual Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Value summary */}
              {formData.monthlyValue && (
                <p className="text-xs text-zinc-500 -mt-4">
                  {formData.paymentType === 'one_time' && `${formatCurrency(formData.monthlyValue)} one-time`}
                  {formData.paymentType === 'monthly' && `${formatCurrency(formData.monthlyValue)}/month · ${formatCurrency((parseFloat(formData.monthlyValue) * 12).toString())}/year`}
                  {formData.paymentType === 'quarterly' && `${formatCurrency(formData.monthlyValue)}/quarter · ${formatCurrency((parseFloat(formData.monthlyValue) * 4).toString())}/year`}
                  {formData.paymentType === 'annual' && `${formatCurrency(formData.monthlyValue)}/year`}
                </p>
              )}

              {/* Scope Summary */}
              <div className="space-y-2">
                <Label htmlFor="scopeSummary" className="text-zinc-300">
                  Scope Summary <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="scopeSummary"
                  placeholder="Describe the deliverables, services, and expected outcomes..."
                  value={formData.scopeSummary}
                  onChange={(e) => setFormData({ ...formData, scopeSummary: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-white min-h-[150px] placeholder:text-zinc-600"
                />
              </div>

              {/* Special Terms */}
              <div className="space-y-2">
                <Label htmlFor="specialTerms" className="text-zinc-300">
                  Special Terms <span className="text-zinc-500">(optional)</span>
                </Label>
                <Textarea
                  id="specialTerms"
                  placeholder="Payment terms, exclusivity clauses, pilot period, etc..."
                  value={formData.specialTerms}
                  onChange={(e) => setFormData({ ...formData, specialTerms: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-white min-h-[100px] placeholder:text-zinc-600"
                />
              </div>

              {/* Error State */}
              {submissionState === 'error' && (
                <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
                  <p className="text-red-400 text-sm">{error || 'Submission failed. Please try again.'}</p>
                </div>
              )}

              {/* Submit */}
              <div className="pt-4 border-t border-zinc-800">
                <Button
                  type="submit"
                  disabled={!isFormValid || submissionState === 'submitting'}
                  className="w-full bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  {submissionState === 'submitting' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Generate Proposal'
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </main>
    </div>
  );
}
