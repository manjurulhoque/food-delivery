import express from "express";
import { DeliveryService } from "../services/delivery.service";

const router = express.Router();
const deliveryService = new DeliveryService();

router.post("/", async (req, res) => {
    try {
        const deliveryData = req.body;
        const delivery = await deliveryService.createDelivery(deliveryData);
        res.status(201).json(delivery);
    } catch (error) {
        console.error("Error creating delivery:", error);
        res.status(500).json({ error: "Failed to create delivery" });
    }
});

router.get("/active", async (_req, res) => {
    try {
        const deliveries = await deliveryService.getActiveDeliveries();
        res.json(deliveries);
    } catch (error) {
        console.error("Error getting active deliveries:", error);
        res.status(500).json({ error: "Failed to get active deliveries" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const delivery = await deliveryService.getDeliveryById(id);
        if (!delivery) {
            return res.status(404).json({ error: "Delivery not found" });
        }
        res.json(delivery);
    } catch (error) {
        console.error("Error getting delivery:", error);
        res.status(500).json({ error: "Failed to get delivery" });
    }
});

router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const delivery = await deliveryService.updateDeliveryStatus(id, status);
        if (!delivery) {
            return res.status(404).json({ error: "Delivery not found" });
        }
        res.json(delivery);
    } catch (error) {
        console.error("Error updating delivery status:", error);
        res.status(500).json({ error: "Failed to update delivery status" });
    }
});

router.post("/:id/assign", async (req, res) => {
    try {
        const { id } = req.params;
        const { driverId } = req.body;
        const delivery = await deliveryService.assignDriver(id, driverId);
        if (!delivery) {
            return res.status(400).json({
                error: "Failed to assign driver (profile missing, offline, or busy)",
            });
        }
        res.json(delivery);
    } catch (error) {
        console.error("Error assigning driver:", error);
        res.status(500).json({ error: "Failed to assign driver" });
    }
});

export default router;
