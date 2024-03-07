
# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.9.6

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install Flask gunicorn

CMD exec gunicorn --bind :5001 --workers 1 --threads 8 --timeout 0 app:app
EXPOSE 5001/tcp