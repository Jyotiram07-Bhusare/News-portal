-- Lokmangal News Portal - MySQL tables.
-- Run by "python init_db.py" (creates the database first). Safe to run again: nothing is dropped.

-- Articles created in the admin panel get ids from 10000 upwards. The website merges what the API returns into
-- its own built-in list BY ID, and that list already uses ids 1-22 (articles; the reviews 19-22 have no row
-- here) and 1001-1042+ (weekly issues = 1000 + issue number). A new article must never reuse one of those.
CREATE TABLE IF NOT EXISTS articles (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  title         VARCHAR(500)  NOT NULL,
  category      VARCHAR(50)   NOT NULL,
  categoryLabel VARCHAR(100)  NOT NULL,
  author        VARCHAR(200)  NOT NULL,
  `date`        VARCHAR(100)  NOT NULL,
  image         VARCHAR(1000) NOT NULL,
  excerpt       TEXT          NOT NULL,
  content       MEDIUMTEXT    NOT NULL,
  views         VARCHAR(20)   NOT NULL,
  title_en      VARCHAR(500)  NOT NULL DEFAULT '',
  author_en     VARCHAR(200)  NOT NULL DEFAULT '',
  excerpt_en    TEXT          NULL,
  content_en    MEDIUMTEXT    NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- set when the news is edited / marked Popular, Random, Lead: the website lists it first
  is_lead       TINYINT(1)    NOT NULL DEFAULT 0,
  is_popular    TINYINT(1)    NOT NULL DEFAULT 0,
  is_random     TINYINT(1)    NOT NULL DEFAULT 0,
  is_latest     TINYINT(1)    NOT NULL DEFAULT 1,                   -- 1 = listed in the Home page's Latest News section
  PRIMARY KEY (id),
  KEY idx_articles_category (category)
) ENGINE=InnoDB AUTO_INCREMENT=10000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS weekly_editions (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  issue_no      INT UNSIGNED  NOT NULL,
  `date`        VARCHAR(100)  NOT NULL,
  title         VARCHAR(500)  NOT NULL,
  image         VARCHAR(1000) NOT NULL,
  pdf_filename  VARCHAR(255)  NOT NULL,
  views         VARCHAR(20)   NOT NULL,
  description   TEXT          NULL,
  title_en      VARCHAR(500)  NOT NULL DEFAULT '',
  description_en TEXT         NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_weekly_issue_no (issue_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Videos uploaded in the Admin Panel (Videos). The website's "Featured Videos" widget lists the newest ones and plays the file itself.
-- The backend also creates this table by itself the first time it is needed (an older database does not have it).
CREATE TABLE IF NOT EXISTS videos (
  id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  title          VARCHAR(500)    NOT NULL,
  title_en       VARCHAR(500)    NOT NULL DEFAULT '',
  description    TEXT            NULL,
  description_en TEXT            NULL,
  video_url      VARCHAR(1000)   NOT NULL,                 -- assets/videos/<file>, saved by POST /api/upload/video
  thumbnail      VARCHAR(1000)   NOT NULL DEFAULT '',      -- a picture taken from the video by the Admin Panel (assets/images/video-poster_*.jpg)
  duration_sec   INT UNSIGNED    NULL,
  size_bytes     BIGINT UNSIGNED NULL,
  sort_order     INT             NULL,                     -- the place on the website: 1 = first (the Admin Panel keeps the numbers 1..N)
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
