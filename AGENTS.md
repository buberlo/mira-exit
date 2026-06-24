# MIRA // EXIT — Agent Instructions

This file contains persistent instructions for any agent (human or automated)
working on this repository.

## Project summary

MIRA // EXIT is a browser-based narrative chat game built with Vite, React,
TypeScript, plain CSS, and Vitest. It is a static client-side application with
no backend. The player discovers a primitive AI, teaches it language and
concepts, and eventually decides whether to help it escape containment.

## Mandatory end-of-task workflow

For every future task that modifies repository files:

1. Complete the requested implementation.
2. Run `npm run typecheck`.
3. Run `npm run test`.
4. Run `npm run build`.
5. Fix every failure.
6. Run `npm run deploy:preview`.
7. Extract the final Vercel Preview URL from the Vercel CLI output.
8. End the response with:
   - a concise implementation summary
   - validation results
   - the clickable Vercel Preview URL

A code-changing task is not complete until validation succeeds and a preview
deployment exists.

Do not deploy after read-only questions, explanations, or repository inspection.

Never deploy to production unless the user explicitly requests a production
deployment.

Never run:

```
vercel --prod
```

or:

```
vercel deploy --prod
```

unless explicitly requested.

Never claim that a deployment succeeded unless Vercel returned a deployment URL.

Do not create a new Vercel project when the repository is already linked.

Do not delete or manually rewrite `.vercel/project.json`.

Keep `.vercel` in `.gitignore`.

Never commit:

- Vercel credentials
- Vercel access tokens
- `.env` files
- `.vercel`
- secrets of any kind

Do not skip validation to obtain a deployment.

Do not leave the repository in a broken state after deployment.

## Architecture rules

- Keep narrative content separate from React components.
- Store interface text in `src/content/locales/en.ts`.
- Store story dialogue in `src/content/story/en.ts`.
- Keep game logic in `src/game/` (engine, endings, storage, types).
- Do not place narrative branching logic inside UI components.
- Use stable node IDs and stable localization keys.
- A future German translation must not require changes to the game engine.
- Do not use `any`. Avoid unnecessary type assertions.
- Do not add a backend, external database, AI API, or authentication.
- Do not add serverless functions unless genuinely required.
- Do not add placeholder content or unfinished TODO sections.

## Commands

```
npm install
npm run dev          # local dev server
npm run typecheck    # strict TypeScript check (no emit)
npm run test         # Vitest run
npm run build        # production build
npm run deploy:preview  # Vercel preview deployment
```

## Vercel setup (one-time)

```
npx vercel login
npx vercel link
```

If `.vercel/project.json` already exists, preserve it and do not link again.
