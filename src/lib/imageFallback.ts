export function fixImageUrl(url?: string | null, fallbackText: string = "Product"): string {
  if (
    !url ||
    typeof url !== "string" ||
    url.includes("via.placeholder.com") ||
    url.includes("placeholder.com") ||
    url.includes("placehold.co") ||
    url.includes("400x400") ||
    url.includes("200x200") ||
    url.includes("150x150") ||
    url.includes("100x100") ||
    url.includes("500x300") ||
    url.includes("80x80") ||
    url.includes("120x120") ||
    url.includes("600x400") ||
    url.includes("250x200") ||
    url.includes("300x300") ||
    url.includes("128x128") ||
    url.includes("48x48") ||
    url.includes("40x40") ||
    url.includes("32x32") ||
    url.includes("24x24") ||
    url.includes("800x400") ||
    url.includes("400x300") ||
    url.includes("1920x400") ||
    url.includes("60x60") ||
    url.includes("64x64") ||
    url.includes("96x96") ||
    url === "400x400" ||
    url === "200x200" ||
    url === "150x150" ||
    url === "100x100" ||
    url === "500x300" ||
    url === "120x120" ||
    url === "250x200" ||
    url === "600x400"
  ) {
    return placeholderSvg(fallbackText);
  }

  if (!/^(https?:\/\/|\/|data:image\/)/i.test(url)) {
    return placeholderSvg(fallbackText);
  }

  return url;
}

function placeholderSvg(fallbackText: string): string {
  const cleanText = (fallbackText || "Product").replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 20);
  const encodedText = encodeURIComponent(cleanText || "Product");
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="14" font-weight="600">${encodedText}</text></svg>`;
}
