package service

import (
	"food-delivery/payment-service/internal/model"
	"food-delivery/payment-service/internal/repository"
)

type PaymentService struct {
	repo *repository.PaymentRepository
}

func NewPaymentService(repo *repository.PaymentRepository) *PaymentService {
	return &PaymentService{repo: repo}
}

func (s *PaymentService) PingStore() error {
	sqlDB, err := s.repo.DB().DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

// Placeholder for future capture / refund flows.
func (s *PaymentService) CreateDraft(orderID uint, amount float64, currency string) (*model.Payment, error) {
	p := &model.Payment{
		OrderID:  orderID,
		Amount:   amount,
		Currency: currency,
		Status:   "PENDING",
	}
	if err := s.repo.Create(p); err != nil {
		return nil, err
	}
	return p, nil
}
