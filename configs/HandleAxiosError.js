export const handleAxiosError = (error, onLogout, navigate) => {
  const statusMessage = error.response?.data?.statusMessage;

  if (statusMessage === "Expired_rt") {
    alert("로그인이 만료되었습니다. 다시 로그인 해주세요.");
    onLogout();
    navigate("/");
  } else if (statusMessage === "NO_LOGIN") {
    alert("로그인하지 않은 상태에서는 요청할 수 없습니다.");
    navigate("/");
  } else {
    // 그 외 에러는 콘솔에 출력 후 throw
    console.error("Unhandled Axios Error:", error);
    throw error;
  }
};
