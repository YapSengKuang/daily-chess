"use client";

import dynamic from "next/dynamic";

export const ChessBoardLazy = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  {
    ssr: false,
    loading: () => <div className="board-skeleton" aria-hidden="true" />,
  },
);
