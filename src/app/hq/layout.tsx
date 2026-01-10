import Link from 'next/link';

export default function HQLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      {/* HQ Header */}
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link 
            href="/hq"
            className="text-white font-semibold text-lg hover:text-zinc-300 transition-colors"
          >
            hq
          </Link>
          <span className="text-zinc-600 text-sm font-mono">/hq</span>
        </div>
      </header>
      
      <main>{children}</main>
    </div>
  );
}

