import winston from "winston";

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to use based on environment
const level = () => {
    const env = process.env.NODE_ENV || "development";
    const isDevelopment = env === "development";
    return isDevelopment ? "debug" : "warn";
};

// Define different colors for each level
const colorize = winston.format.colorize({ all: true });

// Define format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    // winston.format.errors({ stack: true }),
    // winston.format.printf(
    //     (info) => `${info.timestamp} ${info.level}: ${info.message}`
    // ),
    winston.format.json(),
);

// Define transports
const transports = [
    // Console transport
    new winston.transports.Console({
        format: consoleFormat,
    }),
];

// Create the logger
const logger = winston.createLogger({
    level: level(),
    levels,
    format: consoleFormat,
    transports,
    // Do not exit on handled exceptions
    exitOnError: false,
});

// Create a stream object with a 'write' function that will be used by morgan
// export const morganStream = {
//     write: (message: string) => {
//         logger.http(message.trim());
//     },
// };

export default logger;
