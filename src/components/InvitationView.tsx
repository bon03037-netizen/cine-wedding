"use client";

import FilmTheme, { WeddingData } from "./templates/FilmTheme";
import CinematicTheme from "./templates/CinematicTheme";

interface Props {
  data: WeddingData;
  theme: "film" | "cinematic";
}

export default function InvitationView({ data, theme }: Props) {
  if (theme === "cinematic") {
    return <CinematicTheme data={data} />;
  }
  return <FilmTheme data={data} />;
}
