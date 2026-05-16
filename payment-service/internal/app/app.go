package app

import (
	"fmt"
	"log/slog"

	"food-delivery/payment-service/internal/config"
	"food-delivery/payment-service/internal/database"
	"food-delivery/payment-service/internal/model"
	"food-delivery/payment-service/internal/repository"
	"food-delivery/payment-service/internal/router"
	"food-delivery/payment-service/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// App wires configuration, persistence, and HTTP routes.
type App struct {
	cfg *config.Config
	db  *gorm.DB
	gin *gin.Engine
}

func New() (*App, error) {
	cfg := config.Load()

	db, err := database.Connect(cfg.Database)
	if err != nil {
		return nil, fmt.Errorf("database: %w", err)
	}

	if err := database.Migrate(db, &model.Payment{}); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}

	paymentRepo := repository.NewPaymentRepository(db)
	paymentSvc := service.NewPaymentService(paymentRepo)

	engine := router.New(router.Dependencies{
		Logger:         slog.Default(),
		PaymentService: paymentSvc,
	})

	return &App{cfg: cfg, db: db, gin: engine}, nil
}

func (a *App) Run() error {
	addr := ":" + a.cfg.HTTP.Port
	slog.Info("payment_service_listen", slog.String("addr", addr))
	return a.gin.Run(addr)
}
