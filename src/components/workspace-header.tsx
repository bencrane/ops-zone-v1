'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Home } from 'lucide-react';

interface Workspace {
  id: number;
  name: string;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function WorkspaceHeader() {
  const [current, setCurrent] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Read workspace data from the script tag injected by server
    const script = document.getElementById('workspace-data');
    if (script) {
      try {
        const data = JSON.parse(script.textContent || '{}');
        setCurrent(data.current);
        setWorkspaces(data.all || []);
      } catch (e) {
        console.error('Failed to parse workspace data:', e);
      }
    }
  }, []);

  function handleSwitch(ws: Workspace) {
    const newSlug = toSlug(ws.name);
    // Replace current workspace slug in pathname
    const pathParts = pathname.split('/');
    pathParts[1] = newSlug;
    router.push(pathParts.join('/'));
    setOpen(false);
  }

  if (!current) return null;

  const currentSlug = toSlug(current.name);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between">
        {/* Left: Home + Workspace Switcher */}
        <div className="flex items-center gap-4">
          <Link 
            href={`/${currentSlug}`}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <Home className="h-5 w-5" />
          </Link>
          
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <span className="text-white font-medium">{current.name}</span>
              <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            
            {open && workspaces.length > 1 && (
              <div className="absolute top-full left-0 mt-2 w-48 py-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => handleSwitch(ws)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-800 transition-colors ${
                      ws.id === current.id ? 'text-white bg-zinc-800' : 'text-zinc-400'
                    }`}
                  >
                    {ws.name}
                    <span className="text-zinc-600 ml-2 font-mono text-xs">/{toSlug(ws.name)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Could add more nav items here */}
        <div className="flex items-center gap-4">
          <span className="text-zinc-600 text-sm font-mono">/{currentSlug}</span>
        </div>
      </div>
    </header>
  );
}

