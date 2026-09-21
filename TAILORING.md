# Tailoring the Demo for a Specific Audience

One of the strengths of this recipe is that the demo content — sample text, emails,
book excerpts, conversation transcripts — can be swapped for material that resonates
with the specific customer or country you are presenting to. The AI capabilities being
demonstrated (entity extraction, sentiment analysis, multilingual reasoning, PII
redaction) are identical; only the data changes.

This document describes the recommended pattern for doing this safely, without
affecting the generic demo on `main` or the GitHub repository.

---

## The Pattern: a Local Git Branch

```
main (GitHub) ──────────────────────────── generic demo, always clean
                  │
                  └── <audience>-<year>  (local only, never pushed)
                          tailored content lives here
```

- `main` stays in sync with GitHub and always contains the generic, reusable demo.
- Your tailored changes live on a local branch that is **never pushed to GitHub**.
- After the event, one command returns you to the clean generic state.
- The tailored branch is preserved locally in case you need it again.

---

## Step-by-step

### 1 — Make your content changes locally

Edit whichever source files contain demo content. The most common targets are:

| File | What to change |
|---|---|
| `carbon-ui/src/app/entextract/defaults.js` | Book extract for Entity Extraction tab |
| `carbon-ui/src/app/entextract/it-ops-emails.js` | IT Ops email scenarios (language, sender, company) |
| `carbon-ui/src/app/entextract/logistics-quote.js` | Logistics quote email (language, route, company) |
| `carbon-ui/src/app/convintel/defaults.js` | Customer support / sales call transcripts |
| `carbon-ui/src/app/home/page.js` | Landing page narrative (About / Secure / Flexible tabs) |
| `carbon-ui/src/app/piiextract/defaults.js` | PII extraction sample complaint text |

### 2 — Commit to a local branch

```bash
git checkout -b <audience>-<year>
# e.g. git checkout -b denmark-2026

git add carbon-ui/src/app/...   # only the files you changed
git commit -m "Tailoring for <audience> <date>"
```

Do **not** run `git push`. The branch stays local.

### 3 — Deploy to the VM, then push the tailored files

The deploy script clones from GitHub (`main`), so the VM starts with the generic demo.
After the deploy completes, copy your tailored files over and rebuild:

```bash
KEY="<path-to-ssh-key>"
HOST="<user>@<fqdn>"
BASE="carbon-ui/src/app"

scp -i "$KEY" $BASE/entextract/defaults.js       "$HOST:~/Carbon-GenAI-Demos/$BASE/entextract/defaults.js"
scp -i "$KEY" $BASE/entextract/it-ops-emails.js  "$HOST:~/Carbon-GenAI-Demos/$BASE/entextract/it-ops-emails.js"
scp -i "$KEY" $BASE/entextract/logistics-quote.js "$HOST:~/Carbon-GenAI-Demos/$BASE/entextract/logistics-quote.js"
scp -i "$KEY" $BASE/convintel/defaults.js        "$HOST:~/Carbon-GenAI-Demos/$BASE/convintel/defaults.js"
scp -i "$KEY" $BASE/home/page.js                 "$HOST:~/Carbon-GenAI-Demos/$BASE/home/page.js"

ssh -i "$KEY" "$HOST" "cd ~/Carbon-GenAI-Demos/carbon-ui && yarn build && pm2 restart nextjs-app"
```

Rebuild takes 3–5 minutes. The demo is live at `http://<fqdn>:3000` when pm2 reports
`nextjs-app` as `online`.

### 4 — After the event: return to the generic demo

On your local machine:

```bash
git checkout main
```

Your working directory is now back to the clean generic state. The tailored branch is
still there if you ever need it:

```bash
git branch              # lists all local branches
git checkout denmark-2026   # returns to tailored state
```

---

## What makes good tailored content

The demos are most effective when the sample data reflects something the audience
recognises — their language, their industry, a company or situation they know.
Good substitutions to consider:

- **Language** — swap English, German, or French scenarios for the local language.
  The multilingual demos (IT Ops emails, logistics quote, customer support call)
  are specifically designed to showcase this capability.
- **Book extract** — use a well-known local author or title for the Entity Extraction
  book tab. The text should contain a price, rating, publisher, genre, and a named
  contact — the entity schema stays the same.
- **Landing page narrative** — localise the About / Secure / Flexible tabs to reference
  local AI regulation, data sovereignty context, or an infrastructure analogy the
  audience will recognise (railways, energy grids, telecoms networks, etc.).
- **Company names** — use plausible local company names in email scenarios rather than
  generic placeholders.

---

## What not to change

- Do not modify the entity schemas (the `entities` arrays) unless you are also
  updating the prompts and the postprocessing logic.
- Do not change port numbers, service names, or infrastructure config files.
- Do not commit tailored content to `main` or push the tailored branch to GitHub.

---

## Example: Denmark 2026

Branch: `denmark-2026` (local only)

| File | Change |
|---|---|
| `entextract/defaults.js` | *The Keeper of Lost Causes* by Jussi Adler-Olsen, Nordic Noir, priced in kroner, contact Hr. Jensen |
| `entextract/it-ops-emails.js` | `danish_professional` — warehouse safety incident in Danish, Karen Sørensen, Lager B |
| `entextract/logistics-quote.js` | KontorDirekt A/S, Aarhus → Stockholm, Danish text |
| `convintel/defaults.js` | TechSupport Danmark call in Danish, hr. Hansen / Anders Christensen |
| `home/page.js` | Copenhagen S-Bane automation, Digitaliseringsstyrelsen EU AI Act inspections, Gefion supercomputer, data sovereignty narrative |
