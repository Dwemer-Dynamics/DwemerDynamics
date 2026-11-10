// Reading Room: Outline guide layout (CHIM, STOBE, DIALECTIC, LORKHAN, KAGRENAC guides).
// Runs only on pages whose body has the guide-outline class. The navigation and outline are static HTML,
// so content and links work without JavaScript; this file adds reading progress, sidebar icons, the outline toggle, the mobile drawer and scrollspy.
// Copy page and Copy prompt controls still come from javascript.js on the pages that load it.
// It is loaded at the top of <body> so the lo-js class (which turns the mobile navigation into a drawer) is set before first paint.
(function () {
    "use strict";

    var body = document.body;
    if (!body || !body.classList.contains("guide-outline")) {
        return;
    }
    body.classList.add("lo-js");

    // Sidebar icons: the same emoji for the same kind of page in every product (mostly the set the older sidebar used),
    // keyed by link target. Cross-product links (DwemerDistro's setup list) get the product's icon.
    var PAGE_ICONS = {
        "index.html": "📖",
        "installation.html": "⚙️",
        "configuration.html": "🔧",
        "roleplay-settings.html": "🎭",
        "background-life.html": "🌍",
        "ingame-settings.html": "🎮",
        "plugins.html": "🧩",
        "llm.html": "🧠",
        "local-llm-guide.html": "🖥️",
        "tts.html": "🔊",
        "stt.html": "🎤",
        "itt.html": "📸",
        "plugin-guide.html": "🛠️",
        "modders-guide.html": "📜",
        "faq.html": "❓",
        "remote-hosting-guide.html": "🌐",
        "linux-setup-guide.html": "🐧",
        "log-files-and-debugging.html": "📄",
        "gameplay.html": "🎲",
        "porting.html": "🔌",
        "data-and-memory.html": "🗄️",
        "testing.html": "🧪",
        "updates.html": "🔄",
        "publishing.html": "📦",
        "kosmokrator.html": "🗺️",
        "kenogenesis.html": "⚔️"
    };
    var PRODUCT_ICONS = {
        "chim": "🐉",
        "lorkhan": "🍄",
        "dialectic": "☢️",
        "stobe": "🏜️",
        "custom-mods": "⚒️"
    };
    var HOME_ICON = "🏠";
    var FALLBACK_ICON = "📑";
    // The site root, from this script's own URL (js/guide-outline.js), so links are matched the same way
    // whether they are authored (./faq.html, ../index.html) or built clean URLs (/chim/faq/, /).
    var SITE_ROOT = document.currentScript ? new URL("..", document.currentScript.src).href : "";

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    function init() {
        var progress = document.querySelector(".lo-progress");
        // Keep the guide's reading progress visible in the Outline layout.
        function updateProgress() {
            if (!progress) {
                return;
            }
            var distance = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (distance > 0 ? window.scrollY / distance * 100 : 0) + "%";
        }
        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);
        window.addEventListener("load", updateProgress);
        updateProgress();

        var nav = document.getElementById("lo-nav");
        var outline = document.getElementById("lo-outline");
        var outlineToggle = document.getElementById("lo-outline-toggle");
        var navToggle = document.getElementById("lo-nav-toggle");
        var navClose = document.getElementById("lo-nav-close");
        var scrim = document.getElementById("lo-scrim");
        var drawerQuery = window.matchMedia("(max-width: 820px)");

        // Outline toggle: show or hide the current page's section list inside the navigation.
        if (outline && outlineToggle) {
            outlineToggle.addEventListener("click", function () {
                var open = outlineToggle.getAttribute("aria-expanded") !== "true";
                outlineToggle.setAttribute("aria-expanded", String(open));
                outline.hidden = !open;
            });
        }

        addNavIcons();

        // Long command blocks scroll horizontally; make them reachable by keyboard.
        document.querySelectorAll(".lo-article pre").forEach(function (pre) {
            if (!pre.hasAttribute("tabindex")) {
                pre.setAttribute("tabindex", "0");
            }
        });

        // Mobile drawer: button, close button, scrim and Escape; Tab stays inside while open; focus returns to the toggle.
        if (nav && navToggle && scrim) {
            var background = document.querySelectorAll(".lo-main, .lo-topbar");

            var isOpen = function () {
                return nav.classList.contains("lo-open");
            };

            var focusables = function () {
                return Array.prototype.filter.call(nav.querySelectorAll("a[href], button"), function (el) {
                    return el.offsetParent !== null || el === document.activeElement;
                });
            };

            var setDrawer = function (open, restoreFocus) {
                nav.classList.toggle("lo-open", open);
                scrim.classList.toggle("lo-open", open);
                body.classList.toggle("lo-drawer-open", open);
                navToggle.setAttribute("aria-expanded", String(open));
                navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
                background.forEach(function (el) {
                    if (open) {
                        el.setAttribute("inert", "");
                    } else {
                        el.removeAttribute("inert");
                    }
                });
                if (open) {
                    var target = (outline && !outline.hidden && outline.querySelector('a[aria-current="true"]')) ||
                        nav.querySelector('[aria-current="page"]');
                    if (target) {
                        target.focus();
                    }
                } else if (restoreFocus !== false) {
                    navToggle.focus();
                }
            };

            navToggle.addEventListener("click", function () {
                setDrawer(!isOpen());
            });
            if (navClose) {
                navClose.addEventListener("click", function () {
                    setDrawer(false);
                });
            }
            scrim.addEventListener("click", function () {
                setDrawer(false);
            });

            document.addEventListener("keydown", function (event) {
                if (!isOpen()) {
                    return;
                }
                if (event.key === "Escape") {
                    event.preventDefault();
                    setDrawer(false);
                    return;
                }
                if (event.key === "Tab") {
                    var items = focusables();
                    if (!items.length) {
                        return;
                    }
                    var first = items[0];
                    var last = items[items.length - 1];
                    if (event.shiftKey && document.activeElement === first) {
                        event.preventDefault();
                        last.focus();
                    } else if (!event.shiftKey && document.activeElement === last) {
                        event.preventDefault();
                        first.focus();
                    }
                }
            });

            // Following a link closes the drawer without pulling focus back to the toggle.
            nav.addEventListener("click", function (event) {
                if (event.target.closest("a[href]") && isOpen()) {
                    setDrawer(false, false);
                }
            });

            var onQueryChange = function (query) {
                if (!query.matches && isOpen()) {
                    setDrawer(false, false);
                }
            };
            if (drawerQuery.addEventListener) {
                drawerQuery.addEventListener("change", onQueryChange);
            } else if (drawerQuery.addListener) {
                drawerQuery.addListener(onQueryChange);
            }
        }

        // Scrollspy: mark the last section whose top has reached the anchor landing line (scroll-margin or top bar, plus a little slack),
        // so a short section reached from the outline stays marked; at the bottom of the page the last section is marked.
        if (outline) {
            var links = Array.prototype.slice.call(outline.querySelectorAll('a[href^="#"]'));
            var sections = links.map(function (link) {
                return document.getElementById(decodeURIComponent(link.hash.slice(1)));
            });
            if (!links.length || sections.indexOf(null) !== -1) {
                return;
            }

            var scheduled = false;
            var update = function () {
                scheduled = false;
                var bar = document.querySelector(".lo-topbar");
                var barBottom = bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0;
                var current = sections[0];
                sections.forEach(function (section) {
                    var margin = parseFloat(window.getComputedStyle(section).scrollMarginTop) || 0;
                    if (section.getBoundingClientRect().top <= Math.max(margin, barBottom) + 24) {
                        current = section;
                    }
                });
                if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
                    current = sections[sections.length - 1];
                }
                links.forEach(function (link, i) {
                    if (sections[i] === current) {
                        link.setAttribute("aria-current", "true");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            };
            var schedule = function () {
                if (!scheduled) {
                    scheduled = true;
                    window.requestAnimationFrame(update);
                }
            };

            window.addEventListener("scroll", schedule, { passive: true });
            window.addEventListener("resize", schedule);
            update();
        }
    }

    // Each guide link gets one decorative icon in a fixed column (the CSS reserves it under lo-js, so labels do not shift).
    // Label text, href and aria-current are untouched; the icon is aria-hidden so link names stay the same.
    function addNavIcons() {
        var product = (sitePath(window.location.href) || [])[0];
        document.querySelectorAll(".lo-nav a.lo-item").forEach(function (link) {
            if (link.querySelector(".lo-ico")) {
                return;
            }
            var parts = sitePath(link.href);
            var icon;
            if (!parts) {
                icon = FALLBACK_ICON;
            } else if (!parts.length) {
                icon = HOME_ICON;
            } else if (parts[0] !== product) {
                icon = PRODUCT_ICONS[parts[0]];
            } else {
                icon = PAGE_ICONS[(parts[1] || "index") + ".html"];
            }
            var span = document.createElement("span");
            span.className = "lo-ico";
            span.setAttribute("aria-hidden", "true");
            span.textContent = icon || FALLBACK_ICON;
            link.insertBefore(span, link.firstChild);
        });
    }

    // Path segments of a URL below the site root, without index.html or .html: "/" -> [], "/chim/index.html" -> ["chim"],
    // "/chim/faq.html" and "/chim/faq/" -> ["chim", "faq"]. Null for URLs outside the site.
    function sitePath(url) {
        if (!SITE_ROOT || url.indexOf(SITE_ROOT) !== 0) {
            return null;
        }
        return url.slice(SITE_ROOT.length).split(/[?#]/)[0].replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "")
            .split("/").filter(Boolean);
    }
})();
