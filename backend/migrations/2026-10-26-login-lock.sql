-- 2026-10-26 - the admin login lock is counted in the database. One new table:
--
--   login_failures  per client address: how many wrong admin passwords in a row, since when, and until when the address is locked.
--
-- Why: the API runs several worker processes, and a count kept in each process's memory let an attacker have 5 tries per worker. Now 5 wrong
-- passwords from one address lock it for one hour (LOGIN_LOCK_MINUTES, LOGIN_MAX_FAILURES), for every worker, and a restart does not clear it
-- (python manage.py unlock-login does).
--
-- Nothing has to be done by hand on the live server: every deploy runs `python init_db.py --schema-only` (deploy/docker/deploy-entry.sh,
-- with /opt/lokportal/migrate.env), which creates this table from schema.sql. This file is the same change for a database that is updated by hand:
--
--   mysql -h <DB endpoint> -u <migrate or master user> -p --ssl-ca=/etc/ssl/certs/rds-global-bundle.pem lokmangal_news_portal \
--         < backend/migrations/2026-10-26-login-lock.sql
--
-- Safe to run again and again: a table that exists already is left alone. No row of another table is touched. Needs MySQL 8+.

CREATE TABLE IF NOT EXISTS login_failures (
  address       VARCHAR(64)   NOT NULL,
  failures      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  first_at      DATETIME      NOT NULL,
  locked_until  DATETIME      NULL,
  PRIMARY KEY (address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
