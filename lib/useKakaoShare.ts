"use client";

import { useEffect, useCallback } from "react";
import html2canvas from "html2canvas";

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
      if ((window as any).Kakao && !(window as any).Kakao.isInitialized()) {
        (window as any).Kakao.init(KAKAO_JS_KEY);
      }
    };
    document.head.appendChild(script);
  }, []);

  const shareWithCapture = useCallback(async ({
    captureId,
    title,
    description,
    buttonText = "나도 확인하기 →",
    pageUrl,
  }: {
    captureId: string;
    title: string;
    description: string;
    buttonText?: string;
    pageUrl: string;
  }) => {
    try {
      const element = document.getElementById(captureId);
      if (!element) throw new Error("캡처 요소 없음");
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FDF6EC",
      });
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      const imageFile = new File([blob], "share.png", { type: "image/png" });
      const { infos } = await (window as any).Kakao.Share.uploadImage({
        file: [imageFile],
      });

      const link = { mobileWebUrl: pageUrl, webUrl: pageUrl };

      (window as any).Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description,
          imageUrl: infos.original.url,
          imageWidth: 800,
          imageHeight: 600,
          link,                  // 이미지/제목 클릭 시 이동
        },
        buttons: [
          {
            title: buttonText,
            link,
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
