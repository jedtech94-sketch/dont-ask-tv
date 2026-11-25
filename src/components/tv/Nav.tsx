import { Link } from "@tanstack/react-router";
import { Bookmark, Clapperboard, Film, Home, Radio, Search, Settings, Trophy, Tv } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/movies", label: "Movies", icon: Film },
  { to: "/series", label: "Series", icon: Clapperboard },
  { to: "/live", label: "Live TV", icon: Radio },
  { to: "/sports", label: "Sports", icon: Trophy },
  { to: "/my-list", label: "My List", icon: Bookmark },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-1.5 font-display text-2xl text-primary md:text-3xl" aria-label="DONT ASK TV home">
      DONT ASK <Tv className="h-5 w-5 md:h-6 md:w-6" aria-hidden /> <span>TV</span>
    </Link>
  );
}

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 transition-colors duration-300", scrolled ? "bg-background/95 backdrop-blur" : "bg-gradient-to-b from-background/90 to-transparent")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-primary focus:px-3 focus:py-2">Skip to content</a>
      <nav className="flex h-16 items-center gap-6 px-4 sm:px-8 lg:px-12" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-5 md:flex">
          {NAV.map((n) => (
            <li key={n.to}>
              <Link to={n.to} activeOptions={{ exact: n.to === "/" }} className="text-sm text-muted-foreground transition hover:text-foreground" activeProps={{ className: "text-sm font-semibold !text-foreground" }}>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-1">
          <Link to="/search" aria-label="Search" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent" activeProps={{ className: "bg-accent" }}>
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/admin" aria-label="Admin and settings" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent" activeProps={{ className: "bg-accent" }}>
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function BottomNav() {
  return (
    <nav aria-label="Primary mobile" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-6">
        {NAV.map((n) => (
          <li key={n.to}>
            <Link to={n.to} activeOptions={{ exact: n.to === "/" }} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] text-muted-foreground" activeProps={{ className: "!text-foreground" }}>
              <n.icon className="h-5 w-5" aria-hidden />
              {n.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t px-4 py-10 pb-24 text-xs text-muted-foreground sm:px-8 md:pb-10 lg:px-12">
      <p>
        Real catalogue data and artwork from{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="underline">TMDB</a>.
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
      <p className="mt-2">
        Free films from the{" "}
        <a href="https://archive.org" target="_blank" rel="noreferrer" className="underline">Internet Archive</a>;
        sports data from{" "}
        <a href="https://www.thesportsdb.com" target="_blank" rel="noreferrer" className="underline">TheSportsDB</a>.
        Live streams play on the broadcaster's platform; rights remain with their owners.
      </p>
      <p className="mt-2">Only add streams you are licensed or otherwise authorized to access.</p>
    </footer>
  );
}
