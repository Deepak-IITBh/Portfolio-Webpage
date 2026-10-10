# Portfolio-Webpage — Deepak, AI / Machine Learning Engineer

Personal portfolio built with **React 18 + TypeScript + Vite**. Dark by default (lamp-amber accent), light mode on a toggle.

## Highlights

- **Ask-my-work search:** a BM25 retriever over everything on the page, running entirely in the browser (hero map + `Ctrl K` palette). No API key involved.
- **Five engineering case studies** with replayable visuals, an interactive DPR benchmark, an architecture-diagram tab and a full write-up modal each.
- **Capability evidence matrix**, experience timeline, contact form that emails you via Resend.
- Accessible (axe-clean in both themes), responsive from 320px, fast (no animation or icon libraries; ~80 KB gzipped JS).

## Develop

```bash
npm install
cp .env.example .env   # add RESEND_API_KEY to test the contact form locally
npm run dev            # http://localhost:5173 (the contact API runs as a dev-server middleware)
npm run build          # type-check + production build to dist/
npm start              # serve dist/ + /api/contact (reads .env if present)
npm run lint
npm run email:test     # send one real test email through Resend using .env
```

Node 22.9+ is required (`--env-file-if-exists`).

## Structure

```
index.html            SEO / Open Graph / JSON-LD, theme init (no flash)
server/
  contact.mjs         POST /api/contact: validation, honeypot, rate limit, Resend (shared by dev + production)
  index.mjs           production server: serves dist/ and the contact API
src/
  data/site.ts        profile, experience, capability matrix  (edit content here)
  data/projects.ts    case studies, pipelines, metrics (each cites its source), DPR benchmark
  lib/                BM25 retriever, search corpus + work-map layout, navigation helper
  components/         Nav, Hero, Ask, Console, Palette, Work, Stage, Benchmark, Pipeline, CaseSheet,
                      Experience, Capabilities, About, Contact, Footer
  styles/             global tokens (dark/light) + one stylesheet per component
public/               resume + certificate PDFs, Open Graph image, favicon, robots.txt
```

## Contact form (Resend)

1. Create an API key at <https://resend.com/api-keys> and put it in `.env` as `RESEND_API_KEY` (never commit `.env`; it is git-ignored).
2. Optional: `CONTACT_TO_EMAIL` (default `deepakde@iitbhilai.ac.in`) and `CONTACT_FROM_EMAIL`. With the default test sender (`onboarding@resend.dev`) Resend only delivers to the address your Resend account was created with.
3. The key is read only by the server at runtime; it is never part of the browser bundle.

Protections: same-site check, size limits, field validation, honeypot, per-IP rate limit (5 / 10 min), HTML escaping, header-injection stripping, one idempotent retry on network errors, generic errors for visitors.

## Deploy

Needs a host that runs Node (the contact form is server-side), e.g. Render, Railway, Fly.io or a VPS.

- Build: `npm install && npm run build`
- Start: `npm start`
- Environment: `RESEND_API_KEY`, `SITE_URL=https://your-domain` (canonical + Open Graph URLs), optionally `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Render provides `PORT`.

Static-only hosts (GitHub Pages) can serve the pages but not the contact form.

## Notes

- `.bolt/` is the original Bolt scaffold config; it is unused by the build and was left in place.
- The earlier chatbot section (a Together AI call made from the browser with a hard-coded key) was removed: the key was exposed in the public bundle and Git history. **Revoke that Together API key** and replace it with the keyless search above.
