import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import AttachmentPicker from "./AttachmentPicker";
import UpiPayment from "./UpiPayment";
import { useBookingOptions, type BookingOptions } from "../data/bookingOptions";
import {
  FIELD_RULES,
  gstOn,
  resolveServiceKey,
  totalWithGst,
  type ServiceKey,
} from "../data/services";

/** Backend base URL. Set VITE_API_URL in .env — e.g. https://kpetz.com */
const API_BASE = import.meta.env.VITE_API_URL ?? "";

const STEPS = ["Service & details", "Your pet", "Appointment", "Terms", "Payment"];

/** "Not sure" removed at the client's request, so an answer must be chosen. */
const SEXES = ["Male", "Female"];
const VACCINATION_TYPES = [
  { value: "first", label: "First time in life" },
  { value: "annual", label: "Annual vaccination" },
];

/** Clinic hours in half-hour steps. Opening times, not confirmed free time. */
const SLOTS = Array.from({ length: 24 }, (_, i) => {
  const mins = 9 * 60 + i * 30;
  const h24 = Math.floor(mins / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mins % 60).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
});

const LABEL =
  "mb-1.5 block font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-white";

const Optional = () => (
  <span className="font-semibold normal-case tracking-normal text-white/60"> — optional</span>
);

type Props = { service?: string; doctor?: string; onSuccess?: () => void };

/**
 * One animal. A household books once for all of its pets, and each is
 * described in full — ages, breeds and vaccination histories differ, and the
 * vet needs all of them before the visit.
 *
 * Every field is held here rather than read off the DOM, because pets can be
 * removed from the middle of the list: with uncontrolled inputs, deleting the
 * first of three would leave the remaining two showing the wrong names.
 */
type PetState = {
  petName: string;
  species: string;
  breed: string;
  age: string;
  sex: string;
  weight: string;
  vaccinationType: string;
  vaccinationHistory: string;
  lastVaccinationDate: string;
  /** The chosen vaccine's id, as a string because a <select> value is one. */
  vaccineId: string;
};

const emptyPet = (species: string): PetState => ({
  petName: "",
  species,
  breed: "",
  age: "",
  sex: "",
  weight: "",
  vaccinationType: "first",
  vaccinationHistory: "",
  lastVaccinationDate: "",
  vaccineId: "",
});

/** The field name the server reads this pet's answer from. */
const petField = (index: number, name: keyof PetState) => `pets[${index}][${name}]`;

type FormState = {
  /** Empty until a service is chosen — everything else depends on it. */
  serviceKey: ServiceKey | "";
  /** Always at least one. The price is this many times the service price. */
  pets: PetState[];
  state: string;
  city: string;
  /** Online only: which vet, and the date and time they're free. */
  doctor: string;
  date: string;
  slot: string;
  agreed: boolean;
};

/** Which times are taken, by date then doctor, as reported by the API. */
type Booked = Record<string, Record<string, string[]>>;

/**
 * Makes the form's choices consistent with the options: a home visit is
 * pinned to the covered area, the species and breed come from the lists for
 * the service, and an online booking keeps its state and city only if they
 * are still offered. Used when the service changes and when the options
 * arrive from the API.
 */
function reconcile(f: FormState, o: BookingOptions): FormState {
  const config = f.serviceKey ? o.services[f.serviceKey] : undefined;
  if (!config) return { ...f, serviceKey: "" };

  const speciesList = o.species[config.kind];

  // Each pet's species has to be one this service covers (a home visit is
  // dogs and cats only), and its breed one from that species' list. Pets
  // beyond the cap are dropped rather than sent for the server to refuse.
  const pets = f.pets.slice(0, Math.max(1, o.maxPets)).map((pet) => {
    const species = speciesList.includes(pet.species) ? pet.species : speciesList[0];
    const breedList = o.breeds[species] ?? [];
    const breed = breedList.includes(pet.breed) ? pet.breed : (breedList[0] ?? "");

    // A vaccine the clinic has since removed from its list, or one chosen
    // before the list arrived, is cleared so the customer picks again rather
    // than being quoted for something that no longer exists.
    const vaccineId = o.vaccines.some((v) => String(v.id) === pet.vaccineId) ? pet.vaccineId : "";

    return { ...pet, species, breed, vaccineId };
  });

  const rules = FIELD_RULES[config.kind];
  const doctor = rules.doctor && o.doctors.includes(f.doctor) ? f.doctor : "";

  let { state, city } = f;
  if (config.kind === "home") {
    state = o.homeService.state;
    city = o.homeService.city;
  } else {
    if (!o.onlineStates.includes(state)) state = o.onlineStates[0];
    const cities = o.cities[state] ?? [];
    if (!cities.includes(city)) city = cities[0] ?? "";
  }

  return {
    ...f,
    pets,
    state,
    city,
    doctor,
    slot: rules.timeSlot ? f.slot : "",
  };
}


export default function BookingForm({ service, doctor, onSuccess }: Props) {
  const options = useBookingOptions();
  const { services, homeService, onlineStates, cities: citiesByState, species: speciesByKind, breeds } =
    options;

  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [data, setData] = useState<Record<string, string>>({});
  const [utr, setUtr] = useState("");
  const stepRef = useRef<HTMLDivElement>(null);

  /** Shown on the QR so the clinic can match a payment before the row exists. */
  const [reference] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase());

  const [form, setForm] = useState<FormState>(() =>
    reconcile(
      {
        serviceKey: resolveServiceKey(service, options.services) ?? "",
        pets: [emptyPet("Dog")],
        state: homeService.state,
        city: homeService.city,
        doctor: doctor ?? "",
        date: "",
        slot: "",
        agreed: false,
      },
      options,
    ),
  );

  // The API's lists can differ from the bundled copy (a price changed, a city
  // added), so the choices are re-checked when they land.
  useEffect(() => {
    setForm((f) =>
      reconcile(
        f.serviceKey ? f : { ...f, serviceKey: resolveServiceKey(service, options.services) ?? "" },
        options,
      ),
    );
  }, [options, service]);

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  /** Changes one pet. Species changes clear the breed, which reconcile refills. */
  const setPet = (index: number, patch: Partial<PetState>) =>
    setForm((f) =>
      reconcile(
        { ...f, pets: f.pets.map((pet, i) => (i === index ? { ...pet, ...patch } : pet)) },
        options,
      ),
    );

  // A second pet starts as a copy of the first's species — households tend to
  // have another of the same, and it's one less dropdown to set.
  const addPet = () =>
    setForm((f) =>
      f.pets.length >= options.maxPets
        ? f
        : { ...f, pets: [...f.pets, emptyPet(f.pets[0]?.species ?? "Dog")] },
    );

  const removePet = (index: number) =>
    setForm((f) => (f.pets.length < 2 ? f : { ...f, pets: f.pets.filter((_, i) => i !== index) }));

  const config = form.serviceKey ? services[form.serviceKey] : undefined;
  const rules = config ? FIELD_RULES[config.kind] : undefined;
  const homeVisit = config?.kind === "home";
  const serviceLabel = config?.label ?? "";
  const askVaccination = !!config?.vaccination;

  const serviceKeys = Object.keys(services) as ServiceKey[];
  const homeKeys = serviceKeys.filter((k) => services[k]?.kind === "home");
  const onlineKeys = serviceKeys.filter((k) => services[k]?.kind === "online");

  /** Home visits are Vijayawada only, so those lists are fixed. */
  const states = homeVisit ? [homeService.state] : onlineStates;
  const cities = homeVisit ? [homeService.city] : (citiesByState[form.state] ?? []);
  const speciesList = config ? speciesByKind[config.kind] : speciesByKind.home;
  const petCount = form.pets.length;

  // Vaccines are only asked for by a service that gives one, and only once
  // the clinic's list has arrived from the API.
  const { vaccines, vaccineGuidance } = options;
  const askVaccine = askVaccination && vaccines.length > 0;
  const vaccineBrands = Array.from(new Set(vaccines.map((v) => v.brand)));
  const priceOf = (vaccineId: string) =>
    vaccines.find((v) => String(v.id) === vaccineId)?.price ?? 0;

  /**
   * Times already taken, fetched once per date and kept for the life of the
   * form. Greying them out is a courtesy; the server refuses a clash too,
   * and a refusal sends the customer back here with the list refreshed.
   */
  const [booked, setBooked] = useState<Booked>({});
  const [slotWarning, setSlotWarning] = useState<string | null>(null);
  const takenSlots = booked[form.date]?.[form.doctor] ?? [];

  useEffect(() => {
    if (!API_BASE || !rules?.timeSlot || !form.date || form.date in booked) return;
    let live = true;
    fetch(`${API_BASE}/api/availability?date=${encodeURIComponent(form.date)}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((body: { booked?: Record<string, string[]> }) => {
        if (live && body.booked) setBooked((b) => ({ ...b, [form.date]: body.booked ?? {} }));
      })
      .catch(() => {
        /* Nothing greyed out; the server still refuses a clash on submit. */
      });
    return () => {
      live = false;
    };
  }, [form.date, rules?.timeSlot, booked]);

  // A time chosen before the list arrived, or before the doctor changed, may
  // turn out to be taken — drop it rather than carry it to the summary.
  useEffect(() => {
    if (form.slot && takenSlots.includes(form.slot)) {
      setForm((f) => ({ ...f, slot: "" }));
      setSlotWarning(`${form.doctor} is not available at ${form.slot}. Please choose another time.`);
    }
  }, [form.slot, form.doctor, takenSlots]);

  // Someone can attach photos to an online consultation and then switch to a
  // home visit, which doesn't ask for any. Dropping them here stops files the
  // customer can no longer see from travelling with the booking.
  useEffect(() => {
    if (rules && ! rules.problem && files.length) setFiles([]);
  }, [rules, files.length]);

  const chooseSlot = (time: string) => {
    if (takenSlots.includes(time)) {
      setSlotWarning(`${form.doctor} is not available at ${time}. Please choose another time.`);
      return;
    }
    setSlotWarning(null);
    set("slot", time);
  };

  // The visit is charged per pet, and each pet's vaccine on top. GST applies
  // to the two together, which is the figure the customer pays.
  const rate = options.gstRate;
  const unit = config?.price ?? 0;
  const visitFee = unit * petCount;
  const vaccineTotal = askVaccine
    ? form.pets.reduce((sum, pet) => sum + priceOf(pet.vaccineId), 0)
    : 0;
  const base = visitFee + vaccineTotal;
  const gst = gstOn(base, rate);
  const total = totalWithGst(base, rate);

  const changeService = (key: ServiceKey) =>
    setForm((f) => reconcile({ ...f, serviceKey: key }, options));

  const changeState = (state: string) =>
    setForm((f) => ({ ...f, state, city: citiesByState[state]?.[0] ?? "" }));

  /** Reads the fields currently on screen. Called before each step unmounts. */
  const snapshot = () => {
    const found: Record<string, string> = {};
    stepRef.current
      ?.querySelectorAll<HTMLInputElement>("input[name], select[name], textarea[name]")
      .forEach((el) => {
        if (el.type === "file") return;
        found[el.name] = el.type === "checkbox" ? String(el.checked) : el.value;
      });
    setData((d) => ({ ...d, ...found }));
    return found;
  };

  const collect = () => {
    const merged: Record<string, string> = { ...data };
    if (!config || !rules) return merged;

    merged.service = serviceLabel;
    merged.state = form.state;
    merged.city = form.city;
    merged.agreed = String(form.agreed);

    // Only send what this service actually asked for, so the server isn't
    // storing a doctor for a home visit or a slot for a date-only booking.
    merged.doctor = rules.doctor ? form.doctor : "";
    merged.date = form.date;
    merged.slot = rules.timeSlot ? form.slot : "";

    if (!rules.problem) merged.problem = "";

    // pets[0][petName], pets[1][species] … — PHP reads that as a list, so the
    // server validates and stores every pet the same way.
    form.pets.forEach((pet, i) => {
      const annual = askVaccination && pet.vaccinationType === "annual";

      merged[petField(i, "petName")] = pet.petName;
      merged[petField(i, "species")] = pet.species;
      merged[petField(i, "breed")] = pet.breed;
      merged[petField(i, "age")] = pet.age;
      merged[petField(i, "sex")] = pet.sex;
      merged[petField(i, "weight")] = pet.weight;
      merged[petField(i, "vaccinationType")] = askVaccination ? pet.vaccinationType : "";
      merged[petField(i, "vaccinationHistory")] = annual ? pet.vaccinationHistory : "";
      merged[petField(i, "lastVaccinationDate")] = annual ? pet.lastVaccinationDate : "";
      merged[petField(i, "vaccineId")] = askVaccine ? pet.vaccineId : "";
    });

    // The total as displayed, so a page left open across a price change is
    // refused rather than charged the wrong amount. The server sets the price.
    merged.amountPaise = String(total * 100);
    merged.reference = reference;

    return merged;
  };

  /** Multipart, so the photos travel with the booking in one request. */
  const asFormData = () => {
    const fd = new FormData();
    Object.entries(collect()).forEach(([k, v]) => fd.append(k, v));
    fd.append("utr", utr);
    files.forEach((f) => fd.append("attachments[]", f));
    return fd;
  };

  const next = () => {
    const fields = stepRef.current?.querySelectorAll<HTMLInputElement>("input, select, textarea");
    for (const field of Array.from(fields ?? [])) {
      if (!field.reportValidity()) return;
    }
    snapshot();

    if (step === 2 && rules?.timeSlot && !form.slot) {
      setSlotWarning("Please choose a time.");
      return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const submit = async () => {
    setSendError(null);

    if (!API_BASE) {
      setSendError("Booking isn't available right now. Please call 80198 88877.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        // Ask for JSON explicitly, so a validation failure comes back as a
        // 422 with a message rather than a redirect to the home page.
        headers: { Accept: "application/json" },
        body: asFormData(),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.code === "slot_taken") {
          // Someone took it while this form was open. Refresh the list and
          // let them pick again rather than leaving them on the payment step.
          setBooked((b) => {
            const next = { ...b };
            delete next[form.date];
            return next;
          });
          setForm((f) => ({ ...f, slot: "" }));
          setSlotWarning(body.message ?? "That time has just been taken. Please choose another time.");
          setStep(2);
          return;
        }
        throw new Error(body.message ?? "Could not send your booking. Please try again.");
      }

      onSuccess?.();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="booking" className="relative scroll-mt-28">
      <div className="rounded-[1.75rem] bg-brand p-6 shadow-[0_40px_80px_-40px_rgba(36,28,58,0.8)] sm:p-8">
        <p className="eyebrow text-white/85">Book an appointment</p>
        <h2 className="display-md mt-2 pr-12 text-white">{STEPS[step]}</h2>

        <ol className="mt-5 flex items-center gap-1.5" aria-label="Progress">
          {STEPS.map((name, i) => (
            <li key={name} className="flex-1">
              <span className="sr-only">
                {name} {i < step ? "completed" : i === step ? "current" : ""}
              </span>
              <span
                aria-hidden="true"
                className={`block h-1.5 rounded-full transition-colors ${
                  i <= step ? "bg-white" : "bg-white/30"
                }`}
              />
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs font-semibold text-white/80">
          Step {step + 1} of {STEPS.length}
          {step < STEPS.length - 1 && <> · Next: {STEPS[step + 1]}</>}
        </p>

        <div ref={stepRef} className="mt-6 grid gap-4">
          {/* 1 — service and owner. The service comes first because every
              later field depends on it: where we go, which animals, which
              questions. */}
          {step === 0 && (
            <>
              <label className="block">
                <span className={LABEL}>What do you need?</span>
                <select
                  required
                  className="field"
                  value={form.serviceKey}
                  onChange={(e) => changeService(e.target.value as ServiceKey)}
                >
                  <option value="" disabled>
                    Choose a service
                  </option>
                  <optgroup label="At your home">
                    {homeKeys.map((key) => (
                      <option key={key} value={key}>
                        {services[key]?.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Online">
                    {onlineKeys.map((key) => (
                      <option key={key} value={key}>
                        {services[key]?.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={LABEL}>Your name</span>
                  <input
                    required
                    name="ownerName"
                    defaultValue={data.ownerName ?? ""}
                    placeholder="Priya Sharma"
                    className="field"
                  />
                </label>
                <label className="block">
                  <span className={LABEL}>Phone</span>
                  <input
                    required
                    name="phone"
                    defaultValue={data.phone ?? ""}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9+ ]{10,15}"
                    title="Enter a 10-digit mobile number"
                    placeholder="98765 43210"
                    className="field"
                  />
                </label>
              </div>

              <label className="block">
                <span className={LABEL}>Email</span>
                <input
                  required
                  name="email"
                  defaultValue={data.email ?? ""}
                  type="email"
                  placeholder="priya@example.com"
                  className="field"
                />
              </label>

              {/* Location only once the service is known, because the lists
                  depend on it: fixed for a home visit, a choice for online. */}
              {config && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={LABEL}>State</span>
                      <select
                        required
                        disabled={homeVisit}
                        className="field disabled:opacity-70"
                        value={form.state}
                        onChange={(e) => changeState(e.target.value)}
                      >
                        {states.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className={LABEL}>City</span>
                      <select
                        required
                        disabled={homeVisit}
                        className="field disabled:opacity-70"
                        value={form.city}
                        onChange={(e) => set("city", e.target.value)}
                      >
                        {cities.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {homeVisit && (
                    <p className="text-xs font-semibold leading-relaxed text-white/80">
                      {serviceLabel} is available in {homeService.city} only. For anywhere else,
                      choose an online service or visit the clinic.
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {/* 2 — pet */}
          {step === 1 && config && rules && (
            <>
              {form.pets.map((pet, i) => {
                const breedList = breeds[pet.species] ?? [];
                const annual = askVaccination && pet.vaccinationType === "annual";

                return (
                  <div
                    key={i}
                    className={
                      i === 0
                        ? "grid gap-4"
                        : "grid gap-4 rounded-2xl border border-white/15 bg-white/[0.06] p-4"
                    }
                  >
                    {/* Numbered only once there is more than one — a single
                        pet shouldn't be labelled "Pet 1". */}
                    {form.pets.length > 1 && (
                      <div className="flex items-center justify-between">
                        <p className="font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-white">
                          Pet {i + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removePet(i)}
                          className="text-[13px] font-semibold text-white/70 underline underline-offset-4 transition hover:text-white"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className={LABEL}>Pet's name</span>
                        <input
                          required
                          value={pet.petName}
                          onChange={(e) => setPet(i, { petName: e.target.value })}
                          placeholder="Tommy"
                          className="field"
                        />
                      </label>
                      <label className="block">
                        <span className={LABEL}>Species</span>
                        <select
                          required
                          className="field"
                          value={pet.species}
                          onChange={(e) => setPet(i, { species: e.target.value, breed: "" })}
                        >
                          {speciesList.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {/* Dogs and cats pick from the list — the server rejects
                        anything else. Other animals get a free, optional box. */}
                    {breedList.length ? (
                      <label className="block">
                        <span className={LABEL}>{pet.species} breed</span>
                        <select
                          required
                          className="field"
                          value={pet.breed}
                          onChange={(e) => setPet(i, { breed: e.target.value })}
                        >
                          {breedList.map((b) => (
                            <option key={b}>{b}</option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <label className="block">
                        <span className={LABEL}>
                          Breed<Optional />
                        </span>
                        <input
                          value={pet.breed}
                          onChange={(e) => setPet(i, { breed: e.target.value })}
                          placeholder="Budgie, Lop, and so on"
                          className="field"
                        />
                      </label>
                    )}

                    <div className="grid gap-4 sm:grid-cols-3">
                      <label className="block">
                        <span className={LABEL}>Age</span>
                        <input
                          required
                          value={pet.age}
                          onChange={(e) => setPet(i, { age: e.target.value })}
                          placeholder="2 years"
                          className="field"
                        />
                      </label>

                      <label className="block">
                        <span className={LABEL}>Sex</span>
                        <select
                          required
                          className="field"
                          value={pet.sex}
                          onChange={(e) => setPet(i, { sex: e.target.value })}
                        >
                          {/* Empty default so nobody is silently recorded as Male. */}
                          <option value="" disabled>
                            Choose
                          </option>
                          {SEXES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className={LABEL}>
                          Weight kg<Optional />
                        </span>
                        <input
                          value={pet.weight}
                          onChange={(e) => setPet(i, { weight: e.target.value })}
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="12"
                          className="field"
                        />
                      </label>
                    </div>

                    {/* Which vaccine this pet is getting. Priced per pet, so
                        two dogs at different stages of the course are charged
                        for what each of them actually needs. */}
                    {askVaccine && (
                      <div className="grid gap-2">
                        <label className="block">
                          <span className={LABEL}>Vaccine</span>
                          <select
                            required
                            className="field"
                            value={pet.vaccineId}
                            onChange={(e) => setPet(i, { vaccineId: e.target.value })}
                          >
                            <option value="" disabled>
                              Choose a vaccine
                            </option>
                            {vaccineBrands.map((brand) => (
                              <optgroup key={brand} label={brand}>
                                {vaccines
                                  .filter((v) => v.brand === brand)
                                  .map((v) => (
                                    <option key={v.id} value={String(v.id)}>
                                      {v.name} — ₹{v.price}
                                    </option>
                                  ))}
                              </optgroup>
                            ))}
                          </select>
                        </label>

                        {/* The clinic's advice, edited in the admin. Shown
                            once, under the first pet, not repeated per pet. */}
                        {i === 0 && vaccineGuidance && (
                          <p className="whitespace-pre-line rounded-xl bg-white/10 px-4 py-3 text-[13px] leading-relaxed text-white/90">
                            {vaccineGuidance}
                          </p>
                        )}
                      </div>
                    )}

                    {askVaccination && (
                      <div className="rounded-2xl bg-white/10 p-4">
                        <p className="font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-white">
                          Vaccination history
                        </p>

                        <div className="mt-3 grid gap-2">
                          {VACCINATION_TYPES.map(({ value, label }) => (
                            <label
                              key={value}
                              className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-white/20"
                            >
                              <input
                                type="radio"
                                // Each pet needs its own radio group, or
                                // answering for one would clear the others.
                                name={petField(i, "vaccinationType")}
                                value={value}
                                checked={pet.vaccinationType === value}
                                onChange={() => setPet(i, { vaccinationType: value })}
                                className="h-4 w-4 accent-ink"
                              />
                              {label}
                            </label>
                          ))}
                        </div>

                        {/* Previous-vaccine details only make sense for a booster. */}
                        {annual && (
                          <div className="mt-4 grid gap-4">
                            <label className="block">
                              <span className={LABEL}>Which vaccine was given last time?</span>
                              <input
                                required
                                value={pet.vaccinationHistory}
                                onChange={(e) => setPet(i, { vaccinationHistory: e.target.value })}
                                placeholder="Rabies, DHPPi, or whatever was given"
                                className="field"
                              />
                            </label>
                            <label className="block">
                              <span className={LABEL}>
                                When was the last one?<Optional />
                              </span>
                              <input
                                value={pet.lastVaccinationDate}
                                onChange={(e) => setPet(i, { lastVaccinationDate: e.target.value })}
                                type="date"
                                max={new Date().toISOString().slice(0, 10)}
                                className="field"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* The price follows the count, so the button says what the next
                  pet costs rather than leaving it to be discovered at the
                  payment step. */}
              {petCount < options.maxPets ? (
                <button
                  type="button"
                  onClick={addPet}
                  className="rounded-2xl border border-dashed border-white/35 px-4 py-3 text-[15px] font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
                >
                  {/* With vaccines in play the cost of another pet depends on
                      which one it needs, so only the flat case names a price. */}
                  + Add another pet{!askVaccine && unit > 0 ? ` · ₹${unit} more` : ""}
                </button>
              ) : (
                <p className="text-[13px] text-white/70">
                  One booking covers up to {options.maxPets} pets. Please book any others
                  separately.
                </p>
              )}

              {rules.problem && (
                <label className="block">
                  <span className={LABEL}>What's wrong?</span>
                  <textarea
                    required
                    name="problem"
                    defaultValue={data.problem ?? ""}
                    rows={3}
                    placeholder="What you've noticed, when it started, and anything you've already tried"
                    className="field !rounded-2xl"
                  />
                </label>
              )}

              {/* Photos and videos belong to a service that asks what's wrong:
                  the vet looks at them before the call. A home deworming and
                  vaccination visit doesn't ask, so there is nothing for an
                  attachment to illustrate. */}
              {rules.problem && <AttachmentPicker files={files} onChange={setFiles} />}
            </>
          )}

          {/* 3 — appointment */}
          {step === 2 && config && rules && (
            <>
              {rules.doctor && (
                <label className="block">
                  <span className={LABEL}>Choose a doctor</span>
                  <select
                    required
                    className="field"
                    value={form.doctor}
                    onChange={(e) => {
                      setSlotWarning(null);
                      set("doctor", e.target.value);
                    }}
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    {options.doctors.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block">
                <span className={LABEL}>Preferred date</span>
                <input
                  required
                  name="date"
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setSlotWarning(null);
                    set("date", e.target.value);
                  }}
                  className="field"
                />
              </label>

              {rules.timeSlot ? (
                <fieldset>
                  <legend className={LABEL}>Choose a time</legend>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {SLOTS.map((time) => {
                      const taken = takenSlots.includes(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => chooseSlot(time)}
                          aria-pressed={form.slot === time}
                          aria-disabled={taken}
                          title={taken ? `${form.doctor} is booked at this time` : undefined}
                          className={`rounded-full px-2 py-2.5 font-display text-[12px] font-extrabold transition ${
                            taken
                              ? "cursor-not-allowed bg-white/30 text-white/60 line-through"
                              : form.slot === time
                                ? "bg-ink text-white"
                                : "bg-white text-ink hover:bg-ink hover:text-white"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>

                  {slotWarning && (
                    <p
                      role="alert"
                      className="mt-3 rounded-2xl bg-white px-4 py-3 text-[14px] font-semibold text-ink"
                    >
                      {slotWarning}
                    </p>
                  )}

                  <p className="mt-2.5 text-xs font-semibold text-white/80">
                    {!form.doctor || !form.date
                      ? "Choose a doctor and a date to see which times are free."
                      : takenSlots.length
                        ? "Crossed-out times are already booked with this doctor."
                        : "Clinic hours, 9am–9pm. We'll ring you back to confirm."}
                  </p>
                </fieldset>
              ) : (
                <p className="text-xs font-semibold text-white/80">
                  We'll ring you to agree a time for the visit.
                </p>
              )}
            </>
          )}

          {/* 4 — terms */}
          {step === 3 && (
            <>
              <div className="max-h-64 overflow-y-auto rounded-2xl bg-white p-5 text-[14px] leading-relaxed text-ink-soft">
                <p className="font-display text-[15px] font-extrabold text-ink">
                  Consultation terms
                </p>
                <ol className="mt-3 grid list-decimal gap-2.5 pl-4">
                  <li>
                    Advice given online is based only on what you describe and share. It is not a
                    substitute for physically examining your pet.
                  </li>
                  <li>
                    This service is not for emergencies. If your pet is in distress, bleeding,
                    collapsed or struggling to breathe, come to the clinic immediately.
                  </li>
                  <li>
                    A consultation may end with a recommendation to visit in person. Medicines are
                    dispensed only after a veterinarian has examined your pet.
                  </li>
                  <li>
                    You confirm the details you have given are accurate, and consent to a
                    veterinarian at K-Petz Hospital reviewing them.
                  </li>
                  <li>
                    Your details are used to provide this service and to contact you about it.
                    They are not sold or shared for marketing.
                  </li>
                  <li>
                    The fee covers the veterinarian's time. If we cannot take your appointment, it
                    is refunded in full.
                  </li>
                </ol>
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-[15px] font-semibold text-white">
                <input
                  required
                  name="agreed"
                  type="checkbox"
                  checked={form.agreed}
                  onChange={(e) => set("agreed", e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-ink"
                />
                I have read and agree to these terms.
              </label>
            </>
          )}

          {/* 5 — payment */}
          {step === 4 && config && rules && (
            <>
              <dl className="grid gap-2 rounded-2xl bg-white p-5 text-[15px]">
                {[
                  ["Service", serviceLabel],
                  // A row each, so a three-pet booking is read back in full
                  // before it is paid for.
                  ...form.pets.map((pet, i) => [
                    petCount === 1 ? "Pet" : `Pet ${i + 1}`,
                    [
                      pet.petName,
                      pet.species,
                      pet.breed,
                      // The vaccine is part of what they're paying for, so it
                      // is read back before the payment step, not after.
                      askVaccine
                        ? vaccines.find((v) => String(v.id) === pet.vaccineId)?.name
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" · "),
                  ]),
                  ...(rules.doctor ? [["Doctor", form.doctor]] : []),
                  ["Date", prettyDate(form.date)],
                  ...(rules.timeSlot ? [["Time", form.slot || "—"]] : []),
                  ["Where", `${form.city}, ${form.state}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="font-semibold text-ink-soft">{k}</dt>
                    <dd className="text-right font-display font-extrabold text-ink">{v}</dd>
                  </div>
                ))}

                <div className="mt-2 grid gap-1.5 border-t border-line pt-3">
                  <div className="flex justify-between gap-4">
                    {/* The multiplication is spelled out, so the total reads
                        as arithmetic rather than a surprise. */}
                    <dt className="text-ink-soft">
                      {askVaccine ? "Visit fee" : "Service fee"}
                      {petCount > 1 && <> · ₹{unit} × {petCount} pets</>}
                    </dt>
                    <dd className="font-semibold text-ink">₹{visitFee}</dd>
                  </div>
                  {vaccineTotal > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">
                        Vaccine{petCount > 1 ? "s" : ""}
                      </dt>
                      <dd className="font-semibold text-ink">₹{vaccineTotal}</dd>
                    </div>
                  )}
                  {gst > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">GST ({Math.round(rate * 100)}%)</dt>
                      <dd className="font-semibold text-ink">₹{gst}</dd>
                    </div>
                  )}
                  <div className="mt-1 flex justify-between gap-4 border-t border-line pt-2">
                    <dt className="font-display font-extrabold text-ink">Total</dt>
                    <dd className="font-display text-lg font-black text-ink">₹{total}</dd>
                  </div>
                </div>
              </dl>

              <UpiPayment
                amountRupees={total}
                reference={reference}
                utr={utr}
                onUtrChange={setUtr}
              />

              <p className="text-xs font-semibold text-white/85">
                We'll check the payment and ring you to confirm your appointment.
              </p>

              {sendError && (
                <p
                  role="alert"
                  className="rounded-2xl bg-white px-4 py-3 text-[14px] font-semibold text-ink"
                >
                  {sendError}
                </p>
              )}
            </>
          )}
        </div>

        <div className="mt-7 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => {
                snapshot();
                setStep((s) => s - 1);
              }}
              className="btn border-2 border-white/40 text-white hover:bg-white hover:text-ink"
            >
              Back
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={step === 3 && !form.agreed}
              className="btn btn-ink flex-1 disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={sending}
              className="btn btn-ink flex-1 gap-2 disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="h-4 w-4" aria-hidden="true" />
              )}
              {sending ? "Sending…" : utr ? "I've paid — send booking" : "Send booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** "Sun, 23 Aug 2026" rather than the input's raw 2026-08-23. */
const prettyDate = (iso: string | undefined) => {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};
