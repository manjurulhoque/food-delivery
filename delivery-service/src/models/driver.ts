import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from "typeorm";

@Entity("drivers")
export class Driver {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index({ unique: true })
    @Column()
    userId!: number;

    @Column({ type: "varchar", nullable: true })
    email!: string | null;

    @Column({ type: "varchar", nullable: true })
    phone!: string | null;

    @Column({ default: false })
    isOnline!: boolean;

    @Column({ type: "varchar", nullable: true })
    vehicleType!: string | null;

    @Column({ type: "varchar", nullable: true })
    licensePlate!: string | null;

    @Column({ type: "double precision", nullable: true })
    latitude!: number | null;

    @Column({ type: "double precision", nullable: true })
    longitude!: number | null;

    @Column({ type: "timestamptz", nullable: true })
    lastLocationAt!: Date | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
