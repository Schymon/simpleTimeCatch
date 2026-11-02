# simpleTimeCatch – einfache Zeiterfassung

Kleine, mobil-optimierte Zeiterfassungs-Webseite. Kein Datenbanksystem – die
Einträge liegen als JSON-Datei im `data/`-Ordner auf dem Server. Details und
Hintergrund der Entscheidungen stehen in [`konzept.md`](./konzept.md).

## Setup

```bash
npm install
cp .env.example .env.local
```

In `.env.local` anpassen:

- `APP_PASSWORD` – das Login-Passwort für die Seite.
- `SESSION_SECRET` – zufälliger Schlüssel zum Signieren des Session-Cookies,
  z. B. generieren mit:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

## Entwicklung

```bash
npm run dev
```

Öffnet auf [http://localhost:3000](http://localhost:3000). Ohne gültiges
Login-Cookie leitet die App automatisch auf `/login` um.

## Build & Produktion

```bash
npm run build
npm run start
```

**Wichtig:** Die Zeiterfassungs-Daten werden als JSON-Datei im lokalen
Dateisystem (`data/entries.json`, `data/running.json`) gespeichert. Das
funktioniert nur auf einem Host mit dauerhaftem, beschreibbarem Dateisystem
(eigener Server, NAS, Docker-Container) – **nicht** auf klassischem
Serverless-Hosting wie Vercel, da dort Dateisystem-Schreibzugriffe nicht
persistent sind.

## Tech-Stack

- Next.js (App Router) – Frontend und API-Routes in einem Projekt
- React + shadcn/ui (manuell installiert, Radix-UI-Basis) + Tailwind CSS v4
- `date-fns` / `date-fns-tz` – alle Zeiten fest in `Europe/Berlin`
- Login per gemeinsamem Passwort, Session als `httpOnly`-Cookie (kein
  `localStorage`)
