import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import Footer from "../components/Footer";

type Props = {
  title: string;
  updated: string;
  children: ReactNode;
};

/**
 * Wrapper for Terms, Privacy, Refunds and Contact. Reuses the site header and
 * footer so the pages read as part of K-Petz rather than bolted-on documents —
 * which also matters for the payment provider's site review.
 */
export default function PolicyPage({ title, updated, children }: Props) {
  // Arriving from a footer link on a scrolled page would otherwise land midway down.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${title} — K-Petz Hospital`;
  }, [title]);

  return (
    <>
      <div className="relative bg-ink pb-16 pt-3 md:pb-20 md:pt-5">
        <Header />
        <div className="container-x relative pt-28 md:pt-32">
          <Link
            to="/"
            className="font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-gold hover:underline"
          >
            &larr; Back to site
          </Link>
          <h1 className="display-lg mt-4 text-white">{title}</h1>
          <p className="mt-3 text-sm font-semibold text-cream/70">Last updated {updated}</p>
        </div>
      </div>

      <main className="section-y bg-cream">
        <article className="container-x max-w-3xl">
          <div className="policy-body">{children}</div>

          <p className="mt-12 rounded-2xl bg-cream-deep p-6 text-[15px] leading-relaxed text-ink-soft">
            Questions about this page? Write to{" "}
            <a href="mailto:kpetzhospital@gmail.com" className="font-semibold text-brand hover:underline">
              kpetzhospital@gmail.com
            </a>{" "}
            or call{" "}
            <a href="tel:+918019888877" className="font-semibold text-brand hover:underline">
              80198 88877
            </a>
            .
          </p>
        </article>
      </main>

      <Footer />
    </>
  );
}
