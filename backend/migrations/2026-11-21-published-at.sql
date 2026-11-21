-- 2026-11-21 - "Published on: Nov 21, 2026, 14:05:07 IST" under the headline of every news / blog. One new column of `articles`:
--
--   published_at  DATETIME NULL  when the story was published, in INDIA time (IST, no zone conversion anywhere). Stamped with the current time when a
--                               story is created in the Admin Panel (which can change it); the date text `date` of the lists is made from it.
--                               NULL = a story that has only its date text: the website shows the date without a time.
--
-- Nothing has to be done by hand on the live server: every deploy runs `python init_db.py --schema-only` (deploy/docker/deploy-entry.sh,
-- with /opt/lokportal/migrate.env), which adds exactly this column (database.PUBLISHED_COLUMNS), and the backend also adds it when it starts. This
-- file is the same change for a database that is updated by hand, for example when that step is skipped:
--
--   mysql -h <DB endpoint> -u <migrate or master user> -p --ssl-ca=/etc/ssl/certs/rds-global-bundle.pem lokmangal_news_portal \
--         < backend/migrations/2026-11-21-published-at.sql
--
-- Safe to run again and again: a column that exists already is left alone. No row is changed or deleted (every story starts with published_at NULL).
-- Needs MySQL 8+.

SET @have := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'published_at');
SET @step := IF(@have = 0, 'ALTER TABLE articles ADD COLUMN published_at DATETIME NULL', 'DO 0');
PREPARE step FROM @step;
EXECUTE step;
DEALLOCATE PREPARE step;

-- what the table has now
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
  FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'published_at';
