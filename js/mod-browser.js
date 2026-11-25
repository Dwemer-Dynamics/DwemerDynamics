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
    // Stricter GitHub name rules for the launcher link only; anything else simply gets no Open button.
    var OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
    var REPO_NAME = /^(?!\.\.?$)[A-Za-z0-9_.-]{1,100}$/;
    var OPEN_SCHEME = "dwemerdistro-mod:open?repo=";
    var IS_WINDOWS = (function () {
        var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
        return /^win/i.test(platform) || /Windows NT/.test(navigator.userAgent || "");
    })();

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();

    function start() {
        var form = document.getElementById("mb-filters");
        var search = document.getElementById("mb-search");
        var game = document.getElementById("mb-game");
        var grid = document.getElementById("mb-grid");
        var status = document.getElementById("mb-status");
        var notice = document.getElementById("mb-notice");
        var message = document.getElementById("mb-message");
        var messageTitle = document.getElementById("mb-message-title");
        var messageText = document.getElementById("mb-message-text");
        var messageAction = document.getElementById("mb-message-action");
        var countReady = document.getElementById("mb-count-ready");
        var countAll = document.getElementById("mb-count-all");
        if (!form || !grid || !status) return;

        var mods = [];
        var expanded = new Set();
        var actionHandler = null;
        var timer = null;
        var dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
        var stampFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

        form.hidden = false;
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

        function normalize(value) {
            return String(value).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
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
                release = {
                    tag: tag,
                    published: date(raw.release.published_at),
                    url: repository + "/releases/tag/" + encodeURIComponent(tag)
                };
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
                version: str(gameInfo.version, 300),
                loader: str(gameInfo.loader, 600),
                enable: str(gameInfo.enable_in_game, 600),
                features: Array.isArray(raw.features) ? raw.features.map(function (f) { return str(f, 200); })
                    .filter(Boolean).slice(0, 8) : [],
                artwork: Array.from(new Set(artwork))
            };
            mod.haystack = normalize([mod.title, mod.game, mod.credit, mod.owner, mod.repo, mod.summary].join(" "));
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
                fillGames();
                describeFreshness(catalog);
                restore();
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

        function fillGames() {
            var names = Array.from(new Set(mods.map(function (mod) { return mod.game; }).filter(Boolean)))
                .sort(function (a, b) { return a.localeCompare(b); });
            game.replaceChildren(new Option("All games", ""));
            names.forEach(function (name) { game.append(new Option(name, name)); });
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
            status.dataset.updated = generated && !text ? "Updated " + dateFormat.format(generated) + "." : "";
        }

        // ---- Filtering and URL state ----

        function filters() {
            var words = normalize(search.value.trim().slice(0, 80)).split(/\s+/).filter(Boolean);
            var chosen = form.elements.show.value === "all" ? "all" : "ready";
            return { words: words, game: game.value, show: chosen };
        }

        function matches(mod, f) {
            return (!f.game || mod.game === f.game) && f.words.every(function (word) { return mod.haystack.indexOf(word) !== -1; });
        }

        function restore() {
            var params = new URL(location.href).searchParams;
            search.value = (params.get("q") || "").slice(0, 80);
            var wanted = params.get("game") || "";
            game.value = Array.prototype.some.call(game.options, function (o) { return o.value === wanted; }) ? wanted : "";
            (params.get("show") === "all" ? document.getElementById("mb-show-all") : document.getElementById("mb-show-ready")).checked = true;
            render();
        }

        function remember() {
            var f = filters();
            var url = new URL(location.href);
            [["q", search.value.trim().slice(0, 80)], ["game", f.game], ["show", f.show === "all" ? "all" : ""]].forEach(function (pair) {
                if (pair[1]) url.searchParams.set(pair[0], pair[1]);
                else url.searchParams.delete(pair[0]);
            });
            history.replaceState(null, "", url);
        }

        function update() {
            window.clearTimeout(timer);
            remember();
            render();
        }

        function clearFilters(focus) {
            search.value = "";
            game.value = "";
            document.getElementById("mb-show-ready").checked = true;
            update();
            if (focus) search.focus();
        }

        form.addEventListener("submit", function (event) { event.preventDefault(); update(); });
        form.addEventListener("reset", function (event) { event.preventDefault(); clearFilters(true); });
        search.addEventListener("input", function () { window.clearTimeout(timer); timer = window.setTimeout(update, 150); });
        search.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && search.value) { event.preventDefault(); search.value = ""; update(); }
        });
        game.addEventListener("change", update);
        form.addEventListener("change", function (event) { if (event.target.name === "show") update(); });
        window.addEventListener("popstate", function () { if (mods.length) restore(); });

        // ---- Rendering ----

        function render() {
            var f = filters();
            var base = mods.filter(function (mod) { return matches(mod, f); });
            var ready = base.filter(function (mod) { return mod.ready; });
            var shown = f.show === "all" ? base : ready;
            countReady.textContent = "(" + ready.length + ")";
            countAll.textContent = "(" + base.length + ")";

            var fragment = document.createDocumentFragment();
            shown.forEach(function (mod) { fragment.append(card(mod)); });
            grid.replaceChildren(fragment);
            grid.removeAttribute("aria-busy");
            grid.hidden = !shown.length;

            var filtered = f.words.length || f.game;
            var noun = f.show === "all" ? " listed" : " ready to install";
            status.textContent = shown.length
                ? shown.length + (shown.length === 1 ? " mod" : " mods") + noun + (filtered ? " matching your filters" : "") + "." +
                  (status.dataset.updated ? " " + status.dataset.updated : "")
                : "";

            if (shown.length) {
                showMessage(null);
            } else if (!mods.length) {
                showMessage("No mods are listed yet",
                    "Published mods will appear here.");
            } else if (base.length && f.show === "ready") {
                showMessage(base.length === 1 ? "This mod isn't ready to install yet" : "None of these mods are ready to install yet",
                    "Show all listed mods to see what each one still needs.",
                    "Show all listed", function () {
                        document.getElementById("mb-show-all").checked = true;
                        update();
                        document.getElementById("mb-show-all").focus();
                    });
            } else {
                showMessage("No mods match your filters", "Try another name or game.", "Clear filters", function () { clearFilters(true); });
            }
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
            var link = el("a", "mb-link", label);
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

        function launcherSearch(mod) {
            return mod.repo.replace(/[^A-Za-z0-9 _-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || mod.title;
        }

        // Plain link the user must click; the page never navigates to it on its own or checks whether it worked.
        function launcherLink(mod) {
            if (!IS_WINDOWS || !OWNER.test(mod.owner) || !REPO_NAME.test(mod.repo) || /\.git$/i.test(mod.repo)) return null;
            var wrap = el("div", "mb-open");
            var link = el("a", "mb-button mb-primary", "Open in DwemerDistro");
            link.href = OPEN_SCHEME + mod.owner + "/" + mod.repo;
            link.setAttribute("aria-label", "Open in DwemerDistro: " + mod.title);
            var hint = el("p", "mb-open-hint", "Needs a current DwemerDistro launcher. If nothing opens, use the steps below.");
            hint.id = "mb-open-hint-" + mods.indexOf(mod);
            link.setAttribute("aria-describedby", hint.id);
            wrap.append(link, hint);
            return wrap;
        }

        function step(parts) {
            var li = el("li");
            parts.forEach(function (part) {
                li.append(typeof part === "string" ? document.createTextNode(part) : part);
            });
            return li;
        }

        function details(mod, id) {
            var panel = el("div", "mb-details");
            panel.id = id;
            panel.hidden = !expanded.has(mod.repository);

            if (mod.ready) {
                var needs = [["Game", mod.game], ["Tested with", mod.version], ["You need", mod.loader]].filter(function (row) { return row[1]; });
                panel.append(el("h3", "mb-subhead", "Requirements"));
                var list = el("dl", "mb-reqs");
                [["Launcher", "DwemerDistro"]].concat(needs).forEach(function (row) {
                    var item = el("div");
                    item.append(el("dt", "", row[0]), el("dd", "", row[1]));
                    list.append(item);
                });
                panel.append(list);

                panel.append(el("h3", "mb-subhead", "Install"));
                var open = launcherLink(mod);
                if (open) panel.append(open);
                var steps = el("ol", "mb-steps");
                steps.append(
                    step(["In DwemerDistro, run ", el("b", "", "Update Distro"), "."]),
                    step(["Open ", el("b", "", "Mods > Custom mods > Browse mods"), " and search for ", el("code", "", launcherSearch(mod)), "."]),
                    step(["Press ", el("b", "", "Install server"), "."]),
                    step(["Press ", el("b", "", "Download mod release"), " and add it to your game as the author describes."])
                );
                panel.append(steps);
                if (mod.enable) {
                    var note = el("div", "mb-note");
                    note.append(el("p", "mb-note-label", "Author's setup note"), el("p", "", mod.enable));
                    panel.append(note);
                }
                if (mod.features.length) {
                    panel.append(el("h3", "mb-subhead", "Features"));
                    var features = el("ul", "mb-features");
                    mod.features.forEach(function (feature) { features.append(el("li", "", feature)); });
                    panel.append(features);
                }
            } else {
                if (!mod.reason) panel.append(el("p", "", "Its latest release could not be checked."));
            }

            var links = el("p", "mb-links");
            links.append(externalLink(mod.repository, "Mod page"));
            if (mod.ready && mod.release) links.append(externalLink(mod.release.url, "What's new"));
            panel.append(links);
            return panel;
        }

        function copyButton(mod, holder) {
            var button = el("button", "mb-button mb-copy", "Copy repo URL");
            button.type = "button";
            var feedback = el("p", "mb-copy-status");
            feedback.setAttribute("role", "status");
            var reset = null;
            button.addEventListener("click", function () {
                var done = function () {
                    window.clearTimeout(reset);
                    button.textContent = "Copied";
                    feedback.textContent = "URL copied.";
                    reset = window.setTimeout(function () { button.textContent = "Copy repo URL"; feedback.textContent = ""; }, 2500);
                };
                var manual = function () {
                    var existing = holder.querySelector(".mb-manual");
                    var field = existing || el("input", "mb-manual");
                    if (!existing) {
                        field.type = "text";
                        field.readOnly = true;
                        field.setAttribute("aria-label", "Repository URL for " + mod.title);
                        holder.append(field);
                    }
                    field.value = mod.repository;
                    field.focus();
                    field.select();
                    feedback.textContent = "Copy the selected URL (Ctrl+C or long-press).";
                };
                if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(mod.repository).then(done, manual);
                else manual();
            });
            return [button, feedback];
        }

        function card(mod) {
            var index = mods.indexOf(mod);
            var titleId = "mb-title-" + index;
            var detailId = "mb-details-" + index;
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
            if (!mod.ready && mod.reason) body.append(el("p", "mb-reason", mod.reason));

            var actions = el("div", "mb-actions");
            var toggle = el("button", "mb-button mb-primary");
            toggle.type = "button";
            toggle.setAttribute("aria-controls", detailId);
            var label = mod.ready ? "Install steps" : "Details";
            var setLabel = function (open) {
                toggle.setAttribute("aria-expanded", String(open));
                toggle.textContent = open ? "Hide " + label.toLowerCase() : label;
            };
            var panel = details(mod, detailId);
            setLabel(!panel.hidden);
            toggle.addEventListener("click", function () {
                var open = panel.hidden;
                panel.hidden = !open;
                if (open) expanded.add(mod.repository);
                else expanded.delete(mod.repository);
                setLabel(open);
            });
            // Same validated repository URL as the copy button; externalLink keeps target/rel safe.
            var github = externalLink(mod.repository, "GitHub");
            github.className = "mb-button mb-github";
            github.setAttribute("aria-label", mod.title + " on GitHub (opens in a new tab)");
            var copy = copyButton(mod, actions);
            actions.append(toggle, github, copy[0]);
            body.append(actions, copy[1], panel);

            article.append(art, body);
            li.append(article);
            return li;
        }

        load();
    }
})();
