'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Inbox, Megaphone, Mail, Users, Settings } from 'lucide-react';

export default function WorkspaceDashboard() {
  const params = useParams();
  const workspace = params.workspace as string;
  
  const navItems = [
    {
      title: 'Inbox',
      description: 'View and respond to email replies',
      icon: Inbox,
      href: `/${workspace}/inbox`,
      color: 'text-emerald-400',
    },
    {
      title: 'Campaigns',
      description: 'Manage your email campaigns',
      icon: Megaphone,
      href: `/${workspace}/campaigns`,
      color: 'text-blue-400',
    },
    {
      title: 'Email Accounts',
      description: 'Configure sender email accounts',
      icon: Mail,
      href: `/${workspace}/email-accounts`,
      color: 'text-purple-400',
    },
    {
      title: 'Leads',
      description: 'View and manage your leads',
      icon: Users,
      href: `/${workspace}/leads`,
      color: 'text-cyan-400',
    },
    {
      title: 'Settings',
      description: 'Workspace settings and configuration',
      icon: Settings,
      href: `/${workspace}/settings`,
      color: 'text-zinc-400',
    },
  ];
  
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{workspace}</h1>
          <p className="text-zinc-400 mt-1">Workspace dashboard</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="cursor-pointer hover:border-zinc-600 transition-colors bg-zinc-900 border-zinc-800 h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-zinc-800 ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{item.title}</CardTitle>
                      <CardDescription className="text-zinc-400">{item.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
          <p className="text-zinc-500 text-sm">
            Current workspace: <span className="text-white font-mono">/{workspace}</span>
          </p>
          <Link href="/select" className="text-zinc-400 text-sm hover:text-white transition-colors">
            Switch workspace →
          </Link>
        </div>
      </div>
    </div>
  );
}

