import express from "express";
import { DriverService } from "../services/driver.service";
import logger from "../config/logger";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = express.Router();
const driverService = new DriverService();

router.get(
    "/",
    authMiddleware,
    requireRole("is_superuser"),
    async (_req, res) => {
        try {
            const drivers = await driverService.listProfiles();
            res.json(drivers);
        } catch (error) {
            logger.error("Error listing drivers:", error);
            res.status(500).json({ error: "Failed to list drivers" });
        }
    },
);

router.get(
    "/available",
    authMiddleware,
    requireRole("is_superuser"),
    async (_req, res) => {
        try {
            const drivers = await driverService.getAvailableDrivers();
            res.json(drivers);
        } catch (error) {
            logger.error("Error getting available drivers:", error);
            res.status(500).json({ error: "Failed to get available drivers" });
        }
    },
);

router.post(
    "/sync",
    authMiddleware,
    requireRole("is_superuser"),
    async (_req, res) => {
        try {
            const result = await driverService.syncFromAuth();
            res.json(result);
        } catch (error) {
            logger.error("Error syncing drivers:", error);
            res.status(500).json({
                error: "Failed to sync drivers from auth-service",
            });
        }
    },
);

router.post("/", authMiddleware, async (req, res) => {
    try {
        const profile = await driverService.createProfile(req.body);
        res.status(201).json(profile);
    } catch (error) {
        logger.error("Error creating driver profile:", error);
        res.status(400).json({ error: "Failed to create driver profile" });
    }
});

router.get("/:userId", authMiddleware, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (!Number.isFinite(userId)) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        if (req.user && req.user.id !== userId && !req.user.is_superuser) {
            return res.status(403).json({ error: "Access denied" });
        }

        const profile = await driverService.getByUserId(userId);
        if (!profile) {
            return res.status(404).json({ error: "Driver profile not found" });
        }
        res.json(profile);
    } catch (error) {
        logger.error("Error getting driver profile:", error);
        res.status(500).json({ error: "Failed to get driver profile" });
    }
});

router.patch("/:userId/availability", authMiddleware, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (!Number.isFinite(userId)) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        if (req.user && req.user.id !== userId && !req.user.is_superuser) {
            return res.status(403).json({ error: "Access denied" });
        }

        const { isOnline } = req.body;
        if (typeof isOnline !== "boolean") {
            return res
                .status(400)
                .json({ error: "isOnline must be a boolean" });
        }

        const profile = await driverService.setAvailability(userId, isOnline);
        if (!profile) {
            return res.status(404).json({ error: "Driver profile not found" });
        }
        res.json(profile);
    } catch (error) {
        logger.error("Error updating driver availability:", error);
        res.status(500).json({ error: "Failed to update driver availability" });
    }
});

router.patch("/:userId/location", authMiddleware, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (!Number.isFinite(userId)) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        if (req.user && req.user.id !== userId && !req.user.is_superuser) {
            return res.status(403).json({ error: "Access denied" });
        }

        const { location } = req.body;
        if (
            !location ||
            typeof location.latitude !== "number" ||
            typeof location.longitude !== "number"
        ) {
            return res
                .status(400)
                .json({ error: "location with latitude/longitude required" });
        }

        const profile = await driverService.updateLocation(userId, location);
        if (!profile) {
            return res.status(404).json({ error: "Driver profile not found" });
        }
        res.json(profile);
    } catch (error) {
        logger.error("Error updating driver location:", error);
        res.status(500).json({ error: "Failed to update driver location" });
    }
});

export default router;
