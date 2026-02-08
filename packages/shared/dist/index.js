export function clampInt(n, opts) {
    const v = Math.round(Number(n));
    if (!Number.isFinite(v))
        return null;
    if (v < opts.min || v > opts.max)
        return null;
    return v;
}
export function normalizeTrimmedString(n, maxLen) {
    if (n === null || n === undefined)
        return null;
    const s = String(n).trim();
    if (!s)
        return null;
    if (s.length > maxLen)
        return null;
    return s;
}
