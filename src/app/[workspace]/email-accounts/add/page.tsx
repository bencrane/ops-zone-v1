"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { ArrowLeft, Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceNav } from "@/hooks/use-workspace-nav";

interface ParsedCSV {
  data: Record<string, string>[];
  headers: string[];
  fileName: string;
  rowCount: number;
}

export default function AddEmailAccountsPage() {
  const { href } = useWorkspaceNav();
  const [isDragging, setIsDragging] = useState(false);
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Parse error: ${results.errors[0].message}`);
          return;
        }
        const headers = results.meta.fields || [];
        if (headers.length === 0) {
          setError("CSV file appears to be empty or has no headers");
          return;
        }
        setParsedCSV({ data: results.data, headers, fileName: file.name, rowCount: results.data.length });
      },
      error: (err) => setError(`Failed to parse CSV: ${err.message}`),
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFile(files[0]);
  }, [handleFile]);

  const handleClear = useCallback(() => { setParsedCSV(null); setError(null); }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Add Email Accounts</h1>
            <p className="text-zinc-400 mt-1">Import email accounts from a CSV file</p>
          </div>
          <Link href={href("/email-accounts")} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Email Accounts
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          {!parsedCSV ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer ${
                isDragging ? "border-white bg-white/5 scale-[1.02]" : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50"
              }`}
            >
              <input type="file" accept=".csv" onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-200 ${isDragging ? "bg-white text-black" : "bg-zinc-800 text-zinc-400"}`}>
                <Upload className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-white">{isDragging ? "Drop your CSV here" : "Drag & drop your CSV file"}</p>
                <p className="text-sm text-zinc-500 mt-1">or click to browse</p>
              </div>
            </div>
          ) : (
            <div className="border border-zinc-700 rounded-xl bg-zinc-900/50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{parsedCSV.fileName}</p>
                    <p className="text-sm text-zinc-500">{parsedCSV.rowCount} rows • {parsedCSV.headers.length} columns</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClear} className="text-zinc-400 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Detected Columns</p>
                <div className="flex flex-wrap gap-2">
                  {parsedCSV.headers.map((header) => (
                    <span key={header} className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700">{header}</span>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Preview (first 3 rows)</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {parsedCSV.headers.map((header) => (
                          <th key={header} className="text-left py-2 px-3 text-zinc-400 font-medium whitespace-nowrap">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedCSV.data.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-b border-zinc-800/50">
                          {parsedCSV.headers.map((header) => (
                            <td key={header} className="py-2 px-3 text-zinc-300 whitespace-nowrap max-w-[200px] truncate">
                              {row[header] || <span className="text-zinc-600">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800/30 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">CSV parsed successfully</span>
                </div>
                <Button className="bg-white text-black hover:bg-zinc-200">Continue</Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

