"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { trpc } from "../../../lib/trpc";
import { isAuthenticated, clearToken } from "../../../lib/auth";
import { NotificationBell } from "../../../components/NotificationBell";
import { ThemeToggle } from "../../../components/ThemeToggle";

const navItems = [
  { href: "/customer", label: "Home", icon: "🏠" },
  { href: "/customer/services", label: "Services", icon: "🔧" },
  { href: "/customer/properties", label: "Properties", icon: "📍" },
  { href: "/customer/quotes", label: "Quotes", icon: "📝" },
  { href: "/customer/jobs", label: "Jobs", icon: "📋" },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    trpc.auth.me.query().then((u) => {
      if (u.role !== "CUSTOMER") { router.push("/"); return; }
      setUser(u);
      setLoading(false);
    }).catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = () => { clearToken(); router.push("/"); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-gray-500 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <header className="bg-white dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Exterior Pro</h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell />
              <span className="text-sm text-gray-500 dark:text-neutral-400">
                {user?.customerProfile?.firstName} {user?.customerProfile?.lastName}
              </span>
              <button onClick={handleLogout} className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-white">
                Sign Out
              </button>
            </div>
          </div>
          <nav className="flex gap-1 -mb-px">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/customer" && pathname?.startsWith(item.href));
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
