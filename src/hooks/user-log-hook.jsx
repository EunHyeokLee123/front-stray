// utils/analyticsUtils.js
import { analytics, setUserId, logEvent } from "../../configs/firebase-config";

// 1) 사용자 구분용 UUID 관리리리자로 끝나는말은
export function getOrCreateUserUUID() {
  const key = "anonymous_user_uuid";
  let uuid = localStorage.getItem(key);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(key, uuid);
  }
  return uuid;
}

// 2) 모바일 / PC 구분
export function getDeviceType() {
  const ua = navigator.userAgent;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? "mobile" : "desktop";
}

// 3) 로그인 여부 (예시, 실제 구현에 맞게 교체)
export function isUserLoggedIn() {
  // 예: 토큰 존재 여부 체크
  return Boolean(localStorage.getItem("token"));
}

// 4) 공통 속성 자동 추가
export function getCommonEventParams() {
  return {
    user_uuid: getOrCreateUserUUID(),
    device_type: getDeviceType(),
    logged_in: isUserLoggedIn(),
    session_id:
      sessionStorage.getItem("session_id") || generateAndStoreSessionId(),
  };
}

// 세션 아이디 생성 함수 (세션 스토리지에 저장)
function generateAndStoreSessionId() {
  const id = crypto.randomUUID();
  sessionStorage.setItem("session_id", id);
  return id;
}

// 5) 이벤트 로그 래퍼 함수
export function logUserEvent(eventName, eventParams = {}) {
  const commonParams = getCommonEventParams();
  logEvent(analytics, eventName, { ...commonParams, ...eventParams });
}
