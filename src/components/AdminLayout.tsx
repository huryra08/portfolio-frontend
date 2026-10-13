import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, ExternalLink, FolderKanban, Inbox, LayoutDashboard, LogOut, Menu, UserRound, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { useLogout, useMe } from "@/api/auth";
import { useMessages } from "@/api/messages";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/skills", label: "Skills", icon: Wrench },
  { to: "/admin/experience", label: "Experience", icon: Briefcase },
  { to: "/admin/profile", label: "Profile", icon: UserRound },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
];

export default function AdminLayout() {
  const { data: user } = useMe();
  const { data: messages } = useMessages();
  const logout = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const unread = messages?.filter((message) => !message.isRead).length ?? 0;

  const handleLogout = () =>
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success("Logged out");
        navigate("/admin/login", { replace: true });
      },
    });

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="px-3 py-2 font-display text-xl font-extrabold">
        Portfulio
      </Link>
      <nav aria-label="Admin" className="mt-6 flex flex-1 flex-col gap-1">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold transition-colors", isActive ? "bg-marigold text-ink" : "text-ink/75 hover:bg-ink/5 hover:text-ink")
            }
          >
            <Icon className="size-5" aria-hidden />
            <span className="flex-1">{label}</span>
            {label === "Messages" && unread > 0 && (
              <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-white" aria-label={`${unread} unread`}>
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-line pt-4">
        <Link to="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold text-ink/75 hover:bg-ink/5 hover:text-ink">
          <ExternalLink className="size-5" aria-hidden />
          View site
        </Link>
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] font-semibold text-ink/75 hover:bg-ink/5 hover:text-ink">
          <LogOut className="size-5" aria-hidden />
          Log out
        </button>
        <p className="truncate px-3 pt-2 text-sm text-mute">{user?.email}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper md:grid md:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-white/60 p-4 md:block">{sidebar}</aside>

      <div className="flex items-center justify-between border-b border-line bg-white/60 px-4 py-3 md:hidden">
        <span className="font-display text-lg font-extrabold">Portfulio</span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-full p-2 hover:bg-ink/5">
          <Menu className="size-6" aria-hidden />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-paper p-4 shadow-2xl">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 rounded-full p-2 hover:bg-ink/5">
              <X className="size-5" aria-hidden />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
