import type { Metadata } from "next";
import TransitionLink from "@/components/transitions/TransitionLink";
import { dataConsentParagraphs } from "@/lib/data-consent";

export const metadata: Metadata = {
  title: "Consent to Personal Data Processing — EZ",
  alternates: { canonical: "/consent" },
};

export default function ConsentPage() {
  return (
    <main className="mx-auto max-w-[850px] px-6 py-12 md:py-20">
      <TransitionLink href="/" transitionIntent="home-hero" className="text-sm underline underline-offset-4">Back to EZ</TransitionLink>
      <h1 className="mb-4 mt-12 text-4xl font-medium tracking-[-0.05em] md:text-5xl">Consent to Personal Data Processing</h1>
      <p className="mb-10 text-sm text-[var(--color-text-secondary)]">Version: 30 October 2026</p>
      <div className="space-y-6 text-base leading-7 text-[var(--color-text-secondary)]">
        {dataConsentParagraphs.map((text) => <p key={text}>{text}</p>)}
      </div>
      <TransitionLink href="/privacy" className="mt-10 inline-block underline underline-offset-4">Privacy Policy</TransitionLink>
    </main>
  );
}
