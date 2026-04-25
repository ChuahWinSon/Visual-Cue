# 🎮 Image Names — Visual Codenames

Real-time multiplayer image-based Codenames. Players create or join rooms, pick a seat (Red/Blue × Spymaster/Operative), and play a visual version of Codenames where clues are images you find yourself.

---

## 📁 Project Structure

```
imagenames/
├── server/          ← Node.js + Socket.io backend → deploy to Render
│   ├── index.js
│   ├── package.json
│   └── render.yaml
└── client/          ← React frontend → deploy to Vercel
    ├── public/index.html
    ├── src/
    │   ├── App.js
    │   ├── SocketContext.js
    │   ├── images.js
    │   └── screens/
    │       ├── LobbyScreen.js / .module.css
    │       ├── RoomScreen.js  / .module.css
    │       └── GameScreen.js  / .module.css
    ├── package.json
    └── vercel.json
```

---

## 🚀 Deployment (Render + Vercel — both free)

### STEP 1 — Deploy Backend to Render

1. Go to **https://render.com** → sign up free
2. Push the `server/` folder to a GitHub repo
3. In Render: **New** → **Web Service** → connect your repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Environment:** Node
5. Add environment variable:
   ```
   FRONTEND_URL = *
   ```
   (Update this after deploying frontend)
6. Click **Create Web Service**
7. Wait ~2 min — copy your Render URL, e.g.:
   ```
   https://imagenames-server.onrender.com
   ```

> ⚠️ **Render free tier spins down after 15 min of inactivity.** First request after idle takes ~30s. Upgrade to a paid plan ($7/mo) to keep it always-on, or use a free uptime monitor like UptimeRobot to ping it every 10 min.

---

### STEP 2 — Deploy Frontend to Vercel

1. Go to **https://vercel.com** → sign up free
2. Push the `client/` folder to a GitHub repo
3. Vercel: **New Project** → import your repo
4. Add environment variable:
   ```
   REACT_APP_SERVER_URL = https://imagenames-server.onrender.com
   ```
5. Click **Deploy**
6. Copy your Vercel URL, e.g. `https://imagenames.vercel.app`

---

### STEP 3 — Connect them

1. Go back to **Render** → your service → **Environment**
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://imagenames.vercel.app
   ```
3. Render redeploys automatically

✅ **Done!** Share your Vercel URL and play.

---

## 💻 Running Locally

```bash
# Terminal 1 — backend
cd server
npm install
node index.js         # runs on :3001

# Terminal 2 — frontend
cd client
npm install
npm start             # runs on :3000, auto-connects to :3001
```

Open multiple tabs to test multiplayer locally.

---

## 🎮 How to Play

| Role | What they do |
|------|-------------|
| **Spymaster** | Sees color key for all 25 board images. Gives clues by uploading/linking a custom image + a number |
| **Operative** | Clicks board images they think match the spymaster's clue image |

### Flow
1. Board = 25 images (9 red, 8 blue, 7 neutral, 1 💀 assassin)
2. Only spymasters see the color key
3. Spymaster uploads a clue image (URL or file) + a number (1–9)
4. Operatives click board images they think relate to the clue
5. Correct → keep guessing. Wrong → turn ends. Assassin → instant loss
6. First team to find all their images wins
7. Win screen → everyone clicks "Return to Lobby" to play again

---

## 🔧 Customisation

**Add board images** — edit both `server/index.js` and `client/src/images.js`:
```js
{ id: "img31", url: "https://...", label: "Label" }
```

**Keep Render from sleeping** — add your Render URL to [UptimeRobot](https://uptimerobot.com) (free) with a 10-min ping interval.
