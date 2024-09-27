create databases manually:
```bash
docker exec -i <postgres_container_name> psql -U postgres -f /docker-entrypoint-initdb.d/init.sql
```

create kafka topics manually:
```bash
docker exec kafka kafka-topics.sh --create --topic test_topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

list kafka topics:
```bash
docker exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092
```

consume kafka topics:
```bash
docker exec -it restaurant-service python manage.py consume_order_events
```