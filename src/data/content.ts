import { useEffect, useState } from "react";
import svcDeworming from "@/assets/svc-deworming.webp";
import svcVaccination from "@/assets/svc-vaccination.webp";
import svcSurgery from "@/assets/svc-surgery.webp";
import svcHaircut from "@/assets/svc-haircut.webp";
import svcBathing from "@/assets/svc-bathing.webp";
import svcBoarding from "@/assets/service-boarding.jpg";
import aboutImg from "@/assets/about.jpg";

/**
 * The editable homepage sections — the service cards and the About section —
 * as managed in the admin (Services and Content pages) and served by
 * GET /api/content.
 *
 * The copies below are the site's built-in content: they render on first
 * paint and stay if the API is unreachable, so the page never looks empty
 * and never jumps. Once the API answers, whatever the clinic wrote in the
 * admin replaces them.
 */

const API = import.meta.env.VITE_API_URL ?? "";

export type SiteService = {
  title: string;
  description: string;
  /** A resolved URL — either a bundled asset or an /api/uploads file. */
  img: string | null;
  alt: string;
};

export type SiteContent = {
  servicesHeading: string;
  servicesIntro: string;
  services: SiteService[];
  about: {
    heading: string;
    quote: string;
    /** Blank lines separate paragraphs. */
    body: string;
    img: string;
  };
};

export const FALLBACK_CONTENT: SiteContent = {
  servicesHeading: "Excellence In Every Service",
  servicesIntro:
    "Everyday care, grooming and surgery — all handled by the same team who know your pet.",
  services: [
    {
      img: svcDeworming,
      title: "Deworming",
      description: "Routine deworming to keep worms away, for dogs and cats.",
      alt: "A veterinarian giving deworming medication to a labrador",
    },
    {
      img: svcVaccination,
      title: "Vaccinations",
      description: "Core vaccinations and boosters, given by a qualified veterinarian.",
      alt: "A veterinarian vaccinating a golden retriever puppy on a clinic table",
    },
    {
      img: svcSurgery,
      title: "Pet surgeries",
      description: "Soft-tissue and routine surgical procedures in our own operation theatre.",
      alt: "Two veterinary surgeons operating on a sedated dog in an operating theatre",
    },
    {
      img: svcHaircut,
      title: "Pet hair cut",
      description: "We trim and style your pet based on their breed and comfort.",
      alt: "A shih tzu being trimmed with scissors on a grooming table",
    },
    {
      img: svcBathing,
      title: "Bathing",
      description: "A warm bath, blow-dry and brush-out using skin-friendly shampoo.",
      alt: "A small white dog being lathered with shampoo in a grooming bath",
    },
    {
      img: svcBoarding,
      title: "Pet boarding",
      description: "Your pet stays with us, looked after by the same team that treats them.",
      alt: "A dog resting comfortably in a boarding kennel",
    },
  ],
  about: {
    heading: "Every Pet Treated Like Our Own",
    quote: "“A full pet hospital in Vijayawada — not just a clinic.”",
    body:
      "K-Petz Hospital has X-ray, ultrasound scanning, an operation theatre and its own lab, " +
      "so most cases can be diagnosed and treated in one visit instead of being sent elsewhere.\n\n" +
      "Two M.V.Sc qualified veterinarians look after dogs and cats — from routine vaccination " +
      "and deworming through to surgery. You'll find us at Poranki, behind Saibaba Temple, " +
      "and at Gunadala opposite APGenco.",
    img: aboutImg,
  },
};

const str = (value: unknown): value is string => typeof value === "string";
const filled = (value: unknown): value is string => str(value) && value.trim() !== "";

/**
 * Takes each part of the response only if it has the expected shape, so a
 * half-broken or older API degrades a field at a time rather than blanking
 * a section. Image file names become /api/uploads URLs here; the bundled
 * images stay when a row has none.
 */

/**
 * The API now sends full image URLs (it alone knows whether its public folder
 * lives at kpetz.com/api or at localhost:8000). Older backends sent bare file
 * names — those still work by assuming the production /api prefix.
 */
const imageUrl = (value: unknown, folder: string): string | null => {
  if (!filled(value)) return null;
  const image = value as string;
  return /^https?:\/\//.test(image) ? image : `${API}/api/${folder}/${image}`;
};

const merge = (raw: unknown): SiteContent => {
  const data = (raw ?? {}) as Record<string, unknown>;
  const out: SiteContent = { ...FALLBACK_CONTENT, about: { ...FALLBACK_CONTENT.about } };

  if (filled(data.servicesHeading)) out.servicesHeading = data.servicesHeading;
  if (str(data.servicesIntro)) out.servicesIntro = data.servicesIntro;

  if (Array.isArray(data.services)) {
    const services = data.services
      .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
      .filter((row) => filled(row.title) && filled(row.description))
      .map((row) => ({
        title: row.title as string,
        description: row.description as string,
        img: imageUrl(row.image, "uploads/services"),
        alt: filled(row.alt) ? (row.alt as string) : (row.title as string),
      }));
    // All cards hidden or none yet: the built-in six stay, so the section
    // never renders as an empty frame.
    if (services.length) out.services = services;
  }

  const about = (data.about ?? {}) as Record<string, unknown>;
  if (filled(about.heading)) out.about.heading = about.heading;
  if (str(about.quote)) out.about.quote = about.quote;
  if (filled(about.body)) out.about.body = about.body;
  out.about.img = imageUrl(about.image, "uploads/site") ?? FALLBACK_CONTENT.about.img;

  return out;
};

let cached: Promise<SiteContent> | null = null;

/** One request per page load; both sections share it. */
export function loadContent(): Promise<SiteContent> {
  if (!API) return Promise.resolve(FALLBACK_CONTENT);

  cached ??= fetch(`${API}/api/content`, { headers: { Accept: "application/json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then(merge)
    .catch(() => {
      // Forget the failure so a later mount tries again.
      cached = null;
      return FALLBACK_CONTENT;
    });

  return cached;
}

export function useContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(FALLBACK_CONTENT);

  useEffect(() => {
    let live = true;
    loadContent().then((loaded) => {
      if (live) setContent(loaded);
    });
    return () => {
      live = false;
    };
  }, []);

  return content;
}
