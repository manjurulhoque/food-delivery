import asyncio
import json
import logging

from fastapi import FastAPI
from config import get_settings
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

from users import get_user_details

settings = get_settings()

app = FastAPI()

KAFKA_INSTANCE = "kafka:9092"
tasks = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logger
logging.basicConfig(level=logging.DEBUG)
logging.getLogger("aiokafka").setLevel(logging.INFO)  # Reduce debug logs
logger = logging.getLogger(__name__)


def safe_deserializer(m):
    try:
        return json.loads(m.decode("utf-8"))
    except Exception:
        logger.error("Invalid message format")
        return None


# Initialize Kafka producer and consumers
aioproducer = AIOKafkaProducer(bootstrap_servers=KAFKA_INSTANCE)
order_placed_consumer = AIOKafkaConsumer(
    "order.placed",
    bootstrap_servers=KAFKA_INSTANCE,
    value_deserializer=safe_deserializer,
    group_id="notification-service",
    auto_offset_reset="latest",
)
user_registered_consumer = AIOKafkaConsumer(
    "user.registered",
    bootstrap_servers=KAFKA_INSTANCE,
    value_deserializer=safe_deserializer,
    group_id="notification-service",
    auto_offset_reset="latest",
)


async def wait_for_kafka():
    while True:
        try:
            await aioproducer.start()
            await aioproducer.stop()
            logger.info("Kafka is ready")
            break
        except Exception as e:
            logger.warning(f"Kafka not ready yet: {e}")
            await asyncio.sleep(5)


async def consume_order_placed():
    """Consume messages from 'order.placed' topic."""
    while True:

        try:
            await order_placed_consumer.start()
            logger.info("Consumer for 'order.placed' started.")

            async for message in order_placed_consumer:
                logger.info("Received order.placed: %s", message.value)
                # Extract user_id from the message
                user_id = message.value.get("user_id")
                order_id = message.value.get("order_id")
                user_details = await get_user_details(user_id)
                logger.info("User details: %s", user_details)
                # Send notification to user
        except Exception as e:
            logger.error("Error in order.placed consumer: %s", str(e))
            await asyncio.sleep(5)
        finally:
            try:
                await order_placed_consumer.stop()
            except Exception:
                pass

            logger.info("Consumer for 'order.placed' stopped.")


async def consume_user_registered():
    while True:
        try:
            await user_registered_consumer.start()
            logger.info("Consumer for 'user.registered' started")

            async for message in user_registered_consumer:
                logger.info(message.value)

        except Exception as e:
            logger.error(f"Consumer for 'user.registered' crashed: {e}")
            await asyncio.sleep(5)

        finally:
            try:
                await user_registered_consumer.stop()
            except Exception:
                pass

            logger.info("Consumer for 'user.registered' stopped.")


@app.on_event("startup")
async def startup_event():
    """Startup event to initialize Kafka components."""
    # Start consumers concurrently
    await wait_for_kafka()

    tasks.append(asyncio.create_task(consume_order_placed()))
    tasks.append(asyncio.create_task(consume_user_registered()))

    await aioproducer.start()


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event to clean up Kafka components."""
    await aioproducer.stop()
    logger.info("Kafka producer stopped.")
    # Stop consumers
    try:
        await order_placed_consumer.stop()
    except Exception:
        pass

    try:
        await user_registered_consumer.stop()
    except Exception:
        pass

    for task in tasks:
        task.cancel()


@app.get("/")
def root():
    """Root endpoint for testing."""
    return {"Hello": "World"}


# Prometheus instrumentation
Instrumentator().instrument(app).expose(app)
