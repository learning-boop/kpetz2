import { Stethoscope } from "lucide-react";
import drPrimary from "@/assets/doctor1.png";
import drSecondary from "@/assets/doctor2.png";
import { PawMark } from "./decor/Decor";
import Reveal from "./Reveal";
import { useBooking } from "./BookingProvider";

const DOCTORS = [
  {
    name: "Dr P. Radhika",
    role: "Veterinary physician",
    bio: "Small-animal medicine, diagnostics and preventive care, supported by in-house X-ray, ultrasound scanning and lab facilities.",
    credentials: ["M.V.Sc", "Medicine"],
    photo: drPrimary,
    /** Framing for the circular crop — adjust per photo. */
    focal: "50% 26%",
    days: "Phone 80198 88877",
  },
  {
    name: "Dr K.F.S. Sreekanth",
    role: "Veterinary physician",
    bio: "Medicine and surgical cases, with a fully equipped operating theatre on site for procedures that need it.",
    credentials: ["M.V.Sc", "Medicine"],
    photo: drSecondary,
    focal: "50% 32%",
    days: "Phone 81850 48877",
  },
];

export default function Doctors() {
  const { openBooking } = useBooking();

  return (
    <section id="vets" className="section-y relative overflow-hidden bg-cream">
      <PawMark className="pointer-events-none absolute -left-20 top-24 hidden h-72 w-72 rotate-12 text-sand/55 lg:block" />
      <PawMark className="pointer-events-none absolute -right-16 bottom-16 hidden h-56 w-56 -rotate-12 text-sand/55 lg:block" />

      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Meet the vets</p>
          <h2 className="display-lg mt-5">The Hands Your Pet Is In</h2>
          <p className="lede mt-5">
            Two resident veterinary physicians, both M.V.Sc qualified, working with X-ray,
            ultrasound and a full operating theatre on site.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-4xl gap-14 sm:grid-cols-2 sm:gap-10 lg:gap-16">
          {DOCTORS.map((doctor, i) => (
            <Reveal key={doctor.name} delay={i * 120}>
              <article className="text-center">
                <div className="relative mx-auto w-fit">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 translate-x-3 translate-y-3 rounded-full bg-sand"
                  />
                  <img
                    src={doctor.photo}
                    alt={doctor.name}
                    width={600}
                    height={600}
                    loading="lazy"
                    style={{ objectPosition: doctor.focal }}
                    className="relative h-52 w-52 rounded-full object-cover shadow-[0_30px_60px_-35px_rgba(42,39,36,0.75)] ring-8 ring-white md:h-60 md:w-60"
                  />
                  <span className="cut-ring absolute bottom-2 right-2 z-10 grid h-14 w-14 place-items-center rounded-full bg-brand text-white">
                    <Stethoscope className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>

                <h3 className="mt-8 text-[26px]">{doctor.name}</h3>
                <p className="mt-1.5 font-display text-sm font-extrabold uppercase tracking-[0.14em] text-brand">
                  {doctor.role}
                </p>

                <ul className="mt-4 flex flex-wrap justify-center gap-2">
                  {doctor.credentials.map((credential) => (
                    <li
                      key={credential}
                      className="rounded-full bg-cream-deep px-3.5 py-1.5 font-display text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft"
                    >
                      {credential}
                    </li>
                  ))}
                </ul>

                <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{doctor.bio}</p>

                <p className="mt-5 font-display text-[13px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">
                  {doctor.days}
                </p>

                <button
                  onClick={() => openBooking("Veterinary consultation", doctor.name)}
                  className="btn btn-ink mt-6"
                >
                  Book with {doctor.name.split(" ").slice(1).join(" ")}
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}