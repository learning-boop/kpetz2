import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, MapPin, Phone } from "lucide-react";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { useBooking } from "../components/BookingProvider";

type Props = {
  /** Browser tab and search-result title. Keep under ~60 characters. */
  seoTitle: string;
  /** Search-result snippet. Keep under ~155 characters. */
  seoDescription: string;
  path: string;
  eyebrow: string;
  heading: string;
  intro: string;
  /** Preselects the booking form. Must match an option in BookingForm's SERVICES. */
  bookingService: string;
  points: string[];
  children?: ReactNode;
};

export default function ServicePage({
  seoTitle,
  seoDescription,
  path,
  eyebrow,
  heading,
  intro,
  bookingService,
  points,
  children,
}: Props) {
  const { openBooking } = useBooking();

  /**
   * Arriving from a link on a scrolled page would otherwise land midway down.
   *
   * Braces matter here. Written as `() => window.scrollTo(0, 0)` the arrow
   * returns whatever scrollTo returns, and React tries to call that as the
   * cleanup function — which is what makes the page render and then vanish.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} path={path} />

      <div className="relative bg-ink pb-16 pt-3 md:pb-20 md:pt-5">
        <Header />
        <div className="container-x relative pt-28 md:pt-32">
          <Link
            to="/"
            className="font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-gold hover:underline"
          >
            &larr; K-Petz Hospital
          </Link>
          <p className="eyebrow mt-6 text-gold">{eyebrow}</p>
          <h1 className="display-lg mt-4 max-w-[20ch] text-white">{heading}</h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-cream/80">{intro}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button onClick={() => openBooking(bookingService)} className="btn btn-primary">
              Book this service
            </button>
            <a
              href="tel:+918019888877"
              className="btn bg-cream text-ink hover:bg-brand hover:text-white"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              80198 88877
            </a>
          </div>
        </div>
      </div>

      <main className="section-y bg-cream">
        <div className="container-x max-w-3xl">
          <ul className="grid gap-4">
            {points.map((point) => (
              <li key={point} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand"
                >
                  <Check className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="text-[16px] leading-relaxed text-ink-soft">{point}</span>
              </li>
            ))}
          </ul>

          {children}

          <div className="mt-12 rounded-2xl bg-cream-deep p-7">
            <p className="font-display text-[19px] font-extrabold text-ink">
              K-Petz Hospital, Poranki
            </p>
            <p className="mt-2 flex items-start gap-2 text-[15px] leading-relaxed text-ink-soft">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              Behind the street of Saibaba Temple, Srinivasa Nagar, Poranki, Vijayawada
            </p>
            <p className="mt-4 text-[15px] text-ink-soft">
              Call{" "}
              <a href="tel:+918019888877" className="font-semibold text-brand hover:underline">
                80198 88877
              </a>{" "}
              or{" "}
              <a href="tel:+918185048877" className="font-semibold text-brand hover:underline">
                81850 48877
              </a>
              . Two M.V.Sc qualified veterinarians, with X-ray, ultrasound scanning, an operating
              theatre and an in-house laboratory on site.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}