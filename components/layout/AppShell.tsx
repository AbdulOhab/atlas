import { getDocsByGroup, toMeta } from "@/lib/content";
import { trackSequence } from "@/lib/trackDocs";
import { AbbrTooltip } from "@/components/docs/AbbrTooltip";
import { Sidebar } from "./Sidebar";

/**
 * Server component: reads the document index once and hands plain metadata to
 * the client sidebar, so no markdown body ever crosses the boundary.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const concepts = getDocsByGroup("concept").map(toMeta);
  const tech = getDocsByGroup("tech").map(toMeta);
  const designs = getDocsByGroup("design").map(toMeta);
  const coding = getDocsByGroup("coding").map(toMeta);
  const learn = getDocsByGroup("learn").map(toMeta);
  // Course-ordered tracks list shared modules in place and carry each doc's child pages.
  const devops = trackSequence("devops");
  const backend = trackSequence("backend");
  const fde = trackSequence("fde");
  const languages = trackSequence("languages");
  const ai = trackSequence("ai");
  const security = trackSequence("security");
  const interview = trackSequence("interview");
  const uidesign = trackSequence("uidesign");
  const craft = trackSequence("craft");

  return (
    // clip, not hidden: hidden tooltips can't widen the page, and sticky still works.
    <div className="min-h-screen overflow-x-clip">
      <Sidebar concepts={concepts} tech={tech} designs={designs} coding={coding} learn={learn} devops={devops} backend={backend} fde={fde} languages={languages} security={security} interview={interview} ai={ai} uidesign={uidesign} craft={craft} />
      <div data-content className="transition-[padding] duration-200 lg:pl-sidebar">
        {children}
      </div>
      <AbbrTooltip />
    </div>
  );
}
