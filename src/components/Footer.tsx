import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { PawMark } from "./decor/Decor";
import Logo from "./Logo";

/**
 * Section links use plain hrefs with a leading slash, not hash-only anchors:
 * the footer also renders on /terms and /privacy, where "#about" would just
 * change the hash without going anywhere.
 */
const COMPANY = [
  { label: "About us", href: "/#about" },
  { label: "Our services", href: "/#services" },
  { label: "Our doctors", href: "/#vets" },
  { label: "Reviews", href: "/#reviews" },
];

/** Real routes, so these use Link and don't reload the page. */
const LEGAL = [
  { label: "Terms & conditions", to: "/terms" },
  { label: "Privacy policy", to: "/privacy" },
  { label: "Refunds & cancellation", to: "/refunds" },
  { label: "Contact us", to: "/contact-us" },
];

const ADMIN_URL = `${import.meta.env.VITE_ADMIN_URL ?? import.meta.env.VITE_API_URL ?? ""}/admin`;

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-ink text-cream">
      <PawMark className="pointer-events-none absolute -right-16 top-10 h-72 w-72 -rotate-12 text-white/5" />

      <div className="container-x relative grid gap-12 py-16 md:py-20 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr]">
        <div>
          <a href="/#home" className="flex items-center gap-2.5">
            <Logo className="h-14 w-14 shrink-0" />
            <span className="font-display text-[24px] font-black leading-none tracking-tight">
              K-Petz
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.22em] opacity-70">
                Hospital Online
              </span>
            </span>
          </a>

          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-cream/70">
            We love, care, treat your pets. A full veterinary hospital at Poranki and Gunadala,
            Vijayawada.
          </p>

          <div className="mt-6 flex gap-3">
            {[
              { Icon: Instagram, label: "Instagram" },
              { Icon: Facebook, label: "Facebook" },
              { Icon: Youtube, label: "YouTube" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="/#contact"
                aria-label={label}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition hover:bg-brand"
              >
                <Icon className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Company">
          <h2 className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
            Company
          </h2>
          <ul className="mt-5 grid gap-3 text-[15px] text-cream/75">
            {COMPANY.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="transition hover:text-gold">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h2 className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
            Legal
          </h2>
          <ul className="mt-5 grid gap-3 text-[15px] text-cream/75">
            {LEGAL.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="transition hover:text-gold">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
            Get in touch
          </h2>
          <ul className="mt-5 grid gap-4 text-[15px] text-cream/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" aria-hidden="true" />
              Near Saibaba Temple, Srinivasa Nagar, Poranki, Vijayawada
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" aria-hidden="true" />
              <span>
                <a href="tel:+918019888877" className="hover:text-gold">
                  80198 88877
                </a>
                <br />
                <a href="tel:+918185048877" className="hover:text-gold">
                  81850 48877
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" aria-hidden="true" />
              <a href="mailto:kpetzhospital@gmail.com" className="break-all hover:text-gold">
                kpetzhospital@gmail.com
              </a>
            </li>
          </ul>

          <form onSubmit={(e) => e.preventDefault()} className="mt-6">
            <label htmlFor="news" className="mb-2 block text-sm font-semibold text-cream/70">
              Monthly care tips, no spam.
            </label>
            <div className="flex gap-2">
              <input
                id="news"
                type="email"
                required
                placeholder="Your email"
                className="min-w-0 flex-1 rounded-full border-2 border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-cream outline-none placeholder:text-cream/45 focus:border-brand"
              />
              <button className="btn btn-primary px-6">Join</button>
            </div>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs font-semibold text-cream/55 sm:flex-row">
          <p>© {new Date().getFullYear()} K-Petz Hospital. All rights reserved.</p>
          <p className="flex flex-wrap justify-center gap-5">
            <Link to="/privacy" className="hover:text-gold">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-gold">
              Terms
            </Link>
            <Link to="/refunds" className="hover:text-gold">
              Refunds
            </Link>
            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:text-gold hover:opacity-100"
            >
              Staff login
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}