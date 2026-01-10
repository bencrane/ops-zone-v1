"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { spacing, typography, colors, layout } from "@/lib/design-tokens";
import { Eye, Send, Settings, Database, ArrowLeft } from "lucide-react";
import Link from "next/link";

const actionCards = [
  {
    title: "View",
    description: "View accounts, workspaces, email accounts, and campaigns from the API",
    icon: Eye,
    href: "/admin/emailbison/view",
    available: true,
  },
  {
    title: "Send",
    description: "Create and manage campaigns, sequences, and sending",
    icon: Send,
    href: "/admin/emailbison/send",
    available: false,
  },
  {
    title: "Settings",
    description: "Configure email accounts, schedules, and preferences",
    icon: Settings,
    href: "/admin/emailbison/settings",
    available: false,
  },
  {
    title: "Data Sync",
    description: "Sync leads and data between your database and EmailBison",
    icon: Database,
    href: "/admin/emailbison/sync",
    available: false,
  },
];

export default function EmailBisonPage() {
  return (
    <PageContainer>
      <PageHeader
        title="EmailBison"
        subtitle="Manage your cold email campaigns"
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
        <div className={layout.cardsGrid.container}>
          {actionCards.map((card) => (
            <ActionCard key={card.title} {...card} />
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
}

function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  available,
}: {
  title: string;
  description: string;
  icon: typeof Eye;
  href: string;
  available: boolean;
}) {
  const content = (
    <Card
      className={`
        ${colors.bg.card} ${colors.border.default} border
        ${available ? `${colors.bg.cardHover} cursor-pointer transition-colors` : "opacity-50"}
      `}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${available ? "bg-zinc-800" : "bg-zinc-900"}`}>
            <Icon className={`h-5 w-5 ${available ? "text-white" : "text-zinc-600"}`} />
          </div>
          <CardTitle className={typography.cardTitle}>{title}</CardTitle>
          {!available && (
            <span className="text-[10px] uppercase tracking-wider text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">
              Coming Soon
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className={typography.secondary}>{description}</p>
      </CardContent>
    </Card>
  );

  if (!available) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}
