package handler

import (
	"log/slog"
	"net/http"

	"food-delivery/payment-service/internal/service"

	"github.com/gin-gonic/gin"
)

type Health struct {
	Payments *service.PaymentService
}

func (h *Health) Handle(c *gin.Context) {
	if err := h.Payments.PingStore(); err != nil {
		slog.Warn("health_check_failed",
			slog.String("service", "payment-service"),
			slog.Any("error", err),
		)
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":  "unhealthy",
			"service": "payment-service",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "payment-service",
	})
}
