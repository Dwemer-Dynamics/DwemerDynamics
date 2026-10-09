# DwemerDynamics

Guide-first website for Dwemer Dynamics projects, covering CHIM, STOBE, and Dialectic.

## Custom Mod Guide

`custom-mods/` is the author guide for building a mod from the public ExampleServer and ExampleMod templates. Its pages share `css/custom-mods.css` and the `customMods` sidebar in `js/javascript.js`, selected by the `custom-mods-theme` body class. The template repositories hold the canonical reference docs; keep these pages task-focused and link to them.

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
