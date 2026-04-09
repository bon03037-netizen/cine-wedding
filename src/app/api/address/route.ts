import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/address?query={주소}
 *
 * 카카오 로컬 API(/v2/local/search/address.json)를 서버에서 대리 호출합니다.
 * 브라우저에서 직접 호출하면 CORS 차단이 발생하므로 이 프록시를 경유합니다.
 *
 * 필수 환경변수: KAKAO_REST_API_KEY (카카오 디벨로퍼스 → 내 애플리케이션 → REST API 키)
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query || !query.trim()) {
    return NextResponse.json(
      { error: "query 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    console.error(
      "[address API] KAKAO_REST_API_KEY 환경변수가 설정되어 있지 않습니다.\n" +
      ".env.local에 KAKAO_REST_API_KEY=<REST API 키> 를 추가해 주세요."
    );
    return NextResponse.json(
      { error: "서버 설정 오류: REST API 키 누락" },
      { status: 500 }
    );
  }

  // query는 서버에서 encodeURIComponent로 인코딩해 URL에 삽입합니다.
  const kakaoUrl =
    `https://dapi.kakao.com/v2/local/search/address.json` +
    `?query=${encodeURIComponent(query.trim())}`;

  let kakaoRes: Response;
  try {
    kakaoRes = await fetch(kakaoUrl, {
      headers: {
        // 카카오 로컬 API는 반드시 "KakaoAK {REST API 키}" 형식이어야 합니다.
        Authorization: `KakaoAK ${apiKey}`,
      },
      // Next.js fetch 캐시 비활성화 (주소마다 항상 최신 결과 반환)
      cache: "no-store",
    });
  } catch (err) {
    console.error("[address API] 카카오 서버 연결 실패:", err);
    return NextResponse.json(
      { error: "카카오 서버에 연결할 수 없습니다." },
      { status: 502 }
    );
  }

  if (!kakaoRes.ok) {
    // 상태 코드별로 원인을 명확히 로깅
    const body = await kakaoRes.text().catch(() => "");
    console.error(
      `[address API] 카카오 API 오류 — HTTP ${kakaoRes.status} ${kakaoRes.statusText}\n` +
      `  요청 URL : ${kakaoUrl}\n` +
      `  응답 바디: ${body}`
    );

    const hints: Record<number, string> = {
      401: "인증 실패 — REST API 키가 잘못되었거나 KakaoAK 형식이 아닙니다.",
      403: "권한 없음 — 카카오 디벨로퍼스에서 해당 앱의 로컬 API 사용이 허가되어 있는지 확인하세요.",
    };
    const hint = hints[kakaoRes.status] ?? "카카오 API 호출 실패";

    return NextResponse.json(
      { error: hint, status: kakaoRes.status },
      { status: kakaoRes.status }
    );
  }

  const data = await kakaoRes.json();
  return NextResponse.json(data);
}
