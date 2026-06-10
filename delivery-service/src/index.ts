import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import deliveryRoutes from "./routes/delivery";
import driverRoutes from "./routes/driver";
import { AppDataSource } from "./config/database";
import { DeliveryService } from "./services/delivery.service";
import { connectProducer, disconnectProducer } from "./kafka/producer";
import {
    startPaymentCompletedConsumer,
    stopPaymentCompletedConsumer,
} from "./kafka/consumer";

dotenv.config();

const app = express();
const port = process.env.PORT || 5004;

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Driver routes must be registered before delivery /:id or "drivers" is treated as a UUID
app.use("/drivers", driverRoutes);
app.use("/", deliveryRoutes);

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

async function bootstrap() {
    await AppDataSource.initialize();
    console.log("Database connection established");

    const deliveryService = new DeliveryService();
    await connectProducer();
    await startPaymentCompletedConsumer(deliveryService);

    app.listen(port, () => {
        console.log(`Delivery service is running on port ${port}`);
    });
}

bootstrap().catch((error) => {
    console.error("Failed to start delivery-service:", error);
    process.exit(1);
});

async function shutdown() {
    await stopPaymentCompletedConsumer();
    await disconnectProducer();
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
