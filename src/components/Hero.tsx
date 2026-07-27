import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Header } from "./Header";
import BookingForm from "./BookingForm";
import { PawMark } from "./decor/Decor";
import { useBooking } from "./BookingProvider";
import HeroVideo from "./HeroVideo";

type Slide = {
  eyebrow: string;
  title: [string, string];
  body: string;
  tags: string[];
  cta: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Greetings from Kpetz",
    title: ["Making Every Family's", "Pet Dreams Come True"],
    body: "Premium nutrition, gentle grooming and trainers who know your dog by name — all under one roof in Vijayawada.",
    tags: ["Active Paws", "Pet Coaching", "Comfy Crates"],
    cta: "Shop for dogs",
  },
  {
    eyebrow: "Greetings from Kpetz",
    title: ["Bringing Your Cat's", "Dream Life To Reality"],
    body: "Hand-picked litter, protein-rich food and a grooming room built to keep even the shyest cat calm.",
    tags: ["Bird Practice", "Adoption Journey", "Pet Supplies"],
    cta: "Shop for cats",
  },
  {
    eyebrow: "Greetings from Kpetz",
    title: ["Elegant Pets Creating", "Joyful Bonds Daily"],
    body: "Cages, perches and enrichment designed with avian vets, so your feathered friend has room to be a bird.",
    tags: ["Puppy Kennel", "Pet Doctors", "Pet Grooming"],
    cta: "Shop for birds",
  },
];

const SLIDE_HOLD = 7000;

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
          <div key={index} className="max-w-xl text-cream">
            <p className="eyebrow">{slide.eyebrow}</p>
            <h1 className="display-xl mt-5 text-white">
              {slide.title[0]} <span className="lg:block">{slide.title[1]}</span>
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-cream/80">{slide.body}</p>

            <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-3 font-display text-[13px] font-extrabold uppercase tracking-[0.1em]">
              {slide.tags.map((tag) => (
                <li key={tag} className="flex items-center gap-2">
                  <PawMark className="h-4 w-4 text-brand" />
                  {tag}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button onClick={() => openBooking()} className="btn btn-primary">
                Book a visit
              </button>
              <a href="#shop" className="btn bg-cream text-ink hover:bg-brand hover:text-white">
                {slide.cta}
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
                  key={s.cta}
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
