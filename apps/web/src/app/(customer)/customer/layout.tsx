"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Wrench, MapPin, FileText, ClipboardList } from "lucide-react";
import { trpc } from "../../../lib/trpc";
import { isAuthenticated, clearToken } from "../../../lib/auth";
import { NotificationBell } from "../../../components/NotificationBell";
import { ThemeToggle } from "../../../components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/customer", label: "Home", icon: Home },
  { href: "/customer/services", label: "Services", icon: Wrench },
  { href: "/customer/properties", label: "Properties", icon: MapPin },
  { href: "/customer/quotes", label: "Quotes", icon: FileText },
  { href: "/customer/jobs", label: "Jobs", icon: ClipboardList },
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-foreground">Exterior Pro</h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell />
              <span className="text-sm text-muted-foreground">
                {user?.customerProfile?.firstName} {user?.customerProfile?.lastName}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                Sign Out
              </Button>
            </div>
          </div>
          <nav className="flex gap-1 -mb-px">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/customer" && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "rounded-none border-b-2 border-transparent px-4 py-3 h-auto font-medium",
                    isActive
                      ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      : "text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <Icon className="mr-1.5 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
