"use client";

import Link from "next/link";
import { Plus, Settings, Mail, Megaphone, BarChart3, ChevronRight, ArrowLeft, UserPlus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

const campaignCards = [
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
    title: "Assign Email Accounts",
    description: "Attach sender email accounts to campaigns",
    icon: UserPlus,
    href: "/admin/campaigns/assign-emails",
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
    icon: BarChart3,
    href: "/campaigns",
  },
  {
    title: "Campaign Management",
    description: "List, pause, resume, and delete campaigns via EmailBison API",
    icon: Megaphone,
    href: "/admin/emailbison/campaigns",
  },
];

export default function CampaignsHubPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Campaigns" 
        subtitle="Create, configure, and manage your email campaigns"
        actions={
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        }
      />
      <PageContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaignCards.map((card) => (
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

