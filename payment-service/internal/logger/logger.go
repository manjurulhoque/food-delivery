package logger

import (
	"log/slog"
	"os"
	"strings"
)

// Setup configures the default slog logger with JSON output to stdout.
func Setup() *slog.Logger {
	level := parseLevel(os.Getenv("LOG_LEVEL"))

	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: level,
	})

	log := slog.New(handler)
	slog.SetDefault(log)
	return log
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
