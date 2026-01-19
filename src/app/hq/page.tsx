'use client';

import { Send, Layers, Lightbulb } from 'lucide-react';
import { ModuleCard } from '@/components/ui/module-card';

const modules = [
  {
    title: 'Outbound',
    description: 'Email campaigns, inbox, and lead management',
    href: '/hq/outbound',
    icon: Send,
  },
  {
    title: 'Pipeline',
    description: 'Deal tracking and sales pipeline',
    href: '/hq/pipeline',
    icon: Layers,
  },
  {
    title: 'Concepts',
    href: '/hq/concepts',
    icon: Lightbulb,
  },
];

export default function HQPage() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <p className="text-zinc-400">Select a module to get started</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.title}
            title={module.title}
            description={module.description}
            href={module.href}
            icon={module.icon}
          />
        ))}
      </div>
    </div>
  );
}
