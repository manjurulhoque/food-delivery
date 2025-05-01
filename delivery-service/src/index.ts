import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { Kafka } from "kafkajs";
import deliveryRoutes from "./routes/delivery";
import { AppDataSource } from "./config/database";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5004;

// Middleware
app.use(express.json());

// Initialize Kafka
const kafka = new Kafka({
    clientId: "delivery-service",
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || "kafka:9092"],
});

// Initialize database connection
AppDataSource.initialize()
    .then(() => {
        console.log("Database connection established");
    })
    .catch((error) => {
        console.error("Error during database initialization:", error);
    });

// Routes
app.use("/api/deliveries", deliveryRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Error handling middleware
app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error(err.stack);
        res.status(500).json({ error: "Something went wrong!" });
    }
);

// Start the server
app.listen(port, () => {
    console.log(`Delivery service is running on port ${port}`);
});
