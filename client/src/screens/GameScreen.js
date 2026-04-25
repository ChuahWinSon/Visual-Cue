import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "../SocketContext";
import { SettingsButton } from "../MusicPlayer";
import styles from "./GameScreen.module.css";

// Compress + resize an image file to a base64 string safe for socket transport.
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height / width) * MAX); width = MAX; }
        else { width = Math.round((width / height) * MAX); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

// Solid placeholder images shown after a card is revealed
const REVEAL_PLACEHOLDERS = {
  red:      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23e63946'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='56' font-family='sans-serif'%3E🔴%3C/text%3E%3C/svg%3E",
  blue:     "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23457b9d'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='56' font-family='sans-serif'%3E🔵%3C/text%3E%3C/svg%3E",
  neutral:  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23c8b8a0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='56' font-family='sans-serif'%3E⬜%3C/text%3E%3C/svg%3E",
  assassin: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23111111'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='56' font-family='sans-serif'%3E%F0%9F%92%80%3C/text%3E%3C/svg%3E",
};

// Overlay colors for the game-over reveal (shown on top of original image)
const ROLE_OVERLAY_STYLE = {
  red:      { border: "4px solid #e63946", boxShadow: "0 0 0 2px #e63946, inset 0 0 0 2px #e63946" },
  blue:     { border: "4px solid #457b9d", boxShadow: "0 0 0 2px #457b9d, inset 0 0 0 2px #457b9d" },
  neutral:  { border: "4px solid #c8b8a0", boxShadow: "0 0 0 2px #c8b8a0" },
  assassin: { border: "4px solid #111",    boxShadow: "0 0 0 2px #111" },
};

const ROLE_BADGE = {
  red:      { bg: "#e63946", label: "🔴 RED" },
  blue:     { bg: "#457b9d", label: "🔵 BLUE" },
  neutral:  { bg: "#c8b8a0", label: "⬜ NEUTRAL", color: "#333" },
  assassin: { bg: "#111",    label: "💀 ASSASSIN" },
};

export default function GameScreen({ code, playerId, initialGame, initialRoom, music }) {
  const { socket } = useSocket();
  const [game, setGame] = useState(initialGame || null);
  const [room, setRoom] = useState(initialRoom || null);
  const [selectedNum, setSelectedNum] = useState(1);
  const [customUrl, setCustomUrl] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const urlInputRef = useRef(null);

  useEffect(() => { if (initialGame) setGame(initialGame); }, [initialGame]);
  useEffect(() => { if (initialRoom) setRoom(initialRoom); }, [initialRoom]);

  useEffect(() => {
    if (!socket) return;
    socket.on("game_update", setGame);
    socket.on("room_update", setRoom);
    return () => { socket.off("game_update", setGame); socket.off("room_update", setRoom); };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const t = setTimeout(() => { if (!game) socket.emit("get_game_state"); }, 800);
    return () => clearTimeout(t);
  }, [socket, game]);

  // Paste handler (Ctrl+V image from clipboard)
  const handlePaste = useCallback(async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        setUploadError(null);
        try {
          const compressed = await compressImage(file);
          setUploadPreview(compressed);
          setCustomUrl("");
          setCustomMode(true);
        } catch {
          setUploadError("Could not load pasted image. Try a URL instead.");
        }
        return;
      }
    }
    const text = e.clipboardData?.getData("text");
    if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
      setCustomUrl(text);
      setUploadPreview(null);
      setCustomMode(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  if (!game) return <div className={styles.loading}>Loading game…</div>;

  const players = room?.players || [];
  const me = players.find(p => p.id === playerId);
  const isSpymaster = me?.role === "spymaster";
  const isSpectator = !me?.team || me?.role === "spectator";
  const myTeam = me?.team;
  const isMyTurn = game.currentTeam === myTeam;
  const isSpymasterTurn = isSpymaster && isMyTurn && game.phase === "spymaster_clue";
  const isOperativeTurn = me?.role === "operative" && isMyTurn && game.phase === "operatives_guess";
  const gameOver = game.phase === "game_over";

  // At game over, operatives (and everyone) can see all card roles
  const canSeeAllRoles = isSpymaster || gameOver;

  // Clue helpers
  const getClueUrl = () => uploadPreview || (customUrl.trim() ? customUrl.trim() : null);
  const previewUrl = getClueUrl();
  const canSubmit = !!previewUrl;

  const submitClue = () => {
    const url = getClueUrl();
    if (!url) return;
    setUploadError(null);
    try {
      socket.emit("submit_clue", { imageUrl: url, number: selectedNum });
    } catch (err) {
      setUploadError("Failed to send clue. Please try again.");
      return;
    }
    setCustomUrl(""); setUploadPreview(null); setSelectedNum(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError(null);
    try {
      const compressed = await compressImage(file);
      setUploadPreview(compressed);
      setCustomUrl("");
    } catch (err) {
      setUploadError("Could not load image. Please try a different file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearClue = () => {
    setCustomUrl(""); setUploadPreview(null); setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const guessCard = (i) => {
    if (!isOperativeTurn || game.images[i].revealed) return;
    socket.emit("guess_card", { cardIndex: i });
  };

  const endTurn = () => socket.emit("end_turn");
  const returnToLobby = () => socket.emit("request_lobby");
  const endForAll = () => socket.emit("end_game_for_all");

  // Left panel
  const renderLeftPanel = () => {
    if (gameOver) {
      return (
        <div className={styles.leftPanel}>
          <div className={styles.gameOverPanel}>
            <div className={styles.goEmoji}>{game.winner === "red" ? "🔴" : "🔵"}</div>
            <div className={`${styles.goTitle} ${styles[`win_${game.winner}`]}`}>{game.winner?.toUpperCase()} WINS!</div>
            <div className={styles.goReason}>{game.winReason}</div>
            {/* Reveal legend for operatives */}
            {!isSpymaster && (
              <div style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "0.6rem 0.8rem",
                marginTop: "0.7rem",
                marginBottom: "0.4rem",
                fontSize: "0.78rem",
                lineHeight: 1.6,
                textAlign: "left",
              }}>
                <div style={{ fontWeight: 700, marginBottom: "0.3rem", opacity: 0.85 }}>🗺 Board Revealed</div>
                {Object.entries(ROLE_BADGE).map(([role, { bg, label, color }]) => (
                  <div key={role} style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                    <span style={{ background: bg, color: color || "white", borderRadius: "4px", padding: "0 0.35rem", fontSize: "0.72rem", fontWeight: 700 }}>{label}</span>
                    <span style={{ opacity: 0.7 }}>= {role} card</span>
                  </div>
                ))}
                <div style={{ marginTop: "0.4rem", opacity: 0.6 }}>Coloured borders show each card's team.</div>
              </div>
            )}
            <button className={styles.returnBtn} onClick={returnToLobby}>Return to Lobby</button>
            {room?.host === playerId && (
              <button className={styles.endAllBtn} onClick={endForAll}>End for Everyone</button>
            )}
            <div className={styles.pendingNote}>Only you will return. Others can keep viewing.</div>
          </div>
        </div>
      );
    }

    if (isSpymasterTurn) {
      return (
        <div className={styles.leftPanel}>
          <div className={styles.panelLabel}>🕵️ Submit Your Clue</div>
          <div className={styles.pasteHint}>💡 Ctrl+V to paste an image directly from Google</div>

          <div className={styles.bigPreviewBox}>
            {previewUrl
              ? <img src={previewUrl} alt="clue preview" className={styles.bigPreviewImg} />
              : <div className={styles.bigPreviewEmpty}>
                  <span>Image preview</span>
                  <span className={styles.bigPreviewSub}>Paste (Ctrl+V), drop a URL, or upload</span>
                </div>
            }
            {previewUrl && (
              <button className={styles.clearPreviewBtn} onClick={clearClue}>✕</button>
            )}
          </div>

          <div className={styles.uploadTabs}>
            <button className={`${styles.uploadTab} ${!customMode ? styles.uploadTabActive : ""}`}
              onClick={() => { setCustomMode(false); clearClue(); }}>🔗 URL</button>
            <button className={`${styles.uploadTab} ${customMode ? styles.uploadTabActive : ""}`}
              onClick={() => { setCustomMode(true); clearClue(); }}>📁 Upload</button>
          </div>

          {!customMode ? (
            <input
              ref={urlInputRef}
              className={styles.urlInput}
              placeholder="Paste image URL from Google Images…"
              value={customUrl}
              onChange={e => { setCustomUrl(e.target.value); setUploadPreview(null); }}
            />
          ) : (
            <>
              <input ref={fileInputRef} type="file" accept="image/*"
                onChange={handleFileUpload} className={styles.fileInput} id="clue-file" />
              <label htmlFor="clue-file" className={styles.fileLabel}>
                {uploadPreview ? "✓ Image loaded" : "Click to choose a file…"}
              </label>
            </>
          )}

          <div className={styles.numRow}>
            <label className={styles.numLabel}>How many images match?</label>
            <input type="number" min={1} max={9} value={selectedNum}
              onChange={e => setSelectedNum(Math.max(1, Math.min(9, parseInt(e.target.value) || 1)))}
              className={styles.numBox} />
          </div>

          <button className={styles.submitBtn} onClick={submitClue} disabled={!canSubmit}>
            Submit Clue
          </button>
          {room?.host === playerId && (
            <button className={styles.endAllBtn} onClick={endForAll} style={{ marginTop: "1rem" }}>
              ↩ Return Everyone to Lobby
            </button>
          )}
          {uploadError && (
            <div style={{ color: "#e63946", fontSize: "0.8rem", marginTop: "0.4rem", textAlign: "center" }}>
              ⚠️ {uploadError}
            </div>
          )}
        </div>
      );
    }

    if (game.phase === "operatives_guess" && game.clue) {
      return (
        <div className={styles.leftPanel}>
          <div className={styles.panelLabel}>🎯 Current Clue</div>
          <div className={styles.bigPreviewBox}>
            <img src={game.clue.imageUrl} alt="clue" className={styles.bigPreviewImg} />
          </div>
          <div className={styles.clueNumDisplay}>
            <span className={styles.clueNumBig}>{game.clue.number}</span>
            <span className={styles.clueNumSub}>images to find</span>
          </div>
          {isOperativeTurn && (
            <>
              <div className={`${styles.guessLeftBadge} ${styles[`guessLeft_${game.currentTeam}`]}`}>
                {game.guessesLeft} guess{game.guessesLeft !== 1 ? "es" : ""} remaining
              </div>
              <button className={styles.endTurnBtn} onClick={endTurn}>End Turn</button>
            </>
          )}
          {room?.host === playerId && (
            <button className={styles.endAllBtn} onClick={endForAll} style={{ marginTop: "1rem" }}>
              ↩ Return Everyone to Lobby
            </button>
          )}
          {isSpectator && <div className={styles.spectatorNote}>👁 Spectating</div>}
        </div>
      );
    }

    return (
      <div className={styles.leftPanel}>
        <div className={styles.panelLabel}>⏳ Waiting</div>
        <div className={styles.waitingMsg}>
          {!isMyTurn && !isSpectator && `Waiting for ${game.currentTeam} spymaster…`}
          {isMyTurn && me?.role === "operative" && "Your spymaster is submitting a clue…"}
          {isMyTurn && isSpymaster && game.phase === "operatives_guess" && "Your operatives are guessing…"}
          {isSpectator && `Watching — ${game.currentTeam} team's turn`}
        </div>
        {game.clue && (
          <div className={styles.bigPreviewBox} style={{ marginTop: "0.5rem" }}>
            <img src={game.clue.imageUrl} alt="clue" className={styles.bigPreviewImg} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.screen}>
      {/* Topbar */}
      <div className={styles.topbar}>
        <div className={styles.scores}>
          <div className={`${styles.score} ${styles.scoreRed}`}>🔴 {game.redLeft}</div>
          <div className={`${styles.score} ${styles.scoreBlue}`}>🔵 {game.blueLeft}</div>
        </div>
        <div className={styles.brandName}>VISUAL CUE</div>
        <div className={styles.turnInfo}>
          <span className={`${styles.turnDot} ${styles[`dot_${game.currentTeam}`]}`} />
          <span>{game.currentTeam.toUpperCase()} TEAM</span>
          <span className={styles.phaseText}>
            {gameOver ? "· Game Over" : game.phase === "spymaster_clue" ? "· Spymaster thinking…" : `· Guessing (${game.guessesLeft} left)`}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {me && (
            <div className={`${styles.myRole} ${isSpymaster ? styles.spyRole : isSpectator ? styles.specRole : styles.opRole} ${styles[`role_${myTeam || "none"}`]}`}>
              {isSpymaster ? "🕵️ Spymaster" : isSpectator ? "👁 Spectator" : "🔍 Operative"}{myTeam ? ` · ${myTeam}` : ""}
            </div>
          )}
          {/* Settings button in topbar */}
          <SettingsButton music={music} />
        </div>
      </div>

      {/* Banner */}
      {!gameOver && (
        <div className={`${styles.banner} ${styles[`banner_${game.currentTeam}`]}`}>
          {isSpymasterTurn && "Your turn — submit a clue image in the left panel (Ctrl+V to paste from Google Images)"}
          {isOperativeTurn && `Your turn — click images that match the clue (${game.guessesLeft} guess${game.guessesLeft !== 1 ? "es" : ""} left)`}
          {!isMyTurn && !isSpectator && `Waiting for ${game.currentTeam} team…`}
          {isMyTurn && isSpymaster && game.phase === "operatives_guess" && "Your operatives are guessing…"}
          {isMyTurn && me?.role === "operative" && game.phase === "spymaster_clue" && "Your spymaster is submitting a clue…"}
          {isSpectator && `Watching — ${game.currentTeam} team's turn`}
        </div>
      )}

      {/* Game-over reveal banner for operatives */}
      {gameOver && !isSpymaster && (
        <div style={{
          background: "linear-gradient(90deg, #1a1a2e, #16213e)",
          borderBottom: "2px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.9)",
          textAlign: "center",
          padding: "0.5rem 1rem",
          fontSize: "0.85rem",
          fontWeight: 600,
          letterSpacing: "0.03em",
        }}>
          🗺 Game over — all cards are now revealed! Coloured borders show each card's true team.
        </div>
      )}

      <div className={styles.body}>
        {renderLeftPanel()}

        {/* Board */}
        <div className={styles.boardArea}>
          <div className={styles.boardInner}>
            <div className={styles.grid}>
              {game.images.map((card, i) => {
                const revealed = card.revealed;
                const canGuess = isOperativeTurn && !revealed && !gameOver;

                // Spymasters always see borders; at game over everyone sees borders
                const spyBorderClass = canSeeAllRoles ? styles[`spyBorder_${card.role}`] : "";
                const revealedClass  = revealed ? styles[`revealed_${card.role}`] : "";

                return (
                  <div key={i}
                    className={[styles.card, revealedClass, spyBorderClass,
                      canGuess ? styles.canGuess : styles.noGuess].filter(Boolean).join(" ")}
                    onClick={() => canGuess && guessCard(i)}
                    style={{ position: "relative" }}
                  >
                    {revealed
                      ? <img src={REVEAL_PLACEHOLDERS[card.role]} alt={card.role} className={styles.cardImg} />
                      : <img src={card.url} alt={card.label} className={styles.cardImg} loading="lazy" />
                    }

                    {/* Game-over badge: show role label on unrevealed cards for non-spymasters */}
                    {gameOver && !isSpymaster && !revealed && (
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: ROLE_BADGE[card.role]?.bg || "#333",
                        color: ROLE_BADGE[card.role]?.color || "white",
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        textAlign: "center",
                        padding: "0.18rem 0",
                        letterSpacing: "0.05em",
                        borderBottomLeftRadius: "inherit",
                        borderBottomRightRadius: "inherit",
                      }}>
                        {ROLE_BADGE[card.role]?.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className={styles.rightPanel}>
          <div className={styles.panelSection}>
            <div className={styles.panelLabel}>Players</div>
            {players.map(p => (
              <div className={styles.playerRow} key={p.id}>
                <span className={p.team === "red" ? styles.dotRed : p.team === "blue" ? styles.dotBlue : styles.dotGray}>●</span>
                <span className={styles.pname}>{p.name}{p.id === playerId ? " ★" : ""}</span>
                <span className={`${styles.ptag} ${p.role === "spymaster" ? styles.spy : p.role === "spectator" ? styles.spec : styles.op}`}>
                  {p.role || "—"}
                </span>
                {p.pendingLobby && <span className={styles.inGameDot} title="Still in game">🎮</span>}
              </div>
            ))}
          </div>
          <div className={styles.log}>
            <div className={styles.panelLabel}>Game Log</div>
            {game.log.map((e, i) => (
              <div key={i} className={`${styles.logEntry} ${styles[`log_${e.type}`]}`}>{e.text}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
