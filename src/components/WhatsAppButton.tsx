import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { CalendarCheck, MapPin, MessageCircle, Phone, X } from "lucide-react";
import { useBooking } from "./BookingProvider";

const WHATSAPP_NUMBER = "918019888877"; // country code, no + or spaces
const PHONE_DISPLAY = "80198 88877";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=K-Petz+Hospital+Poranki+Vijayawada";

/**
 * What the customer is looking at when they tap, so the WhatsApp message
 * arrives with context instead of a bare "hi". Staff can answer straight away
 * rather than asking what it's about.
 */
const CONTEXT: Record<string, string> = {
  "/vet-home-visit": "a home visit",
  "/pet-vaccination-at-home": "vaccination at home",
  "/pet-home-treatment": "home treatment",
  "/online-vet-consultation": "an online consultation",
  "/vet-second-opinion": "a second opinion",
};

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const { openBooking } = useBooking();

  const subject = CONTEXT[pathname];
  const message = subject
    ? `Hi K-Petz Hospital, I'd like to ask about ${subject} for my pet.`
    : "Hi K-Petz Hospital, I'd like to ask about an appointment for my pet.";

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  // Close on outside click and on Escape, so the panel never traps the page.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[15px] font-semibold text-ink transition hover:bg-cream-deep";

  return (
    <div ref={panelRef} className="fixed bottom-5 right-4 z-40 print:hidden sm:bottom-6 sm:right-6">
      {open && (
        <div
          id="contact-panel"
          className="mb-3 w-[17rem] origin-bottom-right overflow-hidden rounded-2xl bg-cream shadow-[0_24px_60px_-20px_rgba(36,28,58,0.55)] ring-1 ring-black/5"
        >
          <div className="bg-ink px-4 py-3">
            <p className="font-display text-[15px] font-extrabold text-white">K-Petz Hospital</p>
            <p className="mt-0.5 text-[12px] font-semibold text-cream/70">
              We love, care, treat your pets
            </p>
          </div>

          <div className="grid p-2">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={item}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#25D366]">
                <MessageCircle className="h-4.5 w-4.5 text-white" aria-hidden="true" />
              </span>
              <span>
                Chat on WhatsApp
                <span className="block text-[12px] font-semibold text-ink-soft">
                  Usually the quickest
                </span>
              </span>
            </a>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openBooking();
              }}
              className={item}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand">
                <CalendarCheck className="h-4.5 w-4.5 text-white" aria-hidden="true" />
              </span>
              <span>
                Book an appointment
                <span className="block text-[12px] font-semibold text-ink-soft">
                  Choose a doctor and time
                </span>
              </span>
            </button>

            <a href={`tel:+${WHATSAPP_NUMBER}`} className={item}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink">
                <Phone className="h-4.5 w-4.5 text-white" aria-hidden="true" />
              </span>
              <span>
                Call the clinic
                <span className="block text-[12px] font-semibold text-ink-soft">
                  {PHONE_DISPLAY}
                </span>
              </span>
            </a>

            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={item}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold">
                <MapPin className="h-4.5 w-4.5 text-ink" aria-hidden="true" />
              </span>
              <span>
                Get directions
                <span className="block text-[12px] font-semibold text-ink-soft">
                  Poranki, Vijayawada
                </span>
              </span>
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="contact-panel"
        aria-label={open ? "Close contact options" : "Contact K-Petz Hospital"}
        className={`ml-auto flex h-14 w-14 items-center justify-center rounded-full shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] transition active:scale-95 ${
          open ? "bg-ink" : "bg-[#25D366] hover:brightness-105"
        }`}
      >
        {open ? (
          <X className="h-6 w-6 text-white" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-7 w-7 text-white" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
