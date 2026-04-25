# Visual Cue

A multiplayer online game, visual adaptation of codenames where clues are images you find yourself.

---

## Project Structure

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

## Deployment (Render + Vercel)

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


---

## Running Locally

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

## Customisation

**Add board images** — edit both `server/index.js` and `client/src/images.js`:
```js
{ id: "img31", url: "https://...", label: "Label" }
```

