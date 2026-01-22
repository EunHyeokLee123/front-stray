import { Cookies } from "react-cookie";

// 배포 이후에 localStorage 대신 쿠키를 사용할 것!

const cookies = new Cookies();

export const setCookie = (name, value, options) => {
  return cookies.set(name, value, { ...options });
};

export const getCookie = (name) => {
  return cookies.get(name);
};

export const removeCookie = (name) => {
  return cookies.remove(name, { path: "/" });
};
