import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { PawMark } from "./decor/Decor";
import Logo from "./Logo";
import { telHref, useSettings } from "./SettingsProvider";

const API = import.meta.env.VITE_API_URL ?? "";

/**
 * Section links use a leading slash, not a bare hash: the footer also renders
 * on /terms and /vet-home-visit, where "#about" would only change the hash
 * without going anywhere.
 */
const COMPANY = [
  { label: "About us", href: "/#about" },
  { label: "Our services", href: "/#services" },
  { label: "Our doctors", href: "/#vets" },
  { label: "Reviews", href: "/#reviews" },
];

/**
 * The service landing pages. Linking them here is what stops them being
 * orphaned — an unlinked page ranks poorly however good its content.
 */
const SERVICES = [
  { label: "Vet home visit", to: "/vet-home-visit" },
  { label: "Vaccination at home", to: "/pet-vaccination-at-home" },
  { label: "Pet home treatment", to: "/pet-home-treatment" },
  { label: "Online vet consultation", to: "/online-vet-consultation" },
  { label: "Second opinion", to: "/vet-second-opinion" },
  { label: "Pet care advice", to: "/blog" },
];

const LEGAL = [
  { label: "Terms & conditions", to: "/terms" },
  { label: "Privacy policy", to: "/privacy" },
  { label: "Refunds & cancellation", to: "/refunds" },
  { label: "Contact us", to: "/contact-us" },
];

const ADMIN_URL = `${import.meta.env.VITE_ADMIN_URL ?? API}/admin`;

const HEADING = "font-display text-[13px] font-extrabold uppercase tracking-[0.14em] text-gold";
const LINK = "text-[15px] leading-snug text-cream/70 transition hover:text-gold";

export default function Footer() {
  const s = useSettings();

  // An icon that goes nowhere looks broken, so an empty URL hides it entirely.
  const socials = [
    { Icon: Instagram, label: "Instagram", href: s.instagram_url },
    { Icon: Facebook, label: "Facebook", href: s.facebook_url },
    { Icon: Youtube, label: "YouTube", href: s.youtube_url },
  ].filter((social) => social.href);

  return (
    <footer id="contact" className="relative overflow-hidden bg-ink text-cream">
      <PawMark className="pointer-events-none absolute -right-20 top-8 h-72 w-72 -rotate-12 text-white/[0.04]" />

      <div className="container-x relative grid gap-x-8 gap-y-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-[1.6fr_1fr_1.15fr_1.15fr]">
        {/* Brand + contact */}
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            {s.logo ? (
              <img
                src={`${API}/api/uploads/site/${s.logo}`}
                alt="K-Petz Hospital"
                className="h-14 w-14 shrink-0 object-contain"
              />
            ) : (
              <Logo className="h-14 w-14 shrink-0" />
            )}
            <span className="font-display text-[24px] font-black leading-none tracking-tight">
              K-Petz
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.22em] opacity-70">
                Hospital Online
              </span>
            </span>
          </Link>

          <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-cream/70">
            {s.footer_blurb}
          </p>

          <ul className="mt-7 grid gap-3.5">
            {s.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span className="whitespace-pre-line text-[15px] leading-relaxed text-cream/70">
                  {s.address}
                </span>
              </li>
            )}

            {(s.phone_primary || s.phone_secondary) && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span className="text-[15px] leading-relaxed">
                  {s.phone_primary && (
                    <a href={telHref(s.phone_primary)} className={LINK}>
                      {s.phone_primary}
                    </a>
                  )}
                  {s.phone_primary && s.phone_secondary && (
                    <span className="text-cream/40"> · </span>
                  )}
                  {s.phone_secondary && (
                    <a href={telHref(s.phone_secondary)} className={LINK}>
                      {s.phone_secondary}
                    </a>
                  )}
                </span>
              </li>
            )}

            {s.email && (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a href={`mailto:${s.email}`} className={`${LINK} break-all`}>
                  {s.email}
                </a>
              </li>
            )}

            {s.opening_hours && (
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span className="text-[15px] leading-relaxed text-cream/70">
                  {s.opening_hours}
                </span>
              </li>
            )}
          </ul>

          {socials.length > 0 && (
            <div className="mt-7 flex gap-3">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-gold hover:text-ink"
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Company">
          <p className={HEADING}>Company</p>
          <ul className="mt-5 grid gap-3">
            {COMPANY.map(({ label, href }) => (
              <li key={href}>
                <a href={href} className={LINK}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Services">
          <p className={HEADING}>Services</p>
          <ul className="mt-5 grid gap-3">
            {SERVICES.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className={LINK}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal">
          <p className={HEADING}>Legal</p>
          <ul className="mt-5 grid gap-3">
            {LEGAL.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className={LINK}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs font-semibold text-cream/55 sm:flex-row">
          <p>© {new Date().getFullYear()} K-Petz Hospital. All rights reserved.</p>
          <a
            href={ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 transition hover:text-gold hover:opacity-100"
          >
            Staff login
          </a>
        </div>
      </div>
    </footer>
  );
}
