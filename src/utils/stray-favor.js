const STRAY_FAVOR_KEY = "stray_favor";
const MAX_FAVOR = 6;

function parse() {
  try {
    const raw = localStorage.getItem(STRAY_FAVOR_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

function save(arr) {
  const list = Array.isArray(arr) ? arr.slice(0, MAX_FAVOR) : [];
  localStorage.setItem(STRAY_FAVOR_KEY, JSON.stringify(list));
}

/** 즐겨찾기 desertionNo 배열 (최대 6개) */
export function getStrayFavorites() {
  return parse();
}

/** 즐겨찾기 추가. 이미 6개면 맨 앞 제거 후 맨 뒤에 추가 */
export function addStrayFavorite(desertionNo) {
  const id = String(desertionNo);
  let list = parse().filter((x) => x !== id);
  list.push(id);
  if (list.length > MAX_FAVOR) list = list.slice(-MAX_FAVOR);
  save(list);
  return list;
}

/** 즐겨찾기 제거 */
export function removeStrayFavorite(desertionNo) {
  const id = String(desertionNo);
  const list = parse().filter((x) => x !== id);
  save(list);
  return list;
}

/** 해당 번호가 즐겨찾기인지 */
export function isStrayFavorite(desertionNo) {
  return parse().includes(String(desertionNo));
}

/** 배열 전체가 숫자로만 이루어졌는지 */
export function areAllDigits(arr) {
  if (!Array.isArray(arr)) return false;
  return arr.every((x) => /^\d+$/.test(String(x).trim()));
}

/** 즐겨찾기 전체 삭제 */
export function clearAllStrayFavorites() {
  localStorage.removeItem(STRAY_FAVOR_KEY);
  return [];
}
