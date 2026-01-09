import { getDashboardStats, getCampaigns, getLeads } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Users,
  MousePointerClick,
  MessageSquare,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const campaigns = await getCampaigns();
  const leads = await getLeads();

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const recentLeads = leads
    .sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
    .slice(0, 5);
  const repliedLeads = leads.filter((l) => l.status === "replied").slice(0, 5);

  return (
    <PageContainer>
      <PageHeader
        title="Command Center"
        subtitle="Monitor your outreach operations at a glance."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/leads">
              <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Users className="h-4 w-4" />
                View Leads
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button className="gap-2">
                <Zap className="h-4 w-4" />
                Campaigns
              </Button>
            </Link>
          </div>
        }
      >
        {/* Primary metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-400">Emails Sent Today</p>
                  <p className="text-3xl font-bold text-white">{stats.emails_sent_today}</p>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">+12%</span> vs yesterday
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-400">Active Leads</p>
                  <p className="text-3xl font-bold text-white">{stats.total_leads}</p>
                  <p className="text-xs text-zinc-400">
                    {stats.enrolled_leads} enrolled in campaigns
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-400">Open Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.avg_open_rate}%</p>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">+2.3%</span> this week
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <MousePointerClick className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-400">Reply Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.avg_reply_rate}%</p>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">+0.5%</span> this week
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Active Campaigns */}
            <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Campaigns
            </CardTitle>
            <Link href="/campaigns">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No active campaigns
                </p>
              ) : (
                activeCampaigns.map((campaign, index) => (
                  <div
                    key={campaign.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.stats.enrolled} enrolled · {campaign.stats.sent} sent
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {campaign.stats.sent > 0
                            ? ((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(0)
                            : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Open Rate</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {campaign.stats.sent > 0
                            ? ((campaign.stats.replied / campaign.stats.sent) * 100).toFixed(1)
                            : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Reply Rate</p>
                      </div>
                      <Badge variant="outline" className="border-emerald-400/30 text-emerald-400 bg-emerald-400/5">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

            {/* System Status */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm text-white">Email Engine</span>
                    </div>
                    <Badge variant="outline" className="border-emerald-400/30 text-emerald-400 text-xs">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-sm text-white">Database</span>
                    </div>
                    <Badge variant="outline" className="border-emerald-400/30 text-emerald-400 text-xs">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-sm text-white">EmailBison API</span>
                    </div>
                    <Badge variant="outline" className="border-emerald-400/30 text-emerald-400 text-xs">
                      Connected
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-white">
                    <Clock className="h-4 w-4" />
                    Queue Status
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Pending Emails</span>
                      <span className="font-medium text-white">420</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Processing</span>
                      <span className="font-medium text-white">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Failed (24h)</span>
                      <span className="font-medium text-red-400">3</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Emails This Week</span>
                    <span className="font-bold text-lg text-white">{stats.emails_sent_week}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Replies */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                  <MessageSquare className="h-5 w-5 text-emerald-400" />
                  Recent Replies
                </CardTitle>
                <Link href="/leads?status=replied">
                  <Button variant="ghost" size="sm" className="gap-1 text-zinc-400 hover:text-white">
                    View all
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {repliedLeads.length === 0 ? (
                    <p className="text-zinc-400 text-sm text-center py-4">
                      No replies yet
                    </p>
                  ) : (
                    repliedLeads.map((lead, index) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-medium">
                            {lead.first_name[0]}{lead.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-white">
                              {lead.first_name} {lead.last_name}
                            </p>
                            <p className="text-xs text-zinc-400">{lead.company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-emerald-400/30 text-emerald-400 bg-emerald-400/5 text-xs">
                            Replied
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recently Added Leads */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                  <Users className="h-5 w-5" />
                  Recently Added
                </CardTitle>
                <Link href="/leads">
                  <Button variant="ghost" size="sm" className="gap-1 text-zinc-400 hover:text-white">
                    View all
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLeads.map((lead, index) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-medium text-white">
                          {lead.first_name[0]}{lead.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-white">
                            {lead.first_name} {lead.last_name}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {lead.company} · {lead.position}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {lead.campaigns.length > 0 ? (
                          <Badge variant="secondary" className="text-xs bg-zinc-800 text-white">
                            {lead.campaigns.length} campaign{lead.campaigns.length > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
                            Not enrolled
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}
