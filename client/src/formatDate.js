function pad(n) {
  return String(n).padStart(2, "0");
}

function toDate(iso) {
  return typeof iso === "string" ? new Date(iso.endsWith("Z") ? iso : iso + "Z") : iso;
}

export function formatDateTime(iso) {
  const d = toDate(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

export function formatTimeOnly(iso) {
  const d = toDate(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatDateTimeForFilename(iso) {
  const d = toDate(iso);
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}_${pad(d.getHours())}-${pad(
    d.getMinutes()
  )}-${pad(d.getSeconds())}`;
}
