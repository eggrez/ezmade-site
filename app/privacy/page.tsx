import type { Metadata } from "next";
import TransitionLink from "@/components/transitions/TransitionLink";
import { privacyPolicySections } from "@/lib/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy — EZ",
  description: "How EZ handles project enquiries and personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[850px] px-6 py-12 md:py-20">
      <TransitionLink href="/" transitionIntent="home-hero" className="text-sm underline underline-offset-4">Back to EZ</TransitionLink>
      <h1 className="mb-4 mt-12 text-4xl font-medium tracking-[-0.05em] md:text-6xl">Privacy Policy</h1>
      <p className="mb-10 text-sm text-[var(--color-text-secondary)]">Last updated: 30 October 2026</p>
      <div className="space-y-8">
        {privacyPolicySections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-xl font-medium tracking-tight">{section.title}</h2>
            <p className="text-base leading-7 text-[var(--color-text-secondary)]">{section.text}</p>
          </section>
        ))}
      </div>
      <a href="mailto:eggrezgrigorev@gmail.com" className="mt-10 inline-block underline underline-offset-4">eggrezgrigorev@gmail.com</a>
    </main>
  );
}
