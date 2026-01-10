"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Check, Loader2 } from "lucide-react";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

interface Workspace {
  id: number;
  name: string;
  main: boolean;
}

interface Tag {
  id: number;
  name: string;
}

interface EmailAccount {
  id: number;
  name: string;
  email: string;
  status: string;
  daily_limit: number;
  tags: Tag[];
  emails_sent_count: number;
  total_replied_count: number;
  bounced_count: number;
}

export default function ViewEmailAccountsPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingWorkspace, setSwitchingWorkspace] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch workspaces on mount
  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const res = await fetch("/api/emailbison/workspaces");
        const result = await res.json();
        if (result.data) {
          setWorkspaces(result.data);
          // Find the main workspace (current)
          const mainWorkspace = result.data.find((w: Workspace) => w.main);
          if (mainWorkspace) {
            setSelectedWorkspace(mainWorkspace);
          }
        }
      } catch (err) {
        console.error("Failed to fetch workspaces", err);
      }
    }
    fetchWorkspaces();
  }, []);

  // Fetch email accounts when workspace changes
  useEffect(() => {
    async function fetchEmailAccounts() {
      if (!selectedWorkspace) return;
      
      setLoading(true);
      try {
        const res = await fetch("/api/emailbison/email-accounts");
        const result = await res.json();
        if (result.data) {
          setEmailAccounts(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch email accounts", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmailAccounts();
  }, [selectedWorkspace]);

  const handleWorkspaceChange = async (workspace: Workspace) => {
    if (workspace.id === selectedWorkspace?.id) {
      setDropdownOpen(false);
      return;
    }

    setSwitchingWorkspace(true);
    setDropdownOpen(false);

    try {
      const res = await fetch("/api/emailbison/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspace.id }),
      });

      if (res.ok) {
        setSelectedWorkspace(workspace);
      }
    } catch (err) {
      console.error("Failed to switch workspace", err);
    } finally {
      setSwitchingWorkspace(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "connected":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "disconnected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "error":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getBounceRate = (account: EmailAccount) => {
    if (account.emails_sent_count === 0) return "0%";
    const rate = (account.bounced_count / account.emails_sent_count) * 100;
    return `${rate.toFixed(0)}%`;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Email Accounts"
        subtitle="View connected email accounts by workspace"
        actions={
          <Link
            href="/admin/email-accounts"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Email Accounts
          </Link>
        }
      />
      <PageContent>
        {/* Workspace Selector */}
        <div className="mb-6">
          <div className="relative inline-block">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={switchingWorkspace}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white hover:border-zinc-500 transition-colors disabled:opacity-50"
            >
              {switchingWorkspace ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              <span className="text-zinc-400 text-sm">Workspace:</span>
              <span className="font-medium">
                {selectedWorkspace?.name?.replace(/"/g, "") || "Select..."}
              </span>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-10 overflow-hidden">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => handleWorkspaceChange(workspace)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800 transition-colors"
                  >
                    <span className="text-white">
                      {workspace.name.replace(/"/g, "")}
                    </span>
                    {workspace.id === selectedWorkspace?.id && (
                      <Check className="h-4 w-4 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Accounts Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : emailAccounts.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No email accounts found in this workspace
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                    Tags
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">
                    Daily Limit
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">
                    Sent
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">
                    Replied
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">
                    Bounced
                  </th>
                </tr>
              </thead>
              <tbody>
                {emailAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-white">{account.name}</p>
                        <p className="text-sm text-zinc-500">{account.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {account.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-300 rounded border border-zinc-700"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                          account.status
                        )}`}
                      >
                        {account.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-zinc-300">
                      {account.daily_limit}
                    </td>
                    <td className="py-4 px-4 text-right text-zinc-300">
                      {account.emails_sent_count}
                    </td>
                    <td className="py-4 px-4 text-right text-zinc-300">
                      {account.total_replied_count}
                    </td>
                    <td className="py-4 px-4 text-right text-zinc-300">
                      {getBounceRate(account)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-zinc-900/30 border-t border-zinc-800">
              <p className="text-sm text-zinc-500">
                Showing {emailAccounts.length} of {emailAccounts.length} results
              </p>
            </div>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
}

