# आधीपासून असलेल्या EC2 + RDS वर (Docker) — दुसऱ्या projects ना हात न लावता

हा मार्ग तेव्हा वापरा जेव्हा **EC2 server आणि RDS आधीच इतर projects ने भरलेले** आहेत (`DEPLOY.md` चा CloudFormation stack नवा server + नवा RDS बनवतो — ते इथे नको). इथे फक्त हे **नवे** भाग बनतात:

| काय | नाव | टीप |
|---|---|---|
| Website + Admin | Amplify app `lokmangal-news-portal`, **दोन branches**: `main` = वेबसाईट (`www.lokmangal.info`), `admin` = Admin Panel (`admin.lokmangal.info`) | GitHub Actions मधून deploy (दोन zip); AWS key कुठेही साठवली जात नाही (OIDC). Admin वेगळ्या पत्त्यावर = वेगळा browser origin |
| फाईल्स | S3 `lokportal-media-<account>-<region>` + CloudFront | private bucket; फक्त CloudFront वाचतो |
| API चा `https://` पत्ता | CloudFront (`xxxx.cloudfront.net`) | स्वतःचा domain नसतानाही चालतो |
| Backend | Docker containers `lokportal-api` + `lokportal-proxy` | server वर फक्त port **8445** वापरतो (80/443 वर दुसरे projects आहेत) |
| Database | RDS वर नवा database `lokmangal_news_portal` + user `lokportal_app` | फक्त त्या DB चा data बदलू शकतो; इतर databases दिसत / बदलत नाहीत |
| S3 साठी server ची ओळख | IAM user `lokportal-media-uploader` | फक्त त्या एका bucket चे अधिकार |

```
वाचक ──► https://www.lokmangal.info   (Amplify branch main: फक्त वेबसाईट; /admin/ फक्त admin कडे पाठवणारे पान)
मालक ──► https://admin.lokmangal.info (Amplify branch admin: फक्त Admin Panel; कडक CSP: फक्त api.lokmangal.info शी बोलू शकतो)
              │  (दोन्ही) https://api.lokmangal.info = CloudFront ──► EC2:8445 [nginx] ─► [gunicorn+Flask] ─► RDS (नवा DB, TLS)
वाचक ──► https://media.lokmangal.info (फोटो / PDF / व्हिडिओ) ◄── CloudFront ◄── S3 (private)
```

## 1. AWS बाजू (एकदाच)

```bash
# Amplify app (GitHub शी थेट जोडलेले नाही; deploy GitHub Actions करते)
aws amplify create-app --name lokmangal-news-portal --platform WEB --custom-rules '[{"source":"/admin","target":"/admin/index.html","status":"200"}]'
aws amplify create-branch --app-id <appId> --branch-name main --stage PRODUCTION --no-enable-auto-build
aws amplify create-branch --app-id <appId> --branch-name admin --stage PRODUCTION --no-enable-auto-build      # Admin Panel साठी दुसरी branch

# S3 + CloudFront (media) + API साठी CloudFront + IAM user + GitHub deploy role
aws cloudformation deploy --stack-name lokportal-shared --template-file deploy/aws/shared-server-stack.yml --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides "SiteOrigins=https://main.<appId>.amplifyapp.com" AmplifyAppId=<appId> \
  ApiOriginHost=<server चे Public IPv4 DNS> ApiOriginPort=8445 OriginSecret=<48 यादृच्छिक अक्षरे/अंक>
  "GitHubSubjectPrefix=<gh api repos/<owner>/<repo>/actions/oidc/customization/sub चा sub_claim_prefix>"      # GitHub 'immutable' subject वापरत असेल तर (हा account तसा आहे)
aws cloudformation describe-stacks --stack-name lokportal-shared --query 'Stacks[0].Outputs'
aws iam create-access-key --user-name lokportal-media-uploader        # key फक्त server च्या backend.env मध्ये जाते
```

## 2. Server बाजू

```bash
# PC वरून फाईल्स पाठवा, मग server वर
tar -czf - -C deploy/docker . | ssh -i <key.pem> ubuntu@<server> 'D=$(mktemp -d) && tar -xzf - -C "$D" && echo "$D"'      # (त्या फोल्डरचे नाव छापते)
ssh -i <key.pem> ubuntu@<server> "sudo ORIGIN_SECRET='<तोच OriginSecret>' bash <छापलेले फोल्डर>/setup-server.sh"
```
`/opt/lokportal/backend.env` (मालक uid 10001, mode 600) मध्ये `backend/.env.example` प्रमाणे भरा — खास मूल्ये:
`APP_ENV=production`, `SERVE_FRONTEND=false`, **`TRUSTED_PROXIES=2`** (nginx + CloudFront), `CORS_ORIGINS=https://main.<appId>.amplifyapp.com`, `DB_HOST/DB_USER/DB_PASSWORD/DB_NAME`, `DB_SSL_CA=/app/certs/rds-global-bundle.pem`, `DB_POOL_SIZE=2` (shared RDS), `STORAGE_BACKEND=s3`, `S3_BUCKET`, `MEDIA_BASE_URL`, `AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY` (वरचा IAM user), `UPLOAD_TMP_DIR=/tmp/uploads`, `ADMIN_PASSWORD_HASH`, `SECRET_KEY`.

**Database:** RDS master user ने (पासवर्ड कुठेही सेव्ह न करता) फक्त हे चालवा:
```sql
CREATE DATABASE lokmangal_news_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lokportal_app'@'%' IDENTIFIED BY '<यादृच्छिक पासवर्ड>' REQUIRE SSL;
GRANT SELECT, INSERT, UPDATE, DELETE ON lokmangal_news_portal.* TO 'lokportal_app'@'%';
```
मग टेबल्स + सध्याचा मजकूर (एकदाच, master user ने):
```bash
sudo docker run --rm -i -v /opt/lokportal/backend.env:/app/.env:ro lokportal-api:current \
  sh -c 'read -r DB_PASSWORD; export DB_PASSWORD DB_USER=admin; python init_db.py --seed'      # master पासवर्ड stdin ने
sudo docker compose -f /opt/lokportal/docker-compose.yml up -d
```

## 3. Admin पासवर्ड

hash तुमच्या PC वर बनवा (`cd backend && python manage.py set-admin-password --print-only`) आणि `ADMIN_PASSWORD_HASH='…'` म्हणून `backend.env` मध्ये ठेवा; मग `sudo docker compose -f /opt/lokportal/docker-compose.yml restart api`.

## 4. CI/CD (GitHub Actions)

`.github/workflows/ci.yml` प्रत्येक push / PR वर चालते: backend tests (92), JS syntax, CloudFormation lint, scripts, Docker image build.
`.github/workflows/deploy.yml` `main` वर push झाल्यावर, CI पास झाल्यावर:

1. **Website → Amplify:** (job ला GitHub `environment:` नाही — role फक्त repo + branch `main` वर विश्वास ठेवतो) GitHub OIDC ने `lokportal-github-deploy` role (फक्त त्या एका Amplify app चे अधिकार, फक्त `main` branch) → `js/env-config.js` लिहितो → `customHttp.yml` headers → `frontend/` चा zip upload → publish → smoke test.
2. **Backend → EC2:** `backend/` चा tar.gz SSH ने server वर. त्या SSH key ला **फक्त एकच आज्ञा** चालवता येते (`/opt/lokportal/deploy-entry.sh`: image build → container बदल → `/api/health` तपासणी → अपयश आले तर जुनी आवृत्ती परत). Key सक्रिय करण्यासाठी (एकदाच, तुमच्या परवानगीने):
   ```bash
   ssh-keygen -t ed25519 -N "" -C github-actions-lokportal -f deploykey
   scp/ssh द्वारे:  sudo DEPLOY_PUBKEY="$(cat deploykey.pub)" bash /tmp/lokportal-setup/install-deploy-key.sh
   gh secret set DEPLOY_SSH_KEY < deploykey
   ssh-keyscan -t ed25519 <server IP> | gh secret set DEPLOY_KNOWN_HOSTS
   shred -u deploykey deploykey.pub
   ```
   ते होईपर्यंत deploy job फक्त "skipped" सांगतो; backend साठी हाताने: `tar -czf - -C backend --exclude=tests --exclude=__pycache__ . | ssh <server> 'sudo SSH_ORIGINAL_COMMAND=deploy /opt/lokportal/deploy-entry.sh'`.

## 5. Domain (GoDaddy DNS — Route 53 वापरत नाही)

`lokmangal.info` चे DNS GoDaddy वरच राहते. खालील CNAME records त्यात जोडलेले आहेत (GoDaddy DNS API token ने; तो token नंतर delete करावा):

| Name | Value | कशासाठी |
|---|---|---|
| `www` | Amplify चा `xxxx.cloudfront.net` (`aws amplify get-domain-association`) | वेबसाईट `https://www.lokmangal.info` |
| `_…` (Amplify चे) | `_….acm-validations.aws` | Amplify चे certificate verify |
| `api` | API CloudFront (`ApiBaseUrl`) | `https://api.lokmangal.info` |
| `_….api` | `_….acm-validations.aws` | `api` / `media` चे ACM certificate (us-east-1) verify |
| `media` | media CloudFront (`MediaBaseUrl`) | `https://media.lokmangal.info` (फोटो / PDF / व्हिडिओ) |
| `admin` | Amplify चा `xxxx.cloudfront.net` (`www` सारखाच) | `https://admin.lokmangal.info` = Admin Panel (Amplify domain association: `prefix=admin,branchName=admin`) |
| `_….media` | `_….acm-validations.aws` | वरीलप्रमाणे |

- **Certificate:** `aws acm request-certificate --region us-east-1 --domain-name api.<domain> --subject-alternative-names media.<domain> --validation-method DNS`; ISSUED झाल्यावर stack मध्ये `CertificateArn`, `ApiAlias`, `MediaAlias` द्या (`update-stack`, बाकी parameters `UsePreviousValue`).
- **Apex (`lokmangal.info` बिना www):** GoDaddy मध्ये root ला CNAME चालत नाही → GoDaddy → Forwarding → `https://www.lokmangal.info`.
- **backend.env:** `CORS_ORIGINS=https://www.<domain>,https://admin.<domain>,…` (Admin चा origin अत्यावश्यक; apex फक्त forward करतो म्हणून नको) आणि `MEDIA_BASE_URL=https://media.<domain>`; `docker compose … up -d --force-recreate --no-deps api`.
- **GitHub:** `deploy.yml` मधील `LOKMANGAL_API_BASE=https://api.<domain>`.
- DNS records बदलायला GoDaddy चा API token लागतो; तो वापरून झाल्यावर developer.godaddy.com वर delete करा.

## 6. Developer ने काहीही push केले तर काय होते

`main` वर push → CI (tests) → पास झाले तरच deploy. **कोणीही काहीही हाताने चालवायचे नाही.**

| Developer ने काय बदलले | काय होते | किती वेळात live |
|---|---|---|
| फोटो / लोगो / जाहिरात इमेज (`frontend/assets/…`) | वेबसाईटच्या zip मध्ये जातात; Amplify वर नवी फाईल | ~3–4 मिनिटे deploy; **नवी फाईल लगेच दिसते.** *त्याच नावाने बदललेला* फोटो visitors च्या browser cache मुळे **1 तासापर्यंत** जुना दिसू शकतो (`customHttp.yml`). लगेच हवे असेल तर नवे फाईल-नाव वापरा |
| HTML / CSS / JS (वेबसाईट) | वरीलप्रमाणे; JS/CSS 5 मिनिटे cache | ~3–4 मिनिटे |
| Admin Panel चे JS/HTML (`frontend/admin/`) | फक्त `admin` branch वर (`admin.lokmangal.info`) | ~3–4 मिनिटे |
| Backend कोड (`backend/`) | नवा Docker image → DB मध्ये **नवे table / column** (पुढे पहा) → container बदल → health check; अयशस्वी झाले तर जुना परत | ~2–3 मिनिटे |
| **DB मध्ये नवे table / column** (`schema.sql`, `database.py` चे `*_COLUMNS`) | प्रत्येक backend deploy मध्ये `init_db.py --schema-only` आपोआप चालते (वेगळ्या `lokportal_migrate` user ने, फक्त आपल्या DB वर; `/opt/lokportal/migrate.env`). *नवे* table/column जोडले जातात; **कोणताही row बदलत नाही** | backend बरोबर |
| DB मध्ये column **हटवणे / नाव बदलणे / data बदलणे** | **आपोआप होत नाही** (जाणूनबुजून). हाताने: master user ने SQL; आधी backup | — |
| Tests अयशस्वी | deploy होतच नाही; GitHub मध्ये लाल ✗ | — |
| एकामागून एक दोन push | queue मध्ये (concurrency) — क्रमाने deploy | — |

**Developer साठी नियम:** (1) नवे table `schema.sql` मध्ये (`CREATE TABLE IF NOT EXISTS`), नवे column `database.py` च्या `*_COLUMNS` मध्ये आणि `init_db.add_missing_columns()` मध्ये; (2) फक्त जोडणारे बदल (additive); (3) Windows वर फाईल-नावाचे अक्षर-case (`Logo.PNG` ≠ `logo.png`) — live host case-sensitive आहे; (4) स्थानिकरित्या Admin मधून अपलोड केलेले फोटो `frontend/assets/images/` मध्ये जातात — ते Git मध्ये commit केले तरच live वेबसाईटवर दिसतात (live Admin मधून अपलोड केलेले फोटो S3 वर जातात, Git मध्ये नाही); (5) बातम्या / व्हिडिओ / जाहिराती **live Admin Panel मध्ये** भरा — स्थानिक डेटाबेस live वर जात नाही.

## 7. Rollback आणि तातडीची कामे

```bash
# Backend मागच्या आवृत्तीवर (server वर):
sudo docker tag lokportal-api:previous lokportal-api:current && sudo docker compose -f /opt/lokportal/docker-compose.yml up -d --force-recreate --no-deps api
# Website मागच्या आवृत्तीवर: GitHub → Actions → जुना यशस्वी "Deploy" run → Re-run all jobs  (किंवा git revert + push)
# Logs:   sudo docker logs --tail 100 -f lokportal-api
# Backups: /opt/lokportal/backups/ (backend.env च्या जुन्या प्रती, deploy-entry.sh, DB import आधीची data-प्रत). RDS चा automatic backup (RDS console) हा खरा DB backup.
# Admin पासवर्ड बदलणे:  cd backend && python manage.py set-admin-password --print-only  → ADMIN_PASSWORD_HASH='…' backend.env मध्ये → api container restart
```

## सुरक्षेच्या मर्यादा (प्रामाणिकपणे)

**आधीच केलेले:** लॉगिन + lockout (खरा visitor-पत्ता मोजतो, `X-Forwarded-For` ने फसवता येत नाही), बातमीचा मजकूर server वर स्वच्छ, फाईल्सचा आशय तपासला, Admin वेगळ्या origin वर + कडक CSP, सर्व TLS 1.2/1.3 + HSTS, S3 private (फक्त CloudFront), DB TLS ने (certificate तपासून) + वेगवेगळे MySQL users (app = फक्त data; migrate = फक्त table/column जोडणे), nginx मध्ये body-size / अपलोड / rate-limit gates, origin secret (थेट server IP वर `403`), deploy key फक्त एकच आज्ञा, deploy अयशस्वी झाला तर आपोआप मागची आवृत्ती.

**उरलेल्या मर्यादा / धोके (क्रमाने महत्त्वाचे):**

1. **CloudFront → EC2 हा टप्पा plain HTTP** आहे: Admin पासवर्ड, 12 तासांचा token आणि origin secret हा टप्पा **विना-एन्क्रिप्शन** पार करतात (AWS च्या नेटवर्कमधून, पण तरी). उपाय (पुढचा टप्पा, ~10 मिनिटांची maintenance window): `origin.<domain>` साठी Let's Encrypt certificate (DNS-01, acme-dns CNAME ने — GoDaddy token कायमचा ठेवावा लागत नाही) + nginx `listen 8445 ssl` + CloudFront `OriginProtocolPolicy: https-only`.
2. **Shared server:** (अ) EC2 वर IMDSv1 चालू आहे (`HttpTokens=optional`) — कोणत्याही container मधून (आपल्यासह) instance-role चे credentials मिळू शकतात; हे **इतर projects चे** सेटिंग आहे, ते बदलल्यास त्यांचे काही अ‍ॅप तुटू शकतात — त्यांच्या मालकाने ठरवावे (IMDSv2 सक्ती + hop-limit). (आ) RDS **एनक्रिप्टेड नाही (at-rest), DeletionProtection बंद, Multi-AZ नाही** — shared instance आहे; automatic backup 7 दिवस आहे. (इ) Server चे port 22 जगभर खुले आहे — key-only login असल्याची खात्री करा.
3. **GitHub:** repo मध्ये write access असलेले कोणीही workflow बदलून deploy key / AWS role वापरू शकतात. उपाय (repo मालकाने, GitHub → Settings): `main` वर *Branch protection* (PR + मालकाची मान्यता) आणि `DEPLOY_SSH_KEY` ला *Environment* (फक्त `main`) — यासाठी admin अधिकार लागतो (मला नव्हता).
4. **Lockout** प्रत्येक gunicorn worker च्या memory मध्ये (2 workers) — कमाल ~10 चुकीचे प्रयत्न / 15 मिनिटे, restart वर पुसले जाते.
5. **API वाचन CloudFront वर cache होत नाही** (`CachingDisabled`) — प्रत्येक visitor चे 4 API calls EC2 वर येतात; खूप गर्दीत shared 2-vCPU server वर ताण. उपाय: 15–60 सेकंदांची cache policy (`Origin` + `Authorization` key मध्ये).
6. **200 MB व्हिडिओ अपलोड** CloudFront च्या 60 s origin-timeout जवळ (चाचणी: 25 MB = 13 s). खूप मोठे व्हिडिओ अयशस्वी होऊ शकतात → उपाय: browser वरून थेट S3 (presigned) अपलोड.
7. **Admin पासवर्ड** फक्त एक व्यक्ती-खाते; 2-factor नाही. मजबूत पासवर्ड वापरा; बदलणे: `manage.py set-admin-password --print-only`.
8. **Root AWS keys / GoDaddy token / RDS master पासवर्ड** हे मला काम करण्यासाठी दिले होते — काम झाल्यावर **निष्क्रिय / बदलणे** (root keys: IAM → Security credentials; GoDaddy: developer.godaddy.com/keys → Delete; RDS master पासवर्ड बदलण्यापूर्वी इतर projects तो वापरतात का ते तपासा).
