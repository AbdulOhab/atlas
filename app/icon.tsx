import { ImageResponse } from "next/og";

/** The sidebar's logo mark — a slash with one dot per track — on the app's dark canvas. */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#101720",
          borderRadius: 6,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          <line x1="8" y1="25" x2="24" y2="7" stroke="#64728a" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="8" cy="25" r="4" fill="#4fb8a8" />
          <circle cx="16" cy="16" r="4" fill="#6cb2ee" />
          <circle cx="24" cy="7" r="4" fill="#4ed98a" />
        </svg>
      </div>
    ),
    size,
  );
}
