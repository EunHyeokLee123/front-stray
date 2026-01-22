import React, { createContext, useContext, useState, useEffect } from "react";
import { encrypt, decrypt } from "../hooks/use-encode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState(""); // 초기값만 설정
  const [nickname, setNickname] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isSocial, setIsSocial] = useState(!!localStorage.getItem("social"));

  useEffect(() => {
    const loadDecryptedUser = async () => {
      const encryptedEmail = localStorage.getItem("email");
      const encryptedNick = localStorage.getItem("nickname");
      const encryptedImage = localStorage.getItem("profileImage");

      if (encryptedEmail) {
        try {
          const decryptedEmail = await decrypt(encryptedEmail);
          setEmail(decryptedEmail);
        } catch (e) {
          console.error("email decrypt error:", e);
        }
      }

      if (encryptedNick) {
        try {
          const decryptedNick = await decrypt(encryptedNick);
          setNickname(decryptedNick);
        } catch (e) {
          console.error("nickname decrypt error:", e);
        }
      }

      if (encryptedImage) {
        try {
          const decryptedImage = await decrypt(encryptedImage);
          setProfileImage(decryptedImage);
        } catch (e) {
          console.error("profileImage decrypt error:", e);
        }
      }
    };

    loadDecryptedUser();
  }, []);

  // 토큰만 갱신하는 메소드
  const updateToken = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // window 커스텀 이벤트 리스너 등록
  useEffect(() => {
    const handleTokenRefresh = (e) => {
      updateToken(e.detail.token);
    };
    window.addEventListener("tokenRefreshed", handleTokenRefresh);
    return () =>
      window.removeEventListener("tokenRefreshed", handleTokenRefresh);
  }, []);

  const login = async (token, email, nickname, profileImage) => {
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("email", await encrypt(email));
      localStorage.setItem("nickname", await encrypt(nickname));
      localStorage.setItem("profileImage", await encrypt(profileImage));

      setToken(token);
      setEmail(email);
      setNickname(nickname);
      setProfileImage(profileImage);
      setIsLoggedIn(true);
      setIsSocial(false);
    } catch (e) {
      console.error("Encryption error during login:", e);
    }
  };

  const kakaoLogin = async (
    token,
    email,
    nickname,
    profileImage,
    socialProvider
  ) => {
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("email", await encrypt(email));
      localStorage.setItem("nickname", await encrypt(nickname));
      localStorage.setItem("profileImage", await encrypt(profileImage));
      localStorage.setItem("social", socialProvider);

      setToken(token);
      setEmail(email);
      setNickname(nickname);
      setProfileImage(profileImage);
      setIsSocial(true);
      setIsLoggedIn(true);
    } catch (e) {
      console.error("Encryption error during login:", e);
    }
  };

  const logout = () => {
    // 현재 사용자의 알림 데이터 삭제 (email 상태 사용)
    if (email) {
      localStorage.removeItem(`notifications_${email}`);
      console.log("🗑️ 로그아웃 시 알림 데이터 삭제 완료:", email);
    }

    // 기타 사용자 데이터 삭제
    localStorage.removeItem("token");
    localStorage.removeItem("nickname");
    localStorage.removeItem("profileImage");
    if (isSocial) {
      localStorage.removeItem("social");
      setIsSocial(false);
    }

    // email은 마지막에 삭제 (알림 데이터 삭제 후)
    localStorage.removeItem("email");

    // 상태 초기화
    setToken("");
    setEmail("");
    setNickname(null);
    setProfileImage(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        isLoggedIn,
        isSocial,
        login,
        logout,
        kakaoLogin,
        nickname,
        profileImage,
        updateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
