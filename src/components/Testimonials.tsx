import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Quote, Star } from "lucide-react";
import Reveal from "./Reveal";

const SOURCE = {
  score: "4.8",
  count: 268,
  name: "Justdial",
  url: "https://www.justdial.com/Vijayawada/K-Petz-Hospital-Behind-Street-Of-Saibaba-Temple-Srinivas-Nagar-Poranki/0866PX866-X866-210419141330-V2L3_BZDET/reviews",
};

/**
 * Real reviews left by customers on Justdial, reproduced with the reviewer's
 * name and a link back to the source. Dates omitted at the client's request.
 * Only clear spelling slips have been corrected — see the note in the handover.
 */
const REVIEWS = [
  {
    name: "Ch V Prasad",
    quote:
      "Our dog Tommy was diagnosed with Parvovirus, and we were extremely worried. The doctors and staff at K-Petz Hospital gave him excellent treatment with great care, patience, and dedication. Because of their timely diagnosis and proper treatment, Tommy has now completely recovered.",
  },
  {
    name: "Sunitha",
    quote:
      "I had a mixed Pomeranian dog operated for birth control. Dr Radhika ma'am did a great job and took good care of the dog. I would recommend K-Petz to anyone who wants good medical care for their dog and good medical advice.",
  },
  {
    name: "Anupama",
    quote:
      "Here we found not only treatment, love and personal attachment with my buddy. Excellent treatment, doctors are highly experienced and very friendly to us and pet as well. 100% recommending who need pet hospital.",
  },
  {
    name: "Anoop",
    quote:
      "Doctors were so cool in explaining and managing my pet's health condition. Definitely a one stop solution for all your pet's care.",
  },
  {
    name: "Adusumilli Teja",
    quote: "Best pet clinic with talented doctors and equipment.",
  },
];

const ADVANCE_MS = 6000;

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
      const card = track.children[(i + REVIEWS.length) % REVIEWS.length] as HTMLElement | undefined;
      if (card) track.scrollTo({ left: card.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [reduceMotion]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (track.scrollWidth - track.clientWidth - track.scrollLeft < 2) {
          setIndex(REVIEWS.length - 1);
          return;
        }
        const cards = Array.from(track.children) as HTMLElement[];
        setIndex(
          cards.reduce(
            (best, c, i) =>
              Math.abs(c.offsetLeft - track.scrollLeft) < best.d
                ? { i, d: Math.abs(c.offsetLeft - track.scrollLeft) }
                : best,
            { i: 0, d: Infinity }
          ).i
        );
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
            <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-semibold text-ink-soft">
              <span className="flex gap-0.5 text-gold" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </span>
              <span>
                <strong className="text-ink">{SOURCE.score}</strong> from {SOURCE.count} ratings on{" "}
                {SOURCE.name}
              </span>
            </p>
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
                className="flex snap-start flex-col rounded-[1.75rem] bg-white p-8 shadow-[0_20px_50px_-40px_rgba(36,28,58,0.7)]"
              >
                <Quote className="h-8 w-8 shrink-0 text-brand" aria-hidden="true" />
                <blockquote className="mt-4 grow text-[15px] leading-relaxed text-ink-soft">
                  {review.quote}
                </blockquote>
                <div className="mt-5 flex items-center gap-0.5 text-gold" aria-label="Rated 5 out of 5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <figcaption className="mt-6 flex items-center gap-4 border-t border-line pt-6">
                  {/* An initial, not a photo — we have no likeness rights to these people. */}
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand font-display text-lg font-black text-white"
                  >
                    {review.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-base font-extrabold">{review.name}</p>
                    <p className="mt-0.5 text-sm font-semibold text-ink-soft">
                      Verified on {SOURCE.name}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <div className="flex gap-2">
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
            <a
              href={SOURCE.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-display text-xs font-extrabold uppercase tracking-[0.14em] transition hover:text-brand"
            >
              Read all on {SOURCE.name}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}