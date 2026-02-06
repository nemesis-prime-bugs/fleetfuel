# Projekt Antrag / Auftrag — FleetFuel

Stand: 2026-02-06 (UTC)

## 1. Auftraggeber
- Sebastijan

## 2. Projektname
- **FleetFuel**

## 3. Ausgangslage / Problemstellung
Viele Fahrer (privat wie auch kleine Unternehmen) erfassen Kraftstoffkosten, Fahrten und Belege entweder gar nicht oder in Papierform/Excel. Dadurch fehlen:
- ein sauberer Überblick über Verbrauch und Kosten,
- konsistente Daten pro Fahrzeug,
- nachvollziehbare Belege (Quittungen),
- einfache Monats-/Trend-Auswertungen.

## 4. Zielsetzung
Entwicklung einer Web-App (MVP), mit der Nutzer:innen ihren Kraftstoffverbrauch und ihre Kosten pro Fahrzeug digital erfassen und auswerten können.

### Hauptziele (MVP)
- Login via **E-Mail + Passwort**
- Nutzerkonto-Typ: **Privat** oder **Firma**
- Fahrzeuge anlegen und verwalten
- **Tankvorgänge** protokollieren (Datum, Kilometerstand, Menge, Kosten, Volltank-Flag, optional Tankstelle/Notiz)
- **Fahrten** protokollieren (Datum, Strecke; optional „anderer Fahrer“)
- **Monatscharts**: Verbrauch + Ausgaben (pro Fahrzeug und gesamt)
- **Belege**: Foto der Quittung je Tankvorgang anhängen
  - Phase 0: Speicherung **lokal auf dem Server** (kostenfrei, keine Cloud-Storage)

## 5. Nicht-Ziele (vorerst)
- OCR/automatische Beleg-Erkennung
- Komplexes Flottenmanagement (Rollen/Rechte, Einladungen, Fuhrparkleiter etc.)
- Steuer-/Spesenabrechnung, Buchhaltungsexporte (über CSV hinaus)
- Mobile Native Apps (wir starten als Web/PWA)

## 6. Rahmenbedingungen / Constraints
- **0€ pro Monat** laufende Kosten (Free-Tiers erlaubt)
- Security-Overwatch aktiv (Itachi): keine unreviewten Downloads/Abhängigkeiten; Upload-Härtung; Secrets nicht im Repo
- Quittungen enthalten potenziell sensible Daten (PII) → Datenschutz beachten

## 7. Deliverables
- GitHub Repository (öffentlich)
- Projekt-Dokumentation (Brief, ADRs, Security Log)
- Implementiertes MVP inkl. Grundtests

## 8. Erfolgskriterien
- Nutzer kann in <3 Minuten ein Konto erstellen, ein Fahrzeug anlegen und einen Tankvorgang eintragen.
- Monatsübersicht zeigt nachvollziehbare Summen und Trends.
- Belege sind sicher gespeichert (owner-only Zugriff) und downloadbar.
- Keine bekannten Sicherheitslücken aus Standard-Audits (best-effort).

## 9. Abnahme / Definition of Done (MVP)
- Login/Logout funktioniert
- CRUD: Fahrzeuge, Tankvorgänge, Fahrten
- Auswertungen/Charts für Monat
- Receipt-Upload + Anzeige/Download (mit Type/Size-Limits, EXIF-Strip, Magic-Byte-Check)
- Dokumentation aktualisiert (README + Projektauftrag + ADRs)

## 10. Links
- Repo: https://github.com/nemesis-prime-bugs/fleetfuel
- Produktbrief: `docs/PRODUCT_BRIEF.md`
- ADRs: `docs/adr/`
- Security Log: `SECURITY_LOG.md`
- Aufgaben: `TASKS.md`
