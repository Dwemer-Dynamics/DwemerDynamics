// KAGRENAC Browse mods (custom-mods/browse.html).
// Reads the same-origin catalog that build_mod_catalog.py generates at site build time. The browser never calls the
// GitHub API, never installs or runs anything, and writes every catalog value as plain text (no innerHTML).
(function () {
    "use strict";

    var scriptUrl = document.currentScript && document.currentScript.src;
    if (!scriptUrl) return;
    var CATALOG_URL = new URL("../data/custom-mods.generated.json", scriptUrl);
    var SITE_ROOT = new URL("../", scriptUrl);
    var STALE_HOURS = 72;
    var REPOSITORY = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/;
    var TAG = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
    var ART = /^img\/custom-mods\/[a-f0-9]{16}\.(png|jpg)$/;

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();

    function start() {
        var grid = document.getElementById("mb-grid");
        var status = document.getElementById("mb-status");
        var notice = document.getElementById("mb-notice");
        var message = document.getElementById("mb-message");
        var messageTitle = document.getElementById("mb-message-title");
        var messageText = document.getElementById("mb-message-text");
        var messageAction = document.getElementById("mb-message-action");
        if (!grid || !status) return;

        var mods = [];
        var actionHandler = null;
        var stampFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

        messageAction.addEventListener("click", function () { if (actionHandler) actionHandler(); });

        // ---- Catalog loading and normalisation ----

        function str(value, max) {
            return typeof value === "string" ? value.trim().slice(0, max) : "";
        }

        function date(value) {
            if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) return null;
            var parsed = new Date(value);
            return isNaN(parsed.getTime()) ? null : parsed;
        }

        // Values are re-checked here so a damaged catalog can only drop entries, never inject links or paths.
        function prepare(raw) {
            if (!raw || typeof raw !== "object") return null;
            var match = REPOSITORY.exec(str(raw.repository, 300));
            if (!match) return null;
            var repository = match[0];
            var release = null;
            if (raw.release && typeof raw.release === "object" && TAG.test(str(raw.release.tag, 80))) {
                var tag = str(raw.release.tag, 80);
                release = { tag: tag };
            }
            var ready = raw.ready === true && release !== null;
            var gameInfo = raw.game && typeof raw.game === "object" ? raw.game : {};
            var art = raw.artwork && typeof raw.artwork === "object" ? raw.artwork : {};
            var artwork = [art.banner, art.icon].filter(function (path) {
                return typeof path === "string" && ART.test(path);
            }).map(function (path) { return new URL(path, SITE_ROOT).href; });
            var mod = {
                repository: repository,
                owner: match[1],
                repo: match[2],
                title: str(raw.title, 60) || match[2],
                credit: str(raw.credit, 90),
                summary: str(raw.summary, 1000),
                ready: ready,
                reason: str(raw.reason, 200),
                release: release,
                game: str(gameInfo.name, 200),
                artwork: Array.from(new Set(artwork))
            };
            return mod;
        }

        async function load() {
            showMessage(null);
            grid.replaceChildren();
            grid.setAttribute("aria-busy", "true");
            status.textContent = "Loading mods…";
            notice.hidden = true;
            var controller = typeof AbortController === "function" ? new AbortController() : null;
            var timeout = controller ? window.setTimeout(function () { controller.abort(); }, 15000) : null;
            try {
                var response = await fetch(CATALOG_URL, { cache: "no-cache", signal: controller ? controller.signal : undefined });
                if (!response.ok) throw new Error("HTTP " + response.status);
                var catalog = await response.json();
                if (!catalog || catalog.schema_version !== 1 || !Array.isArray(catalog.mods)) throw new Error("Unsupported catalog");
                var seen = new Set();
                mods = catalog.mods.slice(0, 200).map(prepare).filter(function (mod) {
                    if (!mod || seen.has(mod.repository.toLowerCase())) return false;
                    seen.add(mod.repository.toLowerCase());
                    return true;
                });
                describeFreshness(catalog);
                render();
            } catch (error) {
                mods = [];
                grid.removeAttribute("aria-busy");
                status.textContent = "";
                showMessage("The mod list couldn't load",
                    "Check your connection and try again, or browse mods in the launcher.",
                    "Try again", load, true);
            } finally {
                if (timeout) window.clearTimeout(timeout);
            }
        }

        function describeFreshness(catalog) {
            var generated = date(catalog.generated_at);
            var refresh = catalog.refresh && typeof catalog.refresh === "object" ? catalog.refresh : {};
            var attempted = date(refresh.attempted_at);
            var text = "";
            if (refresh.status === "failed") {
                text = (generated
                    ? "Couldn't refresh" + (attempted ? " on " + stampFormat.format(attempted) : "") +
                      ". Showing the list from " + stampFormat.format(generated) + "."
                    : "Couldn't load the list here yet.") + " Check the launcher for newer listings.";
            } else if (generated && Date.now() - generated.getTime() > STALE_HOURS * 3600 * 1000) {
                text = "Last refreshed " + stampFormat.format(generated) + ". Check the launcher for newer listings.";
            }
            if (catalog.source && catalog.source.truncated === true) {
                text = (text ? text + " " : "") + "Showing the first " + mods.length + " mods.";
            }
            notice.textContent = text;
            notice.hidden = !text;
        }

        // ---- Rendering ----

        // Every listing is shown; each card's badge and reason say whether it can be installed yet.
        function render() {
            var fragment = document.createDocumentFragment();
            mods.forEach(function (mod) { fragment.append(card(mod)); });
            grid.replaceChildren(fragment);
            grid.removeAttribute("aria-busy");
            grid.hidden = !mods.length;

            status.textContent = "";

            if (mods.length) showMessage(null);
            else showMessage("No mods are listed yet", "Published mods will appear here.");
        }

        function showMessage(title, text, action, handler, focus) {
            message.hidden = !title;
            if (!title) return;
            messageTitle.textContent = title;
            messageText.textContent = text;
            messageAction.hidden = !action;
            messageAction.textContent = action || "";
            actionHandler = handler || null;
            if (focus) messageTitle.focus();
        }

        function el(tag, className, text) {
            var node = document.createElement(tag);
            if (className) node.className = className;
            if (text !== undefined) node.textContent = text;
            return node;
        }

        function externalLink(href, label) {
            var link = el("a", "mb-button mb-primary", label);
            link.href = href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            return link;
        }

        function monogram(title) {
            var letters = title.split(/\s+/).filter(function (word) { return /^[\p{L}\p{N}]/u.test(word) && !/^(a|an|the|of)$/i.test(word); })
                .slice(0, 2).map(function (word) { return Array.from(word)[0]; }).join("");
            return (letters || Array.from(title)[0] || "?").toUpperCase();
        }

        function artwork(mod) {
            var frame = el("div", "mb-art");
            var fallback = el("div", "mb-art-fallback");
            fallback.setAttribute("aria-hidden", "true");
            fallback.append(el("span", "mb-monogram", monogram(mod.title)));
            if (mod.game) fallback.append(el("span", "mb-art-game", mod.game));
            var sources = mod.artwork.slice();
            if (!sources.length) {
                frame.classList.add("mb-art-empty");
                frame.append(fallback);
                return frame;
            }
            var backdrop = el("img", "mb-art-backdrop");
            var image = el("img", "mb-art-image");
            [backdrop, image].forEach(function (img) {
                img.alt = "";
                img.decoding = "async";
                img.loading = "lazy";
            });
            backdrop.setAttribute("aria-hidden", "true");
            // A missing banner falls back to the icon, then to the drawn placeholder.
            image.addEventListener("error", function () {
                sources.shift();
                if (sources.length) {
                    image.src = backdrop.src = sources[0];
                } else {
                    backdrop.remove();
                    image.remove();
                    frame.classList.add("mb-art-empty");
                    frame.append(fallback);
                }
            });
            image.src = backdrop.src = sources[0];
            frame.append(backdrop, image);
            return frame;
        }

        function card(mod) {
            var index = mods.indexOf(mod);
            var titleId = "mb-title-" + index;
            var li = el("li", "mb-item");
            var article = el("article", "mb-card" + (mod.ready ? "" : " mb-card-pending"));
            article.setAttribute("aria-labelledby", titleId);

            var art = artwork(mod);
            var badge = el("span", "mb-badge " + (mod.ready ? "mb-badge-ready" : "mb-badge-pending"),
                mod.ready ? "Ready to install" : "Not installable yet");
            art.append(badge);

            var body = el("div", "mb-body");
            if (mod.game) body.append(el("p", "mb-game", mod.game));
            var title = el("h2", "mb-title", mod.title);
            title.id = titleId;
            body.append(title);

            var meta = [mod.credit];
            if (mod.release) meta.push(mod.release.tag);
            body.append(el("p", "mb-meta", meta.filter(Boolean).join(" · ")));
            if (mod.summary) body.append(el("p", "mb-summary", mod.summary));
            if (!mod.ready) body.append(el("p", "mb-reason", mod.reason || "Its latest release could not be checked."));

            // The card's only action: the repository URL already validated against REPOSITORY in prepare().
            var actions = el("div", "mb-actions");
            var github = externalLink(mod.repository, "View on GitHub");
            github.setAttribute("aria-label", "View on GitHub: " + mod.title + " (opens in a new tab)");
            actions.append(github);
            body.append(actions);

            article.append(art, body);
            li.append(article);
            return li;
        }

        load();
    }
})();
