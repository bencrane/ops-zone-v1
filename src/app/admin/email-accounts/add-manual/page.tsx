"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

interface FormData {
  email: string;
  password: string;
  imap_host: string;
  imap_port: string;
  smtp_host: string;
  smtp_port: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function AddEmailAccountManualPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    imap_host: "",
    imap_port: "993",
    smtp_host: "",
    smtp_port: "587",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (status === "error") {
      setStatus("idle");
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    // Build the request payload matching EmailBison API
    const payload = {
      name: formData.email, // Use email as display name
      email: formData.email,
      password: formData.password,
      imap_server: formData.imap_host,
      imap_port: parseInt(formData.imap_port, 10),
      smtp_server: formData.smtp_host,
      smtp_port: parseInt(formData.smtp_port, 10),
    };

    try {
      const res = await fetch("/api/emailbison/email-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to add email account");
      }

      setStatus("success");
      // Reset form after success
      setFormData({
        email: "",
        password: "",
        imap_host: "",
        imap_port: "993",
        smtp_host: "",
        smtp_port: "587",
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const isFormValid =
    formData.email &&
    formData.password &&
    formData.imap_host &&
    formData.imap_port &&
    formData.smtp_host &&
    formData.smtp_port;

  return (
    <PageContainer>
      <PageHeader
        title="Add Email Account"
        subtitle="Manually add a single IMAP/SMTP email account"
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
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="App password or account password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500"
                required
              />
              <p className="text-xs text-zinc-500">
                For Gmail/Google Workspace, use an App Password
              </p>
            </div>

            {/* IMAP Settings */}
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-sm font-medium text-zinc-400 mb-4">IMAP Settings</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="imap_host" className="text-zinc-300">
                    IMAP Host
                  </Label>
                  <Input
                    id="imap_host"
                    type="text"
                    placeholder="imap.gmail.com"
                    value={formData.imap_host}
                    onChange={(e) => handleChange("imap_host", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imap_port" className="text-zinc-300">
                    Port
                  </Label>
                  <Input
                    id="imap_port"
                    type="number"
                    placeholder="993"
                    value={formData.imap_port}
                    onChange={(e) => handleChange("imap_port", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SMTP Settings */}
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-sm font-medium text-zinc-400 mb-4">SMTP Settings</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="smtp_host" className="text-zinc-300">
                    SMTP Host
                  </Label>
                  <Input
                    id="smtp_host"
                    type="text"
                    placeholder="smtp.gmail.com"
                    value={formData.smtp_host}
                    onChange={(e) => handleChange("smtp_host", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port" className="text-zinc-300">
                    Port
                  </Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    placeholder="587"
                    value={formData.smtp_port}
                    onChange={(e) => handleChange("smtp_port", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {status === "error" && errorMessage && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-400">{errorMessage}</p>
              </div>
            )}

            {/* Success Message */}
            {status === "success" && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <p className="text-sm text-emerald-400">Email account added successfully!</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || status === "submitting"}
              className="w-full bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Email Account"
              )}
            </Button>
          </form>
        </div>
      </PageContent>
    </PageContainer>
  );
}

