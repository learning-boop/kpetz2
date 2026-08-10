import { useCallback, useEffect, useRef, useState } from "react";

const POSTER = "/media/kpetz-hero-poster.jpg";
const DESCRIPTION = "A golden retriever being cared for at K-Petz Hospital";

/**
 * Three encodes of the same clip. The source is 3840px, but measurably soft —
 * 99.7% of its detail survives a round-trip through 1920px, and behind the
 * hero's dark scrim even the 720px tier is within 0.3 of the 4K original on a
 * 2x display. So the ladder tops out at 1920 and saves everyone the download.
 */
const TIERS = [
  { maxWidth: 1024, src: "/media/kpetz-hero-720.mp4" },   // 306 KB
  { maxWidth: 1600, src: "/media/kpetz-hero-1280.mp4" },  // 975 KB
  { maxWidth: Infinity, src: "/media/kpetz-hero-1920.mp4" }, // 2.3 MB
];

const pickSrc = () => {
  if (typeof window === "undefined") return TIERS[0].src;
  // Account for retina: a 1280px logical width paints 2560 device pixels.
  const effective = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  return (TIERS.find((t) => effective <= t.maxWidth * 1.5) ?? TIERS[TIERS.length - 1]).src;
};

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Props = { className?: string };

export default function HeroVideo({ className = "" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Read synchronously — starting on the wrong tier would download twice.
  const [src, setSrc] = useState(pickSrc);
  const [reduceMotion, setReduceMotion] = useState(prefersReduced);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduceMotion(motion.matches);
      setSrc(pickSrc());
    };
    motion.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      motion.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  /**
   * React sets `muted` as a property, and not always before the browser decides
   * whether autoplay is allowed — which is why muted autoplay can fail in React
   * but work in plain HTML. The ref callback guarantees it lands immediately.
   */
  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node) {
      node.muted = true;
      node.defaultMuted = true;
    }
  }, []);

  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused === false) return;
    video.muted = true;
    // A rejection just means the OS refused for now — Low Power Mode, Low Data
    // Mode, or no user gesture yet. The listeners below will retry.
    video.play()?.catch(() => {});
  }, []);

  /** Play only while the hero is on screen; mobile Safari suspends it anyway. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? attemptPlay() : video.pause()),
      { threshold: 0.15 }
    );
    observer.observe(video);

    const ready = ["loadedmetadata", "loadeddata", "canplay", "canplaythrough"];
    ready.forEach((e) => video.addEventListener(e, attemptPlay));

    return () => {
      observer.disconnect();
      ready.forEach((e) => video.removeEventListener(e, attemptPlay));
    };
  }, [attemptPlay, reduceMotion, src]);

  /**
   * If autoplay was refused, the visitor's next action counts as a user gesture
   * and unlocks it — so the video starts on their first tap rather than waiting
   * for them to find a button.
   */
  useEffect(() => {
    if (reduceMotion) return;
    const unlock = () => attemptPlay();
    const gestures = ["pointerdown", "touchstart", "touchend", "click", "keydown", "scroll"];
    gestures.forEach((e) =>
      document.addEventListener(e, unlock, { passive: true, capture: true })
    );
    const onVisible = () => document.visibilityState === "visible" && attemptPlay();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      gestures.forEach((e) => document.removeEventListener(e, unlock, { capture: true }));
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [attemptPlay, reduceMotion]);

  if (reduceMotion) {
    return <img src={POSTER} alt={DESCRIPTION} className={className} />;
  }

  return (
    <video
      key={src}
      ref={attachVideo}
      className={className}
      poster={POSTER}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      // iOS reads the lowercase attribute; older WebKit needs this spelling.
      // eslint-disable-next-line react/no-unknown-property
      webkit-playsinline="true"
      preload="auto"
      disablePictureInPicture
      aria-label={DESCRIPTION}
    />
  );
}
