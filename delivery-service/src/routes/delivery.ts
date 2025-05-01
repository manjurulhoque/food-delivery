import express from "express";
import { Delivery, DeliveryStatus } from "../types/delivery";
import { DeliveryService } from "../services/delivery.service";

const router = express.Router();
const deliveryService = new DeliveryService();

// Create a new delivery
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

// Get delivery by ID
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

// Update delivery status
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

// Assign driver to delivery
router.post("/:id/assign", async (req, res) => {
    try {
        const { id } = req.params;
        const { driverId } = req.body;
        const delivery = await deliveryService.assignDriver(id, driverId);
        if (!delivery) {
            return res.status(400).json({ error: "Failed to assign driver" });
        }
        res.json(delivery);
    } catch (error) {
        console.error("Error assigning driver:", error);
        res.status(500).json({ error: "Failed to assign driver" });
    }
});

// Get available drivers
router.get("/drivers/available", async (req, res) => {
    try {
        const drivers = await deliveryService.getAvailableDrivers();
        res.json(drivers);
    } catch (error) {
        console.error("Error getting available drivers:", error);
        res.status(500).json({ error: "Failed to get available drivers" });
    }
});

// Update driver location
router.patch("/drivers/:id/location", async (req, res) => {
    try {
        const { id } = req.params;
        const { location } = req.body;
        const success = await deliveryService.updateDriverLocation(
            id,
            location
        );
        if (!success) {
            return res
                .status(404)
                .json({ error: "Failed to update driver location" });
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Error updating driver location:", error);
        res.status(500).json({ error: "Failed to update driver location" });
    }
});

// Get active deliveries
router.get("/active", async (req, res) => {
    try {
        const deliveries = await deliveryService.getActiveDeliveries();
        res.json(deliveries);
    } catch (error) {
        console.error("Error getting active deliveries:", error);
        res.status(500).json({ error: "Failed to get active deliveries" });
    }
});

export default router;
