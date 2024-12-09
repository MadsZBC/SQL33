import Link from "next/link";

export default function Home() {
  return (
    <div className="grid min-h-screen place-items-center p-8">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold">Hotel Database System</h1>
        <nav className="flex gap-4">
          <Link 
            href="/documentation"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Technical Documentation
          </Link>
          <Link 
            href="/schema"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Database Schema
          </Link>
        </nav>
      </main>
    </div>
  );
}
