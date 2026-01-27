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
  const [currentImage, setCurrentImage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [fade, setFade] = useState(false);
  const [imgError, setImgError] = useState(false);

  const [searchParams] = useSearchParams();

  const region = searchParams.get("region") || "전체";
  const category = searchParams.get("category") || "개";
  const page = searchParams.get("page") || 0;

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

  useEffect(() => {
    setImgError(false);
  }, [currentImage]);

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

  const images = [detailData?.popfile1, detailData?.popfile2].filter(Boolean);

  if (images.length === 0) {
    images.push("/logo.png");
  }

  const seo = getDetailSEO();

  useSEO(seo || {});

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
            <h1 className="detail-title">
              {region !== "전체" && `${region} `}
              {detailData?.kindNm || "유기동물"} 정보
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

          {/* 상세 내용 */}
          {detailData && !detailLoading && !detailError && (
            <div className="detail-layout">
              {/* 왼쪽: 이미지 영역 */}
              <div className="detail-left">
                <div className="detail-slider">
                  <button
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

              {/* 오른쪽: 정보 영역 */}
              <div className="detail-right">
                {/* 설명문 */}
                <p className="detail-seo-text">
                  {detailData.happenPlace || "해당 지역"}에서 구조된{" "}
                  {detailData.kindNm || "유기동물"}입니다. 현재{" "}
                  {detailData.careNm || "보호소"}에서 새로운 만남을 기다리고
                  있습니다.
                </p>

                {/* 버튼 */}
                <button
                  className="detail-open-btn"
                  onClick={() => setModalOpen(true)}
                >
                  📋 상세 정보 보기
                </button>
              </div>
            </div>
          )}

          {/* 상세정보 모달 */}
          {modalOpen && (
            <div className="detail-modal-overlay">
              <div className="detail-modal">
                <button
                  className="modal-close"
                  onClick={() => setModalOpen(false)}
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
                    ["성별", detailData.sexCd],
                    ["중성화", detailData.neuterYn],
                    ["발생일", detailData.happenDt],
                    ["장소", detailData.happenPlace],
                    ["보호소", detailData.careNm],
                    ["전화", detailData.careTel],
                    ["주소", detailData.careAddr],
                    ["특이사항", detailData.specialMark],
                  ].map(([label, value], i) => (
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

export default StrayAnimalDetail;
