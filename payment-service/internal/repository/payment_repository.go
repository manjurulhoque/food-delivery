package repository

import (
	"errors"

	"food-delivery/payment-service/internal/model"

	"gorm.io/gorm"
)

type PaymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) DB() *gorm.DB {
	return r.db
}

func (r *PaymentRepository) Create(p *model.Payment) error {
	return r.db.Create(p).Error
}

func (r *PaymentRepository) FindByOrderID(orderID uint) (*model.Payment, error) {
	var p model.Payment
	err := r.db.Where("order_id = ?", orderID).First(&p).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PaymentRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&model.Payment{}).Where("id = ?", id).Update("status", status).Error
}
