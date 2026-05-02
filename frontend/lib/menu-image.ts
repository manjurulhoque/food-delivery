const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:7000";

/**
 * Turn API menu image path into an absolute URL for <img src>.
 * Relative paths (e.g. /restaurant-service-media/menus/...) are resolved via Kong so media routes match Django MEDIA_URL.
 */
export function resolveMenuImageUrl(image: string | null | undefined): string | null {
    return image ? `${API_GATEWAY_URL}${image}` : null;
}
