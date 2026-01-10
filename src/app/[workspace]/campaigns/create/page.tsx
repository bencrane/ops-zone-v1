"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspaceNav } from "@/hooks/use-workspace-nav";

type FormState = "idle" | "submitting" | "success" | "error";

export default function CreateCampaignPage() {
  const router = useRouter();
  const { href } = useWorkspaceNav();
  const [name, setName] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setErrorMessage("Campaign name is required.");
      setFormState("error");
      return;
    }

    setFormState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/emailbison/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to create campaign");
      }

      setFormState("success");

      setTimeout(() => {
        router.push(href("/campaigns"));
      }, 1500);
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to create campaign. Please try again."
      );
    }
  };

  const isSubmitting = formState === "submitting";
  const isSuccess = formState === "success";

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Create Campaign</h1>
            <p className="text-zinc-400 mt-1">Start a new email campaign.</p>
          </div>
          <Link href={href("/campaigns")}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </Button>
          </Link>
        </div>

        <Card className="max-w-xl bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Campaign Created
                </h3>
                <p className="text-sm text-zinc-400">
                  Redirecting...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">
                    Campaign Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Q1 SaaS Founders Outreach"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    autoFocus
                  />
                  <p className="text-xs text-zinc-500">
                    This will create the campaign in EmailBison.
                  </p>
                </div>

                {formState === "error" && errorMessage && (
                  <div className="rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <p className="text-sm text-red-400">{errorMessage}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-white text-black hover:bg-zinc-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Campaign"
                    )}
                  </Button>
                  <Link href={href("/campaigns")}>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={isSubmitting}
                      className="text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

