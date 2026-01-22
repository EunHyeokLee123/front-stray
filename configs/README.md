# API 설정 가이드

이 폴더는 프론트엔드에서 백엔드 API와의 통신을 위한 설정 파일들을 포함합니다.

## 파일 구조

```
configs/
├── axios-config.js      # Axios 인스턴스 및 인터셉터 설정
├── host-config.js       # 환경별 백엔드 URL 설정
├── HandleAxiosError.js  # 에러 처리 유틸리티
├── api-endpoints.js     # API 엔드포인트 관리
├── api-utils.js         # API 호출 유틸리티 함수들
├── api-examples.js      # API 사용 예시
└── README.md           # 이 파일
```

## 주요 기능

### 1. 자동 토큰 관리
- 요청 시 자동으로 Authorization 헤더에 토큰 추가
- 401 에러 시 자동 토큰 갱신
- 토큰 갱신 실패 시 자동 로그아웃

### 2. 에러 처리
- 네트워크 에러 처리
- 토큰 만료 에러 처리
- 사용자 친화적인 에러 메시지

### 3. 개발 환경 로깅
- 개발 환경에서 API 요청/응답 로깅
- 디버깅을 위한 상세한 로그

## 사용법

### 기본 API 호출

```javascript
import { apiUtils } from './configs/api-utils';
import { API_ENDPOINTS } from './configs/api-endpoints';

// GET 요청
const posts = await apiUtils.get(API_ENDPOINTS.BOARD.COMMUNITY.LIST);

// POST 요청
const newPost = await apiUtils.post(API_ENDPOINTS.BOARD.COMMUNITY.CREATE, postData);

// PUT 요청
const updatedPost = await apiUtils.put(API_ENDPOINTS.BOARD.COMMUNITY.UPDATE(postId), updateData);

// DELETE 요청
await apiUtils.delete(API_ENDPOINTS.BOARD.COMMUNITY.DELETE(postId));
```

### 페이지네이션과 검색

```javascript
import { createPaginationParams, createSearchParams } from './configs/api-utils';

// 페이지네이션 파라미터 생성
const paginationParams = createPaginationParams(1, 10, 'createdAt,desc');

// 검색 파라미터 생성
const searchParams = createSearchParams('검색어', { category: 'notice' });

// API 호출
const endpoint = `${API_ENDPOINTS.BOARD.COMMUNITY.LIST}?${new URLSearchParams({
  ...paginationParams,
  ...searchParams
}).toString()}`;

const result = await apiUtils.get(endpoint);
```

### 파일 업로드

```javascript
const formData = new FormData();
formData.append('image', file);

const response = await apiUtils.upload(API_ENDPOINTS.UPLOAD.IMAGE, formData);
```

### 에러 처리

```javascript
try {
  const response = await apiUtils.get(endpoint);
  // 성공 처리
} catch (error) {
  // 에러는 자동으로 handleAxiosError에서 처리됨
  console.error('API 호출 실패:', error);
}
```

## 환경 설정

### 개발 환경
- 백엔드 URL: `http://localhost:8000`
- 상세한 로깅 활성화

### 배포 환경
- 백엔드 URL: `https://api.playdatashop8917.store`
- 로깅 비활성화

## 백엔드 API 연결 시 주의사항

1. **엔드포인트 경로 확인**: `api-endpoints.js`에서 백엔드 API 경로와 일치하는지 확인
2. **응답 형식 확인**: 백엔드 응답 형식이 예상과 일치하는지 확인
3. **에러 코드 확인**: 백엔드 에러 응답 형식이 인터셉터와 일치하는지 확인
4. **토큰 형식 확인**: Authorization 헤더 형식이 백엔드와 일치하는지 확인

## 커스터마이징

### 새로운 API 엔드포인트 추가

```javascript
// api-endpoints.js에 추가
export const API_ENDPOINTS = {
  // ... 기존 엔드포인트들
  NEW_SERVICE: {
    LIST: "/new-service/list",
    DETAIL: (id) => `/new-service/${id}`,
    CREATE: "/new-service/create",
  },
};
```

### 새로운 API 유틸리티 함수 추가

```javascript
// api-utils.js에 추가
export const customApiCall = async (endpoint, customConfig = {}) => {
  try {
    const response = await axiosInstance.request({
      url: endpoint,
      ...customConfig,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};
```

## 문제 해결

### 토큰 갱신이 작동하지 않는 경우
1. 백엔드 refresh 엔드포인트 경로 확인
2. refresh 요청 시 전송하는 데이터 형식 확인
3. 응답에서 토큰 필드명 확인

### 에러 처리가 작동하지 않는 경우
1. 백엔드 에러 응답 형식 확인
2. `HandleAxiosError.js`의 에러 코드 매칭 확인

### 네트워크 에러가 발생하는 경우
1. 백엔드 서버가 실행 중인지 확인
2. CORS 설정 확인
3. 네트워크 연결 상태 확인 