-- 2026-10-26 - the mobile number of a reader who comments without signing in. One new column of `commenters`:
--
--   mobile  VARCHAR(15)  10 digits (6-9 first), asked in the website's "Post Your Comment" dialog under "continue without login". The Admin Panel
--                        shows it next to the name and e-mail in Comments. It is never shown on the website.
--
-- Nothing has to be done by hand on the live server: every deploy runs `python init_db.py --schema-only` (deploy/docker/deploy-entry.sh,
-- with /opt/lokportal/migrate.env), which adds exactly this column (database.COMMENTER_COLUMNS). This file is the same change for a database
-- that is updated by hand:
--
--   mysql -h <DB endpoint> -u <migrate or master user> -p --ssl-ca=/etc/ssl/certs/rds-global-bundle.pem lokmangal_news_portal \
--         < backend/migrations/2026-10-26-commenter-mobile.sql
--
-- Safe to run again and again: a column that exists already is left alone. No row is changed or deleted (the readers who commented before have
-- no mobile number). Needs MySQL 8+ and the tables of 2026-10-24-comments.sql.

SET @have := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'commenters' AND COLUMN_NAME = 'mobile');
SET @step := IF(@have = 0, 'ALTER TABLE commenters ADD COLUMN mobile VARCHAR(15) NULL', 'DO 0');
PREPARE step FROM @step;
EXECUTE step;
DEALLOCATE PREPARE step;

-- what the table has now
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
  FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'commenters' AND COLUMN_NAME = 'mobile';
