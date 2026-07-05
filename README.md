# NutriTrack

NutriTrack ist eine browserbasierte Webanwendung zur Erfassung und Auswertung der täglichen Kalorienzufuhr.

## Funktionen

- Mahlzeiten anlegen mit Makronährstoffen (Kohlenhydrate, Fett, Proteine)
- Automatische Kalorienberechnung
- Mahlzeiten löschen
- Favoriten markieren
- Tagesübersicht mit Gesamtkalorien und Gesamtmakros
- Tagesziel setzen mit Fortschrittsanzeige
- Login mit Auth0 (jeder Nutzer sieht nur seine eigenen Mahlzeiten)

## Tech-Stack

- **Frontend:** Vue.js 3, TypeScript, Bootstrap 5
- **Backend:** Spring Boot, Java
- **Datenbank:** PostgreSQL
- **Auth:** Auth0
- **Deployment:** Render.com
- **CI/CD:** GitHub Actions

## App starten (lokal)

### Frontend
```bash
npm install
npm run dev
```
App läuft auf: http://localhost:5173

### Backend
```bash
./gradlew bootRun
```
Backend läuft auf: http://localhost:8080

## Live App

Frontend: https://nutritrack-frontend-bg6q.onrender.com

## Tests ausführen

### Frontend
```bash
npm run test:unit
```

### Backend
```bash
./gradlew test
```
