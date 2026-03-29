"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import CinematicIntro from "./CinematicIntro";
import InvitationView from "./InvitationView";
import { WeddingData } from "./templates/FilmTheme";

interface Props {
  data: WeddingData;
  theme: "film" | "cinematic";
}

export default function InvitationPageClient({ data, theme }: Props) {
  const hasPhotos = (data.photos?.length ?? 0) > 0;
  // 사진이 없으면 인트로를 건너뜀
  const [introComplete, setIntroComplete] = useState(!hasPhotos);

  return (
    <>
      {!introComplete && (
        <CinematicIntro
          photos={data.photos!}
          onComplete={() => setIntroComplete(true)}
        />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <InvitationView data={data} theme={theme} />
      </motion.div>
    </>
  );
}
