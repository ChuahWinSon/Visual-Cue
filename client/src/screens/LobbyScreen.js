import { useState } from "react";
import { useSocket } from "../SocketContext";
import styles from "./LobbyScreen.module.css";

export default function LobbyScreen({ onJoined }) {
  const { socket } = useSocket();
  const [tab, setTab] = useState("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) { setError("Enter your name"); return; }
    setLoading(true);
    socket.emit("create_room", { playerName: name.trim() }, (res) => {
      setLoading(false);
      if (res.success) onJoined(res.code, res.playerId, name.trim());
      else setError(res.error || "Failed to create room");
    });
  };

  const handleJoin = () => {
    if (!name.trim()) { setError("Enter your name"); return; }
    if (!code.trim()) { setError("Enter a room code"); return; }
    setLoading(true);
    socket.emit("join_room", { playerName: name.trim(), code: code.trim().toUpperCase() }, (res) => {
      setLoading(false);
      if (res.success) onJoined(res.code, res.playerId, name.trim());
      else setError(res.error || "Failed to join room");
    });
  };

  return (
    <div className={styles.lobby}>
      <div className={styles.title}>VISUAL CUE</div>
      <div className={styles.sub}>Guess the image</div>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === "create" ? styles.active : ""}`} onClick={() => { setTab("create"); setError(""); }}>Create Room</button>
          <button className={`${styles.tab} ${tab === "join" ? styles.active : ""}`} onClick={() => { setTab("join"); setError(""); }}>Join Room</button>
        </div>

        <label className={styles.label}>Your Name</label>
        <input
          className={styles.input}
          placeholder="Agent name…"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (tab === "create" ? handleCreate() : handleJoin())}
          maxLength={20}
        />

        {tab === "join" && (
          <>
            <label className={styles.label}>Room Code</label>
            <input
              className={`${styles.input} ${styles.codeInput}`}
              placeholder="XXXXXX"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              maxLength={6}
            />
          </>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <button
          className={styles.btn}
          onClick={tab === "create" ? handleCreate : handleJoin}
          disabled={loading}
        >
          {loading ? "Connecting…" : tab === "create" ? "Create Room" : "Join Room"}
        </button>
      </div>

      <div className={styles.howto}>
        <strong>How to play</strong><br />
        25 images on a board. Each team has a <em>Spymaster</em> who sees which images belong to which team.
        The Spymaster gives a clue by submitting an image + a number. Operatives guess which board images match.
        Guess the assassin and your team loses instantly!
      </div>
    </div>
  );
}
