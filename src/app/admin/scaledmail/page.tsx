"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Package, ShoppingBag, Inbox, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

const scaledMailCards = [
  {
    title: "Domain",
    description: "Manage your email sending domains",
    icon: Globe,
    href: "#",
  },
  {
    title: "Package",
    description: "View and manage your ScaledMail packages",
    icon: Package,
    href: "#",
  },
  {
    title: "Order",
    description: "Place and track orders for email infrastructure",
    icon: ShoppingBag,
    href: "#",
  },
  {
    title: "Mailboxes",
    description: "Manage your mailboxes and inbox settings",
    icon: Inbox,
    href: "#",
  },
];

export default function ScaledMailPage() {
  return (
    <PageContainer>
      <PageHeader
        title="ScaledMail"
        subtitle="Manage your email infrastructure and sending resources"
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
          {scaledMailCards.map((card) => (
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
