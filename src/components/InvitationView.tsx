"use client";

import FilmTheme, { WeddingData } from "./templates/FilmTheme";
import CinematicTheme from "./templates/CinematicTheme";

interface Props {
  data: WeddingData;
  theme: "film" | "cinematic";
}

export default function InvitationView({ data, theme }: Props) {
  const bg = data.mainBackgroundColor || "#0a0a0a";
  if (theme === "cinematic") {
    return (
      <div style={{ backgroundColor: bg, minHeight: "100%" }}>
        <CinematicTheme data={data} />
      </div>
    );
  }
  return (
    <div style={{ backgroundColor: bg, minHeight: "100%" }}>
      <FilmTheme data={data} />
    </div>
  );
}
