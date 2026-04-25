import { useEffect, useRef, useState, useCallback } from "react";

// List of audio files to try (in order). Add your file to /public/audio/ and list it here.
const AUDIO_CANDIDATES = [
  "/audio/background.mp3",
  "/audio/background.ogg",
  "/audio/background.wav",
  "/audio/background.m4a",
  "/audio/music.mp3",
  "/audio/music.ogg",
];

// Shared state across components (module-level so it persists across screens)
let sharedVolume = parseFloat(localStorage.getItem("vc_volume") ?? "0.1");
let sharedMuted  = localStorage.getItem("vc_muted") === "true";

/**
 * useMusicPlayer — call once near the top of your app tree.
 * Returns { volume, muted, setVolume, toggleMute, audioReady }
 * The audio element is created once and reused.
 */
let audioEl = null; // singleton

export function useMusicPlayer() {
  const [volume, setVolumeState] = useState(sharedVolume);
  const [muted,  setMutedState]  = useState(sharedMuted);
  const [audioReady, setAudioReady] = useState(false);
  const startedRef = useRef(false);

  // Create audio element once
  useEffect(() => {
    if (audioEl) {
      setAudioReady(true);
      return;
    }

    const tryFiles = async () => {
      for (const src of AUDIO_CANDIDATES) {
        try {
          const res = await fetch(src, { method: "HEAD" });
          if (res.ok) {
            const el = new Audio(src);
            el.loop   = true;
            el.volume = sharedVolume;
            el.muted  = sharedMuted;
            audioEl = el;
            setAudioReady(true);
            return;
          }
        } catch { /* try next */ }
      }
      // No audio file found — that's fine, music just won't play
    };

    tryFiles();
  }, []);

  // Start playing on first user interaction (browser autoplay policy)
  useEffect(() => {
    if (!audioEl || startedRef.current) return;
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      audioEl.play().catch(() => {}); // ignore if blocked
    };
    document.addEventListener("click",   start, { once: true });
    document.addEventListener("keydown", start, { once: true });
    return () => {
      document.removeEventListener("click",   start);
      document.removeEventListener("keydown", start);
    };
  }, [audioReady]);

  const setVolume = useCallback((v) => {
    sharedVolume = v;
    localStorage.setItem("vc_volume", v);
    setVolumeState(v);
    if (audioEl) audioEl.volume = v;
  }, []);

  const toggleMute = useCallback(() => {
    sharedMuted = !sharedMuted;
    localStorage.setItem("vc_muted", sharedMuted);
    setMutedState(sharedMuted);
    if (audioEl) audioEl.muted = sharedMuted;
  }, []);

  return { volume, muted, setVolume, toggleMute, audioReady };
}

/**
 * SettingsButton — drop-in settings cog for any screen's top-right corner.
 * Usage: <SettingsButton music={useMusicPlayer()} />
 * Or pass the result of useMusicPlayer() from the parent.
 */
export function SettingsButton({ music }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const { volume, muted, setVolume, toggleMute, audioReady } = music;

  return (
    <div style={{ position: "relative", zIndex: 1000 }} ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Settings"
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer",
          fontSize: "1.1rem",
          padding: "0.35rem 0.6rem",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          backdropFilter: "blur(4px)",
          transition: "background 0.15s",
        }}
      >
        ⚙️
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: "#1a1a2e",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "12px",
          padding: "1rem 1.2rem",
          minWidth: "220px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          color: "white",
        }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.8rem", letterSpacing: "0.05em", opacity: 0.7 }}>
            🎵 MUSIC SETTINGS
          </div>

          {!audioReady ? (
            <div style={{ fontSize: "0.8rem", opacity: 0.6, textAlign: "center", padding: "0.5rem 0" }}>
              No audio file found.<br />
              <span style={{ fontSize: "0.75rem" }}>Add a file to <code>/public/audio/</code></span>
            </div>
          ) : (
            <>
              {/* Mute toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                <span style={{ fontSize: "0.85rem" }}>
                  {muted ? "🔇 Muted" : "🔊 Sound on"}
                </span>
                <button
                  onClick={toggleMute}
                  style={{
                    background: muted ? "rgba(255,255,255,0.1)" : "#457b9d",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    padding: "0.3rem 0.7rem",
                    fontWeight: 600,
                  }}
                >
                  {muted ? "Unmute" : "Mute"}
                </button>
              </div>

              {/* Volume slider */}
              <div>
                <div style={{ fontSize: "0.8rem", marginBottom: "0.4rem", opacity: 0.8 }}>
                  Volume — {Math.round(volume * 100)}%
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "#457b9d", cursor: "pointer" }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
