-- Run ONCE on the RDS database as the MASTER user (user "admin"; its password is in AWS Secrets Manager - see DEPLOY.md, step 4):
--
--   mysql -h <DB endpoint> -u admin -p --ssl-ca=/etc/ssl/certs/rds-global-bundle.pem < create-db-user.sql
--
-- First replace  CHOOSE-A-LONG-RANDOM-PASSWORD  below (use the same one as DB_PASSWORD in backend/.env).
--
-- The website's own MySQL user may only read and change DATA of this one database: it cannot create / drop tables, see other
-- databases or manage users. (Tables are created by `python init_db.py`, which runs once with the master user.)
CREATE DATABASE IF NOT EXISTS lokmangal_news_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'lokmangal_app'@'%' IDENTIFIED BY 'CHOOSE-A-LONG-RANDOM-PASSWORD' REQUIRE SSL;
ALTER USER 'lokmangal_app'@'%' IDENTIFIED BY 'CHOOSE-A-LONG-RANDOM-PASSWORD' REQUIRE SSL;
GRANT SELECT, INSERT, UPDATE, DELETE ON lokmangal_news_portal.* TO 'lokmangal_app'@'%';
FLUSH PRIVILEGES;

SHOW GRANTS FOR 'lokmangal_app'@'%';
