import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

export type Settings = {
  phone_primary: string;
  phone_secondary: string;
  email: string;
  address: string;
  opening_hours: string;
  footer_blurb: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  whatsapp_number: string;
  logo: string;
};

/**
 * The values currently on the site, used until the API responds — and kept if
 * it never does.
 *
 * This matters: the footer appears on every page, and waiting on a request
 * before rendering it would mean an empty gap on first paint and a visible
 * jump when the data lands. With defaults, the page renders complete
 * immediately and simply corrects itself if the clinic has changed something.
 */
const FALLBACK: Settings = {
  phone_primary: "80198 88877",
  phone_secondary: "81850 48877",
  email: "kpetzhospital@gmail.com",
  address: "Near Saibaba Temple, Srinivasa Nagar,\nPoranki, Vijayawada",
  opening_hours: "",
  footer_blurb:
    "We love, care, treat your pets. A full veterinary hospital in Poranki, Vijayawada.",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
  whatsapp_number: "918019888877",
  logo: "",
};

const SettingsContext = createContext<Settings>(FALLBACK);

export const useSettings = () => useContext(SettingsContext);

/** Digits only, for tel: and wa.me links. */
export const telHref = (phone: string) => `tel:+91${phone.replace(/\D/g, "")}`;

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(FALLBACK);

  useEffect(() => {
    if (!API) return;

    let live = true;

    fetch(`${API}/api/settings`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!live) return;
        // Merge rather than replace: a field the API doesn't send keeps its
        // fallback instead of becoming undefined.
        setSettings((current) => ({ ...current, ...data }));
      })
      .catch(() => {
        /* Keep the fallbacks — the site is still completely usable. */
      });

    return () => {
      live = false;
    };
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}
