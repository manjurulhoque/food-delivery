from fastapi import FastAPI
from kafka import KafkaConsumer
import json
import threading

app = FastAPI()

consumer = KafkaConsumer(
    'order_placed',
    bootstrap_servers='kafka:9092',
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    api_version=(0, 10, 1)
)


def consume_messages():
    print("Consuming messages")
    for message in consumer:
        print("Received message", message)
        print(f"Received message: {message.value}")
        # Handle the message (e.g., send a notification)


@app.on_event("startup")
def startup_event():
    # start a Kafka consumer in a separate thread when the FastAPI application starts
    threading.Thread(target=consume_messages, daemon=True).start()


@app.get("/")
def root():
    return {"Hello": "World"}
