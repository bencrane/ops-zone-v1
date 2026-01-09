"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import { createCampaign } from "@/lib/data";

type FormState = "idle" | "submitting" | "success" | "error";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
      const campaign = await createCampaign({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setFormState("success");

      // Redirect to campaigns list after brief success state
      setTimeout(() => {
        router.push("/campaigns");
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
    <PageContainer>
      <PageHeader
        title="Create Campaign"
        subtitle="Start a new email campaign."
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
                  Redirecting to campaigns...
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-zinc-300">
                    Description / Notes
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Optional notes about this campaign..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px] resize-none"
                  />
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
                  <Link href="/admin">
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
      </PageContent>
    </PageContainer>
  );
}

