Run docker-compose:

```bash
docker-compose up --build
```

Access kafka-ui

```bash
localhost:8089
```

Access Kong GUI:

```bash
http://localhost:7002
```

Access services via Kong:

```bash
http://localhost:7000/api/restaurants/
http://localhost:7000/api/notifications/
http://localhost:7000/api/orders/
http://localhost:7000/api/auth/
```

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

kafka topic list:

```bash
docker exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092
```

create topics:

```bash
docker exec kafka kafka-topics.sh --create --topic order.placed --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics.sh --create --topic user.registered --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
```

delete topic:

```bash
docker exec kafka kafka-topics.sh --delete --topic order.placed --bootstrap-server localhost:9092
```
