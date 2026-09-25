import { useEffect, useState } from "react";
import {
  CITIES_BY_STATE,
  HOME_SERVICE_CITY,
  HOME_SERVICE_STATE,
  ONLINE_SERVICE_STATES,
} from "./locations";
import { BREEDS_BY_SPECIES, SPECIES_BY_KIND } from "./pets";
import { DOCTORS, GST_RATE, SERVICES, type ServiceConfig, type ServiceKey, type ServiceKind } from "./services";

/**
 * Everything the booking form needs to draw its dropdowns and show a price.
 *
 * It comes from GET /api/booking-options, which reads the same
 * config/booking.php the server validates bookings against — so the options
 * a customer can pick are exactly the ones the server will accept, and the
 * price shown is the price charged.
 *
 * The bundled copies in services.ts, locations.ts and pets.ts are used until
 * the API responds, and kept if it never does, so the form opens complete on
 * first paint and simply corrects itself if the clinic has changed something.
 */
/** One row of the clinic's vaccine list, as the admin keeps it. */
export type VaccineOption = {
  id: number;
  /** MSD, Zoetis — the form groups the dropdown by this. */
  brand: string;
  name: string;
  /** Rupees per pet, before GST. */
  price: number;
};

export type BookingOptions = {
  gstRate: number;
  services: Partial<Record<ServiceKey, ServiceConfig>>;
  /** How many pets one booking may cover. The server refuses more. */
  maxPets: number;
  /**
   * What can be given on a home vaccination visit. Empty until the API
   * answers: there is no sensible built-in copy of a price list the clinic
   * edits, and offering a stale price would be worse than offering none.
   */
  vaccines: VaccineOption[];
  /** Shown under the vaccine list for owners who don't know which is due. */
  vaccineGuidance: string;
  homeService: { state: string; city: string };
  onlineStates: string[];
  doctors: string[];
  cities: Record<string, string[]>;
  species: Record<ServiceKind, string[]>;
  breeds: Record<string, string[]>;
};

export const FALLBACK_OPTIONS: BookingOptions = {
  gstRate: GST_RATE,
  services: SERVICES,
  maxPets: 5,
  vaccines: [],
  vaccineGuidance: "",
  homeService: { state: HOME_SERVICE_STATE, city: HOME_SERVICE_CITY },
  onlineStates: ONLINE_SERVICE_STATES,
  doctors: DOCTORS,
  cities: CITIES_BY_STATE,
  species: SPECIES_BY_KIND,
  breeds: BREEDS_BY_SPECIES,
};

const API = import.meta.env.VITE_API_URL ?? "";

const isList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string");

const isLists = (value: unknown): value is Record<string, string[]> =>
  !!value &&
  typeof value === "object" &&
  Object.values(value as object).length > 0 &&
  Object.values(value as object).every(isList);

const isService = (value: unknown): value is ServiceConfig =>
  !!value &&
  typeof value === "object" &&
  typeof (value as ServiceConfig).label === "string" &&
  typeof (value as ServiceConfig).price === "number" &&
  ((value as ServiceConfig).kind === "home" || (value as ServiceConfig).kind === "online");


/**
 * Takes each part of the response only if it has the expected shape, so a
 * half-broken API (or an older one) degrades a field at a time rather than
 * leaving the form with an empty dropdown.
 */
const merge = (raw: unknown): BookingOptions => {
  const data = (raw ?? {}) as Partial<BookingOptions>;
  const out: BookingOptions = { ...FALLBACK_OPTIONS };

  if (typeof data.gstRate === "number" && data.gstRate >= 0 && data.gstRate < 1) {
    out.gstRate = data.gstRate;
  }

  // Only services the app knows how to show, and only those the server still
  // offers — a service dropped from the server disappears from the dropdown.
  if (data.services && typeof data.services === "object") {
    const services: Partial<Record<ServiceKey, ServiceConfig>> = {};
    for (const key of Object.keys(SERVICES) as ServiceKey[]) {
      const service = (data.services as Record<string, unknown>)[key];
      if (isService(service)) services[key] = { ...SERVICES[key], ...service };
    }
    if (Object.keys(services).length) out.services = services;
  }

  if (
    data.homeService &&
    typeof data.homeService.state === "string" &&
    typeof data.homeService.city === "string"
  ) {
    out.homeService = data.homeService;
  }

  // A cap the form can't honour is worse than the bundled one: it would let
  // someone add a sixth pet only for the server to refuse the whole booking.
  if (typeof data.maxPets === "number" && Number.isInteger(data.maxPets) && data.maxPets >= 1) {
    out.maxPets = data.maxPets;
  }

  // Only rows with everything the dropdown needs. A half-written vaccine is
  // dropped rather than shown priced at nothing.
  if (Array.isArray(data.vaccines)) {
    out.vaccines = (data.vaccines as unknown[]).filter(
      (v): v is VaccineOption =>
        !!v &&
        typeof v === "object" &&
        typeof (v as VaccineOption).id === "number" &&
        typeof (v as VaccineOption).brand === "string" &&
        typeof (v as VaccineOption).name === "string" &&
        typeof (v as VaccineOption).price === "number" &&
        (v as VaccineOption).price >= 0,
    );
  }

  if (typeof data.vaccineGuidance === "string") out.vaccineGuidance = data.vaccineGuidance;

  if (isList(data.onlineStates)) out.onlineStates = data.onlineStates;
  if (isList(data.doctors)) out.doctors = data.doctors;
  if (isLists(data.cities)) out.cities = data.cities;
  if (isLists(data.breeds)) out.breeds = data.breeds;

  if (data.species && isList(data.species.home) && isList(data.species.online)) {
    out.species = { home: data.species.home, online: data.species.online };
  }

  return out;
};

let cached: Promise<BookingOptions> | null = null;

/** One request per page load; every opening of the form shares it. */
export function loadBookingOptions(): Promise<BookingOptions> {
  if (!API) return Promise.resolve(FALLBACK_OPTIONS);

  cached ??= fetch(`${API}/api/booking-options`, { headers: { Accept: "application/json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then(merge)
    .catch(() => {
      // Forget the failure so the next opening tries again.
      cached = null;
      return FALLBACK_OPTIONS;
    });

  return cached;
}

export function useBookingOptions(): BookingOptions {
  const [options, setOptions] = useState<BookingOptions>(FALLBACK_OPTIONS);

  useEffect(() => {
    let live = true;
    loadBookingOptions().then((loaded) => {
      if (live) setOptions(loaded);
    });
    return () => {
      live = false;
    };
  }, []);

  return options;
}
