A micro-service based on Choreography-based Saga pattern

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

seed restaurant menu category:
```bash
docker exec -i restaurant-service python manage.py seed_menu_categories
```

create super-user in auth-service:
```bash
docker exec -it auth-service sh
```

then type: 
```bash
python manage.py createsuperuser
```

For elastic dashboard: 
```bash
http://localhost:5601/app/management/kibana/dataViews
```
