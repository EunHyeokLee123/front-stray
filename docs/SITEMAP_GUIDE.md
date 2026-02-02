# Sitemap 가이드: sitemap-detail.xml 확인·의미·효과·검색엔진 적용

## 1. sitemap-detail.xml은 어떻게 확인하나요?

### 1-1. 파일 위치와 실행

- **파일 위치**: `public/sitemap-detail.xml`  
  빌드/배포 후 실제 사이트에서는 `https://nyangmong.com/sitemap-detail.xml` 로 접근합니다.
- **생성 방법**: 터미널에서 아래 명령을 실행하면 **현재 API에서 가져온 ID**로 파일이 다시 만들어집니다.
  ```bash
  npm run generate-sitemap-detail
  ```

### 1-2. 파일을 직접 열어서 확인

- **로컬**: 프로젝트에서 `public/sitemap-detail.xml` 을 에디터로 열어보면 됩니다.
- **배포 후**: 브라우저 주소창에 `https://nyangmong.com/sitemap-detail.xml` 입력해 보면, 검색엔진이 보는 것과 같은 XML을 볼 수 있습니다.

### 1-3. XML 구조와 각 값의 의미

sitemap-detail.xml은 대략 아래 형태입니다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nyangmong.com/stray/detail/41120250123456</loc>
    <lastmod>2026-01-29</lastmod>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://nyangmong.com/festival/detail/123</loc>
    <lastmod>2026-01-29</lastmod>
    <priority>0.6</priority>
  </url>
</urlset>
```

| 항목 | 의미 |
|------|------|
| **`<urlset>`** | 이 파일이 “URL 목록”이라는 뜻의 sitemap 표준 루트입니다. |
| **`<url>`** | 하나의 페이지(URL)를 나타냅니다. |
| **`<loc>`** | **실제 페이지 주소**입니다. 검색엔진은 이 주소를 방문해 수집·색인합니다. `/stray/detail/...` = 유기동물 상세, `/festival/detail/...` = 행사 상세. |
| **`<lastmod>`** | **이 URL을 마지막으로 수정한 날짜**입니다. 우리 스크립트는 “sitemap을 만든 날”을 넣습니다. 검색엔진이 “언제쯤 다시 보면 될지” 참고할 때 씁니다. |
| **`<priority>`** | **이 페이지의 상대적 중요도**입니다. 0.0~1.0. 0.6은 “중요하지만 메인/목록 페이지보다는 낮다”는 의미로 넣은 값입니다. (참고용에 가깝고, 검색엔진이 반드시 따르지는 않습니다.) |

### 1-4. 어떤 “값”이 바뀌나요?

- **변하는 것**
  - **`<loc>` 안의 URL 개수와 ID**
    - 유기동물: API `/pet-service/pet/search/{page}` 에서 나온 **desertionNo** 개수만큼 `/stray/detail/{id}` 가 생깁니다.
    - 행사: API `/map-service/festival/list/{page}` 에서 나온 **festivalId** 개수만큼 `/festival/detail/{id}` 가 생깁니다.
  - **`<lastmod>`**  
    스크립트를 실행한 날짜로 들어갑니다. (예: 2026-01-29)
- **변하지 않는 것**
  - **도메인** (`https://nyangmong.com`)  
  - **경로 형식** (`/stray/detail/...`, `/festival/detail/...`)  
  - **`<priority>0.6`** (스크립트에서 고정)

즉, “어떤 상세 페이지들이 **지금 존재하는지**”를 ID 기준으로 나열한 목록이 sitemap-detail.xml이고, **ID 목록과 lastmod 날짜**가 실행할 때마다 바뀝니다.

---

## 2. 이렇게 적용하면 어떤 효과가 있나요?

### 2-1. 검색엔진이 상세 페이지를 “발견”하기 쉬워짐

- 목록 페이지(`/stray/list`, `/festival/list`)만 링크로 연결된 상세 페이지는, 크롤러가 목록을 여러 번 돌아야 다 찾을 수 있습니다.
- sitemap-detail.xml에 **상세 URL을 직접 나열**해 두면, 검색엔진이 이 파일 하나만 읽고도 “수집할 URL 목록”을 한 번에 얻습니다.
- 효과: **유기동물 상세·행사 상세가 검색 결과에 더 잘·빨리 포함될 가능성이 높아집니다.**

### 2-2. 수집·색인 효율

- sitemap은 “이 URL들도 수집해 주세요”라는 **안내** 역할을 합니다.
- 크롤 예산(한 사이트에 쓰는 시간)이 제한적인 검색엔진에게 “우선 이 페이지들을 보세요”라고 알려 주는 것과 비슷합니다.
- 효과: **깊은 단계에 있는 상세 페이지가 누락되거나 늦게 수집되는 일을 줄이는 데 도움이 됩니다.**

### 2-3. 새 글/새 행사 반영

- `npm run generate-sitemap-detail` 을 **주기적으로**(또는 새 데이터가 쌓일 때마다) 실행해 두면, 새 유기동물·새 행사가 sitemap에 추가되고, `<lastmod>` 도 갱신됩니다.
- 검색엔진은 lastmod를 참고해 “이 URL은 언제쯤 다시 확인하면 되는지” 판단할 수 있습니다.
- 효과: **새로 추가된 상세 페이지가 상대적으로 빨리 수집·색인되는 데 도움이 됩니다.**

### 2-4. 정리

| 효과 | 설명 |
|------|------|
| **발견 용이** | 상세 URL을 한곳에 모아 제출 → 크롤러가 찾기 쉬움 |
| **수집·색인** | “이 URL도 수집해 주세요”라는 명시적 안내 |
| **새 콘텐츠 반영** | 스크립트 재실행으로 새 ID·lastmod 반영 가능 |

sitemap만으로 순위가 오른다는 보장은 없지만, **색인될 기회**와 **수집 효율**을 높이는 데 의미가 있습니다.

---

## 3. Google Search Console에 어떻게 적용하나요?

### 3-1. 전제

- 도메인 `nyangmong.com` (또는 사용 중인 도메인)이 **이미 Search Console에 등록**되어 있어야 합니다.
- 등록이 안 되어 있다면: [Google Search Console](https://search.google.com/search-console) 접속 → “리소스 추가” → 도메인 또는 URL 접두어로 사이트 등록 후 소유권 확인을 먼저 합니다.

### 3-2. Sitemap 제출 절차 (Google)

1. **Search Console 로그인**  
   https://search.google.com/search-console

2. **해당 사이트 선택**  
   왼쪽에서 `nyangmong.com` (또는 등록한 속성) 선택.

3. **Sitemaps 메뉴로 이동**  
   왼쪽 사이드바에서 **“색인 생성” → “Sitemaps”** 를 클릭합니다.

4. **새 sitemap 추가**  
   - “새 사이트맵 추가” 입력란에 아래 두 개를 **각각** 입력한 뒤 “제출” 버튼을 누릅니다.
     - `sitemap.xml`
     - `sitemap-detail.xml`
   - URL만 넣으면 됩니다. (전체 주소가 아니라 **sitemap 파일 경로**만 넣어도 됩니다.)
     - 예: `sitemap-detail.xml`  
     - 또는 전체: `https://nyangmong.com/sitemap-detail.xml`

5. **제출 후 확인**  
   - 목록에 “사이트맵 제출됨” 상태로 나타납니다.
   - 처음에는 “가져오는 중” → 시간이 지나면 “성공” 또는 “오류 있음”으로 바뀝니다.
   - **“발견된 URL”** 숫자를 보면, Google이 sitemap에서 인식한 URL 개수를 확인할 수 있습니다.

### 3-3. Google에서 자주 하는 확인

- **robots.txt**  
  우리는 이미 `robots.txt`에  
  `Sitemap: https://nyangmong.com/sitemap.xml`  
  `Sitemap: https://nyangmong.com/sitemap-detail.xml`  
  를 넣어 두었기 때문에, Google이 이 주소로 sitemap을 찾아갑니다.  
  Search Console에 제출하는 것은 “이 sitemap도 사용 중이다”를 명시적으로 알려 주는 단계입니다.
- **오류가 나면**  
  - “일부 URL에 오류가 있습니다” 등이 뜨면, 해당 URL을 클릭해 어떤 오류인지 확인합니다.  
  - 404, 500, 리다이렉트 문제, 로봇 차단 등이 원인일 수 있습니다.  
  - sitemap-detail.xml의 `<loc>` URL을 브라우저에서 직접 열어서 “실제로 페이지가 뜨는지” 확인하는 것이 좋습니다.

---

## 4. 다른 검색엔진(네이버, Bing 등)에는 어떻게 적용하나요?

### 4-1. 공통: robots.txt

- 우리 `robots.txt`에 이미 다음이 들어가 있습니다.
  ```
  Sitemap: https://nyangmong.com/sitemap.xml
  Sitemap: https://nyangmong.com/sitemap-detail.xml
  ```
- **대부분의 검색엔진**은 robots.txt를 읽고 위 Sitemap 주소를 따라가 sitemap을 수집합니다.  
  즉, **추가로 할 일 없이** sitemap.xml과 sitemap-detail.xml이 자동으로 사용됩니다.

### 4-2. 네이버 서치어드바이저 (선택)

- **목적**: 네이버 검색 노출·관리를 위한 도구.
- **방법**  
  1. [네이버 서치어드바이저](https://searchadvisor.naver.com/) 로그인  
  2. 사이트 등록 후  
  3. **요청 → 사이트맵 제출** 메뉴에서  
     - `https://nyangmong.com/sitemap.xml`  
     - `https://nyangmong.com/sitemap-detail.xml`  
     를 제출할 수 있습니다.  
- robots.txt에 이미 있으므로, 제출하지 않아도 네이버가 찾아갈 수는 있지만, **제출해 두면** “이 sitemap을 쓰고 있다”를 명시할 수 있습니다.

### 4-3. Bing Webmaster Tools (선택)

- **목적**: Bing(및 Yahoo 등) 검색 수집·관리.
- **방법**  
  1. [Bing Webmaster Tools](https://www.bing.com/webmasters) 로그인  
  2. 사이트 추가 후  
  3. **Sitemaps** 메뉴에서  
     - `https://nyangmong.com/sitemap.xml`  
     - `https://nyangmong.com/sitemap-detail.xml`  
     제출.  
- Google과 마찬가지로 “Sitemaps” 또는 “사이트맵” 메뉴에서 URL만 넣고 제출하면 됩니다.

### 4-4. 요약

| 검색엔진 | 적용 방법 |
|----------|------------|
| **Google** | Search Console → 색인 생성 → Sitemaps → `sitemap.xml`, `sitemap-detail.xml` 제출 |
| **네이버** | 서치어드바이저에서 사이트맵 제출 (선택, robots.txt만으로도 발견 가능) |
| **Bing** | Webmaster Tools → Sitemaps에 위 두 sitemap URL 제출 (선택) |
| **기타** | robots.txt의 Sitemap 줄만 있으면 많은 엔진이 자동으로 사용 |

---

## 5. 한 줄 요약

- **확인**: `public/sitemap-detail.xml` (로컬) 또는 `https://nyangmong.com/sitemap-detail.xml` (배포 후) 에서 **URL 개수·ID·lastmod**가 어떻게 채워졌는지 보면 됩니다.
- **의미**: “지금 사이트에 있는 유기동물·행사 상세 페이지 목록”을 검색엔진에 알려 주는 파일입니다.
- **효과**: 상세 페이지의 **발견·수집·색인**을 도와 검색 노출 가능성을 높입니다.
- **적용**:  
  - **Google**: Search Console → 색인 생성 → Sitemaps에서 `sitemap.xml`, `sitemap-detail.xml` 제출.  
  - **그 외**: robots.txt에 이미 등록되어 있으므로 대부분 자동 적용되며, 네이버/빙은 각 도구에서 sitemap URL을 추가 제출할 수 있습니다.
