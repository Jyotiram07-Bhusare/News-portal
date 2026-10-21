# The API as a container (used on the shared EC2 server, see deploy/docker/ and DEPLOY.md).
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

# the Amazon RDS certificate bundle (certs/rds-global-bundle.pem, kept in the repository so a build never depends on a download):
# the database connection is encrypted and the server is verified (DB_SSL_CA=/app/certs/rds-global-bundle.pem).
# Source: https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem - replace the file when AWS publishes a new bundle.
COPY certs/rds-global-bundle.pem /app/certs/rds-global-bundle.pem
RUN chmod 755 /app/certs && chmod 644 /app/certs/rds-global-bundle.pem

COPY . .

# the program runs as a normal user; uploads wait in /tmp/uploads before they are checked and stored
RUN useradd --system --uid 10001 --home-dir /app --shell /usr/sbin/nologin app \
 && mkdir -p /tmp/uploads && chown app /tmp/uploads
USER app

ENV GUNICORN_BIND=0.0.0.0:5000 \
    UPLOAD_TMP_DIR=/tmp/uploads
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=6s --start-period=20s --retries=3 \
  CMD python -c "import sys,urllib.request; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:5000/api/health', timeout=5).status == 200 else 1)"

CMD ["gunicorn", "-c", "gunicorn.conf.py", "app:app"]
