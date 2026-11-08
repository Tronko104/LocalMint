# 🌱 LocalMint Chess

<p align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="LocalMint Chess Logo" />
</p>

<p align="center">
  <strong>Free, open-source mobile chess app styled after Chess.com, powered by 100% offline local Stockfish 19 NNUE engine.</strong>
</p>

<p align="center">
  <a href="https://github.com/Tronko104/LocalMint/releases/latest"><img src="https://img.shields.io/github/v/release/Tronko104/LocalMint?color=81b64c&label=Android%20APK" alt="Release" /></a>
  <a href="https://github.com/Tronko104/LocalMint/actions"><img src="https://img.shields.io/github/actions/workflow/status/Tronko104/LocalMint/build-apk.yml?branch=main&label=Build%20APK" alt="Build Status" /></a>
  <img src="https://img.shields.io/badge/Engine-Stockfish%2019%20NNUE%20(Local)-green" alt="Stockfish NNUE" />
  <img src="https://img.shields.io/badge/License-GPLv3-blue" alt="License" />
</p>

---

## 📥 Download the Android App (.APK)

You can download and install the standalone Android application directly onto any Android phone or tablet:

👉 **[Download LocalMint-Chess.apk (Latest Release)](https://github.com/Tronko104/LocalMint/releases/latest)**

*No subscriptions, no ads, no internet connection required.*

---

## 🇬🇧 English Description

**LocalMint Chess** is an authentic, pixel-perfect clone of the **Chess.com mobile app**, crafted for chess enthusiasts who want **unlimited Game Review, deep Stockfish analysis, tactical puzzles, and scalable Elo bots** running entirely on the device using WebAssembly and NNUE neural network evaluation.

### ✨ Key Features

1. **♟️ Play vs Adaptive Bots (Elo 250 to 3200+) & Pass & Play:**
   - Authentic Chess.com character bots with speech bubbles and personality quotes (Martin 250, Wendy 1100, Nelson 1300, Antonio 1500, Laura 1800, Stockfish 3200+).
   - In-game controls: Options, Resign, Hint (Best move arrows), and Undo.
   - Live real-time evaluation pill (`+0.4`, `-1.2`, `M2`).
   - Authentic 2-player Pass & Play on the same screen.

2. **📊 Full Game Review & Analysis Module:**
   - **Chess.com Public API Importer:** Enter any Chess.com username (e.g. *hikaru*, *magnuscarlsen*, or your own) to fetch your recent games and analyze them with one tap.
   - **PGN / FEN Manual Importer:** Paste any PGN or FEN position.
   - **Accuracy Percentage:** Sigmoidal accuracy score for White and Black matching the official Chess.com algorithm.
   - **Move Classification Badges:** Brilliant (💎), Best (⭐), Excellent (🟢), Good (🔵), Inaccuracy (🟡), Mistake (🟠), Blunder (🔴), Miss (❌), Book (📖).
   - **Interactive Advantage Area Chart:** Scannable evaluation graph showing game swings.

3. **🧩 Tactical Puzzle Trainer:**
   - 100+ curated tactical puzzles from the open-source Lichess CC0 database.
   - Puzzle rating progression (+12 for correct solution, -8 for failure) with streak tracking.
   - Automatic opponent responses and winning celebration effects.

4. **🎨 Chess.com Mobile Look & Feel:**
   - Official tournament vector pieces (Lichess `cburnett` set).
   - Exact 1:1 chessboard aspect ratio (no vertical stretching or distorted squares).
   - Android safe-area insets padding (notch and status bar icons never overlap game UI).
   - High-fidelity captured pieces trays with material advantage count (`+1`, `+3`).
   - Move history navigation ribbon.

5. **🔊 Zero-Latency Web Audio API:**
   - Realistic wooden piece movements, captures, checks, castling, and win sound effects synthesized locally.

6. **🌐 Bilingual Support (Italian & English):**
   - Automatically detects your device language (`it` or `en`).
   - Switch language at any time in **Settings**.

---

## 🇮🇹 Descrizione in Italiano

**LocalMint Chess** è un'applicazione mobile di scacchi open-source e gratuita, fedele all'interfaccia di **Chess.com**, ma progettata per eseguire il motore **Stockfish 19 NNUE interamente in locale e offline sul dispositivo**.

Questo ti permette di avere **analisi di partite illimitate, revisione mosse (Game Review), puzzle infiniti e bot a Elo scalabile senza alcun abbonamento o limitazione.**

### 🌟 Caratteristiche in evidenza:
- **Partite contro Bot iconici:** Martin, Wendy, Nelson, Antonio, Laura e Stockfish 19 NNUE con dialoghi a fumetto in tempo reale.
- **Game Review completa:** Classificazione di ogni mossa (Brillante, Migliore, Eccellente, Buona, Imprecisione, Errore, Blunder, Occasione Persa), percentuale di precisione e grafico del vantaggio.
- **Importatore Partite Chess.com:** Scarica e analizza qualsiasi partita pubblica inserendo il nome utente.
- **Scacchiera 1:1 fedele:** Pezzi ufficiali da torneo cburnett, coordinate integrate e tray dei pezzi catturati con conteggio del vantaggio materiale.
- **Bilingue (Italiano e Inglese):** Rilevamento automatico della lingua del telefono e lingua modificabile nelle impostazioni.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Chess Engine:** Stockfish 19 Lite WASM + Embedded NNUE Neural Network running in a dedicated Web Worker via standard UCI protocol.
- **Rules & Logic:** `chess.js` v1.0.
- **Audio:** Web Audio API zero-latency physical wood sound synthesizer.
- **Mobile Container:** Capacitor 8 Android.
- **CI/CD:** Automated GitHub Actions build pipeline creating standalone Android `.apk` artifacts and GitHub Releases on every push.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/Tronko104/LocalMint.git
cd LocalMint

# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build production web bundle & sync to Android
npm run build
npx cap sync android
```

---

## 📜 License & Credits

- **Code:** Open-source under [GPLv3](LICENSE).
- **Engine:** [Stockfish Chess](https://stockfishchess.org/) (GPLv3).
- **Puzzles:** [Lichess Open Database](https://database.lichess.org/#puzzles) (CC0 Public Domain).
- **Vector Pieces:** Official `cburnett` chess piece vectors (CC BY-SA 3.0).
