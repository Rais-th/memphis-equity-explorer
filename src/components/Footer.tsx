import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
        <span>Public records. Aggregated for transparency.</span>
        <Link href="/about" className="hover:text-fg transition-colors">Methodology</Link>
        <Link href="/data" className="hover:text-fg transition-colors">Download</Link>
        <a
          href="https://github.com/Rais-th/memphis-equity-explorer"
          className="hover:text-fg transition-colors"
          target="_blank"
          rel="noreferrer"
        >
          Source
        </a>
        <span className="ml-auto">Popuzar LLC · MIT license · Data CC BY 4.0 Memphis Data Hub</span>
      </div>
    </footer>
  );
}
