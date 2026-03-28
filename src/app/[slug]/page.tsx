import FilmTheme, { WeddingData } from "@/components/templates/FilmTheme";

const MOCK_INVITATIONS: Record<string, WeddingData> = {
  "nari-hojin": {
    groomName: "김호진",
    brideName: "이나리",
    date: "2026년 5월 23일 토요일",
    time: "오후 2시",
    venue: "더파티움 서울",
    address: "서울특별시 강남구 테헤란로 123",
    greeting: "두 사람이 하나가 되는 날,\n소중한 자리에 함께해 주세요.\n\n서로를 바라보며 함께 걸어온 시간들,\n이제 하나의 길로 이어집니다.",
    groomParents: { fatherName: "김철수", motherName: "박영희" },
    brideParents: { fatherName: "이상훈", motherName: "최미영" },
    photos: [],
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function InvitationPage({ params }: Props) {
  const { slug } = await params;
  const data = MOCK_INVITATIONS[slug];

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0c0c] text-center px-4">
        <p className="text-zinc-600 font-mono text-sm tracking-widest">청첩장을 찾을 수 없어요</p>
        <p className="text-zinc-800 text-xs mt-2">주소를 다시 확인해 주세요.</p>
      </div>
    );
  }

  return <FilmTheme data={data} />;
}
