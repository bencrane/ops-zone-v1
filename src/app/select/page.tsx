'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Workspace {
  id: number;
  name: string;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function SelectWorkspacePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const res = await fetch('/api/emailbison/workspaces');
        if (!res.ok) {
          throw new Error('Failed to fetch workspaces');
        }
        const data = await res.json();
        const list: Workspace[] = data.data || [];
        setWorkspaces(list);
        setLoading(false);
        
        // Auto-redirect if only one workspace
        if (list.length === 1) {
          router.push(`/${toSlug(list[0].name)}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
    loadWorkspaces();
  }, [router]);
  
  function handleSelect(ws: Workspace) {
    router.push(`/${toSlug(ws.name)}`);
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500">Loading workspaces...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  
  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500">No workspaces found</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Select Workspace</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((ws) => (
          <Card 
            key={ws.id}
            className="cursor-pointer hover:border-zinc-600 transition-colors bg-zinc-900 border-zinc-800"
            onClick={() => handleSelect(ws)}
          >
            <CardHeader>
              <CardTitle className="text-white">{ws.name}</CardTitle>
              <CardDescription className="text-zinc-400 font-mono">/{toSlug(ws.name)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

