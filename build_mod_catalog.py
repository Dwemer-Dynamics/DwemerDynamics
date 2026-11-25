#!/usr/bin/env python3
"""Refresh the KAGRENAC community mod catalog shown on custom-mods/browse.html.

Discovery and release checks follow the DwemerDistro launcher (CommunityModService): the same GitHub topic search,
the latest published stable release, its kagrenac-release.json descriptor and the launcher's supported install
profile. Optional icon and banner artwork is read from the release's pinned commit and mirrored into img/custom-mods/
so the page never calls GitHub from the browser. Nothing is installed or executed. Standard library only.

    python build_mod_catalog.py              refresh; on any upstream failure leave the committed snapshot untouched
    python build_mod_catalog.py --fallback   refresh; on failure keep the last good mods and record the failed attempt

GITHUB_TOKEN, when set, is sent only to api.github.com to raise the rate limit. It is never written or printed.
"""

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
import unicodedata
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parent
CATALOG = ROOT / "data" / "custom-mods.generated.json"
ART_DIR = ROOT / "img" / "custom-mods"
ART_PREFIX = "img/custom-mods/"

QUERY = "topic:kagrenac-mod archived:false fork:true"
SEARCH_LIMIT = 100
METADATA_LIMIT = 4 * 1024 * 1024
ART_LIMIT = 4 * 1024 * 1024
PACKAGE_LIMIT = 512 * 1024 * 1024
MAX_ART_SIDE = 4096
TIMEOUT = 20
ALLOWED_HOSTS = {"api.github.com", "github.com", "raw.githubusercontent.com",
                 "release-assets.githubusercontent.com", "objects.githubusercontent.com"}

REPOSITORY = re.compile(r"^https://github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+?)(?:\.git)?/?$")
OWNER = re.compile(r"^[A-Za-z0-9_.-]{1,100}$")
TAG = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$")
MOD_ID = re.compile(r"^[a-z][a-z0-9-]{1,30}[a-z0-9]$")
COMMIT = re.compile(r"^[a-f0-9]{40}$")
SHA256 = re.compile(r"^[a-f0-9]{64}$")
PATH_PART = re.compile(r"^[A-Za-z0-9_][A-Za-z0-9._-]*$")
DEVICE = re.compile(r"^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$", re.IGNORECASE)
ART_FILE = re.compile(r"^[a-f0-9]{16}\.(png|jpg)$")
ART_PATH = re.compile(r"^img/custom-mods/[a-f0-9]{16}\.(png|jpg)$")
TIMESTAMP = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")


class Unavailable(Exception):
    """GitHub could not answer; the refresh stops so the last good snapshot is kept."""


class Rejected(Exception):
    """The repository's release cannot be installed by the launcher; its message is shown to players."""


class NoRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


OPENER = urllib.request.build_opener(NoRedirects)


def fetch(url, limit):
    """GET with every hop on an allowed HTTPS GitHub host, a size bound and no token beyond api.github.com."""
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    for _ in range(6):
        parts = urlsplit(url)
        if parts.scheme != "https" or parts.port is not None or parts.username or parts.password \
                or parts.hostname not in ALLOWED_HOSTS:
            raise Rejected("Release files must come from GitHub.")
        headers = {"User-Agent": "DwemerDynamics-ModCatalog/1.0"}
        if parts.hostname == "api.github.com":
            headers["Accept"] = "application/vnd.github+json"
            headers["X-GitHub-Api-Version"] = "2022-11-28"
            if token:
                headers["Authorization"] = "Bearer " + token
        try:
            with OPENER.open(urllib.request.Request(url, headers=headers), timeout=TIMEOUT) as response:
                length = response.headers.get("Content-Length")
                if length and length.isdigit() and int(length) > limit:
                    raise Rejected("A release file is larger than expected.")
                data = response.read(limit + 1)
                if len(data) > limit:
                    raise Rejected("A release file is larger than expected.")
                return data
        except urllib.error.HTTPError as error:
            if 300 <= error.code < 400 and error.headers.get("Location"):
                url = urljoin(url, error.headers["Location"])
                continue
            if error.code == 404:
                raise FileNotFoundError(url) from None
            raise Unavailable("GitHub returned HTTP {}".format(error.code)) from None
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            raise Unavailable("GitHub could not be reached ({})".format(type(error).__name__)) from None
    raise Unavailable("Too many GitHub redirects")


def parse_json(data):
    def constant(name):
        raise ValueError("Unsupported JSON constant " + name)
    try:
        return json.loads(data.decode("utf-8"), parse_constant=constant)
    except (UnicodeDecodeError, ValueError, RecursionError):
        raise Rejected("Release descriptor is not valid JSON.") from None


def text(obj, key):
    """Like the launcher: a missing value is empty and a non-string value is invalid."""
    if not isinstance(obj, dict):
        raise Rejected("Unsupported release format or identity.")
    value = obj.get(key)
    if value is None:
        return ""
    if not isinstance(value, str):
        raise Rejected("Unsupported release format or identity.")
    return value


def obj(value):
    if not isinstance(value, dict):
        raise Rejected("Unsupported release format or identity.")
    return value


def integer(value):
    if isinstance(value, bool) or not isinstance(value, int):
        raise Rejected("Unsupported release format or identity.")
    return value


def display(value, maximum):
    """Plain display text: no control, format, surrogate or line/paragraph separator characters; empty when unsafe."""
    if not isinstance(value, str):
        return ""
    if any(unicodedata.category(ch) in ("Cc", "Cf", "Cs", "Zl", "Zp") for ch in value):
        return ""
    trimmed = value.strip()
    return "" if len(trimmed) > maximum else trimmed


def relative(value):
    if not isinstance(value, str) or not 0 < len(value) <= 200 or "\\" in value or any(
            not PATH_PART.match(part) or part.endswith(".") or DEVICE.match(part.split(".")[0])
            for part in value.split("/")):
        raise Rejected("Package paths must stay inside their component folder.")
    return value


def repository_key(url):
    match = REPOSITORY.match(url or "")
    if not match:
        raise Rejected("Not a public GitHub repository URL.")
    return match.group(1) + "/" + match.group(2)


def package_files(package):
    files = package.get("files")
    if not isinstance(files, list) or not 0 < len(files) <= 20000:
        raise Rejected("Invalid package file count.")
    seen, total = {}, 0
    for item in files:
        item = obj(item)
        path = relative(text(item, "path"))
        size = integer(item.get("size"))
        if size < 0 or not SHA256.match(text(item, "sha256")) or path.lower() in seen:
            raise Rejected("Invalid or duplicate package file receipt.")
        seen[path.lower()] = path
        total += size
    if total > PACKAGE_LIMIT or any("/".join(key.split("/")[:i]) in seen
                                    for key in seen for i in range(1, key.count("/") + 1)):
        raise Rejected("Package is too large or has file/directory collisions.")
    return seen


def check_descriptor(doc, key, tag, assets):
    """The launcher's ParseRelease rules, plus both packages being published on the release."""
    doc = obj(doc)
    manifest = obj(doc.get("manifest"))
    if doc.get("schema_version") != 1 or manifest.get("schema_version") != 2 \
            or isinstance(doc.get("schema_version"), bool) or isinstance(manifest.get("schema_version"), bool):
        raise Rejected("Unsupported release format or identity.")
    mod_id, commit, version = text(manifest, "id"), text(doc, "commit"), text(doc, "version")
    if not MOD_ID.match(mod_id) or "--" in mod_id or not COMMIT.match(commit) or not TAG.match(version):
        raise Rejected("Unsupported release format or identity.")
    if repository_key(text(doc, "repository")).lower() != key.lower() or version != tag:
        raise Rejected("Release identity differs from the repository.")
    game = obj(manifest.get("game"))
    relative(text(game, "executable"))
    install = obj(obj(obj(manifest.get("distribution")).get("client")).get("install"))
    if text(install, "profile") != "game-directory":
        raise Rejected("Needs a newer launcher for its install profile.")
    relative(text(install, "path"))
    private = relative(text(install, "config_path")).lower()
    packages = obj(doc.get("packages"))
    for kind in ("server", "client"):
        package = obj(packages.get(kind))
        asset = relative(text(package, "asset"))
        size = integer(package.get("size"))
        if "/" in asset or not asset.endswith(".zip") or not SHA256.match(text(package, "sha256")) \
                or not 0 < size <= PACKAGE_LIMIT:
            raise Rejected("Invalid release asset.")
        files = package_files(package)
        published = assets.get(asset)
        if not published or published.get("size") != size or published.get("state", "uploaded") != "uploaded":
            raise Rejected("The release is missing its {} package.".format(kind))
        if kind == "client" and any(p == private or p.startswith(private + "/") or private.startswith(p + "/")
                                    for p in files):
            raise Rejected("Client package includes its private pairing configuration.")
    return manifest, commit


def image_size(data):
    """Return (extension, width, height) for a PNG or baseline/progressive JPEG, else None."""
    if data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR" and len(data) >= 24:
        return "png", int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")
    if data[:3] == b"\xff\xd8\xff":
        i = 2
        while i + 9 < len(data):
            if data[i] != 0xFF:
                return None
            marker = data[i + 1]
            if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
                i += 2
                continue
            length = int.from_bytes(data[i + 2:i + 4], "big")
            if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                return "jpg", int.from_bytes(data[i + 7:i + 9], "big"), int.from_bytes(data[i + 5:i + 7], "big")
            if length < 2:
                return None
            i += 2 + length
    return None


def artwork(manifest, key, commit, kind, mirrored):
    """Optional artwork from the pinned commit; any problem keeps the page's placeholder."""
    assets = manifest.get("assets")
    path = assets.get(kind) if isinstance(assets, dict) else None
    if not isinstance(path, str):
        return ""
    try:
        relative(path)
        if not path.lower().endswith((".png", ".jpg", ".jpeg")):
            return ""
        server = manifest.get("distribution", {}).get("server", {})
        root = text(server, "root").rstrip("/") if isinstance(server, dict) else ""
        if root not in ("", "."):
            path = relative(root) + "/" + path
        data = fetch("https://raw.githubusercontent.com/{}/{}/{}".format(key, commit, quote(path)), ART_LIMIT)
    except (Rejected, FileNotFoundError):
        return ""
    info = image_size(data)
    if not info or not 0 < info[1] <= MAX_ART_SIDE or not 0 < info[2] <= MAX_ART_SIDE:
        return ""
    name = hashlib.sha256(data).hexdigest()[:16] + "." + info[0]
    mirrored[name] = data
    return ART_PREFIX + name


def check_repository(item, mirrored):
    full_name, url = item.get("full_name"), item.get("html_url")
    key = repository_key(url if isinstance(url, str) else "")
    if not isinstance(full_name, str) or full_name.lower() != key.lower() or item.get("private"):
        raise Rejected("Not a public GitHub repository URL.")
    owner, name = key.split("/")
    entry = {
        "repository": "https://github.com/" + key,
        "name": key,
        "title": name,
        "credit": "By " + owner if OWNER.match(owner) else "",
        "summary": display(item.get("description"), 400),
        "ready": False,
        "reason": "",
        "release": None,
        "game": {},
        "features": [],
        "artwork": {},
    }
    try:
        try:
            release = obj(parse_json(fetch("https://api.github.com/repos/{}/releases/latest".format(key),
                                           METADATA_LIMIT)))
        except FileNotFoundError:
            raise Rejected("No published stable release yet.") from None
        if release.get("draft") is not False or release.get("prerelease") is not False:
            raise Rejected("No published stable release yet.")
        tag = text(release, "tag_name")
        if not TAG.match(tag):
            raise Rejected("Unsupported release tag.")
        assets = {}
        for asset in release.get("assets") if isinstance(release.get("assets"), list) else []:
            if isinstance(asset, dict) and isinstance(asset.get("name"), str):
                assets.setdefault(asset["name"], asset)
        descriptor_url = "https://github.com/{}/releases/download/{}/kagrenac-release.json".format(key, tag)
        if "kagrenac-release.json" not in assets:
            raise Rejected("No installable KAGRENAC release yet.")
        if assets["kagrenac-release.json"].get("browser_download_url") != descriptor_url:
            raise Rejected("Unexpected release descriptor URL.")
        try:
            descriptor = parse_json(fetch(descriptor_url, METADATA_LIMIT))
        except FileNotFoundError:
            raise Rejected("No installable KAGRENAC release yet.") from None
        manifest, commit = check_descriptor(descriptor, key, tag, assets)
        published = text(release, "published_at")
        entry["release"] = {
            "tag": tag,
            "commit": commit,
            "published_at": published if TIMESTAMP.match(published) else "",
            "url": "https://github.com/{}/releases/tag/{}".format(key, quote(tag)),
        }
    except Rejected as problem:
        entry["reason"] = str(problem)
        return entry

    title = display(manifest.get("name"), 60)
    author = display(manifest.get("author"), 80)
    game = manifest["game"]
    features = manifest.get("features") if isinstance(manifest.get("features"), list) else []
    entry.update({
        "ready": True,
        "id": manifest["id"],
        "title": title or entry["title"],
        "credit": "By " + author if author else entry["credit"],
        "summary": display(manifest.get("description"), 1000) or entry["summary"],
        "game": {field: value for field, value in (
            ("name", display(game.get("name"), 200)),
            ("version", display(game.get("version"), 300)),
            ("loader", display(game.get("loader"), 600)),
            ("enable_in_game", display(game.get("enable_in_game"), 600)),
        ) if value},
        "features": [value for value in (display(f, 200) for f in features[:12]) if value][:8],
    })
    for kind in ("banner", "icon"):
        path = artwork(manifest, key, commit, kind, mirrored)
        if path:
            entry["artwork"][kind] = path
    return entry


def now():
    return datetime.now(timezone.utc).replace(microsecond=0).strftime("%Y-%m-%dT%H:%M:%SZ")


def refresh():
    search = obj(parse_json(fetch("https://api.github.com/search/repositories?per_page={}&q={}".format(
        SEARCH_LIMIT, quote(QUERY)), METADATA_LIMIT)))
    items = search.get("items")
    total = search.get("total_count")
    if not isinstance(items, list) or isinstance(total, bool) or not isinstance(total, int):
        raise Unavailable("GitHub search returned an unexpected response")
    mirrored, mods, seen = {}, [], set()
    for item in items[:SEARCH_LIMIT]:
        if not isinstance(item, dict):
            continue
        try:
            entry = check_repository(item, mirrored)
        except Rejected:
            continue  # Not a well-formed public repository; the launcher would refuse it too.
        if entry["name"].lower() in seen:
            continue
        seen.add(entry["name"].lower())
        mods.append(entry)
    mods.sort(key=lambda m: m["title"].lower())
    mods.sort(key=lambda m: (m["release"] or {}).get("published_at", ""), reverse=True)
    mods.sort(key=lambda m: not m["ready"])
    stamp = now()
    catalog = {
        "schema_version": 1,
        "generated_at": stamp,
        "refresh": {"status": "ok", "attempted_at": stamp},
        "source": {"query": QUERY, "total_count": total,
                   "truncated": bool(search.get("incomplete_results")) or total > len(items[:SEARCH_LIMIT])},
        "mods": mods,
    }
    validate_catalog(catalog, art_root=None, mirrored=mirrored)
    return catalog, mirrored


def validate_catalog(catalog, art_root=ROOT, mirrored=None):
    """Shape and safety checks shared with build_site.py; raises ValueError."""
    if not isinstance(catalog, dict) or catalog.get("schema_version") != 1 or not isinstance(catalog.get("mods"), list):
        raise ValueError("custom mod catalog: unsupported format")
    for field in ("generated_at",):
        if catalog.get(field) and not TIMESTAMP.match(catalog[field]):
            raise ValueError("custom mod catalog: invalid " + field)
    for mod in catalog["mods"]:
        if not isinstance(mod, dict) or not REPOSITORY.match(mod.get("repository", "")) \
                or not isinstance(mod.get("title"), str) or not isinstance(mod.get("ready"), bool):
            raise ValueError("custom mod catalog: invalid entry")
        release = mod.get("release")
        if mod["ready"] and (not isinstance(release, dict) or not TAG.match(release.get("tag", ""))):
            raise ValueError("custom mod catalog: ready entry without a release: " + mod["repository"])
        for path in (mod.get("artwork") or {}).values():
            if not isinstance(path, str) or not ART_PATH.match(path):
                raise ValueError("custom mod catalog: unsafe artwork path {!r}".format(path))
            name = path[len(ART_PREFIX):]
            if mirrored is not None and name in mirrored:
                continue
            if art_root is None or not (art_root / path).is_file():
                raise ValueError("custom mod catalog: missing artwork " + path)


def write_atomic(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    handle, temp = tempfile.mkstemp(dir=path.parent, prefix="." + path.name + ".")
    try:
        with os.fdopen(handle, "wb") as stream:
            stream.write(data)
        os.replace(temp, path)
    except BaseException:
        if os.path.exists(temp):
            os.unlink(temp)
        raise


def save(catalog, mirrored):
    for name, data in mirrored.items():
        target = ART_DIR / name
        if not target.is_file() or target.read_bytes() != data:
            write_atomic(target, data)
    write_atomic(CATALOG, (json.dumps(catalog, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    # Only this generator's content-addressed files are removed, and only once the new catalog no longer uses them.
    used = {path[len(ART_PREFIX):] for mod in catalog["mods"] for path in mod["artwork"].values()}
    if ART_DIR.is_dir() and not ART_DIR.is_symlink():
        for stale in ART_DIR.iterdir():
            if stale.is_file() and not stale.is_symlink() and ART_FILE.match(stale.name) and stale.name not in used:
                stale.unlink()


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--fallback", action="store_true",
                        help="on failure keep the last good mods and record the failed refresh (for site builds)")
    args = parser.parse_args()
    try:
        catalog, mirrored = refresh()
    except (Unavailable, Rejected, ValueError) as error:
        print("warning: custom mod catalog not refreshed: {}".format(error), file=sys.stderr)
        if not args.fallback:
            return 1
        try:
            previous = json.loads(CATALOG.read_text(encoding="utf-8"))
            validate_catalog(previous)
        except (OSError, ValueError) as problem:
            print("warning: no usable catalog snapshot ({})".format(type(problem).__name__), file=sys.stderr)
            previous = {"schema_version": 1, "generated_at": "", "source": {"query": QUERY}, "mods": []}
        previous["refresh"] = {"status": "failed", "attempted_at": now()}
        write_atomic(CATALOG, (json.dumps(previous, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
        return 0
    save(catalog, mirrored)
    ready = sum(1 for mod in catalog["mods"] if mod["ready"])
    print("Custom mod catalog: {} listed, {} ready to install".format(len(catalog["mods"]), ready))
    return 0


if __name__ == "__main__":
    sys.exit(main())
