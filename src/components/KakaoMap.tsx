"use client";

import { useEffect, useRef } from "react";

interface KakaoMapProps {
  address: string;
}

export default function KakaoMap({ address }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. 주소가 비어있으면 실행하지 않음
    if (!address) return;

    const initMap = () => {
      const kakao = (window as any).kakao;
      
      // 서비스(Geocoder) 라이브러리가 로드되었는지 확인
      if (!kakao || !kakao.maps || !kakao.maps.services) {
        console.error("카카오맵 서비스 라이브러리를 찾을 수 없습니다.");
        return;
      }

      // autoload=false 속성 때문에 수동으로 load를 호출해줘야 함
      kakao.maps.load(() => {
        const geocoder = new kakao.maps.services.Geocoder();

        // 2. 주소로 좌표 검색
        geocoder.addressSearch(address, (result: any[], status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            // 3. 지도 객체 생성 및 렌더링
            if (mapRef.current) {
              const map = new kakao.maps.Map(mapRef.current, {
                center: coords,
                level: 3, // 확대 수준 (숫자가 작을수록 확대)
              });

              // 4. 해당 위치에 마커 꽂기
              new kakao.maps.Marker({
                map: map,
                position: coords,
              });
            }
          } else {
            console.log("해당 주소를 지도에서 찾을 수 없습니다:", address);
          }
        });
      });
    };

    // 5. 카카오맵 스크립트 동적 삽입
    const scriptId = "kakao-map-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      // 이미 스크립트가 있다면 바로 맵 초기화
      initMap();
    } else {
      // 스크립트가 없다면 생성해서 문서에 추가
      const script = document.createElement("script");
      script.id = scriptId;
      // [핵심] libraries=services 와 autoload=false 가 반드시 있어야 함!
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY}&libraries=services&autoload=false`;
      script.async = true;
      document.head.appendChild(script);

      // 스크립트 로드가 완료되면 맵 초기화
      script.onload = () => initMap();
    }
  }, [address]); // 주소가 바뀔 때마다 다시 실행되도록 의존성 배열에 추가

  return (
    // 지도가 그려질 도화지 (높이가 반드시 픽셀 단위로 있어야 함)
    <div 
      ref={mapRef} 
      style={{ 
        width: "100%", 
        height: "250px", 
        borderRadius: "10px", 
        background: "#1a1a1a",
        border: "1px solid #333" 
      }} 
    />
  );
}