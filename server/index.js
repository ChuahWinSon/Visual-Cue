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
  { id: "img01", url: "/images/ace.jpg", label: "Ace" },
  { id: "img02", url: "/images/acoustic.jpg", label: "Acoustic" },
  { id: "img03", url: "/images/angry.jpg", label: "Angry" },
  { id: "img04", url: "/images/apple.jpg", label: "Apple" },
  { id: "img05", url: "/images/bat.jpg", label: "Bat" },
  { id: "img06", url: "/images/beach.jpg", label: "Beach" },
  { id: "img07", url: "/images/bed.jpg", label: "Bed" },
  { id: "img08", url: "/images/beer.jpg", label: "Beer" },
  { id: "img09", url: "/images/bigfoot.jpg", label: "Bigfoot" },
  { id: "img10", url: "/images/bills.jpg", label: "Bills" },
  { id: "img11", url: "/images/boxing.jpg", label: "Boxing" },
  { id: "img12", url: "/images/breakfast.jpg", label: "Breakfast" },
  { id: "img13", url: "/images/buddha.jpg", label: "Buddha" },
  { id: "img14", url: "/images/bunnygirl.jpg", label: "Bunnygirl" },
  { id: "img15", url: "/images/carving.jpg", label: "Carving" },
  { id: "img16", url: "/images/cat.jpg", label: "Cat" },
  { id: "img17", url: "/images/caution.jpg", label: "Caution" },
  { id: "img18", url: "/images/charizard.jpg", label: "Charizard" },
  { id: "img19", url: "/images/chick.jpg", label: "Chick" },
  { id: "img20", url: "/images/clock.jpg", label: "Clock" },
  { id: "img21", url: "/images/cloudy.jpg", label: "Cloudy" },
  { id: "img22", url: "/images/condo.jpg", label: "Condo" },
  { id: "img23", url: "/images/cooking.jpg", label: "Cooking" },
  { id: "img24", url: "/images/cube.jpg", label: "Cube" },
  { id: "img25", url: "/images/dap.jpg", label: "Dap" },
  { id: "img26", url: "/images/dilapitated.jpg", label: "Dilapitated" },
  { id: "img27", url: "/images/dinosaur.jpg", label: "Dinosaur" },
  { id: "img28", url: "/images/disk.jpg", label: "Disk" },
  { id: "img29", url: "/images/eggman.jpg", label: "Eggman" },
  { id: "img30", url: "/images/f1.jpg", label: "F1" },
  { id: "img31", url: "/images/fighting.jpg", label: "Fighting" },
  { id: "img32", url: "/images/food.jpg", label: "Food" },
  { id: "img33", url: "/images/football.jpg", label: "Football" },
  { id: "img34", url: "/images/forbidden.jpg", label: "Forbidden" },
  { id: "img35", url: "/images/garden.jpg", label: "Garden" },
  { id: "img36", url: "/images/graduation.jpg", label: "Graduation" },
  { id: "img37", url: "/images/graffiti.jpg", label: "Graffiti" },
  { id: "img38", url: "/images/guy.jpg", label: "Guy" },
  { id: "img39", url: "/images/hallowknight.jpg", label: "Hallowknight" },
  { id: "img40", url: "/images/handshake.jpg", label: "Handshake" },
  { id: "img41", url: "/images/hoop.jpg", label: "Hoop" },
  { id: "img42", url: "/images/house.jpg", label: "House" },
  { id: "img43", url: "/images/initiald.jpg", label: "Initiald" },
  { id: "img44", url: "/images/junkyard.jpg", label: "Junkyard" },
  { id: "img45", url: "/images/kanye.jpg", label: "Kanye" },
  { id: "img46", url: "/images/lab.jpg", label: "Lab" },
  { id: "img47", url: "/images/laundry.jpg", label: "Laundry" },
  { id: "img48", url: "/images/lego.jpg", label: "Lego" },
  { id: "img49", url: "/images/library.jpg", label: "Library" },
  { id: "img50", url: "/images/lighthouse.jpg", label: "Lighthouse" },
  { id: "img51", url: "/images/lighting.jpg", label: "Lighting" },
  { id: "img52", url: "/images/mahjong.jpg", label: "Mahjong" },
  { id: "img53", url: "/images/map.jpg", label: "Map" },
  { id: "img54", url: "/images/mario.jpg", label: "Mario" },
  { id: "img55", url: "/images/math.jpg", label: "Math" },
  { id: "img56", url: "/images/mcd.jpg", label: "Mcd" },
  { id: "img57", url: "/images/mcqueen.jpg", label: "Mcqueen" },
  { id: "img58", url: "/images/meeting.jpg", label: "Meeting" },
  { id: "img59", url: "/images/memory.jpg", label: "Memory" },
  { id: "img60", url: "/images/mnm.jpg", label: "Mnm" },
  { id: "img61", url: "/images/monalisa.jpg", label: "Monalisa" },
  { id: "img62", url: "/images/mountain.jpg", label: "Mountain" },
  { id: "img63", url: "/images/mushtache.jpg", label: "Mushtache" },
  { id: "img64", url: "/images/ninjago.jpg", label: "Ninjago" },
  { id: "img65", url: "/images/olympics.jpg", label: "Olympics" },
  { id: "img66", url: "/images/orange.jpg", label: "Orange" },
  { id: "img67", url: "/images/parachute.jpg", label: "Parachute" },
  { id: "img68", url: "/images/pasarpagi.jpg", label: "Pasarpagi" },
  { id: "img69", url: "/images/plane.jpg", label: "Plane" },
  { id: "img70", url: "/images/pregnant.jpg", label: "Pregnant" },
  { id: "img71", url: "/images/prime.jpg", label: "Prime" },
  { id: "img72", url: "/images/protractor.jpg", label: "Protractor" },
  { id: "img73", url: "/images/pvz.jpg", label: "Pvz" },
  { id: "img74", url: "/images/raid.jpg", label: "Raid" },
  { id: "img75", url: "/images/riot.jpg", label: "Riot" },
  { id: "img76", url: "/images/rock.jpg", label: "Rock" },
  { id: "img77", url: "/images/rose.jpg", label: "Rose" },
  { id: "img78", url: "/images/shapes.jpg", label: "Shapes" },
  { id: "img79", url: "/images/shark.jpg", label: "Shark" },
  { id: "img80", url: "/images/shrine.jpg", label: "Shrine" },
  { id: "img81", url: "/images/slenderman.jpg", label: "Slenderman" },
  { id: "img82", url: "/images/sneakers.jpg", label: "Sneakers" },
  { id: "img83", url: "/images/sniper.jpg", label: "Sniper" },
  { id: "img84", url: "/images/snoopy.jpg", label: "Snoopy" },
  { id: "img85", url: "/images/solarsystem.jpg", label: "Solarsystem" },
  { id: "img86", url: "/images/stairwell.jpg", label: "Stairwell" },
  { id: "img87", url: "/images/stationary.jpg", label: "Stationary" },
  { id: "img88", url: "/images/statue.jpg", label: "Statue" },
  { id: "img89", url: "/images/stocks.jpg", label: "Stocks" },
  { id: "img90", url: "/images/street.jpg", label: "Street" },
  { id: "img91", url: "/images/suit.jpg", label: "Suit" },
  { id: "img92", url: "/images/swim.jpg", label: "Swim" },
  { id: "img93", url: "/images/taylor.jpg", label: "Taylor" },
  { id: "img94", url: "/images/tictactoe.jpg", label: "Tictactoe" },
  { id: "img95", url: "/images/tornado.jpg", label: "Tornado" },
  { id: "img96", url: "/images/tower.jpg", label: "Tower" },
  { id: "img97", url: "/images/ugly.jpg", label: "Ugly" },
  { id: "img98", url: "/images/war.jpg", label: "War" },
  { id: "img99", url: "/images/wavelength.jpg", label: "Wavelength" },
  { id: "img100", url: "/images/wedding.jpeg", label: "Wedding" },
  { id: "img101", url: "/images/weights.jpg", label: "Weights" },
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

  socket.on("play_sound", ({ file }) => {
    const { roomCode } = socket.data;
    if (!roomCode || !rooms[roomCode]) return;
    io.to(roomCode).emit("play_sound", { file });
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
