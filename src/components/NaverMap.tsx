"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    naver: any;
  }
}

interface Props {
  address: string;
  preview?: boolean;
  dark?: boolean;
}

export default function NaverMap({ address, preview = false, dark = true }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    if (!clientId || !address || !mapRef.current) return;

    const initMap = () => {
      const naver = window.naver;
      if (!naver?.maps || !mapRef.current) return;

      naver.maps.Service.geocode({ query: address }, (status: any, response: any) => {
        if (status !== naver.maps.Service.Status.OK) return;
        const result = response.v2?.addresses?.[0];
        if (!result) return;

        const latlng = new naver.maps.LatLng(parseFloat(result.y), parseFloat(result.x));

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new naver.maps.Map(mapRef.current!, {
            center: latlng,
            zoom: 16,
            scaleControl: false,
            mapDataControl: false,
          });
        } else {
          mapInstanceRef.current.setCenter(latlng);
        }

        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new naver.maps.Marker({
          position: latlng,
          map: mapInstanceRef.current,
        });
      });
    };

    if (window.naver?.maps) {
      initMap();
      return;
    }

    const scriptId = "naver-maps-script";
    const existing = document.getElementById(scriptId);
    if (!existing) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      existing.addEventListener("load", initMap, { once: true });
    }
  }, [address]);

  const height = preview ? 90 : 200;
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  const placeholder = (text: string) => (
    <div
      style={{
        height,
        background: "#0f0f0f",
        borderRadius: 8,
        border: "1px solid #181818",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#2a2a2a",
        fontSize: 10,
        fontFamily: "monospace",
        letterSpacing: "0.14em",
      }}
    >
      {text}
    </div>
  );

  if (!clientId) return placeholder("NAVER_MAP_CLIENT_ID 미설정");
  if (!address) return placeholder("지도 미등록");

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height,
        borderRadius: 8,
        overflow: "hidden",
        filter: dark ? "grayscale(1) invert(0.88) brightness(0.78)" : undefined,
      }}
    />
  );
}
