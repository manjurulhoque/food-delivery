import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { DeliveryStatus } from "../types/delivery";

@Entity("deliveries")
export class Delivery {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    orderId!: string;

    @Column({ nullable: true })
    driverId?: number; // This will reference the User.id from auth-service

    @Column({
        type: "enum",
        enum: DeliveryStatus,
        default: DeliveryStatus.PENDING,
    })
    status!: DeliveryStatus;

    @Column("jsonb")
    pickupLocation!: {
        latitude: number;
        longitude: number;
        address: string;
    };

    @Column("jsonb")
    deliveryLocation!: {
        latitude: number;
        longitude: number;
        address: string;
    };

    @Column()
    estimatedDeliveryTime!: Date;

    @Column({ nullable: true })
    actualDeliveryTime?: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
