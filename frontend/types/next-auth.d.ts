import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            is_customer: boolean;
            is_restaurant: boolean;
            is_driver: boolean;
            is_superuser: boolean;
        } & DefaultSession["user"];
        accessToken?: string;
        refreshToken?: string;
    }

    interface User {
        id: string;
        email: string;
        accessToken: string;
        refreshToken: string;
        is_customer: boolean;
        is_restaurant: boolean;
        is_driver: boolean;
        is_superuser: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        email?: string;
        accessToken?: string;
        refreshToken?: string;
        is_customer?: boolean;
        is_restaurant?: boolean;
        is_driver?: boolean;
        is_superuser?: boolean;
    }
}
