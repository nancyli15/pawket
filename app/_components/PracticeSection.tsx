"use client";

import { useState } from "react";
import PositionsSection from "./PositionsSection";
import TradesSection from "./TradesSection";

// Sections 1 and 2 share this: when a trade is added or deleted, the positions reload
export default function PracticeSection() {
  const [version, setVersion] = useState(0);
  const changed = () => setVersion((v) => v + 1);

  return (
    <>
      <TradesSection version={version} onChange={changed} />
      <PositionsSection version={version} />
    </>
  );
}
