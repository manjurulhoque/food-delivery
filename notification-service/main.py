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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logger
logging.basicConfig(level=logging.DEBUG)
logging.getLogger('aiokafka').setLevel(logging.INFO)  # Reduce debug logs
logger = logging.getLogger(__name__)

# Initialize Kafka producer and consumers
aioproducer = AIOKafkaProducer(bootstrap_servers=KAFKA_INSTANCE)
consumer1 = AIOKafkaConsumer(
    'order.placed', 
    bootstrap_servers=KAFKA_INSTANCE,
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    group_id="notification-service",
    auto_offset_reset="latest",
)
consumer2 = AIOKafkaConsumer(
    'user.registered', 
    bootstrap_servers=KAFKA_INSTANCE,
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    group_id="notification-service",
    auto_offset_reset="latest",
)

async def consume_order_placed():
    """Consume messages from 'order.placed' topic."""
    await consumer1.start()
    logger.info("Consumer for 'order.placed' started.")
    try:
        async for message in consumer1:
            logger.info("Received order.placed: %s", message.value)
            # Extract user_id from the message
            user_id = message.value.get('user_id')
            order_id = message.value.get('order_id')
            user_details = await get_user_details(user_id)
            logger.info("User details: %s", user_details)
    except Exception as e:
        logger.error("Error in order.placed consumer: %s", str(e))
    finally:
        await consumer1.stop()
        logger.info("Consumer for 'order.placed' stopped.")

async def consume_user_registered():
    """Consume messages from 'user.registered' topic."""
    await consumer2.start()
    logger.info("Consumer for 'user.registered' started.")
    try:
        async for message in consumer2:
            logger.info("Received user.registered: %s", message.value.decode('utf-8'))
            # Process the message here
    except Exception as e:
        logger.error("Error in user.registered consumer: %s", str(e))
    finally:
        await consumer2.stop()
        logger.info("Consumer for 'user.registered' stopped.")

@app.on_event("startup")
async def startup_event():
    """Startup event to initialize Kafka components."""
    await aioproducer.start()
    logger.info("Kafka producer started.")
    # Start consumers concurrently
    asyncio.create_task(consume_order_placed())
    asyncio.create_task(consume_user_registered())

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event to clean up Kafka components."""
    await aioproducer.stop()
    logger.info("Kafka producer stopped.")
    # Stop consumers
    await consumer1.stop()
    await consumer2.stop()

@app.get("/")
def root():
    """Root endpoint for testing."""
    return {"Hello": "World"}

# Prometheus instrumentation
Instrumentator().instrument(app).expose(app)


# import asyncio
# import json
# import logging
# from fastapi import FastAPI
# from config import get_settings
# from fastapi.middleware.cors import CORSMiddleware
# from prometheus_fastapi_instrumentator import Instrumentator
# from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

# from users import get_user_details

# settings = get_settings()

# app = FastAPI(
#     title=settings.PROJECT_NAME,
# )

# # Configure CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # In production, replace with specific origins
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Configure logger
# logging.basicConfig(level=logging.DEBUG)
# logging.getLogger('aiokafka').setLevel(logging.INFO)
# logger = logging.getLogger(__name__)

# # Initialize Kafka producer and consumers
# aioproducer = AIOKafkaProducer(bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS)
# consumer1 = AIOKafkaConsumer(
#     'order.placed', 
#     bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
#     value_deserializer=lambda m: json.loads(m.decode('utf-8')),
#     group_id=settings.KAFKA_GROUP_ID,
#     auto_offset_reset="latest",
# )
# consumer2 = AIOKafkaConsumer(
#     'user.registered', 
#     bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
#     value_deserializer=lambda m: json.loads(m.decode('utf-8')),
#     group_id=settings.KAFKA_GROUP_ID,
#     auto_offset_reset="latest",
# )

# async def consume_order_placed():
#     """Consume messages from 'order.placed' topic."""
#     await consumer1.start()
#     logger.info("Consumer for 'order.placed' started.")
#     try:
#         async for message in consumer1:
#             logger.info("Received order.placed: %s", message.value)
#             user_id = message.value.get('user_id')
#             order_id = message.value.get('order_id')
#             user_details = await get_user_details(user_id)
#             logger.info("User details: %s", user_details)
#     except Exception as e:
#         logger.error("Error in order.placed consumer: %s", str(e))
#     finally:
#         await consumer1.stop()
#         logger.info("Consumer for 'order.placed' stopped.")

# async def consume_user_registered():
#     """Consume messages from 'user.registered' topic."""
#     await consumer2.start()
#     logger.info("Consumer for 'user.registered' started.")
#     try:
#         async for message in consumer2:
#             logger.info("Received user.registered: %s", message.value)
#             # Process the message here
#     except Exception as e:
#         logger.error("Error in user.registered consumer: %s", str(e))
#     finally:
#         await consumer2.stop()
#         logger.info("Consumer for 'user.registered' stopped.")

# @app.on_event("startup")
# async def startup_event():
#     """Startup event to initialize Kafka components."""
#     await aioproducer.start()
#     logger.info("Kafka producer started.")
#     # Start consumers concurrently
#     asyncio.create_task(consume_order_placed())
#     asyncio.create_task(consume_user_registered())

# @app.on_event("shutdown")
# async def shutdown_event():
#     """Shutdown event to clean up Kafka components."""
#     await aioproducer.stop()
#     logger.info("Kafka producer stopped.")
#     await consumer1.stop()
#     await consumer2.stop()

# @app.get("/")
# async def root():
#     return {"message": "Notification Service is running"}

# @app.get("/health")
# async def health_check():
#     return {"status": "healthy"}

# # Prometheus instrumentation
# Instrumentator().instrument(app).expose(app)
