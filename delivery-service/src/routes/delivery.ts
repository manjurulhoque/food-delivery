import express from "express";
import { DeliveryService } from "../services/delivery.service";
import logger from "../config/logger";

const router = express.Router();
const deliveryService = new DeliveryService();

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isDeliveryId(value: string): boolean {
    return UUID_RE.test(value);
}

router.post("/", async (req, res) => {
    try {
        const deliveryData = req.body;
        const delivery = await deliveryService.createDelivery(deliveryData);
        res.status(201).json(delivery);
    } catch (error) {
        logger.error("Error creating delivery:", error);
        res.status(500).json({ error: "Failed to create delivery" });
    }
});

router.get("/", async (_req, res) => {
    try {
        const deliveries = await deliveryService.listDeliveries();
        res.json(deliveries);
    } catch (error) {
        logger.error("Error listing deliveries:", error);
        res.status(500).json({ error: "Failed to list deliveries" });
    }
});

router.get("/by-order/:orderId", async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId, 10);
        if (!Number.isFinite(orderId)) {
            return res.status(400).json({ error: "Invalid order id" });
        }

        const delivery = await deliveryService.getDeliveryByOrderId(
            String(orderId),
        );
        if (!delivery) {
            return res
                .status(404)
                .json({ error: "Delivery not found for order" });
        }
        res.json(delivery);
    } catch (error) {
        logger.error("Error getting delivery by order:", error);
        res.status(500).json({ error: "Failed to get delivery for order" });
    }
});

router.post("/by-order/:orderId/assign", async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId, 10);
        if (!Number.isFinite(orderId)) {
            return res.status(400).json({ error: "Invalid order id" });
        }

        const { driverId } = req.body;
        if (driverId === undefined || driverId === null || driverId === "") {
            return res.status(400).json({ error: "driverId is required" });
        }

        const delivery = await deliveryService.assignDriverToOrder(
            orderId,
            String(driverId),
        );
        if (!delivery) {
            return res.status(400).json({
                error: "Failed to assign driver (profile missing or driver busy on another delivery)",
            });
        }
        res.json(delivery);
    } catch (error) {
        logger.error("Error assigning driver to order:", error);
        res.status(500).json({ error: "Failed to assign driver to order" });
    }
});

router.get("/active", async (_req, res) => {
    try {
        const deliveries = await deliveryService.getActiveDeliveries();
        res.json(deliveries);
    } catch (error) {
        logger.error("Error getting active deliveries:", error);
        res.status(500).json({ error: "Failed to get active deliveries" });
    }
});

router.get("/driver/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (!Number.isFinite(userId)) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        const deliveries = await deliveryService.getDeliveriesByDriver(userId);
        res.json(deliveries);
    } catch (error) {
        logger.error("Error getting deliveries by driver:", error);
        res.status(500).json({ error: "Failed to get deliveries for driver" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!isDeliveryId(id)) {
            return res.status(404).json({ error: "Delivery not found" });
        }
        const delivery = await deliveryService.getDeliveryById(id);
        if (!delivery) {
            return res.status(404).json({ error: "Delivery not found" });
        }
        res.json(delivery);
    } catch (error) {
        logger.error("Error getting delivery:", error);
        res.status(500).json({ error: "Failed to get delivery" });
    }
});

router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        if (!isDeliveryId(id)) {
            return res.status(404).json({ error: "Delivery not found" });
        }
        const { status } = req.body;
        const delivery = await deliveryService.updateDeliveryStatus(id, status);
        if (!delivery) {
            return res.status(404).json({ error: "Delivery not found" });
        }
        res.json(delivery);
    } catch (error) {
        logger.error("Error updating delivery status:", error);
        res.status(500).json({ error: "Failed to update delivery status" });
    }
});

router.post("/:id/assign", async (req, res) => {
    try {
        const { id } = req.params;
        if (!isDeliveryId(id)) {
            return res.status(404).json({ error: "Delivery not found" });
        }
        const { driverId } = req.body;
        const delivery = await deliveryService.assignDriver(id, driverId);
        if (!delivery) {
            return res.status(400).json({
                error: "Failed to assign driver (profile missing, offline, or busy)",
            });
        }
        res.json(delivery);
    } catch (error) {
        logger.error("Error assigning driver:", error);
        res.status(500).json({ error: "Failed to assign driver" });
    }
});

export default router;
