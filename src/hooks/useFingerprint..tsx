import { useEffect, useState } from "react";

/**
 * 로그인 없는 서비스용 Fingerprint Hook
 * - 개인정보 민감 요소 제거
 * - 동일 환경에서 안정적
 * - localStorage 캐싱
 */
export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function generateFingerprint() {
      try {
        // 1️⃣ 이미 생성된 fingerprint 재사용
        const cached = localStorage.getItem("client_fingerprint");
        if (cached) {
          if (mounted) {
            setFingerprint(cached);
            setLoading(false);
          }
          return;
        }

        // 2️⃣ 환경 정보 수집 (안전한 항목만)
        const data = {
          ua: navigator.userAgent,
          lang: navigator.language,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          platform: navigator.platform,
          screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        };

        // 3️⃣ 해시 생성
        const raw = JSON.stringify(data);
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest(
          "SHA-256",
          encoder.encode(raw)
        );

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // 4️⃣ 캐싱
        localStorage.setItem("client_fingerprint", hashHex);

        if (mounted) {
          setFingerprint(hashHex);
          setLoading(false);
        }
      } catch (e) {
        console.error("Fingerprint 생성 실패", e);
        if (mounted) {
          setFingerprint(null);
          setLoading(false);
        }
      }
    }

    generateFingerprint();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    fingerprint,
    loading,
  };
}
