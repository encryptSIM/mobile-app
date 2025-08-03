import React from "react";
import { NoSimsHome, SimsHome } from "./components";
import { useEsimHomeScreen } from "./hooks/useEsimHomeScreen";

export function EsimHomeScreen() {
  const {
    sims,
  } = useEsimHomeScreen();

  if (sims.length > 0) {
    return <SimsHome />
  }

  return <NoSimsHome />
}
