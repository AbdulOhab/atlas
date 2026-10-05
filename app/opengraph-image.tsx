import { OG_CONTENT_TYPE, OG_SIZE, siteCard } from "@/lib/og";

export const alt = "Atlas CE";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return siteCard();
}
