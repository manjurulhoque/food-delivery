import net from "net";
import { Writable } from "stream";

function createLogstashWritable(
    host: string,
    port: number,
    service: string,
): Writable {
    let socket: net.Socket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    function connect(): void {
        if (socket) return;
        socket = net.createConnection({ host, port }, () => {
            if (retryTimer) {
                clearTimeout(retryTimer);
                retryTimer = null;
            }
        });
        socket.on("error", () => close());
        socket.on("close", () => close());
    }

    function close(): void {
        socket = null;
        if (!retryTimer) {
            retryTimer = setTimeout(connect, 10_000);
        }
    }

    connect();

    return new Writable({
        write(chunk: Buffer, _encoding: string, callback: () => void) {
            if (socket && socket.writable) {
                let parsed: Record<string, unknown>;
                try {
                    parsed = JSON.parse(chunk.toString("utf-8"));
                } catch {
                    callback();
                    return;
                }
                const payload =
                    JSON.stringify({
                        ...parsed,
                        service,
                    }) + "\n";
                socket.write(payload, "utf-8");
            }
            callback();
        },
        final(callback: () => void) {
            if (socket) socket.end();
            callback();
        },
    });
}

export default createLogstashWritable;
