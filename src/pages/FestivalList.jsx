import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../configs/axios-config.js";
import "./FestivalList.css";
import { FESTIVAL } from "../../configs/host-config.js";
import { logUserEvent } from "../hooks/user-log-hook.jsx";
import { useSEO } from "../hooks/useSEO.jsx";
import { useDeviceType } from "../hooks/use-device-type";

const getInitialPage = () => {
  const savedPage = sessionStorage.getItem("festival_page");
  sessionStorage.removeItem("stray_page");
  sessionStorage.removeItem("stray_region");
  sessionStorage.removeItem("stray_category");
  return savedPage !== null ? Number(savedPage) : 0;
};

const FestivalList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRegion =
    searchParams.get("region") ||
    sessionStorage.getItem("festival_region") ||
    "전국";
  const initialPage = (() => {
    const p = searchParams.get("page");
    if (p !== null && p !== "") {
      const num = Number(p);
      if (!Number.isNaN(num) && num >= 0) return num;
    }
    return getInitialPage();
  })();
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [_totalElements, setTotalElements] = useState(0);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const { deviceType } = useDeviceType();
  const isDesktop = deviceType === "desktop";
  const isMobile = deviceType === "mobile";

  // 지역 목록: null/빈 문자열 제외, 전국 + API region
  const regionOptions = [
    "전국",
    ...regions.filter((r) => r != null && r !== ""),
  ];

  useEffect(() => {
    axiosInstance
      .get(`${FESTIVAL}/region`)
      .then((res) => {
        const list = res.data?.result ?? res.data;
        const arr = Array.isArray(list) ? list : list ? [list] : [];
        setRegions(
          arr.filter((r) => typeof r === "string" && r != null && r !== ""),
        );
      })
      .catch(() => setRegions([]));
  }, []);

  // 행사 목록 조회 함수 (전국: /list/{page}, 지역: /region/list/{region}/{page})
  const fetchFestivals = async (page = 0) => {
    setLoading(true);
    setError(null);

    try {
      const url =
        selectedRegion === "전국"
          ? `${FESTIVAL}/list/${page}`
          : `${FESTIVAL}/region/list/${encodeURIComponent(
              selectedRegion,
            )}/${page}`;
      const response = await axiosInstance.get(url);

      const data = response.data;

      // API 응답 형식에 맞게 데이터 추출
      const resultData = data.result || data;
      setFestivals(resultData.content || resultData.data || resultData || []);

      if (resultData.pageable) {
        setCurrentPage(resultData.pageable.pageNumber);
      }
      setTotalPages(resultData.totalPages || 0);
      setTotalElements(resultData.totalElements || 0);
    } catch {
      setError("행사 정보를 불러오는데 실패했습니다.");
      setFestivals([]);
    } finally {
      setLoading(false);
    }
  };

  // 행사 목록 SEO 생성
  const getFestivalListSEO = () => {
    const pageText = currentPage > 0 ? ` - ${currentPage + 1}페이지` : "";

    return {
      title: `반려동물 박람회·펫페어 일정${pageText} | 냥몽`,

      description:
        "국내 반려동물 박람회, 펫페어, 반려동물 행사 일정을 한눈에 확인하세요. 위치, 일정, 참가 정보까지 제공하는 냥몽입니다.",

      image: "/seo/og-main-1200.webp",

      canonical: `https://nyangmong.com/festival/list`,
    };
  };

  // 페이지 변경 함수
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    sessionStorage.setItem("festival_page", currentPage);
  }, [currentPage]);

  useEffect(() => {
    sessionStorage.setItem("festival_region", selectedRegion);
  }, [selectedRegion]);

  useEffect(() => {
    fetchFestivals(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedRegion]);

  const handleRegionClick = (region) => {
    setSelectedRegion(region);
    setCurrentPage(0);
  };

  useEffect(() => {
    logUserEvent("page_view", { page_name: "festival" });
  }, []);

  // SEO용: URL에 region, page 쿼리 파라미터 반영 (기능적으로는 미사용)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("region", selectedRegion);
    params.set("page", String(currentPage));
    const search = params.toString();
    const url = `${window.location.pathname}?${search}`;
    window.history.replaceState(null, "", url);
  }, [selectedRegion, currentPage]);

  // 상세 페이지로 이동
  const handleDetailClick = (festivalId) => {
    if (!festivalId) return;
    navigate(`/festival/detail/${festivalId}`);
  };

  const seo = getFestivalListSEO();
  useSEO(seo);

  return (
    <div className="festival-list-page">
      <div className="festival-container">
        <div className="page-header">
          <h1 className="page-title">
            2026 반려동물 박람회·펫페어 일정 총정리
          </h1>

          <p className="page-subtitle">
            {selectedRegion} 반려동물 행사 정보를 한눈에 확인하세요.
          </p>

          {/* ✅ SEO용 설명 영역 */}
          {isDesktop && (
            <div className="seo-description">
              <p>
                냥몽에서는 {selectedRegion}에서 열리는 반려동물 박람회, 펫페어,
                반려동물 행사 정보를 최신 일정 기준으로 제공합니다.
              </p>

              <p>
                {selectedRegion} 주요 지역의 반려동물 행사 일정과 위치, 참가
                정보를 확인하고 반려동물과 함께 특별한 시간을 보내보세요.
              </p>
            </div>
          )}
        </div>

        {/* 지역 선택: 버튼 1개 → 클릭 시 목록(모달)에서 선택 */}
        <div className="festival-region-filter">
          <span className="festival-region-label">지역: </span>
          <button
            type="button"
            className="festival-region-picker-button"
            onClick={() => setRegionModalOpen(true)}
          >
            {selectedRegion}
          </button>

          {regionModalOpen && (
            <div
              className="festival-region-modal-overlay"
              onClick={() => setRegionModalOpen(false)}
            >
              <div
                className="festival-region-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="festival-region-modal-close"
                  aria-label="지역 선택 닫기"
                  onClick={() => setRegionModalOpen(false)}
                >
                  ×
                </button>
                <h3 className="festival-region-modal-title">지역 선택</h3>
                <div className="festival-region-modal-list">
                  {regionOptions.map((region) => (
                    <button
                      key={region}
                      type="button"
                      className={`festival-region-button ${
                        selectedRegion === region ? "active" : ""
                      }`}
                      onClick={() => {
                        handleRegionClick(region);
                        setRegionModalOpen(false);
                      }}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="loading-container">
            <div className="loader"></div>
            <p className="loading-text">행사 정보를 불러오는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !loading && (
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button
              className="retry-button"
              onClick={() => fetchFestivals(currentPage)}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 데이터가 없을 때 */}
        {!loading && !error && festivals.length === 0 && (
          <div className="empty-container">
            <p className="empty-text">등록된 행사가 없습니다.</p>
          </div>
        )}

        {/* 행사 목록 */}
        {!loading && !error && festivals.length > 0 && (
          <>
            <div className="festival-list">
              {festivals.map((festival, index) => (
                <div
                  key={festival.festivalId || index}
                  className="festival-card"
                  onClick={() => handleDetailClick(festival.festivalId)}
                >
                  <div className="festival-card-content">
                    <h3 className="festival-title">
                      {festival.title || "행사 제목"}
                    </h3>
                    <div className="festival-info-row">
                      <span className="festival-info-item">
                        <span className="info-label">위치:</span>
                        <span className="info-value">
                          {festival.location || "-"}
                        </span>
                      </span>
                      <span className="festival-info-item">
                        <span className="info-label">행사일:</span>
                        <span className="info-value">
                          {festival.festivalDate || "-"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이징 */}
            {totalPages > 1 && (
              <div className="pagination">
                {!isMobile && (
                  <button
                    className="pagination-button"
                    onClick={() =>
                      handlePageChange(Math.max(0, currentPage - 1))
                    }
                    disabled={currentPage === 0}
                  >
                    이전
                  </button>
                )}

                <div className="pagination-numbers">
                  {(() => {
                    const maxVisiblePages = 7;
                    const startPage = Math.max(
                      0,
                      currentPage - Math.floor(maxVisiblePages / 2),
                    );
                    const endPage = Math.min(
                      totalPages - 1,
                      startPage + maxVisiblePages - 1,
                    );

                    return (
                      <>
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
                          (_, i) => startPage + i,
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
                      </>
                    );
                  })()}
                </div>

                {!isMobile && (
                  <button
                    className="pagination-button"
                    onClick={() =>
                      handlePageChange(
                        Math.min(totalPages - 1, currentPage + 1),
                      )
                    }
                    disabled={currentPage === totalPages - 1}
                  >
                    다음
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FestivalList;
