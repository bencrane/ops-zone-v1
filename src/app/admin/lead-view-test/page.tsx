"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

const ENDPOINTS = {
  people: "https://api.revenueinfra.com/api/views/people",
  companies: "https://api.revenueinfra.com/api/views/companies",
};

interface TestResult {
  endpoint: string;
  status: number | null;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  error: string | null;
  duration: number;
}

export default function LeadViewTestPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);

  const testEndpoint = async (name: string, url: string) => {
    setLoading(name);
    const start = Date.now();
    
    try {
      const response = await fetch(`${url}?limit=5`);
      const duration = Date.now() - start;
      
      // Collect headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      let body: unknown;
      const contentType = response.headers.get("content-type") || "";
      
      if (contentType.includes("application/json")) {
        body = await response.json();
      } else {
        body = await response.text();
      }
      
      setResults(prev => [{
        endpoint: `${name}: ${url}`,
        status: response.status,
        statusText: response.statusText,
        headers,
        body,
        error: null,
        duration,
      }, ...prev]);
      
    } catch (err) {
      const duration = Date.now() - start;
      setResults(prev => [{
        endpoint: `${name}: ${url}`,
        status: null,
        statusText: "",
        headers: {},
        body: null,
        error: err instanceof Error ? err.message : String(err),
        duration,
      }, ...prev]);
    } finally {
      setLoading(null);
    }
  };

  const testViaProxy = async (name: string, proxyPath: string) => {
    setLoading(`proxy-${name}`);
    const start = Date.now();
    
    try {
      const response = await fetch(`${proxyPath}?limit=5`);
      const duration = Date.now() - start;
      
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      let body: unknown;
      const contentType = response.headers.get("content-type") || "";
      
      if (contentType.includes("application/json")) {
        body = await response.json();
      } else {
        body = await response.text();
      }
      
      setResults(prev => [{
        endpoint: `${name} (via proxy): ${proxyPath}`,
        status: response.status,
        statusText: response.statusText,
        headers,
        body,
        error: null,
        duration,
      }, ...prev]);
      
    } catch (err) {
      const duration = Date.now() - start;
      setResults(prev => [{
        endpoint: `${name} (via proxy): ${proxyPath}`,
        status: null,
        statusText: "",
        headers: {},
        body: null,
        error: err instanceof Error ? err.message : String(err),
        duration,
      }, ...prev]);
    } finally {
      setLoading(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Lead View Test"
        subtitle="Debug API connectivity to HQ Data endpoints"
        actions={
          <Link href="/admin">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />
      <PageContent>
        <div className="space-y-6">
          {/* Direct API Calls */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h2 className="text-sm font-medium text-zinc-400 mb-3">Direct API Calls (from browser)</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => testEndpoint("People", ENDPOINTS.people)}
                disabled={loading !== null}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading === "People" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Test People
              </Button>
              <Button
                onClick={() => testEndpoint("Companies", ENDPOINTS.companies)}
                disabled={loading !== null}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading === "Companies" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Test Companies
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Direct: {ENDPOINTS.people}
            </p>
          </div>

          {/* Via Proxy */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h2 className="text-sm font-medium text-zinc-400 mb-3">Via Next.js Proxy (server-side)</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => testViaProxy("People", "/api/hq/people")}
                disabled={loading !== null}
                variant="outline"
                className="border-zinc-700"
              >
                {loading === "proxy-People" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Test People (proxy)
              </Button>
              <Button
                onClick={() => testViaProxy("Companies", "/api/hq/companies")}
                disabled={loading !== null}
                variant="outline"
                className="border-zinc-700"
              >
                {loading === "proxy-Companies" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Test Companies (proxy)
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Proxy: /api/hq/people → {ENDPOINTS.people}
            </p>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-400">Results (newest first)</h2>
            
            {results.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center text-zinc-500">
                Click a test button to see results
              </div>
            ) : (
              results.map((result, i) => (
                <div 
                  key={i} 
                  className={`bg-zinc-900 border rounded-lg p-4 ${
                    result.error || (result.status && result.status >= 400)
                      ? "border-red-500/50"
                      : "border-emerald-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-xs text-zinc-400">{result.endpoint}</code>
                    <span className="text-xs text-zinc-500">{result.duration}ms</span>
                  </div>
                  
                  {result.error ? (
                    <div className="text-red-400 text-sm font-mono">
                      Error: {result.error}
                    </div>
                  ) : (
                    <>
                      <div className={`text-sm font-mono mb-2 ${
                        result.status && result.status < 400 ? "text-emerald-400" : "text-red-400"
                      }`}>
                        HTTP {result.status} {result.statusText}
                      </div>
                      
                      <details className="mb-2">
                        <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-400">
                          Response Headers
                        </summary>
                        <pre className="text-xs text-zinc-400 mt-1 overflow-auto max-h-32 bg-black/50 p-2 rounded">
                          {JSON.stringify(result.headers, null, 2)}
                        </pre>
                      </details>
                      
                      <details open>
                        <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-400">
                          Response Body
                        </summary>
                        <pre className="text-xs text-zinc-300 mt-1 overflow-auto max-h-96 bg-black/50 p-2 rounded">
                          {typeof result.body === "string" 
                            ? result.body 
                            : JSON.stringify(result.body, null, 2)}
                        </pre>
                      </details>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}

