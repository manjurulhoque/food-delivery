import json
import logging
import socket
import threading
from datetime import datetime, timezone


class TcpLogstashHandler(logging.Handler):
    """Ship JSON log records to a Logstash TCP endpoint.

    - If a formatter is configured (e.g. ``ProcessorFormatter`` with
      ``JSONRenderer``), the formatted string is sent directly — this gives
      you the full structlog context (service, user_id, ip, etc.).
    - Otherwise the handler builds a minimal JSON payload containing the
      essential fields (timestamp, level, logger, message, service).
    - Reconnects automatically on failure.
    - Thread-safe.
    """

    def __init__(
        self,
        host: str = "logstash",
        port: int = 5044,
        *,
        service: str = "auth-service",
        level: int | str = logging.INFO,
    ) -> None:
        super().__init__(level=level)
        self._host = host
        self._port = port
        self._service = service
        self._sock: socket.socket | None = None
        self._lock = threading.Lock()
        self._connect()

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------

    def reconnect(self) -> None:
        """Force a reconnection attempt."""
        self.close()
        with self._lock:
            self._connect()

    # ------------------------------------------------------------------
    # Implementation
    # ------------------------------------------------------------------

    def _connect(self) -> None:
        try:
            self._sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self._sock.settimeout(5)
            self._sock.connect((self._host, self._port))
        except OSError:
            self._sock = None

    def emit(self, record: logging.LogRecord) -> None:
        # Use the configured formatter if available (e.g. JSONRenderer)
        try:
            if self.formatter:
                payload = self.format(record) + "\n"
            else:
                data = {
                    "@timestamp": datetime.fromtimestamp(
                        record.created, tz=timezone.utc
                    ).isoformat(),
                    "level": record.levelname,
                    "logger": record.name,
                    "module": record.module,
                    "function": record.funcName,
                    "line": record.lineno,
                    "message": record.getMessage(),
                    "service": self._service,
                }
                if record.exc_info and record.exc_info[0]:
                    data["exception"] = {
                        "type": record.exc_info[0].__name__,
                        "message": str(record.exc_info[1]),
                    }
                payload = json.dumps(data) + "\n"
        except Exception as exc:
            # Logging errors must never bubble – report via print and bail out
            import sys

            print(f"TcpLogstashHandler: error building payload: {exc}", file=sys.stderr)
            return

        # Fast path – no lock if socket is healthy
        if self._sock is not None:
            try:
                self._sock.sendall(payload.encode("utf-8"))
                return
            except OSError:
                pass  # fall through to reconnect

        # Reconnect under lock
        with self._lock:
            self._connect()
            if self._sock is not None:
                try:
                    self._sock.sendall(payload.encode("utf-8"))
                except OSError as exc:
                    import sys

                    print(f"TcpLogstashHandler: send failed: {exc}", file=sys.stderr)
                    self._sock = None

    def close(self) -> None:
        with self._lock:
            if self._sock is not None:
                try:
                    self._sock.close()
                except OSError:
                    pass
                self._sock = None
        super().close()
