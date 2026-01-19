'use client';

import { useParams, notFound } from 'next/navigation';
import { ProposalForm } from '@/components/forms';

// Concept configuration
const CONCEPTS: Record<string, { name: string; color: string }> = {
  'revenue-engineer': { name: 'Revenue Engineer', color: 'text-green-500' },
  'revenue-activation': { name: 'Revenue Activation', color: 'text-green-500' },
  'everything-automation': { name: 'Everything Automation', color: 'text-green-500' },
  'outbound-solutions': { name: 'Outbound Solutions', color: 'text-green-500' },
};

export default function ConceptProposalPage() {
  const params = useParams();
  const conceptSlug = params.concept as string;
  const bookingId = params.bookingId as string;

  const conceptConfig = CONCEPTS[conceptSlug];

  if (!conceptConfig) {
    notFound();
  }

  return (
    <ProposalForm
      bookingId={bookingId}
      concept={conceptConfig.name}
      conceptColor={conceptConfig.color}
      backHref="/hq/concepts"
      backLabel="Back to Concepts"
    />
  );
}
