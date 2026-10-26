-- 2026-10-24 - public comments on news, blogs and weekly issues. Five new tables:
--
--   commenters       the readers who comment (e-mail, name): Google, an e-mailed code, or a name + e-mail typed
--   commenter_codes  the 6 digit codes mailed for the e-mail sign-in (a hash, its tries)
--   comments         the comments and their replies (one level), with the like / dislike / report counts
--   comment_votes    one like or dislike per visitor and comment
--   comment_reports  one report per visitor and comment
--
-- Nothing has to be done by hand on the live server: every deploy runs `python init_db.py --schema-only` (deploy/docker/deploy-entry.sh,
-- with /opt/lokportal/migrate.env), which creates these tables from schema.sql. The web application's own MySQL user only needs
-- SELECT, INSERT, UPDATE, DELETE on the database, which it has already. This file is the same change for a database that is updated by hand:
--
--   mysql -h <DB endpoint> -u <migrate or master user> -p --ssl-ca=/etc/ssl/certs/rds-global-bundle.pem lokmangal_news_portal \
--         < backend/migrations/2026-10-24-comments.sql
--
-- There are no foreign keys on purpose (the migrate user of the server may not create them): the code deletes replies, votes and reports with a comment.
-- Safe to run again and again: a table that exists already is left alone. No row is changed or deleted. Needs MySQL 8+.

CREATE TABLE IF NOT EXISTS commenters (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  email         VARCHAR(190)  NOT NULL,
  name          VARCHAR(60)   NOT NULL,
  provider      VARCHAR(10)   NOT NULL,
  created_at    DATETIME      NOT NULL,
  last_login_at DATETIME      NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_commenters_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS commenter_codes (
  email         VARCHAR(190)  NOT NULL,
  code_hash     CHAR(64)      NOT NULL,
  expires_at    DATETIME      NOT NULL,
  tries         TINYINT UNSIGNED NOT NULL DEFAULT 0,
  sent_at       DATETIME      NOT NULL,
  sends         TINYINT UNSIGNED NOT NULL DEFAULT 1,
  window_start  DATETIME      NOT NULL,
  PRIMARY KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  item_type   VARCHAR(10)   NOT NULL,
  item_id     INT UNSIGNED  NOT NULL,
  parent_id   INT UNSIGNED  NULL,
  commenter_id INT UNSIGNED NULL,
  name        VARCHAR(60)   NOT NULL,
  body        TEXT          NOT NULL,
  likes       INT UNSIGNED  NOT NULL DEFAULT 0,
  dislikes    INT UNSIGNED  NOT NULL DEFAULT 0,
  reports     INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL,
  PRIMARY KEY (id),
  KEY idx_comments_item (item_type, item_id, parent_id, id),
  KEY idx_comments_parent (parent_id, id),
  KEY idx_comments_reports (reports, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment_votes (
  comment_id   INT UNSIGNED  NOT NULL,
  visitor_hash CHAR(64)      NOT NULL,
  vote         TINYINT       NOT NULL,
  PRIMARY KEY (comment_id, visitor_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment_reports (
  comment_id   INT UNSIGNED  NOT NULL,
  visitor_hash CHAR(64)      NOT NULL,
  created_at   DATETIME      NOT NULL,
  PRIMARY KEY (comment_id, visitor_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- what exists now
SELECT TABLE_NAME FROM information_schema.TABLES
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('comments', 'comment_votes', 'comment_reports')
 ORDER BY TABLE_NAME;
