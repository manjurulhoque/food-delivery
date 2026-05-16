package model

import "time"

const (
	PaymentStatusPending   = "PENDING"
	PaymentStatusCompleted = "COMPLETED"
	PaymentStatusFailed    = "FAILED"
)

type Payment struct {
	ID        uint    `gorm:"primaryKey"`
	OrderID   uint    `gorm:"uniqueIndex;not null"`
	UserID    uint    `gorm:"index;not null"`
	Amount    float64 `gorm:"not null"`
	Currency  string  `gorm:"size:8;not null;default:USD"`
	Status    string  `gorm:"size:32;not null;default:PENDING"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
