import type { Metadata } from "next";
import { TrackIndex } from "@/components/docs/TrackIndex";

export const metadata: Metadata = {
  title: "Craft",
  description:
    "Writing clean code and passing interviews, from Clean Code by Robert C. Martin and Cracking the Coding Interview by Gayle Laakmann McDowell: names, functions, comments, tests, smells — and the interview process, behavioral prep, Big O and the technical-question method.",
  alternates: { canonical: "/craft" },
};

export default function CraftIndex() {
  return (
    <TrackIndex
      host="craft"
      kicker="Clean Code & Interviews"
      title="Write code worth shipping, then defend it in the room."
      lead="Two books, one craft: Clean Code's rules for names, functions, comments, tests and smells — then Cracking the Coding Interview's map of the hiring process, behavioral preparation, Big O and the step-by-step method for technical questions. Distilled from Robert C. Martin's Clean Code and Gayle Laakmann McDowell's Cracking the Coding Interview."
    />
  );
}
