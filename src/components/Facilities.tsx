import { Activity, HeartPulse, Microscope, Pill, Scan } from "lucide-react";
import Reveal from "./Reveal";

/**
 * The one place on the site that lists equipment. Every other section used to
 * repeat some of this; they now describe what they do and leave the kit here.
 * All five are from the clinic's own pamphlet and Justdial listing.
 */
const FACILITIES = [
  { Icon: Scan, label: "X-ray" },
  { Icon: Activity, label: "Ultrasound scanning" },
  { Icon: HeartPulse, label: "Operation theatre" },
  { Icon: Microscope, label: "In-house lab" },
  { Icon: Pill, label: "Pharmacy" },
];

export default function Facilities() {
  return (
    <section id="facilities" aria-labelledby="facilities-heading" className="bg-cream-deep py-14 md:py-16">
      <div className="container-x">
        <Reveal className="text-center">
          <p className="eyebrow">Under one roof</p>
          <h2 id="facilities-heading" className="display-md mt-4">
            Everything Your Pet Needs In One Visit
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-8 sm:gap-x-10 md:gap-x-14">
            {FACILITIES.map(({ Icon, label }) => (
              <li key={label} className="flex w-[132px] flex-col items-center text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-[0_16px_36px_-24px_rgba(36,28,58,0.8)] md:h-18 md:w-18">
                  <Icon className="h-7 w-7 text-brand" aria-hidden="true" />
                </span>
                <span className="mt-4 font-display text-[13px] font-extrabold uppercase leading-tight tracking-[0.1em]">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
