'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Workspace {
  id: number;
  name: string;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const res = await fetch('/api/emailbison/workspaces');
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setWorkspaces(data.data || []);
        }
      } catch {
        setError('Failed to load workspaces');
      } finally {
        setLoading(false);
      }
    }
    fetchWorkspaces();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Workspaces</h1>
          <p className="text-zinc-400 mt-1">Select a workspace to manage</p>
        </div>
        <Link href="/hq/outbound">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-12">{error}</div>
      ) : workspaces.length === 0 ? (
        <div className="text-zinc-500 text-center py-12">No workspaces found</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Link key={workspace.id} href={`/${toSlug(workspace.name)}`}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-white">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{workspace.name}</CardTitle>
                        <CardDescription className="text-zinc-400 font-mono text-xs">
                          /{toSlug(workspace.name)}
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

