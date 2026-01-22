import { useEffect, useRef, useState } from "react";

const MapComponent = ({
  locations = [],
  selectedLocation,
  onLocationClick,
  onMarkerClick,
  selectedCultureDetail,
  selectedHospitalInfo,
  selectedHospitalDetail,
  selectedCategory,
  selectedGroomingDetail,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [kakaoLoaded, setKakaoLoaded] = useState(false);
  const AppKey = import.meta.env.VITE_KAKAO_MAP_API;

  // 카카오맵 API 로드
  useEffect(() => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      setKakaoLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${AppKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setKakaoLoaded(true);
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!kakaoLoaded || !window.kakao || !window.kakao.maps) {
      return;
    }

    const kakao = window.kakao;

    // 지도 초기화 함수
    const initializeMap = () => {
      const container = mapRef.current;
      if (!container) return false;

      // 컨테이너 크기 확인
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      // 컨테이너 크기가 0이면 초기화하지 않음
      if (containerWidth === 0 || containerHeight === 0) {
        return false;
      }

      // 기존 지도가 있으면 제거하지 않고 relayout만 호출
      if (mapInstanceRef.current) {
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.relayout();
          }
        }, 100);
        return true;
      }

      // 새 지도 생성
      const options = {
        center: new kakao.maps.LatLng(37.5665, 126.978),
        level: 5,
      };

      const map = new kakao.maps.Map(container, options);
      mapInstanceRef.current = map;

      // 지도 초기화 후 relayout 호출하여 크기 재계산
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.relayout();
        }
      }, 100);

      return true;
    };

    // 즉시 초기화 시도
    if (!initializeMap()) {
      // 실패하면 약간의 지연 후 다시 시도
      const timer = setTimeout(() => {
        if (!initializeMap()) {
          // 여전히 실패하면 추가 지연 후 재시도
          setTimeout(() => {
            initializeMap();
          }, 200);
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    // 지도 인스턴스 가져오기
    const map = mapInstanceRef.current;
    if (!map) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 기존 인포윈도우 닫기
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    // 선택된 위치만 마커로 표시
    if (selectedLocation) {
      // 마커 생성 및 표시 함수
      const createMarker = (coords) => {
        // 마커 생성
        const marker = new kakao.maps.Marker({
          position: coords,
          map: map,
        });

        // 마커 클릭 이벤트
        kakao.maps.event.addListener(marker, "click", () => {
          if (onMarkerClick) {
            onMarkerClick(selectedLocation);
          }
        });

        markersRef.current.push(marker);

        // 지도 중심을 마커 위치로 이동
        map.setCenter(coords);
        map.setLevel(3);
      };

      // culture와 hospital은 주소를 사용하여 좌표 변환
      if (selectedCategory === "culture" || selectedCategory === "hospital") {
        // services 라이브러리가 로드되었는지 확인
        if (!kakao.maps.services) {
          console.error("카카오맵 services 라이브러리가 로드되지 않았습니다.");
          return;
        }

        // 주소 정보 확인
        let address = "";
        if (selectedCategory === "culture") {
          // 반려동물 문화시설일 때는 addr1 사용
          address = selectedLocation.addr1 || selectedLocation.addr || "";
        } else if (selectedCategory === "hospital") {
          // 동물병원일 때는 fullAddress 사용
          address =
            selectedLocation.fullAddress || selectedLocation.address || "";
        }

        if (address) {
          const geocoder = new kakao.maps.services.Geocoder();

          // addressSearch를 사용하여 주소를 좌표로 변환
          geocoder.addressSearch(address, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
              // 첫 번째 결과 사용
              const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
              createMarker(coords);
            } else {
              // 주소 검색 실패
              console.warn(`주소 검색 실패: ${address}`, status);
            }
          });
        }
      } else {
        // 나머지 카테고리는 mapx, mapy를 직접 사용
        if (
          selectedLocation.mapx !== undefined &&
          selectedLocation.mapy !== undefined
        ) {
          // mapx는 경도(longitude), mapy는 위도(latitude)
          // 카카오맵 LatLng는 (위도, 경도) 순서이므로 (mapy, mapx)
          const coords = new kakao.maps.LatLng(
            selectedLocation.mapx,
            selectedLocation.mapy
          );
          createMarker(coords);
        } else {
          console.warn("좌표 정보(mapx, mapy)가 없습니다.", selectedLocation);
        }
      }
    }
  }, [
    locations,
    selectedLocation,
    selectedCultureDetail,
    selectedHospitalInfo,
    selectedHospitalDetail,
    selectedCategory,
    selectedGroomingDetail,
    onLocationClick,
    onMarkerClick,
    kakaoLoaded,
  ]);

  // 컨테이너 크기 변경 감지 및 지도 relayout
  useEffect(() => {
    if (!mapInstanceRef.current || !kakaoLoaded) return;

    const container = mapRef.current;
    if (!container) return;

    // ResizeObserver를 사용하여 컨테이너 크기 변경 감지
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // 크기가 유효한 경우에만 relayout 호출
        if (width > 0 && height > 0 && mapInstanceRef.current) {
          // 약간의 지연 후 relayout 호출
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.relayout();
            }
          }, 50);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [kakaoLoaded, selectedCategory]);

  // selectedCategory 변경 시 지도 relayout
  useEffect(() => {
    if (!mapInstanceRef.current || !kakaoLoaded) return;

    // 카테고리 변경 시 약간의 지연 후 relayout 호출
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.relayout();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCategory, kakaoLoaded]);

  if (!kakaoLoaded) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
          color: "#666",
        }}
      >
        지도를 불러오는 중...
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        zIndex: 1,
        isolation: "isolate",
      }}
    />
  );
};

export default MapComponent;
