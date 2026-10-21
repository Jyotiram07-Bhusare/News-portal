"""Where uploaded pictures, weekly PDFs and videos are kept.

  STORAGE_BACKEND=local   the frontend's assets folders (assets/images, assets/pdf, assets/videos): one PC, development.
  STORAGE_BACKEND=s3      an Amazon S3 bucket; the browser reads the files through CloudFront (MEDIA_BASE_URL).

Both give the same answers to the rest of the program: put() stores a checked file and returns the address to save in the database
(local: "assets/images/x.jpg", s3: "https://<cloudfront>/images/x.jpg"), parse() says whether an address is an upload of ours,
delete() removes it, list() lists a kind.
"""
import re
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import config

# kind -> (folder name in the bucket / url, site folder, cache lifetime of the file in browsers and CloudFront)
FOLDERS = {"image": "images", "pdf": "pdf", "video": "videos"}
# Uploaded pictures and videos get a new unique name every time, so they can be cached for a year. A weekly PDF is always
# lokmangal-weekly-<no>.pdf - replacing it must show up soon, so it is cached for five minutes only.
CACHE_CONTROL = {"image": "public, max-age=31536000, immutable", "video": "public, max-age=31536000, immutable", "pdf": "public, max-age=300"}
_NAME = re.compile(r"[\w][\w.\-]*")


def valid_name(name: str) -> bool:
    return bool(name) and len(name) <= 200 and bool(_NAME.fullmatch(name)) and not name.endswith(".part")


class LocalStorage:
    name = "local"

    def _dir(self, kind: str) -> Path:
        return {"image": config.IMAGES_DIR, "pdf": config.PDF_DIR, "video": config.VIDEO_DIR}[kind]

    def put(self, kind: str, name: str, source: Path, content_type: str) -> Dict:
        folder = self._dir(kind)
        folder.mkdir(parents=True, exist_ok=True)
        target = folder / name
        part = target.with_name(name + ".part")           # a half-finished copy must never replace a good file
        try:
            shutil.copyfile(source, part)
            part.replace(target)
        finally:
            part.unlink(missing_ok=True)
            source.unlink(missing_ok=True)
        return {"url": f"assets/{FOLDERS[kind]}/{name}", "filename": name, "size": target.stat().st_size}

    def parse(self, url: str) -> Optional[Tuple[str, str]]:
        for kind, folder in FOLDERS.items():
            prefix = f"assets/{folder}/"
            if url and url.startswith(prefix):
                name = url[len(prefix):]
                return (kind, name) if valid_name(name) else None
        return None

    def delete(self, kind: str, name: str) -> bool:
        if not valid_name(name):
            return False
        folder = self._dir(kind)
        path = folder / name
        try:
            if path.is_file() and path.resolve().parent == folder.resolve():
                path.unlink()
                return True
        except OSError:                   # e.g. Windows: the file is open in a player right now - it stays, the row is gone
            pass
        return False

    def list(self, kind: str, newest_first: bool = False) -> List[Dict]:
        folder = self._dir(kind)
        if not folder.is_dir():
            return []
        names = sorted((p.name for p in folder.iterdir() if p.is_file() and not p.name.endswith(".part")), reverse=newest_first)
        return [{"filename": n, "url": f"assets/{FOLDERS[kind]}/{n}", "size": (folder / n).stat().st_size} for n in names]

    def check(self) -> str:
        return "local folders (development)"


class S3Storage:
    name = "s3"

    def __init__(self):
        import boto3                       # (only needed - and only imported - when S3 is used)
        from botocore.config import Config
        # Credentials: the EC2 instance role (nothing to configure) or AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY for a PC.
        self.client = boto3.client("s3", region_name=config.S3_REGION,
                                   config=Config(retries={"max_attempts": 4, "mode": "standard"}, signature_version="s3v4"))
        self.bucket = config.S3_BUCKET
        self.base = config.MEDIA_BASE_URL

    def _prefix(self, kind: str) -> str:
        return (config.S3_PREFIX + "/" if config.S3_PREFIX else "") + FOLDERS[kind] + "/"

    def put(self, kind: str, name: str, source: Path, content_type: str) -> Dict:
        key = self._prefix(kind) + name
        size = source.stat().st_size
        try:
            self.client.upload_file(str(source), self.bucket, key,
                                    ExtraArgs={"ContentType": content_type, "CacheControl": CACHE_CONTROL[kind]})
        finally:
            source.unlink(missing_ok=True)
        return {"url": f"{self.base}/{key}", "filename": name, "size": size}

    def parse(self, url: str) -> Optional[Tuple[str, str]]:
        if not url or not url.startswith(self.base + "/"):
            return None
        key = url[len(self.base) + 1:]
        for kind in FOLDERS:
            prefix = self._prefix(kind)
            if key.startswith(prefix):
                name = key[len(prefix):]
                return (kind, name) if valid_name(name) else None
        return None

    def delete(self, kind: str, name: str) -> bool:
        if not valid_name(name):
            return False
        from botocore.exceptions import ClientError
        key = self._prefix(kind) + name
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") in ("404", "NoSuchKey", "NotFound"):
                return False
            raise
        self.client.delete_object(Bucket=self.bucket, Key=key)
        return True

    def list(self, kind: str, newest_first: bool = False) -> List[Dict]:
        prefix = self._prefix(kind)
        rows = []
        for page in self.client.get_paginator("list_objects_v2").paginate(Bucket=self.bucket, Prefix=prefix):
            for item in page.get("Contents", []):
                name = item["Key"][len(prefix):]
                if valid_name(name):
                    rows.append({"filename": name, "url": f"{self.base}/{item['Key']}", "size": item["Size"], "_at": item["LastModified"]})
        rows.sort(key=lambda r: r["_at"], reverse=newest_first)
        for r in rows:
            del r["_at"]
        return rows

    def check(self) -> str:
        """Raises when the bucket cannot be reached with the credentials in use."""
        self.client.head_bucket(Bucket=self.bucket)
        return f"s3://{self.bucket}/{config.S3_PREFIX} via {self.base}"


_instance = None


def get():
    """The storage in use (made once)."""
    global _instance
    if _instance is None:
        _instance = S3Storage() if config.uses_s3() else LocalStorage()
    return _instance


def reset():
    """Forget the storage (tests change the settings)."""
    global _instance
    _instance = None
