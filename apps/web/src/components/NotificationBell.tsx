"use client";

import { useState, useEffect, useRef } from "react";
import { trpc } from "../lib/trpc";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchCount = () => {
      trpc.notification.getUnreadCount.query().then((r) => setUnreadCount(r.count)).catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) {
      setLoading(true);
      trpc.notification.list.query({ limit: 20 }).then((r) => setNotifications(r.items)).catch(console.error).finally(() => setLoading(false));
    }
  };

  const handleMarkRead = async (id: string) => {
    await trpc.notification.markRead.mutate({ id });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await trpc.notification.markAllRead.mutate();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-xl dark:shadow-neutral-900/50 border border-gray-200 dark:border-neutral-800 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && <div className="p-4 text-center text-gray-500 dark:text-neutral-400 text-sm">Loading...</div>}
            {!loading && notifications.length === 0 && <div className="p-8 text-center text-gray-400 dark:text-neutral-500 text-sm">No notifications yet</div>}
            {!loading && notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => { if (!n.read) handleMarkRead(n.id); }}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${
                  !n.read ? "bg-cyan-50/50 dark:bg-cyan-950/30" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="w-2 h-2 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0" />}
                  <div className={!n.read ? "" : "pl-4"}>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</div>
                    <div className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{n.body}</div>
                    <div className="text-xs text-gray-400 dark:text-neutral-500 mt-1">{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
