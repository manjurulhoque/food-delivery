package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"food-delivery/payment-service/internal/config"
	"food-delivery/payment-service/internal/database"
	"food-delivery/payment-service/internal/kafka"
	"food-delivery/payment-service/internal/model"
	"food-delivery/payment-service/internal/repository"
	"food-delivery/payment-service/internal/router"
	"food-delivery/payment-service/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// App wires configuration, persistence, HTTP routes, and Kafka consumers.
type App struct {
	cfg      *config.Config
	db       *gorm.DB
	gin      *gin.Engine
	consumer *kafka.Consumer
	producer *kafka.Producer
}

func New() (*App, error) {
	cfg := config.Load()

	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	db, err := database.Connect(cfg.Database)
	if err != nil {
		return nil, fmt.Errorf("database: %w", err)
	}

	if err := database.Migrate(db, &model.Payment{}); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}

	producer := kafka.NewProducer(cfg.Kafka.Brokers)
	paymentRepo := repository.NewPaymentRepository(db)
	paymentSvc := service.NewPaymentService(paymentRepo, producer, slog.Default())

	consumer := kafka.NewConsumer(
		cfg.Kafka.Brokers,
		cfg.Kafka.GroupID,
		paymentSvc,
		slog.Default(),
	)

	engine := router.New(router.Dependencies{
		Logger:         slog.Default(),
		PaymentService: paymentSvc,
	})

	return &App{
		cfg:      cfg,
		db:       db,
		gin:      engine,
		consumer: consumer,
		producer: producer,
	}, nil
}

func (a *App) Run() error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go a.consumer.Run(ctx)

	addr := ":" + a.cfg.HTTP.Port
	srv := &http.Server{Addr: addr, Handler: a.gin}

	go func() {
		slog.Info("payment_service_listen", slog.String("addr", addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("http_server_failed", slog.Any("error", err))
			cancel()
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("payment_service_shutdown")
	cancel()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	_ = srv.Shutdown(shutdownCtx)
	_ = a.consumer.Close()
	_ = a.producer.Close()

	return nil
}
