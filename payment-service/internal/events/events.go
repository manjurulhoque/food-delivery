package events

type OrderPlaced struct {
	OrderID      uint    `json:"order_id"`
	UserID       uint    `json:"user_id"`
	RestaurantID uint    `json:"restaurant_id"`
	TotalPrice   float64 `json:"total_price"`
}

type PaymentCompleted struct {
	PaymentID uint    `json:"payment_id"`
	OrderID   uint    `json:"order_id"`
	UserID    uint    `json:"user_id"`
	Amount    float64 `json:"amount"`
	Currency  string  `json:"currency"`
}

type PaymentFailed struct {
	PaymentID uint    `json:"payment_id"`
	OrderID   uint    `json:"order_id"`
	UserID    uint    `json:"user_id"`
	Amount    float64 `json:"amount"`
	Currency  string  `json:"currency"`
	Reason    string  `json:"reason"`
}
