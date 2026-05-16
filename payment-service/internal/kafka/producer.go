package kafka

import (
	"context"
	"encoding/json"
	"fmt"

	"food-delivery/payment-service/internal/events"

	"github.com/segmentio/kafka-go"
)

type Producer struct {
	completed *kafka.Writer
	failed    *kafka.Writer
}

func NewProducer(brokers string) *Producer {
	return &Producer{
		completed: &kafka.Writer{
			Addr:     kafka.TCP(brokers),
			Topic:    TopicPaymentCompleted,
			Balancer: &kafka.LeastBytes{},
		},
		failed: &kafka.Writer{
			Addr:     kafka.TCP(brokers),
			Topic:    TopicPaymentFailed,
			Balancer: &kafka.LeastBytes{},
		},
	}
}

func (p *Producer) PublishPaymentCompleted(ctx context.Context, evt events.PaymentCompleted) error {
	return p.publish(ctx, p.completed, evt)
}

func (p *Producer) PublishPaymentFailed(ctx context.Context, evt events.PaymentFailed) error {
	return p.publish(ctx, p.failed, evt)
}

func (p *Producer) publish(ctx context.Context, w *kafka.Writer, payload any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal event: %w", err)
	}
	return w.WriteMessages(ctx, kafka.Message{Value: body})
}

func (p *Producer) Close() error {
	var errCompleted, errFailed error
	if p.completed != nil {
		errCompleted = p.completed.Close()
	}
	if p.failed != nil {
		errFailed = p.failed.Close()
	}
	if errCompleted != nil {
		return errCompleted
	}
	return errFailed
}
