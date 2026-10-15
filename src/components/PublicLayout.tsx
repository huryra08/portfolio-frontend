import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ExternalLink, Menu, X } from "lucide-react";
import { useProfile } from "@/api/profile";

const links = [
  { href: "/#projects", label: "Work" },
  { href: "/#skills", label: "Skills" },
  { href: "/#experience", label: "Experience" },
  { href: "/#education", label: "Education" },
  { href: "/#certificates", label: "Certificates" },
  { href: "/#contact", label: "Contact" },
];

export default function PublicLayout() {
  const { data: profile } = useProfile();
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => setOpen(false), [pathname, hash]);

  const name = profile?.fullName ?? "Portfulio";

  return (
    <div className="dotgrid min-h-screen">
      <a href="#main" className="sr-only rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight">
            {name}
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link key={link.href} to={link.href} className="rounded-full px-4 py-2 text-[15px] font-medium text-mute hover:bg-ink/5 hover:text-ink">
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="rounded-full p-2 hover:bg-ink/5 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>

        {open && (
          <nav id="mobile-nav" aria-label="Main" className="border-t border-line bg-paper px-5 py-3 md:hidden">
            {links.map((link) => (
              <Link key={link.href} to={link.href} className="block rounded-lg px-3 py-3 text-lg font-semibold hover:bg-ink/5">
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-mute">
          <p>
            {new Date().getFullYear()} {name}
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {profile?.socialLinks.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-ink">
                  {link.platform}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </li>
            ))}
            <li>
              <Link to="/admin" className="hover:text-ink">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
