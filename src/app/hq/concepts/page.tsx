'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const concepts = [
  { name: 'Revenue Engineer', slug: 'revenue-engineer', email: 'team@revenueengineer.com' },
  { name: 'Revenue Activation', slug: 'revenue-activation', email: 'team@revenueactivation.com' },
  { name: 'Everything Automation', slug: 'everything-automation', email: 'team@everythingautomation.com' },
  { name: 'Outbound Solutions', slug: 'outbound-solutions', email: 'team@outboundsolutions.com' },
];

export default function ConceptsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Concepts</h1>
      </div>

      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium">Concept</TableHead>
              <TableHead className="text-zinc-400 font-medium">Organizer Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {concepts.map((concept) => (
              <TableRow key={concept.slug} className="border-zinc-800 hover:bg-zinc-900/50">
                <TableCell className="text-zinc-200">{concept.name}</TableCell>
                <TableCell className="text-green-500">{concept.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
