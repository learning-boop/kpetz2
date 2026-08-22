import { useMemo, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import AttachmentPicker from "./AttachmentPicker";
import UpiPayment from "./UpiPayment";

/** Backend base URL. Set VITE_API_URL in .env — e.g. https://kpetz.com */
const API_BASE = import.meta.env.VITE_API_URL ?? "";

/**
 * Fee shown on the payment step.
 * PLACEHOLDER — replace with the clinic's actual figure before launch.
 */
const FEE_INR = 400;

const STEPS = ["Your details", "Your pet", "Appointment", "Terms", "Payment"];

const STATES = [
  "Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka", "Kerala", "Maharashtra",
  "Odisha", "West Bengal", "Delhi", "Gujarat", "Rajasthan", "Uttar Pradesh",
  "Madhya Pradesh", "Bihar", "Punjab", "Haryana", "Assam", "Jharkhand",
  "Chhattisgarh", "Uttarakhand", "Himachal Pradesh", "Goa", "Other",
];

const SPECIES = ["Dog", "Cat",  "Other"];
const SEXES = ["Male", "Female", "Not sure"];
const VACCINATED = ["Yes", "No", "Not sure"];

/**
 * Services the vet travels for. These are only offered in the clinic's own
 * city, so the address fields are locked when one is selected.
 */
const HOME_VISIT = [
  "Home visit",
  "Vaccination at home",
  "Home treatment",
  "Deworming",
];
const HOME_VISIT_CITY = "Vijayawada";
const HOME_VISIT_STATE = "Andhra Pradesh";

/** Neutral default. Home services restrict the city, so never default to one. */
const DEFAULT_SERVICE = "Veterinary consultation";

const SERVICES = [
  "Veterinary consultation",
  "Online consultancy (first aid)",
  "Second opinion",
  "Home visit",
  "Vaccination at home",
  "Home treatment",
  "Deworming",
  "Vaccinations",
  "Pet surgeries",
  "Pet hair cut",
  "Bathing",
  "Pet boarding",
  "Other enquiry",
];

const DOCTORS = ["Dr P. Radhika", "Dr K.F.S. Sreekanth", "No preference"];

/** Clinic hours in half-hour steps. Opening times, not confirmed free time. */
const SLOTS = Array.from({ length: 24 }, (_, i) => {
  const mins = 9 * 60 + i * 30;
  const h24 = Math.floor(mins / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mins % 60).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
});

const LABEL =
  "mb-1.5 block font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-white";

/** Marks a field as optional, so required ones aren't guessed at. */
const Optional = () => (
  <span className="font-semibold normal-case tracking-normal text-white/60"> — optional</span>
);

type Props = { service?: string; doctor?: string; onSuccess?: () => void };

export default function BookingForm({ service, doctor, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [cityClash, setCityClash] = useState(false);
  const [data, setData] = useState<Record<string, string>>({});
  const [utr, setUtr] = useState("");
  const stepRef = useRef<HTMLDivElement>(null);

  /** Shown on the QR so the clinic can match a payment before the row exists. */
  const [reference] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase());

  const serviceOptions = useMemo(
    () => (service && !SERVICES.includes(service) ? [service, ...SERVICES] : SERVICES),
    [service]
  );

  const [form, setForm] = useState({
    service: service ?? DEFAULT_SERVICE,
    doctor: doctor ?? DOCTORS[2],
    species: SPECIES[0],
    sex: SEXES[2],
    vaccinated: VACCINATED[2],
    slot: "",
    agreed: false,
  });
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  /** Home services only cover the clinic's own city, so the address is fixed. */
  const homeVisit = HOME_VISIT.includes(form.service);

  /** Whatever city they gave at step 1, kept in state once that step unmounted. */
  const cityEntered = (data.city ?? "").trim();

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
    Object.entries(form).forEach(([k, v]) => (merged[k] = String(v)));
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

  /** Native validation, scoped to the fields in the step being left. */
  const next = () => {
    const fields = stepRef.current?.querySelectorAll<HTMLInputElement>("input, select, textarea");
    for (const field of Array.from(fields ?? [])) {
      if (!field.reportValidity()) return;
    }
    snapshot();

    if (step === 2 && !form.slot) {
      window.alert("Please choose a time slot.");
      return;
    }
    // They may have entered another city at step 1, then picked a home service here.
    if (
      step === 2 &&
      homeVisit &&
      cityEntered &&
      cityEntered.toLowerCase() !== HOME_VISIT_CITY.toLowerCase()
    ) {
      setCityClash(true);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  /**
   * Sends the booking. Payment is by UPI, verified by a human afterwards, so
   * there is no gateway callback to wait for — this just submits the form.
   *
   * The UTR the customer types is a CLAIM, not proof. The server records the
   * booking as 'claimed' and staff check it against the bank statement.
   */
  const submit = async () => {
    setSendError(null);

    if (!API_BASE) {
      setSendError("Booking isn't available right now. Please call 80198 88877.");
      return;
    }

    setSending(true);
    try {
      // No Content-Type header: the browser sets the multipart boundary itself.
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        body: asFormData(),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
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

        {/* Progress */}
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
          {/* 1 — owner */}
          {step === 0 && (
            <>
              <p className="text-[14px] leading-relaxed text-white/85">
                So we know who to call back.
              </p>

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

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={LABEL}>State</span>
                  <select
                    required
                    name="state"
                    defaultValue={homeVisit ? HOME_VISIT_STATE : data.state ?? "Andhra Pradesh"}
                    disabled={homeVisit}
                    className="field disabled:opacity-70"
                  >
                    {(homeVisit ? [HOME_VISIT_STATE] : STATES).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={LABEL}>City</span>
                  {homeVisit ? (
                    <select required name="city" className="field disabled:opacity-70" disabled>
                      <option>{HOME_VISIT_CITY}</option>
                    </select>
                  ) : (
                    <input
                      required
                      name="city"
                      defaultValue={data.city ?? ""}
                      placeholder="Vijayawada"
                      className="field"
                    />
                  )}
                </label>
              </div>

              {homeVisit && (
                <p className="rounded-2xl bg-white/15 px-4 py-3 text-[13px] font-semibold leading-relaxed text-white">
                  {form.service} is available in {HOME_VISIT_CITY} only. For anywhere else, choose
                  a different service or visit the clinic.
                </p>
              )}
            </>
          )}

          {/* 2 — pet */}
          {step === 1 && (
            <>
              <p className="text-[14px] leading-relaxed text-white/85">
                The more the vet knows before you arrive, the better.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={LABEL}>Pet's name</span>
                  <input
                    required
                    name="petName"
                    defaultValue={data.petName ?? ""}
                    placeholder="Tommy"
                    className="field"
                  />
                </label>
                <label className="block">
                  <span className={LABEL}>Species</span>
                  <select
                    name="species"
                    className="field"
                    value={form.species}
                    onChange={(e) => set("species", e.target.value)}
                  >
                    {SPECIES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className={LABEL}>Age</span>
                  <input
                    required
                    name="age"
                    defaultValue={data.age ?? ""}
                    placeholder="2 years"
                    className="field"
                  />
                </label>
                <label className="block">
                  <span className={LABEL}>
                    Sex<Optional />
                  </span>
                  <select
                    name="sex"
                    className="field"
                    value={form.sex}
                    onChange={(e) => set("sex", e.target.value)}
                  >
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
                    name="weight"
                    defaultValue={data.weight ?? ""}
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="12"
                    className="field"
                  />
                </label>
              </div>

              <label className="block">
                <span className={LABEL}>
                  Breed<Optional />
                </span>
                <input
                  name="breed"
                  defaultValue={data.breed ?? ""}
                  placeholder="Labrador"
                  className="field"
                />
              </label>

              {/* Vaccination, grouped so step 2 doesn't read as one long column. */}
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-white">
                  Vaccination
                </p>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={LABEL}>Vaccinated?</span>
                    <select
                      name="vaccinated"
                      className="field"
                      value={form.vaccinated}
                      onChange={(e) => set("vaccinated", e.target.value)}
                    >
                      {VACCINATED.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className={LABEL}>
                      Last vaccination<Optional />
                    </span>
                    <input
                      name="lastVaccinationDate"
                      defaultValue={data.lastVaccinationDate ?? ""}
                      type="date"
                      max={new Date().toISOString().slice(0, 10)}
                      className="field"
                    />
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className={LABEL}>
                    Which vaccines, and when<Optional />
                  </span>
                  <textarea
                    name="vaccinationHistory"
                    defaultValue={data.vaccinationHistory ?? ""}
                    rows={2}
                    placeholder="Rabies, DHPPi, boosters — roughly when. Leave blank if none."
                    className="field !rounded-2xl"
                  />
                </label>
              </div>

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

              <AttachmentPicker files={files} onChange={setFiles} />
            </>
          )}

          {/* 3 — appointment */}
          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={LABEL}>What do you need?</span>
                  <select
                    name="service"
                    className="field"
                    value={form.service}
                    onChange={(e) => {
                      set("service", e.target.value);
                      setCityClash(false);
                    }}
                  >
                    {serviceOptions.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={LABEL}>
                    Choose a doctor<Optional />
                  </span>
                  <select
                    name="doctor"
                    className="field"
                    value={form.doctor}
                    onChange={(e) => set("doctor", e.target.value)}
                  >
                    {DOCTORS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className={LABEL}>Preferred date</span>
                <input
                  required
                  name="date"
                  defaultValue={data.date ?? ""}
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  className="field"
                />
              </label>

              <fieldset>
                <legend className={LABEL}>Choose a time</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {SLOTS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => set("slot", time)}
                      aria-pressed={form.slot === time}
                      className={`rounded-full px-2 py-2.5 font-display text-[12px] font-extrabold transition ${
                        form.slot === time
                          ? "bg-ink text-white"
                          : "bg-white text-ink hover:bg-ink hover:text-white"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-xs font-semibold text-white/80">
                  These are clinic hours, 9am–9pm. We'll ring you back to confirm the time.
                </p>
              </fieldset>

              {cityClash && (
                <p
                  role="alert"
                  className="rounded-2xl bg-white px-4 py-3 text-[14px] font-semibold text-ink"
                >
                  {form.service} is available in {HOME_VISIT_CITY} only, but you entered{" "}
                  {cityEntered}. Go back and change the city, or choose a different service.
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
                    Your details are used to provide this consultation and to contact you about it.
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
          {step === 4 && (
            <>
              <dl className="grid gap-2 rounded-2xl bg-white p-5 text-[15px]">
                {[
                  ["Service", form.service],
                  ["Doctor", form.doctor],
                  ["Date", data.date || "—"],
                  ["Time", form.slot || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="font-semibold text-ink-soft">{k}</dt>
                    <dd className="text-right font-display font-extrabold text-ink">{v}</dd>
                  </div>
                ))}
                <div className="mt-2 flex justify-between gap-4 border-t border-line pt-3">
                  <dt className="font-display font-extrabold text-ink">Amount</dt>
                  <dd className="font-display text-lg font-black text-ink">₹{FEE_INR}</dd>
                </div>
              </dl>

              <UpiPayment
                amountRupees={FEE_INR}
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

        {/* Navigation */}
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
