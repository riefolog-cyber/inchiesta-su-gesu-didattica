# Inchiesta su Gesù — percorso didattico interattivo

Sito statico (HTML/CSS/JS, senza dipendenze da installare) per lo studio del
Gesù storico in **17 capitoli**, con quiz e attività di comprensione in ogni
tappa, glossario con definizioni al passaggio del mouse e verifica finale.

**Realizzato dal prof. Riefolo Giovanni**, docente IRC — IIS «Ferrari – Fermi» di Verona.

## Struttura

```
index.html            unica pagina del sito (tutto il percorso)
assets/css/style.css  foglio di stile
assets/js/app.js      motore delle attività (quiz, vero/falso, verifica, lightbox)
assets/img/           immagini del percorso
```

## Pubblicare su GitHub Pages (la prima volta)

1. Su <https://github.com> accedi (o crea un account gratuito).
2. Crea un **nuovo repository** con visibilità *Public*, per esempio
   `inchiesta-su-gesu` (senza README né altri file: lascialo vuoto).
3. Dalla cartella di questo progetto esegui:

   ```bash
   git remote add origin https://github.com/riefolog-cyber/inchiesta-su-gesu-didattica.git
   git push -u origin main
   ```

   Alla prima spinta si apre la finestra di accesso di GitHub: autorizza
   il browser. (In alternativa, con la CLI: `gh repo create` ecc.)
4. **Settings → Pages → Branch**: seleziona `main` e la cartella `/ (root)`,
   poi *Save*. Dopo 1–2 minuti il sito sarà online su:

   `https://riefolog-cyber.github.io/inchiesta-su-gesu-didattica/`

> Il sito usa percorsi relativi, quindi funziona sia dentro una sottocartella
> sia come repository `TUO-UTENTE.github.io`.

## Aggiornare il sito

Dopo ogni modifica ai file, esegui:

```bash
git add -A
git commit -m "Aggiornamento contenuti"
git push
```

Il caricamento su Pages si aggiorna automaticamente in pochi minuti.
(CONSEGLIO: se cambi solo contenuto testuale non serve toccare nulla altro;
se cambi CSS o JS, incrementa il valore `?v=` nei collegamenti di `index.html`
per far dimenticare al browser la vecchia copia.)

## Come registrarsi i progressi degli studenti

Le risposte completate (attività e verifica) vengono salvate solo nel
dispositivo dello studente (`localStorage`): nessuna registrazione, nessun
dato inviato da nessuna parte. Per azzerare i progressi basta cancellare
i dati del sito dalle impostazioni del browser.

---

© IIS «Ferrari – Fermi» di Verona — materiale per l'uso didattico.
