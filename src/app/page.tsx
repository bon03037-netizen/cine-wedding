import Link from "next/link";
import { Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-rose-50">
      <div className="text-center space-y-6 px-4">
        <div className="flex items-center justify-center gap-2 text-rose-400">
          <Heart className="w-8 h-8 fill-rose-400" />
          <h1 className="text-4xl font-bold text-rose-500">Toast Wedding</h1>
          <Heart className="w-8 h-8 fill-rose-400" />
        </div>
        <p className="text-gray-500 text-lg max-w-md">
          아름다운 모바일 청첩장을 간편하게 만들어보세요
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-rose-400 text-white rounded-full font-medium hover:bg-rose-500 transition-colors"
          >
            청첩장 만들기
          </Link>
          <Link
            href="/nari-hojin"
            className="px-6 py-3 border border-rose-300 text-rose-500 rounded-full font-medium hover:bg-rose-50 transition-colors"
          >
            예시 청첩장 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
