import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../configs/axios-config.js";
import "./StrayAnimalList.css";
import { PET } from "../../configs/host-config.js";

const StrayAnimalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        setDetailError("유기번호가 없습니다.");
        return;
      }
      setDetailLoading(true);
      setDetailError(null);
      try {
        const res = await axiosInstance.get(`${PET}/detail/${id}`);
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
    <div className="stray-animal-list-page">
      <div className="stray-animal-container">
        <div className="detail-page">
          <div className="detail-page-header">
            <button
              className="back-button"
              onClick={() => navigate("/stray/list")}
            >
              ← 목록으로
            </button>
            <h1 className="page-title">
              {detailData?.kindNm || "유기동물 상세"}
            </h1>
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
                onClick={() => navigate("/stray/list")}
              >
                목록으로
              </button>
            </div>
          )}

          {detailData && !detailLoading && !detailError && (
            <div className="detail-layout">
              <div className="detail-gallery">
                {[detailData.popfile1, detailData.popfile2]
                  .filter(Boolean)
                  .map((src, idx) => (
                    <div key={idx} className="detail-image-box">
                      <img
                        src={src}
                        alt={detailData.kindNm || "유기동물"}
                        onError={(e) => {
                          e.target.src = "/logo.png";
                        }}
                      />
                    </div>
                  ))}
                {[detailData.popfile1, detailData.popfile2].every((v) => !v) && (
                  <div className="detail-image-box">
                    <img src="/logo.png" alt="이미지 없음" />
                  </div>
                )}
              </div>

              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">유기번호</span>
                  <span className="detail-value">
                    {detailData.desertionNo || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">축종</span>
                  <span className="detail-value">
                    {detailData.upKindNm || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">품종</span>
                  <span className="detail-value">
                    {detailData.kindNm || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">털색</span>
                  <span className="detail-value">
                    {detailData.colorCd || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">나이</span>
                  <span className="detail-value">
                    {detailData.age || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">체중</span>
                  <span className="detail-value">
                    {detailData.weight || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">성별</span>
                  <span className="detail-value">
                    {detailData.sexCd || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">중성화</span>
                  <span className="detail-value">
                    {detailData.neuterYn || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">발생일</span>
                  <span className="detail-value">
                    {detailData.happenDt || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">발생장소</span>
                  <span className="detail-value">
                    {detailData.happenPlace || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">보호소</span>
                  <span className="detail-value">
                    {detailData.careNm || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">보호소 전화</span>
                  <span className="detail-value">
                    {detailData.careTel || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">보호소 주소</span>
                  <span className="detail-value">
                    {detailData.careAddr || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">특이사항</span>
                  <span className="detail-value">
                    {detailData.specialMark || "-"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">기타</span>
                  <span className="detail-value">
                    {detailData.etcBigo || "-"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrayAnimalDetail;
