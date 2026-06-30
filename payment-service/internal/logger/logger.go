package logger

import (
	"io"
	"log/slog"
	"net"
	"os"
	"strings"
	"sync"
	"time"
)

// Setup configures the default slog logger with JSON output to stdout and Logstash.
func Setup() *slog.Logger {
	level := parseLevel(os.Getenv("LOG_LEVEL"))

	logstashAddr := os.Getenv("LOGSTASH_ADDR")
	if logstashAddr == "" {
		logstashAddr = "logstash:5044"
	}

	var writer io.Writer = os.Stdout

	tcpWriter := newTcpWriter(logstashAddr, 5*time.Second)
	if tcpWriter != nil {
		writer = io.MultiWriter(os.Stdout, tcpWriter)
	}

	handler := slog.NewJSONHandler(writer, &slog.HandlerOptions{
		Level: level,
	})

	log := slog.New(handler)
	slog.SetDefault(log)
	return log
}

// tcpWriter writes log lines to a TCP endpoint (Logstash).
type tcpWriter struct {
	addr    string
	timeout time.Duration
	mu      sync.Mutex
	conn    net.Conn
}

func newTcpWriter(addr string, timeout time.Duration) *tcpWriter {
	w := &tcpWriter{addr: addr, timeout: timeout}
	w.connect()
	return w
}

func (w *tcpWriter) connect() {
	conn, err := net.DialTimeout("tcp", w.addr, w.timeout)
	if err != nil {
		return
	}
	w.conn = conn
}

func (w *tcpWriter) Write(p []byte) (int, error) {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.conn == nil {
		w.connect()
	}
	if w.conn != nil {
		_, _ = w.conn.Write(p)
	}
	return len(p), nil
}

func parseLevel(s string) slog.Leveler {
	switch strings.ToUpper(strings.TrimSpace(s)) {
	case "DEBUG":
		return slog.LevelDebug
	case "WARN", "WARNING":
		return slog.LevelWarn
	case "ERROR":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
