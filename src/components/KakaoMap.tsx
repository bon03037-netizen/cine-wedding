"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface KakaoMapProps {
  address: string;
}

export default function KakaoMap({ address }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 환경변수가 제대로 들어왔는지 브라우저 콘솔에 찍어보는 확인용 코드
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
  console.log("현재 적용된 카카오 키:", appKey);

  useEffect(() => {
    // 스크립트 로드 완료 + 주소 있음 + 도화지(ref) 준비됨 3박자가 맞을 때만 실행
    if (!isLoaded || !address || !mapRef.current) return;

    const kakao = (window as any).kakao;
    
    // 만약 여기서도 없으면 정말로 키 문제이거나 도메인 문제입니다.
    if (!kakao || !kakao.maps || !kakao.maps.services) {
      console.error("여전히 services를 못 찾습니다. 카카오 디벨로퍼스 설정을 다시 확인해주세요.");
      return;
    }

    kakao.maps.load(() => {
      const geocoder = new kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(address, (result: any[], status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
          
          const map = new kakao.maps.Map(mapRef.current, {
            center: coords,
            level: 3,
          });
          
          new kakao.maps.Marker({
            map: map,
            position: coords,
          });
        } else {
          console.warn("카카오 지도가 이 주소를 인식하지 못합니다:", address);
        }
      });
    });
  }, [address, isLoaded]);

  // Vercel 환경변수가 비어있을 때 화면에 경고 띄우기
  if (!appKey) {
    return (
      <div style={{ width: "100%", height: "250px", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff4444", fontSize: "12px", textAlign: "center", padding: "20px" }}>
        Vercel에 카카오 API 키가 설정되지 않았습니다.<br/>환경변수를 다시 확인해주세요.
      </div>
    );
  }

  return (
    <>
      {/* Next.js 공식 스크립트 컴포넌트로 안전하게 로드 */}
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />
      
      <div 
        ref={mapRef} 
        style={{ 
          width: "100%", 
          height: "250px", 
          borderRadius: "10px", 
          background: "#0a0a0a",
          border: "1px solid #222" 
        }} 
      />
    </>
  );
}