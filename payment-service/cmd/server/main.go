package main

import (
	"log/slog"
	"os"

	"food-delivery/payment-service/internal/app"
	"food-delivery/payment-service/internal/logger"
)

func main() {
	logger.Setup()

	a, err := app.New()
	if err != nil {
		slog.Error("bootstrap_failed", slog.Any("error", err))
		os.Exit(1)
	}

	if err := a.Run(); err != nil {
		slog.Error("server_failed", slog.Any("error", err))
		os.Exit(1)
	}
}
