"use client";

import Link from "next/link";
import { Megaphone, Users, LayoutDashboard, Database, ChevronRight, List, Code, Zap, Building2, Mail, Send, Sparkles, Settings, FlaskConical } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

const adminCards = [
  {
    title: "Workspace Selection",
    description: "Choose which EmailBison workspace to work in",
    icon: Building2,
    href: "/admin/workspace",
  },
  {
    title: "Command Center",
    description: "Overview and system status",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Lead View Test",
    description: "Debug API connectivity to HQ Data",
    icon: FlaskConical,
    href: "/admin/lead-view-test",
  },
  {
    title: "Access Leads",
    description: "Discover and source new leads for your lists",
    icon: Database,
    href: "/admin/access-leads",
  },
  {
    title: "Enrich for Emails",
    description: "Find and verify email addresses for leads",
    icon: Sparkles,
    href: "#",
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
    title: "Campaigns",
    description: "Create, configure, and manage email campaigns",
    icon: Megaphone,
    href: "/admin/campaigns-hub",
  },
  {
    title: "Email Accounts",
    description: "Manage sender email accounts and settings",
    icon: Mail,
    href: "/admin/email-accounts",
  },
  {
    title: "Email Account Settings",
    description: "Configure sender names, signatures, and daily limits",
    icon: Settings,
    href: "/admin/email-accounts/settings",
  },
  {
    title: "EmailBison APIs",
    description: "Browse EmailBison API endpoints and documentation",
    icon: Code,
    href: "/admin/api-explorer",
  },
  {
    title: "EmailBison",
    description: "EmailBison integration and settings",
    icon: Zap,
    href: "/admin/emailbison",
  },
  {
    title: "ScaledMail",
    description: "Manage domains, packages, orders, and mailboxes",
    icon: Send,
    href: "/admin/scaledmail",
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

