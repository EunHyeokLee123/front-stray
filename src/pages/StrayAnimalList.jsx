import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../configs/axios-config.js";
import "./StrayAnimalList.css";
import { API_BASE_URL, PET } from "../../configs/host-config.js";

const StrayAnimalList = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 6;

  // 필터 상태
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedCategory, setSelectedCategory] = useState("개");

  const regions = [
    "전체",
    "서울",
    "부산",
    "대구",
    "인천",
    "광주",
    "대전",
    "울산",
    "경기",
    "강원",
    "충북",
    "충남",
    "세종",
    "전북",
    "전남",
    "경북",
    "경남",
    "제주",
  ];

  const categories = ["개", "고양이", "기타"];

  const changeRegion = (region) => {
    if (region === "서울") {
      return "서울특별시";
    } else if (region === "부산") {
      return "부산광역시";
    } else if (region === "대구") {
      return "대구광역시";
    } else if (region === "인천") {
      return "인천광역시";
    } else if (region === "광주") {
      return "광주광역시";
    } else if (region === "대전") {
      return "대전광역시";
    } else if (region === "울산") {
      return "울산광역시";
    } else if (region === "경기") {
      return "경기도";
    } else if (region === "강원") {
      return "강원도";
    } else if (region === "충북") {
      return "충청북도";
    } else if (region === "충남") {
      return "충청남도";
    } else if (region === "세종") {
      return "세종특별자치시";
    } else if (region === "전북") {
      return "전라북도";
    } else if (region === "전남") {
      return "전라남도";
    } else if (region === "경북") {
      return "경상북도";
    } else if (region === "경남") {
      return "경상남도";
    } else if (region === "제주") {
      return "제주도";
    } else if (region === "전체") {
      return "전체";
    }
    return "";
  };

  // 유기동물 목록 조회 함수
  const fetchStrayAnimals = async (page = 0) => {
    setLoading(true);
    setError(null);

    try {
      // 지역 필터링
      const addressFilter =
        selectedRegion === "전체" ? "전체" : changeRegion(selectedRegion);

      // 축종 필터링
      const kindMap = {
        개: "개",
        고양이: "고양이",
        기타: "기타",
      };
      const kindFilter = kindMap[selectedCategory] || "개";

      // TODO: 실제 API 엔드포인트로 변경 필요
      const response = await axiosInstance.post(`${PET}/search/${page}`, {
        region: addressFilter,
        kind: kindFilter,
      });

      const data = response.data;

      // API 응답 형식에 맞게 데이터 추출
      const resultData = data.result || data;
      setAnimals(resultData.content || resultData.data || resultData || []);

      if (resultData.pageable) {
        setCurrentPage(resultData.pageable.pageNumber);
      }
      setTotalPages(resultData.totalPages || 0);
      setTotalElements(resultData.totalElements || 0);
    } catch (err) {
      console.error("유기동물 목록 조회 실패:", err);
      setError("유기동물 목록을 불러오는데 실패했습니다.");
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 변경 함수
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchStrayAnimals(page);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchStrayAnimals(0);
  }, []);

  // 필터 변경 시 데이터 다시 로드
  useEffect(() => {
    setCurrentPage(0);
    fetchStrayAnimals(0);
  }, [selectedRegion, selectedCategory]);

  // 데이터 변환 함수
  const transformAnimalData = (animal) => {
    return {
      id: animal.desertionNo || animal.id,
      title: animal.kindNm || animal.kindCd || "유기동물",
      image:
        animal.popfile1 || animal.popfile || animal.filename || "/logo.png",
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
        ? `${animal.happenDt.slice(0, 4)}-${animal.happenDt.slice(
            4,
            6
          )}-${animal.happenDt.slice(6, 8)}`
        : "날짜 정보 없음",
      kindNm: animal.kindNm,
      orgNm: animal.orgNm,
      careTel: animal.careTel,
      noticeNo: animal.noticeNo,
      desertionNo: animal.desertionNo,
      happenPlace: animal.happenPlace,
      specialMark: animal.specialMark,
    };
  };

  const transformedAnimals = animals.map(transformAnimalData);

  // 상세 페이지로 이동
  const handleDetailClick = (desertionNo) => {
    if (!desertionNo) return;
    navigate(`/stray/detail/${desertionNo}`);
  };

  return (
    <div className="stray-animal-list-page">
      <div className="stray-animal-container">
        <>
          <div className="page-header">
            <h1 className="page-title">유기동물 정보</h1>
            <p className="page-subtitle">새로운 가족을 기다리는 아이들</p>
          </div>

          {/* 필터 영역 */}
          <div className="filter-section">
            <div className="filter-group">
              <label className="filter-label">지역</label>
              <div className="filter-buttons">
                {regions.map((region) => (
                  <button
                    key={region}
                    className={`filter-button ${
                      selectedRegion === region ? "active" : ""
                    }`}
                    onClick={() => setSelectedRegion(region)}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">축종</label>
              <div className="filter-buttons">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`filter-button ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="loading-container">
              <div className="loader"></div>
              <p className="loading-text">유기동물 정보를 불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && !loading && (
            <div className="error-container">
              <p className="error-text">{error}</p>
              <button
                className="retry-button"
                onClick={() => fetchStrayAnimals(currentPage)}
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 데이터가 없을 때 */}
          {!loading && !error && transformedAnimals.length === 0 && (
            <div className="empty-container">
              <p className="empty-text">
                검색 조건에 맞는 유기동물이 없습니다.
              </p>
              <button
                className="reset-button"
                onClick={() => {
                  setSelectedRegion("전체");
                  setSelectedCategory("개");
                  setCurrentPage(0);
                }}
              >
                필터 초기화
              </button>
            </div>
          )}

          {/* 동물 카드 그리드 */}
          {!loading && !error && transformedAnimals.length > 0 && (
            <>
              <div className="info-bar">
                <p className="info-text">
                  총 {totalElements}개 중 {currentPage * pageSize + 1}-
                  {Math.min((currentPage + 1) * pageSize, totalElements)}개
                </p>
              </div>

              <div className="animal-grid">
                {transformedAnimals.map((animal) => (
                  <div key={animal.id} className="animal-card">
                    <div className="card-image-container">
                      <img
                        src={animal.image}
                        alt={animal.title}
                        className="card-image"
                        onError={(e) => {
                          e.target.src = "/logo.png";
                        }}
                        onClick={() => handleDetailClick(animal.desertionNo)}
                      />
                    </div>
                    <div className="card-content">
                      <h3
                        className="card-title"
                        onClick={() => handleDetailClick(animal.desertionNo)}
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
                          <span className="info-value">
                            {animal.rescueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이징 */}
              {totalPages > 1 &&
                (() => {
                  const maxVisiblePages = 7;
                  const startPage = Math.max(
                    0,
                    currentPage - Math.floor(maxVisiblePages / 2)
                  );
                  const endPage = Math.min(
                    totalPages - 1,
                    startPage + maxVisiblePages - 1
                  );

                  return (
                    <div className="pagination">
                      <button
                        className="pagination-button"
                        onClick={() =>
                          handlePageChange(Math.max(0, currentPage - 1))
                        }
                        disabled={currentPage === 0}
                      >
                        이전
                      </button>

                      <div className="pagination-numbers">
                        {/* 첫 페이지가 보이지 않을 때만 표시 */}
                        {startPage > 0 && (
                          <>
                            <button
                              className="pagination-number"
                              onClick={() => handlePageChange(0)}
                            >
                              1
                            </button>
                            {startPage > 1 && (
                              <span className="pagination-ellipsis">...</span>
                            )}
                          </>
                        )}

                        {/* 현재 페이지 범위 */}
                        {Array.from(
                          { length: endPage - startPage + 1 },
                          (_, i) => startPage + i
                        ).map((page) => (
                          <button
                            key={page}
                            className={`pagination-number ${
                              currentPage === page ? "active" : ""
                            }`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page + 1}
                          </button>
                        ))}

                        {/* 마지막 페이지가 보이지 않을 때만 표시 */}
                        {endPage < totalPages - 1 && (
                          <>
                            {endPage < totalPages - 2 && (
                              <span className="pagination-ellipsis">...</span>
                            )}
                            <button
                              className="pagination-number"
                              onClick={() => handlePageChange(totalPages - 1)}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        className="pagination-button"
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages - 1, currentPage + 1)
                          )
                        }
                        disabled={currentPage === totalPages - 1}
                      >
                        다음
                      </button>
                    </div>
                  );
                })()}
            </>
          )}
        </>
      </div>
    </div>
  );
};

export default StrayAnimalList;
