import banner2400 from "@/assets/offer-banner-2400.webp";
import banner1600 from "@/assets/offer-banner-1600.webp";
import banner900 from "@/assets/offer-banner-900.webp";
import Reveal from "./Reveal";

/**
 * The offer is a supplied artwork rather than laid-out markup, so the copy is
 * baked into the image. The heading below is real text for search engines and
 * screen readers, and the whole banner is one link — the buttons drawn inside
 * the artwork aren't separately clickable.
 */
export default function Offer() {
  return (
    <section aria-labelledby="offer-heading" className="px-3 py-10 md:px-5 md:py-14">
      <Reveal>
        <h2 id="offer-heading" className="sr-only">
          Nutritious wet food: extra 3% off orders over ₹2,499
        </h2>

        <a
          href="#shop"
          className="group block overflow-hidden rounded-[1.5rem] transition duration-300 hover:brightness-[1.03] md:rounded-[2rem]"
        >
          <img
            src={banner2400}
            srcSet={`${banner900} 900w, ${banner1600} 1600w, ${banner2400} 2400w`}
            sizes="(min-width: 1920px) 1880px, 100vw"
            alt="Nutritious wet food offer: an extra 3% off orders over ₹2,499. Shop the collection."
            width={2400}
            height={816}
            loading="lazy"
            decoding="async"
            className="w-full"
          />
        </a>
      </Reveal>
    </section>
  );
}
