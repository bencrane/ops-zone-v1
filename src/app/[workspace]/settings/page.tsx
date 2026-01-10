'use client';

import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspaceNav } from '@/hooks/use-workspace-nav';

export default function SettingsPage() {
  const { workspace, href } = useWorkspaceNav();

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-zinc-400 mt-1">Workspace configuration for {workspace}</p>
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
            <Settings className="h-12 w-12 text-zinc-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Workspace Settings</h2>
          <p className="text-zinc-400 max-w-md">
            Configure workspace-specific settings and preferences.
          </p>
        </div>
      </div>
    </div>
  );
}

