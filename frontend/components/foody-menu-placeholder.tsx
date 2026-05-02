import Image from "next/image";
import { cn } from "@/lib/utils";

/** Public asset path – use with next/image or <img>. */
export const FOODY_MENU_PLACEHOLDER_SRC = "/foody-menu-placeholder.svg";

type FoodyMenuPlaceholderProps = {
    className?: string;
    label?: string;
    size?: number;
};

/**
 * Foody-branded fallback when a menu item has no photo (same spirit as delivery-app grey placeholders).
 */
export function FoodyMenuPlaceholder({
    className,
    label = "Menu image coming soon",
    size = 80,
}: FoodyMenuPlaceholderProps) {
    return (
        <Image
            src={FOODY_MENU_PLACEHOLDER_SRC}
            alt={label}
            width={size}
            height={size}
            className={cn("object-contain select-none", className)}
            unoptimized
        />
    );
}
