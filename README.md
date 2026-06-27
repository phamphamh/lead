# Growth Agent — V1

Un agent CRO autonome : il ingère la data d'une landing, écrit une hypothèse en langage
clair, génère une variante (config JSON), la déploie, mesure, recommence — et **refuse**
les gains proximaux (clics) qui dégradent la valeur downstream (leads qualifiés).

## Stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Prisma + Postgres ·
Claude (Opus 4.8) via `@anthropic-ai/sdk`. Auto-hébergé (Hetzner + Coolify).

## Lancer en local
1. Renseigne `.env` :
   - `DATABASE_URL` → un Postgres accessible (Coolify, Docker, ou local).
   - `ANTHROPIC_API_KEY` → clé Claude (https://console.anthropic.com/settings/keys).
   - `SAMPLE_GATE_N` → seuil d'events/variante avant que l'agent arrête de s'abstenir (défaut 30).
2. Prépare la base :
   ```bash
   npx prisma migrate deploy     # ou: npx prisma migrate dev --name init
   npm run db:seed               # crée la config baseline + le lock
   ```
3. Dev : `npm run dev` → http://localhost:3000
   - `/` : la landing (rendue depuis la config active).
   - `/agent` : le cockpit (dashboard + reasoning log + boutons Avancer / Veto / mode / inject [SIM]).

## Boucle de démo
1. Sur `/agent`, mets le mode sur **[SIM]** et clique **"Injecter trafic [SIM]"** → génère
   un pattern piège déterministe (clic ↑, qualifié ↓) sur la config active.
2. Clique **"Avancer l'agent"** (ou active l'auto-advance) → l'agent lit les métriques,
   raisonne, et selon les règles : `abstain` (pas assez de data) / `reject` (piège proximal)
   / `ship` (vraie amélioration). Le verdict s'affiche dans le reasoning log.
3. **Filet de sécurité scène** : `POST /api/fallback` rejoue un run pré-enregistré (story
   baseline → ship trap → reject → ship downstream) si l'API Claude hoquette en live.

## Routes API
`/api/health` · `/api/events` · `/api/state` · `/api/decisions` · `/api/agent/step` ·
`/api/agent/veto` · `/api/mode` · `/api/sim` · `/api/fallback`

## Déploiement (Coolify @ Hetzner)
Nouveau service Postgres 17 (1 clic) → `DATABASE_URL`. App Next depuis le repo (build
nixpacks, port 3000, healthcheck `/api/health`), vars `DATABASE_URL` + `ANTHROPIC_API_KEY`.
Build command : `prisma generate && next build`. Sous-domaine Porkbun → `159.69.41.115`,
SSL auto. Voir `ascend/docs/chantiers/hosting-hetzner.md` pour la mécanique exacte.
