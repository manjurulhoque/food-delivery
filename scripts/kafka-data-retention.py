from kafka.admin import KafkaAdminClient, NewTopic, ConfigResource, ConfigResourceType
from kafka.errors import TopicAlreadyExistsError

# Create an admin client
admin_client = KafkaAdminClient(
    bootstrap_servers="localhost:9092",
    client_id='kafka-python-admin'
)

# Specify topic name
topic_name = "order_placed"

# Define the retention settings
configs = {
    "retention.ms": str(7 * 24 * 60 * 60 * 1000),  # Retain for 7 days
    "retention.bytes": str(1024 * 1024 * 1024),  # 1 GB size-based retention
    # Kafka also supports log compaction, where only the latest value for each key is retained,
    # allowing for efficient retention of important data while discarding older versions of the same key.
    "cleanup.policy": "compact"  # Enable log compaction
}

# Alter the topic configuration
config_resource = ConfigResource(ConfigResourceType.TOPIC, topic_name, configs)

try:
    # Apply the new configurations
    admin_client.alter_configs([config_resource])
    print(f"Updated retention settings for topic '{topic_name}'.")
except Exception as e:
    print(f"Failed to update topic configurations: {e}")
finally:
    admin_client.close()
