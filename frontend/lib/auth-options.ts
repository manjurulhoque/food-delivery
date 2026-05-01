import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { fetchUserById, login } from "@/lib/services/auth-api";

type JwtPayload = {
    user_id?: number | string;
    sub?: string;
};

function decodeJwtPayload(token: string): JwtPayload | null {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    try {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const payload = Buffer.from(padded, "base64").toString("utf-8");
        return JSON.parse(payload) as JwtPayload;
    } catch {
        return null;
    }
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = String(credentials?.email ?? "");
                const password = String(credentials?.password ?? "");

                if (!email || !password) return null;

                try {
                    const tokens = await login({ email, password });
                    const payload = decodeJwtPayload(tokens.access);
                    const userId = Number(payload?.user_id ?? payload?.sub);
                    const user = Number.isFinite(userId) ? await fetchUserById(userId) : null;

                    if (!user) return null;

                    return {
                        id: String(user.id),
                        email: user.email,
                        accessToken: tokens.access,
                        refreshToken: tokens.refresh,
                        is_customer: user.is_customer,
                        is_restaurant: user.is_restaurant,
                        is_driver: user.is_driver,
                        is_superuser: user.is_superuser,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.is_customer = user.is_customer;
                token.is_restaurant = user.is_restaurant;
                token.is_driver = user.is_driver;
                token.is_superuser = user.is_superuser;
            }

            return token;
        },
        async session({ session, token }) {
            session.user.id = String(token.id ?? "");
            session.user.email = String(token.email ?? "");
            session.user.is_customer = Boolean(token.is_customer);
            session.user.is_restaurant = Boolean(token.is_restaurant);
            session.user.is_driver = Boolean(token.is_driver);
            session.user.is_superuser = Boolean(token.is_superuser);
            session.accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined;
            session.refreshToken = typeof token.refreshToken === "string" ? token.refreshToken : undefined;

            return session;
        },
    },
};
