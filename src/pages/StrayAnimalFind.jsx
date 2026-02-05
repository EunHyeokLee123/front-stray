import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../configs/axios-config.js";
import { PET } from "../../configs/host-config.js";
import "./StrayAnimalList.css";
import "./StrayAnimalFind.css";
import { useSEO } from "../hooks/useSEO.jsx";

const StrayAnimalFind = () => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [modalMessage, setModalMessage] = useState(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [fade, setFade] = useState(false);
  const [imgError, setImgError] = useState(false);

  const transCd = (sexCd) => {
    if (sexCd === "M") return "수컷";
    if (sexCd === "F") return "암컷";
    return "미상";
  };

  const transNe = (neuterYn) => {
    if (neuterYn === "Y") return "중성화";
    if (neuterYn === "N") return "미중성화";
    return "미상";
  };

  const isDigitsOnly = (str) => /^\d+$/.test(String(str).trim());

  const handleSearch = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (!isDigitsOnly(trimmed)) {
      setModalMessage("유효하지 않은 입력값입니다.");
      return;
    }

    setLoading(true);
    setDetailData(null);
    setModalMessage(null);
    try {
      const res = await axiosInstance.post(`${PET}/find`, { rfid: trimmed });
      console.log(res);

      const data = res.data?.result ?? res.data;

      if (res.data.result == null) {
        setModalMessage("해당 등록번호의 유기동물 정보가 존재하지 않습니다.");
        return;
      }
      setDetailData(data);
    } catch {
      setModalMessage("조회에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [inputValue]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const images = detailData
    ? [detailData.popfile1, detailData.popfile2].filter(Boolean)
    : [];
  if (images.length === 0 && detailData) images.push("/logo.png");

  const seo = {
    title: "유기동물 찾기 | 등록번호 조회 | 냥몽",
    description:
      "유기동물 등록번호(칩 번호)로 유기동물 정보를 조회하세요. 냥몽에서 반려동물 정보를 확인할 수 있습니다.",
    image: "/seo/og-main-1200.webp",
    canonical: "https://nyangmong.com/stray/find",
  };
  useSEO(seo);

  return (
    <div className="stray-animal-list-page">
      <div className="stray-animal-container">
        <div className="detail-page stray-find-page">
          <div className="detail-page-header">
            <h1 className="detail-title">유기동물 찾기</h1>
          </div>
          <p className="detail-sub-title">
            등록칩 번호로 반려동물의 현재 보호 정보를 확인해보세요.
          </p>

          {/* 검색 폼 */}
          <div className="stray-find-form">
            <p className="stray-find-desc">
              등록번호(칩 번호)를 입력하세요. 숫자만 입력 가능합니다.
            </p>
            <div className="stray-find-row">
              <input
                type="text"
                className="stray-find-input"
                placeholder="등록번호 입력"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                aria-label="등록번호 입력"
              />
              <button
                type="button"
                className="stray-find-btn"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? "조회 중..." : "찾기"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="detail-loading">
              <div className="loader" />
              <p className="loading-text">조회 중...</p>
            </div>
          )}

          {/* 조회 결과: 상세 표시 (StrayAnimalDetail과 동일) */}
          {detailData && !loading && (
            <div className="detail-layout">
              <div className="detail-left">
                <div className="detail-slider">
                  <button
                    type="button"
                    className="slider-btn left"
                    onClick={() => {
                      setFade(true);
                      setTimeout(() => {
                        setCurrentImage((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        );
                        setFade(false);
                      }, 200);
                    }}
                  >
                    ‹
                  </button>
                  {!imgError ? (
                    <img
                      src={images[currentImage]}
                      alt={detailData.kindNm}
                      className={`slider-image ${fade ? "fade" : ""}`}
                      onError={() => setImgError(true)}
                      onLoad={() => setImgError(false)}
                    />
                  ) : (
                    <div className="image-error-box">
                      <span>😿</span>
                      <p>이미지 로드에 실패하였습니다.</p>
                    </div>
                  )}
                  <button
                    type="button"
                    className="slider-btn right"
                    onClick={() => {
                      setFade(true);
                      setTimeout(() => {
                        setCurrentImage((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        );
                        setFade(false);
                      }, 200);
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="detail-right">
                <p className="detail-seo-text">
                  {detailData.happenPlace || "해당 지역"}에서 구조된{" "}
                  {detailData.kindNm || "유기동물"}입니다. 현재{" "}
                  {detailData.careNm || "보호소"}에서 새로운 만남을 기다리고
                  있습니다.
                </p>
                <button
                  type="button"
                  className="detail-open-btn"
                  onClick={() => setInfoModalOpen(true)}
                >
                  📋 상세 정보 보기
                </button>
              </div>
            </div>
          )}

          {/* 알림 모달 (유효하지 않은 입력 / 없음 / 에러) */}
          {modalMessage && (
            <div
              className="stray-find-alert-overlay"
              onClick={() => setModalMessage(null)}
              onKeyDown={(e) => e.key === "Escape" && setModalMessage(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="find-alert-title"
            >
              <div
                className="stray-find-alert"
                onClick={(e) => e.stopPropagation()}
              >
                <p id="find-alert-title" className="stray-find-alert-text">
                  {modalMessage}
                </p>
                <button
                  type="button"
                  className="stray-find-alert-btn"
                  onClick={() => setModalMessage(null)}
                >
                  확인
                </button>
              </div>
            </div>
          )}

          {/* 상세정보 모달 (StrayAnimalDetail과 동일) */}
          {infoModalOpen && detailData && (
            <div className="detail-modal-overlay">
              <div className="detail-modal">
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setInfoModalOpen(false)}
                >
                  ✕
                </button>
                <h2>상세 정보</h2>
                <div className="modal-grid">
                  {[
                    ["품종", detailData.kindNm],
                    ["털색", detailData.colorCd],
                    ["나이", detailData.age],
                    ["체중", detailData.weight],
                    ["성별", transCd(detailData.sexCd)],
                    ["중성화", transNe(detailData.neuterYn)],
                    ["발생일", detailData.happenDt],
                    ["장소", detailData.happenPlace],
                    detailData.rfidCd && ["내장칩 번호", detailData.rfidCd],
                    ["보호소", detailData.careNm],
                    ["전화", detailData.careTel],
                    ["보호소 주소", detailData.careAddr],
                    ["특이사항", detailData.specialMark],
                  ]
                    .filter(Boolean)
                    .map(([label, value], i) => (
                      <div key={i} className="modal-row">
                        <span>{label}</span>
                        <span>{value || "-"}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrayAnimalFind;
