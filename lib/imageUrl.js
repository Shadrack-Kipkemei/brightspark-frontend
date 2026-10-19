const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(
    /\/api\/?$/,
    ""
  ) || "http://127.0.0.1:5000";

export function getImageUrl(
  imageUrl
) {
  if (!imageUrl) {
    return "/placeholder-product.png";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${BACKEND_ORIGIN}${imageUrl}`;
}