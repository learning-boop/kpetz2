import { useCallback, useEffect, useRef, useState } from "react";

const POSTER = "/media/kpetz-hero-poster.jpg";
const DESKTOP_SRC = "/media/kpetz-hero.mp4";
/** 720px, H.264 Baseline. Serves every screen up to 1024px — phones in landscape
 * and small tablets were previously pulling the full-size file. */
const MOBILE_SRC = "/media/kpetz-hero-mobile.mp4";
const DESCRIPTION = "A golden retriever running across a sunlit park towards its owner";

const mq = (query: string) =>
  typeof window !== "undefined" && window.matchMedia(query).matches;

type Props = { className?: string };

export default function HeroVideo({ className = "" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Read both synchronously. If `small` started false, mobile would request the
  // 2.2MB desktop file, then remount and fetch the small one — wasting the whole
  // download and delaying playback badly on a slow connection.
  const [small, setSmall] = useState(() => mq("(max-width: 1024px)"));
  const [reduceMotion, setReduceMotion] = useState(() =>
    mq("(prefers-reduced-motion: reduce)")
  );

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const width = window.matchMedia("(max-width: 1024px)");
    const sync = () => {
      setReduceMotion(motion.matches);
      setSmall(width.matches);
    };
    motion.addEventListener("change", sync);
    width.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      width.removeEventListener("change", sync);
    };
  }, []);

  /**
   * React sets `muted` as a DOM property, and not always before the browser
   * decides whether autoplay is allowed — which is why muted autoplay can fail
   * in React but work in plain HTML. Setting it in the ref callback guarantees
   * it lands the moment the node exists.
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
    // A rejection just means the OS refused for now (Low Power Mode, Low Data
    // Mode, no gesture yet). Swallow it — the listeners below will retry.
    video.play()?.catch(() => {});
  }, []);

  /**
   * Play only while the hero is on screen. Mobile Safari suspends offscreen
   * video anyway, and this keeps it from burning battery further down the page.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) attemptPlay();
        else video.pause();
      },
      { threshold: 0.15 }
    );

    observer.observe(video);

    // `canplay` fires later than mount on a slow connection — exactly when the
    // first attempt fails — so retry at every point new data becomes available.
    const ready = ["loadedmetadata", "loadeddata", "canplay", "canplaythrough"];
    ready.forEach((e) => video.addEventListener(e, attemptPlay));

    return () => {
      observer.disconnect();
      ready.forEach((e) => video.removeEventListener(e, attemptPlay));
    };
  }, [attemptPlay, reduceMotion, small]);

  /**
   * If the browser refused autoplay, the next thing the visitor does counts as a
   * user gesture and unlocks playback. Listening for it means the video starts
   * on their first tap or scroll rather than waiting for them to find a button.
   */
  useEffect(() => {
    if (reduceMotion) return;

    const unlock = () => attemptPlay();
    const gestures = ["pointerdown", "touchstart", "touchend", "click", "keydown", "scroll"];
    gestures.forEach((e) =>
      document.addEventListener(e, unlock, { passive: true, capture: true })
    );

    // A tab opened in the background can't autoplay; retry once it's shown.
    const onVisible = () => {
      if (document.visibilityState === "visible") attemptPlay();
    };
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
      // Re-mounts if the breakpoint changes, so the right file is fetched.
      key={small ? "mobile" : "desktop"}
      ref={attachVideo}
      className={className}
      poster={POSTER}
      src={small ? MOBILE_SRC : DESKTOP_SRC}
      autoPlay
      muted
      loop
      playsInline
      // iOS reads the lowercase attribute; React's camelCase prop covers most
      // browsers, but older WebKit needs this spelling too.
      // eslint-disable-next-line react/no-unknown-property
      webkit-playsinline="true"
      preload="auto"
      disablePictureInPicture
      aria-label={DESCRIPTION}
    />
  );
}