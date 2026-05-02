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
    image_path: string | null;
    restaurant: Restaurant;
    category: MenuCategory | null;
};

type AvailableMenusResponse = {
    data: AvailableMenu[];
    success: boolean;
    pagination?: {
        count: number;
        next: string | null;
        previous: string | null;
        page: number;
        page_size: number;
    };
};

type MenuCategoriesResponse = {
    data: MenuCategory[];
    success: boolean;
};

type RestaurantsResponse = {
    data: Restaurant[];
    success: boolean;
};

type BasicApiResponse<T> = {
    data: T;
    success: boolean;
};

export const restaurantApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getAvailableMenus: builder.query<
            AvailableMenusResponse,
            { page?: number; page_size?: number } | void
        >({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.set("page", String(params.page));
                if (params?.page_size) queryParams.set("page_size", String(params.page_size));
                const suffix = queryParams.toString() ? `?${queryParams.toString()}` : "";
                return {
                    url: `${RESTAURANT_BASE_URL}/menus/all/${suffix}`,
                    method: "GET",
                };
            },
            providesTags: ["Menu", "Restaurant"],
        }),
        getMenuById: builder.query<BasicApiResponse<AvailableMenu>, number>({
            query: (menuId) => ({
                url: `${RESTAURANT_BASE_URL}/menus/detail/${menuId}/`,
                method: "GET",
            }),
            providesTags: (_result, _err, menuId) => [{ type: "Menu", id: menuId }],
        }),
        getMenuCategories: builder.query<MenuCategoriesResponse, void>({
            query: () => ({
                url: `${RESTAURANT_BASE_URL}/menu-categories/`,
                method: "GET",
            }),
            providesTags: ["Menu"],
        }),
        createMenuCategory: builder.mutation<BasicApiResponse<MenuCategory>, { name: string }>({
            query: (payload) => ({
                url: `${RESTAURANT_BASE_URL}/menu-categories/create/`,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Menu"],
        }),
        updateMenuCategory: builder.mutation<
            BasicApiResponse<MenuCategory>,
            { categoryId: number; name: string }
        >({
            query: ({ categoryId, name }) => ({
                url: `${RESTAURANT_BASE_URL}/menu-categories/${categoryId}/`,
                method: "PUT",
                body: { name },
            }),
            invalidatesTags: ["Menu"],
        }),
        deleteMenuCategory: builder.mutation<BasicApiResponse<null>, { categoryId: number }>({
            query: ({ categoryId }) => ({
                url: `${RESTAURANT_BASE_URL}/menu-categories/${categoryId}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Menu"],
        }),
        getRestaurants: builder.query<RestaurantsResponse, void>({
            query: () => ({
                url: `${RESTAURANT_BASE_URL}/`,
                method: "GET",
            }),
            providesTags: ["Restaurant"],
        }),
        createRestaurant: builder.mutation<
            BasicApiResponse<Restaurant>,
            { name: string; address: string; phone: string; accessToken?: string }
        >({
            query: ({ accessToken, ...payload }) => ({
                url: `${RESTAURANT_BASE_URL}/create/`,
                method: "POST",
                body: payload,
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            }),
            invalidatesTags: ["Restaurant"],
        }),
        updateRestaurant: builder.mutation<
            BasicApiResponse<Restaurant>,
            {
                restaurantId: number;
                name: string;
                address: string;
                phone: string;
                user_id: number;
                accessToken?: string;
            }
        >({
            query: ({ restaurantId, accessToken, ...payload }) => ({
                url: `${RESTAURANT_BASE_URL}/${restaurantId}/`,
                method: "PUT",
                body: payload,
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            }),
            invalidatesTags: ["Restaurant"],
        }),
        deleteRestaurant: builder.mutation<
            BasicApiResponse<null>,
            { restaurantId: number; accessToken?: string }
        >({
            query: ({ restaurantId, accessToken }) => ({
                url: `${RESTAURANT_BASE_URL}/${restaurantId}/`,
                method: "DELETE",
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            }),
            invalidatesTags: ["Restaurant", "Menu"],
        }),
        createMenu: builder.mutation<
            BasicApiResponse<AvailableMenu>,
            {
                restaurantId: number;
                name: string;
                price: number;
                category?: number | null;
                image?: File | null;
                accessToken?: string;
            }
        >({
            query: ({ restaurantId, accessToken, name, price, category, image }) => {
                const formData = new FormData();
                formData.append("restaurant", String(restaurantId));
                formData.append("name", name);
                formData.append("price", String(price));
                if (category !== undefined && category !== null) {
                    formData.append("category", String(category));
                }
                if (image) {
                    formData.append("image", image);
                }
                return {
                url: `${RESTAURANT_BASE_URL}/${restaurantId}/menus/create/`,
                method: "POST",
                body: formData,
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
                };
            },
            invalidatesTags: ["Menu"],
        }),
        updateMenu: builder.mutation<
            BasicApiResponse<AvailableMenu>,
            {
                restaurantId: number;
                menuId: number;
                name: string;
                price: number;
                category?: number | null;
                image?: File | null;
                accessToken?: string;
            }
        >({
            query: ({ restaurantId, menuId, accessToken, name, price, category, image }) => {
                const formData = new FormData();
                formData.append("restaurant", String(restaurantId));
                formData.append("name", name);
                formData.append("price", String(price));
                if (category !== undefined) {
                    if (category === null) {
                        formData.append("category", "");
                    } else {
                        formData.append("category", String(category));
                    }
                }
                if (image) {
                    formData.append("image", image);
                }
                return {
                url: `${RESTAURANT_BASE_URL}/${restaurantId}/menus/${menuId}/`,
                method: "PUT",
                body: formData,
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
                };
            },
            invalidatesTags: ["Menu"],
        }),
        deleteMenu: builder.mutation<
            BasicApiResponse<null>,
            { restaurantId: number; menuId: number; accessToken?: string }
        >({
            query: ({ restaurantId, menuId, accessToken }) => ({
                url: `${RESTAURANT_BASE_URL}/${restaurantId}/menus/${menuId}/`,
                method: "DELETE",
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            }),
            invalidatesTags: ["Menu"],
        }),
    }),
});

export const {
    useGetAvailableMenusQuery,
    useGetMenuByIdQuery,
    useGetMenuCategoriesQuery,
    useCreateMenuCategoryMutation,
    useUpdateMenuCategoryMutation,
    useDeleteMenuCategoryMutation,
    useGetRestaurantsQuery,
    useCreateRestaurantMutation,
    useUpdateRestaurantMutation,
    useDeleteRestaurantMutation,
    useCreateMenuMutation,
    useUpdateMenuMutation,
    useDeleteMenuMutation,
} = restaurantApi;
