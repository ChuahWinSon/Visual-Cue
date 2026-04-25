const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || "*";
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
const io = new Server(server, { cors: { origin: FRONTEND_URL, methods: ["GET", "POST"] } });

const IMAGE_DB = [
  { id: "img01", url: "/images/Mountain.jpg", label: "Mountain" },
  { id: "img02", url: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=300&h=200&fit=crop", label: "Dog" },
  { id: "img03", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop", label: "Cat" },
  { id: "img04", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop", label: "Man" },
  { id: "img05", url: "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=300&h=200&fit=crop", label: "Running" },
  { id: "img06", url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=200&fit=crop", label: "Pencils" },
  { id: "img07", url: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=300&h=200&fit=crop", label: "Breakfast" },
  { id: "img08", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop", label: "Food" },
  { id: "img09", url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&h=200&fit=crop", label: "Sneakers" },
  { id: "img10", url: "https://images.unsplash.com/photo-1446776899648-aa78eefe8ed0?w=300&h=200&fit=crop", label: "Space" },
  { id: "img11", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=200&fit=crop", label: "Laptop" },
  { id: "img12", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop", label: "Sofa" },
  { id: "img13", url: "https://images.unsplash.com/photo-1532009324734-20a7a5813719?w=300&h=200&fit=crop", label: "Books" },
  { id: "img14", url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&h=200&fit=crop", label: "Waterfall" },
  { id: "img15", url: "https://images.unsplash.com/photo-1535083783855-aaab87a64168?w=300&h=200&fit=crop", label: "Elephant" },
  { id: "img16", url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=300&h=200&fit=crop", label: "Beach" },
  { id: "img17", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=200&fit=crop", label: "Code" },
  { id: "img18", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop", label: "Sunset Beach" },
  { id: "img19", url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=200&fit=crop", label: "Camera" },
  { id: "img20", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop", label: "Skateboard" },
  { id: "img21", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&h=200&fit=crop", label: "Forest" },
  { id: "img22", url: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=300&h=200&fit=crop", label: "Clock" },
  { id: "img23", url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop", label: "Gym" },
  { id: "img24", url: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=300&h=200&fit=crop", label: "Guitar" },
  { id: "img25", url: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=300&h=200&fit=crop", label: "Coffee" },
  { id: "img26", url: "https://images.unsplash.com/photo-1473090826765-d54ac2fdc1eb?w=300&h=200&fit=crop", label: "Umbrella" },
  { id: "img27", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=200&fit=crop", label: "Woman" },
  { id: "img28", url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=300&h=200&fit=crop", label: "Desert" },
  { id: "img29", url: "https://images.unsplash.com/photo-1529693662653-9d480530a697?w=300&h=200&fit=crop", label: "City Street" },
  { id: "img30", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=200&fit=crop", label: "Weights" },
  { id: "img31", url: "/images/Graffiti.jpg", label: "Graffiti" },
  { id: "img32", url: "/images/Garden.jpg", label: "Garden" },
  { id: "img33", url: "/images/Graduation.jpg", label: "Graduation" },
];

const rooms = {};

function generateCode(len = 6) {
  return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function createGame() {
  const images = shuffle(IMAGE_DB).slice(0, 25);
  const roles = [...Array(9).fill("red"), ...Array(8).fill("blue"), ...Array(7).fill("neutral"), "assassin"];
  const key = shuffle(roles);
  return {
    images: images.map((img, i) => ({ ...img, role: key[i], revealed: false })),
    currentTeam: "red",
    phase: "spymaster_clue",
    clue: null,
    guessesLeft: 0,
    winner: null,
    winReason: null,
    redLeft: 9,
    blueLeft: 8,
    log: [{ type: "system", text: "Game started! Red team goes first." }],
  };
}
function sanitizeGameForOperative(game) {
  if (!game) return null;
  const gameOver = game.phase === "game_over";
  return {
    ...game,
    images: game.images.map((img) => ({
      ...img,
      role: (img.revealed || gameOver) ? img.role : "hidden",
    })),
  };
}
function switchTurn(g) {
  g.currentTeam = g.currentTeam === "red" ? "blue" : "red";
  g.phase = "spymaster_clue";
  g.clue = null;
  g.guessesLeft = 0;
}

// Send correct game view to a single player socket
function sendGameToPlayer(room, player) {
  const targetSocket = io.sockets.sockets.get(player.socketId);
  if (!targetSocket || !room.game) return;
  const isSpymaster = player.role === "spymaster";
  // Spectators get operative view (no key)
  const payload = isSpymaster ? room.game : sanitizeGameForOperative(room.game);
  targetSocket.emit("game_update", payload);
}

app.get("/", (req, res) => res.json({ status: "ok", rooms: Object.keys(rooms).length }));

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on("create_room", ({ playerName }, callback) => {
    const code = generateCode();
    const playerId = generateCode(8);
    rooms[code] = {
      code, host: playerId,
      // role: null = unassigned, "spectator" = spectator
      players: [{ id: playerId, name: playerName, team: null, role: null, socketId: socket.id, pendingLobby: false }],
      game: null,
    };
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerId = playerId;
    callback({ success: true, code, playerId });
    emitRoomUpdate(code);
  });

  socket.on("join_room", ({ code, playerName }, callback) => {
    const room = rooms[code];
    if (!room) return callback({ success: false, error: "Room not found. Check the code." });
    const playerId = generateCode(8);
    room.players.push({ id: playerId, name: playerName, team: null, role: null, socketId: socket.id, pendingLobby: false });
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerId = playerId;
    callback({ success: true, code, playerId });
    emitRoomUpdate(code);
    // If game is running, send the game state to the new joiner (as operative/spectator view)
    if (room.game) {
      socket.emit("game_update", sanitizeGameForOperative(room.game));
    }
  });

  socket.on("rejoin_room", ({ code, playerId }, callback) => {
    const room = rooms[code];
    if (!room) return callback({ success: false, error: "Room expired." });
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return callback({ success: false, error: "Player not found." });
    player.socketId = socket.id;
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerId = playerId;
    callback({ success: true });
    emitRoomUpdate(code);
    if (room.game) sendGameToPlayer(room, player);
  });

  // ── SELECT SEAT — exclusive: seat must be empty ────────────────────────────
  socket.on("select_seat", ({ team, role }, callback) => {
    const { roomCode, playerId } = socket.data;
    const room = rooms[roomCode];
    if (!room) return callback?.({ success: false, error: "Room not found." });
    if (room.game) return callback?.({ success: false, error: "Game already in progress." });

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return callback?.({ success: false, error: "Player not found." });

    // role === "spectator" → just set team/role
    if (role === "spectator") {
      player.team = null;
      player.role = "spectator";
      emitRoomUpdate(roomCode);
      return callback?.({ success: true });
    }

    // Check seat is not already taken by someone else
    const seatHolder = room.players.find((p) => p.team === team && p.role === role && p.id !== playerId);
    if (seatHolder) {
      return callback?.({ success: false, error: `That seat is taken by ${seatHolder.name}. They need to leave first.` });
    }

    player.team = team;
    player.role = role;
    player.pendingLobby = false;
    emitRoomUpdate(roomCode);
    callback?.({ success: true });
  });

  // ── LEAVE SEAT → go to unassigned ─────────────────────────────────────────
  socket.on("leave_seat", () => {
    const { roomCode, playerId } = socket.data;
    const room = rooms[roomCode];
    if (!room) return;
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;
    player.team = null;
    player.role = null;
    player.pendingLobby = false;
    emitRoomUpdate(roomCode);
  });

  socket.on("start_game", (_, callback) => {
    const { roomCode, playerId } = socket.data;
    const room = rooms[roomCode];
    if (!room) return callback?.({ success: false, error: "Room not found." });
    if (room.host !== playerId) return callback?.({ success: false, error: "Only the host can start." });
    const redSpy = room.players.find((p) => p.team === "red" && p.role === "spymaster");
    const blueSpy = room.players.find((p) => p.team === "blue" && p.role === "spymaster");
    const redOp = room.players.find((p) => p.team === "red");
    const blueOp = room.players.find((p) => p.team === "blue");
    if (!redSpy || !blueSpy || !redOp || !blueOp) {
      return callback?.({ success: false, error: "Need at least 1 player + 1 Spymaster per team." });
    }
    room.game = createGame();
    // Clear pending flags
    room.players.forEach(p => p.pendingLobby = true);
    callback?.({ success: true });
    emitGameUpdate(roomCode);
  });

  socket.on("submit_clue", ({ imageUrl, number }) => {
    const { roomCode, playerId } = socket.data;
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const g = room.game;
    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.role !== "spymaster" || player.team !== g.currentTeam) return;
    if (g.phase !== "spymaster_clue") return;
    if (!imageUrl) return;
    const num = Math.max(1, Math.min(9, parseInt(number) || 1));
    g.clue = { imageUrl, number: num, team: g.currentTeam };
    g.guessesLeft = num + 1;
    g.phase = "operatives_guess";
    g.log.unshift({ type: g.currentTeam, text: `${player.name} submitted a clue (×${num})` });
    emitGameUpdate(roomCode);
  });

  socket.on("guess_card", ({ cardIndex }) => {
    const { roomCode, playerId } = socket.data;
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const g = room.game;
    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.role !== "operative" || player.team !== g.currentTeam) return;
    if (g.phase !== "operatives_guess") return;
    const card = g.images[cardIndex];
    if (!card || card.revealed) return;
    card.revealed = true;

    if (card.role === "assassin") {
      g.phase = "game_over";
      g.winner = g.currentTeam === "red" ? "blue" : "red";
      g.winReason = `${player.name} hit the 💀 assassin!`;
      g.log.unshift({ type: "win", text: `💀 ${player.name} hit the assassin! ${g.winner.toUpperCase()} wins!` });
      emitGameUpdate(roomCode); return;
    }
    if (card.role === g.currentTeam) {
      if (g.currentTeam === "red") g.redLeft--; else g.blueLeft--;
      g.log.unshift({ type: g.currentTeam, text: `${player.name} found a ${g.currentTeam} agent! ✓` });
      if (g.redLeft <= 0) { g.phase = "game_over"; g.winner = "red"; g.winReason = "All red agents found!"; emitGameUpdate(roomCode); return; }
      if (g.blueLeft <= 0) { g.phase = "game_over"; g.winner = "blue"; g.winReason = "All blue agents found!"; emitGameUpdate(roomCode); return; }
      g.guessesLeft--;
      if (g.guessesLeft <= 0) { g.log.unshift({ type: "system", text: "Out of guesses — switching turn." }); switchTurn(g); }
    } else {
      if (card.role === "red") g.redLeft--; if (card.role === "blue") g.blueLeft--;
      g.log.unshift({ type: "system", text: `${player.name} guessed wrong (${card.role}) — turn over.` });
      if (g.redLeft <= 0) { g.phase = "game_over"; g.winner = "red"; g.winReason = "All red agents found!"; emitGameUpdate(roomCode); return; }
      if (g.blueLeft <= 0) { g.phase = "game_over"; g.winner = "blue"; g.winReason = "All blue agents found!"; emitGameUpdate(roomCode); return; }
      switchTurn(g);
    }
    emitGameUpdate(roomCode);
  });

  socket.on("end_turn", () => {
    const { roomCode, playerId } = socket.data;
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const g = room.game;
    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.team !== g.currentTeam || g.phase !== "operatives_guess") return;
    g.log.unshift({ type: "system", text: `${player.name} ended the turn.` });
    switchTurn(g);
    emitGameUpdate(roomCode);
  });

  // ── PERSONAL return to lobby — marks this player as pending, doesn't affect others ──
  socket.on("request_lobby", () => {
    const { roomCode, playerId } = socket.data;
    const room = rooms[roomCode];
    if (!room) return;
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;
    player.pendingLobby = false; // this player has returned, no longer pending
    // Tell just this socket to go back to the room screen
    socket.emit("go_to_lobby");
    // Tell everyone else the pending status changed
    emitRoomUpdate(roomCode);
  });

  // Host can end the game for everyone (new game button)
  socket.on("end_game_for_all", () => {
    const { roomCode, playerId } = socket.data;
    const room = rooms[roomCode];
    if (!room || room.host !== playerId) return;
    room.game = null;
    room.players.forEach(p => p.pendingLobby = false);
    emitRoomUpdate(roomCode);
  });

  socket.on("get_game_state", () => {
    const { roomCode, playerId } = socket.data;
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;
    sendGameToPlayer(room, player);
    emitRoomUpdate(roomCode);
  });

  socket.on("leave_room", () => {
    const { roomCode, playerId } = socket.data;
    const room = rooms[roomCode];
    if (!room) return;
    room.players = room.players.filter((p) => p.id !== playerId);
    socket.leave(roomCode);
    socket.data.roomCode = null;
    socket.data.playerId = null;
    if (room.players.length === 0) {
      delete rooms[roomCode];
    } else {
      if (room.host === playerId) room.host = room.players[0].id;
      emitRoomUpdate(roomCode);
    }
  });

  socket.on("disconnect", () => {
    const { roomCode, playerId } = socket.data;
    if (!roomCode || !rooms[roomCode]) return;
    const room = rooms[roomCode];
    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.players.length === 0) {
      delete rooms[roomCode]; console.log(`Room ${roomCode} deleted`);
    } else {
      if (room.host === playerId) room.host = room.players[0].id;
      emitRoomUpdate(roomCode);
    }
  });
});

function emitRoomUpdate(code) {
  const room = rooms[code];
  if (!room) return;
  io.to(code).emit("room_update", {
    code: room.code, host: room.host,
    players: room.players.map(({ id, name, team, role, pendingLobby }) => ({ id, name, team, role, pendingLobby })),
    gameStarted: !!room.game,
  });
}

function emitGameUpdate(code) {
  const room = rooms[code];
  if (!room || !room.game) return;
  room.players.forEach((player) => sendGameToPlayer(room, player));
  emitRoomUpdate(code);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
