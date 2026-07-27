import { useCallback, useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

const POSTER = "/media/kpetz-hero-poster.jpg";
const DESKTOP_SRC = "/media/kpetz-hero.mp4";
/** 720px wide, ~600KB instead of 2.2MB. A phone on 3G may never finish the big file. */
const MOBILE_SRC = "/media/kpetz-hero-mobile.mp4";
const DESCRIPTION = "A golden retriever running across a sunlit park towards its owner";

type Props = { className?: string };

export default function HeroVideo({ className = "" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [small, setSmall] = useState(false);
  /** True once the browser has refused to autoplay — we then offer a tap target. */
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const width = window.matchMedia("(max-width: 640px)");
    const sync = () => {
      setReduceMotion(motion.matches);
      setSmall(width.matches);
    };
    sync();
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
    if (!video) return;
    video.muted = true;
    const started = video.play();
    if (started !== undefined) {
      started.then(() => setBlocked(false)).catch(() => setBlocked(true));
    }
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
    // Also try as soon as there are frames to show — `canplay` fires later than
    // mount on a slow connection, which is exactly when the first attempt fails.
    video.addEventListener("canplay", attemptPlay);
    video.addEventListener("loadeddata", attemptPlay);

    return () => {
      observer.disconnect();
      video.removeEventListener("canplay", attemptPlay);
      video.removeEventListener("loadeddata", attemptPlay);
    };
  }, [attemptPlay, reduceMotion, small]);

  if (reduceMotion) {
    return <img src={POSTER} alt={DESCRIPTION} className={className} />;
  }

  return (
    <>
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

      {/* Low Power Mode and data-saver modes refuse autoplay outright — no code
          can override that, so give the visitor a way to start it themselves. */}
      {blocked && (
        <button
          type="button"
          onClick={attemptPlay}
          aria-label="Play background video"
          className="absolute bottom-5 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-lg transition hover:bg-ink"
        >
          <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
        </button>
      )}
    </>
  );
}
