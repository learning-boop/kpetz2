import { useMemo, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";

/** Backend base URL. Set VITE_API_URL in .env — e.g. https://api.kpetzhospital.com */
const API_BASE = import.meta.env.VITE_API_URL ?? "";

/** Razorpay publishable key. Safe in the browser; the SECRET must stay server-side. */
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID ?? "";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

/** Injects Razorpay's checkout script once, on demand. */
function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Consultation fee shown on the payment step.
 * PLACEHOLDER — replace with the clinic's actual figure before launch.
 */
const FEE_INR = 500;

const STEPS = ["Your details", "Your pet", "Appointment", "Terms", "Payment"];

const STATES = [
  "Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka", "Kerala", "Maharashtra",
  "Odisha", "West Bengal", "Delhi", "Gujarat", "Rajasthan", "Uttar Pradesh",
  "Madhya Pradesh", "Bihar", "Punjab", "Haryana", "Assam", "Jharkhand",
  "Chhattisgarh", "Uttarakhand", "Himachal Pradesh", "Goa", "Other",
];

const SPECIES = ["Dog", "Cat","Other"];
const SEXES = ["Male", "Female", "Not sure"];
const VACCINATED = ["Yes", "No", "Not sure"];

const SERVICES = [
  "Online consultancy (first aid)", "Second opinion", "Veterinary consultation",
  "Deworming", "Vaccinations", "Pet surgeries", "Pet hair cut", "Bathing",
  "Pet boarding", "Other enquiry",
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

type Props = { service?: string; doctor?: string; onSuccess?: () => void };

export default function BookingForm({ service, doctor, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const stepRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const serviceOptions = useMemo(
    () => (service && !SERVICES.includes(service) ? [service, ...SERVICES] : SERVICES),
    [service]
  );

  const [form, setForm] = useState({
    service: service ?? SERVICES[0],
    doctor: doctor ?? DOCTORS[2],
    vaccinated: VACCINATED[2],
    slot: "",
    agreed: false,
  });
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  /** Everything typed so far, keyed by field name, for the booking request. */
  const collect = () => {
    const data: Record<string, unknown> = { ...form };
    formRef.current
      ?.querySelectorAll<HTMLInputElement>("input[name], select[name], textarea[name]")
      .forEach((el) => {
        if (el.type === "checkbox") data[el.name] = el.checked;
        else if (el.value) data[el.name] = el.value;
      });
    return data;
  };

  /** Native validation, scoped to the fields in the step being left. */
  const next = () => {
    const fields = stepRef.current?.querySelectorAll<HTMLInputElement>("input, select, textarea");
    for (const field of Array.from(fields ?? [])) {
      if (!field.reportValidity()) return;
    }
    if (step === 2 && !form.slot) {
      window.alert("Please choose a slot.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  /**
   * Razorpay in four moves:
   *   1. the backend creates an order and returns its id (amount set server-side)
   *   2. checkout opens in the browser with that order id
   *   3. the backend re-checks the returned signature before trusting anything
   *   4. Razorpay's webhook confirms it independently, in case the browser closed
   * Never mark a booking paid from the browser alone — that response is forgeable.
   */
  const pay = async () => {
    setPayError(null);

    if (!API_BASE || !RAZORPAY_KEY) {
      setPayError("Payments aren't configured yet. Please call the clinic to confirm.");
      return;
    }

    setPaying(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not reach the payment provider.");

      const payload = collect();

      // The server decides the amount — never send it from here.
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Could not start the payment.");
      const { orderId, amount, currency, bookingId } = await res.json();

      const rzp = new window.Razorpay!({
        key: RAZORPAY_KEY,
        order_id: orderId,
        amount,
        currency,
        name: "K-Petz Hospital",
        description: form.service,
        prefill: {
          name: String(payload.ownerName ?? ""),
          email: String(payload.email ?? ""),
          contact: String(payload.phone ?? ""),
        },
        theme: { color: "#4a63a8" },
        handler: async (response: Record<string, string>) => {
          const verify = await fetch(`${API_BASE}/api/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, bookingId }),
          });
          if (verify.ok) onSuccess?.();
          else setPayError("We couldn't confirm the payment. The clinic will call you.");
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div id="booking" ref={formRef} className="relative scroll-mt-28">
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
        </p>

        <div ref={stepRef} className="mt-6 grid gap-4">
          {/* 1 — owner */}
          {step === 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={LABEL}>Your name</span>
                  <input required name="ownerName" placeholder="Priya Sharma" className="field" />
                </label>
                <label className="block">
                  <span className={LABEL}>Phone</span>
                  <input
                    required
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9+ ]{10,15}"
                    title="Enter a valid phone number"
                    placeholder="98765 43210"
                    className="field"
                  />
                </label>
              </div>
              <label className="block">
                <span className={LABEL}>Email</span>
                <input required name="email" type="email" placeholder="priya@example.com" className="field" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={LABEL}>State</span>
                  <select required name="state" defaultValue="Andhra Pradesh" className="field">
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={LABEL}>City</span>
                  <input required name="city" placeholder="Vijayawada" className="field" />
                </label>
              </div>
            </>
          )}

          {/* 2 — pet */}
          {step === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={LABEL}>Pet's name</span>
                  <input required name="petName" placeholder="Tommy" className="field" />
                </label>
                <label className="block">
                  <span className={LABEL}>Species</span>
                  <select name="species" className="field">
                    {SPECIES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className={LABEL}>Age</span>
                  <input required name="age" placeholder="2 years" className="field" />
                </label>
                <label className="block">
                  <span className={LABEL}>Sex</span>
                  <select name="sex" className="field">
                    {SEXES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={LABEL}>Weight (kg)</span>
                  <input name="weight" type="number" min="0" step="0.1" placeholder="12" className="field" />
                </label>
              </div>
              <label className="block">
                <span className={LABEL}>Breed</span>
                <input name="breed" placeholder="Labrador" className="field" />
              </label>
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
                <span className={LABEL}>Last vaccination date</span>
                <input
                  name="lastVaccinationDate"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  className="field"
                />
              </label>
              <label className="block">
                <span className={LABEL}>Previous vaccination history</span>
                <textarea
                  name="vaccinationHistory"
                  rows={3}
                  placeholder="Which vaccines your pet has had and roughly when — rabies, DHPPi, boosters. Leave blank if none."
                  className="field !rounded-2xl"
                />
              </label>
              <label className="block">
                <span className={LABEL}>Describe the problem</span>
                <textarea
                  required
                  name="problem"
                  rows={3}
                  placeholder="What's wrong, when it started, and anything you've already tried"
                  className="field !rounded-2xl"
                />
              </label>
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
                    onChange={(e) => set("service", e.target.value)}
                  >
                    {serviceOptions.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={LABEL}>Choose a doctor</span>
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
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  className="field"
                />
              </label>
              <fieldset>
                <legend className={LABEL}>Choose a slot</legend>
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
                  Clinic hours, 9am–9pm. We'll ring you back to confirm the slot.
                </p>
              </fieldset>
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
                  ["Slot", form.slot || "—"],
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
              <p className="text-xs font-semibold text-white/85">
                You'll be taken to a secure payment page. Your appointment is confirmed once
                payment succeeds.
              </p>
              {payError && (
                <p role="alert" className="rounded-2xl bg-white px-4 py-3 text-[14px] font-semibold text-ink">
                  {payError}
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
              onClick={() => setStep((s) => s - 1)}
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
              onClick={pay}
              disabled={paying}
              className="btn btn-ink flex-1 gap-2 disabled:opacity-60"
            >
              {paying ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="h-4 w-4" aria-hidden="true" />
              )}
              {paying ? "Opening payment…" : `Pay ₹${FEE_INR}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}