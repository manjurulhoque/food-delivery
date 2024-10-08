FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

EXPOSE 5003

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "5003"]
