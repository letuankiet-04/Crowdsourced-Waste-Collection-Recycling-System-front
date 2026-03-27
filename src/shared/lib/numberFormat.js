export function toFiniteNumber(value) {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatNumber(value, options = {}, fallback = "—") {
  const n = toFiniteNumber(value);
  if (n === null) return fallback;
  return new Intl.NumberFormat("vi-VN", options).format(n);
}

export function formatPoints(value, options = {}) {
  const n = toFiniteNumber(value);
  if (n === null) return "0";

  const rounded = Math.round(n);
  const isIntLike = Math.abs(n - rounded) < 1e-9;
  const fmtOptions = isIntLike
    ? { maximumFractionDigits: 0, ...options }
    : { maximumFractionDigits: 2, ...options };

  return new Intl.NumberFormat("vi-VN", fmtOptions).format(isIntLike ? rounded : n);
}

export function formatSignedPoints(value, options = {}) {
  const n = toFiniteNumber(value) ?? 0;
  const sign = n < 0 ? "-" : "+";
  return `${sign}${formatPoints(Math.abs(n), options)}`;
}

