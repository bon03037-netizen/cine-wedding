"use client";

import { supabase } from '@/lib/supabase';
import { useRef, useState, useCallback } from "react";
import DaumPostcode, { Address } from "react-daum-postcode";
import { motion } from "framer-motion";
import { Heart, ChevronDown, Upload, X, Plus, Film, GripVertical } from "lucide-react";
import { WeddingData, SectionId, DEFAULT_SECTIONS_ORDER } from "@/components/templates/FilmTheme";
import InvitationView from "@/components/InvitationView";
import CinematicIntro from "@/components/CinematicIntro";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Theme = "film" | "cinematic";

const THEMES: { id: Theme; label: string; sub: string; icon: string }[] = [
  { id: "film",      label: "Film",      sub: "필름 카메라 드럼",   icon: "📽" },
  { id: "cinematic", label: "Cinematic", sub: "시네마틱 패럴랙스", icon: "🎬" },
];

const BG_COLOR_OPTIONS = [
  { hex: "#ffffff", label: "화이트" },
  { hex: "#000000", label: "블랙" },
  { hex: "#f8f8f4", label: "베이지" },
  { hex: "#fffaf0", label: "플로랄 화이트" },
  { hex: "#fff0f5", label: "연핑크" },
  { hex: "#122f24", label: "딥그린" },
];

const FONT_OPTIONS = [
  { id: "nanum-myeongjo", label: "나눔 명조", sample: "우아한 명조체", cssFamily: "var(--font-nanum), serif" },
  { id: "noto-serif-kr",  label: "Noto Serif KR", sample: "세련된 세리프체", cssFamily: "var(--font-serif-kr), serif" },
  { id: "gowun-dodum",    label: "고운돋움", sample: "깔끔한 돋움체", cssFamily: "var(--font-gowun), sans-serif" },
  { id: "nanum-gothic",   label: "나눔 고딕", sample: "모던 고딕체", cssFamily: "var(--font-nanum-gothic), sans-serif" },
];

const GREETING_SAMPLES = [
  {
    title: "감성적",
    text: "저희 두 사람이 사랑을 맺어\n한 가정을 이루게 되었습니다.\n\n두 사람이 걸어온 길이 하나로 모여\n이제 함께 새로운 길을 걷고자 합니다.\n\n바쁘시더라도 자리를 빛내주시어\n저희의 첫 출발을 축복해 주시면\n더없는 기쁨이 되겠습니다.",
  },
  {
    title: "정중한",
    text: "참으로 감사한 인연의 소중함을 느끼며\n저희 두 사람은 이제 하나가 되고자 합니다.\n\n오시는 걸음마다 진심을 담아\n따뜻하게 맞이하겠습니다.\n\n귀한 걸음 해주시어\n저희의 출발을 함께 축복해 주세요.",
  },
  {
    title: "서정적",
    text: "봄날의 햇살처럼 따뜻하게\n가을 하늘처럼 맑고 높게\n언제나 서로 곁에 있겠습니다.\n\n저희가 걸어갈 길 위에\n꽃처럼 피어날 사랑의 증인이 되어\n소중한 발걸음 함께해 주세요.",
  },
  {
    title: "위트있는",
    text: "드디어 저희가 결심했습니다! 🎉\n\n눈이 맞고, 마음이 맞고\n결국엔 손도 잡게 되었습니다.\n\n맛있는 음식과 행복한 자리로\n여러분의 발걸음에 보답하겠습니다.\n꼭 오셔서 축하해 주세요!",
  },
  {
    title: "간결한",
    text: "저희 두 사람\n이제 함께 걷겠습니다.\n\n소중한 분들과 함께하는\n작은 시작의 자리에\n꼭 함께해 주세요.",
  },
  {
    title: "고전적",
    text: "하늘이 맺어준 인연으로\n두 사람이 백년가약을 맺으려 합니다.\n\n존경하는 어른들의 축복 속에\n새 출발을 하고자 하오니\n부디 왕림하시어 자리를 빛내주시기\n간곡히 부탁드립니다.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_EXT = /\.(jpg|jpeg|png)$/i;

function isAllowedImage(file: File) {
  return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXT.test(file.name);
}

/** Canvas API로 클라이언트 사이드 이미지 압축/리사이즈 */
async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.82
): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            { type: "image/jpeg" }
          );
          // 압축 결과가 더 크면 원본 사용
          resolve(compressed.size < file.size ? compressed : file);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

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
  groomParents: { fatherLastName: "이", fatherFirstName: "창영", motherLastName: "정", motherFirstName: "경란" },
  brideParents: { fatherLastName: "차", fatherFirstName: "강호", motherLastName: "길", motherFirstName: "복동" },
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
  showGreeting: true,
  showCouple: true,
  showGallery: true,
  showMap: true,
  showTransport: true,
  showAccounts: true,
  sectionsOrder: [...DEFAULT_SECTIONS_ORDER],
  fontFamily: "nanum-myeongjo",
  mainBackgroundColor: "#0a0a0a",
  accounts: {
    groom:       { bank: "국민은행", accountNumber: "123-456-78-901234", name: "이호진" },
    groomFather: { bank: "신한은행", accountNumber: "110-123-456789", name: "이창영" },
    groomMother: { bank: "", accountNumber: "", name: "" },
    bride:       { bank: "신한은행", accountNumber: "110-123-456789", name: "차나리" },
    brideFather: { bank: "국민은행", accountNumber: "123-456-78-901234", name: "차강호" },
    brideMother: { bank: "", accountNumber: "", name: "" },
  },
};

// ── 섹션 메타 ────────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<SectionId, string> = {
  greeting: "초대 문구",
  couple: "신랑신부 & 혼주",
  gallery: "갤러리",
  map: "예식장 & 지도",
  transport: "교통 안내",
  accounts: "계좌 정보",
};

const SECTION_VISIBILITY: Record<SectionId, keyof WeddingData> = {
  greeting:  "showGreeting",
  couple:    "showCouple",
  gallery:   "showGallery",
  map:       "showMap",
  transport: "showTransport",
  accounts:  "showAccounts",
};

// 에디터 탭 ID → WeddingData 가시성 키 매핑
const EDITOR_VISIBILITY: Partial<Record<string, keyof WeddingData>> = {
  greeting: "showGreeting",
  couple:   "showCouple",
  photos:   "showGallery",
  venue:    "showMap",
  transport: "showTransport",
  accounts:  "showAccounts",
};

// ── Animated Toggle ────────────────────────────────────────────────────────────

function AnimatedToggle({
  isOn, onClick,
}: {
  isOn: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.div // 🌟 button에서 div로 변경하여 에러 해결!
      onClick={(e) => {
        e.stopPropagation(); // 🌟 클릭 시 뒤에 있는 탭이 열리거나 닫히는 현상(이벤트 버블링) 차단
        onClick(e);
      }}
      role="switch" // 웹 접근성을 위해 버튼 역할을 한다는 것을 명시
      aria-checked={isOn}
      animate={{ backgroundColor: isOn ? "#111111" : "#d1d5db" }}
      transition={{ duration: 0.18 }}
      style={{
        width: 34,
        height: 19,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        padding: 2,
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        outline: "none",
      }}
      title={isOn ? "섹션 숨기기" : "섹션 보이기"}
    >
      <motion.div
        animate={{ x: isOn ? 15 : 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 36 }}
        style={{
          width: 15,
          height: 15,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
        }}
      />
    </motion.div>
  );
}

// ── AccSection ─────────────────────────────────────────────────────────────────

function AccSection({
  id, title, icon, openMap, onToggle,
  isOn, onToggleVisibility,
  children,
}: {
  id: string; title: string; icon: string;
  openMap: Record<string, boolean>; onToggle: (id: string) => void;
  isOn?: boolean;
  onToggleVisibility?: () => void;
  children: React.ReactNode;
}) {
  const isOpen = openMap[id];

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    // OFF→ON 이면서 탭이 닫혀 있을 때 자동 펼침
    if (isOn === false && !isOpen) {
      onToggle(id);
    }
    onToggleVisibility?.();
  };

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
          {isOn !== undefined && onToggleVisibility && (
            <AnimatedToggle isOn={isOn} onClick={handleToggleVisibility} />
          )}
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
  label, lastName, firstName, isDeceased, onLastName, onFirstName, onDeceased,
}: {
  label: string;
  lastName: string;
  firstName: string;
  isDeceased: boolean;
  onLastName: (v: string) => void;
  onFirstName: (v: string) => void;
  onDeceased: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-400 w-7 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {isDeceased && <span className="text-xs text-gray-400 shrink-0 select-none">故</span>}
        <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-neutral-300 focus-within:border-transparent transition-all" style={{ width: 44 }}>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastName(e.target.value)}
            placeholder="성"
            className="bg-transparent w-full text-sm text-gray-700 focus:outline-none py-2 px-2 text-center"
          />
        </div>
        <div className="flex-1 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-neutral-300 focus-within:border-transparent transition-all">
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstName(e.target.value)}
            placeholder="이름"
            className="bg-transparent w-full text-sm text-gray-700 focus:outline-none py-2 px-3"
          />
        </div>
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

// ── Sortable Section Item (DnD) — 순서 변경 전용 ──────────────────────────────

function SortableItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1 }}
      className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-lg px-3 py-2.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={13} />
      </button>
      <span className="flex-1 text-[13px] text-gray-600">{label}</span>
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
    sections: false, greeting: true, couple: false, datetime: false,
    venue: false, photos: false, accounts: false, transport: false, font: false,
  });
  const [showGreetingSamples, setShowGreetingSamples] = useState(false);
  const [introPreviewKey, setIntroPreviewKey] = useState(0);
  const [introPreviewActive, setIntroPreviewActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [roadAddress, setRoadAddress] = useState(DEFAULT.address);
  const [detailAddress, setDetailAddress] = useState("");
  const [postcodeOpen, setPostcodeOpen] = useState(false);

  const mainImgRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<HTMLInputElement>(null);

  const toggleSection = (id: string) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((prev) => {
        const order = prev.sectionsOrder ?? [...DEFAULT_SECTIONS_ORDER];
        const oldIdx = order.indexOf(active.id as SectionId);
        const newIdx = order.indexOf(over.id as SectionId);
        return { ...prev, sectionsOrder: arrayMove(order, oldIdx, newIdx) };
      });
    }
  };

  const set = useCallback(<K extends keyof WeddingData>(key: K, val: WeddingData[K]) =>
    setData((prev) => ({ ...prev, [key]: val })), []);

  // 가시성 토글 핸들러
  const toggleVisibility = useCallback((key: keyof WeddingData) => {
    setData((prev) => ({ ...prev, [key]: prev[key] !== false ? false : true }));
  }, []);

  const updateDp = (patch: Partial<DateState>) => {
    setDp((prev) => {
      const next = { ...prev, ...patch };
      setData((d) => ({ ...d, date: buildDate(next), time: buildTime(next) }));
      return next;
    });
  };

  // 메인 이미지 업로드 (JPG/JPEG/PNG) — Canvas 압축 후 업로드
  const handleMainImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedImage(file)) {
      alert("JPG, JPEG, PNG 파일만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }
    // 메인 이미지는 최대 1600px로 압축
    const compressed = await compressImage(file, 1600, 0.85);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
    const { error } = await supabase.storage.from('wedding-photos').upload(fileName, compressed);
    if (error) { alert('사진 업로드 실패: ' + error.message); return; }
    const { data: urlData } = supabase.storage.from('wedding-photos').getPublicUrl(fileName);
    set("mainImage", urlData.publicUrl);
    e.target.value = "";
  };

  // 갤러리 사진 다량 업로드 (진행률 표시) — Canvas 압축 후 업로드
  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(isAllowedImage);
    if (!files.length) {
      alert("JPG, JPEG, PNG 파일만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }

    setUploadProgress({ current: 0, total: files.length });

    const uploadOne = async (file: File): Promise<string | null> => {
      // 갤러리 사진은 최대 1200px로 압축 (필름롤 썸네일 용도)
      const compressed = await compressImage(file, 1200, 0.82);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
      const { error } = await supabase.storage.from('wedding-photos').upload(fileName, compressed);
      setUploadProgress((p) => p ? { ...p, current: p.current + 1 } : null);
      if (error) return null;
      const { data } = supabase.storage.from('wedding-photos').getPublicUrl(fileName);
      return data.publicUrl;
    };

    const results = await Promise.all(files.map(uploadOne));
    const validUrls = results.filter((url): url is string => url !== null);
    setData((prev) => ({ ...prev, photos: [...(prev.photos ?? []), ...validUrls] }));

    setTimeout(() => setUploadProgress(null), 900);
    e.target.value = "";
  };

  const removePhoto = (i: number) =>
    setData((prev) => ({ ...prev, photos: (prev.photos ?? []).filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    const tempSlug = "toast-" + Date.now();
    const invitationData = {
      slug: tempSlug,
      theme: currentTheme,
      content: data,
      image_urls: data.photos || [],
    };
    const { error } = await supabase.from('invitations').insert([invitationData]);
    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      alert('성공적으로 저장되었습니다!\n나의 고유 주소: ' + tempSlug);
    }
  };

  // 특정 탭의 가시성 값 조회 헬퍼
  const isTabOn = (editorId: string): boolean => {
    const key = EDITOR_VISIBILITY[editorId];
    if (!key) return true;
    return data[key] !== false;
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

      <div className="flex flex-row-reverse h-[calc(100vh-57px)] max-w-7xl mx-auto w-full gap-10 px-6 py-8">

        {/* ── Right: Editor ── */}
        <div className="w-[520px] shrink-0 overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
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
            <input ref={mainImgRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleMainImg} className="hidden" />
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
                    <span className="text-xs">메인 사진 업로드 (JPG · PNG)</span>
                  </button>
                )}
              </div>
            </div>

            {/* ── 세부 디자인 설정 ── */}
            <AccSection id="font" title="세부 디자인 설정" icon="🎨" openMap={open} onToggle={toggleSection}>
              {/* 폰트 선택 */}
              <p className="text-[10px] text-gray-400 font-mono tracking-widest mt-2 mb-2">폰트 선택</p>
              <div className="p-1 grid grid-cols-2 gap-2">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => set("fontFamily", f.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      data.fontFamily === f.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-sm font-medium" style={{ fontFamily: f.cssFamily }}>{f.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-50" style={{ fontFamily: f.cssFamily }}>{f.sample}</p>
                  </button>
                ))}
              </div>

              {/* 배경 효과 선택 */}
              <p className="text-[10px] text-gray-400 font-mono tracking-widest mt-5 mb-2">배경 효과</p>
              <div className="grid grid-cols-3 gap-2 mb-1">
                {([
                  { id: "none",       label: "없음",  icon: "○" },
                  { id: "petals",     label: "꽃잎",  icon: "🌸" },
                  { id: "snowflakes", label: "눈꽃",  icon: "❄️" },
                ] as { id: "none" | "petals" | "snowflakes"; label: string; icon: string }[]).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => set("particleEffect", opt.id)}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      (data.particleEffect ?? "none") === opt.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-[15px]">{opt.icon}</p>
                    <p className="text-[10px] mt-0.5">{opt.label}</p>
                  </button>
                ))}
              </div>

              {/* 배경색 선택 */}
              <p className="text-[10px] text-gray-400 font-mono tracking-widest mt-5 mb-2">배경색 선택</p>
              <div className="grid grid-cols-2 gap-2">
                {BG_COLOR_OPTIONS.map((c) => {
                  const selected = (data.mainBackgroundColor || "#0a0a0a") === c.hex;
                  return (
                    <button
                      key={c.hex}
                      onClick={() => set("mainBackgroundColor", c.hex)}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                        selected
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex-shrink-0 border border-gray-300"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-xs font-medium">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </AccSection>

            {/* 섹션 순서 변경 */}
            <AccSection id="sections" title="섹션 순서 변경" icon="🗂️" openMap={open} onToggle={toggleSection}>
              <div className="mt-2">
                <p className="text-[11px] text-gray-300 mb-3 font-mono">드래그로 표시 순서를 변경합니다</p>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={(data.sectionsOrder ?? DEFAULT_SECTIONS_ORDER).filter(
                      (id) => data[SECTION_VISIBILITY[id]] !== false
                    )}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1.5">
                      {(data.sectionsOrder ?? DEFAULT_SECTIONS_ORDER)
                        .filter((id) => data[SECTION_VISIBILITY[id]] !== false)
                        .map((id) => (
                          <SortableItem key={id} id={id} label={SECTION_LABELS[id]} />
                        ))}
                    </div>
                  </SortableContext>
                </DndContext>
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
                <div
                  className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600"
                  style={{ fontFamily: "var(--font-serif-kr), serif" }}
                >
                  {data.date} &nbsp;{data.time}
                </div>
              </div>
            </AccSection>

            {/* 예식장 & 지도 */}
            <AccSection
              id="venue" title="예식장 & 지도" icon="🏛️"
              openMap={open} onToggle={toggleSection}
              isOn={isTabOn("venue")}
              onToggleVisibility={() => toggleVisibility("showMap")}
            >
              <div className="mt-2 space-y-3">
                <Field label="예식장 이름">
                  <input type="text" value={data.venue} onChange={(e) => set("venue", e.target.value)} className={inputCls} />
                </Field>
                <Field label="도로명 주소">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={roadAddress}
                      placeholder="주소 검색 버튼을 눌러주세요"
                      className={`${inputCls} flex-1 cursor-default`}
                    />
                    <button
                      type="button"
                      onClick={() => setPostcodeOpen(true)}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap transition-colors"
                    >
                      주소 검색
                    </button>
                  </div>
                </Field>
                <Field label="상세 주소">
                  <input
                    type="text"
                    value={detailAddress}
                    onChange={(e) => {
                      const detail = e.target.value;
                      setDetailAddress(detail);
                      set("address", roadAddress + (detail ? " " + detail : ""));
                    }}
                    placeholder="예: 펠리스홀 3층"
                    className={inputCls}
                  />
                </Field>
              </div>
            </AccSection>

            {/* 초대 문구 */}
            <AccSection
              id="greeting" title="초대 문구" icon="✉️"
              openMap={open} onToggle={toggleSection}
              isOn={isTabOn("greeting")}
              onToggleVisibility={() => toggleVisibility("showGreeting")}
            >
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

              {/* 샘플 양식 */}
              <div className="mt-3">
                <button
                  onClick={() => setShowGreetingSamples((v) => !v)}
                  className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors font-mono tracking-wide"
                >
                  <span>{showGreetingSamples ? "▲" : "▼"}</span>
                  샘플 양식 {showGreetingSamples ? "닫기" : "보기"}
                </button>

                {showGreetingSamples && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {GREETING_SAMPLES.map((s) => (
                      <button
                        key={s.title}
                        onClick={() => {
                          set("greeting", s.text);
                          setShowGreetingSamples(false);
                        }}
                        className="text-left p-3 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all group"
                      >
                        <p className="text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-[0.1em] group-hover:text-gray-600">
                          {s.title}
                        </p>
                        <p
                          className="text-[10.5px] text-gray-500 leading-relaxed line-clamp-3"
                          style={{ fontFamily: "var(--font-serif-kr), serif" }}
                        >
                          {s.text.replace(/\n/g, " ")}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </AccSection>

            {/* 신랑신부 & 혼주 */}
            <AccSection
              id="couple" title="신랑신부 & 혼주" icon="💍"
              openMap={open} onToggle={toggleSection}
              isOn={isTabOn("couple")}
              onToggleVisibility={() => toggleVisibility("showCouple")}
            >
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
                  <Field label="연락처" className="mt-2">
                    <input
                      type="tel"
                      value={data.groomPhone ?? ""}
                      onChange={(e) => set("groomPhone", e.target.value)}
                      placeholder="010-0000-0000"
                      className={inputCls}
                    />
                  </Field>
                  <div className="mt-3 space-y-2">
                    <PersonRow
                      label="부친"
                      lastName={data.groomParents?.fatherLastName ?? ""}
                      firstName={data.groomParents?.fatherFirstName ?? ""}
                      isDeceased={!!data.groomParents?.isFatherDeceased}
                      onLastName={(v) => set("groomParents", { ...data.groomParents, fatherLastName: v })}
                      onFirstName={(v) => set("groomParents", { ...data.groomParents, fatherFirstName: v })}
                      onDeceased={(v) => set("groomParents", { ...data.groomParents, isFatherDeceased: v })}
                    />
                    <div className="flex items-center gap-2 pl-9">
                      <input
                        type="tel"
                        value={data.groomParents?.fatherPhone ?? ""}
                        onChange={(e) => set("groomParents", { ...data.groomParents, fatherPhone: e.target.value })}
                        placeholder="부친 연락처"
                        className={`${inputCls} text-[12px]`}
                      />
                    </div>
                    <PersonRow
                      label="모친"
                      lastName={data.groomParents?.motherLastName ?? ""}
                      firstName={data.groomParents?.motherFirstName ?? ""}
                      isDeceased={!!data.groomParents?.isMotherDeceased}
                      onLastName={(v) => set("groomParents", { ...data.groomParents, motherLastName: v })}
                      onFirstName={(v) => set("groomParents", { ...data.groomParents, motherFirstName: v })}
                      onDeceased={(v) => set("groomParents", { ...data.groomParents, isMotherDeceased: v })}
                    />
                    <div className="flex items-center gap-2 pl-9">
                      <input
                        type="tel"
                        value={data.groomParents?.motherPhone ?? ""}
                        onChange={(e) => set("groomParents", { ...data.groomParents, motherPhone: e.target.value })}
                        placeholder="모친 연락처"
                        className={`${inputCls} text-[12px]`}
                      />
                    </div>
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
                  <Field label="연락처" className="mt-2">
                    <input
                      type="tel"
                      value={data.bridePhone ?? ""}
                      onChange={(e) => set("bridePhone", e.target.value)}
                      placeholder="010-0000-0000"
                      className={inputCls}
                    />
                  </Field>
                  <div className="mt-3 space-y-2">
                    <PersonRow
                      label="부친"
                      lastName={data.brideParents?.fatherLastName ?? ""}
                      firstName={data.brideParents?.fatherFirstName ?? ""}
                      isDeceased={!!data.brideParents?.isFatherDeceased}
                      onLastName={(v) => set("brideParents", { ...data.brideParents, fatherLastName: v })}
                      onFirstName={(v) => set("brideParents", { ...data.brideParents, fatherFirstName: v })}
                      onDeceased={(v) => set("brideParents", { ...data.brideParents, isFatherDeceased: v })}
                    />
                    <div className="flex items-center gap-2 pl-9">
                      <input
                        type="tel"
                        value={data.brideParents?.fatherPhone ?? ""}
                        onChange={(e) => set("brideParents", { ...data.brideParents, fatherPhone: e.target.value })}
                        placeholder="부친 연락처"
                        className={`${inputCls} text-[12px]`}
                      />
                    </div>
                    <PersonRow
                      label="모친"
                      lastName={data.brideParents?.motherLastName ?? ""}
                      firstName={data.brideParents?.motherFirstName ?? ""}
                      isDeceased={!!data.brideParents?.isMotherDeceased}
                      onLastName={(v) => set("brideParents", { ...data.brideParents, motherLastName: v })}
                      onFirstName={(v) => set("brideParents", { ...data.brideParents, motherFirstName: v })}
                      onDeceased={(v) => set("brideParents", { ...data.brideParents, isMotherDeceased: v })}
                    />
                    <div className="flex items-center gap-2 pl-9">
                      <input
                        type="tel"
                        value={data.brideParents?.motherPhone ?? ""}
                        onChange={(e) => set("brideParents", { ...data.brideParents, motherPhone: e.target.value })}
                        placeholder="모친 연락처"
                        className={`${inputCls} text-[12px]`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccSection>

            {/* 우리들의 이야기 (갤러리) */}
            <AccSection
              id="photos" title="우리들의 이야기 (갤러리)" icon="🎞️"
              openMap={open} onToggle={toggleSection}
              isOn={isTabOn("photos")}
              onToggleVisibility={() => toggleVisibility("showGallery")}
            >
              <div className="mt-2">
                <input
                  ref={photosRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  multiple
                  onChange={handlePhotos}
                  className="hidden"
                />

                {/* 업로드 진행률 바 */}
                {uploadProgress && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] text-gray-400 font-mono">
                        업로드 중... ({uploadProgress.current}/{uploadProgress.total})
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gray-900 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%`,
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

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
                    disabled={!!uploadProgress}
                    className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors disabled:opacity-40"
                  >
                    <Plus size={15} />
                    <span className="text-[10px]">추가</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-300 mt-2.5 font-mono">
                  JPG · JPEG · PNG · 3:4 비율 권장
                </p>
              </div>
            </AccSection>

            {/* 계좌 정보 */}
            <AccSection
              id="accounts" title="계좌 정보" icon="💳"
              openMap={open} onToggle={toggleSection}
              isOn={isTabOn("accounts")}
              onToggleVisibility={() => toggleVisibility("showAccounts")}
            >
              <div className="mt-2 space-y-5">
                {(
                  [
                    { key: "groom",       sideLabel: "신랑측", personLabel: "신랑 본인" },
                    { key: "groomFather", sideLabel: null,     personLabel: "신랑 부친" },
                    { key: "groomMother", sideLabel: null,     personLabel: "신랑 모친" },
                    { key: "bride",       sideLabel: "신부측", personLabel: "신부 본인" },
                    { key: "brideFather", sideLabel: null,     personLabel: "신부 부친" },
                    { key: "brideMother", sideLabel: null,     personLabel: "신부 모친" },
                  ] as const
                ).map(({ key, sideLabel, personLabel }, idx) => {
                  const acc = data.accounts?.[key];
                  const updateAcc = (patch: Partial<{ bank: string; accountNumber: string; name: string }>) =>
                    set("accounts", {
                      ...data.accounts,
                      [key]: { bank: "", accountNumber: "", name: "", ...acc, ...patch },
                    });
                  return (
                    <div key={key}>
                      {sideLabel && (
                        <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.2em] mb-3 font-mono">
                          {sideLabel}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 mb-2">{personLabel}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Field label="은행">
                          <input
                            type="text"
                            value={acc?.bank ?? ""}
                            onChange={(e) => updateAcc({ bank: e.target.value })}
                            className={inputCls}
                            placeholder="신한은행"
                          />
                        </Field>
                        <Field label="계좌번호" className="col-span-2">
                          <input
                            type="text"
                            value={acc?.accountNumber ?? ""}
                            onChange={(e) => updateAcc({ accountNumber: e.target.value })}
                            className={inputCls}
                            placeholder="000-000-000000"
                          />
                        </Field>
                      </div>
                      <Field label="예금주" className="mt-2">
                        <input
                          type="text"
                          value={acc?.name ?? ""}
                          onChange={(e) => updateAcc({ name: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                      {(idx === 2) && <div className="border-t border-gray-100 mt-5" />}
                    </div>
                  );
                })}
              </div>
            </AccSection>

            {/* 교통 안내 */}
            <AccSection
              id="transport" title="교통 안내" icon="🚌"
              openMap={open} onToggle={toggleSection}
              isOn={isTabOn("transport")}
              onToggleVisibility={() => toggleVisibility("showTransport")}
            >
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

        {/* ── Left: Preview ── */}
        <div className="flex-1 flex items-center justify-center bg-[#f4f4f4] rounded-2xl p-8">
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
                <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                  <div style={{ width: 390, zoom: 300 / 390 } as React.CSSProperties}>
                    <InvitationView data={data} theme={currentTheme} />
                  </div>
                </div>

                {/* 인트로 미리보기 오버레이 */}
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

      {/* ── 다음(카카오) 주소 검색 모달 ─────────────────────────────── */}
      {postcodeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setPostcodeOpen(false)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden w-[95vw] max-w-[500px] shadow-2xl relative"
            style={{ height: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">주소 검색</span>
              <button
                onClick={() => setPostcodeOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <DaumPostcode
              onComplete={(addr: Address) => {
                const road = addr.roadAddress || addr.autoRoadAddress || "";
                setRoadAddress(road);
                set("address", road + (detailAddress ? " " + detailAddress : ""));
                setPostcodeOpen(false);
              }}
              style={{ height: "calc(100% - 49px)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
