FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

EXPOSE 5002

CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:5002"]