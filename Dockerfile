FROM python:3.10.5-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# COPY ./flaskapi/ /app/flaskapi/

# CMD ["python3", "-m", "flask", "--host=0.0.0.0"]