import type { CSSProperties, JSX } from "react";

const LIGHT = "#f3ead3";
const DARK = "#7eb8a4";

const PIECE_KEYS = [
  "wP",
  "wR",
  "wN",
  "wB",
  "wQ",
  "wK",
  "bP",
  "bR",
  "bN",
  "bB",
  "bQ",
  "bK",
] as const;

function SpritePiece({ src }: { src: string }) {
  return (
    // Pixel sprites must stay unoptimized and pixelated.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        imageRendering: "pixelated",
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
}

function makePiece(key: (typeof PIECE_KEYS)[number]) {
  return function PackedPiece(): JSX.Element {
    return <SpritePiece src={`/pieces/${key}.png`} />;
  };
}

export const PIXEL_PIECES = Object.fromEntries(
  PIECE_KEYS.map((key) => [key, makePiece(key)]),
);

export const PIXEL_BOARD = {
  lightSquareStyle: { backgroundColor: LIGHT } satisfies CSSProperties,
  darkSquareStyle: { backgroundColor: DARK } satisfies CSSProperties,
  dropSquareStyle: { backgroundColor: "rgba(201, 162, 39, 0.45)" } satisfies CSSProperties,
  darkSquareNotationStyle: { color: LIGHT } satisfies CSSProperties,
  lightSquareNotationStyle: { color: DARK } satisfies CSSProperties,
  boardStyle: {
    width: "100%",
    border: "4px solid #1e3d34",
    boxShadow: "4px 4px 0 #1e3d34",
    imageRendering: "pixelated",
  } satisfies CSSProperties,
};
