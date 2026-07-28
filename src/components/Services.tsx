import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import svcDeworming from "@/assets/svc-deworming.webp";
import svcVaccination from "@/assets/svc-vaccination.webp";
import svcHaircut from "@/assets/svc-haircut.webp";
import svcBathing from "@/assets/svc-bathing.webp";
import dogLying from "@/assets/dog-lying.webp";
import { BoneMark, PawField, Sparkle } from "./decor/Decor";
import Reveal from "./Reveal";
import { useBooking } from "./BookingProvider";

const SERVICES = [
  {
    img: svcDeworming,
    title: "Home deworming",
    where: "At your home",
    desc: "A vet comes to you for routine deworming — no car journey, no waiting room.",
    alt: "A veterinarian giving deworming medication to a labrador at home while its owners watch",
  },
  {
    img: svcVaccination,
    title: "Vaccinations",
    where: "At the clinic",
    desc: "Core vaccinations and boosters, given by a qualified veterinarian.",
    alt: "A veterinarian vaccinating a golden retriever puppy on a clinic table",
  },
  {
    img: svcHaircut,
    title: "Pet hair cut",
    where: "At the clinic",
    desc: "Breed-appropriate trimming and styling, done at your pet's own pace.",
    alt: "A shih tzu being trimmed with scissors on a grooming table",
  },
  {
    img: svcBathing,
    title: "Bathing",
    where: "At the clinic",
    desc: "A warm bath, blow-dry and brush-out using skin-friendly shampoo.",
    alt: "A small white dog being lathered with shampoo in a grooming bath",
  },
];

export default function Services() {
  const { openBooking } = useBooking();
  // Touch devices don't fire :hover on a non-interactive element, so the tapped
  // card is tracked explicitly. Mouse pointers are left to plain :hover.
  const [tapped, setTapped] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tapped === null) return;
    const clear = (e: PointerEvent) => {
      if (!gridRef.current?.contains(e.target as Node)) setTapped(null);
    };
    document.addEventListener("pointerdown", clear);
    return () => document.removeEventListener("pointerdown", clear);
  }, [tapped]);

  return (
    <section id="services" className="px-3 py-10 md:px-5 md:py-14">
      {/* The cut rings on the cards punch through to this panel, so they take its colour. */}
      <div className="relative overflow-hidden rounded-[1.5rem] bg-bark py-16 [--cut-bg:var(--bark)] md:rounded-[2rem] md:py-20 lg:py-24">
        <PawField className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.045]" />

        <img
          src={dogLying}
          alt=""
          width={250}
          height={150}
          className="pointer-events-none absolute left-10 top-16 hidden w-56 xl:block"
        />

        <div className="pointer-events-none absolute right-14 top-20 hidden items-center gap-3 xl:flex">
          <Sparkle className="h-5 w-5 text-cream/80" />
          <BoneMark className="h-16 w-32 -rotate-12 text-cream/80" />
          <Sparkle className="h-3.5 w-3.5 self-end text-cream/80" />
        </div>

        <div className="container-x relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-gold">K-Petz care</p>
            <h2 className="display-lg mt-5 text-white">Excellence In Every Service</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-cream/75">
              Coaching a new puppy or grooming a spirited parrot — the same team handles both, and
              they've been doing it for fifteen years.
            </p>
          </Reveal>

          <div ref={gridRef} className="mt-14 grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
            {SERVICES.map((service, i) => (
              <Reveal key={service.title} delay={(i % 4) * 90}>
                <article
                  onPointerDown={(e) => {
                    if (e.pointerType !== "mouse") setTapped(i);
                  }}
                  data-tapped={tapped === i || undefined}
                  className="group relative h-full rounded-[1.5rem] bg-cream-deep p-3.5 transition-colors duration-300 hover:bg-brand data-[tapped]:bg-brand"
                >
                  <div className="overflow-hidden rounded-[1.15rem]">
                    <img
                      src={service.img}
                      alt={service.alt}
                      width={900}
                      height={675}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="px-2.5 pb-10 pt-6">
                    <h3 className="text-[26px] transition-colors duration-300 group-hover:text-white group-data-[tapped]:text-white">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 font-display text-[15px] font-extrabold transition-colors duration-300 group-hover:text-white group-data-[tapped]:text-white">
                      {service.where}
                    </p>
                    <p className="mt-3.5 pr-12 text-[15px] leading-relaxed text-ink-soft transition-colors duration-300 group-hover:text-white group-data-[tapped]:text-white">
                      {service.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => openBooking(service.title)}
                    aria-label={`Book ${service.title.toLowerCase()}`}
                    className="cut-ring absolute bottom-0 right-0 grid h-14 w-14 place-items-center rounded-full bg-brand text-white transition duration-300 group-hover:bg-white group-hover:text-ink group-data-[tapped]:bg-white group-data-[tapped]:text-ink hover:scale-105"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </button>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}