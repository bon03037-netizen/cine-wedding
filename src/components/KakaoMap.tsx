"use client";

import { useEffect, useRef, useState } from "react";

interface KakaoMapProps {
  address: string;
}

export default function KakaoMap({ address }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("1. 지도 준비 중...");

  useEffect(() => {
    if (!address) {
      setStatus("🚨 에러: 주소가 없습니다.");
      return;
    }

    const initMap = () => {
      const kakao = (window as any).kakao;
      
      // 알맹이(maps)가 로드될 때까지 안전하게 기다림
      kakao.maps.load(() => {
        if (!kakao.maps.services) {
          setStatus("🚨 에러: 주소 검색 서비스를 찾을 수 없습니다.");
          return;
        }

        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result: any[], searchStatus: any) => {
          if (searchStatus === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            if (mapRef.current) {
              const map = new kakao.maps.Map(mapRef.current, { center: coords, level: 3 });
              new kakao.maps.Marker({ map, position: coords });
              
              const ro = new ResizeObserver(() => {
                map.relayout();
                map.setCenter(coords);
              });
              ro.observe(mapRef.current);
              setStatus(""); // 🌟 성공하면 메시지 삭제!
            }
          } else {
            setStatus(`🚨 에러: 카카오가 주소를 모릅니다.\n[${address}]`);
          }
        });
      });
    };

    const scriptId = "kakao-map-script-final";
    const existingScript = document.getElementById(scriptId);

    // 🌟 핵심: 태그는 있는데 카카오 객체가 없으면? '유령'으로 간주하고 삭제!
    if (existingScript && !((window as any).kakao && (window as any).kakao.maps)) {
      existingScript.remove(); 
    }

    if ((window as any).kakao && (window as any).kakao.maps) {
      initMap();
    } else {
      setStatus("2. 카카오 스크립트 새로 불러오는 중...");
      const script = document.createElement("script");
      script.id = scriptId;
      // 🌟 보안을 위해 https://를 붙이고, 반드시 libraries=services를 포함
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY}&libraries=services&autoload=false`;
      script.async = true;
      document.head.appendChild(script);
      script.onload = initMap;
    }
  }, [address]);

  return (
    <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "10px", border: "1px solid #333", overflow: "hidden", background: "#000" }}>
      {status && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, padding: "20px", textAlign: "center", fontSize: "13px", whiteSpace: "pre-wrap" }}>
          {status}
        </div>
      )}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}