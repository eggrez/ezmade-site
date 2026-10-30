export default function CompactIntro() {
  return (
    <section
      data-home-scene="hero"
      aria-label="EZ — made easy with us."
      className="relative flex h-svh min-h-[320px] items-center justify-center bg-[var(--color-bg)] px-6"
    >
      <span
        aria-hidden="true"
        className="h-[clamp(4.8rem,6.4vw,6.8rem)] w-[clamp(4.8rem,6.4vw,6.8rem)] bg-black"
        style={{
          mask: 'url("/images/logo-mark.svg") center / contain no-repeat',
          WebkitMask: 'url("/images/logo-mark.svg") center / contain no-repeat',
        }}
      />
      <h1 className="absolute left-1/2 bottom-[max(5.5rem,env(safe-area-inset-bottom))] flex w-max max-w-[calc(100%-48px)] -translate-x-1/2 items-center justify-center gap-[7px] whitespace-nowrap text-[14px] font-normal leading-[1.55] tracking-normal text-[var(--color-text-secondary)]">
        <span
          role="img"
          aria-label="EZ"
          className="inline-block h-[10px] w-[27px] shrink-0 bg-current"
          style={{
            mask: 'url("/images/ez-wordmark-tight.svg") center / contain no-repeat',
            WebkitMask: 'url("/images/ez-wordmark-tight.svg") center / contain no-repeat',
          }}
        />
        <span className="translate-y-[2px]">—</span>
        <span className="translate-y-[2px]">made easy with us.</span>
      </h1>
    </section>
  );
}
