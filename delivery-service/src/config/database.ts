import { DataSource } from "typeorm";
import { Delivery } from "../models/delivery";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST || "postgres",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    username: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || "postgres",
    database: process.env.DATABASE_NAME || "food_deliveries",
    synchronize: true,
    logging: true,
    entities: [Delivery],
    subscribers: [],
    migrations: [],
});
