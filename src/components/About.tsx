import aboutImg from "@/assets/about.jpg";
import walkImg from "@/assets/dog1.png";
import { BadgeStamp, BoneMark, PawMark, PlayButton, Signature } from "./decor/Decor";
import dachshund from "@/assets/dachshund.webp";
import Reveal from "./Reveal";

const STATS = [
  { value: "120+", label: "Essentials" },
  { value: "10+", label: "Qualified trainers" },
  { value: "20k", label: "Grateful clients" },
];

export default function About() {
  return (
    <section id="about" className="section-y relative overflow-hidden bg-cream">
      <PawMark className="pointer-events-none absolute left-[44%] top-8 hidden h-[300px] w-[300px] text-sand/55 lg:block" />
      <BoneMark className="pointer-events-none absolute bottom-8 left-[30%] hidden h-16 w-40 -rotate-6 text-brand/20 lg:block" />

      <div className="container-x relative grid gap-y-12 lg:grid-cols-12 lg:gap-x-10">
        {/* Heading */}
        <Reveal className="lg:col-start-1 lg:col-end-9 lg:row-start-1">
          <p className="eyebrow">Know us</p>
          <h2 className="display-lg mt-5 max-w-[14ch]">
            Making Happy Pet Moments And Accepting Love Every Day
          </h2>
        </Reveal>

        {/* Portrait + copy */}
        <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:col-start-1 lg:col-end-9 lg:row-start-2 lg:mt-4">
          <Reveal className="relative">
            <BadgeStamp className="absolute left-0 top-0 z-10 h-24 w-24 md:h-28 md:w-28" />
            <img
              src={aboutImg}
              alt="Pet parent holding her golden retriever"
              width={1200}
              height={1400}
              loading="lazy"
              className="h-[360px] w-full rounded-[2rem] object-cover sm:h-[440px] lg:h-[480px]"
            />
          </Reveal>

          <Reveal delay={120} className="relative">
            <p className="font-display text-[22px] font-extrabold leading-snug text-brand md:text-[26px]">
              “Treasure pet moments with unending love, joy and gentle handling.”
            </p>
            <p className="lede mt-5">
              Choosing a cat, a dog or a bird is a personal decision — and any of them can become a
              wonderful companion. We help you get the first year right.
            </p>
            <p className="lede mt-4">
              Everything on our shelves is chosen by trainers and vets who use it themselves, from
              grain-gentle food to harnesses that actually fit. If it wouldn't work for our own pets,
              we don't stock it.
            </p>

            <dl className="mt-9 grid grid-cols-3 gap-4">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-[34px] font-black leading-none md:text-[42px]">
                    {stat.value}
                  </dd>
                  <p className="mt-2 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-soft md:text-[11px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>

            <div className="mt-10">
              <Signature name="krishna" className="ml-1" />
              <p className="mt-3 font-display text-[15px] font-extrabold">
                krishna <span className="font-bold text-brand">(Co-founder)</span>
              </p>
            </div>
          </Reveal>
        </div>

        {/* Tall image */}
        <Reveal
          delay={200}
          className="relative lg:col-start-9 lg:col-end-13 lg:row-start-1 lg:row-end-3"
        >
          <img
            src={walkImg}
            alt="A spaniel and a border collie sitting together in the grass"
            width={900}
            height={700}
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
