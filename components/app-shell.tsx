"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, Blocks, Box, ChevronDown, CircleUserRound, Code2, FolderKanban,
  GitBranch, Menu, PenLine, Settings, ShieldCheck, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Brand } from "./brand";
import { useScopeStore } from "@/lib/store/use-scope-store";

const navigation = [
  { href: "/intake", label: "Intake", icon: PenLine },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/graph", label: "Engineering Graph", icon: GitBranch },
  { href: "/build", label: "Build", icon: Code2 },
  { href: "/proof", label: "Proof", icon: ShieldCheck },
  { href: "/integrations", label: "Integrations", icon: Blocks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, view }: { children: React.ReactNode; view: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = useScopeStore((state) => state.notifications);
  const markNotificationsRead = useScopeStore((state) => state.markNotificationsRead);
  const toast = useScopeStore((state) => state.toast);
  const showToast = useScopeStore((state) => state.showToast);
  const unread = notifications.filter((item) => !item.read).length;
  const activeRoot = pathname.split("/")[1] || view.split("/")[0];

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => showToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast, showToast]);

  return (
    <div className="app-frame">
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <Brand />
          <button className="mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
        <nav aria-label="Primary navigation">
          {navigation.map(({ href, label, icon: Icon }, index) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={activeRoot === href.slice(1) ? "active" : index === 5 ? "nav-divider" : ""}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <Box size={17} />
          <p>From idea to evidence.</p>
          <span>One graph. Full control.</span>
        </div>
        <Link href="/settings" className="user-card">
          <span className="avatar">NB</span>
          <span><strong>Niloy Bhuiyan</strong><small>ScopeForce workspace</small></span>
          <ChevronDown size={16} />
        </Link>
      </aside>
      {mobileOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <main className="main-shell">
        <header className="topbar">
          <div className="project-crumb"><span>CampusLink</span><i>Demo project</i></div>
          <button className="icon-button notification-button" aria-label={`${unread} unread notifications`} onClick={() => setNotificationsOpen((open) => !open)}>
            <Bell size={20} />{unread > 0 && <span>{unread}</span>}
          </button>
        </header>
        <div className="page-wrap">{children}</div>
      </main>
      <AnimatePresence>
        {notificationsOpen && (
          <motion.aside className="notification-drawer" initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ duration: 0.22 }}>
            <div className="drawer-head"><div><span className="eyebrow">Activity</span><h2>Notifications</h2></div><button className="icon-button" aria-label="Close notifications" onClick={() => setNotificationsOpen(false)}><X size={18} /></button></div>
            <button className="text-button" onClick={markNotificationsRead}>Mark all read</button>
            <div className="notification-list">
              {notifications.map((item) => <article key={item.id} className={`notification-item ${item.kind} ${item.read ? "read" : ""}`}><i /><div><strong>{item.title}</strong><p>{item.detail}</p><small>CampusLink · just now</small></div></article>)}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div role="status" className="toast" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}><CircleUserRound size={18} />{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

