import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../configs/axios-config.js";
import { PET } from "../../configs/host-config.js";
import "./StrayAnimalList.css";
import {
  getStrayFavorites,
  areAllDigits,
  clearAllStrayFavorites,
  removeStrayFavorite,
} from "../utils/stray-favor.js";
import { useDeviceType } from "../hooks/use-device-type";
import { useSEO } from "../hooks/useSEO.jsx";

const transformAnimalData = (animal) => ({
  id: animal.desertionNo || animal.id,
  title: animal.kindNm || animal.kindCd || "유기동물",
  image: animal.popfile1 || animal.popfile || animal.filename || "/logo.png",
  location: animal.careAddr || animal.orgNm || "위치 정보 없음",
  age: animal.age || "나이 정보 없음",
  gender:
    animal.sexCd === "M"
      ? "수컷"
      : animal.sexCd === "F"
      ? "암컷"
      : animal.sexCd === "Q"
      ? "미상"
      : "성별 정보 없음",
  rescueDate: animal.happenDt
    ? `${String(animal.happenDt).slice(0, 4)}-${String(animal.happenDt).slice(
        4,
        6
      )}-${String(animal.happenDt).slice(6, 8)}`
    : "날짜 정보 없음",
  desertionNo: animal.desertionNo,
});

const StrayAnimalFavor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState([]);
  const [invalidIds, setInvalidIds] = useState(false);
  const { deviceType } = useDeviceType();
  const isSmartphone = deviceType === "mobile";

  useEffect(() => {
    const ids = getStrayFavorites();
    if (!areAllDigits(ids)) {
      setInvalidIds(true);
      setLoading(false);
      return;
    }
    if (ids.length === 0) {
      setAnimals([]);
      setLoading(false);
      return;
    }
    setInvalidIds(false);
    const fetchFavor = async () => {
      setLoading(true);
      try {
        // 배열을 역순으로 정렬
        const reversedIds = [...ids].reverse();
        // List<String> 형태: 배열로 전송 (필요 시 body를 { desertionNos: ids } 로 변경 가능)
        const res = await axiosInstance.post(`${PET}/favor`, {
          ids: reversedIds,
        });
        const data = res.data?.result ?? res.data;
        const list = Array.isArray(data)
          ? data
          : data?.content ?? data?.data ?? [];
        setAnimals(list);
      } catch {
        setAnimals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavor();
  }, []);

  const transformedAnimals = animals.map(transformAnimalData);

  const seo = {
    title: "즐겨찾기 유기동물 | 냥몽",
    description: "저장한 유기동물 즐겨찾기 목록을 확인하세요.",
    image: "/seo/og-main-1200.webp",
    canonical: "https://nyangmong.com/stray/favor",
  };
  useSEO(seo);

  return (
    <div className="stray-animal-list-page">
      <div className="stray-animal-container">
        <div className="detail-page" style={{ marginBottom: "1.5rem" }}>
          <div className="detail-page-header">
            <div className="detail-page-header-left">
              {!isSmartphone ? (
                <button
                  type="button"
                  className="back-button"
                  onClick={() =>
                    navigate("/stray/list?region=전체&category=개&page=0")
                  }
                >
                  ← 목록
                </button>
              ) : (
                <button
                  type="button"
                  className="back-button"
                  onClick={() =>
                    navigate("/stray/list?region=전체&category=개&page=0")
                  }
                >
                  ←
                </button>
              )}
              <h1 className="detail-title">관심동물</h1>
            </div>
            {!loading && !invalidIds && transformedAnimals.length > 0 && (
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  if (confirm("정말로 모든 즐겨찾기를 삭제하시겠습니까?")) {
                    clearAllStrayFavorites();
                    setAnimals([]);
                  }
                }}
                title="모든 즐겨찾기 삭제"
              >
                전체 삭제
              </button>
            )}
          </div>
          <p
            className="seo-desc"
            style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}
          >
            관심을 보인 유기동물 목록입니다. (최대 6마리)
          </p>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loader" />
            <p className="loading-text">관심동물 목록을 불러오는 중...</p>
          </div>
        )}

        {invalidIds && !loading && (
          <div className="empty-container">
            <p className="empty-text">
              저장된 등록번호 형식이 올바르지 않아 목록을 불러올 수 없습니다.
            </p>
            <button
              type="button"
              className="reset-button"
              onClick={() => navigate("/stray/list")}
            >
              유기동물 목록으로
            </button>
          </div>
        )}

        {!loading && !invalidIds && transformedAnimals.length === 0 && (
          <div className="empty-container">
            <p className="empty-text">관심동물에 저장된 유기동물이 없습니다.</p>
            <button
              type="button"
              className="reset-button"
              onClick={() => navigate("/stray/list")}
            >
              유기동물 목록으로
            </button>
          </div>
        )}

        {!loading && !invalidIds && transformedAnimals.length > 0 && (
          <div className="animal-grid">
            {transformedAnimals.map((animal) => (
              <div key={animal.id} className="animal-card">
                <div className="card-image-container">
                  <span
                    className="card-favor-badge"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeStrayFavorite(animal.desertionNo);
                      setAnimals(
                        animals.filter(
                          (a) => a.desertionNo !== animal.desertionNo
                        )
                      );
                    }}
                    style={{ cursor: "pointer" }}
                    title="즐겨찾기 제거"
                  >
                    ★
                  </span>
                  <img
                    src={animal.image}
                    alt={animal.title}
                    className="card-image"
                    onError={(e) => {
                      e.target.src = "/logo.png";
                    }}
                    onClick={(e) => {
                      // 배지가 클릭된 경우는 제외
                      if (
                        e.target.className !== "card-favor-badge" &&
                        !e.target.closest(".card-favor-badge")
                      ) {
                        navigate(
                          `/stray/detail/${animal.desertionNo}?region=전체&category=개&page=0&from=favor`
                        );
                      }
                    }}
                  />
                </div>
                <div className="card-content">
                  <h3
                    className="card-title"
                    onClick={() =>
                      navigate(
                        `/stray/detail/${animal.desertionNo}?region=전체&category=개&page=0&from=favor`
                      )
                    }
                  >
                    {animal.title}
                  </h3>
                  <div className="card-info">
                    <div className="info-item">
                      <span className="info-label">위치:</span>
                      <span className="info-value">{animal.location}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">나이:</span>
                      <span className="info-value">{animal.age}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">성별:</span>
                      <span className="info-value">{animal.gender}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">구조일:</span>
                      <span className="info-value">{animal.rescueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrayAnimalFavor;
