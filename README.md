# DwemerDynamics

Guide-first website for Dwemer Dynamics projects, covering CHIM, STOBE, and Dialectic.

## KAGRENAC AI Mod Maker Guide

`custom-mods/` is the author guide for KAGRENAC AI Mod Maker, a toolkit for authoring AI NPC mods from the public [Kagrenac](https://github.com/Dwemer-Dynamics/Kagrenac) repository: the KagrenacServer component at the repository root and the KagrenacClient console client in `client/`. The folder name stays `custom-mods/` so existing links keep working. Its pages share `css/custom-mods.css` and the `customMods` sidebar in `js/javascript.js`, selected by the `custom-mods-theme` body class. The repository holds the canonical reference docs, including `docs/getting-started.md` and the staged porting kit (`docs/agent-playbook.md`, `docs/engine-packs/ENGINE_PACK.md`, `docs/feature-recipes/PORT_RECIPES.md`); keep these pages task-focused and link to them.

## Other Projects

`other-projects/` is a small guide for modding tools and experiments outside the AI game mods, linked from the homepage. `index.html` is the overview and each project has its own page, such as `kosmokrator.html`. The pages share the `otherProjects` sidebar in `js/javascript.js`, selected by the `other-projects-theme` body class. Their styles live in `css/other-projects.css`, scoped to that class because the homepage also loads the file for its Other Projects panel. Each project's own README is the reference for setup; keep these pages short and link to it.

## Local Development

Start a simple local server from the repo root:

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

This repo is configured to deploy the site from the repository root through GitHub Actions.

In the repository Pages settings, set the source to `GitHub Actions`.

The deploy workflow publishes:

- `index.html`
- `chim/`
- `custom-mods/`
- `dialectic/`
- `other-projects/`
- `stobe/`
- `css/`
- `font/`
- `img/`
- `js/`
- `styles.css`
- `CNAME`
- `.nojekyll`

## Attribution

This site rebuild used [ModdingLinked/ModdingLinked](https://github.com/ModdingLinked/ModdingLinked) as a structural and styling reference while adapting the site for Dwemer Dynamics content, branding, and page layout.

ModdingLinked is MIT-licensed. Attribution and license notice for that upstream reference are included in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
