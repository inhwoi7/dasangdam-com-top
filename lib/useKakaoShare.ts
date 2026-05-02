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
    captureId: _captureId,
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
    imageUrl?: string;
  }) => {
    try {
      const kakao = (window as any).Kakao;
      if (!kakao) throw new Error("카카오 SDK 미로드");
      if (!kakao.isInitialized()) kakao.init(KAKAO_JS_KEY);

      const thumbnail =
        imageUrl ||
        (typeof window !== "undefined"
          ? (document.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content
          : undefined) ||
        "https://dasangdam.com/og-image.png";

      // description 안에 URL을 직접 포함 → 카카오 카드에 노출됨
      const descriptionWithUrl = `${description}\n👉 dasangdam.com`;

      kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description: descriptionWithUrl,
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
