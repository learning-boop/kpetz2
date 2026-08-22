import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Smartphone } from "lucide-react";

/**
 * The clinic's UPI details, from the ICICI eazypay QR at the counter.
 * `pn` must match what the bank has registered, or some apps warn the payer.
 */
const VPA = "7893502583.eazypay@icici";
const PAYEE = "KPETZ THE COMPLETE PET STORE";

type Props = {
  amountRupees: number;
  reference: string;
  utr: string;
  onUtrChange: (value: string) => void;
};

export default function UpiPayment({ amountRupees, reference, utr, onUtrChange }: Props) {
  const [copied, setCopied] = useState<"vpa" | "amount" | null>(null);

  /**
   * A UPI deep link with the amount already filled in. Scanning this opens the
   * payer's app with everything set, so they can't mistype the amount — which
   * is the main advantage over the static sticker at the counter.
   */
  const upiLink = useMemo(() => {
    const q = new URLSearchParams({
      pa: VPA,
      pn: PAYEE,
      am: amountRupees.toFixed(2),
      cu: "INR",
      tn: `K-Petz booking ${reference}`,
    });
    return `upi://pay?${q.toString()}`;
  }, [amountRupees, reference]);

  const copy = (text: string, what: "vpa" | "amount") => {
    navigator.clipboard?.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl bg-white p-6 text-center">
        <p className="font-display text-[13px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
          Scan to pay
        </p>
        <p className="mt-1 font-display text-[34px] font-black leading-none text-ink">
          ₹{amountRupees}
        </p>

        <div className="mx-auto mt-5 w-fit rounded-xl border border-line p-3">
          <QRCodeSVG value={upiLink} size={190} level="M" fgColor="#241c3a" bgColor="#ffffff" />
        </div>

        <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
          Open any UPI app — GPay, PhonePe, Paytm, BHIM — and scan. The amount is
          already filled in.
        </p>

        {/* On a phone the QR is useless — you can't scan your own screen. This
            opens the UPI app directly instead. */}
        <a
          href={upiLink}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-display text-[13px] font-extrabold uppercase tracking-[0.1em] text-white sm:hidden"
        >
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          Pay from this phone
        </a>

        <div className="mt-5 grid gap-2 border-t border-line pt-5 text-left">
          {[
            { label: "UPI ID", value: VPA, key: "vpa" as const },
            { label: "Amount", value: `${amountRupees}`, key: "amount" as const },
          ].map(({ label, value, key }) => (
            <button
              key={key}
              type="button"
              onClick={() => copy(value, key)}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-cream-deep"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                {label}
              </span>
              <span className="flex items-center gap-2 break-all text-[14px] font-semibold text-ink">
                {value}
                {copied === key ? (
                  <Check className="h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 shrink-0 text-ink-soft" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-white">
          UPI reference number (UTR)
        </span>
        <input
          value={utr}
          onChange={(e) => onUtrChange(e.target.value.trim())}
          inputMode="numeric"
          placeholder="12-digit number from your payment"
          className="field"
        />
        <span className="mt-1.5 block text-xs font-semibold text-white/80">
          After paying, your UPI app shows a reference or UTR number. Enter it here
          so we can match your payment. Leave blank if you'd rather pay at the clinic.
        </span>
      </label>
    </div>
  );
}
