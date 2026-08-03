import { ArrowRight } from "lucide-react";
import { Header } from "./Header";
import { useBooking } from "./BookingProvider";
import HeroVideo from "./HeroVideo";

/**
 * Content set by the client's brief. Static on purpose — there is no carousel
 * here, so nothing moves while someone is reading it.
 */
/** `service` must match an option in BookingForm's SERVICES list. */
const ONLINE_SERVICES = [
  { label: "Home deworming and vaccination", service: "Home deworming and vaccination" },
  { label: "Online consultancy for first aid", service: "Online consultancy (first aid)" },
  { label: "Second opinion", service: "Second opinion" },
];

export default function Hero() {
  const { openBooking } = useBooking();

  return (
    <section id="home" className="relative px-3 pb-8 md:px-5 md:pb-12">
      <Header />

      <div className="relative overflow-hidden rounded-[1.5rem] bg-black md:rounded-[2rem]">
        {/* Background media */}
        <div className="absolute inset-0">
          <HeroVideo className="h-full w-full object-cover" />
          {/* Scrim: heavy on the left so the headline stays readable over any frame. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/80 lg:bg-gradient-to-r lg:from-black/85 lg:via-black/60 lg:to-black/20"
          />
        </div>

        {/* Content */}
        <div className="container-x relative pt-32 pb-16 md:pt-36 md:pb-20 lg:pt-48 lg:pb-28">
          <div className="max-w-2xl text-cream">
            <p className="eyebrow text-gold">K-Petz Hospital</p>

            <h1 className="display-xl mt-5 text-white">
              Online <span className="lg:block">Services</span>
            </h1>

            <p className="mt-6 font-display text-[20px] font-extrabold leading-snug text-gold md:text-[24px]">
              We love, care, treat your pets
            </p>

            <ol className="mt-9 grid gap-2">
              {ONLINE_SERVICES.map(({ label, service }, i) => (
                <li key={service}>
                  <button
                    onClick={() => openBooking(service)}
                    className="group flex w-full items-center gap-4 rounded-2xl py-2 pr-3 text-left transition hover:bg-white/10"
                  >
                    <span
                      aria-hidden="true"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand font-display text-[15px] font-black text-white transition group-hover:bg-gold group-hover:text-ink"
                    >
                      {i + 1}
                    </span>
                    <span className="font-display text-[17px] font-extrabold leading-tight text-white md:text-[19px]">
                      {label}
                    </span>
                    <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-gold opacity-0 transition group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button onClick={() => openBooking()} className="btn btn-primary">
                Book appointment
              </button>
              <a href="#services" className="btn bg-cream text-ink hover:bg-brand hover:text-white">
                Our services
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}