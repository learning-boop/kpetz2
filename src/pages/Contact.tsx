import { Clock, Mail, MapPin, Phone } from "lucide-react";
import PolicyPage from "./PolicyPage";

const LOCATIONS = [
  {
    name: "Poranki — Hospital",
    address: "Behind the street of Saibaba Temple, Srinivasa Nagar, Poranki, Vijayawada, Andhra Pradesh",
    maps: "https://www.google.com/maps/search/?api=1&query=K-Petz+Hospital+Poranki+Vijayawada",
  },
  
];

export default function Contact() {
  return (
    <PolicyPage title="Contact Us" updated="August 2026">
      <p>
        K-Petz Hospital, Vijayawada. Call us for anything urgent — we answer the phone faster than
        the inbox.
      </p>

      <h2>Phone</h2>
      <ul>
        <li><a href="tel:+918019888877">80198 88877</a></li>
        <li><a href="tel:+918185048877">81850 48877</a></li>
      </ul>

      <h2>Email</h2>
      <p>
        <a href="mailto:kpetzhospital@gmail.com">kpetzhospital@gmail.com</a>
      </p>

      <h2>Where to find us</h2>
      {LOCATIONS.map((loc) => (
        <div key={loc.name} className="mt-6 rounded-2xl bg-cream-deep p-6">
          <p className="font-display text-[17px] font-extrabold text-ink">{loc.name}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{loc.address}</p>
          <a
            href={loc.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 font-display text-[12px] font-extrabold uppercase tracking-[0.12em] text-brand hover:underline"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Get directions
          </a>
        </div>
      ))}

      <h2>Opening hours</h2>
      <p>
        Please call to confirm before travelling, particularly on public holidays.
      </p>

      <h2>Emergencies</h2>
      <p>
        <strong>
          If your pet is bleeding, collapsed, struggling to breathe or in evident distress, do not
          wait for a reply by email — call us, or come straight to the clinic.
        </strong>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { Icon: Phone, label: "Call", value: "80198 88877", href: "tel:+918019888877" },
          { Icon: Mail, label: "Email", value: "kpetzhospital@gmail.com", href: "mailto:kpetzhospital@gmail.com" },
          { Icon: MapPin, label: "Visit", value: "Poranki & Gunadala, Vijayawada" },
          { Icon: Clock, label: "Before you travel", value: "Call ahead to confirm" },
        ].map(({ Icon, label, value, href }) => (
          <div key={label} className="flex gap-4 rounded-2xl border border-line p-5">
            <Icon className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
                {label}
              </p>
              {href ? (
                <a href={href} className="mt-1 block break-words text-[15px] font-semibold text-ink hover:text-brand">
                  {value}
                </a>
              ) : (
                <p className="mt-1 break-words text-[15px] font-semibold text-ink">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </PolicyPage>
  );
}
