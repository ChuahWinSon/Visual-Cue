import { useState, useEffect } from "react";
import { SocketProvider, useSocket } from "./SocketContext";
import LobbyScreen from "./screens/LobbyScreen";
import RoomScreen from "./screens/RoomScreen";
import GameScreen from "./screens/GameScreen";
import { useMusicPlayer } from "./MusicPlayer";
import Soundboard, { SoundboardListener, useSoundboard } from "./Soundboard";

function Inner() {
  const { socket, connected } = useSocket();
  const [screen, setScreen] = useState("lobby");
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [gameState, setGameState] = useState(null);
  const [roomState, setRoomState] = useState(null);

  // Initialize music player once at the top level so it persists across screens
  const music = useMusicPlayer();
  const isMaster = useSoundboard(playerName);

  useEffect(() => {
    const saved = sessionStorage.getItem("imagenames_session");
    if (saved && socket) {
      const { code, pid, name } = JSON.parse(saved);
      setRoomCode(code); setPlayerId(pid); setPlayerName(name);
      socket.emit("rejoin_room", { code, playerId: pid }, (res) => {
        if (res.success) setScreen("room");
        else sessionStorage.removeItem("imagenames_session");
      });
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const onGameUpdate = (data) => {
      setGameState(data);
      setScreen((prev) => (prev === "room" ? "game" : prev));
    };
    socket.on("game_update", onGameUpdate);
    return () => socket.off("game_update", onGameUpdate);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const onRoomUpdate = (data) => {
      setRoomState(data);
      if (!data.gameStarted) setScreen((prev) => (prev === "game" ? "room" : prev));
    };
    socket.on("room_update", onRoomUpdate);
    return () => socket.off("room_update", onRoomUpdate);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const onGoToLobby = () => {
      setGameState(null);
      setScreen("room");
    };
    socket.on("go_to_lobby", onGoToLobby);
    return () => socket.off("go_to_lobby", onGoToLobby);
  }, [socket]);

  const saveSession = (code, pid, name) =>
    sessionStorage.setItem("imagenames_session", JSON.stringify({ code, pid, name }));

  const handleJoined = (code, pid, name) => {
    setRoomCode(code); setPlayerId(pid); setPlayerName(name);
    saveSession(code, pid, name);
    setScreen("room");
  };

  const handleLeaveRoom = () => {
    if (socket) socket.emit("leave_room");
    sessionStorage.removeItem("imagenames_session");
    setRoomCode(null); setPlayerId(null); setPlayerName("");
    setGameState(null); setRoomState(null);
    setScreen("lobby");
  };

  return (
    <div>
      <SoundboardListener />
      {isMaster && <Soundboard />}
      {!connected && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
          background: "#b02430", color: "white", textAlign: "center",
          padding: "0.4rem", fontSize: "0.8rem", fontWeight: 600,
        }}>⚠ Connecting to server…</div>
      )}
      {screen === "lobby" && <LobbyScreen onJoined={handleJoined} music={music} />}
      {screen === "room" && (
        <RoomScreen
          code={roomCode} playerId={playerId} playerName={playerName}
          roomState={roomState} onLeave={handleLeaveRoom} music={music}
        />
      )}
      {screen === "game" && (
        <GameScreen
          code={roomCode} playerId={playerId}
          initialGame={gameState} initialRoom={roomState} music={music}
        />
      )}
    </div>
  );
}

export default function App() {
  return <SocketProvider><Inner /></SocketProvider>;
}
