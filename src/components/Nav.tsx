import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium tracking-tight">
          Memphis 911 &amp; Enforcement Equity Explorer
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link href="/" className="hover:text-fg transition-colors">Dashboard</Link>
          <Link href="/data" className="hover:text-fg transition-colors">Data</Link>
          <Link href="/about" className="hover:text-fg transition-colors">About</Link>
        </nav>
      </div>
    </header>
  );
}
