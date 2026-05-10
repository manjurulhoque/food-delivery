"use client";

import { Provider } from "react-redux";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { store } from "@/lib/store";

function SessionRefreshErrorHandler() {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.error === "RefreshAccessTokenError") {
            void signOut({ callbackUrl: "/login" });
        }
    }, [session?.error]);

    return null;
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <SessionProvider refetchInterval={4 * 60} refetchOnWindowFocus>
                <SessionRefreshErrorHandler />
                {children}
            </SessionProvider>
        </Provider>
    );
}
