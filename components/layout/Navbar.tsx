"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/70 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-[20px]">
      <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center px-4 sm:px-6 lg:px-8">
        <Link className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl" href="/">
          Axiro Capital
        </Link>
      </div>
    </nav>
  );
}
