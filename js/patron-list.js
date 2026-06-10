(async () => {
    const track = document.getElementById("patronListTrack");
    const shell = document.querySelector(".patron-shell");
    const scroll = document.querySelector(".patron-list-scroll");
    const header = document.querySelector(".header");
    const footer = document.querySelector(".hubFooter");
    const pageLayout = document.querySelector(".hubPageLayout");

    if (!track || !shell || !scroll || !header || !footer || !pageLayout) {
        return;
    }

    const syncPatronShellLayout = () => {
        const headerRect = header.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        const layoutRect = pageLayout.getBoundingClientRect();

        const docTop = window.scrollY + headerRect.bottom + 10;
        const footerTop = window.scrollY + footerRect.top - 6;
        const layoutTop = window.scrollY + layoutRect.top;
        const relativeTop = Math.max(0, docTop - layoutTop);
        const availableHeight = Math.max(160, footerTop - docTop);

        shell.style.top = `${relativeTop}px`;
        shell.style.height = `${availableHeight}px`;
    };

    const schedulePatronShellLayout = () => {
        syncPatronShellLayout();
    };

    window.addEventListener("resize", schedulePatronShellLayout, { passive: true });
    window.addEventListener("scroll", schedulePatronShellLayout, { passive: true });

    const tierOrder = ["Gold", "Silver", "Bronze"];
    const tierDisplayLabels = {
        Gold: "HURASUM",
        Silver: "SARPU",
        Bronze: "SIPARRU"
    };
    const tierIconPaths = {
        Gold: "./img/centurioncore.png",
        Silver: "./img/dwemergyro.png",
        Bronze: "./img/dwemerpuzzlebox.png"
    };
    const tierRank = {
        Bronze: 1,
        Silver: 2,
        Gold: 3
    };

    const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

    const classifyTier = (tierTitle) => {
        const normalizedTier = normalizeText(tierTitle).toLowerCase();
        if (normalizedTier.includes("gold")) {
            return "Gold";
        }
        if (normalizedTier.includes("silver")) {
            return "Silver";
        }
        return "Bronze";
    };

    const extractMember = (member) => {
        let name = "";
        let tier = "";

        if (member && typeof member === "object" && !Array.isArray(member)) {
            name = normalizeText(member.name);
            tier = normalizeText(member.tier);
        } else if (typeof member === "string") {
            const rawMember = normalizeText(member);
            if (rawMember !== "") {
                const separatorAt = rawMember.lastIndexOf(" - ");
                if (separatorAt !== -1) {
                    name = normalizeText(rawMember.slice(0, separatorAt));
                    tier = normalizeText(rawMember.slice(separatorAt + 3));
                }
                if (name === "") {
                    name = rawMember;
                }
            }
        }

        return { name, tier };
    };

    const buildTierSection = (tierLabel, names) => {
        const section = document.createElement("section");
        section.className = `patron-tier-group patron-tier-${tierLabel.toLowerCase()}`;
        section.setAttribute("aria-label", `${tierDisplayLabels[tierLabel]} tier members`);

        const title = document.createElement("h3");
        title.className = "patron-tier-title";

        const icon = document.createElement("img");
        icon.className = "patron-tier-icon";
        icon.src = tierIconPaths[tierLabel];
        icon.alt = `${tierDisplayLabels[tierLabel]} icon`;
        title.appendChild(icon);

        const label = document.createElement("span");
        label.className = "patron-tier-title-label";
        label.textContent = tierDisplayLabels[tierLabel];
        title.appendChild(label);
        section.appendChild(title);

        if (names.length === 0) {
            const empty = document.createElement("p");
            empty.className = "patron-tier-empty";
            empty.textContent = "None";
            section.appendChild(empty);
            return section;
        }

        const list = document.createElement("ul");
        list.className = "patron-list";
        names.forEach((name) => {
            const item = document.createElement("li");
            item.className = "patron-list-item";
            item.textContent = name;
            list.appendChild(item);
        });
        section.appendChild(list);

        return section;
    };

    try {
        const response = await fetch("./data/patron_members.generated.json");
        if (!response.ok) {
            throw new Error(`Failed to load patron data (${response.status})`);
        }

        const payload = await response.json();
        const rawMembers = Array.isArray(payload.members) ? payload.members : [];
        const bestTierByName = new Map();

        rawMembers.forEach((rawMember) => {
            const parsed = extractMember(rawMember);
            if (parsed.name === "") {
                return;
            }

            const classifiedTier = parsed.tier === "" ? "Bronze" : classifyTier(parsed.tier);
            const existingTier = bestTierByName.get(parsed.name);
            if (!existingTier || tierRank[classifiedTier] > tierRank[existingTier]) {
                bestTierByName.set(parsed.name, classifiedTier);
            }
        });

        const tierMembers = {
            Gold: [],
            Silver: [],
            Bronze: []
        };

        for (const [name, tier] of bestTierByName.entries()) {
            tierMembers[tier].push(name);
        }

        tierOrder.forEach((tier) => {
            tierMembers[tier].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
        });

        const activeCount = tierOrder.reduce((count, tier) => count + tierMembers[tier].length, 0);
        if (activeCount === 0) {
            const empty = document.createElement("p");
            empty.className = "patron-empty";
            empty.textContent = "No Patreon members found yet.";
            track.replaceChildren(empty);
            return;
        }

        const duration = Math.max(100, Math.min(350, Math.round((activeCount * 5) / 1.2)));
        track.style.animationDuration = `${duration}s`;

        const fragment = document.createDocumentFragment();
        for (let cycleIndex = 0; cycleIndex < 2; cycleIndex += 1) {
            const cycle = document.createElement("div");
            cycle.className = "patron-list-cycle";
            if (cycleIndex === 1) {
                cycle.setAttribute("aria-hidden", "true");
            }

            tierOrder.forEach((tier) => {
                cycle.appendChild(buildTierSection(tier, tierMembers[tier]));
            });

            fragment.appendChild(cycle);
        }

        track.replaceChildren(fragment);
        syncPatronShellLayout();
    } catch (error) {
        const empty = document.createElement("p");
        empty.className = "patron-empty";
        empty.textContent = "Patreon members unavailable right now.";
        track.replaceChildren(empty);
        console.error(error);
        syncPatronShellLayout();
    }

    window.setTimeout(syncPatronShellLayout, 50);
    window.setTimeout(syncPatronShellLayout, 250);
    window.setTimeout(syncPatronShellLayout, 600);
})();
