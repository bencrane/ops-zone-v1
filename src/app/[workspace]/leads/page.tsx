'use client';

import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspaceNav } from '@/hooks/use-workspace-nav';

export default function LeadsPage() {
  const { href } = useWorkspaceNav();

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Leads</h1>
            <p className="text-zinc-400 mt-1">View and manage your leads</p>
          </div>
          <Link href={href('/')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 rounded-full bg-zinc-900 mb-4">
            <Users className="h-12 w-12 text-zinc-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Leads Management</h2>
          <p className="text-zinc-400 max-w-md">
            View leads enrolled in campaigns and manage their status.
          </p>
        </div>
      </div>
    </div>
  );
}

