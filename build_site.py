#!/usr/bin/env python3
"""Build the deployable site into _site with clean directory URLs.

Authored pages stay where they are (chim/installation.html). The build writes each one to a clean
directory index (_site/chim/installation/index.html), rewrites internal href/src values to
root-relative clean paths, adds a canonical link and leaves a small page at the old .html path that
forwards to the clean URL with its query and hash. Standard library only.

    python build_site.py               build into ./_site
    python build_site.py --out DIR     build somewhere else (DIR must be empty or a previous build)
"""

import argparse
import html
import hashlib
import os
import posixpath
import re
import shutil
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qsl, unquote, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parent
ENTRIES = [
    "chim", "css", "custom-mods", "data", "dialectic", "dwemerdistro", "font", "img", "js",
    "lorkhan", "other-projects", "stobe",
    "index.html", "styles.css", "CNAME", ".nojekyll", "THIRD_PARTY_NOTICES.md",
]
MARKER = ".dwemer-site-build"
ORIGIN = "https://" + (ROOT / "CNAME").read_text(encoding="utf-8").strip()

URL_ATTR = re.compile(r'(\s(?:href|src)\s*=\s*)"([^"]*)"', re.IGNORECASE)
SCHEME = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")

# Explicit index.html visits share the clean directory's file; tidy the address bar in place (no reload, so no loop).
NORMALIZE_SCRIPT = (
    '<script>(function(l){var p=l.pathname.replace(/\\/index\\.html$/,"/");'
    'if(p!==l.pathname&&history.replaceState){history.replaceState(null,"",p+l.search+l.hash);}})(location);</script>'
)

LEGACY_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex">
    <title>{title}</title>
    <link rel="canonical" href="{canonical}">
    <script>location.replace({target_js} + location.search + location.hash);</script>
    <noscript><meta http-equiv="refresh" content="0; url={target}"></noscript>
</head>
<body>
    <p>This page has moved to <a href="{target}">{canonical}</a>.</p>
</body>
</html>
"""


def clean_path(page):
    """'index.html' -> '/', 'chim/index.html' -> '/chim/', 'chim/faq.html' -> '/chim/faq/'."""
    if page == "index.html":
        return "/"
    if page.endswith("/index.html"):
        return "/" + page[: -len("index.html")]
    return "/" + page[: -len(".html")] + "/"


def output_file(page):
    return clean_path(page).lstrip("/") + "index.html"


def is_internal(url):
    return bool(url) and not url.startswith("#") and not url.startswith("//") and not SCHEME.match(url)


class TagScanner(HTMLParser):
    """Collects raw start tags with their positions; script and style bodies are skipped by the parser."""

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.tags = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        self.tags.append((self.getpos(), self.get_starttag_text(), attrs))
        for name, value in attrs:
            if name in ("id", "name") and value:
                self.ids.add(value)

    handle_startendtag = handle_starttag


def scan(text):
    scanner = TagScanner()
    scanner.feed(text)
    scanner.close()
    return scanner


def rewrite_url(url, page, pages):
    parts = urlsplit(url)
    if not parts.path:
        target = page
    else:
        target = posixpath.normpath(parts.path.lstrip("/") if parts.path.startswith("/")
                                    else posixpath.join(posixpath.dirname(page), parts.path))
    if target == ".." or target.startswith("../"):
        raise ValueError("{}: {!r} points outside the site".format(page, url))
    if target in ("", "."):
        target = "index.html"
    # Accept authored .html links and already-clean links without adding another index.html.
    clean_pages = {clean_path(p): p for p in pages}
    target = clean_pages.get("/" + target.rstrip("/") + "/", target)
    path = clean_path(target) if target in pages else "/" + target
    query = parts.query
    if target in ("js/guide-outline.js", "js/javascript.js"):
        version = hashlib.sha256((ROOT / target).read_bytes()).hexdigest()[:12]
        query = urlencode([(k, v) for k, v in parse_qsl(query, keep_blank_values=True) if k != "v"]
                          + [("v", version)])
    return urlunsplit(("", "", path, query, parts.fragment))


def rewrite_page(text, page, pages):
    lines = text.splitlines(keepends=True)
    offsets = [0]
    for line in lines:
        offsets.append(offsets[-1] + len(line))

    def fix_attr(match):
        url = html.unescape(match.group(2))
        if not is_internal(url):
            return match.group(0)
        return match.group(1) + '"' + html.escape(rewrite_url(url, page, pages), quote=True) + '"'

    pieces, last = [], 0
    for (line, col), raw, _ in scan(text).tags:
        start = offsets[line - 1] + col
        pieces.append(text[last:start])
        pieces.append(URL_ATTR.sub(fix_attr, raw))
        last = start + len(raw)
    pieces.append(text[last:])
    text = "".join(pieces)

    head = '    <link rel="canonical" href="{}">\n    {}\n</head>'.format(ORIGIN + clean_path(page), NORMALIZE_SCRIPT)
    if text.count("</head>") != 1:
        raise ValueError("{}: expected one </head>".format(page))
    return text.replace("</head>", head, 1)


def legacy_page(page, title):
    target = clean_path(page)
    return LEGACY_PAGE.format(
        title=title,
        canonical=html.escape(ORIGIN + target),
        target=html.escape(target),
        target_js='"' + target + '"',
    )


def check_output(out):
    if out.is_symlink():
        sys.exit("Refusing to build into a symlink: {}".format(out))
    resolved = out.resolve()
    if resolved == Path(resolved.anchor) or resolved == Path.home().resolve():
        sys.exit("Refusing to build into {}".format(resolved))
    if resolved == ROOT or resolved in ROOT.parents:
        sys.exit("Refusing to build into the repository or one of its parents: {}".format(resolved))
    for entry in ENTRIES:
        source = ROOT / entry
        if resolved == source or source in resolved.parents:
            sys.exit("Refusing to build inside source path {}".format(source))
    if resolved.exists():
        if not resolved.is_dir():
            sys.exit("Output exists and is not a directory: {}".format(resolved))
        if any(resolved.iterdir()) and not (resolved / MARKER).is_file():
            sys.exit("Output {} is not empty and has no {} marker; refusing to delete it".format(resolved, MARKER))
    return resolved


def collect_files():
    files = []
    for entry in ENTRIES:
        path = ROOT / entry
        if path.is_file():
            files.append(entry)
        elif path.is_dir():
            for dirpath, dirnames, filenames in os.walk(path):
                dirnames[:] = sorted(d for d in dirnames if d != "__pycache__")
                rel_dir = Path(dirpath).relative_to(ROOT).as_posix()
                files.extend(rel_dir + "/" + name for name in sorted(filenames))
        else:
            sys.exit("Missing site entry: {}".format(entry))
    return files


def validate(out):
    """Every internal href/src in the built pages must be a clean root-relative path to a built file."""
    ids, links = {}, []
    for built in sorted(out.rglob("*.html")):
        rel = built.relative_to(out).as_posix()
        scanner = scan(built.read_text(encoding="utf-8"))
        ids[rel] = scanner.ids
        for _, _, attrs in scanner.tags:
            for name, value in attrs:
                if name in ("href", "src") and value:
                    links.append((rel, value))

    errors, missing_anchors = [], []
    for rel, value in links:
        if not is_internal(value):
            if value.startswith("#") and len(value) > 1 and unquote(value[1:]) not in ids[rel]:
                missing_anchors.append("{} -> {}".format(rel, value))
            continue
        parts = urlsplit(value)
        if not parts.path.startswith("/") or parts.path.endswith(".html"):
            errors.append("{}: link not rewritten: {}".format(rel, value))
            continue
        target = unquote(parts.path).lstrip("/")
        if target == "" or target.endswith("/"):
            target += "index.html"
        if not (out / target).is_file():
            errors.append("{}: missing target {}".format(rel, value))
        elif parts.fragment and target in ids and unquote(parts.fragment) not in ids[target]:
            missing_anchors.append("{} -> {}".format(rel, value))
    return errors, missing_anchors


def build(out):
    files = collect_files()
    pages = {f for f in files if f.endswith(".html")}
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    (out / MARKER).write_text("Generated by build_site.py; safe to delete.\n", encoding="utf-8")

    for rel in files:
        source = ROOT / rel
        if rel not in pages:
            dest = out / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, dest)
            continue
        text = source.read_text(encoding="utf-8")
        dest = out / output_file(rel)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(rewrite_page(text, rel, pages), encoding="utf-8", newline="")
        if output_file(rel) != rel:
            title = re.search(r"<title>(.*?)</title>", text, re.S)
            legacy = out / rel
            legacy.write_text(legacy_page(rel, title.group(1).strip() if title else "Dwemer Dynamics"),
                              encoding="utf-8", newline="")
    return pages


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", default=str(ROOT / "_site"), help="output directory (default: ./_site)")
    args = parser.parse_args()

    out = check_output(Path(args.out))
    pages = build(out)
    errors, missing_anchors = validate(out)
    for anchor in missing_anchors:
        print("warning: missing anchor " + anchor)
    for error in errors:
        print("error: " + error)
    print("Built {} pages into {}".format(len(pages), out))
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
