# Restore & Rise — Creative Suite

An internal, password-protected tool for the content team: five agents for
planning, writing, and designing social content, plus a pipeline that
transcribes uploaded audio and repurposes it into carousel and caption drafts.

Built the same way as the House of Formidable Business Suite — a standalone
site, separate from the client-facing coaching.faithshespeaks.com platform.

## What is in this folder

- `index.html` — the whole dashboard (login screen, agent grid, chat panels, audio upload)
- `netlify/functions/anthropic-proxy.js` — sends chat messages to Claude, keeping your API key server-side
- `netlify/functions/transcribe-start.js` — uploads audio and starts an AssemblyAI transcription job
- `netlify/functions/transcribe-status.js` — checks on a transcription job and returns the finished transcript
- `netlify.toml` — tells Netlify where the functions live
- `package.json` — no dependencies needed; Node 18+ has `fetch` built in

## Deploying this (same pattern as the HOF Business Suite)

1. Create a **new, separate Netlify site** for this project (do not add it to the existing Restore & Rise site — this keeps the internal tool separate from the client-facing platform).
2. Either drag-and-drop this whole folder into Netlify's deploy screen, or push it to its own GitHub repo and connect that repo to Netlify.
3. In the new site's dashboard, go to **Site configuration → Environment variables** and add:
   - `ANTHROPIC_API_KEY` — your Anthropic API key
   - `ASSEMBLYAI_API_KEY` — your AssemblyAI API key (see below)
4. Redeploy the site after adding the environment variables, so the functions can read them.
5. Share the resulting `.netlify.app` URL with your team, along with the access password.

## Getting an AssemblyAI API key

1. Go to assemblyai.com and create an account.
2. Your API key is shown on your dashboard home page after signup.
3. AssemblyAI bills by audio minute transcribed — check their current pricing page before uploading large batches of episodes.

## Changing the access password

Open `index.html` and find this line near the top of the script:

```
const ACCESS_PASSWORD = "RestoreCreative2026";
```

Change the text between the quotes to whatever password you want your team to use, then redeploy.

**Note on security:** like the HOF Business Suite, this password check runs in
the browser, not on the server. It is enough to keep casual visitors out, but
it is not bank-level security — do not use it to gate anything highly
sensitive. If you want stronger protection later, this check can be moved
into a Netlify function instead.

## Naming the remaining agents

Content Strategist and Social Media Manager are currently named by role.
Rename them anytime by editing the `title` field inside the `AGENTS` array
in `index.html`.

## Consolidation notes (Rahab & Zilpah merge)

The standalone Caption Writer, Carousel Designer, and Audio Repurposing
Agent cards from the first version of this suite have been retired.
Rahab already covers that ground with 15+ formats, and her tool now
accepts audio as a source (via the same transcription pipeline), so a
separate audio agent was redundant.

`content-studio.html` is Rahab and Zilpah, merged into this suite:

- **Rahab (left panel)** — paste text/transcript or upload audio, pick
  one or more formats across Instagram, Video, Written, and Other
  categories, and generate them in parallel.
- **Zilpah (right panel)** — the shared approval queue. Anything sent
  from Rahab lands here for review, editing, and approval.

The approval queue currently persists in the browser's local storage,
not a database — it will survive refreshes on the same device and
browser, but will not sync across devices or team members the way the
original Supabase-backed queue in your main platform does. If your
team needs a shared, cross-device queue, this would need to be wired
to a small database (Supabase, matching your existing pattern, would
be the natural choice) — flag it if you want that built out.

Only 15 of the original ~18 Rahab formats could be recovered verbatim
from past sessions. If you remember the remaining ones, they can be
added to the `FORMAT_MAP` and `FORMAT_PROMPTS` objects at the top of
`content-studio.html`'s script, following the same pattern as the
existing entries.

## For Deborah (Thought Partner) — agent directory

Deborah lives in your main platform's Ministry Tools, not in this
Creative Suite, so she cannot automatically see what is here. To give
her the visibility you asked for — so her routing suggestions can
point Lady T to these tools by name — add a short reference like this
to Deborah's own system prompt in your main codebase:

```
Available Creative Suite tools you can route content ideas to:
- Rahab: repurposes any source (text, transcript, or audio) into 15+
  social formats across Instagram, Video, Written, and Other.
- Zilpah: the approval queue where repurposed content is reviewed
  before posting.
- Content Strategist: content calendar planning tied to the Quarterly
  Workshop cycle.
- Social Media Manager: posting rhythm and cross-platform adaptation.
```

This only updates what Deborah *knows about* — it does not give her a
live connection into the Creative Suite itself, since the two are
separate deployed sites. If you want an actual live connection later
(so Deborah could, for example, hand a brain dump straight to Rahab),
that would need a small API bridge between the two sites — let me know
if that is worth building.


## How the audio pipeline works

1. In Rahab (inside Content Studio), choose "Upload audio" as your source and pick a file (podcast episode, sermon clip, voice note).
2. The file is sent to AssemblyAI, which transcribes it — this can take a few minutes for longer files.
3. Once the transcript is ready, it is loaded into Rahab's source box automatically.
4. Select whichever formats you want generated from it, and generate as usual.

## Brand voice rules already built in

Every agent's instructions include your standing content rules automatically:
no "hustle" or "grind," no contractions anywhere, American English spelling,
warm-invitation tone (never salesy), "Lord Jesus" to open any prayer content,
and no program pricing discussed in generated content.
