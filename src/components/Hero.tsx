import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Header } from "./Header";
import BookingForm from "./BookingForm";
import { PawMark } from "./decor/Decor";
import { useBooking } from "./BookingProvider";
import HeroVideo from "./HeroVideo";

type Slide = {
  title: [string, string];
  body: string;
};

/**
 * Kept deliberately short. Only the headline and one line move; the service
 * list and the buttons below stay put, so far less of the hero is in motion.
 */
const SLIDES: Slide[] = [
  {
    title: ["Vaccination", "For Your Pet"],
    body: "Protect your dog or cat from illness.",
  },
  {
    title: ["Deworming", "At Your Home"],
    body: "Our vet comes to you. No travel needed.",
  },
  {
    title: ["We Love, Care,", "Treat Your Pets"],
    body: "X-ray, scanning and lab tests in Vijayawada.",
  },
];

/** Always on screen, so visitors see the full offer whichever slide is showing. */
const SERVICES = ["Vaccination", "Home deworming", "Pet grooming"];

const SLIDE_HOLD = 9000;

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduce;
}

export default function Hero() {
  const { openBooking } = useBooking();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const reduceMotion = usePrefersReducedMotion();

  const go = (step: number) => setIndex((i) => (i + step + SLIDES.length) % SLIDES.length);

  // Re-armed per slide, so manual navigation restarts the clock
  // instead of cutting the slide you just picked short.
  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_HOLD);
    return () => clearTimeout(t);
  }, [index, reduceMotion]);

  return (
    <section id="home" className="relative px-3 pb-8 md:px-5 md:pb-12">
      <Header />

      <div className="relative overflow-hidden rounded-[1.5rem] bg-ink md:rounded-[2rem]">
        {/* Background media */}
        <div className="absolute inset-0">
          <HeroVideo className="h-full w-full object-cover" />
          {/* Scrim: heavy on the left so the headline stays readable over any frame. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink/80 lg:bg-gradient-to-r lg:from-ink/90 lg:via-ink/65 lg:to-ink/25"
          />
        </div>

        {/* Content */}
        <div className="container-x relative pt-32 pb-16 md:pt-36 md:pb-20 lg:pt-48 lg:pb-28">
          <div className="max-w-xl text-cream">
            <p className="eyebrow text-gold">K-Petz Hospital</p>

            <div key={index} className="hero-fade">
              <h1 className="display-xl mt-5 text-white">
                {slide.title[0]} <span className="lg:block">{slide.title[1]}</span>
              </h1>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-cream/85">
                {slide.body}
              </p>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 font-display text-[13px] font-extrabold uppercase tracking-[0.1em]">
              {SERVICES.map((name) => (
                <li key={name} className="flex items-center gap-2">
                  <PawMark className="h-4 w-4 text-gold" />
                  {name}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button onClick={() => openBooking()} className="btn btn-primary">
                Book appointment
              </button>
              <a href="#services" className="btn bg-cream text-ink hover:bg-brand hover:text-white">
                Our services
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous slide"
                  className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white transition hover:bg-cream hover:text-ink"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Next slide"
                  className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white transition hover:bg-cream hover:text-ink"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-8 flex gap-2" role="tablist" aria-label="Choose slide">
              {SLIDES.map((s, i) => (
                <button
                  key={s.title[0]}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-10 bg-brand" : "w-4 bg-cream/30 hover:bg-cream/60"
                  }`}
                />
              ))}
            </div>
          </div>

          
        </div>
      </div>
    </section>
  );
}