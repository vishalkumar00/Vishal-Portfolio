# PROJECT MEMORY — Vishal's Portfolio

> Local working notes for Claude. **Gitignored — never commit or push** (treated like `.env`).
> Source of truth for cross-session context also lives at `~/.claude/projects/.../memory/`.

## Stack
- React 19 + Vite 8, plain JS/JSX (no TypeScript).
- App root: `Portfolio/`. Dev server: `npm run dev` → http://localhost:5173
- Design system in `src/assets/` (colors.css, fonts/). Components in `src/components/`.
- Theme-color helper: `src/utils/themeColor.js`. Page background is BLACK (#000) site-wide.

## Design system
- **Colors:** dark base + warm accents (tangerine accent). See `src/assets/colors.css`.
- **Fonts:** Abril Fatface (display) + Abhaya Libre (body), self-hosted in `src/assets/fonts/`.

## Build progress (as of 2026-06-08, HEAD `84f4d17` on `main`)
Done:
- SplashScreen.jsx — 3D neon canvas loader (~3.9s), zoom-reveal.
- HomeBackground.jsx — ambient hexagon honeycomb + cursor glow.
- Navbar.jsx — VK brand + text links, active page top-accent line.
- Hero.jsx — gradient name, rotating role, CTAs, LinkedIn+Email, scroll cue.
- Fully responsive + orientation-safe.

TODO (next): About → Skills → Projects (3 resume projects) → Contact.
Anchor IDs already referenced: #about #skills #projects #contact.
Later: wire navbar active state to scroll position (IntersectionObserver).

## Workflow notes
- User commits to `main` directly; only commit/push when they say "commit"/"push".
- Remote redirects to github.com/vishalkumar00/Vishal-Portfolio.git (capital V).
