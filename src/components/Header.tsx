import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Hospital,
  Menu,
  MessageCircle,
  Sparkles,
  Star,
  Stethoscope,
  X,
  type LucideIcon,
} from "lucide-react";
import { PawMark } from "./decor/Decor";
import Logo from "./Logo";
import { useBooking } from "./BookingProvider";

/**
 * The Laravel admin. Only staff sign in here — customers have no accounts —
 * so it's a quiet secondary link rather than a primary call to action.
 */
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? "http://localhost:8000/admin";

const NAV = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

/**
 * Reasons to trust the clinic, in place of the old shop categories. Each links
 * to the section that backs it up, and each is grounded in something real: the
 * doctors' M.V.Sc qualifications, the client's brief for online consultancy,
 * the pamphlet's equipment list, and the review tags and 4.8 rating on their
 * Justdial listing.
 */
const HIGHLIGHTS = [
  { label: "Expert doctors", Icon: Stethoscope, href: "#vets" },
  { label: "Online consultancy", Icon: MessageCircle, href: "#home" },
  { label: "Modern facilities", Icon: Hospital, href: "#facilities" },
  { label: "Clean equipment", Icon: Sparkles, href: "#facilities" },
  { label: "Gentle care", Icon: Heart, href: "#reviews" },
  { label: "Rated 4.8", Icon: Star, href: "#reviews" },
];

export function TopBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Read synchronously so the wide row doesn't flash the carousel first.
  const [isWide, setIsWide] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setIsWide(wide.matches);
      setReduceMotion(motion.matches);
    };
    sync();
    wide.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  const go = (step: number) =>
    setIndex((i) => (i + step + HIGHLIGHTS.length) % HIGHLIGHTS.length);

  useEffect(() => {
    if (isWide || paused || reduceMotion) return;
    const t = setTimeout(() => go(1), 3500);
    return () => clearTimeout(t);
  }, [index, isWide, paused, reduceMotion]);

  const link = (
    label: string,
    Icon: LucideIcon,
    href: string,
    active = true,
    compact = false
  ) => (
    <a
      href={href}
      tabIndex={active ? undefined : -1}
      className={
        compact
          ? // Wide row: tightened so all six fit from 1024px up, easing back out
            // to full size on larger screens.
            "flex items-center justify-center gap-2 whitespace-nowrap font-display text-[11px] font-extrabold uppercase tracking-[0.06em] transition hover:text-gold xl:gap-2.5 xl:text-[12px] xl:tracking-[0.1em] 2xl:text-[13px] 2xl:tracking-[0.14em]"
          : "flex items-center justify-center gap-2.5 whitespace-nowrap font-display text-[13px] font-extrabold uppercase tracking-[0.14em] transition hover:text-gold"
      }
    >
      <Icon
        className={`shrink-0 text-gold ${compact ? "h-4 w-4 xl:h-4.5 xl:w-4.5" : "h-4.5 w-4.5"}`}
        aria-hidden="true"
      />
      {label}
    </a>
  );

  return (
    <div className="p-3 md:p-5">
      <nav aria-label="Why K-Petz" className="rounded-2xl bg-bark text-cream">
        {isWide ? (
          <ul className="flex items-center justify-between gap-2 px-4 py-4 xl:gap-3 xl:px-8 2xl:px-10">
            {HIGHLIGHTS.map(({ label, Icon, href }) => (
              <li key={label} className="shrink-0">
                {link(label, Icon, href, true, true)}
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="flex items-center gap-2 px-4 py-6"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <button
              onClick={() => go(-1)}
              aria-label="Previous highlight"
              className="shrink-0 p-1 transition hover:text-gold"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* All six stay in the DOM — only the active one is visible, so the
                links stay crawlable and the track can slide between them. */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <ul
                className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {HIGHLIGHTS.map(({ label, Icon, href }, i) => (
                  <li
                    key={label}
                    className="w-full shrink-0"
                    aria-hidden={i !== index || undefined}
                  >
                    {link(label, Icon, href, i === index)}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => go(1)}
              aria-label="Next highlight"
              className="shrink-0 p-1 transition hover:text-gold"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}

export function Header() {
  const { openBooking } = useBooking();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 160);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
    return () => document.body.classList.remove("no-scroll");
  }, [open]);

  return (
    <header
      className={
        stuck
          ? "fixed inset-x-0 top-0 z-40 bg-cream text-ink shadow-[0_10px_40px_-24px_rgba(42,39,36,0.55)] transition-colors"
          : "absolute inset-x-0 top-0 z-40 text-cream transition-colors"
      }
    >
      <div className="px-3 md:px-5">
        <div className="container-x flex items-center justify-between gap-3 py-4 sm:gap-6 lg:py-6">
          <a href="#home" className="flex shrink-0 items-center gap-2">
            <Logo className="h-12 w-12 shrink-0 max-[279px]:h-9 max-[279px]:w-9 sm:h-14 sm:w-14" />
            <span className="font-display text-[20px] font-black leading-none tracking-tight max-[279px]:text-[16px] sm:text-[24px]">
              K-Petz
              <span className="block whitespace-nowrap text-[9px] font-extrabold uppercase tracking-[0.12em] opacity-70 max-[279px]:text-[7px] max-[279px]:tracking-[0.02em] sm:text-[10px] sm:tracking-[0.18em]">
                Hospital Online
              </span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden xl:block">
            <ul
              className={`flex items-center gap-8 rounded-full px-9 py-3.5 font-display text-[13px] font-extrabold uppercase tracking-[0.14em] ${
                stuck ? "" : "bg-white/10 backdrop-blur-sm"
              }`}
            >
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition hover:text-brand">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden font-display text-[12px] font-extrabold uppercase tracking-[0.14em] opacity-70 transition hover:text-gold hover:opacity-100 lg:inline-flex"
            >
              Staff login
            </a>
            <button
              onClick={() => openBooking()}
              className="btn btn-primary hidden lg:inline-flex"
            >
              Get in touch
            </button>
            <button
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full sm:h-11 sm:w-11 xl:hidden ${
                stuck ? "bg-ink text-cream" : "bg-white/15 text-cream backdrop-blur-sm"
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden transition-[visibility] xl:hidden ${
          open ? "visible" : "invisible pointer-events-none"
        }`}
        style={{ transitionDelay: open ? "0ms" : "300ms" }}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/60 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-cream p-6 text-ink shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-black">Menu</span>
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="grid h-11 w-11 place-items-center rounded-full bg-ink text-cream"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Mobile" className="mt-8">
            <ul className="grid gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-4 font-display text-lg font-extrabold transition hover:bg-sand"
                  >
                    {item.label}
                    <PawMark className="h-4 w-4 text-brand" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto grid gap-3">
            <button
              onClick={() => {
                setOpen(false);
                openBooking();
              }}
              className="btn btn-primary w-full"
            >
              Get in touch
            </button>
            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block text-center font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-ink-soft transition hover:text-brand"
            >
              Staff login
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}