import json
import logging
import socket
from datetime import datetime, timezone


class TcpJsonLogstashHandler(logging.Handler):
    """Sends JSON-formatted log records to a Logstash TCP endpoint."""

    def __init__(self, host: str = "logstash", port: int = 5044, service: str = "notification-service"):
        super().__init__()
        self.host = host
        self.port = port
        self.service = service
        self.sock: socket.socket | None = None
        self._connect()

    def _connect(self) -> None:
        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.connect((self.host, self.port))
        except OSError:
            self.sock = None

    def emit(self, record: logging.LogRecord) -> None:
        if self.sock is None:
            return

        try:
            payload = json.dumps(
                {
                    "@timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
                    "level": record.levelname,
                    "logger": record.name,
                    "message": self.format(record),
                    "module": record.module,
                    "funcName": record.funcName,
                    "lineno": record.lineno,
                    "service": self.service,
                },
            )
            self.sock.sendall((payload + "\n").encode("utf-8"))
        except OSError:
            self.sock = None

    def close(self) -> None:
        if self.sock:
            self.sock.close()
        super().close()
