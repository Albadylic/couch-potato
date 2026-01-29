import Link from "next/link";
import { PotatoMascot, PotatoRunning } from "./components/PotatoMascot";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col items-center justify-center gap-8 px-4 py-12">
      {/* Hero potato */}
      <div className="relative">
        <PotatoMascot size={180} className="drop-shadow-lg" />
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-4 w-3 h-3 bg-sage rounded-full opacity-60" />
        <div className="absolute -bottom-1 -left-6 w-4 h-4 bg-potato-body rounded-full opacity-40" />
      </div>

      {/* Welcome text */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-stone-dark">
          Ready to get moving?
        </h1>
        <p className="text-lg text-stone max-w-md">
          Your friendly potato coach will help you go from couch potato to hot chip, one run at a time.
        </p>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Link
          href="/goal"
          className="btn-primary flex items-center gap-2 text-lg"
        >
          <PotatoRunning size={28} />
          Start Training
        </Link>
        <Link
          href="/plans"
          className="btn-secondary text-lg"
        >
          My Plans
        </Link>
      </div>

      {/* Fun footer note */}
      <p className="text-sm text-stone italic mt-8">
        No actual potatoes were harmed in the making of this app
      </p>
    </main>
  );
}
