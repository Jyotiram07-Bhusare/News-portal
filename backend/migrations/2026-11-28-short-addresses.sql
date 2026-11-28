-- 2026-11-28 - short addresses in English letters, and an address for every video. Two new columns:
--
--   articles.old_slugs  VARCHAR(1000)  the addresses a story had before, with commas between them: such a link goes on to the address of today
--   videos.slug         VARCHAR(190)   the words of a video's own address (/video/<slug>)
--
-- Nothing has to be done by hand on the live server: every deploy runs `python init_db.py --schema-only` (deploy/docker/deploy-entry.sh,
-- with /opt/lokportal/migrate.env), which adds exactly these columns (database.OLD_SLUG_COLUMNS / VIDEO_SLUG_COLUMNS). The new addresses are then made
-- by the backend itself: long / Marathi-letter ones get short ones when it starts (database.shorten_slugs), a video without one gets it the first time
-- the videos are read. This file is the same change for a database that is updated by hand, for example when that step is skipped:
--
--   mysql -h <DB endpoint> -u <migrate or master user> -p --ssl-ca=/etc/ssl/certs/rds-global-bundle.pem lokmangal_news_portal \
--         < backend/migrations/2026-11-28-short-addresses.sql
--
-- Safe to run again and again: a column that exists already is left alone. No row is changed or deleted. Needs MySQL 8+.

SET @have := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'old_slugs');
SET @step := IF(@have = 0, 'ALTER TABLE articles ADD COLUMN old_slugs VARCHAR(1000) NULL', 'DO 0');
PREPARE step FROM @step;
EXECUTE step;
DEALLOCATE PREPARE step;

SET @have := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'videos' AND COLUMN_NAME = 'slug');
SET @step := IF(@have = 0, 'ALTER TABLE videos ADD COLUMN slug VARCHAR(190) NULL', 'DO 0');
PREPARE step FROM @step;
EXECUTE step;
DEALLOCATE PREPARE step;

-- what the tables have now
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
  FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND ((TABLE_NAME = 'articles' AND COLUMN_NAME IN ('slug', 'old_slugs')) OR (TABLE_NAME = 'videos' AND COLUMN_NAME = 'slug'))
 ORDER BY TABLE_NAME, COLUMN_NAME;
