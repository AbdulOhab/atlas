import type { Metadata } from "next";
import { TrackIndex } from "@/components/docs/TrackIndex";

export const metadata: Metadata = {
  title: "AI & LLMs",
  description:
    "Large language models end to end, from Maxime Labonne's LLM Course: fundamentals, the LLM scientist path (architecture, pre-training, fine-tuning, alignment, evaluation, quantization) and the LLM engineer path (RAG, agents, inference, deployment, security).",
  alternates: { canonical: "/ai" },
};

export default function AiIndex() {
  return (
    <TrackIndex
      host="ai"
      kicker="AI and LLMs"
      title="How large language models are built, tuned and shipped."
      lead="The LLM Course in three paths: the fundamentals it assumes, the scientist's path to building better models, and the engineer's path to building applications on them. Each topic explains the idea and lists the best references to go deeper."
    />
  );
}
