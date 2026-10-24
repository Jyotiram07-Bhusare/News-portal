-- 2026-10-24 - the Review section (रिव्ह्यू) and the real views of a news / blog. Two new columns of `articles`:
--
--   clicks     INT UNSIGNED  how often readers opened the story (POST /api/articles/<id>/read). The website shows the views typed in the
--                            Admin Panel + these clicks, and its Review section lists the most viewed news and blogs.
--   is_review  TINYINT(1)    1 = the Admin Panel put the story in the Review section (the "रिव्ह्यू" placement box).
--
-- Nothing has to be done by hand on the live server: every deploy runs `python init_db.py --schema-only` (deploy/docker/deploy-entry.sh,
-- with /opt/lokportal/migrate.env), which adds exactly these columns (database.CLICK_COLUMNS / REVIEW_COLUMNS). This file is the same
-- change for a database that is updated by hand, for example when that step is skipped:
--
--   mysql -h <DB endpoint> -u <migrate or master user> -p --ssl-ca=/etc/ssl/certs/rds-global-bundle.pem lokmangal_news_portal \
--         < backend/migrations/2026-10-24-review-clicks.sql
--
-- Safe to run again and again: a column that exists already is left alone. No row is changed or deleted (every story starts with
-- clicks = 0 and is_review = 0). Needs MySQL 8+.

SET @have := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'clicks');
SET @step := IF(@have = 0, 'ALTER TABLE articles ADD COLUMN clicks INT UNSIGNED NOT NULL DEFAULT 0', 'DO 0');
PREPARE step FROM @step;
EXECUTE step;
DEALLOCATE PREPARE step;

SET @have := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'is_review');
SET @step := IF(@have = 0, 'ALTER TABLE articles ADD COLUMN is_review TINYINT(1) NOT NULL DEFAULT 0', 'DO 0');
PREPARE step FROM @step;
EXECUTE step;
DEALLOCATE PREPARE step;

-- what the table has now
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
  FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME IN ('clicks', 'is_review')
 ORDER BY COLUMN_NAME;
