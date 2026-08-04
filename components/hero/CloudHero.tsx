"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type SyntheticEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/video/clouds.mp4";
const MASK_SRC = "/images/ez-wordmark.svg";

type CloudVideoProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  className?: string;
  muted?: boolean;
  onCanPlay?: (event: SyntheticEvent<HTMLVideoElement>) => void;
};

function CloudVideo({
  videoRef,
  className = "",
  muted = true,
  onCanPlay,
}: CloudVideoProps) {
  return (
    <video
      ref={videoRef}
      className={className}
      src={VIDEO_SRC}
      autoPlay
      muted={muted}
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      onCanPlay={onCanPlay}
    />
  );
}

export default function CloudHero() {
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const mistVideoRef = useRef<HTMLVideoElement>(null);

  const reducedMotion = useReducedMotion();
  const [isReady, setIsReady] = useState(false);

  /*
   * Держим вторую копию видео рядом с основной.
   *
   * Небольшая разница по времени намеренная:
   * внутри букв облака не должны совпадать пиксель в пиксель
   * с фоновым видео.
   */
  useEffect(() => {
    const backgroundVideo = backgroundVideoRef.current;
    const mistVideo = mistVideoRef.current;

    if (!backgroundVideo || !mistVideo) return;

    const desiredOffset = 0.38;

    const synchronizeVideos = () => {
      if (
        backgroundVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        mistVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        return;
      }

      const targetTime = backgroundVideo.currentTime + desiredOffset;
      const duration = mistVideo.duration;

      if (!Number.isFinite(duration) || duration <= 0) return;

      const wrappedTarget = targetTime % duration;
      const difference = Math.abs(mistVideo.currentTime - wrappedTarget);

      if (difference > 0.16) {
        mistVideo.currentTime = wrappedTarget;
      }
    };

    const intervalId = window.setInterval(synchronizeVideos, 900);

    backgroundVideo.addEventListener("seeked", synchronizeVideos);
    backgroundVideo.addEventListener("play", synchronizeVideos);

    return () => {
      window.clearInterval(intervalId);
      backgroundVideo.removeEventListener("seeked", synchronizeVideos);
      backgroundVideo.removeEventListener("play", synchronizeVideos);
    };
  }, []);

  const maskStyles = {
    "--ez-mask": `url("${MASK_SRC}")`,
  } as CSSProperties;

  return (
    <section className="cloudHero">
      <div className="cloudHero__media">
        <CloudVideo
          videoRef={backgroundVideoRef}
          className="cloudHero__video cloudHero__video--background"
          onCanPlay={() => setIsReady(true)}
        />

        <div className="cloudHero__colorGrade" />

        <motion.div
          className="cloudHero__mistStage"
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  scale: 0.965,
                  filter: "blur(20px)",
                }
          }
          animate={
            isReady
              ? {
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                }
              : {
                  opacity: 0,
                }
          }
          transition={{
            duration: 2.2,
            delay: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="cloudHero__mistMask" style={maskStyles}>
            <CloudVideo
              videoRef={mistVideoRef}
              className="cloudHero__video cloudHero__video--mist"
            />

            <div className="cloudHero__mistMilk" />
            <div className="cloudHero__mistTexture" />
          </div>
        </motion.div>

        <div className="cloudHero__vignette" />
        <div className="cloudHero__filmOverlay" />
      </div>

      <div className="cloudHero__content">
        <header className="cloudHero__navigation">
          <a className="cloudHero__brand" href="/" aria-label="EZ Production">
            EZ PRODUCTION
          </a>

          <nav className="cloudHero__links" aria-label="Основная навигация">
            <a href="#work">WORK</a>
            <a href="#studio">STUDIO</a>
            <a href="#contact">CONTACT</a>
          </nav>
        </header>

        <div className="cloudHero__footer">
          <p>MADE EASY.</p>

          <a href="#work" className="cloudHero__scroll">
            <span>SCROLL TO BEGIN</span>
            <span className="cloudHero__scrollDot" />
          </a>
        </div>
      </div>
    </section>
  );
}