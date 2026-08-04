# CursorStrike 🎯

**CursorStrike** is an ornate 2D physics web game built with **Phaser 3** and **Matter.js**. The player's mouse acts as a physical cue-ball collider (a circle sensor) to strike a main ball up jump ramps, past dynamic obstacles, and into goals across 10 progressively challenging levels.

---

## 🌟 Key Features

* **Physics Engine**: Mouse velocity tracking with throw-bias impulse and angular momentum ($I = \frac{1}{2} M r^2$).
* **10 Progressive Levels**: Featuring jump ramps, moving platforms, static hazards, puzzle gates, and patrolling hazards.
* **Victorian / Art Nouveau UI**: Custom vector scrollwork frame rendering with progress tracking and star rewards.
* **Procedural Web Audio Engine**: Pure Web Audio API audio synthesis for cue strikes, wall impacts, rolling rumbles, goal chimes, and UI clicks.
* **Local Network Play**: Host binding to `0.0.0.0:3000` for human play across devices on the same Wi-Fi / LAN.

---

## 🚀 Quick Start Guide

### Option 1: Node.js 20 LTS via NVM (Recommended)

If you don't have Node.js or `npm` installed, we recommend using **NVM (Node Version Manager)** on Ubuntu:

#### 1. Install NVM
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```

#### 2. Load NVM into your terminal session
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

#### 3. Install and set Node.js 20 LTS
```bash
nvm install 20
nvm use 20
```

#### 4. Start the Server
```bash
npm start
# or
node server.js
```

---

### Option 2: Instant Server (Zero Installation Required)

Since Python 3 is pre-installed on Ubuntu, you can serve the game immediately without installing Node or `npm`:

```bash
python3 -m http.server 3000 --bind 0.0.0.0
```

---

## 🌐 Playing from Other Devices on Your Network

Once the server is running, open a browser on any desktop, laptop, tablet, or phone on the same Wi-Fi / LAN network:

* **Via IP Address**: `http://192.168.1.111:3000`
* **Via Hostname**: `http://laptop:3000` *(or `http://laptop.local:3000`)*
* **Via Localhost**: `http://localhost:3000`

---

## 🛠️ Changing Your Ubuntu Hostname to `laptop`

To change your computer's network name from `mark-hp` to `laptop` so you can type `http://laptop:3000` in any browser on your network, run the following commands in your Ubuntu terminal:

```bash
# 1. Update system hostname
sudo hostnamectl set-hostname laptop

# 2. Update local hosts mapping
sudo sed -i 's/mark-hp/laptop/g' /etc/hosts

# 3. Restart network discovery (optional, or reboot)
sudo systemctl restart systemd-hostnamed
```

Once updated, devices on your network will be able to access the game at:
```text
http://laptop:3000   or   http://laptop.local:3000
```

---

## 📂 Project Structure

```text
cursor-strike/
├── README.md               # Quick start & network access guide
├── package.json            # npm scripts & dependency config
├── server.js               # Standalone Node HTTP server (bound to 0.0.0.0:3000)
├── index.html              # Main HTML entry point & canvas layout
├── init_prompt.md          # 3-Tier Maker-Checker architecture prompt
├── src/
│   ├── main.js             # Phaser 3 Game configuration
│   ├── physics/            # Matter.js cue ball & cursor collider physics
│   ├── levels/             # Levels 1 through 10 schemas & obstacle definitions
│   ├── scenes/             # Boot, Main Menu, Level Select, GamePlay, & Level Complete
│   ├── ui/                 # ScrollworkRenderer, HUD, and PauseMenu
│   ├── audio/              # SoundSynthesizer, AudioManager, and sound effects
│   └── styles/             # Global CSS styling
```
