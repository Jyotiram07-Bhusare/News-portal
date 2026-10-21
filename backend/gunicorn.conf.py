"""gunicorn settings:   gunicorn -c gunicorn.conf.py app:app
nginx stands in front (HTTPS, upload buffering, rate limits), so gunicorn listens on a private address only.
Everything can be set from the environment (the Docker image / systemd unit do that)."""
import multiprocessing
import os

bind = os.getenv("GUNICORN_BIND", "127.0.0.1:5000")
workers = int(os.getenv("GUNICORN_WORKERS", max(2, min(4, multiprocessing.cpu_count() * 2))))
threads = int(os.getenv("GUNICORN_THREADS", 4))    # a big video upload must not block the other visitors
worker_class = "gthread"
timeout = 300                  # a 200 MB video is stored in S3 inside one request
graceful_timeout = 30
keepalive = 5
max_requests = 2000            # workers are renewed now and then (memory stays flat) ...
max_requests_jitter = 200      # ... not all at the same moment
accesslog = "-"                # container log / journald
errorlog = "-"
forwarded_allow_ips = os.getenv("FORWARDED_ALLOW_IPS", "127.0.0.1")
control_socket_disable = True   # (gunicorn 25+: no admin socket - it would need a writable folder and nobody uses it)
