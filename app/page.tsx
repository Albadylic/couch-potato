import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Welcome</h1>

      <p className="text-gray-600">
        Build a personalized running plan in minutes.
      </p>

      <div className="flex gap-4">
        <Link
          href="/goal"
          className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Get Started
        </Link>
        <Link
          href="/plans"
          className="rounded border border-gray-300 px-6 py-3 text-gray-700 hover:border-gray-400"
        >
          My Plans
        </Link>
      </div>
    </main>
  );
}
