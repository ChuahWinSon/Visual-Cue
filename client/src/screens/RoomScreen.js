import { useState, useEffect } from "react";
import { useSocket } from "../SocketContext";
import styles from "./RoomScreen.module.css";

// Order: Red Spy, Blue Spy (top row) | Red Op, Blue Op (bottom row)
const SEATS = [
  { team: "red",  role: "spymaster", label: "🕵️ Red Spymaster",  colorClass: "seatRedSpy"  },
  { team: "blue", role: "spymaster", label: "🕵️ Blue Spymaster", colorClass: "seatBlueSpy" },
  { team: "red",  role: "operative", label: "🔴 Red Operative",   colorClass: "seatRedOp"   },
  { team: "blue", role: "operative", label: "🔵 Blue Operative",  colorClass: "seatBlueOp"  },
];

export default function RoomScreen({ code, playerId, roomState, onLeave }) {
  const { socket } = useSocket();
  const [room, setRoom] = useState(roomState || null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [seatError, setSeatError] = useState("");

  useEffect(() => { if (roomState) setRoom(roomState); }, [roomState]);
  useEffect(() => {
    if (!socket) return;
    const onRoomUpdate = (data) => setRoom(data);
    socket.on("room_update", onRoomUpdate);
    return () => socket.off("room_update", onRoomUpdate);
  }, [socket]);

  if (!room) return (
    <div className={styles.loading}><div className={styles.loadingText}>Connecting to room {code}…</div></div>
  );

  const me = room.players.find(p => p.id === playerId);
  const isHost = room.host === playerId;

  // Players per seat
  const inSeat = (team, role) => room.players.filter(p => p.team === team && p.role === role);
  const unassigned = room.players.filter(p => !p.team && p.role !== "spectator");
  const spectators = room.players.filter(p => p.role === "spectator");
  const pendingPlayers = room.players.filter(p => p.pendingLobby);

  const redSpies  = inSeat("red", "spymaster");
  const blueSpies = inSeat("blue", "spymaster");
  const redOps    = inSeat("red", "operative");
  const blueOps   = inSeat("blue", "operative");
  const canStart  = redSpies.length === 1 && blueSpies.length === 1 &&
                    (redOps.length + redSpies.length) >= 1 &&
                    (blueOps.length + blueSpies.length) >= 1;

  const seatPlayers = { red_spymaster: redSpies, blue_spymaster: blueSpies, red_operative: redOps, blue_operative: blueOps };

  const selectSeat = (team, role) => {
    setSeatError("");
    socket.emit("select_seat", { team, role }, (res) => {
      if (res && !res.success) setSeatError(res.error);
    });
  };

  const leaveSeat = () => {
    setSeatError("");
    socket.emit("leave_seat");
  };

  const becomeSpectator = () => {
    setSeatError("");
    socket.emit("select_seat", { team: null, role: "spectator" }, () => {});
  };

  const startGame = () => {
    setError("");
    socket.emit("start_game", {}, (res) => {
      if (res && !res.success) setError(res.error);
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const myActive = (team, role) => me?.team === team && me?.role === role;
  const iAmSeated = me?.team && (me?.role === "operative" || me?.role === "spymaster");
  const iAmSpectator = me?.role === "spectator";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>VISUAL CUE</div>
          <div className={styles.subtitle}>Waiting for players…</div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.codeBadge}>
            <div>
              <div className={styles.codeLabel}>Room Code</div>
              <div className={styles.codeValue}>{code}</div>
            </div>
            <button className={styles.copyBtn} onClick={copyCode}>{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          <button className={styles.leaveBtn} onClick={onLeave}>← Leave Room</button>
        </div>
      </div>

      {/* 4-box seat grid: top row = spymasters, bottom row = operatives */}
      <div className={styles.seatGrid}>
        {SEATS.map(({ team, role, label, colorClass }) => {
          const key = `${team}_${role}`;
          const seated = seatPlayers[key] || [];
          const isMine = myActive(team, role);
          const isFull = seated.length >= 1;

          return (
            <div key={key} className={`${styles.seatBox} ${styles[colorClass]} ${isMine ? styles.seatBoxMine : ""}`}>
              <div className={styles.seatLabel}>{label}</div>
              <div className={styles.seatPlayers}>
                {seated.length === 0
                  ? <div className={styles.seatEmpty}>Empty</div>
                  : seated.map(p => (
                    <div key={p.id} className={styles.seatPlayer}>
                      {p.name}{p.id === playerId ? " ★" : ""}
                      {p.pendingLobby && <span className={styles.pendingTag}>in game</span>}
                    </div>
                  ))
                }
              </div>
              {isMine ? (
                <button className={`${styles.joinBtn} ${styles.leavesSeatBtn}`} onClick={leaveSeat}>
                  ✓ Joined — Leave Seat
                </button>
              ) : (
                <button
                  className={`${styles.joinBtn} ${styles[`joinBtn_${colorClass}`]} ${isFull ? styles.joinBtnFull : ""}`}
                  onClick={() => !isFull && selectSeat(team, role)}
                  disabled={isFull}
                  title={isFull ? `Taken by ${seated[0]?.name}` : `Join as ${label}`}
                >
                  {isFull ? `Taken — ${seated[0]?.name}` : "Join"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {seatError && <div className={styles.seatError}>⚠ {seatError}</div>}

      {/* Unassigned + Spectators area */}
      <div className={styles.bottomRow}>
        <div className={styles.poolBox}>
          <div className={styles.poolLabel}>🪑 Unassigned</div>
          <div className={styles.poolPlayers}>
            {unassigned.length === 0 && <span className={styles.poolEmpty}>None</span>}
            {unassigned.map(p => (
              <span key={p.id} className={styles.poolChip}>
                {p.name}{p.id === playerId ? " ★" : ""}
                {p.pendingLobby && <span className={styles.pendingTag}>in game</span>}
              </span>
            ))}
          </div>
          {(iAmSeated || iAmSpectator) && (
            <button className={styles.poolBtn} onClick={leaveSeat}>Move to Unassigned</button>
          )}
        </div>

        <div className={styles.poolBox}>
          <div className={styles.poolLabel}>👁 Spectators</div>
          <div className={styles.poolPlayers}>
            {spectators.length === 0 && <span className={styles.poolEmpty}>None</span>}
            {spectators.map(p => (
              <span key={p.id} className={styles.poolChip}>
                {p.name}{p.id === playerId ? " ★" : ""}
              </span>
            ))}
          </div>
          {!iAmSpectator && (
            <button className={styles.poolBtn} onClick={becomeSpectator}>Watch as Spectator</button>
          )}
        </div>

        {pendingPlayers.length > 0 && (
          <div className={styles.poolBox}>
            <div className={styles.poolLabel}>🎮 Still in Game</div>
            <div className={styles.poolPlayers}>
              {pendingPlayers.map(p => (
                <span key={p.id} className={styles.poolChip + " " + styles.pendingChip}>
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.rules}>
        <strong>📖 How to Play</strong>
        {" "}Each team needs a <strong>Spymaster</strong> (sees the board key) and at least one <strong>Operative</strong>.
        The Spymaster gives a clue by submitting an image + number. Operatives click board images they think match.
        Hit 💀 assassin = instant loss. First team to find all their images wins!
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {isHost ? (
        <>
          <button className={styles.startBtn} onClick={startGame} disabled={!canStart}>
            🚀 Start Game
          </button>
          {!canStart && <div className={styles.hint}>Each team needs exactly 1 Spymaster to start</div>}
        </>
      ) : (
        <div className={styles.hint}>Waiting for host ({room.players.find(p => p.id === room.host)?.name}) to start…</div>
      )}
    </div>
  );
}
