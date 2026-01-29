import Link from "next/link";

type Props = {
  showNav?: boolean;
};

export default function Header({ showNav = true }: Props) {
  return (
    <header className="w-full border-b border-stone-200 bg-cream">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Small potato icon */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="group-hover:scale-110 transition-transform"
          >
            <ellipse cx="60" cy="60" rx="35" ry="42" fill="#E8D5B7" stroke="#5D4E37" strokeWidth="3" />
            <circle cx="45" cy="48" r="3" fill="#C4A574" />
            <circle cx="72" cy="52" r="2.5" fill="#C4A574" />
            <circle cx="50" cy="80" r="2" fill="#C4A574" />
            <circle cx="50" cy="55" r="3" fill="#5D4E37" />
            <circle cx="70" cy="55" r="3" fill="#5D4E37" />
            <ellipse cx="42" cy="63" rx="5" ry="3" fill="#E8B4B4" opacity="0.6" />
            <ellipse cx="78" cy="63" rx="5" ry="3" fill="#E8B4B4" opacity="0.6" />
            <path d="M52 68 Q60 78 68 68" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-stone-800 leading-tight">Couch Potato</span>
            <span className="text-xs text-stone-500 italic">from couch potato to hot chip</span>
          </div>
        </Link>

        {showNav && (
          <nav className="flex items-center gap-4">
            <Link
              href="/goal"
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              New Plan
            </Link>
            <Link
              href="/plans"
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              My Plans
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
