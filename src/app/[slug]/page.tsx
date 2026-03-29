
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { WeddingData } from "@/components/templates/FilmTheme";
import InvitationPageClient from "@/components/InvitationPageClient";

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

  return (
    <InvitationPageClient
      data={weddingData}
      theme={data.theme as "film" | "cinematic"}
    />
  );
}
