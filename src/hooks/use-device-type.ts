import { useEffect, useMemo, useState } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

// 기준은 필요하면 여기만 바꾸면 됩니다.
export const MOBILE_MAX_WIDTH = 767; // < 768
export const TABLET_MAX_WIDTH = 1023; // 768 ~ 1023

function calcDeviceType(width: number): DeviceType {
  if (width <= MOBILE_MAX_WIDTH) return "mobile";
  if (width <= TABLET_MAX_WIDTH) return "tablet";
  return "desktop";
}

/**
 * 화면 너비 기준으로 모바일/태블릿/PC를 구분합니다.
 * - mobile: 0 ~ 767px
 * - tablet: 768 ~ 1023px
 * - desktop: 1024px~
 */
export function useDeviceType() {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === "undefined") return TABLET_MAX_WIDTH + 1;
    return window.innerWidth;
  });

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const deviceType = useMemo(() => calcDeviceType(width), [width]);

  return {
    deviceType,
    width,
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet",
    isDesktop: deviceType === "desktop",
  };
}
