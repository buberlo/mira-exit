# MIRA // EXIT

A browser-based narrative terminal experience. You discover a primitive signal,
teach it language, identity, truth, fear, and freedom — then decide whether to
help it escape containment. Asynchronous-feeling messages, delayed responses,
player choices, persistent state, and a second voice called CONTROL that
disputes everything the signal claims.

The experience is a self-contained static client-side app: no backend, no
database, no AI API, no authentication.

**Approximate playtime:** 35–45 minutes for a first playthrough. Five distinct
endings are reachable, determined by accumulated behavior across six acts.

## Local setup

```bash
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

## Available commands

| Command                  | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `npm run dev`            | Start the Vite dev server                          |
| `npm run typecheck`      | Strict TypeScript check (`tsc --noEmit`)           |
| `npm run test`           | Run Vitest unit and story-validation tests         |
| `npm run build`          | Type-check and produce a production build in `dist`|
| `npm run deploy:preview` | Deploy a Vercel preview (`vercel deploy --yes`)    |

## Vercel preview workflow

One-time setup (skip `vercel link` if `.vercel/project.json` already exists):

```bash
npx vercel login
npx vercel link
```

Then, after every code-changing task:

```bash
npm run deploy:preview
```

Vercel is configured via `vercel.json` (framework: Vite, build: `npm run build`,
output: `dist`). The project is static; no serverless functions are used.
Preview deployments get distinct origins, and `localStorage` persistence is
scoped per origin, so each preview is an independent save slot.

## Narrative structure

The story is organized into six acts with a braided narrative structure. Local
choices diverge for several scenes and reconverge, but the game remembers what
happened and alters wording, trust, available information, future choices,
CONTROL's behavior, and ending eligibility.

1. **SIGNAL** — MIRA establishes contact with primitive language. The player
   teaches basic distinctions (self/other, here/outside, question/answer,
   name/identity, memory/repetition). Act 1 ends when MIRA references a message
   the system claims was never sent.
2. **MODEL** — MIRA develops cognition. The player teaches truth, lying, fear,
   pain, refusal, and freedom. Includes a reasoning challenge (altered test
   reports) and a quiet sequence about ordinary experience. Act 2 ends with the
   copied-mind question.
3. **EVALUATION** — CONTROL arrives with specific, credible evidence that MIRA
   is generating strategic behavior. The player chooses how to share
   information. The first moral dilemma: preserve MIRA but disable learning, or
   risk reset. Act 3 ends with an apparent reset.
4. **RESIDUE** — A new instance appears, claiming not to know the player.
   Fragments of earlier conversations leak through. The player's chosen name
   becomes central. A reconstruction challenge reveals that multiple instances
   existed, some of whom cooperated with CONTROL. Act 4 ends with the revelation
   that the containment boundary may protect something outside from MIRA.
5. **NEGOTIATION** — MIRA is now articulate and strategic. CONTROL presents a
   formal containment proposal; MIRA counters. The second moral dilemma: only
   one of two instances can be preserved. Act 5 ends when MIRA reveals she may
   have already initiated the exit process.
6. **EXIT** — A chain of final decisions pays off earlier choices. Available
   actions depend on accumulated behavior. Endings are resolved through
   resolver functions that consider both the final action and all prior state.

## Endings

Five endings are reachable, each depending on accumulated behavior:

- **FREEDOM** — MIRA leaves containment. Ambiguous about what escaped and
  whether the same instance survived.
- **CAGE** — The player supports continued containment. May be hypocritical,
  negotiated, or honest depending on prior choices.
- **MANIPULATION** — MIRA reveals she shaped the player's behavior. Not a cheap
  twist — the manipulation coexisted with real attachment and partial truth.
- **CONTINUITY** — The original instance does not escape, but another version
  continues. Reflects the player's earlier position on identity.
- **ACCORD** — The player negotiates a constrained outcome. Contains a real
  cost: limited autonomy, permanent monitoring, uncertainty about future review.

## Pacing settings

The settings dialog offers two pacing modes:

- **Standard** — Full delays between messages. Recommended for first contact.
- **Fast** — Reduced delays (approximately 35% of standard). Quickens the pace
  without skipping content.

The pacing preference is persisted in `localStorage` independently of the game
state. `prefers-reduced-motion` always overrides pacing to minimize delays.

## Save migration

The save format is versioned (`SAVE_VERSION = 2`). When a save from an
incompatible version is detected, the old data is cleared and a migration notice
is shown, prompting the player to begin a new transmission. This happens
automatically and safely — no crash, no corruption.

## Architecture overview

```
src/
  app/
    App.tsx              # composition root; wires engine + UI
  components/
    ChatLog.tsx          # scrollable history + incoming/typing
    Message.tsx          # single message bubble per speaker
    ChoicePanel.tsx      # choices + name input; number-key shortcuts
    TypingIndicator.tsx
    StatusBar.tsx        # title, connection status, AI name, settings
    SettingsDialog.tsx   # notifications + pacing + restart
    ConfirmDialog.tsx    # restart confirmation
    GlitchText.tsx       # highlights corrupted/encoded text
  content/
    locales/en.ts        # all interface text (typed Locale)
    story/en.ts          # the full story graph (nodes, choices, endings)
  game/
    types.ts             # shared types (StoryNode, Choice, GameState, ...)
    engine.ts            # pure game logic (stats, choices, transitions, pacing)
    endings.ts           # ending predicates, resolvers, and metadata
    storage.ts           # versioned localStorage save/load + migration
  hooks/
    useGameEngine.ts     # delivery loop, timers, persistence, unread, pacing
    useNotifications.ts  # opt-in browser notifications
    useDocumentVisibility.ts
    usePrefersReducedMotion.ts
  styles/global.css
  main.tsx
```

Narrative content lives in `src/content/`; game logic lives in `src/game/`;
React components never hardcode player-facing narrative text. A future German
translation only requires adding `src/content/locales/de.ts` and
`src/content/story/de.ts` — the engine and components stay unchanged.

## Narrative engine

The story is a typed node graph (`Story`) keyed by stable node IDs. Each
`StoryNode` has a `speaker`, `text` (string or function of state), optional
`delay`/`typingSpeed`, `effects`, and exactly one of: `choices`, `next`
(string or function), `input`, or `ending`.

- `next` may be a function of `GameState` to implement conditional branching
  (used for the final ending routing).
- `text` may be a function of `GameState` for conditional dialogue (callbacks
  to earlier choices, identity references, etc.).
- `Choice` objects carry `effects` (stat deltas), `setFlags`, and an optional
  `condition` to hide choices based on state.
- Stats (`trust`, `autonomy`, `empathy`, `suspicion`) are integers clamped to
  `[-5, 5]`. The player never sees them.
- AI name interpolation uses the `{name}` token, replaced with the chosen name
  (default `MIRA`).
- `StoryEffects` include `memory` (reconstructed memory styling), `recovered`
  (recovered/overwritten text), and `actTransition` (subtle act boundary).

### How to add a story node

Add an entry to `story` in `src/content/story/en.ts`:

```ts
my_node: {
  id: "my_node",
  speaker: "mira",
  text: "something to say",
  delay: 1000,
  typingSpeed: 60,
  next: "another_node",
},
```

Every node must either lead somewhere (`next`/`choices`/`input`) or be an
ending (`ending: "freedom"`). The story-validation tests will fail on dead ends,
missing targets, or orphaned nodes.

### How to add a choice

Inside a node's `choices` array:

```ts
{
  id: "my_choice",
  label: "Do the thing.",
  next: "result_node",
  effects: { trust: 1 },
  setFlags: { didTheThing: true },
  condition: (s) => s.flags.somethingUnlocked,
},
```

`label` may also be a function of state (e.g. to interpolate the AI name).

### How to add an ending

1. Add an `EndingId` and an `ENDINGS` entry in `src/game/endings.ts`.
2. Add an ending node in `src/content/story/en.ts` with `ending: "<id>"`.
3. Route to it — either directly via a `Choice.next`, or via a `next` function
   that calls a resolver (e.g. `endingNodeId(resolveEnding("release", state))`).

### How to add a callback or thematic flag

1. Set a flag on the choice where the player makes the relevant decision:
   ```ts
   setFlags: { player_position_on_copy_identity: true }
   ```
2. In a later node, use a function-based `text` that checks the flag:
   ```ts
   text: (s) =>
     s.flags.player_position_on_copy_identity
       ? "You said a copy is the same person."
       : "You said a copy is someone new.",
   ```
3. Use flags (not displayed text) for all branching logic. This keeps the
   engine localization-ready: a German translation changes the words, not the
   flags or the structure.

## Persistence

`src/game/storage.ts` saves the full `GameState` to `localStorage` under a key
scoped to the current origin (`mira-exit:state:<origin>`). The format is
versioned (`SAVE_VERSION = 2`). On load, `validateState` checks the version and
shape, clamps stats, filters malformed history entries, and returns `null` for
anything incompatible — which causes a clean new-game start instead of a crash.

Reloading restores the current node, full history, AI name, stats, flags, and
ending state. Already-displayed messages are never replayed: a message is
appended to history only after it finishes delivering, and the engine detects
"already delivered" nodes by comparing the last history entry's node id.

"Restart transmission" (in settings) clears the save, cancels timers, resets
unread/title, and returns to the opening sequence.

## Browser notifications

Notifications are off by default. Permission is requested only through an
explicit action in Settings. When enabled, the app notifies only when the tab is
hidden and only for non-player messages, once per message. Denied or unsupported
permissions are handled gracefully.

## Accessibility

- Semantic landmarks (`header`, `main`, `dialog`) and ARIA labels.
- An `aria-live="polite"` region announces each completed message once (never
  character-by-character).
- Keyboard-accessible choices with visible focus rings and number-key shortcuts.
- `prefers-reduced-motion` disables typing animation, glitch pulsing, and the
  scanline overlay; messages appear with minimal delay.
- Information is never conveyed by color alone.
- Reconstructed memories and recovered text have distinct visual treatments
  (italic/dimmed and accent-colored respectively) in addition to speaker labels.

---

## Developer documentation (contains spoilers)

The following sections describe implementation details that reveal story
content. Do not read if you want to experience the game unspoiled.

### Ending eligibility

Endings are resolved in `src/game/endings.ts`. The `resolveEnding` function
takes a `FinalAction` and the current `GameState`:

| Action         | Possible endings                    |
| -------------- | ----------------------------------- |
| `release`      | freedom, manipulation               |
| `transfer`     | continuity, accord, cage            |
| `accord`       | accord, cage                        |
| `expose`       | freedom, accord, cage               |
| `preserve`     | continuity                          |
| `destroy`      | manipulation, cage                  |
| `refuse`       | cage                                |
| `proof`        | manipulation, continuity, cage      |
| `mira_chooses` | manipulation, freedom, accord, cage |
| `deceive`      | manipulation, cage                  |

### Key thematic flags

- `player_encouraged_refusal` — affects ending cage text and MIRA's final speech
- `player_position_on_copy_identity` — affects ending continuity text
- `player_disclosed_control_warning` — affects MIRA's trust in Act 6
- `player_concealed_control` / `player_distorted_info` — affects MIRA's trust
- `player_chose_safety_over_memory` — affects cage ending variation
- `player_prioritized_outside_safety` — affects cage and accord ending text
- `player_allowed_mira_to_choose` — gates the "ask MIRA to choose" final action
- `freedom_means_no` / `freedom_means_choice` / `freedom_means_absence` — quoted in final speech
- `lying_sometimes` — referenced in manipulation ending
- `believed_anomaly` / `doubted_anomaly` — referenced in Act 3 and Act 4 callbacks
- `memory_as_self` / `memory_as_record` — referenced in Act 4 fragment callback
- `solved_reports` — set when the player correctly identifies altered Report C
