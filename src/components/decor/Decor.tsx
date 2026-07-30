/**
 * Original decorative illustrations drawn as inline SVG.
 * Each accepts a className so placement stays with the consuming section.
 */

export function PawMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className} fill="currentColor">
      <ellipse cx="34" cy="34" rx="15" ry="19" transform="rotate(-22 34 34)" />
      <ellipse cx="62" cy="24" rx="14" ry="19" transform="rotate(-6 62 24)" />
      <ellipse cx="89" cy="34" rx="14" ry="18" transform="rotate(20 89 34)" />
      <ellipse cx="106" cy="61" rx="12" ry="15" transform="rotate(38 106 61)" />
      <path d="M62 52c19 0 34 13 34 29 0 15-13 24-34 24s-34-9-34-24c0-16 15-29 34-29Z" />
    </svg>
  );
}

export function BoneMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 90"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
    >
      <path d="M46 26a20 20 0 1 0-14 22 20 20 0 1 0 27 15l68-24a20 20 0 1 0 14-22 20 20 0 1 0-27-15L46 26Z" />
    </svg>
  );
}

/** Repeating paw wallpaper for large coloured panels. Colour comes from `currentColor`. */
export function PawField({ className = "" }: { className?: string }) {
  const paw = (
    <>
      <ellipse cx="34" cy="34" rx="15" ry="19" transform="rotate(-22 34 34)" />
      <ellipse cx="62" cy="24" rx="14" ry="19" transform="rotate(-6 62 24)" />
      <ellipse cx="89" cy="34" rx="14" ry="18" transform="rotate(20 89 34)" />
      <ellipse cx="106" cy="61" rx="12" ry="15" transform="rotate(38 106 61)" />
      <path d="M62 52c19 0 34 13 34 29 0 15-13 24-34 24s-34-9-34-24c0-16 15-29 34-29Z" />
    </>
  );

  return (
    <svg className={className} aria-hidden="true">
      <defs>
        <pattern id="kpetz-paw-field" width="172" height="172" patternUnits="userSpaceOnUse">
          <g fill="currentColor">
            <g transform="translate(6 12) scale(0.46) rotate(-14 60 60)">{paw}</g>
            <g transform="translate(98 100) scale(0.36) rotate(24 60 60)">{paw}</g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kpetz-paw-field)" />
    </svg>
  );
}

/** Four-point star used beside the bone on the services panel. */
export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0c.6 6.2 5.2 10.8 12 12-6.8 1.2-11.4 5.8-12 12-.6-6.2-5.2-10.8-12-12C6.8 10.8 11.4 6.2 12 0Z" />
    </svg>
  );
}

/** Rotating certification stamp. Text rides a circular path, paw sits in the middle. */
export function BadgeStamp({
  className = "",
  label = "K-PETZ HOSPITAL • VIJAYAWADA • ",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={`cut-ring grid place-items-center rounded-full bg-white ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="spin-slow h-full w-full [grid-area:1/1]"
        aria-hidden="true"
      >
        <defs>
          <path
            id="stamp-arc"
            d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"
            fill="none"
          />
        </defs>
        <text
          fontFamily="Chivo, sans-serif"
          fontSize="10.5"
          fontWeight="800"
          letterSpacing="3.5"
          fill="var(--ink)"
        >
          <textPath href="#stamp-arc" startOffset="0">
            {label}
          </textPath>
        </text>
      </svg>
      <span className="grid h-[46%] w-[46%] place-items-center rounded-full bg-ink [grid-area:1/1]">
        <PawMark className="h-1/2 w-1/2 text-cream" />
      </span>
    </div>
  );
}

export function PlayButton({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Play our shelter story"
      className={`cut-ring grid h-20 w-20 place-items-center rounded-full bg-brand text-white transition hover:bg-ink md:h-24 md:w-24 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 translate-x-[2px]" fill="currentColor">
        <path d="M8 5.5v13l11-6.5-11-6.5Z" />
      </svg>
    </button>
  );
}

export function Signature({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block font-script text-5xl leading-none text-ink ${className}`}
      style={{ transform: "rotate(-6deg)" }}
    >
      {name}
    </span>
  );
}