import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../configs/axios-config.js";
import "./StrayAnimalList.css";
import { PET } from "../../configs/host-config.js";
import { useSEO } from "../hooks/useSEO.jsx";

const StrayAnimalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const [searchParams] = useSearchParams();

  const region = searchParams.get("region") || "전체";
  const category = searchParams.get("category") || "개";
  const page = searchParams.get("page") || 0;

  // 상세페이지 SEO 생성
  const getDetailSEO = () => {
    if (!detailData) return null;

    const regionText = region === "전체" ? "" : region + " ";

    const kind = detailData.kindNm || "유기동물";
    const age = detailData.age || "";
    const place = detailData.happenPlace || "";
    const shelter = detailData.careNm || "";

    const title = `${regionText}${kind} 입양 정보 | 냥몽`;

    const description = `${place}에서 구조된 ${kind}${
      age ? ` (${age})` : ""
    }의 입양 정보입니다. 보호소: ${shelter}. 연락처 및 위치 확인 가능.`;

    const image =
      detailData.popfile1 ||
      detailData.popfile2 ||
      "/seo/article-default-1200.webp";

    return {
      title,
      description,
      image,
      canonical: `https://nyangmong.com/stray/detail/${id}?region=${region}&category=${category}&page=${page}`,
    };
  };

  const seo = getDetailSEO();

  useSEO(seo);

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
              onClick={() =>
                navigate(
                  `/stray/list?region=${region}&category=${category}&page=${page}`
                )
              }
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
                onClick={() =>
                  navigate(
                    `/stray/list?region=${region}&category=${category}&page=${page}`
                  )
                }
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
                {[detailData.popfile1, detailData.popfile2].every(
                  (v) => !v
                ) && (
                  <div className="detail-image-box">
                    <img src="/logo.png" alt="이미지 없음" />
                  </div>
                )}
              </div>

              <div className="detail-grid">
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
                  <span className="detail-value">{detailData.age || "-"}</span>
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
