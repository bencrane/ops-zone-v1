"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import openApiSpec from "../../../../emailbison-openapi.json";

interface OpenApiOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Array<{
    name: string;
    in: string;
    description?: string;
    required?: boolean;
    schema?: { type?: string };
  }>;
  requestBody?: {
    content?: {
      [key: string]: {
        schema?: object;
      };
    };
  };
  responses?: {
    [key: string]: {
      description?: string;
      content?: {
        [key: string]: {
          schema?: object;
        };
      };
    };
  };
}

interface ParsedEndpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  tag: string;
  operationId: string;
}

function parseEndpoints(): Map<string, ParsedEndpoint[]> {
  const endpointsByTag = new Map<string, ParsedEndpoint[]>();
  const paths = openApiSpec.paths as Record<string, Record<string, OpenApiOperation>>;

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (method === "parameters") continue; // Skip path-level parameters

      const tag = operation.tags?.[0] || "Other";
      const endpoint: ParsedEndpoint = {
        method: method.toUpperCase(),
        path,
        summary: operation.summary || "",
        description: operation.description || "",
        tag,
        operationId: operation.operationId || "",
      };

      if (!endpointsByTag.has(tag)) {
        endpointsByTag.set(tag, []);
      }
      endpointsByTag.get(tag)!.push(endpoint);
    }
  }

  return endpointsByTag;
}

function getMethodColor(method: string): string {
  switch (method) {
    case "GET":
      return "text-green-400";
    case "POST":
      return "text-blue-400";
    case "PUT":
      return "text-yellow-400";
    case "PATCH":
      return "text-orange-400";
    case "DELETE":
      return "text-red-400";
    default:
      return "text-zinc-400";
  }
}

function encodeEndpointId(method: string, path: string): string {
  return encodeURIComponent(`${method}:${path}`);
}

export default function ApiExplorerPage() {
  const endpointsByTag = parseEndpoints();
  const sortedTags = Array.from(endpointsByTag.keys()).sort();

  return (
    <PageContainer>
      <PageHeader
        title="EmailBison API Explorer"
        subtitle="Browse available API endpoints and documentation"
        actions={
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
        }
      />
      <PageContent>
        <div className="space-y-8">
          {sortedTags.map((tag) => {
            const endpoints = endpointsByTag.get(tag)!;
            return (
              <div key={tag} className="space-y-3">
                <h2 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">
                  {tag}
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400 w-24">Method</TableHead>
                      <TableHead className="text-zinc-400">Endpoint</TableHead>
                      <TableHead className="text-zinc-400">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {endpoints.map((endpoint) => (
                      <TableRow
                        key={`${endpoint.method}-${endpoint.path}`}
                        className="border-zinc-800 hover:bg-zinc-900 cursor-pointer"
                      >
                        <TableCell>
                          <Link
                            href={`/admin/api-explorer/${encodeEndpointId(endpoint.method, endpoint.path)}`}
                            className="block"
                          >
                            <span className={`font-mono font-semibold ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/api-explorer/${encodeEndpointId(endpoint.method, endpoint.path)}`}
                            className="block font-mono text-zinc-300"
                          >
                            {endpoint.path}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/api-explorer/${encodeEndpointId(endpoint.method, endpoint.path)}`}
                            className="block text-zinc-400"
                          >
                            {endpoint.summary}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      </PageContent>
    </PageContainer>
  );
}
