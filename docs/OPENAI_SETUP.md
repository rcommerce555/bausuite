# OpenAI Setup

## 1. API Key erzeugen
- API Key in deinem OpenAI-Konto anlegen
- In `.env.local` als `OPENAI_API_KEY` hinterlegen

## 2. Aktuelles Verhalten
Die Analyse-Routen unterstützen:
- `mode: live` -> echte OpenAI-Anfrage
- `mode: demo` -> lokale Fallback-Logik

## 3. Betroffene Routen
- `POST /api/documents/analyze`
- `POST /api/site-reports/analyze`

## 4. Output-Format
Die API erwartet strukturiertes JSON für:
- Dokumenten-Copilot
- Bauleitungs-Copilot

## 5. Empfehlung
Im Produktivbetrieb nur serverseitig aufrufen und niemals den API Key im Client verwenden.
