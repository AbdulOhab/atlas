import { ImageResponse } from "next/og";

/** The sidebar's logo mark — `^/` — on the app's dark canvas. */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <svg width="32" height="32" viewBox="0 0 32 32">
          <rect x="0" y="0" width="32" height="32" rx="7" fill="#101720" />
          <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5,19 10.5,12 16,19" stroke="#d7dee8" />
            <line x1="19" y1="25" x2="27" y2="7" stroke="#4ed98a" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
