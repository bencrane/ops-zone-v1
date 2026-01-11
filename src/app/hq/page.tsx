'use client';

import Link from 'next/link';
import { Send, ChevronRight, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HQPage() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <p className="text-zinc-400">Select a module to get started</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/hq/outbound">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Outbound</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Email campaigns, inbox, and lead management
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/hq/pipeline">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Pipeline</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Deal tracking and sales pipeline
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

