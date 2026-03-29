"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

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
      if (!mapRef.current || !window.kakao?.maps) return;
      window.kakao.maps.load(() => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result: any[], status: string) => {
          if (status !== window.kakao.maps.services.Status.OK) return;
          const coords = new window.kakao.maps.LatLng(
            result[0].y,
            result[0].x
          );
          const map = new window.kakao.maps.Map(mapRef.current!, {
            center: coords,
            level: 4,
          });
          new window.kakao.maps.Marker({ position: coords, map });
        });
      });
    };

    if (document.getElementById(scriptId)) {
      // Script already exists
      if (window.kakao?.maps) {
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
