import type { Metadata } from "next";
import { TrackIndex } from "@/components/docs/TrackIndex";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Application security from the OWASP Cheat Sheet Series: threat modeling, injection, XSS and CSRF, authentication and sessions, access control, API, cryptography, cloud and supply chain, logging, AI and framework security.",
  alternates: { canonical: "/security" },
};

export default function SecurityIndex() {
  return (
    <TrackIndex
      host="security"
      kicker="Application security"
      title="Build it secure from the first line."
      lead="The OWASP Cheat Sheet Series, grouped into modules: the foundations, then each class of attack and the defence that stops it, from injection and XSS through auth, APIs, cryptography, cloud and AI. One cheat sheet per page."
    />
  );
}
