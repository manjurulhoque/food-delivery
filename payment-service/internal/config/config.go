package config

import (
	"os"
)

type Config struct {
	HTTP     HTTPConfig
	Database DatabaseConfig
	Kafka    KafkaConfig
}

type KafkaConfig struct {
	Brokers string
	GroupID string
}

type HTTPConfig struct {
	Port string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

func Load() *Config {
	return &Config{
		HTTP: HTTPConfig{
			Port: getEnv("PORT", "5005"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DATABASE_HOST", "localhost"),
			Port:     getEnv("DATABASE_PORT", "5432"),
			User:     getEnv("DATABASE_USER", "postgres"),
			Password: getEnv("DATABASE_PASSWORD", "postgres"),
			Name:     getEnv("DATABASE_NAME", "food_payments"),
			SSLMode:  getEnv("DATABASE_SSLMODE", "disable"),
		},
		Kafka: KafkaConfig{
			Brokers: getEnv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092"),
			GroupID: getEnv("KAFKA_GROUP_ID", "payment-service"),
		},
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
