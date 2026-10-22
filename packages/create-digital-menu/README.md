# create-digital-menu

Scaffold a digital menu storefront in one command: Astro 7, Tailwind v4, typed
data contract (Zod), cart/WhatsApp checkout, and a smoke-test gate.

## Usage

```bash
npm create digital-menu [dir]
```

Examples:

```bash
npm create digital-menu            # current directory (must be empty)
npm create digital-menu my-menu    # ./my-menu
```

Options:

| Option | Description |
| --- | --- |
| `--upstream <url>` | Git URL registered as the `upstream` remote (template origin for updates) |
| `--no-git` | Skip `git init` and the initial commit |
| `-h`, `--help` | Show help |

## What you get

- `template/` copied verbatim into your directory — pages, storefront domain code, fixtures, docs
- `package.json` renamed after your folder
- `.template.json` provenance record (template name + version)
- `git init` + initial commit, plus an `upstream` remote when the template URL is known

## After scaffolding

```bash
cd my-menu
pnpm install
pnpm dev
```

1. Set your brand: `src/styles/tokens.css` (colors + fonts)
2. Set your data: `src/data/api/*.json` (name, phone, menu, gallery)
3. Read `doc/template-guide.md` — which files are yours, which are template core

## Updates

```bash
git fetch upstream
git merge upstream/vX.Y.Z
```

Protected app-zone files (`src/data/api/**`, `src/styles/tokens.css`,
`scripts/smoke-data.json`, `public/**`) are marked `merge=ours` in
`.gitattributes` — your content wins during merges.

## Requirements

- Node >= 20
