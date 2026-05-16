package service

import (
	"context"
	"fmt"
	"log/slog"

	"food-delivery/payment-service/internal/events"
	"food-delivery/payment-service/internal/kafka"
	"food-delivery/payment-service/internal/model"
	"food-delivery/payment-service/internal/repository"
)

type PaymentService struct {
	repo     *repository.PaymentRepository
	producer *kafka.Producer
	log      *slog.Logger
}

func NewPaymentService(
	repo *repository.PaymentRepository,
	producer *kafka.Producer,
	log *slog.Logger,
) *PaymentService {
	if log == nil {
		log = slog.Default()
	}
	return &PaymentService{repo: repo, producer: producer, log: log}
}

func (s *PaymentService) PingStore() error {
	sqlDB, err := s.repo.DB().DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

// HandleOrderPlaced creates a payment row and publishes payment.completed or payment.failed.
func (s *PaymentService) HandleOrderPlaced(ctx context.Context, evt events.OrderPlaced) error {
	if evt.OrderID == 0 {
		return fmt.Errorf("missing order_id")
	}

	existing, err := s.repo.FindByOrderID(evt.OrderID)
	if err != nil {
		return err
	}
	if existing != nil {
		s.log.Info("payment_already_exists",
			slog.Uint64("order_id", uint64(evt.OrderID)),
			slog.String("status", existing.Status),
		)
		return nil
	}

	payment := &model.Payment{
		OrderID:  evt.OrderID,
		UserID:   evt.UserID,
		Amount:   evt.TotalPrice,
		Currency: "USD",
		Status:   model.PaymentStatusPending,
	}
	if err := s.repo.Create(payment); err != nil {
		return fmt.Errorf("create payment: %w", err)
	}

	s.log.Info("payment_created",
		slog.Uint64("payment_id", uint64(payment.ID)),
		slog.Uint64("order_id", uint64(evt.OrderID)),
	)

	return s.captureAndPublish(ctx, payment)
}

func (s *PaymentService) captureAndPublish(ctx context.Context, payment *model.Payment) error {
	if payment.Amount <= 0 {
		return s.failPayment(ctx, payment, "invalid order amount")
	}

	if err := s.repo.UpdateStatus(payment.ID, model.PaymentStatusCompleted); err != nil {
		return err
	}

	evt := events.PaymentCompleted{
		PaymentID: payment.ID,
		OrderID:   payment.OrderID,
		UserID:    payment.UserID,
		Amount:    payment.Amount,
		Currency:  payment.Currency,
	}
	if err := s.producer.PublishPaymentCompleted(ctx, evt); err != nil {
		return fmt.Errorf("publish payment.completed: %w", err)
	}

	s.log.Info("payment_completed",
		slog.Uint64("payment_id", uint64(payment.ID)),
		slog.Uint64("order_id", uint64(payment.OrderID)),
	)
	return nil
}

func (s *PaymentService) failPayment(ctx context.Context, payment *model.Payment, reason string) error {
	if err := s.repo.UpdateStatus(payment.ID, model.PaymentStatusFailed); err != nil {
		return err
	}

	evt := events.PaymentFailed{
		PaymentID: payment.ID,
		OrderID:   payment.OrderID,
		UserID:    payment.UserID,
		Amount:    payment.Amount,
		Currency:  payment.Currency,
		Reason:    reason,
	}
	if err := s.producer.PublishPaymentFailed(ctx, evt); err != nil {
		return fmt.Errorf("publish payment.failed: %w", err)
	}

	s.log.Warn("payment_failed",
		slog.Uint64("payment_id", uint64(payment.ID)),
		slog.Uint64("order_id", uint64(payment.OrderID)),
		slog.String("reason", reason),
	)
	return nil
}
