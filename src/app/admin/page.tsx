"use client";

import Link from "next/link";
import { Megaphone, Users, LayoutDashboard, Database, ChevronRight, List, Plus, Settings, Mail, Code } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

const adminCards = [
  {
    title: "Command Center",
    description: "Overview and system status",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Access Leads",
    description: "Discover and source new leads for your lists",
    icon: Database,
    href: "/admin/access-leads",
  },
  {
    title: "Eligible Leads",
    description: "View and enroll leads into campaigns",
    icon: Users,
    href: "/leads",
  },
  {
    title: "Lead Lists",
    description: "Manage saved lead lists for campaigns",
    icon: List,
    href: "/admin/lead-lists",
  },
  {
    title: "Create Campaign",
    description: "Start a new email campaign",
    icon: Plus,
    href: "/admin/campaigns/create",
  },
  {
    title: "Configure Campaign",
    description: "Configure send limits, schedules, and sender accounts",
    icon: Settings,
    href: "/admin/campaigns/customize",
  },
  {
    title: "Customize Campaign Messages",
    description: "Edit email sequences, subjects, and message content",
    icon: Mail,
    href: "/admin/campaigns/messages",
  },
  {
    title: "View Campaign Metrics",
    description: "Manage email campaigns and sequences",
    icon: Megaphone,
    href: "/campaigns",
  },
  {
    title: "EmailBison APIs",
    description: "Browse EmailBison API endpoints and documentation",
    icon: Code,
    href: "/admin/api-explorer",
  },
];

export default function AdminPage() {
  return (
    <PageContainer>
      <PageHeader title="Admin" />
      <PageContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminCards.map((card) => (
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
      </PageContent>
    </PageContainer>
  );
}

