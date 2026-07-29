import { Header } from "./Header";
import { useBooking } from "./BookingProvider";
import HeroVideo from "./HeroVideo";

/**
 * Content set by the client's brief. Static on purpose — there is no carousel
 * here, so nothing moves while someone is reading it.
 */
const ONLINE_SERVICES = [
  "Home deworming and vaccination",
  "Online consultancy for first aid",
  "Second opinion",
];

export default function Hero() {
  const { openBooking } = useBooking();

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
            className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/65 to-ink/85 lg:bg-gradient-to-r lg:from-ink/90 lg:via-ink/70 lg:to-ink/30"
          />
        </div>

        {/* Content */}
        <div className="container-x relative pt-32 pb-16 md:pt-36 md:pb-20 lg:pt-48 lg:pb-28">
          <div className="max-w-2xl text-cream">
            <p className="eyebrow text-white">K-Petz Hospital</p>

            <h1 className="display-xl mt-5 text-gold">
             We love, care <span className="lg:block"> treat your pets</span>
            </h1>

            {/* <p className="mt-6 font-display text-[20px] font-extrabold leading-snug text-gold md:text-[24px]">
              We love, care, treat your pets
            </p> */}

            <ol className="mt-9 grid gap-4">
              {ONLINE_SERVICES.map((service, i) => (
                <li key={service} className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand font-display text-[15px] font-black text-white"
                  >
                    {i + 1}
                  </span>
                  <span className="font-display text-[17px] font-extrabold leading-tight text-white md:text-[19px]">
                    {service}
                  </span>
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