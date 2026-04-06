"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#services", label: "Services" },
  { href: "#plans", label: "Plans" },
  { href: "#providers", label: "For Providers" },
  { href: "#app", label: "App" },
] as const;

const navTransition = {
  type: "spring" as const,
  stiffness: 100,
  damping: 15,
  mass: 0.5,
  duration: 0.2,
  ease: "linear" as const,
};

function useHtmlDarkClass() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setIsDark(el.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/** Pixels from viewport top; section is “current” once its top crosses this line (below fixed nav). */
const SECTION_ACTIVATION_OFFSET_PX = 100;

function useActiveSectionHref(
  links: readonly { href: string }[]
): [activeHref: string, setActiveHref: (href: string) => void] {
  const [activeHref, setActiveHref] = useState("");

  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));

    let frame = 0;
    const update = () => {
      const ordered = ids
        .map((id) => {
          const el = document.getElementById(id);
          return el ? { id, el } : null;
        })
        .filter(Boolean) as { id: string; el: HTMLElement }[];

      if (ordered.length === 0) {
        setActiveHref((prev) => (prev === "" ? prev : ""));
        return;
      }

      ordered.sort((a, b) => {
        const rel = a.el.compareDocumentPosition(b.el);
        if (rel & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (rel & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });

      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollBottom >= docHeight - 2) {
        const href = `#${ordered[ordered.length - 1].id}`;
        setActiveHref((prev) => (prev === href ? prev : href));
        return;
      }

      let current = "";
      for (const { id, el } of ordered) {
        const top = el.getBoundingClientRect().top;
        if (top <= SECTION_ACTIVATION_OFFSET_PX) current = `#${id}`;
      }

      setActiveHref((prev) => (prev === current ? prev : current));
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [links]);

  return [activeHref, setActiveHref];
}

function MobileNavLinks({
  activeHref,
  onNavigate,
  onSectionSelect,
}: {
  activeHref: string;
  onNavigate: () => void;
  onSectionSelect: (href: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {navLinks.map((link, i) => {
        const isActive = activeHref === link.href;
        return (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <a
              href={link.href}
              onClick={() => {
                onSectionSelect(link.href);
                onNavigate();
              }}
              className={cn(
                "block w-full rounded-lg px-4 py-3 text-left text-lg font-medium transition-colors",
                isActive
                  ? "bg-primary/50 text-white"
                  : "text-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              {link.label}
            </a>
          </motion.div>
        );
      })}
    </div>
  );
}

export function HomeNav() {
  const router = useRouter();
  const isDark = useHtmlDarkClass();
  const [activeHref, setActiveHref] = useActiveSectionHref(navLinks);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled((prev) =>
        scrollY > 80 ? true : scrollY < 20 ? false : prev
      );
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const scrolledBg = isDark ? "rgba(12,10,9,0.7)" : "rgba(255,255,255,0.7)";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";
  const idleBg = isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const idleShadow = "0 1px 2px rgba(0,0,0,0.04)";
  const scrolledShadow = isDark
    ? "0 1px 3px rgba(0,0,0,0.4)"
    : "0 1px 3px rgba(0,0,0,0.1)";

  return (
    <motion.div
      className="fixed left-0 right-0 z-50"
      initial={false}
      animate={{
        top: isScrolled ? 8 : 0,
        paddingLeft: isScrolled ? 16 : 0,
        paddingRight: isScrolled ? 16 : 0,
      }}
      transition={navTransition}
    >
      <div className="flex justify-center">
        <motion.nav
          className="w-full overflow-hidden shadow-lg backdrop-blur-xl"
          style={{ borderStyle: "solid", borderColor }}
          initial={false}
          animate={{
            backgroundColor: isScrolled ? scrolledBg : idleBg,
            boxShadow: isScrolled ? scrolledShadow : idleShadow,
            borderRadius: isScrolled ? 9999 : 0,
            borderTopWidth: isScrolled ? 1 : 0,
            borderLeftWidth: isScrolled ? 1 : 0,
            borderRightWidth: isScrolled ? 1 : 0,
            borderBottomWidth: 1,
            maxWidth: isScrolled ? 1280 : 10000,
          }}
          transition={navTransition}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="#home" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logos/logo-stacked.png"
                alt="Exterior Pro"
                width={84}
                height={32}
              />
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setActiveHref(link.href)}
                    className={cn(
                      "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/login")}
                className="hidden rounded-full bg-foreground px-5 text-background hover:bg-foreground/90 dark:bg-white dark:text-black dark:hover:bg-white/90 sm:inline-flex"
              >
                Get Started
              </Button>

              <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-foreground md:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </DialogTrigger>
                <DialogContent
                  className={cn(
                    "fixed left-auto right-0 top-0 z-[100] flex h-full max-h-none w-full max-w-sm translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none border-l p-6 pt-14 shadow-lg",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                  )}
                >
                  <DialogHeader className="mb-4 text-left">
                    <DialogTitle className="sr-only">Menu</DialogTitle>
                  </DialogHeader>
                  <MobileNavLinks
                    activeHref={activeHref}
                    onNavigate={closeMobile}
                    onSectionSelect={setActiveHref}
                  />
                  <motion.div
                    className="mt-6 flex flex-col gap-2 border-t border-border pt-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.05 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        closeMobile();
                        router.push("/login");
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                      size="lg"
                      onClick={() => {
                        closeMobile();
                        router.push("/login");
                      }}
                    >
                      Get Started
                    </Button>
                  </motion.div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.nav>
      </div>
    </motion.div>
  );
}
