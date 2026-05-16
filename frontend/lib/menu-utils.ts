import { Menu } from "@/lib/types/menu";
import { Restaurant } from "@/lib/types/restaurant";

/** API menu rows may omit UI-only fields; fill defaults for cards and bag. */
export function enrichMenu(
    raw: Partial<Menu> & Pick<Menu, "id" | "name" | "price">,
    restaurantOverride?: Restaurant | null
): Menu {
    const restaurant = restaurantOverride ?? raw.restaurant ?? null;
    return {
        id: raw.id,
        name: raw.name,
        price: raw.price,
        category: raw.category ?? null,
        image_path: raw.image_path ?? null,
        restaurant,
        rating: raw.rating ?? Number((4.0 + (raw.id % 10) / 10).toFixed(1)),
        reviews: raw.reviews ?? 20 + raw.id * 2,
        deliveryTime: raw.deliveryTime ?? "25–35 min",
        description: raw.description ?? "",
        ingredients: raw.ingredients ?? [],
        location: raw.location ?? restaurant?.address ?? "",
        created: raw.created ? new Date(raw.created) : new Date(),
        updated: raw.updated ? new Date(raw.updated) : new Date(),
    };
}
