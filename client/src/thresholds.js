const STORAGE_KEY = "tagThresholds";

export function loadThresholds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveThresholds(thresholds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds));
  window.dispatchEvent(new Event("thresholds-updated"));
}

export function isOutOfRange(value, threshold) {
  if (typeof value !== "number" || !threshold) return false;
  if (typeof threshold.max === "number" && value > threshold.max) return true;
  if (typeof threshold.min === "number" && value < threshold.min) return true;
  return false;
}
