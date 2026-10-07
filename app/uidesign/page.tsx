import type { Metadata } from "next";
import { TrackIndex } from "@/components/docs/TrackIndex";

export const metadata: Metadata = {
  title: "UI Design",
  description:
    "Frontend design norms distilled from Refactoring UI by Adam Wathan and Steve Schoger: starting from scratch, visual hierarchy, layout and spacing, typography, color, depth, images and finishing touches.",
  alternates: { canonical: "/uidesign" },
};

export default function UiDesignIndex() {
  return (
    <TrackIndex
      host="uidesign"
      kicker="UI Design"
      title="Frontend design norms, from Refactoring UI."
      lead="Practical rules for making interfaces look designed: start with a feature and limit your choices, build hierarchy with weight and color before size, space everything from a scale, set type like a system, work in HSL, fake depth with light from above — and finish with accent borders instead of borders. Distilled from Refactoring UI by Adam Wathan and Steve Schoger."
    />
  );
}
