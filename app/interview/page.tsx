import type { Metadata } from "next";
import { TrackIndex } from "@/components/docs/TrackIndex";

export const metadata: Metadata = {
  title: "Interview Prep",
  description:
    "Software engineering interview preparation from the Tech Interview Handbook: getting ready, coding interview technique, algorithm cheatsheets, behavioral interviews, resumes and offers.",
  alternates: { canonical: "/interview" },
};

export default function InterviewIndex() {
  return (
    <TrackIndex
      host="interview"
      kicker="Interview prep"
      title="From the first recruiter call to the signed offer."
      lead="The Tech Interview Handbook, grouped into modules: how to prepare, what to do in a coding round, a cheatsheet per algorithm topic, the behavioral rounds, and the resume, compensation and negotiation around them."
    />
  );
}
