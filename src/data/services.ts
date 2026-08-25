/**
 * The bookable services, their prices, and which fields each one's form shows.
 *
 * This is the copy the form uses until GET /api/booking-options responds —
 * the server's config/booking.php is the source of truth, and the prices and
 * labels here must match it. The server recalculates the amount from the
 * service and ignores whatever the browser sends, so a mismatch would show
 * the customer one figure and charge another.
 */

/** 18% is the standard rate for services. The server's rate wins once loaded. */
export const GST_RATE = 0.18;

export type ServiceKind = "home" | "online";

export type ServiceKey = "home-visit" | "online-consultancy" | "second-opinion";

export type ServiceConfig = {
  label: string;
  /** Base price in rupees, before GST. */
  price: number;
  /** Drives which fields the form shows. */
  kind: ServiceKind;
  /** Asks for vaccination history (first time / annual). */
  vaccination?: boolean;
};

export const SERVICES: Record<ServiceKey, ServiceConfig> = {
  "home-visit": { label: "Home deworming & vaccination", price: 400, kind: "home", vaccination: true },
  "online-consultancy": { label: "Online consultancy", price: 300, kind: "online" },
  "second-opinion": { label: "Second opinion", price: 300, kind: "online" },
};

export const SERVICE_KEYS = Object.keys(SERVICES) as ServiceKey[];

/**
 * Who can take an online consultation. The server's list wins once loaded;
 * a booking holds its doctor's slot for that date.
 */
export const DOCTORS = ["Dr P. Radhika", "Dr K.F.S. Sreekanth"];

/**
 * Which fields each kind of booking shows.
 *
 * home   — the vet travels, so the area is fixed and there's no doctor choice
 *          and no time slot (it's agreed by phone). What's wrong isn't asked.
 * online — no travel, so any state we serve, a choice of doctor and a time
 *          that doctor is free. The problem description is the whole point.
 *
 * Breed is the same for both: a dropdown for any species with a list (dogs
 * and cats), a free text box otherwise.
 */
export const FIELD_RULES: Record<ServiceKind, { doctor: boolean; timeSlot: boolean; problem: boolean }> = {
  home: { doctor: false, timeSlot: false, problem: false },
  online: { doctor: true, timeSlot: true, problem: true },
};

/** Rupees, rounded to the nearest whole number for display. */
export const gstOn = (base: number, rate = GST_RATE) => Math.round(base * rate);
export const totalWithGst = (base: number, rate = GST_RATE) => base + gstOn(base, rate);

/**
 * Names used elsewhere on the site that mean one of the services above. A
 * service card says "Deworming", the hero says "Home deworming and
 * vaccination", the online consultation page says "Online consultancy
 * (first aid)", and so on. Anything not listed opens the form with no
 * service chosen, so the customer picks.
 */
const ALIASES: Record<string, ServiceKey> = {
  "home deworming and vaccination": "home-visit",
  "home deworming": "home-visit",
  "home vaccination": "home-visit",
  deworming: "home-visit",
  vaccination: "home-visit",
  vaccinations: "home-visit",
  "vaccination at home": "home-visit",
  "online consultation": "online-consultancy",
  "online consultancy (first aid)": "online-consultancy",
  "veterinary consultation": "online-consultancy",
};

export const resolveServiceKey = (
  label: string | undefined,
  services: Partial<Record<ServiceKey, ServiceConfig>> = SERVICES,
): ServiceKey | undefined => {
  if (!label) return undefined;
  const wanted = label.trim().toLowerCase();
  const exact = (Object.keys(services) as ServiceKey[]).find(
    (key) => services[key]?.label.toLowerCase() === wanted,
  );
  if (exact) return exact;
  const alias = ALIASES[wanted];
  return alias && services[alias] ? alias : undefined;
};
