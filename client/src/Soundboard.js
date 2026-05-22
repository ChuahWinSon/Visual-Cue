import { useEffect, useRef, useState } from "react";
import { useSocket } from "./SocketContext";

const SECRET_NAME = "winson222";

// Add your audio files to /public/audio/ and update the list below.
// Each file should be e.g. /audio/sound1.mp3, /audio/sound2.mp3 etc.
const SOUNDS = [
  { emoji: "1️⃣", label: "HEHEHEHA", file: "/audio/sound1.mp3" },
  { emoji: "2️⃣", label: "Discord Join", file: "/audio/sound2.mp3" },
  { emoji: "3️⃣(feng)", label: "No you guys join us ", file: "/audio/feng1.mp3" },
  { emoji: "4️⃣", label: "I have a stratergy bro", file: "/audio/feng2.mp3" },
  { emoji: "5️⃣(keith)", label: "I believe thats me ", file: "/audio/keith1.mp3" },
  { emoji: "6️⃣", label: "BRO WINSON", file: "/audio/keith2.mp3" },
  { emoji: "7️⃣(jayden)", label: "the game is ass", file: "/audio/jayden1.mp3" },
  { emoji: "8️⃣", label: "hes lyin bro", file: "/audio/jayden2.mp3" },
  { emoji: "9️⃣", label: "what u guys playin", file: "/audio/matt.mp3" },
];

export function useSoundboard(playerName) {
  return playerName?.trim().toLowerCase() === SECRET_NAME.toLowerCase();
}

// Listens for incoming play_sound events and plays the audio for everyone.
// Rendered for ALL players (invisibly), not just winson222.
export function SoundboardListener() {
  const { socket } = useSocket();
  const audioRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ file }) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(file);
      audio.volume = 0.3;
      audio.play().catch(() => {});
      audioRef.current = audio;
    };
    socket.on("play_sound", handler);
    return () => socket.off("play_sound", handler);
  }, [socket]);

  return null;
}

// The actual soundboard UI — only rendered for winson222.
export default function Soundboard() {
  const { socket } = useSocket();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(null);

  const triggerSound = (sound, idx) => {
    if (!socket) return;
    socket.emit("play_sound", { file: sound.file });
    setPlaying(idx);
    setTimeout(() => setPlaying(null), 1500);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Secret Soundboard"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9000,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: open
            ? "linear-gradient(135deg, #e63946, #c1121f)"
            : "linear-gradient(135deg, #f4a261, #e76f51)",
          border: "2px solid rgba(255,255,255,0.2)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          color: "white",
          fontSize: "1.4rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        {open ? "✕" : "🎛️"}
      </button>

      {/* Soundboard panel */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: "5rem",
          right: "1.5rem",
          zIndex: 8999,
          background: "#14131f",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "16px",
          padding: "1.2rem",
          width: "260px",
          boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
          color: "white",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem", opacity: 0.8 }}>
            🎛️ Soundboard
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {SOUNDS.map((s, i) => (
              <button
                key={i}
                onClick={() => triggerSound(s, i)}
                style={{
                  background: playing === i
                    ? "linear-gradient(135deg, #e63946, #c1121f)"
                    : "rgba(255,255,255,0.08)",
                  border: playing === i
                    ? "1px solid rgba(230,57,70,0.6)"
                    : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "white",
                  cursor: "pointer",
                  padding: "0.65rem 0.4rem",
                  fontSize: "0.78rem",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  textAlign: "center",
                  transition: "all 0.15s",
                  lineHeight: 1.4,
                }}
              >
                <div style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}>{s.emoji}</div>
                {playing === i ? "▶ Playing…" : s.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: "0.9rem" }}>
            👑 plays for everyone in the room
          </div>
        </div>
      )}
    </>
  );
}
