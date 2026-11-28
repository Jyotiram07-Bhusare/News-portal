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
  is_review     TINYINT(1)    NOT NULL DEFAULT 0,                   -- 1 = listed in the website's Review section (रिव्ह्यू), before the most viewed
  sort_order    INT           NULL,                                 -- the place in its section: news and blogs by date (newest = 1), Review by hand
  popular_order INT           NULL,                                 -- the place inside the Popular widget (1 = top), NULL when not in Popular
  random_order  INT           NULL,                                 -- the place inside the Random widget (1 = top), NULL when not in Random
  slug          VARCHAR(190)  NULL,                                 -- the words of the address (/blog/<slug>), short and in English letters: made when the news is created, never changed by an edit
  old_slugs     VARCHAR(1000) NULL,                                 -- addresses it had before, with commas between them: such a link goes on to the address of today
  clicks        INT UNSIGNED  NOT NULL DEFAULT 0,                   -- how often readers opened it (POST /api/articles/<id>/read): the website shows views + clicks, its Review section lists the most viewed
  tags          VARCHAR(1000) NOT NULL DEFAULT '',                  -- the topics of the story, with commas between them (the website shows them under it)
  tags_en       VARCHAR(1000) NOT NULL DEFAULT '',                  -- ... in English
  published_at  DATETIME      NULL,                                 -- when it was published, in INDIA time (IST), shown on the website as "Published on ... IST" - NULL = an older story that only has its date text
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
  slug           VARCHAR(190)    NULL,                     -- the words of its own address (/video/<slug>): made when it is uploaded, never changed by an edit
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ads of the website's "जाहिरात" widget (Admin Panel > Advertisements): a photo or a video, shown one after the other.
-- Created (and filled with the three ads the website always had) by the backend itself the first time ads are used - init_db.py does not run this
-- statement directly, it calls database.ensure_ads_table().
CREATE TABLE IF NOT EXISTS ads (
  id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  media_type     VARCHAR(10)     NOT NULL DEFAULT 'image',    -- image | video
  title          VARCHAR(300)    NOT NULL DEFAULT '',         -- what the ad is (the photo's alt text, the name in the Admin Panel)
  title_en       VARCHAR(300)    NOT NULL DEFAULT '',
  media_url      VARCHAR(1000)   NOT NULL,                    -- assets/images/ad-image_*.jpg | assets/videos/<file> | the https address of a video file
  thumbnail      VARCHAR(1000)   NOT NULL DEFAULT '',         -- a video ad's first picture (assets/images/ad-poster_*.jpg)
  link_url       VARCHAR(1000)   NOT NULL DEFAULT '',         -- where a click on the ad goes (https://...), empty = nowhere
  duration_sec   INT UNSIGNED    NULL,
  size_bytes     BIGINT UNSIGNED NULL,
  sort_order     INT             NULL,                        -- the place in the slider: 1 = first
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The website's footer details (Admin Panel > Footer): ONE row (id = 1) - the office address (Marathi + English), phone and e-mail.
-- Created (and filled with the details the footer started with) by the backend itself the first time it is needed - init_db.py does not run
-- this statement directly, it calls database.ensure_settings_table().
CREATE TABLE IF NOT EXISTS site_settings (
  id                INT UNSIGNED  NOT NULL,
  office_address    VARCHAR(500)  NOT NULL DEFAULT '',
  office_address_en VARCHAR(500)  NOT NULL DEFAULT '',
  office_phone      VARCHAR(40)   NOT NULL DEFAULT '',
  office_email      VARCHAR(160)  NOT NULL DEFAULT '',
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wrong admin passwords per client address, counted here (not in a process's memory) because the API runs several worker processes: after
-- LOGIN_MAX_FAILURES wrong ones in a row the address is locked until locked_until (LOGIN_LOCK_MINUTES), then it has that many tries again.
CREATE TABLE IF NOT EXISTS login_failures (
  address       VARCHAR(64)   NOT NULL,                      -- the visitor's address as the API sees it
  failures      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  first_at      DATETIME      NOT NULL,                      -- UTC, when this count started
  locked_until  DATETIME      NULL,                          -- UTC, NULL = not locked
  PRIMARY KEY (address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Readers who comment (the website's "Post Your Comment" dialog). One row per e-mail address: the name and e-mail are kept with the comments.
-- provider = google or email (the e-mail address is proven) or guest (name + e-mail typed, not proven: it can never take the address of a proven one).
-- The Admin Panel shows them under Comments. The website never shows an e-mail address.
CREATE TABLE IF NOT EXISTS commenters (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  email         VARCHAR(190)  NOT NULL,                      -- lower case
  name          VARCHAR(60)   NOT NULL,
  provider      VARCHAR(10)   NOT NULL,                      -- google | email | guest
  mobile        VARCHAR(15)   NULL,                          -- 10 digits: asked of a reader who goes on without signing in
  created_at    DATETIME      NOT NULL,                      -- UTC
  last_login_at DATETIME      NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_commenters_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The 6 digit code mailed to an address that signs in by e-mail: only a hash of it is kept, with its tries, and how many were sent lately.
CREATE TABLE IF NOT EXISTS commenter_codes (
  email         VARCHAR(190)  NOT NULL,
  code_hash     CHAR(64)      NOT NULL,
  expires_at    DATETIME      NOT NULL,                      -- UTC
  tries         TINYINT UNSIGNED NOT NULL DEFAULT 0,
  sent_at       DATETIME      NOT NULL,
  sends         TINYINT UNSIGNED NOT NULL DEFAULT 1,         -- codes sent since window_start (an address gets only a few an hour)
  window_start  DATETIME      NOT NULL,
  PRIMARY KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Public comments on a news story, a blog or a weekly issue (website: under the story, Admin Panel > Comments).
-- item_type = article (a news or blog, item_id = articles.id) or weekly (an issue, item_id = weekly_editions.issue_no). There is no foreign key to the
-- item itself because it can be one of two tables: database.delete_article() / delete_weekly_edition() delete its comments in the same transaction.
-- A reply (parent_id) points to a TOP-LEVEL comment of the same item, one level only. Deleting a comment deletes its replies, votes and reports: the code
-- does that (database.delete_comment). There are no FOREIGN KEY constraints on purpose: the MySQL user that runs init_db.py on the server may not create them.
-- Created by init_db.py (every deploy runs it) and, on a development PC, by database.ensure_comment_tables() when the backend starts.
CREATE TABLE IF NOT EXISTS comments (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  item_type   VARCHAR(10)   NOT NULL,                      -- article | weekly
  item_id     INT UNSIGNED  NOT NULL,
  parent_id   INT UNSIGNED  NULL,                          -- NULL = a top-level comment
  commenter_id INT UNSIGNED NULL,                          -- who wrote it (commenters.id), the name below is the one used when it was written
  name        VARCHAR(60)   NOT NULL,                      -- plain text
  body        TEXT          NOT NULL,                      -- plain text, at most 2000 characters
  likes       INT UNSIGNED  NOT NULL DEFAULT 0,            -- kept equal to the comment_votes rows in the same transaction
  dislikes    INT UNSIGNED  NOT NULL DEFAULT 0,
  reports     INT UNSIGNED  NOT NULL DEFAULT 0,            -- how many visitors reported it - never shown on the website
  created_at  DATETIME      NOT NULL,                      -- UTC, set with UTC_TIMESTAMP on insert
  PRIMARY KEY (id),
  KEY idx_comments_item (item_type, item_id, parent_id, id),
  KEY idx_comments_parent (parent_id, id),
  KEY idx_comments_reports (reports, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One vote per visitor and comment. visitor_hash = sha256 of SECRET_KEY + the visitor id the website made: the visitor id itself is never kept.
CREATE TABLE IF NOT EXISTS comment_votes (
  comment_id   INT UNSIGNED  NOT NULL,
  visitor_hash CHAR(64)      NOT NULL,
  vote         TINYINT       NOT NULL,                     -- 1 = like, -1 = dislike (no row = no vote)
  PRIMARY KEY (comment_id, visitor_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One report per visitor and comment (the count is comments.reports).
CREATE TABLE IF NOT EXISTS comment_reports (
  comment_id   INT UNSIGNED  NOT NULL,
  visitor_hash CHAR(64)      NOT NULL,
  created_at   DATETIME      NOT NULL,
  PRIMARY KEY (comment_id, visitor_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
