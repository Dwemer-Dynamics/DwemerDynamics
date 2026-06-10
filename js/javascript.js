var menuIsOpen = false;

const leftSidebarConfigs = {
    chim: {
        pageLinks: [
            { href: "../index.html", title: "Home", label: "Home", emoji: "\u21A9\uFE0F" },
            { href: "./index.html", title: "Overview", label: "Overview", emoji: "\uD83D\uDCD6" },
            { href: "./installation.html", title: "Installation", label: "Installation", emoji: "\u2699\uFE0F" },
            { href: "./configuration.html", title: "Configuration", label: "Configuration", emoji: "\uD83D\uDD27" },
            { href: "./roleplay-settings.html", title: "Roleplay Settings", label: "Roleplay Settings", emoji: "\uD83C\uDFAD" },
            { href: "./ingame-settings.html", title: "Skyrim Settings", label: "Skyrim Settings", emoji: "\uD83C\uDFAE" },
            { href: "./llm.html", title: "Large Language Models", label: "Large Language Models", emoji: "\uD83E\uDDE0" },
            { href: "./tts.html", title: "Text-to-Speech", label: "Text-to-Speech", emoji: "\uD83D\uDD0A" },
            { href: "./stt.html", title: "Speech-to-Text", label: "Speech-to-Text", emoji: "\uD83C\uDFA4" },
            { href: "./itt.html", title: "Image-to-Text", label: "Image-to-Text", emoji: "\uD83D\uDCF8" },
            { href: "./plugins.html", title: "Plugins", label: "Plugins", emoji: "\uD83E\uDDE9" },
            { href: "./modders-guide.html", title: "Modders Guide", label: "Modders Guide", emoji: "\uD83D\uDCDC" },
            { href: "./faq.html", title: "FAQ", label: "FAQ", emoji: "\u2753" },
            { href: "./remote-hosting-guide.html", title: "Remote Hosting Guide", label: "Remote Hosting Guide", emoji: "\uD83C\uDF10" },
            { href: "./linux-setup-guide.html", title: "Linux Setup Guide", label: "Linux Setup Guide", emoji: "\uD83D\uDC27" },
            { href: "./log-files-and-debugging.html", title: "Log Files", label: "Log Files", emoji: "\uD83D\uDCC4" }
        ],
        bottomLinks: [
            { href: "https://www.nexusmods.com/skyrimspecialedition/mods/126330?tab=files", title: "Download", label: "Download", emoji: "\u2B07\uFE0F" },
            { href: "https://www.youtube.com/watch?v=M8nlRFiAxJA", title: "Video Guide", label: "Video Guide", emoji: "\uD83C\uDFA5" },
            { href: "https://discord.gg/NDn9qud2ug", title: "Discord", label: "Discord", icon: "../img/discord.png" },
            { href: "https://www.youtube.com/@DwemerDynamics", title: "YouTube", label: "YouTube", icon: "../img/youtube.png" },
            { href: "https://www.patreon.com/DwemerDynamics", title: "Patreon", label: "Patreon", icon: "../img/patreon.png" }
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
            { href: "./tts.html", title: "Text-to-Speech", label: "Text-to-Speech", emoji: "\uD83D\uDD0A" },
            { href: "./modders-guide.html", title: "Modders Guide", label: "Modders Guide", emoji: "\uD83D\uDCDC" },
            { href: "./faq.html", title: "FAQ", label: "FAQ", emoji: "\u2753" },
            { href: "./remote-hosting-guide.html", title: "Remote Hosting Guide", label: "Remote Hosting Guide", emoji: "\uD83C\uDF10" },
            { href: "./linux-setup-guide.html", title: "Linux Setup Guide", label: "Linux Setup Guide", emoji: "\uD83D\uDC27" },
            { href: "./log-files-and-debugging.html", title: "Log Files", label: "Log Files", emoji: "\uD83D\uDCC4" }
        ],
        bottomLinks: [
            { href: "https://www.nexusmods.com/kenshi/mods/1891?tab=files", title: "Download", label: "Download", emoji: "\u2B07\uFE0F" },
            { href: "https://www.youtube.com/watch?v=vfhvblyOvqU", title: "Video Guide", label: "Video Guide", emoji: "\uD83C\uDFA5" },
            { href: "https://discord.gg/NDn9qud2ug", title: "Discord", label: "Discord", icon: "../img/discord.png" },
            { href: "https://www.youtube.com/@DwemerDynamics", title: "YouTube", label: "YouTube", icon: "../img/youtube.png" },
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
    if (document.body.classList.contains("chim-theme")) {
        return leftSidebarConfigs.chim;
    }

    if (document.body.classList.contains("stobe-theme")) {
        return leftSidebarConfigs.stobe;
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

document.addEventListener("click", function (event) {
    if (menuIsOpen) {
        const target = event.target;
        const leftSidebar = document.querySelector(".left-sidebar");
        if (target.id !== "navButton" && leftSidebar && !leftSidebar.contains(target)) {
            toggleNav();
        }
    }
});
