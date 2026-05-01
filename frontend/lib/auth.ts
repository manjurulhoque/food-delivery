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

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:7000";
const AUTH_BASE_URL = `${API_GATEWAY_URL}/api/auth`;

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

export async function register(payload: {
    email: string;
    password: string;
    is_customer?: boolean;
    is_restaurant?: boolean;
    is_driver?: boolean;
}) {
    const response = await fetch(`${AUTH_BASE_URL}/register/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            is_customer: true,
            ...payload,
        }),
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
        throw new Error(buildErrorMessage(data, "Registration failed"));
    }

    return data;
}

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

export async function verifyToken(accessToken: string): Promise<AuthUser | null> {
    const response = await fetch(`${AUTH_BASE_URL}/verify/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
        return null;
    }

    const user = (data as { data?: { user?: AuthUser } }).data?.user;
    return user ?? null;
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
