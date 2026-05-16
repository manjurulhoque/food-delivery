package kafka

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"food-delivery/payment-service/internal/events"

	"github.com/segmentio/kafka-go"
)

type OrderPlacedHandler interface {
	HandleOrderPlaced(ctx context.Context, evt events.OrderPlaced) error
}

type Consumer struct {
	reader  *kafka.Reader
	handler OrderPlacedHandler
	log     *slog.Logger
}

func NewConsumer(brokers, groupID string, handler OrderPlacedHandler, log *slog.Logger) *Consumer {
	if log == nil {
		log = slog.Default()
	}
	return &Consumer{
		reader: kafka.NewReader(kafka.ReaderConfig{
			Brokers:        []string{brokers},
			Topic:          TopicOrderPlaced,
			GroupID:        groupID,
			MinBytes:       1,
			MaxBytes:       10e6,
			StartOffset:    kafka.LastOffset,
			CommitInterval: time.Second,
		}),
		handler: handler,
		log:     log,
	}
}

func (c *Consumer) Run(ctx context.Context) {
	c.log.Info("kafka_consumer_start", slog.String("topic", TopicOrderPlaced))

	for {
		if ctx.Err() != nil {
			return
		}

		msg, err := c.reader.FetchMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return
			}
			c.log.Error("kafka_fetch_failed", slog.Any("error", err))
			time.Sleep(5 * time.Second)
			continue
		}

		var evt events.OrderPlaced
		if err := json.Unmarshal(msg.Value, &evt); err != nil {
			c.log.Error("kafka_unmarshal_failed", slog.Any("error", err))
			_ = c.reader.CommitMessages(ctx, msg)
			continue
		}

		if err := c.handler.HandleOrderPlaced(ctx, evt); err != nil {
			c.log.Error("order_placed_handler_failed",
				slog.Uint64("order_id", uint64(evt.OrderID)),
				slog.Any("error", err),
			)
			time.Sleep(2 * time.Second)
			continue
		}

		if err := c.reader.CommitMessages(ctx, msg); err != nil {
			c.log.Error("kafka_commit_failed", slog.Any("error", err))
		}
	}
}

func (c *Consumer) Close() error {
	return c.reader.Close()
}
