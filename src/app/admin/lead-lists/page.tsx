"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, Calendar, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import { LeadList } from "@/types";
import { getLeadLists } from "@/lib/data";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LeadListsPage() {
  const [lists, setLists] = useState<LeadList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLists() {
      setLoading(true);
      const data = await getLeadLists();
      setLists(data);
      setLoading(false);
    }
    fetchLists();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Lead Lists"
        subtitle="Saved segments of leads for targeted campaigns."
        actions={
          <div className="flex items-center gap-2">
            <Button className="gap-2 bg-white text-black hover:bg-zinc-200">
              <Plus className="h-4 w-4" />
              New List
            </Button>
            <Link href="/admin">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Button>
            </Link>
          </div>
        }
      />
      <PageContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-zinc-400">Loading lists...</div>
          </div>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No lead lists yet</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Create your first list to organize leads for campaigns.
            </p>
            <Button className="gap-2 bg-white text-black hover:bg-zinc-200">
              <Plus className="h-4 w-4" />
              Create List
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <Link key={list.id} href={`/admin/lead-lists/${list.id}`}>
                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-white text-base truncate">
                          {list.name}
                        </CardTitle>
                        {list.description && (
                          <CardDescription className="text-zinc-400 text-sm mt-1 line-clamp-2">
                            {list.description}
                          </CardDescription>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-2" />
                    </div>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-zinc-800">
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {list.lead_count.toLocaleString()} leads
                      </Badge>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated {formatDate(list.updated_at)}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
}

