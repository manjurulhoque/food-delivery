import { api, RESTAURANT_BASE_URL } from "@/lib/services/api";

export type MenuCategory = {
    id: number;
    name: string;
    created: string;
    updated: string;
};

export type Restaurant = {
    id: number;
    name: string;
    address: string;
    phone: string;
    user_id: number;
    created: string;
    updated: string;
};

export type AvailableMenu = {
    id: number;
    name: string;
    price: number;
    created: string;
    updated: string;
    restaurant: Restaurant;
    category: MenuCategory | null;
};

type AvailableMenusResponse = {
    data: AvailableMenu[];
    success: boolean;
};

type MenuCategoriesResponse = {
    data: MenuCategory[];
    success: boolean;
};

export const restaurantApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAvailableMenus: builder.query<AvailableMenusResponse, void>({
            query: () => ({
                url: `${RESTAURANT_BASE_URL}/menus/all/`,
                method: "GET",
            }),
            providesTags: ["Menu", "Restaurant"],
        }),
        getMenuCategories: builder.query<MenuCategoriesResponse, void>({
            query: () => ({
                url: `${RESTAURANT_BASE_URL}/menu-categories/`,
                method: "GET",
            }),
            providesTags: ["Menu"],
        }),
    }),
});

export const { useGetAvailableMenusQuery, useGetMenuCategoriesQuery } = restaurantApi;
