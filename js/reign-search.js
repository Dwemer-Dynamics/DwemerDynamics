// Reign search is optional: reading pages and the topic directory work without it.
(function () {
    "use strict";
    var form = document.getElementById("reign-search-form");
    if (!form) return;
    var input = document.getElementById("reign-query");
    var clear = document.getElementById("reign-search-clear");
    var results = document.getElementById("reign-results");
    var status = document.getElementById("reign-search-status");
    var indexUrl = new URL("../data/reign-search.json", document.currentScript.src);
    var dataset = null;
    var loading = null;
    var timer = null;
    var revision = 0;
    var stopWords = new Set("a an the and to of in is it how do i can my why does what with for cant cannot doesnt isnt wont dont me you your am are be get would should please need but".split(" "));

    document.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            var openDrawer = document.querySelector(".lo-nav.lo-open");
            if (openDrawer) document.getElementById("lo-nav-close").click();
            input.focus();
            input.select();
        }
    });
    // Ordinary pages submit a normal GET form; only the search page needs the index.
    if (!results) return;
    clear.hidden = false;

    function normalize(value) {
        return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9\\]+/g, " ").trim();
    }

    function tokens(value) {
        return Array.from(new Set(normalize(value).split(/\s+/).filter(function (word) {
            return word && !stopWords.has(word);
        })));
    }

    // Normalize once per load; each keystroke only scores the prepared fields.
    async function loadIndex() {
        if (dataset) return dataset;
        if (!loading) {
            loading = fetch(indexUrl, { cache: "no-cache" }).then(function (response) {
                if (!response.ok) throw new Error("Index unavailable");
                return response.json();
            }).then(function (items) {
                dataset = items.map(function (item) {
                    return { item: item, title: normalize(item.title), text: normalize(item.text),
                        chapter: normalize(item.chapter), aliases: item.aliases.map(normalize) };
                });
                return dataset;
            }).catch(function (error) {
                loading = null;
                throw error;
            });
        }
        return loading;
    }

    function rank(items, query) {
        var phrase = normalize(query);
        var words = tokens(query);
        if (!words.length) return [];
        var matches = [];
        items.forEach(function (entry) {
            var found = 0;
            var score = 0;
            words.forEach(function (word) {
                var value = 0;
                if (entry.title.includes(word)) value = 14;
                else if (entry.aliases.some(function (alias) { return alias.includes(word); })) value = 11;
                else if (entry.chapter.includes(word)) value = 4;
                else if (entry.text.includes(word)) value = 1;
                if (value) { found += 1; score += value; }
            });
            if (!found) return;
            if (entry.title === phrase) score += 100;
            else if (entry.title.includes(phrase)) score += 35;
            if (entry.aliases.includes(phrase)) score += 80;
            else if (entry.aliases.some(function (alias) { return alias.includes(phrase); })) score += 22;
            matches.push({ item: entry.item, score: score + 50 * found / words.length,
                found: found, all: found === words.length });
        });
        var exact = matches.filter(function (match) { return match.all; });
        return (exact.length ? exact : matches.filter(function (match) {
            return match.found >= Math.max(1, Math.ceil(words.length * .6));
        })).sort(function (a, b) { return b.score - a.score || a.item.title.localeCompare(b.item.title); });
    }

    // Queries and excerpts become text nodes, never executable markup.
    function highlight(element, text, query) {
        var words = tokens(query).filter(function (word) { return word.length > 1; })
            .sort(function (a, b) { return b.length - a.length; });
        if (!words.length) { element.textContent = text; return; }
        var pattern = new RegExp("(" + words.map(function (word) {
            return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }).join("|") + ")", "ig");
        var last = 0;
        for (var match of text.matchAll(pattern)) {
            element.append(document.createTextNode(text.slice(last, match.index)));
            var mark = document.createElement("mark");
            mark.textContent = match[0];
            element.append(mark);
            last = match.index + match[0].length;
        }
        element.append(document.createTextNode(text.slice(last)));
    }

    function snippet(text, query) {
        var lower = text.toLowerCase();
        var position = lower.indexOf(query.toLowerCase());
        if (position < 0) {
            position = tokens(query).reduce(function (first, word) {
                var found = lower.indexOf(word);
                return found >= 0 && found < first ? found : first;
            }, text.length);
        }
        if (position === text.length) position = 0;
        var start = Math.max(0, position - 65);
        return (start ? "…" : "") + text.slice(start, start + 260) + (start + 260 < text.length ? "…" : "");
    }

    async function render() {
        var current = ++revision;
        var query = input.value.trim().slice(0, 160);
        results.replaceChildren();
        results.removeAttribute("aria-busy");
        if (!query) {
            status.textContent = "Search by topic, screen name or everyday words. Try ‘wife’, ‘troops expensive’ or ‘save warning’.";
            return;
        }
        status.textContent = "Searching the Reign guide…";
        results.setAttribute("aria-busy", "true");
        try {
            var items = await loadIndex();
            if (current !== revision) return;
            var matches = rank(items, query);
            status.textContent = matches.length ? (matches[0].all ? "" : "Closest matches: ") +
                matches.length + " topic" + (matches.length === 1 ? "" : "s") + " for “" + query + "”" :
                "No topics found for “" + query + "”. Try fewer words or browse the A–Z topics.";
            var fragment = document.createDocumentFragment();
            matches.forEach(function (match) {
                var item = match.item;
                var li = document.createElement("li");
                var meta = document.createElement("p");
                meta.className = "reign-result-meta";
                meta.textContent = item.chapter + (item.preview ? " · Preview included" : "");
                var heading = document.createElement("h2");
                var link = document.createElement("a");
                link.href = item.url;
                highlight(link, item.title, query);
                heading.append(link);
                var excerpt = document.createElement("p");
                highlight(excerpt, snippet(item.text, query), query);
                li.append(meta, heading, excerpt);
                fragment.append(li);
            });
            results.append(fragment);
        } catch (error) {
            if (current !== revision) return;
            status.textContent = "Search could not load. Try Search again, or use the A–Z topics below. The chapters are still available.";
        } finally {
            if (current === revision) results.removeAttribute("aria-busy");
        }
    }

    // Keep the query in this history entry so Back from a result restores the search.
    function updateQuery() {
        window.clearTimeout(timer);
        var url = new URL(location.href);
        var query = input.value.trim().slice(0, 160);
        if (query) url.searchParams.set("q", query);
        else url.searchParams.delete("q");
        history.replaceState(null, "", url);
        render();
    }
    form.addEventListener("submit", function (event) { event.preventDefault(); updateQuery(); });
    input.addEventListener("input", function () {
        // Invalidate an older fetch immediately, even during the debounce interval.
        revision += 1;
        window.clearTimeout(timer);
        timer = window.setTimeout(updateQuery, 180);
    });
    clear.addEventListener("click", function () { input.value = ""; updateQuery(); input.focus(); });
    input.addEventListener("keydown", function (event) {
        if (event.key === "Escape") { input.value = ""; updateQuery(); }
    });
    function restoreQuery() {
        window.clearTimeout(timer);
        input.value = (new URL(location.href).searchParams.get("q") || "").slice(0, 160);
        render();
    }
    window.addEventListener("popstate", restoreQuery);
    window.addEventListener("pageshow", function (event) { if (event.persisted) restoreQuery(); });
    restoreQuery();
})();
