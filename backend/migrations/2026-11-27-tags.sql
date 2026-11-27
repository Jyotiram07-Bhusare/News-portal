-- 2026-11-27 - tags (topics) of a news / blog. Two new columns of `articles`:
--
--   tags     VARCHAR(1000)  Marathi tags, with commas between them ("भाजप, सोलापूर"); the website shows them under the story, a tag opens its stories
--   tags_en  VARCHAR(1000)  the English tags
--
-- Nothing has to be done by hand on the live server: every deploy runs `python init_db.py --schema-only` (deploy/docker/deploy-entry.sh,
-- with /opt/lokportal/migrate.env), which adds exactly these columns (database.TAG_COLUMNS), and the backend also adds them when it starts. This file
-- is the same change for a database that is updated by hand, for example when that step is skipped:
--
--   mysql -h <DB endpoint> -u <migrate or master user> -p --ssl-ca=/etc/ssl/certs/rds-global-bundle.pem lokmangal_news_portal \
--         < backend/migrations/2026-11-27-tags.sql
--
-- Safe to run again and again: a column that exists already is left alone. No row is changed or deleted (every story starts without tags).
-- Needs MySQL 8+.

SET @have := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'tags');
SET @step := IF(@have = 0, 'ALTER TABLE articles ADD COLUMN tags VARCHAR(1000) NOT NULL DEFAULT ''''', 'DO 0');
PREPARE step FROM @step;
EXECUTE step;
DEALLOCATE PREPARE step;

SET @have := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'tags_en');
SET @step := IF(@have = 0, 'ALTER TABLE articles ADD COLUMN tags_en VARCHAR(1000) NOT NULL DEFAULT ''''', 'DO 0');
PREPARE step FROM @step;
EXECUTE step;
DEALLOCATE PREPARE step;

-- what the table has now
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
  FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME IN ('tags', 'tags_en')
 ORDER BY COLUMN_NAME;
