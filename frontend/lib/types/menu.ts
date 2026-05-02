import { MenuCategory } from "@/lib/types/menu-category";
import { Restaurant } from "@/lib/types/restaurant";

export type Menu = {
    id: number;
    name: string;
    category: MenuCategory | null;
    price: number;
    image_path: string | null;
    restaurant: Restaurant | null;
    rating: number;
    reviews: number;
    deliveryTime: string;
    description: string;
    ingredients: string[];
    location: string;
    created: Date;
    updated: Date;
};
