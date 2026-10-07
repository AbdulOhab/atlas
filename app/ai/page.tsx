import type { Metadata } from "next";
import { TrackIndex } from "@/components/docs/TrackIndex";

export const metadata: Metadata = {
  title: "AI & LLMs",
  description:
    "Large language models end to end: generative AI foundations, prompt engineering, transformers and tokenizers, fine-tuning and reasoning models, the LLM scientist and engineer paths, building generative AI apps, RAG, agents and open models.",
  alternates: { canonical: "/ai" },
};

export default function AiIndex() {
  return (
    <TrackIndex
      host="ai"
      kicker="AI and LLMs"
      title="How large language models are built, tuned and shipped."
      lead="From the fundamentals to shipping: generative AI and prompt engineering, how transformers and tokenizers work, fine-tuning and reasoning models, then building apps with RAG, agents and open models. Drawn from Microsoft's Generative AI for Beginners, the DAIR.AI Prompt Engineering Guide, the Hugging Face LLM course and Maxime Labonne's LLM Course."
    />
  );
}
