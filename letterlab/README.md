# LetterLab V3

This is a direct source revision of the actual V2 AI Studio project, exported through its visible code editor. V2 is preserved separately. V3 was applied back to AI Studio by manual editor changes because the build model's daily generation quota had been reached. It is not presented as a third successful AI Studio generation run.

## Changes

- Reference knowledge starts empty; reset clears knowledge, facts, draft, errors, retry input and child editor state.
- Course codes and action commitments are included only when explicitly supplied.
- One shared whitespace-based body word counter is used across the API response, chat, facts, draft editor and transcript. Subject, greeting and sign-off are excluded.
- Model-provided counts are recomputed, without silently truncating over-limit text.
- Non-JSON route errors are distinguished from an assumed missing API key.

## Verification

The saved project loaded in AI Studio preview. Empty reference and reset behavior were tested in that UI. The deterministic helper tests run with Node 24:

```sh
node --test tests/word-count.test.mjs
```

For a separate local setup, install the package dependencies, supply your own GEMINI_API_KEY through the environment, then use the package's dev/build/lint scripts. No live key, .env secret or node_modules is included. For the Week 3 deployment adaptation, dependencies were installed and the production frontend build, TypeScript check and three helper tests passed locally on 5 November 2026. AI Studio model-response tests are separate from live deployment tests. Peer testing remains pending.

## Vercel Hobby deployment

Use Root Directory `letterlab`. The frontend uses `/api/chat`; `api/chat.ts` runs Gemini server-side. Set `GEMINI_API_KEY` only in Vercel environment settings and redeploy. `/api/health` reports whether a key is configured without returning its value. Missing-key errors remain visible. `local-server.ts` is for local development only. Use a key on a free-tier project; do not enable billing to bypass a quota failure.
