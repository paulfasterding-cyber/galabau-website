# Fastra One – Website (Astro)

1:1-Umbau der statischen HTML-Seite auf Astro. Aussehen & Funktionen unverändert.

## Entwickeln
    npm install      # einmalig
    npm run dev      # lokaler Dev-Server (http://localhost:4321)

## Bauen / Deploy
    npm run build    # erzeugt dist/ (statisches HTML, wie vorher)
Netlify: Build-Command `npm run build`, Publish-Verzeichnis `dist`.

## Struktur
- `src/pages/*.astro`  – je eine Seite (index, kontakt, blog, …), 1:1 aus dem alten HTML
- `public/assets`, `public/fonts` – Bilder & Schriften
- Styles/Skripte stecken (noch) pro Seite als `is:global` / `is:inline` – nächster Schritt: gemeinsame Nav/Footer/Layout als Komponenten herausziehen.
