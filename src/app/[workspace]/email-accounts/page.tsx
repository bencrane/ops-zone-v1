'use client';

import Link from 'next/link';
import { ArrowLeft, Settings, Eye, Plus, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkspaceNav } from '@/hooks/use-workspace-nav';

export default function EmailAccountsPage() {
  const { href } = useWorkspaceNav();

  const cards = [
    {
      title: 'View Email Accounts',
      description: 'See all connected sender email accounts',
      icon: Eye,
      href: href('/email-accounts/view'),
    },
    {
      title: 'Email Account Settings',
      description: 'Configure sender names, signatures, and daily limits',
      icon: Settings,
      href: href('/email-accounts/settings'),
    },
    {
      title: 'Add Email Account',
      description: 'Connect a new sender email account',
      icon: Plus,
      href: href('/email-accounts/add'),
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Email Accounts</h1>
            <p className="text-zinc-400 mt-1">Manage your sender email accounts</p>
          </div>
          <Link href={href('/')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black">
                        <card.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{card.title}</CardTitle>
                        <CardDescription className="text-zinc-400">
                          {card.description}
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
      </div>
    </div>
  );
}

