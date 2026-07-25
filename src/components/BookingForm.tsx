import { useState } from "react";
import dachshund from "@/assets/dachshund.webp";

const PET_TYPES = ["Dog", "Cat", "Bird", "Small mammal"];
const SERVICES = [
  "Pet grooming",
  "Pet boarding",
  "Pet daycare",
  "Veterinary check-up",
  "Training programme",
  "Adoption enquiry",
];

const LABEL =
  "mb-1.5 block font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-white";

type Props = {
  /** Preselects the service dropdown when opened from a specific card. */
  service?: string;
  onSuccess?: () => void;
};

export default function BookingForm({ service, onSuccess }: Props) {
  // A service passed in from a card may not be one of the six listed options,
  // so it's added to the list rather than silently ignored.
  const options = service && !SERVICES.includes(service) ? [service, ...SERVICES] : SERVICES;
  const [selected, setSelected] = useState(service ?? SERVICES[0]);

  return (
    <div className="relative">
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
        className="relative rounded-[1.75rem] bg-brand p-6 shadow-[0_40px_80px_-40px_rgba(42,39,36,0.8)] sm:p-8"
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
              <span className={LABEL}>Email</span>
              <input required type="email" placeholder="priya@example.com" className="field" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL}>Preferred date</span>
              <input required type="date" className="field" />
            </label>
            <label className="block">
              <span className={LABEL}>Pet type</span>
              <select className="field">
                {PET_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className={LABEL}>What do you need?</span>
            <select
              className="field"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {options.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>

          <button type="submit" className="btn btn-ink mt-2 w-full">
            Book an appointment
          </button>
          <p className="text-center text-xs font-semibold text-white/80">
            We reply within one working day.
          </p>
        </div>
      </form>
    </div>
  );
}
