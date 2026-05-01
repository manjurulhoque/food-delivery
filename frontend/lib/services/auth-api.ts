import { api, AUTH_BASE_URL } from "@/lib/services/api";

export type AuthUser = {
    id: number;
    email: string;
    is_customer: boolean;
    is_restaurant: boolean;
    is_driver: boolean;
    is_superuser: boolean;
};

export type LoginResponse = {
    refresh: string;
    access: string;
};

type ApiErrorPayload = {
    error?: string;
    message?: string;
    detail?: string;
    [key: string]: unknown;
};

function buildErrorMessage(payload: ApiErrorPayload, fallback: string) {
    if (typeof payload.error === "string") return payload.error;
    if (typeof payload.message === "string") return payload.message;
    if (typeof payload.detail === "string") return payload.detail;
    return fallback;
}

async function parseJsonSafe(response: Response) {
    try {
        return (await response.json()) as ApiErrorPayload;
    } catch {
        return {};
    }
}

type RegisterRequest = {
    email: string;
    password: string;
    is_customer?: boolean;
    is_restaurant?: boolean;
    is_driver?: boolean;
};

type RegisterResponse = {
    message?: string;
};

type VerifyTokenResponse = {
    data?: {
        user?: AuthUser;
    };
};

type GetUserResponse = {
    user?: AuthUser;
};

export async function login(payload: { email: string; password: string }): Promise<LoginResponse> {
    const response = await fetch(`${AUTH_BASE_URL}/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = (await parseJsonSafe(response)) as LoginResponse & ApiErrorPayload;
    if (!response.ok) {
        throw new Error(buildErrorMessage(data, "Login failed"));
    }

    if (!data.access || !data.refresh) {
        throw new Error("Auth service did not return tokens");
    }

    return {
        access: data.access,
        refresh: data.refresh,
    };
}

export async function fetchUserById(userId: number): Promise<AuthUser | null> {
    const response = await fetch(`${AUTH_BASE_URL}/users/${userId}/`, {
        method: "GET",
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
        return null;
    }

    const user = (data as { user?: AuthUser }).user;
    return user ?? null;
}

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (payload) => ({
                url: "/api/auth/register/",
                method: "POST",
                body: {
                    is_customer: true,
                    ...payload,
                },
            }),
            invalidatesTags: ["Auth"],
        }),
        login: builder.mutation<LoginResponse, { email: string; password: string }>({
            query: (payload) => ({
                url: "/api/auth/login/",
                method: "POST",
                body: payload,
            }),
        }),
        verifyToken: builder.mutation<VerifyTokenResponse, string>({
            query: (accessToken) => ({
                url: "/api/auth/verify/",
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }),
        }),
        getUserById: builder.query<GetUserResponse, number>({
            query: (userId) => ({
                url: `/api/auth/users/${userId}/`,
                method: "GET",
            }),
            providesTags: (_result, _error, userId) => [{ type: "Auth", id: String(userId) }],
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useVerifyTokenMutation,
    useGetUserByIdQuery,
} = authApi;
