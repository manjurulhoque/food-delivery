import Image from "next/image";
import { cn } from "@/lib/utils";

/** Public asset path – use with next/image or <img>. */
export const FOODY_RESTAURANT_PLACEHOLDER_SRC = "/foody-restaurant-placeholder.svg";

type FoodyRestaurantPlaceholderProps = {
    className?: string;
    label?: string;
    size?: number;
};

/**
 * Foody-branded fallback when a restaurant has no cover photo.
 */
export function FoodyRestaurantPlaceholder({
    className,
    label = "Restaurant image coming soon",
    size = 80,
}: FoodyRestaurantPlaceholderProps) {
    return (
        <Image
            src={FOODY_RESTAURANT_PLACEHOLDER_SRC}
            alt={label}
            width={size}
            height={size}
            className={cn("object-contain select-none", className)}
            unoptimized
        />
    );
}
