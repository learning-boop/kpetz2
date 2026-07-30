import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import BookingForm from "./BookingForm";

type BookingContextValue = {
  /** Opens the appointment dialog, optionally preselecting a service and doctor. */
  openBooking: (service?: string, doctor?: string) => void;
  closeBooking: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [service, setService] = useState<string | undefined>();
  const [doctor, setDoctor] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  // Bumped on every open so the form remounts with fresh state — otherwise the
  // service passed in from a card is ignored, because the initial state was
  // already fixed when the dialog first rendered.
  const [openId, setOpenId] = useState(0);

  const openBooking = useCallback((preselect?: string, preselectDoctor?: string) => {
    setSent(false);
    setService(preselect);
    setDoctor(preselectDoctor);
    setOpenId((n) => n + 1);
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
  }, []);

  const closeBooking = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // The dialog is what scrolls while it's open, not the page behind it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const lock = () => document.body.classList.add("no-scroll");
    const unlock = () => document.body.classList.remove("no-scroll");
    const observer = new MutationObserver(() => (dialog.open ? lock() : unlock()));
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    return () => {
      observer.disconnect();
      unlock();
    };
  }, []);

  return (
    <BookingContext.Provider value={{ openBooking, closeBooking }}>
      {children}

      <dialog
        ref={dialogRef}
        className="booking-dialog"
        aria-label="Book an appointment"
        onClose={() => document.body.classList.remove("no-scroll")}
        // Clicking the backdrop lands on the dialog itself, never on its contents.
        onClick={(e) => {
          if (e.target === dialogRef.current) closeBooking();
        }}
      >
        <div className="relative max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[1.75rem]">
          <button
            type="button"
            onClick={closeBooking}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-ink/15 text-white transition hover:bg-ink"
          >
            <X className="h-5 w-5" />
          </button>

          {sent ? (
            <div className="rounded-[1.75rem] bg-brand p-8 text-center text-white sm:p-10">
              <h2 className="display-md">Request received</h2>
              <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-white/85">
                We'll call you back within one working day to confirm a time. Nothing is booked
                until we've spoken.
              </p>
              <button onClick={closeBooking} className="btn btn-ink mt-8">
                Close
              </button>
            </div>
          ) : (
            <BookingForm
              key={openId}
              service={service}
              doctor={doctor}
              onSuccess={() => setSent(true)}
            />
          )}
        </div>
      </dialog>
    </BookingContext.Provider>
  );
}