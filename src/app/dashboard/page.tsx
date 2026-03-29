"use client";

import { supabase } from '@/lib/supabase';
import { useRef, useState, useCallback } from "react";
import { Heart, ChevronDown, Upload, X, Plus, Film } from "lucide-react";
import { WeddingData } from "@/components/templates/FilmTheme";
import InvitationView from "@/components/InvitationView";
import CinematicIntro from "@/components/CinematicIntro";

type Theme = "film" | "cinematic";

const THEMES: { id: Theme; label: string; sub: string; icon: string }[] = [
  { id: "film",      label: "Film",      sub: "필름 카메라 드럼",   icon: "📽" },
  { id: "cinematic", label: "Cinematic", sub: "시네마틱 패럴랙스", icon: "🎬" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

interface DateState {
  year: string;
  month: string;
  day: string;
  ampm: string;
  hour: string;
  minute: string;
}

const INIT_DATE: DateState = {
  year: "2026", month: "6", day: "20",
  ampm: "오후", hour: "1", minute: "00",
};

function buildDate(d: DateState) {
  const dt = new Date(+d.year, +d.month - 1, +d.day);
  const dow = isNaN(dt.getTime()) ? "" : DOW[dt.getDay()];
  return `${d.year}년 ${d.month}월 ${d.day}일 ${dow}요일`;
}
function buildTime(d: DateState) {
  return `${d.ampm} ${d.hour}시${d.minute !== "00" ? ` ${d.minute}분` : ""}`;
}

// ── Default Data ──────────────────────────────────────────────────────────────

const DEFAULT: WeddingData = {
  groomName: "이호진",
  brideName: "차나리",
  groomParents: { fatherName: "이창영", motherName: "정경란" },
  brideParents: { fatherName: "차강호", motherName: "길복동" },
  date: buildDate(INIT_DATE),
  time: buildTime(INIT_DATE),
  venue: "그랜드 인터컨티넨탈 서울 파르나스",
  address: "서울특별시 강남구 테헤란로 521 (삼성동)",
  greeting:
    "저희 두 사람이 사랑을 맺어\n한 가정을 이루게 되었습니다.\n\n두 사람이 걸어온 길이 하나로 모여\n이제 함께 새로운 길을 걷고자 합니다.\n\n바쁘시더라도 자리를 빛내주시어\n저희의 첫 출발을 축복해 주시면\n더없는 기쁨이 되겠습니다.",
  groomAccount: { bank: "국민은행", number: "123-456-78-901234", holder: "이호진" },
  brideAccount: { bank: "신한은행", number: "110-123-456789", holder: "차나리" },
  transport: {
    subway: "2호선 삼성역 5·6번 출구에서 도보 5분",
    bus: "145 · 148 · 341번 삼성역 하차 후 도보 3분",
    car: "건물 내 무료 주차 · 웨딩 참석 시 3시간 무료",
  },
  photos: [],
};

// ── Sub-components ────────────────────────────────────────────────────────────

function AccSection({
  id, title, icon, openMap, onToggle, children,
}: {
  id: string; title: string; icon: string;
  openMap: Record<string, boolean>; onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  const isOpen = openMap[id];
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[15px]">{icon}</span>
          <span className="text-sm font-medium text-gray-700" style={{ fontFamily: "var(--font-serif-kr), serif" }}>
            {title}
          </span>
        </div>
        <ChevronDown
          size={14}
          className="text-gray-400 transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        style={{
          maxHeight: isOpen ? 2000 : 0,
          overflow: "hidden",
          transition: "max-height 0.28s ease",
        }}
      >
        <div className="px-4 pb-5 pt-2 border-t border-gray-50">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-medium text-gray-400 mb-1.5 tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function PersonRow({
  label, name, isDeceased, onName, onDeceased,
}: {
  label: string; name: string; isDeceased: boolean;
  onName: (v: string) => void; onDeceased: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-400 w-7 shrink-0">{label}</span>
      <div
        className="flex-1 flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-neutral-300 focus-within:border-transparent transition-all"
      >
        {isDeceased && (
          <span className="pl-3 text-xs text-gray-400 shrink-0 select-none">故</span>
        )}
        <input
          type="text"
          value={name}
          onChange={(e) => onName(e.target.value)}
          className={`bg-transparent w-full text-sm text-gray-700 focus:outline-none py-2 ${isDeceased ? "pl-1 text-gray-400" : "px-3"}`}
        />
      </div>
      <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
        <input
          type="checkbox"
          checked={isDeceased}
          onChange={(e) => onDeceased(e.target.checked)}
          className="w-3.5 h-3.5 accent-neutral-700 cursor-pointer"
        />
        <span className="text-[11px] text-gray-400">고인</span>
      </label>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent focus:bg-white transition-colors";
const selectCls =
  "px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-colors";

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<WeddingData>(DEFAULT);
  const [dp, setDp] = useState<DateState>(INIT_DATE);
  const [currentTheme, setCurrentTheme] = useState<Theme>("film");
  const [open, setOpen] = useState<Record<string, boolean>>({
    greeting: true, couple: false, datetime: false,
    venue: false, photos: false, accounts: false, transport: false,
  });
  const [introPreviewKey, setIntroPreviewKey] = useState(0);
  const [introPreviewActive, setIntroPreviewActive] = useState(false);

  const mainImgRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<HTMLInputElement>(null);

  const toggleSection = (id: string) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const set = useCallback(<K extends keyof WeddingData>(key: K, val: WeddingData[K]) =>
    setData((prev) => ({ ...prev, [key]: val })), []);

  const updateDp = (patch: Partial<DateState>) => {
    setDp((prev) => {
      const next = { ...prev, ...patch };
      setData((d) => ({ ...d, date: buildDate(next), time: buildTime(next) }));
      return next;
    });
  };

  // 1. 메인 이미지 업로드 함수 (사진 창고로 바로 쏘기)
    const handleMainImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`; // 중복 방지용 이름
    
    // Supabase 사진 창고에 업로드
    const { error } = await supabase.storage.from('wedding-photos').upload(fileName, file);
    if (error) {
      alert('사진 업로드 실패: ' + error.message);
      return;
    }

    // 업로드된 사진의 짧은 주소만 가져와서 화면에 적용
    const { data: urlData } = supabase.storage.from('wedding-photos').getPublicUrl(fileName);
    set("mainImage", urlData.publicUrl);
    e.target.value = "";
  };

  
    // 🚀 3배 빨라진 갤러리 사진 업로드 함수 (동시 업로드)
    const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // 여러 장의 사진을 동시에 Supabase 창고로 던집니다!
    const uploadPromises = files.map(async (file) => {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('wedding-photos').upload(fileName, file);
      
      if (!error) {
        const { data } = supabase.storage.from('wedding-photos').getPublicUrl(fileName);
        return data.publicUrl;
      }
      return null;
    });

    // 모든 사진이 올라갈 때까지 한 번만 기다립니다.
    const results = await Promise.all(uploadPromises);
    
    // 에러 없이 성공한 사진 주소만 걸러냅니다.
    const validUrls: string[] = results.filter((url) => url !== null) as string[];

    // 화면에 짠! 하고 반영합니다.
    setData((prev) => ({ ...prev, photos: [...(prev.photos ?? []), ...validUrls] }));
    e.target.value = "";
  };

  const removePhoto = (i: number) =>
    setData((prev) => ({ ...prev, photos: (prev.photos ?? []).filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
      // 1. 고유한 임시 주소 생성 (중복 방지를 위해 현재 시간 숫자 사용)
      const tempSlug = "toast-" + Date.now();

      // 2. 현재 화면의 상태(state)를 그대로 모아서 데이터 만들기
      const invitationData = {
        slug: tempSlug,
        theme: currentTheme,
        content: data, // 에디터에서 입력한 모든 데이터(data 상태)를 통째로 JSON으로 넣습니다.
        image_urls: data.photos || []
      };

      // 3. Supabase에 전송
      const { error } = await supabase
        .from('invitations')
        .insert([invitationData]);

      if (error) {
        alert('저장 실패: ' + error.message);
      } else {
        alert('성공적으로 저장되었습니다!\n나의 고유 주소: ' + tempSlug);
      }
    };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Pretendard, -apple-system, sans-serif" }}>

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-2.5 sticky top-0 z-20">
        <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
        <span
          className="text-base font-semibold text-gray-900"
          style={{ fontFamily: "var(--font-serif-kr), serif" }}
        >
          Toast Wedding
        </span>
        <span className="text-gray-200 mx-1.5">|</span>
        <span className="text-gray-400 text-sm">청첩장 편집</span>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 font-mono tracking-widest uppercase">
            {currentTheme === "film" ? "Film" : "Cinematic"}
          </span>
          <button className="px-4 py-1.5 text-[13px] text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
            미리보기
          </button>
          <button onClick={handleSave}
            className="px-4 py-1.5 text-[13px] bg-gray-900 text-white rounded-full hover:bg-black transition-colors">
            저장 및 공유
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">

        {/* ── Left: Editor ── */}
        <div className="w-[460px] shrink-0 overflow-y-auto border-r border-gray-100">
          <div className="p-4 space-y-2">

            {/* ── Theme Selector ── */}
            <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-50">
                <span className="text-[15px]">🎨</span>
                <span className="text-sm font-medium text-gray-700" style={{ fontFamily: "var(--font-serif-kr), serif" }}>
                  테마 선택
                </span>
              </div>
              <div className="p-2.5 grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCurrentTheme(t.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      currentTheme === t.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-sm font-medium">{t.icon} {t.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-50">{t.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 메인 이미지 */}
            <input ref={mainImgRef} type="file" accept="image/*" onChange={handleMainImg} className="hidden" />
            <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 flex items-center gap-2.5 border-b border-gray-50">
                <span className="text-[15px]">🖼️</span>
                <span className="text-sm font-medium text-gray-700" style={{ fontFamily: "var(--font-serif-kr), serif" }}>
                  메인 이미지
                </span>
              </div>
              <div className="p-3">
                {data.mainImage ? (
                  <div
                    className="relative rounded-lg overflow-hidden group cursor-pointer"
                    onClick={() => mainImgRef.current?.click()}
                  >
                    <img src={data.mainImage} alt="" className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Upload size={14} color="white" />
                      <span className="text-white text-xs font-medium">이미지 변경</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); set("mainImage", undefined); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={11} color="white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => mainImgRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <Upload size={16} />
                    <span className="text-xs">메인 사진 업로드</span>
                  </button>
                )}
              </div>
            </div>

            {/* 초대 문구 */}
            <AccSection id="greeting" title="초대 문구" icon="✉️" openMap={open} onToggle={toggleSection}>
              <Field label="인삿말" className="mt-2">
                <textarea
                  value={data.greeting}
                  onChange={(e) => set("greeting", e.target.value)}
                  rows={5}
                  className={`${inputCls} resize-none leading-7`}
                  placeholder="하객들에게 전할 메시지를 입력하세요"
                  style={{ fontFamily: "var(--font-serif-kr), serif", fontSize: 13 }}
                />
              </Field>
            </AccSection>

            {/* 신랑신부 & 혼주 */}
            <AccSection id="couple" title="신랑신부 & 혼주" icon="💍" openMap={open} onToggle={toggleSection}>
              <div className="mt-2 space-y-5">

                {/* 신랑 */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.2em] mb-3 font-mono">
                    신랑
                  </p>
                  <Field label="이름">
                    <input
                      type="text"
                      value={data.groomName}
                      onChange={(e) => set("groomName", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <div className="mt-3 space-y-2">
                    <PersonRow
                      label="부친"
                      name={data.groomParents?.fatherName ?? ""}
                      isDeceased={!!data.groomParents?.isFatherDeceased}
                      onName={(v) => set("groomParents", { ...data.groomParents, fatherName: v })}
                      onDeceased={(v) => set("groomParents", { ...data.groomParents, isFatherDeceased: v })}
                    />
                    <PersonRow
                      label="모친"
                      name={data.groomParents?.motherName ?? ""}
                      isDeceased={!!data.groomParents?.isMotherDeceased}
                      onName={(v) => set("groomParents", { ...data.groomParents, motherName: v })}
                      onDeceased={(v) => set("groomParents", { ...data.groomParents, isMotherDeceased: v })}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* 신부 */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.2em] mb-3 font-mono">
                    신부
                  </p>
                  <Field label="이름">
                    <input
                      type="text"
                      value={data.brideName}
                      onChange={(e) => set("brideName", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <div className="mt-3 space-y-2">
                    <PersonRow
                      label="부친"
                      name={data.brideParents?.fatherName ?? ""}
                      isDeceased={!!data.brideParents?.isFatherDeceased}
                      onName={(v) => set("brideParents", { ...data.brideParents, fatherName: v })}
                      onDeceased={(v) => set("brideParents", { ...data.brideParents, isFatherDeceased: v })}
                    />
                    <PersonRow
                      label="모친"
                      name={data.brideParents?.motherName ?? ""}
                      isDeceased={!!data.brideParents?.isMotherDeceased}
                      onName={(v) => set("brideParents", { ...data.brideParents, motherName: v })}
                      onDeceased={(v) => set("brideParents", { ...data.brideParents, isMotherDeceased: v })}
                    />
                  </div>
                </div>
              </div>
            </AccSection>

            {/* 예식 일시 */}
            <AccSection id="datetime" title="예식 일시" icon="📅" openMap={open} onToggle={toggleSection}>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={dp.year} onChange={(e) => updateDp({ year: e.target.value })} className={selectCls}>
                    {["2025", "2026", "2027", "2028"].map((y) => <option key={y}>{y}</option>)}
                  </select>
                  <span className="text-xs text-gray-400">년</span>
                  <select value={dp.month} onChange={(e) => updateDp({ month: e.target.value })} className={selectCls}>
                    {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <span className="text-xs text-gray-400">월</span>
                  <select value={dp.day} onChange={(e) => updateDp({ day: e.target.value })} className={selectCls}>
                    {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <span className="text-xs text-gray-400">일</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={dp.ampm} onChange={(e) => updateDp({ ampm: e.target.value })} className={selectCls}>
                    <option>오전</option>
                    <option>오후</option>
                  </select>
                  <select value={dp.hour} onChange={(e) => updateDp({ hour: e.target.value })} className={selectCls}>
                    {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => <option key={h}>{h}</option>)}
                  </select>
                  <span className="text-xs text-gray-400">시</span>
                  <select value={dp.minute} onChange={(e) => updateDp({ minute: e.target.value })} className={selectCls}>
                    {["00", "10", "20", "30", "40", "50"].map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <span className="text-xs text-gray-400">분</span>
                </div>
                {/* Preview */}
                <div
                  className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600"
                  style={{ fontFamily: "var(--font-serif-kr), serif" }}
                >
                  {data.date} &nbsp;{data.time}
                </div>
              </div>
            </AccSection>

            {/* 예식장 정보 */}
            <AccSection id="venue" title="예식장 정보" icon="🏛️" openMap={open} onToggle={toggleSection}>
              <div className="mt-2 space-y-3">
                <Field label="예식장 이름">
                  <input type="text" value={data.venue} onChange={(e) => set("venue", e.target.value)} className={inputCls} />
                </Field>
                <Field label="주소">
                  <input type="text" value={data.address} onChange={(e) => set("address", e.target.value)} className={inputCls} />
                </Field>
                <Field label="지도 임베드 URL">
                  <input
                    type="text"
                    value={data.mapEmbedUrl ?? ""}
                    onChange={(e) => set("mapEmbedUrl", e.target.value || undefined)}
                    className={inputCls}
                    placeholder="Google Maps embed URL (선택)"
                  />
                </Field>
              </div>
            </AccSection>

            {/* 우리들의 이야기 (갤러리) */}
            <AccSection id="photos" title="우리들의 이야기 (갤러리)" icon="🎞️" openMap={open} onToggle={toggleSection}>
              <div className="mt-2">
                <input ref={photosRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
                <div className="grid grid-cols-3 gap-2">
                  {(data.photos ?? []).map((src, i) => (
                    <div key={i} className="relative group aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} color="white" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => photosRef.current?.click()}
                    className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <Plus size={15} />
                    <span className="text-[10px]">추가</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-300 mt-2.5 font-mono">
                  3:4 비율 권장 · 방문자 페이지에서 3D 필름 드럼으로 표시됩니다
                </p>
              </div>
            </AccSection>

            {/* 계좌 정보 */}
            <AccSection id="accounts" title="계좌 정보" icon="💳" openMap={open} onToggle={toggleSection}>
              <div className="mt-2 space-y-5">
                {(["groom", "bride"] as const).map((side) => {
                  const account = side === "groom" ? data.groomAccount : data.brideAccount;
                  const label = side === "groom" ? "신랑측" : "신부측";
                  const update = (patch: Partial<typeof account>) =>
                    side === "groom"
                      ? set("groomAccount", { ...data.groomAccount!, ...patch })
                      : set("brideAccount", { ...data.brideAccount!, ...patch });
                  return (
                    <div key={side}>
                      <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.2em] mb-3 font-mono">
                        {label}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <Field label="은행">
                          <input
                            type="text"
                            value={account?.bank ?? ""}
                            onChange={(e) => update({ bank: e.target.value })}
                            className={inputCls}
                            placeholder="신한은행"
                          />
                        </Field>
                        <Field label="계좌번호" className="col-span-2">
                          <input
                            type="text"
                            value={account?.number ?? ""}
                            onChange={(e) => update({ number: e.target.value })}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                      <Field label="예금주" className="mt-2">
                        <input
                          type="text"
                          value={account?.holder ?? ""}
                          onChange={(e) => update({ holder: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                      {side === "groom" && <div className="border-t border-gray-100 mt-5" />}
                    </div>
                  );
                })}
              </div>
            </AccSection>

            {/* 교통 안내 */}
            <AccSection id="transport" title="교통 안내" icon="🚌" openMap={open} onToggle={toggleSection}>
              <div className="mt-2 space-y-3">
                <Field label="지하철">
                  <textarea
                    value={data.transport?.subway ?? ""}
                    onChange={(e) => set("transport", { ...data.transport, subway: e.target.value })}
                    rows={2}
                    className={`${inputCls} resize-none`}
                    placeholder="지하철 노선 및 출구 안내"
                  />
                </Field>
                <Field label="버스">
                  <textarea
                    value={data.transport?.bus ?? ""}
                    onChange={(e) => set("transport", { ...data.transport, bus: e.target.value })}
                    rows={2}
                    className={`${inputCls} resize-none`}
                    placeholder="버스 노선 및 정류장 안내"
                  />
                </Field>
                <Field label="자가용">
                  <textarea
                    value={data.transport?.car ?? ""}
                    onChange={(e) => set("transport", { ...data.transport, car: e.target.value })}
                    rows={2}
                    className={`${inputCls} resize-none`}
                    placeholder="주차 안내 및 경로"
                  />
                </Field>
              </div>
            </AccSection>

            <div className="pb-4" />
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div className="flex-1 flex items-center justify-center bg-[#f4f4f4] p-8">
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] text-gray-400 tracking-[0.25em] uppercase font-mono">Live Preview</p>

            {/* Phone frame */}
            <div
              className="relative"
              style={{
                width: 320,
                height: 640,
                background: "#111",
                borderRadius: 44,
                padding: 10,
                boxShadow:
                  "0 0 0 1px #2a2a2a, inset 0 0 0 1px #1a1a1a, 0 32px 80px rgba(0,0,0,0.25)",
              }}
            >
              {/* Side buttons */}
              <div className="absolute -left-[3px] top-[110px] w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -left-[3px] top-[155px] w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -left-[3px] top-[215px] w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -right-[3px] top-[160px] w-[3px] h-16 bg-[#2a2a2a] rounded-r-sm" />

              {/* Screen */}
              <div
                className="w-full h-full overflow-hidden flex flex-col"
                style={{ background: "#0c0c0c", borderRadius: 36, position: "relative" }}
              >
                {/* Status bar */}
                <div className="flex justify-between items-center px-5 pt-3 pb-1.5 shrink-0" style={{ background: "#0c0c0c" }}>
                  <span className="text-[10px] text-zinc-600 font-medium tabular-nums">9:41</span>
                  <div className="w-[68px] h-[18px] bg-black rounded-full" />
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-2.5 border border-zinc-700 rounded-[2px] relative flex items-center px-0.5">
                      <div className="w-[8px] h-[8px] bg-zinc-600 rounded-[1px]" />
                      <div className="absolute -right-[2px] top-[3px] w-[2px] h-[4px] bg-zinc-700 rounded-r-sm" />
                    </div>
                  </div>
                </div>

                {/* 390px 실제 모바일 너비로 렌더링 후 zoom으로 축소 */}
                <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                  {/* zoom: 300/390 ≈ 0.769 — 폰 프레임 내부 너비(300px)에 맞게 축소 */}
                  <div style={{ width: 390, zoom: 300 / 390 } as React.CSSProperties}>
                    <InvitationView data={data} theme={currentTheme} />
                  </div>
                </div>

                {/* 인트로 미리보기 오버레이 (폰 스크린 안에 contained) */}
                {introPreviewActive && (data.photos?.length ?? 0) > 0 && (
                  <CinematicIntro
                    key={introPreviewKey}
                    photos={data.photos!}
                    onComplete={() => setIntroPreviewActive(false)}
                    contained
                  />
                )}
              </div>
            </div>

            {/* Date below phone */}
            <p
              className="text-[11px] text-gray-400"
              style={{ fontFamily: "var(--font-serif-kr), serif" }}
            >
              {data.date} · {data.time}
            </p>

            {/* 인트로 미리보기 버튼 */}
            <button
              onClick={() => {
                if ((data.photos?.length ?? 0) === 0) return;
                setIntroPreviewKey((k) => k + 1);
                setIntroPreviewActive(true);
              }}
              disabled={(data.photos?.length ?? 0) === 0 || introPreviewActive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wide transition-all"
              style={{
                background: (data.photos?.length ?? 0) === 0 ? "#e5e7eb" : "#111",
                color: (data.photos?.length ?? 0) === 0 ? "#9ca3af" : "#fff",
                cursor: (data.photos?.length ?? 0) === 0 ? "not-allowed" : "pointer",
                opacity: introPreviewActive ? 0.5 : 1,
              }}
              title={(data.photos?.length ?? 0) === 0 ? "갤러리에 사진을 추가하면 인트로가 활성화됩니다" : ""}
            >
              <Film size={11} />
              인트로 재생
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
