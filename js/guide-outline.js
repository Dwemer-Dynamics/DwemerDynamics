// Reading Room: Outline guide layout (CHIM, STOBE, DIALECTIC, LORKHAN, KAGRENAC guides).
// Runs only on pages whose body has the guide-outline class. The navigation and outline are static HTML,
// so content and links work without JavaScript; this file adds reading progress, the outline toggle, the mobile drawer and scrollspy.
// Copy page and Copy prompt controls still come from javascript.js on the pages that load it.
// It is loaded at the top of <body> so the lo-js class (which turns the mobile navigation into a drawer) is set before first paint.
(function () {
    "use strict";

    var body = document.body;
    if (!body || !body.classList.contains("guide-outline")) {
        return;
    }
    body.classList.add("lo-js");

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

        // Scrollspy: mark the section nearest the top of the viewport in the outline.
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
                var line = window.innerHeight * 0.3;
                var current = sections[0];
                sections.forEach(function (section) {
                    if (section.getBoundingClientRect().top <= line) {
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
})();
