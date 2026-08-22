import { Stethoscope } from "lucide-react";
import { PawMark } from "./decor/Decor";
import Reveal from "./Reveal";
import { useBooking } from "./BookingProvider";

/**
 * No photographs here on purpose. The previous version used stock images
 * alongside the doctors' real names, which reads as though they are the
 * veterinarians themselves. Initials are honest, and the section works
 * perfectly well without them.
 *
 * Both names and qualifications are from the clinic's own pamphlet.
 */
const DOCTORS = [
  {
    name: "Dr P. Radhika",
    role: "Veterinary physician",
    credentials: ["M.V.Sc", "Medicine"],
    bio: "Small-animal medicine, diagnostics and preventive care, including vaccination and deworming schedules.",
  },
  {
    name: "Dr K.F.S. Sreekanth",
    role: "Veterinary physician",
    credentials: ["M.V.Sc", "Medicine"],
    bio: "Medicine and surgical cases, from routine procedures through to the more complex ones.",
  },
];

/** "Dr P. Radhika" -> "PR", so the monogram reads as a person, not a shape. */
const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function Doctors() {
  const { openBooking } = useBooking();

  return (
    <section id="vets" className="section-y relative overflow-hidden bg-cream-deep">
      <PawMark className="pointer-events-none absolute -left-20 bottom-0 hidden h-80 w-80 rotate-12 text-white/50 lg:block" />

      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Our doctors</p>
          <h2 className="display-lg mt-5">Who You'll Actually See</h2>
          <p className="lede mx-auto mt-6 max-w-xl">
            Two resident veterinary physicians, both M.V.Sc qualified. You'll see the same face
            at each visit.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {DOCTORS.map((doctor, i) => (
            <Reveal key={doctor.name} delay={i * 120}>
              <article className="flex h-full flex-col rounded-[1.75rem] bg-cream p-8">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand font-display text-[20px] font-black text-white"
                  >
                    {initials(doctor.name)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-[22px] font-extrabold leading-tight">
                      {doctor.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-[14px] font-semibold text-ink-soft">
                      <Stethoscope className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                      {doctor.role}
                    </p>
                  </div>
                </div>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {doctor.credentials.map((credential) => (
                    <li
                      key={credential}
                      className="rounded-full bg-cream-deep px-3 py-1 font-display text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-soft"
                    >
                      {credential}
                    </li>
                  ))}
                </ul>

                <p className="mt-5 grow text-[15px] leading-relaxed text-ink-soft">{doctor.bio}</p>

                <button
                  onClick={() => openBooking("Veterinary consultation", doctor.name)}
                  className="btn btn-outline mt-7 w-full"
                >
                  Book with {doctor.name.replace(/^Dr\.?\s+/i, "")}
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}