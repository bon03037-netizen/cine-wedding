"use client";

import { useEffect, useRef } from "react";

declare var kakao: any;

interface Props {
  address: string;
}

export default function KakaoMap({ address }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!address || loadedRef.current) return;

    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
    if (!appKey) return;

    const scriptId = "kakao-map-sdk";

      const initMap = () => {
      // 1. window.kakao 대신 (window as any).kakao 사용
      if (!mapRef.current || !(window as any).kakao?.maps) return;
      
      // 2. 여기도 (window as any) 적용
      (window as any).kakao.maps.load(() => {
        
        // 3. new 할 때도 (window as any) 적용
        const geocoder = new (window as any).kakao.maps.services.Geocoder();
        
        geocoder.addressSearch(address, (result: any[], status: string) => {
          if (status === (window as any).kakao.maps.services.Status.OK) {
            const coords = new (window as any).kakao.maps.LatLng(result[0].y, result[0].x);
            
            const map = new (window as any).kakao.maps.Map(mapRef.current, {
              center: coords,
              level: 3,
            });

            new (window as any).kakao.maps.Marker({
              map: map,
              position: coords,
            });
          }
        });
      });
    };

    if (document.getElementById(scriptId)) {
      // Script already exists
      if ((window as any).kakao?.maps) {
        initMap();
      } else {
        // Wait for it to load
        const existing = document.getElementById(scriptId) as HTMLScriptElement;
        existing.addEventListener("load", initMap);
      }
      loadedRef.current = true;
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
    loadedRef.current = true;
  }, [address]);

  return (
    <div
      style={{
        width: "100%",
        height: 250,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 12,
      }}
      ref={mapRef}
    />
  );
}
