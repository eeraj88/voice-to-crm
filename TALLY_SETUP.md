# Tally Lead Capture Formular - Anleitung

## Schritt 1: Tally Konto erstellen (falls nicht vorhanden)

1. Gehe zu https://tally.so
2. Klicke auf "Sign up" oder "Get started"
3. Registriere dich mit Google, Email oder Slack

## Schritt 2: Neues Formular erstellen

1. Nach dem Login klickst du auf **"Create form"** oder **"New form"**
2. Wähle **"Start from scratch"** (Leeres Formular)
3. Gib einen Namen ein: **"Lead Capture"** oder **"Newsletter Anmeldung"**
4. Klicke auf **"Create form"**

## Schritt 3: Formularfelder hinzufügen

### Feld 1: E-Mail (Pflichtfeld)
1. Klicke auf das **+** Symbol unten im Formular
2. Wähle **"Email"** (E-Mail Icon)
3. Rechts bei "Properties":
   - Label: `E-Mail`
   - Required (Pflichtfeld): **Aktivieren** ✅
   - Key: `email`
   - *Tipp: Der Key ist meistens automatisch, du kannst ihn aber ändern*

### Feld 2: Vorname
1. Klicke wieder auf **+**
2. Wähle **"Text"** (kurzes Textfeld)
3. Properties:
   - Label: `Vorname`
   - Required: **Aktivieren** ✅
   - Key: `firstName`

### Feld 3: Nachname
1. Klicke auf **+**
2. Wähle **"Text"**
3. Properties:
   - Label: `Nachname`
   - Required: **Aktivieren** ✅
   - Key: `lastName`

### Feld 4: Firma
1. Klicke auf **+**
2. Wähle **"Text"**
3. Properties:
   - Label: `Firma`
   - Required: **Nicht aktivieren**
   - Key: `company`

### Feld 5: Telefon
1. Klicke auf **+**
2. Wähle **"Phone"** (Telefon Icon)
3. Properties:
   - Label: `Telefonnummer`
   - Required: **Nicht aktivieren**
   - Key: `phone`

### Feld 6: Nachricht
1. Klicke auf **+**
2. Wähle **"Long text"** (Textfeld mit mehreren Zeilen)
3. Properties:
   - Label: `Deine Nachricht`
   - Required: **Nicht aktivieren**
   - Key: `message`

### Feld 7: Datenschutz (Checkbox)
1. Klicke auf **+**
2. Wähle **"Checkbox"**
3. Properties:
   - Label: `Ich akzeptiere die Datenschutzbestimmungen`
   - Required: **Aktivieren** ✅
   - Key: `consent`

## Schritt 4: Webhook einrichten

1. Oben rechts im Formular klicke auf das **Zahnrad** ⚙️ (Settings)
2. Klicke im linken Menü auf **"Integrations"**
3. Scrolle herunter zu **"Webhooks"**
4. Klicke auf **"Add webhook"** oder **"Create webhook"**
5. Folgende Daten eintragen:
   - **Name**: `Voice to CRM Webhook`
   - **URL**: `https://deine-domain.com/api/tally-webhook`
   - **Events**: Wähle **"New submission"** (Bei neuer Antwort)
6. Klicke auf **"Create"** oder **"Save"**

> **WICHTIG**: Die URL musst du später aktualisieren, nachdem du die App deployt hast!
> Für lokale Tests: `http://localhost:3000/api/tally-webhook`

## Schritt 5: Formular veröffentlichen

1. Oben rechts klicke auf **"Publish"** oder **"Share"**
2. Du bekommst eine URL wie: `https://tally.so/r/xyz123`
3. Diese URL kannst du auf deiner Website teilen oder in Emails einbauen

## Schritt 6: Testen

1. Öffne die Formular-URL
2. Fülle das Formular aus
3. Klicke auf Absenden
4. Prüfe in Supabase unter "Table Editor" → "users", ob ein neuer User erstellt wurde
5. Prüfe deine Make.com Logs, ob der Webhook angekommen ist

---

## Die korrekten Field Keys (wichtig!)

Stelle sicher, dass diese Keys exakt so sind:

| Feld | Key |
|------|-----|
| E-Mail | `email` |
| Vorname | `firstName` |
| Nachname | `lastName` |
| Firma | `company` |
| Telefon | `phone` |
| Nachricht | `message` |
| Checkbox | `consent` |

**Wenn die Keys nicht stimmen, funktionieren die Webhooks nicht!**

---

## Alternative: Embed Code

Um das Formular in deine Website einzubetten:

```html
<iframe data-tally-src="https://tally.so/embed/DEINE_FORM_ID?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
  loading="lazy"
  width="100%"
  height="100"
  frameborder="0"
  marginheight="0"
  marginwidth="0"
  title="Lead Capture"></iframe>

<script>
var d=document,
w="https://tally.so/widgets/embed.js",
v=function(){
  "undefined"!=typeof Tally?
    Tally.loadEmbeds():
    d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){
      e.src=e.dataset.tallySrc
    }))
};
if("undefined"!=typeof Tally)v();
else if(d.querySelector('script[src="'+w+'"]')==null){
  var s=d.createElement("script");
  s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);
}
</script>
```

Ersetze `DEINE_FORM_ID` mit deiner echten Formular-ID aus der Tally-URL.
