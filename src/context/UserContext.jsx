// import React, { createContext, useContext, useState, useEffect } from "react";
// import { encrypt, decrypt } from "../hooks/use-encode";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem("token") || "");

//   useEffect(() => {

//   // 토큰만 갱신하는 메소드
//   const updateToken = (newToken) => {
//     localStorage.setItem("token", newToken);
//     setToken(newToken);
//   };
//   return (
//     <AuthContext.Provider
//       value={{
//         token,
//         email,
//         isLoggedIn,
//         isSocial,
//         login,
//         logout,
//         kakaoLogin,
//         nickname,
//         profileImage,
//         updateToken,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
//   )

// export const useAuth = () => useContext(AuthContext);
