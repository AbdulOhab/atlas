import type { Metadata } from "next";
import { TopBar } from "@/components/layout/TopBar";
import { PlaygroundView } from "@/components/playground/PlaygroundView";

const DESCRIPTION = "Build a system on a canvas, set the scale, and see whether it holds.";

export const metadata: Metadata = {
  title: "Playground",
  description: DESCRIPTION,
  openGraph: { title: "Playground · Atlas CE", description: DESCRIPTION, url: "/playground" },
  twitter: { card: "summary_large_image", title: "Playground · Atlas CE", description: DESCRIPTION },
  alternates: { canonical: "/playground" },
};

export default function PlaygroundPage() {
  return (
    <>
      <TopBar crumb="Playground" />
      <main className="pg-page">
        <PlaygroundView />
      </main>
    </>
  );
}
