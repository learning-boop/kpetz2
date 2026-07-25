import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import petDog from "@/assets/hero-dog.jpg";
import petBoarding from "@/assets/service-boarding.jpg";
import petCat from "@/assets/hero-cat.jpg";
import petBird from "@/assets/hero-bird.jpg";
import petPuppy from "@/assets/service-adoption.jpg";
import petTraining from "@/assets/service-training.jpg";
import Reveal from "./Reveal";

const REVIEWS = [
  {
    quote:
      "Our rescue was terrified of strangers. Six weeks with the coaching team and she now greets the postman. Worth every rupee.",
    name: "Anjali Reddy",
    role: "Beagle mum, Benz Circle",
    photo: petDog,
  },
  {
    quote:
      "The boarding photos twice a day meant I actually enjoyed my holiday. He came home tired and happy, not stressed.",
    name: "Vikram Nair",
    role: "Labrador dad, Gunadala",
    photo: petBoarding,
  },
  {
    quote:
      "They talked me out of a more expensive food and explained exactly why. That's when I knew I'd keep coming back.",
    name: "Sneha Patel",
    role: "Persian cat parent, Patamata",
    photo: petCat,
  },
  {
    quote:
      "Nobody else in the city would look at a budgie. They knew exactly what her feathers needed and she's twice as chirpy.",
    name: "Ravi Teja",
    role: "Budgie keeper, Governorpet",
    photo: petBird,
  },
  {
    quote:
      "We adopted through them and they still check in six months later. It never felt like a transaction.",
    name: "Meera Krishnan",
    role: "Adopted Simba, Bhavanipuram",
    photo: petPuppy,
  },
  {
    quote:
      "The trainer met our puppy before the first session and remembered every detail. Small thing, big difference.",
    name: "Arjun Varma",
    role: "Indie dog dad, Auto Nagar",
    photo: petTraining,
  },
];

const ADVANCE_MS = 4500;

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const scrollTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const next = (i + REVIEWS.length) % REVIEWS.length;
      const card = track.children[next] as HTMLElement | undefined;
      if (!card) return;
      track.scrollTo({ left: card.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [reduceMotion]
  );

  // Keep the dots in step with wherever the track actually is, so dragging,
  // swiping and the arrows all report the same position.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maxScroll = track.scrollWidth - track.clientWidth;
        // The trailing cards can never reach the left edge, so the raw "nearest
        // card" reading stalls a few short of the end. Treat hitting the limit
        // as being on the last review, otherwise autoplay never wraps.
        if (maxScroll - track.scrollLeft < 2) {
          setIndex(REVIEWS.length - 1);
          return;
        }
        const cards = Array.from(track.children) as HTMLElement[];
        const nearest = cards.reduce(
          (best, card, i) =>
            Math.abs(card.offsetLeft - track.scrollLeft) < best.d
              ? { i, d: Math.abs(card.offsetLeft - track.scrollLeft) }
              : best,
          { i: 0, d: Infinity }
        );
        setIndex(nearest.i);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const t = setTimeout(() => scrollTo(index + 1), ADVANCE_MS);
    return () => clearTimeout(t);
  }, [index, paused, reduceMotion, scrollTo]);

  return (
    <section id="reviews" className="section-y bg-cream-deep">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow">Kind words</p>
            <h2 className="display-lg mt-5">Loved By Local Pet Parents</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollTo(index - 1)}
              aria-label="Previous review"
              className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink/15 transition hover:border-brand hover:bg-brand hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollTo(index + 1)}
              aria-label="Next review"
              className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink/15 transition hover:border-brand hover:bg-brand hover:text-white"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </Reveal>

        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Customer reviews"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            className="hide-scrollbar mt-12 grid snap-x snap-mandatory auto-cols-[86%] grid-flow-col gap-6 overflow-x-auto pb-3 sm:auto-cols-[48%] lg:auto-cols-[31.6%]"
          >
            {REVIEWS.map((review, i) => (
              <figure
                key={review.name}
                aria-roledescription="slide"
                aria-label={`Review ${i + 1} of ${REVIEWS.length}`}
                className="snap-start rounded-[1.75rem] bg-white p-8 shadow-[0_20px_50px_-40px_rgba(42,39,36,0.7)]"
              >
                <Quote className="h-8 w-8 text-brand" aria-hidden="true" />
                <blockquote className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                  {review.quote}
                </blockquote>
                <div
                  className="mt-5 flex items-center gap-0.5 text-brand"
                  aria-label="Rated 5 out of 5"
                >
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <figcaption className="mt-6 flex items-center gap-4 border-t border-line pt-6">
                  <img
                    src={review.photo}
                    alt=""
                    width={112}
                    height={112}
                    loading="lazy"
                    className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-brand/30 ring-offset-2 ring-offset-white"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-base font-extrabold">{review.name}</p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-ink-soft">
                      {review.role}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {REVIEWS.map((review, i) => (
              <button
                key={review.name}
                onClick={() => scrollTo(i)}
                aria-label={`Go to review ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-10 bg-brand" : "w-4 bg-ink/20 hover:bg-ink/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
