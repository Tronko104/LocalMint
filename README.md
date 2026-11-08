# 🌱 LocalMint Chess

**LocalMint Chess** è un'applicazione mobile di scacchi open-source e gratuita, ispirata all'interfaccia di **Chess.com**, ma progettata per eseguire il motore **Stockfish 19 NNUE interamente in locale e offline sul dispositivo**.

Questo ti permette di avere **analisi di partite illimitate, revisione mosse (Game Review), puzzle infiniti e bot a Elo scalabile senza alcun abbonamento o limitazione.**

---

## ✨ Funzionalità Principali

### 1. ♟️ Gioca contro Bot a Elo Scalabile o in 2 Giocatori
- **Galleria Bot Ispirata a Chess.com:**
  - **Martin (250 Elo):** Principiante assoluto, commette errori e regala pezzi.
  - **Wayne (500 Elo):** Principiante che sta apprendendo lo sviluppo.
  - **Elena (800 Elo):** Giocatrice casual amatoriale.
  - **Nelson (1300 Elo):** Il temuto bot che gioca la Regina aggressiva al turno 2.
  - **Antonio (1500 Elo):** Gioco posizionale solido e controllo del centro.
  - **Laura WFM (1800 Elo):** Attacchi acuti e punizione degli errori.
  - **Grandmaster Bot (2500 Elo):** Calcolo tattico da Gran Maestro.
  - **Stockfish 19 NNUE (3200+ Elo):** La massima potenza del motore scacchistico.
- **Slider Elo Personalizzato (250 - 3200):** Scegli qualsiasi livello di difficoltà desiderato.
- **Barra di Valutazione in tempo reale (Evaluation Bar):** Valutazione numerica dinamica (`+2.4`, `-1.1`, `M3`).
- **Pulsanti veloci:** Suggerimento mossa migliore (💡), Ritira mossa (↩️), Ruota scacchiera (🔄), Resa (🏳️).

### 2. 📊 Modulo Analisi & Revisione Partita (Game Review Stile Chess.com)
- **Importazione Automatica da Chess.com (PubAPI):**
  - Inserisci qualsiasi username di Chess.com (es. il tuo handle, *hikaru*, *magnuscarlsen*) per scaricare lo storico partite del mese corrente ed eseguire l'analisi con un tocco.
- **Caricamento PGN o FEN manuale.**
- **Accuratezza di Gioco (% Precisione):**
  - Calcolo della precisione per Bianco e Nero con formula sigmoidea identica a quella ufficiale.
- **Classificazione delle mosse con badge ufficiali:**
  - 💎 **Brillante (Brilliant):** Sacrificio posizionale vincente.
  - ⭐ **Migliore (Best):** La mossa top del motore.
  - 🟢 **Eccellente (Excellent):** Mossa quasi alla pari della migliore.
  - 🔵 **Buona (Good):** Mossa solida.
  - 🟡 **Imprecisione (Inaccuracy):** Concede un piccolo vantaggio.
  - 🟠 **Errore (Mistake):** Compromette la posizione.
  - 🔴 **Blunder (Grave Errore):** Perde materiale o ribalta la partita.
  - ❌ **Occasione Persa (Miss):** Mancato scacco matto o tattica forzata.
  - 📖 **Libro (Book):** Teoria di apertura.
- **Grafico Interattivo del Vantaggio (Advantage Graph):**
  - Grafico vettoriale ad area navigabile con cursore per saltare istantaneamente alla mossa desiderata.
- **Frecce dei Migliori Tratti (Best Move Arrows):**
  - Frecce visive sulla scacchiera che illustrano cosa avrebbe giocato Stockfish.

### 3. 🧩 Allenamento Tattico (Puzzle Trainer)
- Database locale integrato di **100+ problemi tattici open-source (CC0)** tratti dalla banca dati di Lichess.
- **Progressione Rating:** Parti da 1200 Elo e scala la classifica risolvendo problemi (+12 punti per successo, -8 per errore).
- **Contatore Serie (Streak):** Monitora le combinazioni consecutive risolte.
- **Risposta Automatica dell'Avversario:** L'app muove in automatico la difesa e ti chiede di chiudere la combinazione.
- **Effetto Vittoria:** Confetti animati e suoni di trionfo.

### 4. 🔊 Audio & Design Fedele
- Palette colori ufficiale dark (`#302e2b` / `#262522`) e scacchiera classica verde Chess.com (`#779952` / `#edeed1`).
- Suoni di gioco realistici sintetizzati a bassissima latenza via **Web Audio API** (nessun file audio esterno da scaricare):
  - Suono mossa legno naturale, cattura, scacco d'allarme, arrocco e vittoria.
- 4 Temi Scacchiera selezionabili (Verde Chess.com, Legno Scuro, Ghiaccio Polare, Blu Torneo).

---

## 🚀 Come Eseguire l'Applicazione

### Test Rapido nel Browser (Modalità Web & PWA)
L'applicazione è sviluppata con **Vite + React + TypeScript + Capacitor**:

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

Apri `http://localhost:5173` nel browser o sul cellulare (in rete locale). L'app è una **PWA completa** e può essere installata direttamente sulla schermata iniziale di Android/iOS come una vera app nativa.

---

### Creazione dell'APK per Android (Capacitor)
Il progetto è già pre-configurato con `@capacitor/android` nella cartella `android/`:

1. Genera la build web:
   ```bash
   npm run build
   npx cap sync
   ```

2. Apri il progetto in **Android Studio**:
   ```bash
   npx cap open android
   ```

3. In Android Studio, clicca su **Build → Build Bundle(s) / APK(s) → Build APK(s)** per ottenere il file `.apk` installabile direttamente su qualsiasi dispositivo Android.

---

## 📜 Licenza e Crediti
- **Codice Progetto:** Rilasciato sotto licenza libera open-source.
- **Motore:** [Stockfish](https://stockfishchess.org/) (GPLv3).
- **Puzzle:** [Lichess Open Database](https://database.lichess.org/#puzzles) (CC0 - Pubblico Dominio).
- **Asset Pezzi:** Vettoriali SVG basati sullo standard Staunton aperto CC-BY-SA.
