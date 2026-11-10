# DwemerDynamics

Guide-first website for Dwemer Dynamics projects, covering CHIM, STOBE, and Dialectic.

## KAGRENAC AI Mod Maker Guide

`custom-mods/` is the author guide for KAGRENAC AI Mod Maker, a toolkit for authoring AI NPC mods from the public [Kagrenac](https://github.com/Dwemer-Dynamics/Kagrenac) repository: the KagrenacServer component at the repository root and the KagrenacClient console client in `client/`. The folder name stays `custom-mods/` so existing links keep working. Its pages share `css/custom-mods.css` and the `customMods` sidebar in `js/javascript.js`, selected by the `custom-mods-theme` body class. The repository holds the canonical reference docs, including `docs/getting-started.md` and the staged porting kit (`docs/agent-playbook.md`, `docs/engine-packs/ENGINE_PACK.md`, `docs/feature-recipes/PORT_RECIPES.md`); keep these pages task-focused and link to them.

## Other Projects

`other-projects/` is a small guide for modding tools and experiments outside the AI game mods, linked from the homepage. `index.html` is the overview and each project has its own page, such as `kosmokrator.html`. The pages share the `otherProjects` sidebar in `js/javascript.js`, selected by the `other-projects-theme` body class. Their styles live in `css/other-projects.css`, scoped to that class because the homepage also loads the file for its Other Projects panel. Each project's own README is the reference for setup; keep these pages short and link to it.

## Clean URLs and Build

Pages are authored as plain HTML in place (`chim/installation.html`). `build_site.py` (Python 3, standard library only) builds the deployable site into `_site/`:

- each page is written to a clean directory URL: `/`, `/chim/`, `/chim/installation/`
- internal `href`/`src` values are rewritten to root-relative clean paths, and each page gets a clean canonical link
- every old `.html` address keeps a small page that forwards to the clean URL, keeping the query and hash (a client-side redirect, not an HTTP 301)
- explicit `index.html` visits are tidied to the directory URL in the address bar
- the build fails if an internal link or asset does not resolve

Authored links can stay relative (`./faq.html`, `../css/guide.css`); root-relative and already-clean links also work. The builder only replaces an output folder that is empty or carries its `.dwemer-site-build` marker. Navigation scripts receive content-based cache versions.

## Local Development

Build and serve `_site/` from the repo root:

```bat
start_server.bat
```

or:

```bash
./start_server.sh
```

Then open:

```text
http://127.0.0.1:8000/
```

## GitHub Pages

The deploy workflow runs `python3 build_site.py` and publishes `_site/`. In the repository Pages settings, set the source to `GitHub Actions`. The published folders and files are listed in `ENTRIES` in `build_site.py`.

## Attribution

This site rebuild used [ModdingLinked/ModdingLinked](https://github.com/ModdingLinked/ModdingLinked) as a structural and styling reference while adapting the site for Dwemer Dynamics content, branding, and page layout.

ModdingLinked is MIT-licensed. Attribution and license notice for that upstream reference are included in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
