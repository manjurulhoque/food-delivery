import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

app = FastAPI()

loop = asyncio.get_event_loop()
KAFKA_INSTANCE = "kafka:9092"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# aioproducer = AIOKafkaProducer(loop=loop, bootstrap_servers=KAFKA_INSTANCE)

consumer1 = AIOKafkaConsumer('order.placed', bootstrap_servers=KAFKA_INSTANCE, loop=loop)
consumer2 = AIOKafkaConsumer('user.registered', bootstrap_servers=KAFKA_INSTANCE, loop=loop)


# consumer1 = KafkaConsumer(
#     'order.placed',
#     bootstrap_servers='kafka:9092',
#     value_deserializer=lambda m: json.loads(m.decode('utf-8')),
#     api_version=(0, 10, 1)
# )
#
# consumer2 = KafkaConsumer(
#     'user.registered',
#     bootstrap_servers='kafka:9092',
#     value_deserializer=lambda m: json.loads(m.decode('utf-8')),
#     api_version=(0, 10, 1)
# )


async def consume_messages():
    await consumer1.start()
    await consumer2.start()
    print("Consuming messages")
    try:
        async for message in consumer1:
            print("Received message1", message)
            print(f"Received message1: {message.value}")
            # Handle the message (e.g., send a notification)
    except Exception as e:
        await consumer1.stop()

    try:
        async for message in consumer2:
            print("Received message2", message)
            print(f"Received message2: {message.value}")
            # Handle the message (e.g., send a notification)
    except Exception as e:
        await consumer2.stop()


@app.on_event("startup")
async def startup_event():
    # await aioproducer.start()
    await loop.create_task(consume_messages())


@app.on_event("shutdown")
async def shutdown_event():
    # await aioproducer.stop()
    await consumer1.stop()
    await consumer2.stop()


# @app.on_event("startup")
# def startup_event():
#     # start a Kafka consumer in a separate thread when the FastAPI application starts
#     threading.Thread(target=consume_messages, daemon=True).start()


@app.get("/")
def root():
    return {"Hello": "World"}


Instrumentator().instrument(app).expose(app)
