"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { trpc } from "../../../lib/trpc";
import { isAuthenticated, clearToken } from "../../../lib/auth";
import { NotificationBell } from "../../../components/NotificationBell";
import { ThemeToggle } from "../../../components/ThemeToggle";

const navItems = [
  { href: "/provider", label: "Dashboard", icon: "📊" },
  { href: "/provider/quotes", label: "Quotes", icon: "📝" },
  { href: "/provider/jobs", label: "Jobs", icon: "📋" },
  { href: "/provider/crews", label: "Crews", icon: "👷" },
  { href: "/provider/profile", label: "Profile", icon: "⚙️" },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    trpc.auth.me.query().then((u) => {
      if (u.role !== "PROVIDER") { router.push("/"); return; }
      setUser(u);
      setLoading(false);
    }).catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = () => { clearToken(); router.push("/"); };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-gray-500 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <header className="bg-white dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-green-700 dark:text-green-400">
              Exterior Pro <span className="text-sm font-normal text-gray-400 dark:text-neutral-500">Provider</span>
            </h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell />
              <span className="text-sm text-gray-500 dark:text-neutral-400">{user?.providerProfile?.businessName}</span>
              <button onClick={handleLogout} className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-white">Sign Out</button>
            </div>
          </div>
          <nav className="flex gap-1 -mb-px">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/provider" && pathname?.startsWith(item.href));
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-green-500 text-green-600 dark:text-green-400"
                      : "border-transparent text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-neutral-600"
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6">{children}</main>
    </div>
  );
}
