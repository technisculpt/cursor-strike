# CursorStrike 🎯

[![Play Live on GitHub Pages](https://img.shields.io/badge/Play%20Live-GitHub%20Pages-00FF00?style=for-the-badge&logo=github)](https://technisculpt.github.io/cursor-strike/)

**CursorStrike** is a Victorian & Art Nouveau 2D physics arcade web game built with **Phaser 3** and **Matter.js**. Use your mouse or mobile touch pointer as a physical striker puck to control, curve, and launch a white ball through obstacle-filled arenas and into ornate Golf Hole Cups.

---

## 🎮 Play Live in Your Browser
👉 **[https://technisculpt.github.io/cursor-strike/](https://technisculpt.github.io/cursor-strike/)**  
*(No installation or downloads required — works on desktop, laptops, tablets, and mobile devices!)*

---

## 🌟 Key Features & Physics Systems

### ⚽ Soccer-Style Ball Control & Cushion Trapping
* **Soft Trapping**: When your striker puck is resting or moving slowly (`puck speed < 2.0`), the ball cushions gently against the puck instead of popping away. This lets you trap rolling balls, gain control, and line up power shots!
* **Power Strikes**: Flicking your mouse quickly imparts a high-impulse strike vector to launch the ball across the field.

### 🌀 Magnus Aerodynamic Backspin Lift & Curves
* **Spin Transfer**: Slicing the ball tangentially transfers rotational torque ($I = \frac{1}{2} M r^2$).
* **Magnus Aerodynamics**: Backspin creates real aerodynamic lift counteracting gravity, allowing chip shots to float through the air or curve past obstacles like a soccer banana kick.

### ⛳ Golf Hole Cup Goals
* All rectangular flags are replaced with circular **Golf Hole Cups** featuring ornate brass rims (`#C9A84C`), inner dark cup depressions, glowing target rings, and vertical pin poles with pennants.
* The ball must roll/land directly inside the 30px circular cup radius to trigger goal completion!

---

## 🕹️ Game Modes

### 1. 🏆 20-Level Single-Player Campaign
* 20 progressively challenging levels featuring jump ramps, moving platforms, puzzle gates, crusher hazards, and patrolling bird obstacles.
* Earn up to 3 stars per level based on strike count and time.

### 2. 🌐 Serverless Internet P2P Multiplayer (WebRTC)
* **Play Anywhere**: Connect directly with friends anywhere on the web — zero server required!
* **Short Share Codes**: Host generates a 5-character code (e.g., `cs-4k8x2`). Share the code over Discord or text, and your friend connects instantly.
* **Peer-to-Peer DataChannel**: All game inputs and 60 FPS physics stream directly browser-to-browser via WebRTC (PeerJS).

### 3. 🖥️ Cross-LAN Server Multiplayer (Optional)
* Run `node server.js` to host a server-authoritative physics room for high-frequency low-latency play on your local Wi-Fi / LAN network.
* **Smart Server Auto-Detection**: The web client automatically probes your local network and reveals the `MULTIPLAYER (LAN)` menu option when a local server is running!

### 3 Symmetrical Arenas
All multiplayer modes feature 3 100% fair and symmetrical maps:
1. **Classic Defense**: Central barrier blocking direct 1-shot goals.
2. **Pinball Bumper Alley**: Central archway and angled rubber bumpers for high-speed deflect shots.
3. **Quad Pillar Gauntlet**: Symmetrical diamond obstacle and 4 interior pillars for tactical bank shots.

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/technisculpt/cursor-strike.git
cd cursor-strike
npm install
```

### 2. Run Vite Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build Production Web Bundle
```bash
npm run build
```

### 4. (Optional) Run Authoritative LAN Multiplayer Server
```bash
node server.js
```

---

## 📂 Project Architecture

```text
cursor-strike/
├── index.html              # Main HTML entry point & PeerJS / Phaser scripts
├── package.json            # npm build scripts & dependencies
├── server.js               # Node.js Matter.js server-authoritative physics server
├── src/
│   ├── main.js             # Phaser 3 game configuration & scene registry
│   ├── physics/
│   │   ├── CursorPhysics.js  # Puck tracking, soft trapping, & torque transfer
│   │   └── BallPhysics.js    # Cue ball creation & Magnus aerodynamic force
│   ├── arenas/             # 3 Symmetrical multiplayer arena definitions
│   ├── levels/             # 20 Single-player campaign level schemas
│   ├── ui/
│   │   ├── ScrollworkRenderer.js  # Ornate frames, cartouches, & Golf Hole Cups
│   │   └── HUD.js          # Campaign cartouche scores, timers, & stars
│   ├── audio/              # Web Audio API procedural sound synthesizer
│   └── scenes/             # Boot, MainMenu, LevelSelect, GamePlay, P2PMultiplayer, LAN Lobby
```

---

## 📜 License

Distributed under the MIT License. Built with Phaser 3 & Matter.js.
