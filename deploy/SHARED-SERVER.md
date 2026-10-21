# आधीपासून असलेल्या EC2 + RDS वर (Docker) — दुसऱ्या projects ना हात न लावता

हा मार्ग तेव्हा वापरा जेव्हा **EC2 server आणि RDS आधीच इतर projects ने भरलेले** आहेत (`DEPLOY.md` चा CloudFormation stack नवा server + नवा RDS बनवतो — ते इथे नको). इथे फक्त हे **नवे** भाग बनतात:

| काय | नाव | टीप |
|---|---|---|
| Website | Amplify app `lokmangal-news-portal` | GitHub Actions मधून deploy (zip upload); AWS key कुठेही साठवली जात नाही (OIDC) |
| फाईल्स | S3 `lokportal-media-<account>-<region>` + CloudFront | private bucket; फक्त CloudFront वाचतो |
| API चा `https://` पत्ता | CloudFront (`xxxx.cloudfront.net`) | स्वतःचा domain नसतानाही चालतो |
| Backend | Docker containers `lokportal-api` + `lokportal-proxy` | server वर फक्त port **8445** वापरतो (80/443 वर दुसरे projects आहेत) |
| Database | RDS वर नवा database `lokmangal_news_portal` + user `lokportal_app` | फक्त त्या DB चा data बदलू शकतो; इतर databases दिसत / बदलत नाहीत |
| S3 साठी server ची ओळख | IAM user `lokportal-media-uploader` | फक्त त्या एका bucket चे अधिकार |

```
वाचक ──► Amplify (वेबसाईट + /admin/) ──► https://xxxx.cloudfront.net (API) ──► EC2:8445 [nginx] ─► [gunicorn+Flask] ─► RDS (नवा DB, TLS)
वाचक ──► https://yyyy.cloudfront.net (फोटो / PDF / व्हिडिओ) ◄── S3 ◄──────────────────────────────────────────────────┘
```

## 1. AWS बाजू (एकदाच)

```bash
# Amplify app (GitHub शी थेट जोडलेले नाही; deploy GitHub Actions करते)
aws amplify create-app --name lokmangal-news-portal --platform WEB --custom-rules '[{"source":"/admin","target":"/admin/index.html","status":"200"}]'
aws amplify create-branch --app-id <appId> --branch-name main --stage PRODUCTION --no-enable-auto-build

# S3 + CloudFront (media) + API साठी CloudFront + IAM user + GitHub deploy role
aws cloudformation deploy --stack-name lokportal-shared --template-file deploy/aws/shared-server-stack.yml --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides "SiteOrigins=https://main.<appId>.amplifyapp.com" AmplifyAppId=<appId> \
  ApiOriginHost=<server चे Public IPv4 DNS> ApiOriginPort=8445 OriginSecret=<48 यादृच्छिक अक्षरे/अंक>
aws cloudformation describe-stacks --stack-name lokportal-shared --query 'Stacks[0].Outputs'
aws iam create-access-key --user-name lokportal-media-uploader        # key फक्त server च्या backend.env मध्ये जाते
```

## 2. Server बाजू

```bash
# PC वरून फाईल्स पाठवा, मग server वर
tar -czf - -C deploy/docker . | ssh -i <key.pem> ubuntu@<server> 'mkdir -p /tmp/lokportal-setup && tar -xzf - -C /tmp/lokportal-setup'
ssh -i <key.pem> ubuntu@<server> "sudo ORIGIN_SECRET='<तोच OriginSecret>' bash /tmp/lokportal-setup/setup-server.sh"
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

1. **Website → Amplify:** GitHub OIDC ने `lokportal-github-deploy` role (फक्त त्या एका Amplify app चे अधिकार, फक्त `main` branch) → `js/env-config.js` लिहितो → `customHttp.yml` headers → `frontend/` चा zip upload → publish → smoke test.
2. **Backend → EC2:** `backend/` चा tar.gz SSH ने server वर. त्या SSH key ला **फक्त एकच आज्ञा** चालवता येते (`/opt/lokportal/deploy-entry.sh`: image build → container बदल → `/api/health` तपासणी → अपयश आले तर जुनी आवृत्ती परत). Key सक्रिय करण्यासाठी (एकदाच, तुमच्या परवानगीने):
   ```bash
   ssh-keygen -t ed25519 -N "" -C github-actions-lokportal -f deploykey
   scp/ssh द्वारे:  sudo DEPLOY_PUBKEY="$(cat deploykey.pub)" bash /tmp/lokportal-setup/install-deploy-key.sh
   gh secret set DEPLOY_SSH_KEY < deploykey
   ssh-keyscan -t ed25519 <server IP> | gh secret set DEPLOY_KNOWN_HOSTS
   shred -u deploykey deploykey.pub
   ```
   ते होईपर्यंत deploy job फक्त "skipped" सांगतो; backend साठी हाताने: `tar -czf - -C backend --exclude=tests --exclude=__pycache__ . | ssh <server> 'sudo SSH_ORIGINAL_COMMAND=deploy /opt/lokportal/deploy-entry.sh'`.

## 5. स्वतःचा domain आल्यावर

- **Website:** Amplify → Domain management → `www.<domain>`; मग `CORS_ORIGINS` (backend.env) व CloudFormation चा `SiteOrigins` मध्ये नवा पत्ता जोडा.
- **API:** CloudFront distribution मध्ये alternate domain `api.<domain>` + ACM certificate (us-east-1, DNS validation) → DNS `api` CNAME → distribution. मग `deploy.yml` मधील `LOKMANGAL_API_BASE` बदला.
- आत्ताचा `cloudfront.net` पत्ता तसाच चालू राहतो; हवा तर बंद करता येतो.

## सुरक्षेच्या मर्यादा (प्रामाणिकपणे)

- CloudFront → EC2 हा टप्पा **plain HTTP** आहे (domain नसल्याने origin साठी certificate मिळत नाही). बाहेरून थेट server चा port 8445 वापरला तर `X-Origin-Verify` secret नसल्याने `403` मिळतो. Domain आल्यावर हा टप्पा TLS करा (nginx ला certificate + CloudFront `https-only`).
- EC2 चा port 22 जगभर खुला आहे (दुसऱ्या projects चा निर्णय); key-only login असल्याची खात्री करा.
- `lokdeploy` user docker गटात आहे (docker गट = server वर root समान). म्हणून त्याची key **forced command** ने मर्यादित आहे — ती key GitHub secret मध्येच ठेवा, कुठेही कॉपी करू नका.
