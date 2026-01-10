"use client";

import { useEffect, useState } from "react";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { spacing, typography, colors } from "@/lib/design-tokens";
import { ArrowLeft, RefreshCw, User, Building2, Mail, Megaphone, AlertCircle, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface DataSection<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

export default function EmailBisonViewPage() {
  const [account, setAccount] = useState<DataSection<unknown>>({ loading: true, error: null, data: null });
  const [workspaces, setWorkspaces] = useState<DataSection<unknown[]>>({ loading: true, error: null, data: null });
  const [emailAccounts, setEmailAccounts] = useState<DataSection<unknown[]>>({ loading: true, error: null, data: null });
  const [campaigns, setCampaigns] = useState<DataSection<unknown[]>>({ loading: true, error: null, data: null });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchAll() {
      // Reset states
      setAccount({ loading: true, error: null, data: null });
      setWorkspaces({ loading: true, error: null, data: null });
      setEmailAccounts({ loading: true, error: null, data: null });
      setCampaigns({ loading: true, error: null, data: null });

      // Fetch all in parallel
      const [accountRes, workspacesRes, emailAccountsRes, campaignsRes] = await Promise.allSettled([
        fetch("/api/emailbison/account").then((r) => r.json()),
        fetch("/api/emailbison/workspaces").then((r) => r.json()),
        fetch("/api/emailbison/email-accounts").then((r) => r.json()),
        fetch("/api/emailbison/campaigns").then((r) => r.json()),
      ]);

      // Process account
      if (accountRes.status === "fulfilled") {
        if (accountRes.value.error) {
          setAccount({ loading: false, error: accountRes.value.error, data: null });
        } else {
          setAccount({ loading: false, error: null, data: accountRes.value.data });
        }
      } else {
        setAccount({ loading: false, error: "Failed to fetch", data: null });
      }

      // Process workspaces
      if (workspacesRes.status === "fulfilled") {
        if (workspacesRes.value.error) {
          setWorkspaces({ loading: false, error: workspacesRes.value.error, data: null });
        } else {
          setWorkspaces({ loading: false, error: null, data: workspacesRes.value.data });
        }
      } else {
        setWorkspaces({ loading: false, error: "Failed to fetch", data: null });
      }

      // Process email accounts
      if (emailAccountsRes.status === "fulfilled") {
        if (emailAccountsRes.value.error) {
          setEmailAccounts({ loading: false, error: emailAccountsRes.value.error, data: null });
        } else {
          setEmailAccounts({ loading: false, error: null, data: emailAccountsRes.value.data });
        }
      } else {
        setEmailAccounts({ loading: false, error: "Failed to fetch", data: null });
      }

      // Process campaigns
      if (campaignsRes.status === "fulfilled") {
        if (campaignsRes.value.error) {
          setCampaigns({ loading: false, error: campaignsRes.value.error, data: null });
        } else {
          setCampaigns({ loading: false, error: null, data: campaignsRes.value.data });
        }
      } else {
        setCampaigns({ loading: false, error: "Failed to fetch", data: null });
      }
    }

    fetchAll();
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <PageContainer>
      <PageHeader
        title="EmailBison API Viewer"
        subtitle="Live data from the EmailBison API"
      >
        <div className="flex items-center gap-3">
          <Link href="/admin/emailbison">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </PageHeader>
      <PageContent>
        <div className={`${spacing.content.gap} flex flex-col`}>
          {/* Account Section */}
          <DataCard
            title="Account"
            icon={<User className="h-5 w-5" />}
            loading={account.loading}
            error={account.error}
            data={account.data}
          />

          {/* Workspaces Section */}
          <DataCard
            title="Workspaces"
            icon={<Building2 className="h-5 w-5" />}
            loading={workspaces.loading}
            error={workspaces.error}
            data={workspaces.data}
            count={Array.isArray(workspaces.data) ? workspaces.data.length : undefined}
          />

          {/* Email Accounts Section */}
          <DataCard
            title="Email Accounts"
            icon={<Mail className="h-5 w-5" />}
            loading={emailAccounts.loading}
            error={emailAccounts.error}
            data={emailAccounts.data}
            count={Array.isArray(emailAccounts.data) ? emailAccounts.data.length : undefined}
          />

          {/* Campaigns Section */}
          <DataCard
            title="Campaigns"
            icon={<Megaphone className="h-5 w-5" />}
            loading={campaigns.loading}
            error={campaigns.error}
            data={campaigns.data}
            count={Array.isArray(campaigns.data) ? campaigns.data.length : undefined}
          />
        </div>
      </PageContent>
    </PageContainer>
  );
}

function DataCard({
  title,
  icon,
  loading,
  error,
  data,
  count,
}: {
  title: string;
  icon: React.ReactNode;
  loading: boolean;
  error: string | null;
  data: unknown;
  count?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`${colors.bg.card} ${colors.border.default} border`}>
      <CardHeader 
        className="pb-3 cursor-pointer select-none hover:bg-zinc-800/50 transition-colors rounded-t-lg"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={colors.text.secondary}>
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
            <div className={colors.text.secondary}>{icon}</div>
            <CardTitle className={typography.cardTitle}>{title}</CardTitle>
            {count !== undefined && (
              <span className={`${typography.secondary} px-2 py-0.5 rounded-full bg-zinc-800`}>
                {count} {count === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <StatusIndicator loading={loading} error={error} />
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          {loading && (
            <div className={`${colors.text.muted} ${typography.body}`}>Loading...</div>
          )}
          {error && (
            <div className={`${colors.status.error} ${typography.body} flex items-center gap-2`}>
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {!loading && !error && data && (
            <pre className={`${typography.body} ${colors.text.secondary} overflow-auto max-h-96 bg-zinc-950 rounded-lg p-4 text-xs font-mono`}>
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
          {!loading && !error && !data && (
            <div className={`${colors.text.muted} ${typography.body}`}>No data</div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function StatusIndicator({ loading, error }: { loading: boolean; error: string | null }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-500 text-xs">
        <div className="h-2 w-2 rounded-full bg-zinc-500 animate-pulse" />
        Loading
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-xs">
        <AlertCircle className="h-3 w-3" />
        Error
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-emerald-400 text-xs">
      <CheckCircle2 className="h-3 w-3" />
      OK
    </div>
  );
}

