import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FilmTheme, { WeddingData } from "@/components/templates/FilmTheme";
import CinematicTheme from "@/components/templates/CinematicTheme";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function InvitationPage({ params }: Props) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from("invitations")
    .select("theme, content, image_urls")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();

  const weddingData: WeddingData = {
    ...(data.content as WeddingData),
    photos: data.image_urls ?? [],
  };

  if (data.theme === "cinematic") {
    return <CinematicTheme data={weddingData} />;
  }

  return <FilmTheme data={weddingData} />;
}
