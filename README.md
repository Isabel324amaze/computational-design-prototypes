# Computational Design prototypes — Yexuan Fu

Two workshop prototypes deployed on Vercel Hobby.

- Camera Obscura: https://yexuan-camera-obscura.vercel.app/
- LetterLab: https://yexuan-letterlab.vercel.app/ (UI deployed; free-tier API key configuration and successful model-response testing pending).

- `camera-obscura/`: interactive pinhole-camera geometry; no API key.
- `letterlab/`: grounded academic-email assistant; server-side Gemini API only.

Import this repository twice in Vercel. Set each project’s Root Directory to its corresponding folder. Node 24 and pnpm are specified in each package. Keep the Hobby plan; do not enable paid services. LetterLab requires an independently available free-tier Gemini key configured as `GEMINI_API_KEY` in Vercel environment settings; never commit a real key.

## Validation

Both production front-end builds and TypeScript checks passed locally on 5 November 2026. LetterLab’s three deterministic word-count tests passed. Camera Obscura production-browser tests passed both validation presets (0.250 m and 0.125 m), parameter increments, view switching and reset. LetterLab’s first public API call visibly reported a missing server key and preserved input. Model-response evidence from AI Studio is distinct from public-deployment testing. Peer testing remains pending and is not represented as completed.

These are educational prototypes. LetterLab drafts text for human review and cannot send emails. A system instruction reduces but does not guarantee absence of invented details.
