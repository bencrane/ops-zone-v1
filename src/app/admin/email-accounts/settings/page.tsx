"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
  Trash2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import { cn } from "@/lib/utils";

interface EmailAccount {
  id: number;
  name: string;
  email: string;
  email_signature: string | null;
  daily_limit: number;
  status: string;
  emails_sent_count?: number;
  total_replied_count?: number;
  bounced_count?: number;
}

type SaveState = "idle" | "saving" | "saved" | "error";

interface EditingState {
  name: string;
  email_signature: string;
  daily_limit: number;
}

export default function EmailAccountSettingsPage() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Editing state
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [originalState, setOriginalState] = useState<EditingState | null>(null);

  // Fetch all accounts
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/emailbison/email-accounts");
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setAccounts(data.data || []);
        }
      } catch {
        setError("Failed to load email accounts");
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  // Fetch account details when selected
  useEffect(() => {
    if (!selectedAccountId) {
      setEditingState(null);
      setOriginalState(null);
      return;
    }

    async function fetchDetail() {
      setDetailLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/emailbison/email-accounts/${selectedAccountId}`);
        const data = await res.json();
        
        if (data.error) {
          setError(data.error);
        } else if (data.data) {
          const state: EditingState = {
            name: data.data.name || "",
            email_signature: data.data.email_signature || "",
            daily_limit: data.data.daily_limit || 10,
          };
          setEditingState(state);
          setOriginalState(state);
          
          // Update the account in the list with full details
          setAccounts(prev => prev.map(a => 
            a.id === selectedAccountId ? { ...a, ...data.data } : a
          ));
        }
      } catch {
        setError("Failed to load account details");
      } finally {
        setDetailLoading(false);
      }
    }

    fetchDetail();
  }, [selectedAccountId]);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const handleFieldChange = (field: keyof EditingState, value: string | number) => {
    if (!editingState) return;
    setEditingState((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const hasChanges = () => {
    if (!editingState || !originalState) return false;
    return (
      editingState.name !== originalState.name ||
      editingState.email_signature !== originalState.email_signature ||
      editingState.daily_limit !== originalState.daily_limit
    );
  };

  const handleSave = async () => {
    if (!selectedAccountId || !editingState) return;
    
    setSaveState("saving");
    setError(null);

    try {
      const res = await fetch(`/api/emailbison/email-accounts/${selectedAccountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingState.name,
          email_signature: editingState.email_signature || null,
          daily_limit: editingState.daily_limit,
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to save settings");
      }

      // Update local state
      setOriginalState({ ...editingState });
      setAccounts(prev => prev.map(a => 
        a.id === selectedAccountId 
          ? { ...a, name: editingState.name, email_signature: editingState.email_signature, daily_limit: editingState.daily_limit }
          : a
      ));

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save settings");
    }
  };

  const handleDelete = async () => {
    if (!selectedAccountId || !selectedAccount) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedAccount.email}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleteLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/emailbison/email-accounts/${selectedAccountId}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok || (result.data?.success === false)) {
        throw new Error(result.data?.message || result.error || "Failed to delete account");
      }

      // Remove from list
      setAccounts(prev => prev.filter(a => a.id !== selectedAccountId));
      setSelectedAccountId(null);
      setEditingState(null);
      setOriginalState(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "connected") return "border-emerald-400/30 text-emerald-400 bg-emerald-400/5";
    if (s === "disconnected" || s === "error") return "border-red-400/30 text-red-400 bg-red-400/5";
    return "border-zinc-400/30 text-zinc-400 bg-zinc-400/5";
  };

  return (
    <PageContainer>
      <PageHeader
        title="Email Account Settings"
        subtitle="Configure sender names, signatures, and daily limits"
        actions={
          <Link href="/admin">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        }
      />
      <PageContent>
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {saveState === "saved" && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 mb-6">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-400">Settings saved successfully.</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Account List */}
            <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  Select Email Account
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-1 p-4 pt-0">
                    {accounts.length === 0 ? (
                      <p className="text-sm text-zinc-500 py-4 text-center">
                        No email accounts found
                      </p>
                    ) : (
                      accounts.map((account) => (
                        <button
                          key={account.id}
                          onClick={() => setSelectedAccountId(account.id)}
                          className={cn(
                            "w-full text-left px-3 py-3 rounded-md transition-colors",
                            selectedAccountId === account.id
                              ? "bg-zinc-800 border border-zinc-700"
                              : "hover:bg-zinc-800/50 border border-transparent"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded bg-zinc-800">
                              <Mail className="h-4 w-4 text-zinc-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white truncate">
                                {account.email}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge
                                  variant="outline"
                                  className={cn("text-[10px]", getStatusColor(account.status))}
                                >
                                  {account.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Right: Settings Panel */}
            <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    {selectedAccount
                      ? "Account Settings"
                      : "Select an account to configure"}
                  </CardTitle>
                  {selectedAccount && hasChanges() && (
                    <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-400 bg-amber-400/5">
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {detailLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                  </div>
                ) : selectedAccount && editingState ? (
                  <div className="space-y-6">
                    {/* Email (read-only) */}
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Email Address</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{selectedAccount.email}</p>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", getStatusColor(selectedAccount.status))}
                        >
                          {selectedAccount.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Sender Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-zinc-300">Sender Name</Label>
                      <Input
                        id="name"
                        value={editingState.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        placeholder="John Doe"
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                      <p className="text-xs text-zinc-500">
                        This name appears in the &quot;From&quot; field of your emails
                      </p>
                    </div>

                    {/* Daily Limit */}
                    <div className="space-y-2">
                      <Label htmlFor="daily_limit" className="text-zinc-300">
                        Maximum Daily Emails (in campaigns)
                      </Label>
                      <Input
                        id="daily_limit"
                        type="number"
                        min={1}
                        max={500}
                        value={editingState.daily_limit}
                        onChange={(e) => handleFieldChange("daily_limit", Number(e.target.value))}
                        className="bg-zinc-800 border-zinc-700 text-white w-32"
                      />
                      <p className="text-xs text-zinc-500">
                        If you have an active campaign, pause and resume for limits to take effect
                      </p>
                    </div>

                    {/* Email Signature */}
                    <div className="space-y-2">
                      <Label htmlFor="email_signature" className="text-zinc-300">
                        Email Signature
                      </Label>
                      <Textarea
                        id="email_signature"
                        value={editingState.email_signature}
                        onChange={(e) => handleFieldChange("email_signature", e.target.value)}
                        placeholder="<p><strong>Your Name</strong><br>Your Title | Company</p>"
                        className="bg-zinc-800 border-zinc-700 text-white min-h-[120px] font-mono text-sm"
                      />
                      <p className="text-xs text-zinc-500">
                        HTML signature appended to your emails. Keep it short and sweet.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                      <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
                      >
                        {deleteLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete Account
                      </Button>
                      
                      <Button
                        onClick={handleSave}
                        disabled={!hasChanges() || saveState === "saving"}
                        className="bg-white text-black hover:bg-zinc-200"
                      >
                        {saveState === "saving" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-zinc-500">
                    Select an email account from the list to configure its settings.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
}

