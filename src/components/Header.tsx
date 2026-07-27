import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bird,
  Bone,
  Cat,
  Dog,
  Heart,
  Home,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { PawMark } from "./decor/Decor";
import { useBooking } from "./BookingProvider";

const NAV = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Shop", href: "#shop" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

const CATEGORIES = [
  { label: "Travel cage", Icon: Home },
  { label: "Special edition", Icon: Sparkles },
  { label: "Shop for dogs", Icon: Dog },
  { label: "Shop for cats", Icon: Cat },
  { label: "Pet accessories", Icon: Bone },
  { label: "Shop for birds", Icon: Bird },
];

const CATEGORY_HOLD = 3800;

export function TopBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Read synchronously so the desktop row doesn't flash the carousel first.
  const [isWide, setIsWide] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1280px)").matches
  );
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1280px)");
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
    setIndex((i) => (i + step + CATEGORIES.length) % CATEGORIES.length);

  useEffect(() => {
    if (isWide || paused || reduceMotion) return;
    const t = setTimeout(() => go(1), 3500);
    return () => clearTimeout(t);
  }, [index, isWide, paused, reduceMotion]);

  const link = (label: string, Icon: LucideIcon, active = true) => (
    <a
      href="#shop"
      tabIndex={active ? undefined : -1}
      className="flex items-center justify-center gap-2.5 whitespace-nowrap font-display text-[13px] font-extrabold uppercase tracking-[0.14em] transition hover:text-brand"
    >
      <Icon className="h-4.5 w-4.5 shrink-0 text-brand" aria-hidden="true" />
      {label}
    </a>
  );

  return (
    <div className="px-3 pt-3 md:px-5 md:pt-5">
      <nav aria-label="Shop categories" className="rounded-2xl bg-bark text-cream">
        {isWide ? (
          <ul className="flex items-center justify-between gap-3 px-10 py-4">
            {CATEGORIES.map(({ label, Icon }) => (
              <li key={label} className="shrink-0">
                {link(label, Icon)}
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
              aria-label="Previous category"
              className="shrink-0 p-1 transition hover:text-brand"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* All six stay in the DOM — only the active one is visible, so the
                links remain crawlable and the track can slide between them. */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <ul
                className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {CATEGORIES.map(({ label, Icon }, i) => (
                  <li
                    key={label}
                    className="w-full shrink-0"
                    aria-hidden={i !== index || undefined}
                  >
                    {link(label, Icon, i === index)}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => go(1)}
              aria-label="Next category"
              className="shrink-0 p-1 transition hover:text-brand"
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
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand sm:h-11 sm:w-11">
              <PawMark className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </span>
            <span className="font-display text-[22px] font-black tracking-tight sm:text-[28px]">
              Kpetz
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
            <button aria-label="Search the shop" className="hidden p-2 transition hover:text-brand sm:block">
              <Search className="h-5 w-5" />
            </button>
            <button aria-label="Wishlist" className="hidden p-2 transition hover:text-brand sm:block">
              <Heart className="h-5 w-5" />
            </button>
            <button aria-label="Cart, 0 items" className="relative p-1.5 transition hover:text-brand sm:p-2">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
                0
              </span>
            </button>
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

          <button
            onClick={() => {
              setOpen(false);
              openBooking();
            }}
            className="btn btn-primary mt-auto w-full"
          >
            Get in touch
          </button>
        </div>
      </div>
    </header>
  );
}