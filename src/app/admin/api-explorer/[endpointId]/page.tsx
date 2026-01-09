"use client";

import { use } from "react";
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
import openApiSpec from "../../../../../emailbison-openapi.json";

interface Parameter {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  example?: string | number | boolean;
  schema?: {
    type?: string;
    example?: string | number | boolean;
  };
}

interface SchemaProperty {
  type?: string;
  example?: unknown;
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
}

interface OpenApiOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: {
    required?: boolean;
    content?: {
      [key: string]: {
        schema?: {
          type?: string;
          properties?: Record<string, SchemaProperty>;
          example?: unknown;
        };
      };
    };
  };
  responses?: {
    [key: string]: {
      description?: string;
      content?: {
        [key: string]: {
          schema?: {
            type?: string;
            properties?: Record<string, SchemaProperty>;
            example?: unknown;
          };
        };
      };
    };
  };
}

function decodeEndpointId(encoded: string): { method: string; path: string } {
  const decoded = decodeURIComponent(encoded);
  const colonIndex = decoded.indexOf(":");
  return {
    method: decoded.substring(0, colonIndex),
    path: decoded.substring(colonIndex + 1),
  };
}

function getEndpointOperation(method: string, path: string): OpenApiOperation | null {
  const paths = openApiSpec.paths as Record<string, Record<string, OpenApiOperation>>;
  const pathData = paths[path];
  if (!pathData) return null;
  return pathData[method.toLowerCase()] || null;
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

function generateExampleUrl(path: string, pathParams: Parameter[], queryParams: Parameter[]): string {
  let examplePath = path;

  // Replace path parameters with example values
  for (const param of pathParams) {
    const example = param.example || param.schema?.example || `{${param.name}}`;
    examplePath = examplePath.replace(`{${param.name}}`, String(example));
  }

  // Add query parameters
  const queryExamples = queryParams
    .filter((p) => p.example || p.schema?.example)
    .slice(0, 2) // Limit to 2 query params for readability
    .map((p) => `${p.name}=${p.example || p.schema?.example}`)
    .join("&");

  if (queryExamples) {
    examplePath += `?${queryExamples}`;
  }

  return examplePath;
}

function extractResponseFields(operation: OpenApiOperation): Array<{ field: string; type: string; description: string }> {
  const response = operation.responses?.["200"] || operation.responses?.["201"];
  if (!response?.content) return [];

  const jsonContent = response.content["application/json"];
  if (!jsonContent?.schema) return [];

  const schema = jsonContent.schema;
  const fields: Array<{ field: string; type: string; description: string }> = [];

  // Check if response has a 'data' wrapper
  const properties = schema.properties?.data?.properties || schema.properties;
  if (!properties) {
    // Try to infer from example
    const example = schema.example || schema.properties?.data?.example;
    if (example && typeof example === "object") {
      const exampleData = (example as { data?: unknown }).data || example;
      if (Array.isArray(exampleData)) {
        fields.push({ field: "data", type: "array", description: "Array of results" });
      } else if (typeof exampleData === "object" && exampleData !== null) {
        for (const [key, value] of Object.entries(exampleData as Record<string, unknown>).slice(0, 6)) {
          const type = Array.isArray(value) ? "array" : typeof value;
          fields.push({ field: key, type, description: "" });
        }
      }
    }
    return fields;
  }

  // Extract top-level fields
  for (const [key, value] of Object.entries(properties).slice(0, 8)) {
    const prop = value as SchemaProperty;
    let type = prop.type || "object";
    if (prop.items) {
      type = `${prop.items.type || "object"}[]`;
    }
    fields.push({
      field: key,
      type,
      description: "",
    });
  }

  return fields;
}

function getResponseDescription(operation: OpenApiOperation): string {
  const response = operation.responses?.["200"] || operation.responses?.["201"];
  if (!response?.content) return "Returns a JSON response.";

  const jsonContent = response.content["application/json"];
  if (!jsonContent?.schema) return "Returns a JSON response.";

  const schema = jsonContent.schema;
  const example = schema.example || schema.properties?.data?.example;

  if (example) {
    const data = (example as { data?: unknown }).data || example;
    if (Array.isArray(data)) {
      return "Returns a paginated response with data array and pagination metadata.";
    }
    if (data && typeof data === "object" && "data" in (example as object)) {
      return "Returns a single object wrapped in a data field.";
    }
  }

  return "Returns a JSON response.";
}

function generateIntendedUse(operation: OpenApiOperation, method: string, path: string): string {
  const tag = operation.tags?.[0] || "";
  const summary = operation.summary || "";

  // Generate contextual intended use based on the endpoint
  if (method === "GET" && path.includes("{")) {
    return `Use this endpoint to retrieve details of a specific ${tag.toLowerCase().replace(/s$/, "")} by ID. Pass the ID in the URL path to get the full record.`;
  }
  if (method === "GET") {
    return `Use this endpoint to list and filter ${tag.toLowerCase()}. Supports pagination and filtering through query parameters.`;
  }
  if (method === "POST" && (path.includes("bulk") || path.includes("multiple"))) {
    return `Use this endpoint for batch operations when you need to process multiple records at once. More efficient than individual API calls.`;
  }
  if (method === "POST") {
    return `Use this endpoint to create new ${tag.toLowerCase().replace(/s$/, "")} records. Send the required fields in the request body.`;
  }
  if (method === "PUT" || method === "PATCH") {
    return `Use this endpoint to update existing records. Include the record ID in the path and the fields to update in the request body.`;
  }
  if (method === "DELETE") {
    return `Use this endpoint to remove records from the system. This action may be irreversible depending on the resource type.`;
  }

  return `This endpoint handles ${summary.toLowerCase() || "operations"} within the ${tag} category.`;
}

export default function EndpointDetailPage({
  params,
}: {
  params: Promise<{ endpointId: string }>;
}) {
  const { endpointId } = use(params);
  const { method, path } = decodeEndpointId(endpointId);
  const operation = getEndpointOperation(method, path);

  if (!operation) {
    return (
      <PageContainer>
        <PageContent>
          <div className="text-center py-12">
            <p className="text-zinc-400">Endpoint not found</p>
            <Link href="/admin/api-explorer" className="text-green-400 hover:underline mt-4 inline-block">
              Back to endpoints
            </Link>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  // Separate parameters by type
  const allParams = operation.parameters || [];
  const pathParams = allParams.filter((p) => p.in === "path");
  const queryParams = allParams.filter((p) => p.in === "query");

  // Get request body properties
  const requestBody = operation.requestBody?.content?.["application/json"]?.schema;
  const bodyFields = requestBody?.properties
    ? Object.entries(requestBody.properties).map(([name, prop]) => ({
        name,
        type: (prop as SchemaProperty).type || "any",
        required: false,
        description: "",
        example: (prop as SchemaProperty).example,
      }))
    : [];

  const exampleUrl = generateExampleUrl(path, pathParams, queryParams);
  const responseFields = extractResponseFields(operation);
  const responseDescription = getResponseDescription(operation);
  const intendedUse = generateIntendedUse(operation, method, path);

  // Clean up description - remove extra whitespace and HTML tags
  const cleanDescription = (operation.description || operation.summary || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\n\n+/g, " ")
    .trim();

  return (
    <PageContainer>
      <PageContent>
        <div className="max-w-4xl space-y-8">
          {/* Back link */}
          <Link
            href="/admin/api-explorer"
            className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to endpoints
          </Link>

          {/* Method and Path */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`font-mono font-bold text-lg ${getMethodColor(method)}`}>
                {method}
              </span>
              <span className="font-mono text-lg text-white">{path}</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">{cleanDescription}</p>
          </div>

          {/* Expected Inputs */}
          {(pathParams.length > 0 || queryParams.length > 0 || bodyFields.length > 0) && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-green-400">Expected Inputs</h2>

              {pathParams.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-zinc-400">Path Parameters</h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Name</TableHead>
                        <TableHead className="text-zinc-400">Type</TableHead>
                        <TableHead className="text-zinc-400">Required</TableHead>
                        <TableHead className="text-zinc-400">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pathParams.map((param) => (
                        <TableRow key={param.name} className="border-zinc-800">
                          <TableCell className="font-mono text-green-400">{param.name}</TableCell>
                          <TableCell className="text-zinc-400">{param.schema?.type || "string"}</TableCell>
                          <TableCell className="text-zinc-400">Yes</TableCell>
                          <TableCell className="text-zinc-300">{param.description?.replace(/<[^>]*>/g, "") || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {queryParams.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-zinc-400">Query Parameters</h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Name</TableHead>
                        <TableHead className="text-zinc-400">Type</TableHead>
                        <TableHead className="text-zinc-400">Required</TableHead>
                        <TableHead className="text-zinc-400">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryParams.map((param) => (
                        <TableRow key={param.name} className="border-zinc-800">
                          <TableCell className="font-mono text-green-400">{param.name}</TableCell>
                          <TableCell className="text-zinc-400">{param.schema?.type || "string"}</TableCell>
                          <TableCell className="text-zinc-400">{param.required ? "Yes" : "No"}</TableCell>
                          <TableCell className="text-zinc-300">{param.description?.replace(/<[^>]*>/g, "") || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {bodyFields.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-zinc-400">Request Body</h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Field</TableHead>
                        <TableHead className="text-zinc-400">Type</TableHead>
                        <TableHead className="text-zinc-400">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bodyFields.slice(0, 10).map((field) => (
                        <TableRow key={field.name} className="border-zinc-800">
                          <TableCell className="font-mono text-green-400">{field.name}</TableCell>
                          <TableCell className="text-zinc-400">{field.type}</TableCell>
                          <TableCell className="text-zinc-300">{field.description || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Example Request */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-green-400">Example Request</h2>
            <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm">
              <span className={getMethodColor(method)}>{method}</span>
              <span className="text-zinc-300 ml-2">{exampleUrl}</span>
            </div>
          </div>

          {/* Response Shape */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-green-400">Response Shape</h2>
            <p className="text-zinc-400">{responseDescription}</p>
            {responseFields.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Field</TableHead>
                    <TableHead className="text-zinc-400">Type</TableHead>
                    <TableHead className="text-zinc-400">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responseFields.map((field) => (
                    <TableRow key={field.field} className="border-zinc-800">
                      <TableCell className="font-mono text-green-400">{field.field}</TableCell>
                      <TableCell className="text-zinc-400">{field.type}</TableCell>
                      <TableCell className="text-zinc-300">{field.description || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Intended Use */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-green-400">Intended Use</h2>
            <p className="text-zinc-300 leading-relaxed">{intendedUse}</p>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}
