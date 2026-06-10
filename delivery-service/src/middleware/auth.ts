import { Request, Response, NextFunction } from "express";
import axios from "axios";
import logger from "../config/logger";
import { AuthUser } from "@/types/user";

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

const AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || "http://auth-service:5000";

function getBearerToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.split(" ")[1];
}

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const token = getBearerToken(req);
    if (!token) {
        res.status(401).json({ error: "No valid token provided" });
        return;
    }

    try {
        const response = await axios.post(
            `${AUTH_SERVICE_URL}/verify/`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000,
            },
        );

        const user = response.data?.data?.user;
        if (!user) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        logger.error("Auth service error:", error);
        res.status(503).json({ error: "Authentication service unavailable" });
    }
}

export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const hasRole = roles.some(
            (role) =>
                (req.user as unknown as Record<string, unknown>)[role] === true,
        );
        if (!hasRole) {
            res.status(403).json({ error: "Insufficient permissions" });
            return;
        }

        next();
    };
}
