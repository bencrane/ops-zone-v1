'use client';

import Link from 'next/link';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ModuleCardProps {
  title: string;
  description?: string;
  href: string;
  icon: LucideIcon;
}

export function ModuleCard({ title, description, href, icon: Icon }: ModuleCardProps) {
  return (
    <Link href={href}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group h-full">
        <CardHeader className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-black shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-white text-base font-semibold">{title}</CardTitle>
                {description && (
                  <CardDescription className="text-zinc-400 text-sm leading-relaxed">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-4" />
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
