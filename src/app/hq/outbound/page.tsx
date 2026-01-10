'use client';

import Link from 'next/link';
import { ArrowLeft, Building2, Settings, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OutboundPage() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Outbound</h1>
          <p className="text-zinc-400 mt-1">Email campaigns and lead management</p>
        </div>
        <Link href="/hq">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/hq/outbound/workspaces">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Workspaces</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Access workspace dashboards
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Admin</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Legacy admin interface
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

