'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Terminal, Layers, Loader2, ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
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

interface OutcomeFormData {
  outcome: string;
  nextStep: string;
  notes: string;
  followupSubject: string;
  followupMessage: string;
}

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

// =============================================================================
// COMPONENT
// =============================================================================

export default function MeetingOutcomePage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [context, setContext] = useState<BookingContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const [formData, setFormData] = useState<OutcomeFormData>({
    outcome: '',
    nextStep: '',
    notes: '',
    followupSubject: '',
    followupMessage: '',
  });

  // Fetch booking context
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
        
        // Pre-populate followup subject with booking title
        if (data.booking?.title) {
          setFormData(prev => ({
            ...prev,
            followupSubject: `Following up: ${data.booking.title}`,
          }));
        }
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
    
    if (!formData.outcome || !formData.nextStep) {
      return;
    }

    setSubmissionState('submitting');
    setError(null);

    try {
      const payload = {
        booking_id: bookingId,
        outcome: formData.outcome,
        next_step: formData.nextStep,
        notes: formData.notes || null,
        followup_subject: formData.nextStep === 'send_followup' ? formData.followupSubject || null : null,
        followup_message: formData.nextStep === 'send_followup' ? formData.followupMessage || null : null,
      };

      const res = await fetch('/api/forms/outcome', {
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
      setError(err instanceof Error ? err.message : 'Failed to submit outcome');
      setSubmissionState('error');
    }
  };

  const isFormValid = formData.outcome && formData.nextStep;
  const showFollowupFields = formData.nextStep === 'send_followup';

  // Success state
  if (submissionState === 'success') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="rounded-full bg-green-500/10 p-4 w-fit mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Outcome Recorded</h1>
          <p className="text-zinc-400 mb-6">
            Meeting outcome has been successfully submitted.
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
                  outcome: '',
                  nextStep: '',
                  notes: '',
                  followupSubject: context?.booking?.title ? `Following up: ${context.booking.title}` : '',
                  followupMessage: '',
                });
              }}
              className="text-zinc-400 hover:text-white"
            >
              Record Another Outcome
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
              <Layers className="h-5 w-5 text-zinc-400" />
              <h1 className="text-lg font-semibold">Meeting Outcome</h1>
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
                  {context.booking.person_name} @ {context.booking.company_name}
                </h2>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(context.booking.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span>{context.booking.company_domain}</span>
                </div>
              </div>
              {context.booking.deal_notes && (
                <p className="text-xs text-zinc-500 mt-1">{context.booking.deal_notes}</p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Outcome */}
              <div className="space-y-2">
                <Label htmlFor="outcome" className="text-zinc-300">
                  Outcome <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.outcome}
                  onValueChange={(value) => setFormData({ ...formData, outcome: value })}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                    <SelectValue placeholder="Select meeting outcome" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="attended">Attended - Meeting completed</SelectItem>
                    <SelectItem value="no_show">No Show - Contact didn't attend</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled - Meeting moved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Next Step */}
              <div className="space-y-2">
                <Label htmlFor="nextStep" className="text-zinc-300">
                  Next Step <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.nextStep}
                  onValueChange={(value) => setFormData({ ...formData, nextStep: value })}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                    <SelectValue placeholder="Select next step" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="send_followup">Send Follow-up Email</SelectItem>
                    <SelectItem value="schedule_another">Schedule Another Meeting</SelectItem>
                    <SelectItem value="send_proposal">Send Proposal</SelectItem>
                    <SelectItem value="close_won">Close Won</SelectItem>
                    <SelectItem value="close_lost">Close Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-zinc-300">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Key takeaways, action items, observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-white min-h-[120px] placeholder:text-zinc-600"
                />
              </div>

              {/* Conditional Follow-up Fields */}
              {showFollowupFields && (
                <div className="space-y-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
                  <h3 className="text-sm font-medium text-zinc-300">Follow-up Email</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="followupSubject" className="text-zinc-400 text-sm">Subject</Label>
                    <Input
                      id="followupSubject"
                      placeholder="Email subject..."
                      value={formData.followupSubject}
                      onChange={(e) => setFormData({ ...formData, followupSubject: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="followupMessage" className="text-zinc-400 text-sm">Message</Label>
                    <Textarea
                      id="followupMessage"
                      placeholder="Your followup message to the client..."
                      value={formData.followupMessage}
                      onChange={(e) => setFormData({ ...formData, followupMessage: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-white min-h-[150px] placeholder:text-zinc-600"
                    />
                  </div>
                </div>
              )}

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
                    'Submit Outcome'
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
