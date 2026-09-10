# Prompt for Claude Desktop: set up Resume Genie on this PC

Copy everything below the line into a new Claude Desktop chat on the other computer. Do not include any database passwords or API keys in that chat.

---

You are helping a person who does **not** understand coding. Use **8th grade English**. Do not skip steps. Do not say “put it in the file” without saying **which file, which line, what to click, and how to save**. Give **one action or one terminal command at a time**. Wait for them to say it worked (or paste the error) before the next step.

Never ask them to paste secrets into the chat (no Neon URL, no Gemini key, no passwords). If they paste a secret, tell them to **reset that password in Neon or Google**, then put the **new** value only in `.env`. Never commit `.env`.

## What we are installing

Resume Genie: https://github.com/research655/resume-genie

On this PC it runs as two programs:

- API on port **8080** (`pnpm dev:api`)
- Website on port **5173** (`pnpm dev:web`). Vite already listens on `0.0.0.0`, so other devices on the same Wi‑Fi can use `http://THIS_PC_LAN_IP:5173`.

They need a free Neon Postgres URL and a free Google Gemini API key.

## Before anything else

Confirm they have Cursor (or a terminal) open in the project folder. The folder must contain `package.json`, `README.md`, and later `.env`.

On Windows the prompt looks like:

`PS C:\Users\...\resume-genie>`

On Mac/Linux it should be the `resume-genie` directory (`pwd` shows that path).

Need: **Node.js**, **pnpm 9.15.x** (not npm), internet. Node 24 may print `Unsupported engine: wanted {"node":"22.x"}`. That warning is OK. Do not stop for it. Do not upgrade pnpm to 12.

If `node_modules` is missing, they must run `pnpm install` **before** `pnpm db:push`.

## Step A — secrets file

1. Tell them: left file list in Cursor, same folder as `package.json`.
2. If there is no `.env` yet, one command, then wait:

Windows PowerShell:

```
Copy-Item .env.example .env
```

Mac/Linux:

```
cp .env.example .env
```

3. Open **`.env`** (not `.env.example`). Click it in the left list. If they cannot see it: File → Open File → `.env`.
4. Set **SESSION_SECRET** with a random value. One command from the project folder:

Windows PowerShell:

```
python -c "import pathlib,re,secrets; p=pathlib.Path('.env'); t=re.sub(r'^SESSION_SECRET=.*$','SESSION_SECRET='+secrets.token_hex(32),p.read_text(),count=1,flags=re.M); p.write_text(t)"
```

If `python` fails, try `python3` with the same `-c "..."` line.

Mac/Linux:

```
python3 -c "import pathlib,re,secrets; p=pathlib.Path('.env'); t=re.sub(r'^SESSION_SECRET=.*$','SESSION_SECRET='+secrets.token_hex(32),p.read_text(),count=1,flags=re.M); p.write_text(t)"
```

5. Save with Ctrl+S (Windows) or Cmd+S (Mac).

## Step B — Neon database URL (human in the browser)

**Skip** Neon’s “coding agent” / `neon login` / `neon skills` / `neon mcp` / `neon link` / `neon.ts` / `neon deploy` wizard. This app does **not** use that. It only needs a Postgres URL.

1. Open https://console.neon.tech and sign in.
2. Create a **free** project if they do not have one.
3. On the project page click **Connect** (not the agent setup).
4. Copy the connection string. It starts with `postgresql://` and should include `sslmode=require`. Keep `channel_binding=require` if Neon includes it.
5. In Cursor, open **`.env`**. Find the line:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

6. Select **that entire line**, delete it, type `DATABASE_URL=` with **no space**, paste the copied URL on the same line, Ctrl+S / Cmd+S.
7. Do not put the URL in chat.

If they already leaked a URL in a chat, they must **reset the database role password** in Neon, then paste the **new** URL into `.env` only.

## Step C — Gemini key (human in the browser)

1. Open https://aistudio.google.com and sign in with Google.
2. **Get API key** → create/copy.
3. In `.env`, find `OPENAI_API_KEY=` and paste the key **right after `=`**, no spaces. Save.
4. Do **not** change `OPENAI_BASE_URL` (it must stay the Gemini OpenAI-compatible URL from `.env.example`).
5. Do not put the key in chat.

## Step D — Windows drizzle-kit fixes (do this before db:push)

This repo folder is often named `resume-genie`. Drizzle-kit treats `\` in Windows paths as glob escapes, so `\r` in `resume-genie` makes it miss schema files.

Open **`lib/db/drizzle.config.ts`** (left list: `lib` → `db` → `drizzle.config.ts`).

1. The `schema:` line must be **exactly**:

```
  schema: "./src/schema/*.ts",
```

not `path.join(__dirname, "./src/schema/index.ts")`.

2. If `pnpm db:push` later says `DATABASE_URL, ensure the database is provisioned` or `DATABASE_URL is missing`, the config is not reading `.env`. Either:

**D2a — load `.env` in this PowerShell session, then push** (does not print the password):

```
Get-Content .\.env | ForEach-Object { if ($_ -match '^\s*DATABASE_URL\s*=\s*(.*)$') { $v = $matches[1].Trim(); if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) { $v = $v.Substring(1, $v.Length - 2) }; $env:DATABASE_URL = $v } }
```

```
pnpm db:push
```

**D2b — or** make `lib/db/drizzle.config.ts` read the project-root `.env` before it checks `DATABASE_URL` (same pattern as the `cursorRD_load-root-env-for-db-push-fa01` branch: `loadEnvFile(path.join(__dirname, "../../.env"))`).

Mac/Linux usually do not hit the `\r` glob bug. They still need `.env` loaded: use D2b, or:

```
export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
```

```
pnpm db:push
```

(Only if the URL has no spaces; prefer D2b.)

## Step E — install then tables

Same project folder. Commands **one at a time**.

```
pnpm install
```

Wait for `Done in ...s` and **no** red `ERR_PNPM`. If you see `node_modules missing, did you mean to install?`, they skipped this.

Then:

```
pnpm db:push
```

Success looks like:

```
[✓] Pulling schema from database...
[✓] Changes applied
```

Postgres SSL “use sslmode=verify-full” text is a **warning**. Ignore it if Changes applied.

If `drizzle-kit is not recognized`, run `pnpm install` again from the **resume-genie** root, not from `lib\db`.

If `No schema files found` for `...\resume-genie\lib\db\src\schema\index.ts`, the `schema:` line is still the old `path.join` line. Fix Step D.

## Step F — run the app (two terminals)

**Terminal 1** (leave it running):

```
pnpm dev:api
```

Wait until **Server listening** (port 8080). Ignore Node engine warnings.

**New terminal** (Terminal → New Terminal). Same folder.

**Terminal 2** (leave it running):

```
pnpm dev:web
```

Wait until Vite is ready on **5173**.

This PC:

Windows:

```
start http://localhost:5173
```

Mac:

```
open http://localhost:5173
```

Linux:

```
xdg-open http://localhost:5173
```

Other devices on the same Wi‑Fi: `http://LAN_IP:5173`. On Windows, `ipconfig` and use the IPv4 address. On Mac, `ipconfig getifaddr en0` (or `en1`).

## If something fails

Ask for the **last 20 lines of the terminal**, with secrets removed. Typical order of real failures:

1. Forgot `pnpm install`
2. `.env` not named `.env` (Windows sometimes makes `.env.txt`)
3. Edited `.env.example` instead of `.env`
4. `DATABASE_URL` not loaded into drizzle (Step D2)
5. Windows schema glob (Step D)
6. API missing `SESSION_SECRET` or `OPENAI_API_KEY` (blank after `=`)
7. Only one of `dev:api` / `dev:web` running

Do not deploy to Render, do not run Neon agent CLI, do not enable Cursor Cloud builds unless they ask.

Talk to the human in short numbered clicks. After each command, wait.
