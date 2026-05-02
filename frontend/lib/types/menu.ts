export type Menu = {
    id: number;
    name: string;
    category: string;
    price: number;
    emoji: string;
    image_path: string | null;
    restaurant: string;
    rating: number;
    reviews: number;
    deliveryTime: string;
    description: string;
    ingredients: string[];
    location: string;
};
