-- 2026-10-24 - the places inside the Popular (लोकप्रिय) and Random (यादृच्छिक) widgets. Two new columns of `articles`:
--
--   popular_order  INT NULL   the place inside the Popular widget (1 = the top), NULL when the story is not in Popular
--   random_order   INT NULL   the place inside the Random widget (1 = the top), NULL when the story is not in Random
--
-- A story put into Popular / Random becomes number 1 there and the others move down one place; the Admin Panel can give it another place.
--
-- Nothing has to be done by hand on the live server: every deploy runs `python init_db.py --schema-only` (deploy/docker/deploy-entry.sh,
-- with /opt/lokportal/migrate.env), which adds these columns (database.PLACEMENT_ORDER_COLUMNS), and the backend numbers the stories that
-- are already in Popular / Random when it starts (database.number_placements: the most recently marked first). This file is the same
-- change for a database that is updated by hand:
--
--   mysql -h <DB endpoint> -u <migrate or master user> -p --ssl-ca=/etc/ssl/certs/rds-global-bundle.pem lokmangal_news_portal \
--         < backend/migrations/2026-10-24-popular-random-order.sql
--
-- Safe to run again and again: a column that exists already is left alone. No row is changed or deleted. Needs MySQL 8+.

SET @have := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'popular_order');
SET @step := IF(@have = 0, 'ALTER TABLE articles ADD COLUMN popular_order INT NULL', 'DO 0');
PREPARE step FROM @step;
EXECUTE step;
DEALLOCATE PREPARE step;

SET @have := (SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'random_order');
SET @step := IF(@have = 0, 'ALTER TABLE articles ADD COLUMN random_order INT NULL', 'DO 0');
PREPARE step FROM @step;
EXECUTE step;
DEALLOCATE PREPARE step;

-- what the table has now
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
  FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME IN ('popular_order', 'random_order')
 ORDER BY COLUMN_NAME;
