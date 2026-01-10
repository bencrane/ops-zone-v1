"use client";

import { useEffect, useState } from "react";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { typography, colors } from "@/lib/design-tokens";
import { ArrowLeft, Building2, Check, Loader2 } from "lucide-react";
import Link from "next/link";

interface Workspace {
  id: number;
  name: string;
  personal_team: boolean;
  main: boolean;
}

interface Account {
  id: number;
  name: string;
  email: string;
  workspace: Workspace;
}

export default function WorkspaceSelectionPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [accountRes, workspacesRes] = await Promise.all([
          fetch("/api/emailbison/account").then((r) => r.json()),
          fetch("/api/emailbison/workspaces").then((r) => r.json()),
        ]);

        if (accountRes.error) {
          setError(accountRes.error);
          return;
        }
        if (workspacesRes.error) {
          setError(workspacesRes.error);
          return;
        }

        setAccount(accountRes.data);
        setWorkspaces(workspacesRes.data);
      } catch {
        setError("Failed to load workspace data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSwitch = async (workspaceId: number) => {
    if (switching) return;
    if (account?.workspace.id === workspaceId) return;

    setSwitching(workspaceId);
    setError(null);

    try {
      const res = await fetch("/api/emailbison/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setSwitching(null);
        return;
      }

      // Refetch account to get updated workspace
      const accountRes = await fetch("/api/emailbison/account").then((r) => r.json());
      if (!accountRes.error) {
        setAccount(accountRes.data);
      }
    } catch {
      setError("Failed to switch workspace");
    } finally {
      setSwitching(null);
    }
  };

  const currentWorkspaceId = account?.workspace.id;

  return (
    <PageContainer>
      <PageHeader
        title="Workspace Selection"
        subtitle="Choose which workspace to work in"
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
        {loading && (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        )}

        {error && (
          <div className={`${colors.status.error} ${typography.body} p-4 rounded-lg bg-red-500/10 border border-red-500/20`}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Current Workspace Banner */}
            {account && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className={`${typography.body} text-emerald-400`}>
                      Currently working in
                    </p>
                    <p className={`${typography.cardTitle} text-white`}>
                      {account.workspace.name.replace(/^"|"$/g, '')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Workspace List */}
            <div className="space-y-3">
              <h2 className={typography.sectionTitle}>Available Workspaces</h2>
              <div className="grid gap-3">
                {workspaces.map((workspace) => {
                  const isCurrent = workspace.id === currentWorkspaceId;
                  const isSwitching = switching === workspace.id;

                  return (
                    <Card
                      key={workspace.id}
                      className={`
                        ${colors.bg.card} border transition-all cursor-pointer
                        ${isCurrent 
                          ? "border-emerald-500/50 bg-emerald-500/5" 
                          : `${colors.border.default} ${colors.bg.cardHover}`
                        }
                      `}
                      onClick={() => handleSwitch(workspace.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isCurrent ? "bg-emerald-500/20" : "bg-zinc-800"}`}>
                              <Building2 className={`h-5 w-5 ${isCurrent ? "text-emerald-400" : "text-zinc-400"}`} />
                            </div>
                            <div>
                              <p className={`${typography.cardTitle} ${isCurrent ? "text-emerald-400" : "text-white"}`}>
                                {workspace.name.replace(/^"|"$/g, '')}
                              </p>
                              <p className={typography.secondary}>
                                {workspace.personal_team ? "Personal" : "Team"} workspace
                                {workspace.main && " · Main"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
                                Active
                              </span>
                            )}
                            {isSwitching && (
                              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                            )}
                            {!isCurrent && !isSwitching && (
                              <span className={`${typography.secondary} group-hover:text-white`}>
                                Click to switch
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
}

