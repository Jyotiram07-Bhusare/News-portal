# AWS वर प्रकाशित करणे — Amplify + EC2 + RDS + S3

> **दोन मार्ग:** (अ) हा दस्तऐवज — नवा, फक्त या portal साठीचा server + RDS (CloudFormation सगळे बनवतो). (ब) **[deploy/SHARED-SERVER.md](deploy/SHARED-SERVER.md)** — EC2 / RDS आधीच इतर projects ने वापरले असतील तर: Docker मध्ये, दुसऱ्या projects ना हात न लावता, CI/CD सह.

```
 वाचक / Admin
    │
    ├──► AWS Amplify ───────────── वेबसाईट + Admin Panel (frontend/ : HTML, CSS, JS)
    │         │
    │         └─ API calls (https) ──► api.<तुमचे-डोमेन>  =  EC2 : nginx → gunicorn → Flask (backend/)
    │                                                          │              │
    │                                                          │              └─► RDS MySQL   (private, फक्त EC2 ला प्रवेश)
    │                                                          │
    └──► CloudFront ──► S3 (अपलोड केलेले फोटो / PDF / व्हिडिओ) ◄┘  EC2 ला IAM role मधून परवानगी (कोणतीही access key नाही)
```

| भाग | कुठे | काय आहे |
|---|---|---|
| Frontend | **AWS Amplify** | `frontend/` फोल्डर; `amplify.yml` + `customHttp.yml` (security headers) |
| Backend | **EC2** | Flask API, gunicorn + nginx, HTTPS (Let's Encrypt) |
| Database | **RDS MySQL** | private, encrypted, रोजचा automatic backup (7 दिवस) |
| Storage | **S3 + CloudFront** | private bucket; फाईल्स फक्त CloudFront वरून वाचल्या जातात |

> **HTTPS साठी एक डोमेन लागते** (Amplify ची साईट https आहे, म्हणून तिचा API ही https हवा). `api.तुमचे-डोमेन.com` साठी DNS record बनवता आला पाहिजे.
> Region: `ap-south-1` (Mumbai) सुचवले आहे.

---

## पायरी 1 — AWS संसाधने बनवा (एकदाच, CloudFormation)

`deploy/aws/lokmangal-stack.yml` एका वेळी हे सगळे बनवतो: S3 bucket + CloudFront, EC2 साठी IAM role, security groups, RDS MySQL, EC2 server (Elastic IP सह).

1. AWS Console → **CloudFormation → Create stack → With new resources → Upload a template file** → `lokmangal-stack.yml`.
2. Parameters:
   - `VpcId` — default VPC चालेल (EC2 → *Your VPCs*).
   - `ServerSubnetId` — त्या VPC मधला एक **public** subnet.
   - `DatabaseSubnetIds` — त्याच VPC चे **किमान दोन** subnets (वेगवेगळ्या availability zones मधले).
   - `SiteOrigins` — वेबसाईटचे पत्ते, स्वल्पविरामाने, `https://` सह, शेवटी `/` नाही. आत्ता Amplify चा पत्ता माहीत नसेल तर `https://www.तुमचे-डोमेन.com` भरा; नंतर stack *Update* करता येतो.
   - बाकी डिफॉल्ट ठेवा. `SshCidr` **रिकामे** ठेवा (SSH पोर्ट उघडला जात नाही; **Session Manager** वापरायचे).
3. **Create stack**. RDS मुळे सुमारे 15–20 मिनिटे लागतात.
4. तयार झाल्यावर **Outputs** टॅबमधून हे लिहून ठेवा: `MediaBucketName`, `MediaBaseUrl`, `ServerPublicIp`, `ServerInstanceId`, `DatabaseEndpoint`, `DatabaseSecretArn`.

(PowerShell / terminal मधून: `aws cloudformation deploy --template-file deploy/aws/lokmangal-stack.yml --stack-name lokmangal --capabilities CAPABILITY_IAM --parameter-overrides VpcId=vpc-… ServerSubnetId=subnet-… "DatabaseSubnetIds=subnet-aaa,subnet-bbb" "SiteOrigins=https://www.example.com"`)

## पायरी 2 — DNS

तुमच्या डोमेनमध्ये **A record**: `api` → `ServerPublicIp` (Elastic IP). (Route 53 किंवा तुमच्या registrar मध्ये.)

## पायरी 3 — सर्व्हर तयार करा

EC2 Console → `ServerInstanceId` निवडा → **Connect → Session Manager → Connect** (browser मध्ये terminal उघडतो). मग:

```bash
sudo -i
dnf install -y git
# repository public असेल तर:
git clone https://github.com/<तुम्ही>/<repo>.git /root/lokmangal-src
# private असेल तर GitHub मध्ये फक्त-वाचनाचा (read-only) fine-grained token बनवा आणि:
#   git clone https://<user>:<token>@github.com/<तुम्ही>/<repo>.git /root/lokmangal-src

REPO_URL="<तीच repository ची लिंक>" API_DOMAIN="api.तुमचे-डोमेन.com" bash /root/lokmangal-src/deploy/ec2/bootstrap.sh
```

हे Python, nginx, certbot बसवते, `lokmangal` user आणि service बनवते, `backend/.env` तयार करते (एक नवा `SECRET_KEY` आपोआप भरून). सुरू होण्यापूर्वी `.env` भरणे बाकी आहे (पायरी 5).

## पायरी 4 — डेटाबेस

1. **Master password** घ्या (तुमच्या PC वरून, कारण server ला Secrets Manager ची परवानगी दिलेली नाही):
   `aws secretsmanager get-secret-value --secret-id <DatabaseSecretArn> --query SecretString --output text` → JSON मधला `password`. (किंवा Console → Secrets Manager → *Retrieve secret value*.)
2. सर्व्हरवर (Session Manager), website साठी **मर्यादित अधिकारांचा user** बनवा:
   ```bash
   cp /opt/lokmangal/app/deploy/aws/create-db-user.sql /tmp/ && nano /tmp/create-db-user.sql      # CHOOSE-A-LONG-RANDOM-PASSWORD बदला (तोच DB_PASSWORD)
   mysql -h <DatabaseEndpoint> -u admin -p --ssl-ca=/etc/ssl/certs/rds-global-bundle.pem < /tmp/create-db-user.sql
   shred -u /tmp/create-db-user.sql
   ```
3. **टेबल्स + सध्याचा मजकूर** (18 बातम्या, 68 साप्ताहिक अंक) एकदाच — master user ने:
   ```bash
   cd /opt/lokmangal/app/backend
   sudo -u lokmangal -H env DB_USER=admin DB_PASSWORD='<master password>' /opt/lokmangal/venv/bin/python init_db.py --seed
   ```
   > `--seed` विसरू नका: डेटाबेस रिकामा राहिला तर वेबसाईट "डेटाबेस हेच सत्य" मानते आणि जुन्या बातम्या / अंक दिसणार नाहीत.

## पायरी 5 — `backend/.env` भरा

`sudo nano /opt/lokmangal/app/backend/.env` — खालील मूल्ये बदला (बाकी bootstrap ने भरलेली तशीच):

| सेटिंग | काय भरायचे |
|---|---|
| `CORS_ORIGINS` | वेबसाईटचे पत्ते (https): `https://www.तुमचे-डोमेन.com,https://main.dXXXX.amplifyapp.com` |
| `DB_HOST` | Outputs मधील `DatabaseEndpoint` |
| `DB_USER` / `DB_PASSWORD` | `lokmangal_app` / पायरी 4.2 मध्ये ठेवलेला पासवर्ड |
| `S3_BUCKET` | `MediaBucketName` |
| `MEDIA_BASE_URL` | `MediaBaseUrl` (`https://dxxxx.cloudfront.net`) |

**प्रकाशित (production) मोडमध्ये बॅकएंड असुरक्षित सेटिंग्जसह सुरूच होत नाही** (कमकुवत `SECRET_KEY`, `CORS_ORIGINS=*`, `root` user, एन्क्रिप्ट नसलेला DB कनेक्शन …) — काय चुकले ते `manage.py check` सांगतो.

## पायरी 6 — Admin पासवर्ड, तपासणी, सुरू करा

```bash
cd /opt/lokmangal/app/backend
sudo -u lokmangal -H /opt/lokmangal/venv/bin/python manage.py set-admin-password     # किमान 10 अक्षरे; hash .env मध्ये जातो
sudo -u lokmangal -H /opt/lokmangal/venv/bin/python manage.py check                  # सगळे OK हवे: settings, MySQL, S3
sudo systemctl start lokmangal-api
curl -s http://127.0.0.1:5000/api/health                                           # {"success":true}
```
Admin चे user name डिफॉल्ट `admin` (`ADMIN_USERNAME` ने बदलता येते).

## पायरी 7 — HTTPS (Let's Encrypt)

DNS (पायरी 2) लागू झाल्यावर:

```bash
sudo certbot --nginx -d api.तुमचे-डोमेन.com --redirect -m <तुमचा-email> --agree-tos -n
curl -s https://api.तुमचे-डोमेन.com/api/health          # {"success":true}
```
नूतनीकरण (renewal) दिवसातून दोनदा आपोआप तपासले जाते (`systemctl list-timers | grep certbot`).

## पायरी 8 — वेबसाईट (Amplify)

1. AWS Console → **AWS Amplify → Create new app → GitHub** → repository व `main` branch निवडा. Amplify `amplify.yml` आपोआप वापरतो (build ला काही नाही; फक्त `env-config.js` लिहिला जातो).
2. **Environment variables** (Hosting → Environment variables):

   | Variable | मूल्य |
   |---|---|
   | `LOKMANGAL_API_BASE` | `https://api.तुमचे-डोमेन.com` |
   | `LOKMANGAL_PDF_BASE` | (ऐच्छिक) `https://dxxxx.cloudfront.net/pdf/` — सर्व जुने PDF S3 वर हलवल्यावरच; पायरी 9 पहा |

3. **Deploy**. मिळालेला पत्ता (`https://main.dXXXX.amplifyapp.com`) → बॅकएंडच्या `CORS_ORIGINS` मध्ये व CloudFormation च्या `SiteOrigins` मध्ये जोडा (stack → *Update* → त्याच template सह parameter बदला), मग `sudo systemctl restart lokmangal-api`.
4. **Rewrites and redirects** मध्ये एक नियम: Source `/admin` → Target `/admin/index.html` → Type `200 (Rewrite)`.
5. स्वतःचे डोमेन: Amplify → **Domain management → Add domain** (`www.तुमचे-डोमेन.com`).
6. `customHttp.yml` मधले security headers (HTTPS सक्ती, CSP, clickjacking संरक्षण) Amplify आपोआप लावतो.

Admin Panel: `https://www.तुमचे-डोमेन.com/admin/` → लॉगिन.

## पायरी 9 — (ऐच्छिक) जुने फोटो / PDF S3 वर

साईटच्या repository मधले 68 PDF (≈134 MB) Amplify वरूनच चालतात, काही बदलायला नको. नवे अंक Admin मधून अपलोड केले की ते आपोआप **S3 वर** जातात आणि साईटवर त्यांचा पूर्ण https पत्ता वापरला जातो.
जुने PDF ही S3 वर हलवायचे असतील (साईट हलकी राहते):

```powershell
aws s3 sync frontend/assets/pdf s3://<MediaBucketName>/pdf/ --content-type application/pdf --cache-control "public, max-age=604800"
```
मग Amplify मध्ये `LOKMANGAL_PDF_BASE=https://dxxxx.cloudfront.net/pdf/` ठेवा आणि पुन्हा deploy करा. (PDF reader ला CloudFront वरील CORS + Range आधीच CloudFormation ने लावलेले आहेत.)

## शेवटची तपासणी (checklist)

- [ ] `https://api.…/api/health` → `{"success":true}`; `http://api.…` → https ला redirect.
- [ ] वेबसाईट उघडते, बातम्या / साप्ताहिक अंक दिसतात; PDF ऑनलाईन वाचता येतो.
- [ ] `/admin/` → लॉगिन स्क्रीन; चुकीचा पासवर्ड नाकारतो; बरोबर पासवर्डने डॅशबोर्ड (19/…).
- [ ] Admin मधून एक चाचणी बातमी + फोटो अपलोड → वेबसाईटवर दिसते; फोटोचा पत्ता `https://dxxxx.cloudfront.net/images/…`.
- [ ] चाचणी PDF अंक + चाचणी व्हिडिओ अपलोड, पाहता येतो; नंतर हटवा.
- [ ] `curl -X POST https://api.…/api/articles -d '{}' -H 'Content-Type: application/json'` → `401` (लॉगिनशिवाय लिहिता येत नाही).
- [ ] RDS Console → *Automated backups* चालू (7 दिवस); S3 bucket → *Versioning* चालू.

---

## दैनंदिन कामे

| काम | कसे |
|---|---|
| वेबसाईटमध्ये बदल | `git push` → Amplify आपोआप नवा deploy करतो |
| Backend मध्ये बदल | `git push`, मग सर्व्हरवर: `sudo bash /opt/lokmangal/app/deploy/ec2/update.sh` (नवीन code, libraries, restart, तपासणी; अपयश आले तर जुनी आवृत्ती परत) |
| नवा DB column / टेबल (नवी आवृत्तीत असेल तर) | master user ने `init_db.py` (पायरी 4.3) — काहीही हटवत नाही |
| Admin पासवर्ड बदलणे | `manage.py set-admin-password` + `sudo systemctl restart lokmangal-api` (सगळे जुने logins बंद होतात) |
| Logs | `sudo journalctl -u lokmangal-api -f` · nginx: `/var/log/nginx/` |
| Backup | RDS: automatic (7 दिवस, *Restore to point in time*). S3: versioning (हटवलेली / बदललेली फाईल परत मिळते). मोठ्या बदलापूर्वी RDS *Create snapshot* |
| बंद / चालू | `sudo systemctl stop|start|restart lokmangal-api` |
| Server मध्ये शिरणे | EC2 → Connect → Session Manager (SSH नको) |

## सुरक्षा — काय आधीच केले आहे

- Admin Panel व सर्व लिहिणारे API **लॉगिनशिवाय चालत नाहीत** (signed, 12 तासांचा token; चुकीचे पासवर्ड 5 वेळा → 15 मिनिटे बंद; nginx मध्येही rate-limit).
- बातमीचा मजकूर सर्व्हरवर **स्वच्छ** केला जातो (script / event handler / `javascript:` लिंक काढल्या जातात) — वाचकांच्या ब्राउझरमध्ये दुसऱ्याचा code चालू शकत नाही. फोटो / PDF / व्हिडिओ फाईल्सचा **आशय** तपासला जातो (नाव बदललेली फाईल नाकारली).
- Database private; फक्त EC2 च्या security group ला प्रवेश; कनेक्शन TLS ने, सर्टिफिकेट + होस्टनाव तपासून; website चा MySQL user फक्त त्या एका DB चा data बदलू शकतो.
- S3 bucket private (फक्त CloudFront वाचतो); EC2 कडे access key नाहीत (IAM role); IMDSv2 सक्ती; SSH पोर्ट बंद.
- बॅकएंड असुरक्षित सेटिंग्जसह सुरू होत नाही.

## अडचणी

| लक्षण | कारण / उपाय |
|---|---|
| Admin मध्ये "बॅकएंडला पोहोचता आले नाही" | `LOKMANGAL_API_BASE` चुकीचा / Amplify ला पुन्हा deploy केले नाही; किंवा बॅकएंडच्या `CORS_ORIGINS` मध्ये साईटचा पत्ता नाही |
| ब्राउझर console मध्ये *CORS policy* त्रुटी | `CORS_ORIGINS` मध्ये `https://` सह अचूक पत्ता (शेवटी `/` नाही) → `systemctl restart lokmangal-api` |
| `502 Bad Gateway` | `sudo systemctl status lokmangal-api` / `journalctl -u lokmangal-api -n 50` |
| service सुरू होत नाही, "unsafe production settings" | `manage.py check` चालवा; दाखवलेले सेटिंग्ज `.env` मध्ये दुरुस्त करा |
| फोटो / PDF अपलोड "The file could not be saved" | `MEDIA_BASE_URL`, `S3_BUCKET` तपासा; `manage.py check` मधील *files* ओळ; EC2 चा IAM role stack मधलाच आहे का |
| मोठा व्हिडिओ अपलोड अयशस्वी | nginx `client_max_body_size 220m` आहे; `MAX_VIDEO_MB` (डिफॉल्ट 200) पेक्षा मोठा असेल तर वाढवा (दोन्ही) |
| PDF "येथे दाखवता आला नाही" | CloudFront CORS: `SiteOrigins` मध्ये साईटचा पत्ता असावा; `curl -I -H "Range: bytes=0-99" <PDF पत्ता>` → `206` |
| "Too many wrong passwords" | 15 मिनिटे थांबा (किंवा `sudo systemctl restart lokmangal-api` — मर्यादा पुसली जाते) |

खर्चाचा अंदाज (मुंबई region, कमी वापर): EC2 `t3.small` + RDS `db.t4g.micro` + 30/20 GB डिस्क हे मुख्य खर्च; S3 / CloudFront / Amplify लहान साईटसाठी थोडे. नेमका आकडा **AWS Pricing Calculator** मध्ये तपासा.
