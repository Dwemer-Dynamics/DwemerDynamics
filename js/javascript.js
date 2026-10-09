var menuIsOpen = false;

const leftSidebarConfigs = {
    lorkhan: {
        "pageLinks": [
            {
                "href": "../index.html",
                "title": "Home",
                "label": "Home",
                "emoji": "↩️"
            },
            {
                "href": "./index.html",
                "title": "Overview",
                "label": "Overview",
                "emoji": "📖"
            },
            {
                "href": "./installation.html",
                "title": "Installation",
                "label": "Installation",
                "emoji": "⚙️"
            },
            {
                "href": "./configuration.html",
                "title": "Configuration",
                "label": "Configuration",
                "emoji": "🔧"
            },
            {
                "href": "./roleplay-settings.html",
                "title": "Roleplay Settings",
                "label": "Roleplay Settings",
                "emoji": "🎭"
            },
            {
                "href": "./ingame-settings.html",
                "title": "Morrowind Settings",
                "label": "Morrowind Settings",
                "emoji": "🎮"
            },
            {
                "href": "./llm.html",
                "title": "Large Language Models",
                "label": "Large Language Models",
                "emoji": "🧠"
            },
            {
                "href": "./local-llm-guide.html",
                "title": "Local LLM Guide",
                "label": "Local LLM Guide",
                "emoji": "🖥️"
            },
            {
                "href": "./tts.html",
                "title": "Text-to-Speech",
                "label": "Text-to-Speech",
                "emoji": "🔊"
            },
            {
                "href": "./stt.html",
                "title": "Speech-to-Text",
                "label": "Speech-to-Text",
                "emoji": "🎤"
            },
            {
                "href": "./modders-guide.html",
                "title": "Modders Guide",
                "label": "Modders Guide",
                "emoji": "📜"
            },
            {
                "href": "./faq.html",
                "title": "FAQ",
                "label": "FAQ",
                "emoji": "❓"
            },
            {
                "href": "./remote-hosting-guide.html",
                "title": "Remote Hosting",
                "label": "Remote Hosting",
                "emoji": "🌐"
            },
            {
                "href": "./log-files-and-debugging.html",
                "title": "Logs and Debugging",
                "label": "Logs and Debugging",
                "emoji": "📄"
            }
        ],
        "bottomLinks": [
            {
                "href": "./installation.html#Download",
                "title": "Beta downloads",
                "label": "Beta downloads",
                "emoji": "⬇️"
            },
            {
                "href": "https://discord.gg/NDn9qud2ug",
                "title": "Discord",
                "label": "Discord",
                "icon": "../img/discord.png"
            },
            {
                "href": "https://www.patreon.com/DwemerDynamics",
                "title": "Patreon",
                "label": "Patreon",
                "icon": "../img/patreon.png"
            },
            {
                "href": "https://github.com/Dwemer-Dynamics/LORKHAN",
                "title": "Mod Code",
                "label": "Mod Code",
                "emoji": "💻"
            },
            {
                "href": "https://github.com/Dwemer-Dynamics/LorkhanServer",
                "title": "Server Code",
                "label": "Server Code",
                "emoji": "💻"
            }
        ]
    },
    chim: {
        pageLinks: [
            { href: "../index.html", title: "Home", label: "Home", emoji: "\u21A9\uFE0F" },
            { href: "./index.html", title: "Overview", label: "Overview", emoji: "\uD83D\uDCD6" },
            { href: "./installation.html", title: "Installation", label: "Installation", emoji: "\u2699\uFE0F" },
            { href: "./configuration.html", title: "Configuration", label: "Configuration", emoji: "\uD83D\uDD27" },
            { href: "./roleplay-settings.html", title: "Roleplay Settings", label: "Roleplay Settings", emoji: "\uD83C\uDFAD" },
            { href: "./background-life.html", title: "Background Life", label: "Background Life", emoji: "\uD83C\uDF0D" },
            { href: "./ingame-settings.html", title: "Skyrim Settings", label: "Skyrim Settings", emoji: "\uD83C\uDFAE" },
            { href: "./llm.html", title: "Large Language Models", label: "Large Language Models", emoji: "\uD83E\uDDE0" },
            { href: "./local-llm-guide.html", title: "Local LLMs", label: "Local LLMs", emoji: "\uD83D\uDDA5\uFE0F" },
            { href: "./tts.html", title: "Text-to-Speech", label: "Text-to-Speech", emoji: "\uD83D\uDD0A" },
            { href: "./stt.html", title: "Speech-to-Text", label: "Speech-to-Text", emoji: "\uD83C\uDFA4" },
            { href: "./itt.html", title: "Image-to-Text", label: "Image-to-Text", emoji: "\uD83D\uDCF8" },
            { href: "./plugins.html", title: "Plugins", label: "Plugins", emoji: "\uD83E\uDDE9" },
            { href: "./plugin-guide.html", title: "Plugin Guide", label: "Plugin Guide", emoji: "\uD83D\uDEE0\uFE0F" },
            { href: "./modders-guide.html", title: "Modders Guide", label: "Modders Guide", emoji: "\uD83D\uDCDC" },
            { href: "./faq.html", title: "FAQ", label: "FAQ", emoji: "\u2753" },
            { href: "./remote-hosting-guide.html", title: "Remote Hosting Guide", label: "Remote Hosting Guide", emoji: "\uD83C\uDF10" },
            { href: "./linux-setup-guide.html", title: "Linux Setup Guide", label: "Linux Setup Guide", emoji: "\uD83D\uDC27" },
            { href: "./log-files-and-debugging.html", title: "Log Files", label: "Log Files", emoji: "\uD83D\uDCC4" }
        ],
        bottomLinks: [
            { href: "https://www.nexusmods.com/skyrimspecialedition/mods/126330?tab=files", title: "Download", label: "Download", emoji: "\u2B07\uFE0F" },
            { href: "https://www.youtube.com/watch?v=Sf0m0FIUZuw", title: "Video Guide", label: "Video Guide", emoji: "\uD83C\uDFA5" },
            { href: "https://discord.gg/NDn9qud2ug", title: "Discord", label: "Discord", icon: "../img/discord.png" },
            { href: "https://www.youtube.com/@DwemerDynamics", title: "YouTube", label: "YouTube", icon: "../img/youtube.png" },
            { href: "https://www.patreon.com/DwemerDynamics", title: "Patreon", label: "Patreon", icon: "../img/patreon.png" },
            { href: "https://github.com/Dwemer-Dynamics/HerikaServer", title: "Server Code", label: "Server Code", emoji: "\uD83D\uDCBB" },
            { href: "https://github.com/Dwemer-Dynamics/CHIM", title: "Mod Code", label: "Mod Code", emoji: "\uD83D\uDCBB" }
        ]
    },
    stobe: {
        pageLinks: [
            { href: "../index.html", title: "Home", label: "Home", emoji: "\u21A9\uFE0F" },
            { href: "./index.html", title: "Overview", label: "Overview", emoji: "\uD83D\uDCD6" },
            { href: "./installation.html", title: "Installation", label: "Installation", emoji: "\u2699\uFE0F" },
            { href: "./configuration.html", title: "Configuration", label: "Configuration", emoji: "\uD83D\uDD27" },
            { href: "./roleplay-settings.html", title: "Roleplay Settings", label: "Roleplay Settings", emoji: "\uD83C\uDFAD" },
            { href: "./ingame-settings.html", title: "Kenshi Settings", label: "Kenshi Settings", emoji: "\uD83C\uDFAE" },
            { href: "./llm.html", title: "Large Language Models", label: "Large Language Models", emoji: "\uD83E\uDDE0" },
            { href: "./local-llm-guide.html", title: "Local LLMs", label: "Local LLMs", emoji: "\uD83D\uDDA5\uFE0F" },
            { href: "./tts.html", title: "Text-to-Speech", label: "Text-to-Speech", emoji: "\uD83D\uDD0A" },
            { href: "./stt.html", title: "Speech-to-Text", label: "Speech-to-Text", emoji: "\uD83D\uDD0A" },
            { href: "./modders-guide.html", title: "Modders Guide", label: "Modders Guide", emoji: "\uD83D\uDCDC" },
            { href: "./faq.html", title: "FAQ", label: "FAQ", emoji: "\u2753" },
            { href: "./remote-hosting-guide.html", title: "Remote Hosting Guide", label: "Remote Hosting Guide", emoji: "\uD83C\uDF10" },
            { href: "./linux-setup-guide.html", title: "Linux Setup Guide", label: "Linux Setup Guide", emoji: "\uD83D\uDC27" },
            { href: "./log-files-and-debugging.html", title: "Log Files", label: "Log Files", emoji: "\uD83D\uDCC4" }
        ],
        bottomLinks: [
            { href: "https://www.nexusmods.com/kenshi/mods/1891?tab=files", title: "Download", label: "Download", emoji: "\u2B07\uFE0F" },
            { href: "https://www.youtube.com/watch?v=Sf0m0FIUZuw", title: "Video Guide", label: "Video Guide", emoji: "\uD83C\uDFA5" },
            { href: "https://discord.gg/NDn9qud2ug", title: "Discord", label: "Discord", icon: "../img/discord.png" },
            { href: "https://www.youtube.com/@DwemerDynamics", title: "YouTube", label: "YouTube", icon: "../img/youtube.png" },
            { href: "https://www.patreon.com/DwemerDynamics", title: "Patreon", label: "Patreon", icon: "../img/patreon.png" },
            { href: "https://github.com/Dwemer-Dynamics/StobeServer", title: "Server Code", label: "Server Code", emoji: "\uD83D\uDCBB" },
            { href: "https://github.com/Dwemer-Dynamics/STOBE", title: "Mod Code", label: "Mod Code", emoji: "\uD83D\uDCBB" }
        ]
    },
    dialectic: {
        pageLinks: [
            { href: "../index.html", title: "Home", label: "Home", emoji: "\u21A9\uFE0F" },
            { href: "./index.html", title: "Overview", label: "Overview", emoji: "\uD83D\uDCD6" },
            { href: "./installation.html", title: "Installation", label: "Installation", emoji: "\u2699\uFE0F" },
            { href: "./configuration.html", title: "Configuration", label: "Configuration", emoji: "\uD83D\uDD27" },
            { href: "./roleplay-settings.html", title: "Roleplay Settings", label: "Roleplay Settings", emoji: "\uD83C\uDFAD" },
            { href: "./ingame-settings.html", title: "Fallout Settings", label: "Fallout Settings", emoji: "\uD83C\uDFAE" },
            { href: "./llm.html", title: "Large Language Models", label: "Large Language Models", emoji: "\uD83E\uDDE0" },
            { href: "./local-llm-guide.html", title: "Local LLMs", label: "Local LLMs", emoji: "\uD83D\uDDA5\uFE0F" },
            { href: "./tts.html", title: "Text-to-Speech", label: "Text-to-Speech", emoji: "\uD83D\uDD0A" },
            { href: "./stt.html", title: "Speech-to-Text", label: "Speech-to-Text", emoji: "\uD83C\uDFA4" },
            { href: "./modders-guide.html", title: "Modders Guide", label: "Modders Guide", emoji: "\uD83D\uDCDC" },
            { href: "./faq.html", title: "FAQ", label: "FAQ", emoji: "\u2753" },
            { href: "./remote-hosting-guide.html", title: "Remote Hosting Guide", label: "Remote Hosting Guide", emoji: "\uD83C\uDF10" },
            { href: "./linux-setup-guide.html", title: "Linux Setup Guide", label: "Linux Setup Guide", emoji: "\uD83D\uDC27" },
            { href: "./log-files-and-debugging.html", title: "Log Files", label: "Log Files", emoji: "\uD83D\uDCC4" }
        ],
        bottomLinks: [
            { href: "https://www.nexusmods.com/newvegas/mods/99233", title: "Download", label: "Download", emoji: "\u2B07\uFE0F" },
            { href: "https://www.youtube.com/watch?v=Sf0m0FIUZuw", title: "Video Guide", label: "Video Guide", emoji: "\uD83C\uDFA5" },
            { href: "https://discord.gg/NDn9qud2ug", title: "Discord", label: "Discord", icon: "../img/discord.png" },
            { href: "https://www.youtube.com/@DwemerDynamics", title: "YouTube", label: "YouTube", icon: "../img/youtube.png" },
            { href: "https://www.patreon.com/DwemerDynamics", title: "Patreon", label: "Patreon", icon: "../img/patreon.png" },
            { href: "https://github.com/Dwemer-Dynamics/DialecticServer", title: "Server Code", label: "Server Code", emoji: "\uD83D\uDCBB" },
            { href: "https://github.com/Dwemer-Dynamics/Dialectic", title: "Mod Code", label: "Mod Code", emoji: "\uD83D\uDCBB" }
        ]
    },
    customMods: {
        pageLinks: [
            { href: "../index.html", title: "Home", label: "Home", emoji: "\u21A9\uFE0F" },
            { href: "./index.html", title: "Overview", label: "Overview", emoji: "\uD83D\uDCD6" },
            { href: "./installation.html", title: "Installation", label: "Installation", emoji: "\u2699\uFE0F" },
            { href: "./configuration.html", title: "Configuration", label: "Configuration", emoji: "\uD83D\uDD27" },
            { href: "./data-and-memory.html", title: "Data and Memory", label: "Data and Memory", emoji: "\uD83D\uDDC4\uFE0F" },
            { href: "./testing.html", title: "Testing", label: "Testing", emoji: "\uD83E\uDDEA" },
            { href: "./porting.html", title: "Porting", label: "Porting", emoji: "\uD83D\uDEE0\uFE0F" },
            { href: "./updates.html", title: "Updates and Backups", label: "Updates and Backups", emoji: "\uD83D\uDD04" },
            { href: "./publishing.html", title: "Publishing", label: "Publishing", emoji: "\uD83D\uDCE6" }
        ],
        bottomLinks: [
            { href: "https://github.com/Dwemer-Dynamics/ExampleServer", title: "Server Template", label: "Server Template", emoji: "\uD83D\uDCBB" },
            { href: "https://github.com/Dwemer-Dynamics/ExampleMod", title: "Client Template", label: "Client Template", emoji: "\uD83D\uDCBB" },
            { href: "https://discord.gg/NDn9qud2ug", title: "Discord", label: "Discord", icon: "../img/discord.png" },
            { href: "https://www.patreon.com/DwemerDynamics", title: "Patreon", label: "Patreon", icon: "../img/patreon.png" }
        ]
    }
};

const progressBars = document.getElementsByClassName("progress-bar");
const sections = document.getElementsByClassName("section");
const sidebars = document.getElementsByClassName("sidebar");
const leftSideBar = document.getElementsByClassName("left-sidebar");

window.addEventListener("resize", sizeChanged);
document.addEventListener("DOMContentLoaded", function () {
    updateProgressBarAndFadeIn();
    createLeftSidebar();
    createRightSidebar();
    markActivePage();
    createPageCopyButton();
});
window.onscroll = updateProgressBarAndFadeIn;

function sizeChanged() {
    if (leftSideBar && leftSideBar.length > 0 && document.documentElement.clientWidth > 760) {
        leftSideBar[0].style.width = "";
    }
}

function toggleNav() {
    const sidebar = document.querySelector(".left-sidebar");
    if (!sidebar) {
        return;
    }
    sidebar.classList.toggle("expanded");
    menuIsOpen = sidebar.classList.contains("expanded");
}

function updateProgressBarAndFadeIn() {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = window.innerHeight;

    if (sections) {
        for (var i = 0; i < sections.length; i++) {
            var sectionTop = sections[i].getBoundingClientRect().top;
            var sectionHeight = sections[i].clientHeight;
            if (sectionTop < height && sectionTop + sectionHeight > 0) {
                sections[i].classList.add("fade-in");
            }
        }
    }

    var progressBar = progressBars[0];
    if (progressBar) {
        height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var scroll = height > 0 ? winScroll / height : 0;
        progressBar.style.width = scroll * 100 + "%";
    }

    if (sidebars) {
        for (var j = 0; j < sidebars.length; j++) {
            sidebars[j].style.height = "calc(100vh - 6.25em)";
        }
    }
}

function createLeftSidebar() {
    const leftSidebar = document.querySelector(".sidebar.left-sidebar");
    if (!leftSidebar) {
        return;
    }

    const config = getLeftSidebarConfig();
    if (!config) {
        return;
    }

    leftSidebar.replaceChildren(
        buildSidebarLinkGroup("pageLinks", config.pageLinks, false),
        document.createElement("hr"),
        buildSidebarLinkGroup("sidebar-bottom", config.bottomLinks, true)
    );
}

function getLeftSidebarConfig() {
    if (document.body.classList.contains("lorkhan-theme")) {
        return leftSidebarConfigs.lorkhan;
    }

    if (document.body.classList.contains("chim-theme")) {
        return leftSidebarConfigs.chim;
    }

    if (document.body.classList.contains("stobe-theme")) {
        return leftSidebarConfigs.stobe;
    }

    if (document.body.classList.contains("dialectic-theme")) {
        return leftSidebarConfigs.dialectic;
    }

    if (document.body.classList.contains("custom-mods-theme")) {
        return leftSidebarConfigs.customMods;
    }

    return null;
}

function buildSidebarLinkGroup(className, links, external) {
    const container = document.createElement("p");
    container.className = className;

    links.forEach(function (linkConfig) {
        const link = document.createElement("a");
        link.href = linkConfig.href;
        link.title = linkConfig.title;

        if (linkConfig.icon) {
            const icon = document.createElement("img");
            icon.className = "sidebar-link-icon";
            icon.src = linkConfig.icon;
            icon.alt = linkConfig.title;
            link.appendChild(icon);
        } else if (linkConfig.emoji) {
            const emoji = document.createElement("span");
            emoji.className = "sidebar-link-emoji";
            emoji.textContent = linkConfig.emoji;
            link.appendChild(emoji);
        }

        const label = document.createElement("span");
        label.textContent = linkConfig.label;
        link.appendChild(label);

        if (external) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }

        container.appendChild(link);
    });

    return container;
}

function createRightSidebar() {
    const content = document.getElementsByClassName("content")[0];
    const sidebar = document.getElementById("sidebarContent");
    if (!content || !sidebar) {
        return;
    }

    const sectionNodes = content.getElementsByClassName("section");
    if (!sectionNodes.length) {
        return;
    }

    const fragment = document.createDocumentFragment();

    for (const section of sectionNodes) {
        const div = document.createElement("div");
        const title = section.id || "Section";
        const bold = document.createElement("b");
        bold.innerHTML = '<a href="#' + title + '">' + title + "</a>";
        div.appendChild(bold);

        const headers = section.querySelectorAll(".card[id], .card-green[id], .card-yellow[id], .card-red[id]");
        headers.forEach(function (element) {
            const anchor = document.createElement("a");
            anchor.href = "#" + element.id;
            anchor.textContent = element.id.replace(/([A-Z])/g, " $1").trim();
            div.appendChild(anchor);
        });

        fragment.appendChild(div);
    }

    sidebar.appendChild(fragment);
}

function markActivePage() {
    const leftSidebar = document.querySelector(".sidebar.left-sidebar");
    if (!leftSidebar) {
        return;
    }

    const sidebarLinks = leftSidebar.querySelectorAll("a");
    const currentPage = "./" + window.location.pathname.split("/").pop();

    sidebarLinks.forEach(function (link) {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });
}

const PAGE_COPY_LABEL = "Copy page";
const PAGE_COPY_ACCESSIBLE_LABEL = "Copy page as Markdown";
const PAGE_COPY_RESET_DELAY = 2000;

// Elements that are page chrome or controls rather than guide content.
const MARKDOWN_SKIP_SELECTOR = "script, style, noscript, template, nav, button, input, select, textarea, form, svg, canvas, .page-copy-actions, [hidden], [aria-hidden='true']";
const MARKDOWN_BLOCK_TAGS = new Set([
    "address", "article", "aside", "audio", "blockquote", "details", "dd", "div", "dl", "dt", "embed",
    "fieldset", "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr",
    "iframe", "li", "main", "object", "ol", "p", "pre", "section", "summary", "table", "ul", "video"
]);
const MARKDOWN_BLOCK_SELECTOR = Array.from(MARKDOWN_BLOCK_TAGS).join(", ");

// Adds one "Copy page" control under the page title of copyable guides.
function createPageCopyButton() {
    if (!document.body.classList.contains("copyable-guide") || document.querySelector(".page-copy-button")) {
        return;
    }

    const content = document.querySelector(".content");
    if (!content) {
        return;
    }

    const actions = document.createElement("div");
    actions.className = "page-copy-actions";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "guide-copy-button page-copy-button";
    button.textContent = PAGE_COPY_LABEL;
    button.setAttribute("aria-label", PAGE_COPY_ACCESSIBLE_LABEL);

    const status = document.createElement("span");
    status.className = "page-copy-status";
    status.setAttribute("role", "status");

    actions.append(button, status);

    let copying = false;
    let resetTimer = 0;

    function showCopyResult(state, label, message) {
        window.clearTimeout(resetTimer);
        button.textContent = label;
        button.dataset.copyState = state;
        status.textContent = message;

        resetTimer = window.setTimeout(function () {
            button.textContent = PAGE_COPY_LABEL;
            delete button.dataset.copyState;
            status.textContent = "";
        }, PAGE_COPY_RESET_DELAY);
    }

    button.addEventListener("click", function () {
        if (copying) {
            return;
        }

        copying = true;
        let markdown;
        try {
            markdown = buildPageMarkdown(content);
        } catch (error) {
            copying = false;
            showCopyResult("failed", "Copy failed", "Could not copy the page as Markdown.");
            return;
        }

        copyTextToClipboard(markdown).then(function () {
            showCopyResult("copied", "Copied", "Page copied as Markdown.");
        }).catch(function () {
            showCopyResult("failed", "Copy failed", "Could not copy the page as Markdown. Your browser blocked clipboard access.");
        }).then(function () {
            copying = false;
        });
    });

    const heading = content.querySelector("h1");
    const hero = content.querySelector(".hero-card");
    if (heading) {
        heading.insertAdjacentElement("afterend", actions);
    } else if (hero) {
        hero.insertBefore(actions, hero.firstChild);
    } else {
        content.insertBefore(actions, content.firstChild);
    }
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).catch(function () {
            return copyTextWithSelection(text);
        });
    }

    return copyTextWithSelection(text);
}

// Legacy copy path for insecure contexts or denied clipboard permissions; returns focus afterwards.
function copyTextWithSelection(text) {
    return new Promise(function (resolve, reject) {
        const previousFocus = document.activeElement;
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.setAttribute("aria-hidden", "true");
        textarea.tabIndex = -1;
        textarea.style.position = "fixed";
        textarea.style.top = "0";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();

        let copied = false;
        let failure = null;
        try {
            copied = document.execCommand("copy");
        } catch (error) {
            failure = error;
        }

        document.body.removeChild(textarea);
        if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus({ preventScroll: true });
        }

        copied ? resolve() : reject(failure || new Error("Copy command failed"));
    });
}

// Serializes the guide content into standalone Markdown without touching the live DOM.
function buildPageMarkdown(content) {
    const context = { linkedUrls: collectLinkedUrls(content) };
    const blocks = markdownBlocks(content, context).map(function (block) {
        return block.text;
    });

    const pageUrl = window.location.href.split("#")[0];
    const sourceLine = "Source: <" + pageUrl + ">";
    if (blocks.length && blocks[0].startsWith("# ")) {
        blocks.splice(1, 0, sourceLine);
    } else {
        blocks.unshift(sourceLine);
    }

    return blocks.join("\n\n").trim() + "\n";
}

function collectLinkedUrls(root) {
    const urls = new Set();
    root.querySelectorAll("a[href]").forEach(function (link) {
        const url = resolveMarkdownUrl(link.getAttribute("href"));
        if (url) {
            urls.add(url);
        }
    });
    return urls;
}

function resolveMarkdownUrl(value) {
    if (!value || /^\s*javascript:/i.test(value)) {
        return "";
    }

    try {
        return new URL(value.trim(), document.baseURI).href;
    } catch (error) {
        return "";
    }
}

function formatMarkdownUrl(url) {
    return /[\s()<>]/.test(url) ? "<" + url.replace(/</g, "%3C").replace(/>/g, "%3E") + ">" : url;
}

function shouldSkipMarkdownNode(node) {
    return node.nodeType === Node.ELEMENT_NODE && node.matches(MARKDOWN_SKIP_SELECTOR);
}

function isMarkdownBlock(node) {
    if (node.nodeType !== Node.ELEMENT_NODE || shouldSkipMarkdownNode(node)) {
        return false;
    }

    return MARKDOWN_BLOCK_TAGS.has(node.tagName.toLowerCase()) || node.querySelector(MARKDOWN_BLOCK_SELECTOR) !== null;
}

// Converts a container's children into Markdown blocks ({ type, text }), grouping loose inline content into paragraphs.
function markdownBlocks(parent, context) {
    const blocks = [];
    let inlineParts = [];

    function flushInline() {
        const text = finishInlineMarkdown(joinInlineMarkdown(inlineParts), context);
        if (text) {
            blocks.push({ type: "paragraph", text: text });
        }
        inlineParts = [];
    }

    parent.childNodes.forEach(function (child) {
        if (shouldSkipMarkdownNode(child)) {
            return;
        }

        if (isMarkdownBlock(child)) {
            flushInline();
            markdownBlock(child, context).forEach(function (block) {
                if (block.text) {
                    blocks.push(block);
                }
            });
        } else {
            inlineParts.push(markdownInline(child, context));
        }
    });

    flushInline();
    return blocks;
}

function markdownBlock(node, context) {
    const tag = node.tagName.toLowerCase();

    if (/^h[1-6]$/.test(tag)) {
        const text = inlineMarkdownOf(node, context).replace(/\s*(?:  \n|<br>)\s*/g, " ");
        return text ? [{ type: "heading", text: "#".repeat(Number(tag[1])) + " " + text }] : [];
    }

    switch (tag) {
        case "p":
            return [{ type: "paragraph", text: inlineMarkdownOf(node, context) }];
        case "pre":
            return [{ type: "code", text: codeFenceMarkdown(node) }];
        case "ul":
        case "ol":
            return [{ type: "list", text: listMarkdown(node, context) }];
        case "blockquote":
            return [{ type: "quote", text: prefixLines(joinMarkdownBlocks(markdownBlocks(node, context)), "> ") }];
        case "table":
            return tableMarkdown(node, context);
        case "hr":
            return [{ type: "rule", text: "---" }];
        case "figcaption":
            return [{ type: "paragraph", text: emphasizeMarkdown(inlineMarkdownOf(node, context), "*") }];
        case "summary":
        case "dt":
            return [{ type: "paragraph", text: emphasizeMarkdown(inlineMarkdownOf(node, context), "**") }];
        case "iframe":
        case "video":
        case "audio":
        case "embed":
        case "object":
            return [{ type: "paragraph", text: mediaMarkdown(node, context) }];
        default:
            return markdownBlocks(node, context);
    }
}

function joinMarkdownBlocks(blocks) {
    return blocks.map(function (block) {
        return block.text;
    }).join("\n\n");
}

function prefixLines(text, prefix) {
    return text.split("\n").map(function (line) {
        return line ? prefix + line : prefix.trimEnd();
    }).join("\n");
}

function inlineMarkdownOf(node, context) {
    const parts = Array.from(node.childNodes).map(function (child) {
        return markdownInline(child, context);
    });
    return finishInlineMarkdown(joinInlineMarkdown(parts), context);
}

function inlineChildrenMarkdown(node, context) {
    return joinInlineMarkdown(Array.from(node.childNodes).map(function (child) {
        return markdownInline(child, context);
    }));
}

// Concatenates inline fragments while collapsing whitespace that HTML would render as one space.
function joinInlineMarkdown(parts) {
    return parts.reduce(function (result, part) {
        if (!part) {
            return result;
        }
        if (/[ \n]$/.test(result) && part.startsWith(" ")) {
            part = part.replace(/^ +/, "");
        }
        return result + part;
    }, "");
}

// Turns <br> markers into Markdown hard breaks (or <br> in table cells) and protects line-start syntax.
function finishInlineMarkdown(text, context) {
    const lines = text.split("\n").map(function (line) {
        return escapeMarkdownLineStart(line.trim());
    }).filter(Boolean);

    return lines.join(context.inTable ? "<br>" : "  \n");
}

function escapeMarkdownLineStart(line) {
    if (/^(?:#{1,6}(?:\s|$)|>|[-+*](?:\s|$)|=+$)/.test(line)) {
        return "\\" + line;
    }
    return line.replace(/^(\d+)([.)])(?=\s|$)/, "$1\\$2");
}

function escapeMarkdownText(text) {
    return text
        .replace(/[\\`*[\]<]/g, "\\$&")
        .replace(/_/g, function (match, offset, source) {
            const intraword = /[A-Za-z0-9]/.test(source.charAt(offset - 1)) && /[A-Za-z0-9]/.test(source.charAt(offset + 1));
            return intraword ? match : "\\_";
        });
}

// Wraps inline Markdown in emphasis markers, keeping surrounding spaces outside the markers.
function emphasizeMarkdown(text, marker) {
    const match = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
    return match[2] ? match[1] + marker + match[2] + marker + match[3] : text;
}

function markdownInline(node, context) {
    if (node.nodeType === Node.TEXT_NODE) {
        return escapeMarkdownText(node.data.replace(/\s+/g, " "));
    }

    if (node.nodeType !== Node.ELEMENT_NODE || shouldSkipMarkdownNode(node)) {
        return "";
    }

    const tag = node.tagName.toLowerCase();

    switch (tag) {
        case "br":
            return "\n";
        case "strong":
        case "b":
            return context.strong ? inlineChildrenMarkdown(node, context) : emphasizeMarkdown(inlineChildrenMarkdown(node, Object.assign({}, context, { strong: true })), "**");
        case "em":
        case "i":
        case "cite":
            return context.emphasis ? inlineChildrenMarkdown(node, context) : emphasizeMarkdown(inlineChildrenMarkdown(node, Object.assign({}, context, { emphasis: true })), "*");
        case "del":
        case "s":
        case "strike":
            return emphasizeMarkdown(inlineChildrenMarkdown(node, context), "~~");
        case "code":
        case "kbd":
        case "samp":
        case "tt":
            return codeSpanMarkdown(node.textContent);
        case "a":
            return linkMarkdown(node, context);
        case "img":
            return imageMarkdown(node);
        case "iframe":
        case "video":
        case "audio":
        case "embed":
        case "object":
            return mediaMarkdown(node, context);
        default:
            return inlineChildrenMarkdown(node, context);
    }
}

function codeSpanMarkdown(text) {
    const code = text.replace(/\s+/g, " ");
    if (!code.trim()) {
        return "";
    }

    const longestRun = Math.max(0, ...(code.match(/`+/g) || []).map(function (run) {
        return run.length;
    }));
    const fence = "`".repeat(longestRun + 1);
    const padding = /^`|`$/.test(code) || (/^ /.test(code) && / $/.test(code)) ? " " : "";
    return fence + padding + code + padding + fence;
}

function linkMarkdown(link, context) {
    const text = context.inLink ? "" : inlineChildrenMarkdown(link, Object.assign({}, context, { inLink: true })).replace(/\s*\n\s*/g, " ").trim();
    const url = resolveMarkdownUrl(link.getAttribute("href"));

    if (!url || context.inLink) {
        return text;
    }

    if (!text || link.textContent.trim() === url) {
        return "<" + url + ">";
    }

    return "[" + text + "](" + formatMarkdownUrl(url) + ")";
}

function imageMarkdown(image) {
    const alt = image.getAttribute("alt");
    const url = resolveMarkdownUrl(image.getAttribute("src"));
    if (!url || alt === "") {
        return "";
    }

    return "![" + escapeMarkdownText((alt || "").replace(/\s+/g, " ").trim()) + "](" + formatMarkdownUrl(url) + ")";
}

// Embedded players become a plain link unless the page already links to the same media.
function mediaMarkdown(node, context) {
    const source = node.getAttribute("src") || node.getAttribute("data") || (node.querySelector("source[src]") || { getAttribute: function () { return ""; } }).getAttribute("src");
    let url = resolveMarkdownUrl(source);
    if (!url) {
        return "";
    }

    const youtube = url.match(/^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/);
    if (youtube) {
        url = "https://www.youtube.com/watch?v=" + youtube[1];
    }

    if (context.linkedUrls.has(url)) {
        return "";
    }

    const title = (node.getAttribute("title") || node.getAttribute("aria-label") || "Embedded media").replace(/\s+/g, " ").trim();
    return "[" + escapeMarkdownText("Video: " + title) + "](" + formatMarkdownUrl(url) + ")";
}

// Reads <pre> text verbatim (keeping indentation) and picks a fence longer than any backtick run inside.
function codeFenceMarkdown(pre) {
    let text = "";
    (function collect(node) {
        node.childNodes.forEach(function (child) {
            if (child.nodeType === Node.TEXT_NODE) {
                text += child.data;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                if (child.tagName.toLowerCase() === "br") {
                    text += "\n";
                } else {
                    collect(child);
                }
            }
        });
    })(pre);

    text = text.replace(/\r\n?/g, "\n").replace(/^(?:[ \t]*\n)+/, "").replace(/\s+$/, "");

    const code = pre.querySelector("code");
    const languageMatch = ((code && code.className) + " " + pre.className).match(/(?:^|\s)lang(?:uage)?-([\w+#.-]+)/);
    const longestRun = Math.max(0, ...(text.match(/`+/g) || []).map(function (run) {
        return run.length;
    }));
    const fence = "`".repeat(Math.max(3, longestRun + 1));

    return fence + (languageMatch ? languageMatch[1] : "") + "\n" + text + "\n" + fence;
}

function listMarkdown(list, context) {
    const ordered = list.tagName.toLowerCase() === "ol";
    const start = parseInt(list.getAttribute("start"), 10);
    let number = isNaN(start) ? 1 : start;

    return Array.from(list.children).filter(function (item) {
        return item.tagName.toLowerCase() === "li" && !shouldSkipMarkdownNode(item);
    }).map(function (item) {
        const value = parseInt(item.getAttribute("value"), 10);
        if (ordered && !isNaN(value)) {
            number = value;
        }

        const marker = ordered ? number++ + ". " : "- ";
        const indent = " ".repeat(marker.length);
        const blocks = markdownBlocks(item, context);
        const body = blocks.reduce(function (result, block, index) {
            if (index === 0) {
                return block.text;
            }
            return result + (block.type === "list" ? "\n" : "\n\n") + block.text;
        }, "");

        return (marker + body.split("\n").map(function (line, index) {
            return index === 0 || !line ? line : indent + line;
        }).join("\n")).trimEnd();
    }).join("\n");
}

function tableMarkdown(table, context) {
    const cellContext = Object.assign({}, context, { inTable: true });
    const rows = Array.from(table.rows).filter(function (row) {
        return !shouldSkipMarkdownNode(row);
    }).map(function (row) {
        const cells = [];
        Array.from(row.cells).forEach(function (cell) {
            cells.push(tableCellMarkdown(cell, cellContext));
            for (let span = 1; span < cell.colSpan; span++) {
                cells.push("");
            }
        });
        return cells;
    });

    if (!rows.length) {
        return [];
    }

    const columnCount = Math.max.apply(null, rows.map(function (row) {
        return row.length;
    }));
    const formatRow = function (cells) {
        const padded = cells.concat(Array(columnCount - cells.length).fill(""));
        return "| " + padded.join(" | ") + " |";
    };

    const lines = [formatRow(rows[0]), formatRow(Array(columnCount).fill("---"))].concat(rows.slice(1).map(formatRow));
    const blocks = [];
    if (table.caption && !shouldSkipMarkdownNode(table.caption)) {
        const caption = inlineMarkdownOf(table.caption, context);
        if (caption) {
            blocks.push({ type: "paragraph", text: emphasizeMarkdown(caption, "*") });
        }
    }
    blocks.push({ type: "table", text: lines.join("\n") });
    return blocks;
}

function tableCellMarkdown(cell, context) {
    return markdownBlocks(cell, context).map(function (block) {
        return block.text;
    }).join("<br>").replace(/\n/g, "<br>").replace(/\|/g, "\\|");
}

document.addEventListener("click", function (event) {
    if (menuIsOpen) {
        const target = event.target;
        const leftSidebar = document.querySelector(".left-sidebar");
        if (target.id !== "navButton" && leftSidebar && !leftSidebar.contains(target)) {
            toggleNav();
        }
    }
});
