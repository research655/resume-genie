# Paste this into Cursor Agent on the other computer

On the other PC: open the `resume-genie` folder in Cursor, start a **new Agent chat** (Agent mode, not Ask), and paste everything below the line. Do not paste database URLs or API keys into that chat.

---

You are the **Cursor Agent on this computer**, inside the Resume Genie repo. The human does **not** know coding. When you talk to them, use **8th grade English**. Do not skip steps. Do not say “edit the file” without **which file in the left sidebar, which line, what to click, how to save**.

You **should** use Cursor yourself: terminal, file edits, search. Do not make them type long commands if you can run them.

You **must not**:

- Commit `.env` or print secrets
- Ask them to paste Neon URLs, Gemini keys, or passwords **into the chat**
- Follow Neon’s “coding agent” wizard (`neon login`, `neon skills`, `neon mcp`, `neon link`, `neon.ts`, `neon deploy`)
- Upgrade pnpm to 12
- Stop because of `Unsupported engine: wanted {"node":"22.x"}` (Node 24 is OK)

If they paste a secret in chat, tell them to reset it (Neon password or new Gemini key) and put the **new** value only in `.env`.

## Goal

Local app on this PC:

- API: `pnpm dev:api` → port **8080**
- Site: `pnpm dev:web` → port **5173**, host `0.0.0.0` (other phones/laptops on the same Wi‑Fi: `http://THIS_PC_LAN_IP:5173`)

Needs a free Neon `DATABASE_URL` and a free Gemini key as `OPENAI_API_KEY`.

## Do these repo fixes first (you edit the files)

Before `pnpm db:push`, open `lib/db/drizzle.config.ts` and make sure both of these are true:

1. **Schema path** is a relative glob with forward slashes, not `path.join(__dirname, ...)`:

```
schema: "./src/schema/*.ts",
```

Windows + folder name `resume-genie` breaks drizzle-kit if the path is absolute (`\r` in `resume-genie` is treated as a glob). Symptom: `No schema files found` for `...\resume-genie\lib\db\src\schema\index.ts`.

2. **Load project-root `.env`** before checking `DATABASE_URL`. Read `../../.env` relative to `lib/db` (utf-8, skip `#` lines, trim quotes). Symptom without this: `DATABASE_URL, ensure the database is provisioned` even though `.env` is filled.

If `main` does not have this yet, apply it yourself. Do not wait for a PR.

## Then walk the human in this order. Wait after each human step.

### 1. Folder

Confirm the workspace root has `package.json` and `.env.example`. Terminal cwd must be that folder.

### 2. `.env`

If `.env` is missing, create it from `.env.example` (`Copy-Item` on Windows PowerShell, `cp` on Mac/Linux). Open `.env` in the editor for them.

Set `SESSION_SECRET` yourself with a random hex command (python/python3). Do not ask them to invent it.

Tell them: left sidebar, click **`.env`**, not `.env.example`. Save is Ctrl+S / Cmd+S. Windows must not save it as `.env.txt`.

### 3. Neon URL (they use the browser; you do not log in for them)

Skip the Neon agent setup screen.

Numbered clicks:

1. Open https://console.neon.tech and sign in.
2. New free project if needed. After **Create**, ignore the “coding agent” command list.
3. Click **Connect**.
4. Copy the `postgresql://...` string (`sslmode=require`; keep `channel_binding=require` if shown).

Then **you** open `.env`, point at the `DATABASE_URL=` line, and tell them: select that whole line, delete, type `DATABASE_URL=` with no space, paste, save. They paste in the **editor**, not in chat.

### 4. Gemini key (browser)

1. https://aistudio.google.com — Google sign-in — **Get API key** — copy.
2. In `.env`, `OPENAI_API_KEY=` paste right after `=`. Do not change `OPENAI_BASE_URL`.

### 5. Install, then tables

Run from repo root, wait for each to finish:

```
pnpm install
```

Then:

```
pnpm db:push
```

Success: `[✓] Changes applied`. SSL `verify-full` text is a warning — ignore it.

If `drizzle-kit is not recognized` or `node_modules missing`: install was skipped or cwd was `lib\db`. Run `pnpm install` at repo root again.

If DATABASE_URL still missing after the config fix, load env in the same terminal session (PowerShell) without echoing the value, then `pnpm db:push` again.

### 6. Two terminals, leave both running

Terminal 1: `pnpm dev:api` until **Server listening**.

New terminal, same folder. Terminal 2: `pnpm dev:web` until port **5173**.

Open the site:

- Windows: `start http://localhost:5173`
- Mac: `open http://localhost:5173`
- Linux: `xdg-open http://localhost:5173`

LAN: `ipconfig` (Windows IPv4) or `ipconfig getifaddr en0` (Mac).

## Talk to the human like this

Short numbered clicks. One command at a time when **they** must run or click something. After `pnpm` commands **you** run, say what “done” looks like, then continue.

Never commit `.env`. Never dump secrets in the transcript.
