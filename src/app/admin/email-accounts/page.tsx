"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart, Upload, Inbox, ChevronRight, PenLine, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

const emailAccountCards = [
  {
    title: "View Email Accounts",
    description: "See connected email accounts by workspace",
    icon: Mail,
    href: "/admin/email-accounts/view",
  },
  {
    title: "Buy Email Accounts",
    description: "Purchase new email accounts for your campaigns",
    icon: ShoppingCart,
    href: "#",
  },
  {
    title: "Add Email Accounts",
    description: "Import email accounts from CSV",
    icon: Upload,
    href: "/admin/email-accounts/add",
  },
  {
    title: "Add Email Account (Manual)",
    description: "Add a single email account manually",
    icon: PenLine,
    href: "/admin/email-accounts/add-manual",
  },
  {
    title: "Buy Inboxes",
    description: "Purchase additional inboxes for email sending",
    icon: Inbox,
    href: "#",
  },
];

export default function EmailAccountsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Email Accounts"
        subtitle="Manage your sender email accounts and inboxes"
        actions={
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
        }
      />
      <PageContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {emailAccountCards.map((card) => (
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
