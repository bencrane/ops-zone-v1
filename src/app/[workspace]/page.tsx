'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Megaphone, 
  Users, 
  Database, 
  ChevronRight, 
  List, 
  Mail, 
  Sparkles, 
  Settings, 
  Inbox,
  ArrowLeftRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function WorkspaceDashboard() {
  const params = useParams();
  const workspace = params.workspace as string;
  
  const navCards = [
    {
      title: 'Inbox',
      description: 'View and respond to email replies',
      icon: Inbox,
      href: `/${workspace}/inbox`,
    },
    {
      title: 'Campaigns',
      description: 'Create, configure, and manage email campaigns',
      icon: Megaphone,
      href: `/${workspace}/campaigns`,
    },
    {
      title: 'Email Accounts',
      description: 'Manage sender email accounts and settings',
      icon: Mail,
      href: `/${workspace}/email-accounts`,
    },
    {
      title: 'Email Account Settings',
      description: 'Configure sender names, signatures, and daily limits',
      icon: Settings,
      href: `/${workspace}/email-accounts/settings`,
    },
    {
      title: 'Access Leads',
      description: 'Discover and source new leads for your lists',
      icon: Database,
      href: `/${workspace}/access-leads`,
    },
    {
      title: 'Lead Lists',
      description: 'Manage saved lead lists for campaigns',
      icon: List,
      href: `/${workspace}/lead-lists`,
    },
    {
      title: 'Leads',
      description: 'View and enroll leads into campaigns',
      icon: Users,
      href: `/${workspace}/leads`,
    },
    {
      title: 'Enrich for Emails',
      description: 'Find and verify email addresses for leads',
      icon: Sparkles,
      href: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white capitalize">{workspace}</h1>
            <p className="text-zinc-400 mt-1">Workspace dashboard</p>
          </div>
          <Link 
            href="/select"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Switch workspace
          </Link>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {navCards.map((card) => (
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
