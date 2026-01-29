import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../configs/axios-config.js";
import "./FestivalList.css";
import { FESTIVAL } from "../../configs/host-config.js";
import { useDeviceType } from "../hooks/use-device-type";


const FestivalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const { deviceType } = useDeviceType();
  const isSmartPhone = deviceType === "mobile";

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        setDetailError("행사 ID가 없습니다.");
        return;
      }
      setDetailLoading(true);
      setDetailError(null);
      try {
        const res = await axiosInstance.get(`${FESTIVAL}/detail/${id}`);
        const data = res.data?.result || res.data;
        setDetailData(data);
      } catch (err) {
        console.error("상세 조회 실패:", err);
        setDetailError("상세 정보를 불러오지 못했습니다.");
        setDetailData(null);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  return (
    <div className="festival-list-page">
      <div className="festival-container">
        <div className="detail-page">
          <div className="detail-page-header">
            <button
              className="back-button"
              onClick={() => navigate("/festival/list")}
            >
              ← 목록으로
            </button>
          </div>

          {detailLoading && (
            <div className="detail-loading">
              <div className="loader"></div>
              <p className="loading-text">상세 정보를 불러오는 중...</p>
            </div>
          )}

          {detailError && !detailLoading && (
            <div className="detail-error">
              <p className="error-text">{detailError}</p>
              <button
                className="retry-button"
                onClick={() => navigate("/festival/list")}
              >
                목록으로
              </button>
            </div>
          )}

          {detailData && !detailLoading && !detailError && (
            <div className="detail-content">
              {/* ✅ SEO 영역 */}
              <header className="festival-seo-header">
                <h1 className="festival-seo-title">{detailData.title}</h1>

                {!isSmartPhone && (
                  <p className="festival-seo-desc">
                  {detailData.location}에서 열리는
                  {detailData.festivalDate} 반려동물 박람회입니다.
                  일정·요금·관람 정보를 확인하세요.
                </p>
                )}
              </header>
              <div className="detail-info-grid">
                <div className="detail-info-row">
                  <span className="detail-label">위치:</span>
                  <span className="detail-value">
                    {detailData.location || "-"}
                  </span>
                </div>
                <div className="detail-info-row">
                  <span className="detail-label">행사일:</span>
                  <span className="detail-value">
                    {detailData.festivalDate || "-"}
                  </span>
                </div>
                <div className="detail-info-row">
                  <span className="detail-label">진행시간:</span>
                  <span className="detail-value">
                    {detailData.festivalTime || "-"}
                  </span>
                </div>
                <div className="detail-info-row">
                  <span className="detail-label">행사요금:</span>
                  <span className="detail-value">
                    {detailData.money || "-"}
                  </span>
                </div>
                <div className="detail-info-row">
                  <span className="detail-label">예약일:</span>
                  <span className="detail-value">
                    {detailData.reservationDate || "-"}
                  </span>
                </div>
              </div>

              {detailData.url && (
                <div className="detail-footer">
                  <button
                    className="homepage-button"
                    onClick={() => {
                      window.open(detailData.url, "_blank");
                    }}
                  >
                    홈페이지보기
                  </button>
                </div>
              )}

              {detailData.imagePath && (
                <div className="detail-image-container">
                  <img
                    src={detailData.imagePath}
                    alt={detailData.title || "행사 이미지"}
                    className="detail-image"
                    onError={(e) => {
                      e.target.src = "/logo.png";
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FestivalDetail;
