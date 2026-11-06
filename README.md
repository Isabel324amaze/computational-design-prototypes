# Computational Design prototypes — Yexuan Fu

Two workshop prototypes prepared for public deployment on Vercel Hobby.

- `camera-obscura/`: interactive pinhole-camera geometry; no API key.
- `letterlab/`: grounded academic-email assistant; server-side Gemini API only.

Import this repository twice in Vercel. Set each project’s Root Directory to its corresponding folder. Node 24 and pnpm are specified in each package. Keep the Hobby plan; do not enable paid services. LetterLab requires an independently available free-tier Gemini key configured as `GEMINI_API_KEY` in Vercel environment settings; never commit a real key.

## Validation

Both production front-end builds and TypeScript checks passed locally on 5 November 2026. LetterLab’s three deterministic word-count tests passed. Model-response evidence from AI Studio is distinct from public-deployment testing. Peer testing remains pending and is not represented as completed.

These are educational prototypes. LetterLab drafts text for human review and cannot send emails. A system instruction reduces but does not guarantee absence of invented details.
