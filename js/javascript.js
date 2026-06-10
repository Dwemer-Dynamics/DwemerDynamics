var menuIsOpen = false;

const leftSidebarConfigs = {
    chim: {
        pageLinks: [
            { href: "../index.html", title: "Dwemer Dynamics Home", label: "Dwemer Dynamics Home" },
            { href: "./index.html", title: "Overview", label: "Overview" },
            { href: "./installation.html", title: "Installation", label: "Installation" },
            { href: "./configuration.html", title: "Configuration", label: "Configuration" },
            { href: "./roleplay-settings.html", title: "Roleplay Settings", label: "Roleplay Settings" },
            { href: "./ingame-settings.html", title: "Skyrim Settings", label: "Skyrim Settings" },
            { href: "./llm.html", title: "Large Language Models", label: "Large Language Models" },
            { href: "./tts.html", title: "Text-to-Speech", label: "Text-to-Speech" },
            { href: "./stt.html", title: "Speech-to-Text", label: "Speech-to-Text" },
            { href: "./itt.html", title: "Image-to-Text", label: "Image-to-Text" },
            { href: "./plugins.html", title: "Plugins", label: "Plugins" },
            { href: "./modders-guide.html", title: "Modders Guide", label: "Modders Guide" },
            { href: "./faq.html", title: "FAQ", label: "FAQ" },
            { href: "./remote-hosting-guide.html", title: "Remote Hosting Guide", label: "Remote Hosting Guide" },
            { href: "./linux-setup-guide.html", title: "Linux Setup Guide", label: "Linux Setup Guide" },
            { href: "./log-files-and-debugging.html", title: "Log Files", label: "Log Files" }
        ],
        bottomLinks: [
            { href: "https://www.nexusmods.com/skyrimspecialedition/mods/126330?tab=files", title: "Download", label: "Download" },
            { href: "https://www.youtube.com/watch?v=M8nlRFiAxJA", title: "Video Guide", label: "Video Guide" },
            { href: "https://discord.gg/NDn9qud2ug", title: "Discord", label: "Discord" },
            { href: "https://www.youtube.com/@DwemerDynamics", title: "YouTube", label: "YouTube" },
            { href: "https://www.patreon.com/DwemerDynamics", title: "Patreon", label: "Patreon" }
        ]
    },
    stobe: {
        pageLinks: [
            { href: "../index.html", title: "Dwemer Dynamics Home", label: "Dwemer Dynamics Home" },
            { href: "./index.html", title: "Overview", label: "Overview" },
            { href: "./installation.html", title: "Installation", label: "Installation" },
            { href: "./configuration.html", title: "Configuration", label: "Configuration" },
            { href: "./roleplay-settings.html", title: "Roleplay Settings", label: "Roleplay Settings" },
            { href: "./ingame-settings.html", title: "Kenshi Settings", label: "Kenshi Settings" },
            { href: "./llm.html", title: "Large Language Models", label: "Large Language Models" },
            { href: "./tts.html", title: "Text-to-Speech", label: "Text-to-Speech" },
            { href: "./modders-guide.html", title: "Modders Guide", label: "Modders Guide" },
            { href: "./faq.html", title: "FAQ", label: "FAQ" },
            { href: "./remote-hosting-guide.html", title: "Remote Hosting Guide", label: "Remote Hosting Guide" },
            { href: "./linux-setup-guide.html", title: "Linux Setup Guide", label: "Linux Setup Guide" },
            { href: "./log-files-and-debugging.html", title: "Log Files", label: "Log Files" }
        ],
        bottomLinks: [
            { href: "https://www.nexusmods.com/kenshi/mods/1891?tab=files", title: "Download", label: "Download" },
            { href: "https://www.youtube.com/watch?v=vfhvblyOvqU", title: "Video Guide", label: "Video Guide" },
            { href: "https://discord.gg/NDn9qud2ug", title: "Discord", label: "Discord" },
            { href: "https://www.youtube.com/@DwemerDynamics", title: "YouTube", label: "YouTube" },
            { href: "https://www.patreon.com/DwemerDynamics", title: "Patreon", label: "Patreon" }
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
        link.textContent = linkConfig.label;

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
