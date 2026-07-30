import { useState } from "react";
import dachshund from "@/assets/dachshund.webp";

const PET_TYPES = ["Dog", "Cat", "Bird", "Small mammal"];

const SERVICES = [
  "Deworming",
  "Vaccinations",
  "Pet hair cut",
  "Bathing",
  "Pet boarding",
  "Pet coaching",
  "Online consultancy (first aid)",
  "Second opinion",
  "Veterinary consultation",
  "Other enquiry",
];

const DOCTORS = ["Dr P. Radhika", "Dr K.F.S. Sreekanth", "No preference"];

/**
 * Clinic hours, 9am to 9pm, in half-hour steps. These are the times the clinic
 * is open — not confirmed free time. Real availability needs a backend that
 * knows what's already booked; until then the clinic confirms by phone.
 */
const SLOTS = Array.from({ length: 24 }, (_, i) => {
  const minutes = 9 * 60 + i * 30;
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
});

const LABEL =
  "mb-1.5 block font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-white";

type Props = {
  /** Preselects the service dropdown when opened from a specific card. */
  service?: string;
  /** Preselects the doctor when opened from a doctor's card. */
  doctor?: string;
  onSuccess?: () => void;
};

export default function BookingForm({ service, doctor, onSuccess }: Props) {
  // A service passed in from a card may not be one of the listed options,
  // so it's added to the list rather than silently ignored.
  const serviceOptions =
    service && !SERVICES.includes(service) ? [service, ...SERVICES] : SERVICES;
  const doctorOptions = doctor && !DOCTORS.includes(doctor) ? [doctor, ...DOCTORS] : DOCTORS;

  const [selectedService, setSelectedService] = useState(service ?? SERVICES[0]);
  const [selectedDoctor, setSelectedDoctor] = useState(doctor ?? DOCTORS[2]);
  const [slot, setSlot] = useState<string | null>(null);

  return (
    <div id="booking" className="relative scroll-mt-28">
      <img
        src={dachshund}
        alt=""
        width={215}
        height={130}
        className="absolute -top-12 left-6 hidden w-32 lg:block"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSuccess?.();
        }}
        className="relative rounded-[1.75rem] bg-brand p-6 shadow-[0_40px_80px_-40px_rgba(36,28,58,0.8)] sm:p-8"
      >
        <p className="eyebrow text-white/85">Request a consultation</p>
        <h2 className="display-md mt-2 pr-12 text-white">Arrange A Visit Today</h2>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL}>Your name</span>
              <input required placeholder="Priya Sharma" className="field" />
            </label>
            <label className="block">
              <span className={LABEL}>Phone</span>
              <input
                required
                type="tel"
                inputMode="tel"
                placeholder="98765 43210"
                className="field"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL}>Pet type</span>
              <select className="field">
                {PET_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={LABEL}>What do you need?</span>
              <select
                className="field"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {serviceOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Step 1 of the client's page 3: choose a doctor */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL}>Choose a doctor</span>
              <select
                className="field"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                {doctorOptions.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={LABEL}>Preferred date</span>
              <input
                required
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                className="field"
              />
            </label>
          </div>

          {/* Step 2 of the client's page 3: choose a slot */}
          <fieldset>
            <legend className={LABEL}>Choose a slot</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {SLOTS.map((time) => {
                const active = slot === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSlot(time)}
                    aria-pressed={active}
                    className={`rounded-full px-2 py-2.5 font-display text-[12px] font-extrabold transition ${
                      active
                        ? "bg-ink text-white"
                        : "bg-white text-ink hover:bg-ink hover:text-white"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            {/* Honest about what these times are. */}
            <p className="mt-2.5 text-xs font-semibold text-white/80">
              Clinic hours, 9am–9pm. We'll ring you back to confirm the slot.
            </p>
          </fieldset>

          <button type="submit" disabled={!slot} className="btn btn-ink mt-2 w-full disabled:opacity-50">
            {slot ? `Request ${slot}` : "Choose a slot to continue"}
          </button>
        </div>
      </form>
    </div>
  );
}