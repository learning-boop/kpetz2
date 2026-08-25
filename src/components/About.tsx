import walkImg from "@/assets/dog1.png";
import dachshund from "@/assets/dachshund.webp";
import { BadgeStamp, BoneMark, PawMark, PlayButton, Signature } from "./decor/Decor";
import Reveal from "./Reveal";
import { useContent } from "../data/content";

/**
 * Every figure here is verifiable: the rating and review count come from the
 * clinic's Justdial listing, and the two locations are the Poranki hospital and
 * the Gunadala branch opposite APGenco.
 */



export default function About() {
  // Heading, quote, text and the portrait come from the admin's Content
  // page, with the built-in copy until the API answers.
  const { about } = useContent();
  const paragraphs = about.body.split(/\n\s*\n/).filter((p) => p.trim() !== "");

  return (
    <section id="about" className="section-y relative overflow-hidden bg-cream">
      <PawMark className="pointer-events-none absolute left-[44%] top-8 hidden h-[300px] w-[300px] text-sand/55 lg:block" />
      <BoneMark className="pointer-events-none absolute bottom-8 left-[30%] hidden h-16 w-40 -rotate-6 text-brand/20 lg:block" />

      <div className="container-x relative grid gap-y-12 lg:grid-cols-12 lg:gap-x-10">
        {/* Heading */}
        <Reveal className="lg:col-start-1 lg:col-end-9 lg:row-start-1">
          <p className="eyebrow">Know us</p>
          <h2 className="display-lg mt-5 max-w-[15ch]">{about.heading}</h2>
        </Reveal>

        {/* Portrait + copy */}
        <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:col-start-1 lg:col-end-9 lg:row-start-2 lg:mt-4">
          <Reveal className="relative">
            <BadgeStamp className="absolute left-0 top-0 z-10 h-24 w-24 md:h-28 md:w-28" />
            <img
              src={about.img}
              alt="A pet owner holding her dog"
              width={1200}
              height={1400}
              loading="lazy"
              className="h-[360px] w-full rounded-[2rem] object-cover sm:h-[440px] lg:h-[480px]"
            />
          </Reveal>

          <Reveal delay={120} className="relative">
            {about.quote && (
              <p className="font-display text-[22px] font-extrabold leading-snug text-brand md:text-[26px]">
                {about.quote}
              </p>
            )}
            {paragraphs.map((paragraph, i) => (
              <p key={i} className={i === 0 && !about.quote ? "lede" : i === 0 ? "lede mt-5" : "lede mt-4"}>
                {paragraph}
              </p>
            ))}

            

            {/* <div className="mt-10">
              <Signature name="krishna" className="ml-1" />
              <p className="mt-3 font-display text-[15px] font-extrabold">
                Krishna <span className="font-bold text-brand">(Founder)</span>
              </p>
            </div> */}
          </Reveal>
        </div>

        {/* Tall image */}
        <Reveal
          delay={200}
          className="relative lg:col-start-9 lg:col-end-13 lg:row-start-1 lg:row-end-3"
        >
          <img
            src={walkImg}
            alt="A dog cared for at K-Petz Hospital"
            width={1122}
            height={1402}
            loading="lazy"
            className="h-[380px] w-full rounded-[2rem] object-cover sm:h-[480px] lg:h-full lg:min-h-[640px]"
          />
          <span className="notch-tl hidden lg:block" aria-hidden="true" />
          <img
            src={dachshund}
            alt=""
            width={215}
            height={130}
            className="absolute -left-16 -top-5 z-20 hidden w-44 lg:block"
          />
          <PlayButton className="absolute bottom-2 right-2 z-20" />
        </Reveal>
      </div>
    </section>
  );
}