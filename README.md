# Fastra One — Website

Statische Einzeldatei-Website. Alles ist eingebettet: Schriften, Bilder, Logo, Icons.
Es gibt **keine externen Requests** — deshalb kein Cookie-Banner nötig.

## Struktur
- `index.html` — die komplette Seite
- `.htaccess` — Sicherheits-Header, HTTPS-Zwang, Komprimierung (Apache/Hostinger)

## Deployment
Hostinger zieht diesen Branch automatisch, sobald in hPanel unter
**Website → Git** das Repo verbunden ist. Ziel-Verzeichnis: `public_html`.

## Änderungen
Bearbeitet wird `entwurf-neue-website/fastraone-entwurf-v55.html` im Hauptprojekt,
danach wird die Datei hierher als `index.html` kopiert und committet.
