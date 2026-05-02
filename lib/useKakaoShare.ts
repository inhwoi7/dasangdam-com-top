"use client";

import { useEffect, useCallback } from "react";

const KAKAO_JS_KEY = "60eb58888334fc1d1771a472c2730fb0";

export function useKakaoShare() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("kakao-sdk")) return;
    const script = document.createElement("script");
    script.id = "kakao-sdk";
    script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
    script.async = true;
    script.onload = () => {
      const kakao = (window as any).Kakao;
      if (kakao && !kakao.isInitialized()) {
        kakao.init(KAKAO_JS_KEY);
      }
    };
    document.head.appendChild(script);
  }, []);

  const shareWithCapture = useCallback(async ({
    captureId: _captureId, // 비즈 앱 전환 후 이미지 캡처 복원 시 사용
    title,
    description,
    buttonText = "나도 확인하기 →",
    pageUrl,
    imageUrl,
  }: {
    captureId: string;
    title: string;
    description: string;
    buttonText?: string;
    pageUrl: string;
    imageUrl?: string; // 서비스별 커스텀 썸네일 (선택)
  }) => {
    try {
      const kakao = (window as any).Kakao;
      if (!kakao) throw new Error("카카오 SDK 미로드");
      if (!kakao.isInitialized()) kakao.init(KAKAO_JS_KEY);

      // 이미지 우선순위: 인자 imageUrl → 페이지 OG 이미지 → 기본값
      const thumbnail =
        imageUrl ||
        (typeof window !== "undefined"
          ? (document.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content
          : undefined) ||
        "https://dasangdam.com/og-image.png";

      kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description,
          imageUrl: thumbnail,
          link: {
            mobileWebUrl: pageUrl,
            webUrl: pageUrl,
          },
        },
        buttons: [
          {
            title: buttonText,
            link: {
              mobileWebUrl: pageUrl,
              webUrl: pageUrl,
            },
          },
        ],
      });
    } catch (err) {
      console.error("카카오 공유 실패:", err);
      alert("공유에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  }, []);

  return { shareWithCapture };
}
