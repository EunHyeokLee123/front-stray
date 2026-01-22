// 여기에서 axios 인스턴스를 생성하고,
// interceptor 기능을 활용하여, access token이 만료되었을 때 refresh token을 사용하여
// 새로운 access token을 발급받는 비동기 방식의 요청을 모듈화. (fetch는 interceptor 기능 x)
// axios 인스턴스는 token이 필요한 모든 요청에 활용 될 것입니다.

import axios from "axios";
import { API_BASE_URL, TOKEN } from "./host-config";

// Axios 인스턴스 생성
// 이제부터 토큰이 필요한 요청은 그냥 axios가 아니라
// 지금 만드는 이 인스턴스를 이용해 요청을 보내겠다.
//  Axios 인스턴스 생성
const axiosInstance = axios.create({
  // 개발 환경에서는 프록시를 사용하므로 baseURL을 빈 문자열로 설정
  baseURL: API_BASE_URL,
  headers: {
    // "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000, // 10초 타임아웃 설정
});

/*
Axios Interceptor는 요청 또는 응답이 처리되기 전에 실행되는 코드입니다.
요청을 수정하거나, 응답에 대한 결과 처리를 수행할 수 있습니다.
*/

// 요청용 인터셉터 선언
// 인터셉터의 use는 매개값은 콜백함수 2개를 받음
// 1은 정상 동작 로직
// 2는 과정중 에러 발생 시 실행할 로직
axiosInstance.interceptors.request.use(
  async (config) => {
    // 1️⃣ 토큰
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2️ Fingerprint
    const fingerprint = localStorage.getItem("client_fingerprint");
    if (fingerprint) {
      config.headers["X-Fingerprint"] = fingerprint;
    }

    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

// 응답용 인터셉터 설정
axiosInstance.interceptors.response.use(
  // 응답에 문제가 없다면 그대로 응답 객체 리턴

  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const message = error.response?.data;

    console.log(error);

    //  토큰 만료 or 없음 → 재발급
    if (
      status === 401 &&
      (message === "EXPIRED_TOKEN" || message === "TOKEN_REQUIRED")
    ) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      try {
        const fingerprint = localStorage.getItem("client_fingerprint");
        if (!fingerprint) {
          return Promise.reject("FINGERPRINT_MISSING");
        }

        //  토큰 재발급
        const tokenResponse = await axios.get(`${API_BASE_URL}${TOKEN}`, {
          headers: {
            "X-Fingerprint": fingerprint,
          },
        });

        const newToken = tokenResponse.data;
        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return axiosInstance(originalRequest);
      } catch (issueError) {
        return Promise.reject(issueError);
      }
    }

    //  Redis 차단
    if (status === 429) {
      alert("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      return Promise.reject(error);
    }

    //  Fingerprint 문제
    if (status === 400 && message === "FINGERPRINT_REQUIRED") {
      alert("보안 식별 정보가 누락되었습니다. 새로고침 해주세요.");
      return Promise.reject(error);
    }

    //  비정상 접근
    if (status === 403 && message === "INVALID_USER_AGENT") {
      alert("비정상적인 접근입니다.");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
