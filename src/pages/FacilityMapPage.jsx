import { useState, useEffect } from "react";
import axiosInstance from "../../configs/axios-config.js";
import MapComponent from "../components/MapComponent.jsx";
import "./FacilityMapPage.css";
import { MAP, HOSPITAL, STYLE } from "../../configs/host-config.js";
import { logUserEvent } from "../hooks/user-log-hook.jsx";
import { useSEO } from "../hooks/useSEO.jsx";

const FacilityMapPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("culture");
  const [showCultureSubCategories, setShowCultureSubCategories] =
    useState(true);
  const [selectedCultureSubCategory, setSelectedCultureSubCategory] =
    useState("12");
  const [selectedCultureRegion, setSelectedCultureRegion] = useState("1");
  const [cultureLocations, setCultureLocations] = useState([]);
  const [isCultureLoading, setIsCultureLoading] = useState(false);
  const [selectedCultureDetail, setSelectedCultureDetail] = useState(null);
  const [showHospitalRegion, setShowHospitalRegion] = useState(false);
  const [selectedHospitalRegion, setSelectedHospitalRegion] = useState("1");
  const [hospitalCategoryOptions, setHospitalCategoryOptions] = useState([]);
  const [selectedHospitalCategory, setSelectedHospitalCategory] = useState("");
  const [hospitalList, setHospitalList] = useState([]);
  const [isHospitalLoading, setIsHospitalLoading] = useState(false);
  const [selectedHospitalInfo, setSelectedHospitalInfo] = useState(null);
  const [showGroomingRegion, setShowGroomingRegion] = useState(false);
  const [selectedGroomingRegion, setSelectedGroomingRegion] = useState("1");
  const [groomingDistrictOptions, setGroomingDistrictOptions] = useState([]);
  const [selectedGroomingDistrict, setSelectedGroomingDistrict] = useState("");
  const [groomingList, setGroomingList] = useState([]);
  const [selectedGroomingDetail, setSelectedGroomingDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const cultureSubCategories = [
    { value: "12", name: "관광지" },
    { value: "14", name: "문화시설" },
    { value: "28", name: "레포츠" },
    { value: "32", name: "숙박" },
    { value: "38", name: "쇼핑" },
    { value: "39", name: "음식점" },
  ];

  const cultureRegionOptions = [
    { value: "1", label: "서울" },
    { value: "2", label: "인천" },
    { value: "3", label: "대전" },
    { value: "4", label: "대구" },
    { value: "5", label: "광주" },
    { value: "6", label: "부산" },
    { value: "7", label: "울산" },
    { value: "8", label: "세종" },
    { value: "31", label: "경기" },
    { value: "32", label: "강원" },
    { value: "33", label: "충북" },
    { value: "34", label: "충남" },
    { value: "35", label: "경북" },
    { value: "36", label: "경남" },
    { value: "37", label: "전북" },
    { value: "38", label: "전남" },
    { value: "39", label: "제주" },
  ];

  const hospitalRegionOptions = cultureRegionOptions;

  const categories = [
    { id: "culture", name: "반려동물 문화시설" },
    { id: "hospital", name: "동물병원" },
    { id: "style", name: "반려동물 미용실" },
    { id: "cafe", name: "반려동물 카페" },
    { id: "shop", name: "반려동물용품샵" },
    { id: "museum", name: "반려동물 박물관" },
    { id: "art", name: "미술관" },
    { id: "literary", name: "반려동물 문예시설" },
    { id: "drug", name: "반려동물 약국" },
  ];

  const groomingCategories = [
    "style",
    "cafe",
    "shop",
    "museum",
    "art",
    "literary",
    "drug",
  ];
  const isGroomingCategory = groomingCategories.includes(selectedCategory);

  const getCategoryName = (id) => {
    return categories.find((c) => c.id === id)?.name || "";
  };

  useEffect(() => {
    logUserEvent("page_view", { page_name: "map" });
  }, []);

  // 미용실 지역 변경 시 리스트 요청
  useEffect(() => {
    if (isGroomingCategory) {
      setShowGroomingRegion(true);
      axiosInstance
        .get(
          `${STYLE}/region/list/${selectedGroomingRegion}/${selectedCategory}`,
        )
        .then((res) => {
          const districts = res.data?.result || [];
          const sortedDistricts = districts.sort((a, b) =>
            a.localeCompare(b, "ko"),
          );
          setGroomingDistrictOptions(sortedDistricts);
          setSelectedGroomingDistrict(sortedDistricts[0] || "");
        })
        .catch((err) => {
          setGroomingDistrictOptions([]);
          setSelectedGroomingDistrict("");
        });
    } else {
      setShowGroomingRegion(false);
      setGroomingDistrictOptions([]);
      setSelectedGroomingDistrict("");
    }
  }, [selectedCategory, selectedGroomingRegion, isGroomingCategory]);

  // 미용실 세부지역 변경 시 리스트 요청
  useEffect(() => {
    if (
      isGroomingCategory &&
      selectedGroomingRegion &&
      selectedGroomingDistrict
    ) {
      axiosInstance
        .get(
          `${STYLE}/list/${selectedGroomingRegion}/${selectedGroomingDistrict}/${selectedCategory}`,
        )
        .then((res) => {
          const list = res.data?.result || [];
          setGroomingList(list);
          // 첫 번째 아이템을 기본 선택
          if (list.length > 0) {
            const firstShop = list.find(
              (shop) =>
                shop.facilityName && (shop.fullAddress || shop.roadAddress),
            );
            if (firstShop) {
              // selectedLocation 설정
              setSelectedLocation(firstShop);
              // 첫 번째 아이템의 상세 정보도 로드
              axiosInstance
                .get(`${STYLE}/detail/${selectedCategory}/${firstShop.id}`)
                .then((detailRes) => {
                  setSelectedGroomingDetail(detailRes.data.result || null);
                })
                .catch(() => {
                  setSelectedGroomingDetail(null);
                });
            }
          } else {
            setSelectedLocation(null);
            setSelectedGroomingDetail(null);
          }
        })
        .catch((err) => {
          setGroomingList([]);
          setSelectedGroomingDetail(null);
        });
    }
  }, [
    selectedCategory,
    selectedGroomingRegion,
    selectedGroomingDistrict,
    isGroomingCategory,
  ]);

  // 문화시설 카테고리/지역 변경 시 POST 요청
  useEffect(() => {
    if (selectedCategory === "culture") {
      setIsCultureLoading(true);
      axiosInstance
        .post(`${MAP}/find`, {
          region: selectedCultureRegion,
          contentType: selectedCultureSubCategory,
        })
        .then((res) => {
          const locations = res.data?.result || res.data || [];
          setCultureLocations(locations);
          // 첫 번째 아이템을 기본 선택
          if (locations.length > 0) {
            const firstLocation = locations.find(
              (location) => location.addr || location.addr1,
            );
            if (firstLocation) {
              setSelectedLocation(firstLocation);
              // 첫 번째 아이템의 상세 정보도 로드
              axiosInstance
                .get(`${MAP}/detail/${firstLocation.mapId}`)
                .then((detailRes) => {
                  setSelectedCultureDetail(
                    detailRes.data?.result || detailRes.data || null,
                  );
                })
                .catch(() => {
                  setSelectedCultureDetail(null);
                });
            }
          } else {
            setSelectedLocation(null);
            setSelectedCultureDetail(null);
          }
        })
        .catch((err) => {
          setCultureLocations([]);
          setSelectedLocation(null);
        })
        .finally(() => setIsCultureLoading(false));
    }
  }, [selectedCategory, selectedCultureSubCategory, selectedCultureRegion]);

  // 동물병원 지역 변경 시 category 요청
  useEffect(() => {
    if (selectedCategory === "hospital") {
      axiosInstance
        .get(`${HOSPITAL}/category/${selectedHospitalRegion}`)
        .then((res) => {
          const categoryData = res.data?.result || res.data || [];
          const sortedCategoryData = categoryData.sort((a, b) =>
            a.localeCompare(b, "ko"),
          );
          setHospitalCategoryOptions(sortedCategoryData);
          if (sortedCategoryData.length > 0) {
            setSelectedHospitalCategory(sortedCategoryData[0]);
          }
        })
        .catch((err) => {
          setHospitalCategoryOptions([]);
          setSelectedHospitalCategory("");
        });
    }
  }, [selectedCategory, selectedHospitalRegion]);

  // 동물병원 카테고리 변경 시 list 요청
  useEffect(() => {
    if (selectedCategory === "hospital" && selectedHospitalCategory) {
      setIsHospitalLoading(true);
      axiosInstance
        .get(
          `${HOSPITAL}/list/${selectedHospitalRegion}/${selectedHospitalCategory}`,
        )
        .then((res) => {
          const hospitalData = Array.isArray(res.data?.result)
            ? res.data.result
            : [];
          setHospitalList(hospitalData);
          // 첫 번째 아이템을 기본 선택
          if (hospitalData.length > 0) {
            const firstHospital = hospitalData.find(
              (h) => h.hospitalName && h.fullAddress,
            );
            if (firstHospital) {
              setSelectedLocation(firstHospital);
              // 첫 번째 아이템의 상세 정보도 로드
              axiosInstance
                .get(`${HOSPITAL}/detail/${firstHospital.hospitalId}`)
                .then((detailRes) => {
                  setSelectedHospitalInfo(
                    detailRes.data?.result || detailRes.data || null,
                  );
                })
                .catch(() => {
                  setSelectedHospitalInfo(null);
                });
            }
          } else {
            setSelectedLocation(null);
            setSelectedHospitalInfo(null);
          }
        })
        .catch((err) => {
          setHospitalList([]);
          setSelectedLocation(null);
        })
        .finally(() => setIsHospitalLoading(false));
    }
  }, [selectedCategory, selectedHospitalRegion, selectedHospitalCategory]);

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedLocation(null);

    if (categoryId === "culture") {
      setShowCultureSubCategories(true);
      setShowHospitalRegion(false);
    } else if (categoryId === "hospital") {
      setShowHospitalRegion(true);
      setShowCultureSubCategories(false);
    } else {
      setShowCultureSubCategories(false);
      setShowHospitalRegion(false);
      setSelectedCultureSubCategory("12");
    }
  };

  // 지역 코드 → 한글
  const getRegionLabel = (code) => {
    const region = cultureRegionOptions.find((r) => r.value === code);
    return region?.label || "전국";
  };

  // 카테고리 → 한글
  const getCategoryLabel = (id) => {
    const cat = categories.find((c) => c.id === id);
    return cat?.name || "반려동물 시설";
  };

  const getFacilitySEO = () => {
    let region = "전국";
    let category = getCategoryLabel(selectedCategory);

    if (selectedCategory === "culture") {
      region = getRegionLabel(selectedCultureRegion);
    } else if (selectedCategory === "hospital") {
      region = getRegionLabel(selectedHospitalRegion);
    } else if (isGroomingCategory) {
      region = getRegionLabel(selectedGroomingRegion);
    }

    const title = `${region} ${category} 위치·정보 지도 | 냥몽`;

    const description = `${region} 지역 ${category} 위치, 주소, 전화번호, 이용정보를 지도에서 한눈에 확인하세요. 반려동물과 함께 이용할 수 있는 시설 정보를 제공합니다.`;

    return {
      title,
      description,

      image: "/seo/og-main-1200.webp",

      canonical: `https://nyangmong.com/map`,
    };
  };

  // SEO 데이터 생성
  const seoData = getFacilitySEO();

  // SEO 적용
  useSEO(seoData);

  const selectedCultureLabel = cultureSubCategories.find(
    (cat) => cat.value === selectedCultureSubCategory,
  )?.name;

  const handleCultureLocationClick = async (location) => {
    setSelectedLocation(location);

    try {
      const res = await axiosInstance.get(`${MAP}/detail/${location.mapId}`);
      setSelectedCultureDetail(res.data?.result || res.data || null);
    } catch (err) {
      setSelectedCultureDetail(null);
    }
  };

  const handleHospitalLocationClick = async (hospital) => {
    setSelectedLocation(hospital);

    try {
      const res = await axiosInstance.get(
        `${HOSPITAL}/detail/${hospital.hospitalId}`,
      );
      setSelectedHospitalInfo(res.data?.result || res.data || null);
    } catch (err) {
      setSelectedHospitalInfo(null);
    }
  };

  const handleGroomingCardClick = (shop) => {
    // selectedLocation 설정
    setSelectedLocation(shop);
    // 상세 정보 로드
    axiosInstance
      .get(`${STYLE}/detail/${selectedCategory}/${shop.id}`)
      .then((res) => {
        setSelectedGroomingDetail(res.data.result || null);
      })
      .catch((err) => {
        setSelectedGroomingDetail(null);
      });
  };

  // 마커 클릭 시 상세 정보 모달 표시
  const handleMarkerClick = async (location) => {
    if (!location) return;

    setShowModal(true);
    setModalLoading(true);
    setModalError(null);
    setModalData(null);

    try {
      let response;
      if (selectedCategory === "culture") {
        // 반려동물 문화시설
        response = await axiosInstance.get(`${MAP}/detail/${location.mapId}`);
      } else if (selectedCategory === "hospital") {
        // 동물병원
        response = await axiosInstance.get(
          `${HOSPITAL}/detail/${location.hospitalId}`,
        );
      } else {
        // 나머지 카테고리
        response = await axiosInstance.get(
          `${STYLE}/detail/${selectedCategory}/${location.id}`,
        );
      }

      setModalData(response.data?.result || response.data || null);
    } catch (err) {
      setModalError("상세 정보를 불러오는 중 오류가 발생했습니다.");
      console.error("상세 정보 로드 실패:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
    setModalError(null);
  };

  const getMapLocations = () => {
    if (isGroomingCategory) {
      return [];
    } else if (selectedCategory === "culture") {
      // 반려동물 문화시설: addr1 사용
      return cultureLocations.map((location) => ({
        ...location,
        addr1: location.addr1 || location.addr,
      }));
    } else if (selectedCategory === "hospital") {
      // 동물병원: fullAddress 사용
      return (Array.isArray(hospitalList) ? hospitalList : []).map((h) => ({
        id: h.hospitalId,
        name: h.hospitalName,
        fullAddress: h.fullAddress,
        category: "hospital",
      }));
    }
    return [];
  };

  const getPageSEOText = () => {
    let region = "전국";
    let district = "";
    let title = "";
    let description = "";

    // 카테고리 한글명
    const categoryName = getCategoryName(selectedCategory);

    /* =====================
     미용실 / 병원
  ===================== */
    if (isGroomingCategory || selectedCategory === "hospital") {
      region = getRegionLabel(selectedGroomingRegion || selectedHospitalRegion);

      district = selectedHospitalRegion || selectedGroomingDistrict;

      title = `${region} ${district} ${categoryName} 지도 정보`;

      description = `${region} ${district} 지역 ${categoryName} 위치, 주소, 이용정보를 지도에서 한눈에 확인하세요.`;

      return { title, description };
    }

    /* =====================
     문화시설
  ===================== */
    if (selectedCategory === "culture") {
      const subCategoryName =
        cultureSubCategories.find(
          (cat) => cat.value === selectedCultureSubCategory,
        )?.name || "문화시설";

      region = getRegionLabel(selectedCultureRegion);

      title = `${region} 반려동물 ${subCategoryName} 지도 정보`;

      description = `${region} 지역 반려동물 ${subCategoryName} 위치, 주소, 이용정보를 확인하세요.`;

      return { title, description };
    }

    /* =====================
     기타
  ===================== */
    region = getRegionLabel(selectedRegion);

    title = `${region} ${categoryName} 지도 정보`;

    description = `${region} 지역 ${categoryName} 위치와 정보를 확인하세요.`;

    return { title, description };
  };

  const { title, description } = getPageSEOText();

  return (
    <div className="facility-map-page">
      <div className="facility-map-container">
        <div className="page-header">
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{description}</p>
        </div>

        {/* 필터 영역 (상단) */}
        <div className="filter-section">
          {/* 카테고리 선택 */}
          <div className="category-filter">
            <div className="category-buttons">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-button ${
                    selectedCategory === category.id ? "active" : ""
                  }`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 지역 선택 (조건부 표시) */}
          <div className="region-filter">
            {/* 문화시설 하위 카테고리 */}
            {showCultureSubCategories && (
              <>
                <div className="sub-category-buttons">
                  {cultureSubCategories.map((subCategory) => (
                    <button
                      key={subCategory.value}
                      className={`sub-category-button ${
                        selectedCultureSubCategory === subCategory.value
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedCultureSubCategory(subCategory.value)
                      }
                    >
                      {subCategory.name}
                    </button>
                  ))}
                </div>
                <select
                  className="region-select"
                  value={selectedCultureRegion}
                  onChange={(e) => setSelectedCultureRegion(e.target.value)}
                >
                  {cultureRegionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* 동물병원 지역/카테고리 선택 */}
            {showHospitalRegion && (
              <>
                <select
                  className="region-select"
                  value={selectedHospitalRegion}
                  onChange={(e) => setSelectedHospitalRegion(e.target.value)}
                >
                  {hospitalRegionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {hospitalCategoryOptions.length > 0 && (
                  <select
                    className="region-select"
                    value={selectedHospitalCategory}
                    onChange={(e) =>
                      setSelectedHospitalCategory(e.target.value)
                    }
                  >
                    {hospitalCategoryOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}

            {/* 미용실 지역 선택 */}
            {showGroomingRegion && (
              <>
                <select
                  className="region-select"
                  value={selectedGroomingRegion}
                  onChange={(e) => setSelectedGroomingRegion(e.target.value)}
                >
                  {hospitalRegionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="region-select"
                  value={selectedGroomingDistrict}
                  onChange={(e) => setSelectedGroomingDistrict(e.target.value)}
                >
                  {groomingDistrictOptions.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* 메인 콘텐츠 영역 (좌우 분할) */}
        <div className="main-content-wrapper">
          {/* 왼쪽: 아이템 목록 */}
          <div className="list-panel">
            {/* 문화시설 목록 */}
            {selectedCategory === "culture" && (
              <div className="list-section">
                <h3 className="list-title">
                  문화시설 목록 ({cultureLocations.length}개)
                </h3>
                {isCultureLoading ? (
                  <div className="loading-text">불러오는 중...</div>
                ) : cultureLocations.length === 0 ? (
                  <div className="empty-text">문화시설이 없습니다.</div>
                ) : (
                  <div className="card-list">
                    {cultureLocations
                      .filter((location) => location.addr || location.addr1)
                      .map((location) => (
                        <div
                          key={location.mapId || location.title}
                          className={`location-card ${
                            selectedLocation?.mapId === location.mapId
                              ? "active"
                              : ""
                          }`}
                          onClick={() => handleCultureLocationClick(location)}
                        >
                          <div className="card-content">
                            <h4 className="card-title">{location.title}</h4>
                            <span className="category-badge">
                              {selectedCultureLabel}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* 동물병원 목록 */}
            {selectedCategory === "hospital" && (
              <div className="list-section">
                <h3 className="list-title">
                  동물병원 목록 ({hospitalList.length}개)
                </h3>
                {isHospitalLoading ? (
                  <div className="loading-text">불러오는 중...</div>
                ) : hospitalList.length === 0 ? (
                  <div className="empty-text">동물병원이 없습니다.</div>
                ) : (
                  <div className="card-list">
                    {(Array.isArray(hospitalList) ? hospitalList : [])
                      .filter((hospital) => hospital.hospitalName)
                      .map((hospital) => (
                        <div
                          key={hospital.hospitalId}
                          className={`location-card ${
                            selectedLocation?.hospitalId === hospital.hospitalId
                              ? "active"
                              : ""
                          }`}
                          onClick={() => handleHospitalLocationClick(hospital)}
                        >
                          <div className="card-content">
                            <h4 className="card-title">
                              {hospital.hospitalName}
                            </h4>
                            <p className="card-address">
                              {hospital.fullAddress}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* 미용실 목록 */}
            {isGroomingCategory && (
              <div className="list-section">
                <h3 className="list-title">
                  {categories.find((cat) => cat.id === selectedCategory)
                    ?.name || "시설 목록"}{" "}
                  ({groomingList.length}개)
                </h3>
                {groomingList.length === 0 ? (
                  <div className="empty-text">
                    {categories.find((cat) => cat.id === selectedCategory)
                      ?.name || "시설"}{" "}
                    정보가 없습니다.
                  </div>
                ) : (
                  <div className="card-list">
                    {groomingList.map((shop) => (
                      <div
                        key={shop.id}
                        className={`location-card ${
                          selectedGroomingDetail &&
                          selectedGroomingDetail.id === shop.id
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleGroomingCardClick(shop)}
                      >
                        <div className="card-content">
                          <h4 className="card-title">{shop.facilityName}</h4>
                          <p className="card-address">{shop.fullAddress}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 오른쪽: 지도 영역 */}
          <div className="map-panel">
            <h3 className="map-title">위치 지도</h3>
            <div className="map-container">
              <MapComponent
                key={selectedCategory}
                locations={getMapLocations()}
                selectedLocation={selectedLocation}
                onLocationClick={handleLocationClick}
                onMarkerClick={handleMarkerClick}
                selectedCultureDetail={
                  selectedCategory === "culture" ? selectedCultureDetail : null
                }
                selectedHospitalInfo={
                  selectedCategory === "hospital" ? selectedHospitalInfo : null
                }
                selectedHospitalDetail={
                  selectedCategory === "hospital" ? selectedHospitalInfo : null
                }
                selectedCategory={selectedCategory}
                selectedGroomingDetail={selectedGroomingDetail}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {showModal && (
        <div className="detail-modal-backdrop" onClick={closeModal}>
          <div
            className="detail-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {modalLoading && (
              <div className="detail-loading">
                <div className="loader"></div>
                <p className="loading-text">상세 정보를 불러오는 중...</p>
              </div>
            )}

            {modalError && !modalLoading && (
              <div className="detail-error">
                <p className="error-text">{modalError}</p>
                <button className="retry-button" onClick={closeModal}>
                  닫기
                </button>
              </div>
            )}

            {modalData && !modalLoading && !modalError && (
              <>
                <div className="detail-header">
                  <h2 className="detail-title">
                    {selectedCategory === "culture"
                      ? modalData.title || "문화시설 상세"
                      : selectedCategory === "hospital"
                        ? modalData.businessName || "동물병원 상세"
                        : modalData.facilityName || "시설 상세"}
                  </h2>
                  <button className="detail-close" onClick={closeModal}>
                    ×
                  </button>
                </div>

                <div className="detail-content">
                  {/* 반려동물 문화시설 */}
                  {selectedCategory === "culture" && (
                    <div className="detail-info-grid">
                      {modalData.image1 && (
                        <div className="detail-image-container">
                          <img
                            src={modalData.image1}
                            alt={modalData.title || "이미지"}
                            className="detail-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      {modalData.image2 && (
                        <div className="detail-image-container">
                          <img
                            src={modalData.image2}
                            alt={modalData.title || "이미지"}
                            className="detail-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="detail-info-item">
                        <span className="detail-label">주소</span>
                        <span className="detail-value">
                          {modalData.addr1 || modalData.addr2 || "-"}
                        </span>
                      </div>
                      {modalData.tel && (
                        <div className="detail-info-item">
                          <span className="detail-label">전화번호</span>
                          <span className="detail-value">{modalData.tel}</span>
                        </div>
                      )}
                      {modalData.contentType && (
                        <div className="detail-info-item">
                          <span className="detail-label">카테고리</span>
                          <span className="detail-value">
                            {modalData.contentType}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 동물병원 */}
                  {selectedCategory === "hospital" && (
                    <div className="detail-info-grid">
                      <div className="detail-info-item">
                        <span className="detail-label">사업장명</span>
                        <span className="detail-value">
                          {modalData.businessName || "-"}
                        </span>
                      </div>
                      {modalData.phoneNumber && (
                        <div className="detail-info-item">
                          <span className="detail-label">전화번호</span>
                          <span className="detail-value">
                            {modalData.phoneNumber}
                          </span>
                        </div>
                      )}
                      <div className="detail-info-item">
                        <span className="detail-label">지번주소</span>
                        <span className="detail-value">
                          {modalData.fullAddress || "-"}
                        </span>
                      </div>
                      {modalData.roadAddress && (
                        <div className="detail-info-item">
                          <span className="detail-label">도로명주소</span>
                          <span className="detail-value">
                            {modalData.roadAddress}
                          </span>
                        </div>
                      )}
                      {modalData.postalCode && (
                        <div className="detail-info-item">
                          <span className="detail-label">우편번호</span>
                          <span className="detail-value">
                            {modalData.postalCode}
                          </span>
                        </div>
                      )}
                      {modalData.approvalDate && (
                        <div className="detail-info-item">
                          <span className="detail-label">인허가일자</span>
                          <span className="detail-value">
                            {modalData.approvalDate}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 나머지 카테고리 */}
                  {selectedCategory !== "culture" &&
                    selectedCategory !== "hospital" && (
                      <div className="detail-info-grid">
                        <div className="detail-info-item">
                          <span className="detail-label">시설명</span>
                          <span className="detail-value">
                            {modalData.facilityName || "-"}
                          </span>
                        </div>
                        {modalData.roadAddress && (
                          <div className="detail-info-item">
                            <span className="detail-label">도로명주소</span>
                            <span className="detail-value">
                              {modalData.roadAddress}
                            </span>
                          </div>
                        )}
                        {modalData.fullAddress && (
                          <div className="detail-info-item">
                            <span className="detail-label">지번주소</span>
                            <span className="detail-value">
                              {modalData.fullAddress}
                            </span>
                          </div>
                        )}
                        {modalData.telNum && (
                          <div className="detail-info-item">
                            <span className="detail-label">전화번호</span>
                            <span className="detail-value">
                              {modalData.telNum}
                            </span>
                          </div>
                        )}
                        {modalData.url && (
                          <div className="detail-info-item">
                            <span className="detail-label">홈페이지</span>
                            <span className="detail-value">
                              <a
                                href={modalData.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {modalData.url}
                              </a>
                            </span>
                          </div>
                        )}
                        {modalData.operTime && (
                          <div className="detail-info-item">
                            <span className="detail-label">운영시간</span>
                            <span className="detail-value">
                              {modalData.operTime}
                            </span>
                          </div>
                        )}
                        {modalData.restInfo && (
                          <div className="detail-info-item">
                            <span className="detail-label">휴무일</span>
                            <span className="detail-value">
                              {modalData.restInfo}
                            </span>
                          </div>
                        )}
                        {modalData.parking && (
                          <div className="detail-info-item">
                            <span className="detail-label">주차가능여부</span>
                            <span className="detail-value">
                              {modalData.parking}
                            </span>
                          </div>
                        )}
                        {modalData.price && (
                          <div className="detail-info-item">
                            <span className="detail-label">이용가격</span>
                            <span className="detail-value">
                              {modalData.price}
                            </span>
                          </div>
                        )}
                        {modalData.petWith && (
                          <div className="detail-info-item">
                            <span className="detail-label">
                              반려동물가능여부
                            </span>
                            <span className="detail-value">
                              {modalData.petWith}
                            </span>
                          </div>
                        )}
                        {modalData.petSize && (
                          <div className="detail-info-item">
                            <span className="detail-label">
                              입장가능반려동물크기
                            </span>
                            <span className="detail-value">
                              {modalData.petSize}
                            </span>
                          </div>
                        )}
                        {modalData.petRestrict && (
                          <div className="detail-info-item">
                            <span className="detail-label">
                              반려동물제한사항
                            </span>
                            <span className="detail-value">
                              {modalData.petRestrict}
                            </span>
                          </div>
                        )}
                        {modalData.extraFee && (
                          <div className="detail-info-item">
                            <span className="detail-label">
                              반려동물동반추가요금
                            </span>
                            <span className="detail-value">
                              {modalData.extraFee}
                            </span>
                          </div>
                        )}
                        {modalData.inPlace && (
                          <div className="detail-info-item">
                            <span className="detail-label">
                              내부장소동반가능여부
                            </span>
                            <span className="detail-value">
                              {modalData.inPlace}
                            </span>
                          </div>
                        )}
                        {modalData.outPlace && (
                          <div className="detail-info-item">
                            <span className="detail-label">
                              외부장소동반가능여부
                            </span>
                            <span className="detail-value">
                              {modalData.outPlace}
                            </span>
                          </div>
                        )}
                        {modalData.infoDesc && (
                          <div className="detail-info-item">
                            <span className="detail-label">시설정보설명</span>
                            <span className="detail-value">
                              {modalData.infoDesc}
                            </span>
                          </div>
                        )}
                        {modalData.petInfo && (
                          <div className="detail-info-item">
                            <span className="detail-label">반려동물정보</span>
                            <span className="detail-value">
                              {modalData.petInfo}
                            </span>
                          </div>
                        )}
                        {modalData.lastUpdate && (
                          <div className="detail-info-item">
                            <span className="detail-label">최종수정일자</span>
                            <span className="detail-value">
                              {modalData.lastUpdate}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityMapPage;
