import "reflect-metadata";
import { AppDataSource } from "../config/database";
import logger from "../config/logger";
import { DriverService } from "../services/driver.service";

async function main() {
    await AppDataSource.initialize();
    const driverService = new DriverService();
    const result = await driverService.syncFromAuth();

    logger.info(
        `Driver seed complete: created=${result.created}, skipped=${result.skipped}`,
    );

    await AppDataSource.destroy();
}

main().catch((error) => {
    logger.error("Driver seed failed:", error);
    process.exit(1);
});
