"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useWorkspaceNav } from "@/hooks/use-workspace-nav";

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
  const { href } = useWorkspaceNav();
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmailAccounts() {
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
  }, []);

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
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Email Accounts</h1>
            <p className="text-zinc-400 mt-1">View connected email accounts by workspace</p>
          </div>
          <Link href={href("/email-accounts")} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Email Accounts
          </Link>
        </div>

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
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Tags</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Daily Limit</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Sent</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Replied</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Bounced</th>
                </tr>
              </thead>
              <tbody>
                {emailAccounts.map((account) => (
                  <tr key={account.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-white">{account.name}</p>
                        <p className="text-sm text-zinc-500">{account.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {account.tags.map((tag) => (
                          <span key={tag.id} className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-zinc-300">{account.daily_limit}</td>
                    <td className="py-4 px-4 text-right text-zinc-300">{account.emails_sent_count}</td>
                    <td className="py-4 px-4 text-right text-zinc-300">{account.total_replied_count}</td>
                    <td className="py-4 px-4 text-right text-zinc-300">{getBounceRate(account)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-zinc-900/30 border-t border-zinc-800">
              <p className="text-sm text-zinc-500">Showing {emailAccounts.length} of {emailAccounts.length} results</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

