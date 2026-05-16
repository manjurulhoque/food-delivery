package router

import (
	"log/slog"

	"food-delivery/payment-service/internal/handler"
	slogmw "food-delivery/payment-service/internal/middleware"
	"food-delivery/payment-service/internal/service"

	"github.com/gin-gonic/gin"
)

type Dependencies struct {
	Logger         *slog.Logger
	PaymentService *service.PaymentService
}

// New registers HTTP routes. Paths assume Kong (or another gateway) strips the /api/payments/ prefix.
func New(deps Dependencies) *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(slogmw.RequestLog(deps.Logger))

	h := &handler.Health{Payments: deps.PaymentService}

	r.GET("/health", h.Handle)

	v1 := r.Group("/v1")
	{
		v1.GET("/ping", h.Handle)
	}

	return r
}
