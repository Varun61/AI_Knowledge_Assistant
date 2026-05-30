import { useState, useRef, useEffect, useCallback } from "react";
import uchinaBg from "./assets/uchina.jpg";
import avatarImg from "./assets/avatar.png";

// ─── Typewriter ───────────────────────────────────────────────────
function useTypewriter(text, speed = 14) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text]);
  return displayed;
}

// ─── Sources panel ────────────────────────────────────────────────
function Sources({ sources }) {
  const [expanded, setExpanded] = useState(false);
  if (!sources || sources.length === 0) return null;
  return (
    <div style={{ marginTop: 8, marginLeft: 46 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "rgba(140,0,0,0.12)",
          border: "1px solid rgba(180,0,0,0.2)",
          color: "rgba(200,140,140,0.6)",
          fontSize: 10, letterSpacing: 1.5,
          padding: "4px 12px", borderRadius: 12,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        {expanded ? "▾" : "▸"} {sources.length} source{sources.length > 1 ? "s" : ""}
      </button>
      {expanded && (
        <div style={{
          marginTop: 8, display: "flex", flexDirection: "column", gap: 6,
          animation: "fadeInUp 0.3s ease-out",
        }}>
          {sources.map((s, i) => (
            <div key={i} style={{
              background: "rgba(6,0,0,0.7)",
              border: "1px solid rgba(180,0,0,0.15)",
              borderRadius: 8, padding: "8px 12px",
              fontSize: 11, lineHeight: 1.6,
              color: "rgba(200,160,160,0.55)",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{
                color: "rgba(220,100,100,0.5)", fontSize: 9,
                letterSpacing: 1.5, marginBottom: 4,
                textTransform: "uppercase",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span>📄 {s.source}</span>
                <span style={{
                  background: s.score < 0.3 ? "rgba(0,180,0,0.15)" : s.score < 0.5 ? "rgba(200,200,0,0.12)" : "rgba(200,0,0,0.12)",
                  color: s.score < 0.3 ? "rgba(100,220,100,0.7)" : s.score < 0.5 ? "rgba(220,220,100,0.7)" : "rgba(220,100,100,0.6)",
                  padding: "1px 6px", borderRadius: 6, fontSize: 8,
                }}>{s.score < 0.3 ? "High" : s.score < 0.5 ? "Med" : "Low"} · {s.score}</span>
              </div>
              <div style={{ color: "rgba(220,190,190,0.45)" }}>
                {s.preview}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AI bubble with Amaterasu flame accent ────────────────────────
function AIBubble({ text, isLast, onType, streamed }) {
  const shown = useTypewriter(isLast && !streamed ? text : null, 12);
  const display = isLast && !streamed ? shown : text;
  const [hovered, setHovered] = useState(false);
  useEffect(() => { if (isLast && onType) onType(); }, [display]);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "rgba(6,0,0,0.82)",
        border: "1px solid rgba(180,0,0,0.22)",
        color: "rgba(248,228,228,0.95)",
        padding: "13px 18px", borderRadius: "4px 18px 18px 18px",
        maxWidth: "65%", fontSize: 14, lineHeight: 1.9,
        whiteSpace: "pre-wrap", backdropFilter: "blur(16px)",
        boxShadow: hovered
          ? "0 4px 28px rgba(0,0,0,0.7), 0 0 30px rgba(200,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 4px 28px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
        animation: "glowIn 0.5s ease-out",
        transition: "box-shadow 0.4s ease, border-color 0.4s ease",
        borderColor: hovered ? "rgba(200,0,0,0.45)" : "rgba(180,0,0,0.22)",
      }}
    >
      {/* Amaterasu flicker bar on left */}
      <div style={{
        position: "absolute", left: 0, top: 8, bottom: 8, width: 3,
        borderRadius: 2,
        background: "linear-gradient(180deg, #000, #440000, #000, #330000, #000)",
        backgroundSize: "100% 200%",
        animation: "amaterasuFlicker 2s linear infinite",
        opacity: hovered ? 0.9 : 0.4,
        transition: "opacity 0.3s",
      }}/>
      {display}
      {isLast && display !== text && (
        <span style={{
          display: "inline-block", width: 2, height: "1em",
          background: "#cc0000", marginLeft: 2, verticalAlign: "text-bottom",
          animation: "cursorBlink 0.7s step-end infinite",
        }}/>
      )}
    </div>
  );
}

// ─── Particles ────────────────────────────────────────────────────
function Particles() {
  const pts = useRef(Array.from({ length: 26 }, (_, i) => ({
    id: i,
    x: Math.random() * 100, y: Math.random() * 100,
    size: 1.5 + Math.random() * 3,
    dur: 6 + Math.random() * 12,
    delay: Math.random() * 10,
    drift: (Math.random() - 0.5) * 70,
  }))).current;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
      {pts.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: "50%",
          background: `rgba(${180+Math.random()*50},0,0,${0.45+Math.random()*0.4})`,
          boxShadow: `0 0 ${p.size*3}px rgba(220,0,0,0.5)`,
          animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
          "--drift": `${p.drift}px`,
        }}/>
      ))}
    </div>
  );
}

// ─── Black mist explosion on send ─────────────────────────────────
function BlackMist({ active }) {
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 25, pointerEvents: "none" }}>
      {/* Central mist tendrils radiating from bottom-right (send button area) */}
      {Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * 360;
        const dist = 60 + Math.random() * 140;
        const size = 40 + Math.random() * 80;
        return (
          <div key={i} style={{
            position: "absolute",
            bottom: 40, right: 80,
            width: size, height: size,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(0,0,0,${0.7 - i * 0.03}) 0%, rgba(20,0,0,0.3) 50%, transparent 70%)`,
            transform: `translate(${Math.cos(angle * Math.PI / 180) * dist}px, ${Math.sin(angle * Math.PI / 180) * dist}px) scale(0)`,
            animation: `mistTendril 0.9s cubic-bezier(.2,0,.3,1) ${i * 0.03}s forwards`,
          }}/>
        );
      })}
      {/* Red flash at origin */}
      <div style={{
        position: "absolute", bottom: 28, right: 60,
        width: 20, height: 20, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(220,0,0,0.8) 0%, transparent 70%)",
        animation: "mistFlash 0.5s ease-out forwards",
      }}/>
    </div>
  );
}

// ─── Sharingan Send Eye ───────────────────────────────────────────
function SharinganSendEye({ size = 52, spinning = false, onClick, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        width: size, height: size,
        borderRadius: "50%",
        border: "none",
        background: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        filter: disabled ? "grayscale(0.6) brightness(0.5)" : "none",
        transition: "filter 0.3s, transform 0.2s",
        transform: hovered && !disabled ? "scale(1.12)" : "scale(1)",
      }}
    >
      {/* Outer glow ring */}
      <div style={{
        position: "absolute", inset: -6, borderRadius: "50%",
        border: "1.5px solid rgba(200,0,0,0.3)",
        animation: spinning ? "sharinganSpin 0.5s linear infinite" : "sharinganSpin 8s linear infinite",
        boxShadow: hovered
          ? "0 0 20px rgba(200,0,0,0.6), 0 0 40px rgba(180,0,0,0.2)"
          : "0 0 12px rgba(200,0,0,0.3)",
        transition: "box-shadow 0.3s",
      }}/>

      {/* The Sharingan eye SVG */}
      <svg width={size} height={size} viewBox="0 0 100 100"
        style={{
          animation: spinning
            ? "sharinganSpin 0.4s linear infinite"
            : hovered ? "sharinganSpin 2s linear infinite" : "sharinganSpin 6s linear infinite",
          filter: `drop-shadow(0 0 ${hovered ? 12 : 6}px rgba(220,0,0,${hovered ? 0.8 : 0.5}))`,
          transition: "filter 0.3s",
        }}
      >
        <defs>
          <radialGradient id="eyeIris" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ff2020"/>
            <stop offset="60%" stopColor="#cc0000"/>
            <stop offset="100%" stopColor="#4a0000"/>
          </radialGradient>
          <filter id="eyeGlow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Outer ring */}
        <circle cx="50" cy="50" r="46" fill="url(#eyeIris)" stroke="#1a0000" strokeWidth="3"/>
        {/* Inner pattern ring */}
        <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
        {/* Three tomoe */}
        {[0, 120, 240].map(deg => {
          const r = (deg - 90) * Math.PI / 180;
          const cx = 50 + 26 * Math.cos(r);
          const cy = 50 + 26 * Math.sin(r);
          // Tomoe shape: circle + curved tail
          return (
            <g key={deg} transform={`rotate(${deg + 30}, ${cx}, ${cy})`}>
              <circle cx={cx} cy={cy} r={7} fill="#0a0000" filter="url(#eyeGlow)"/>
              <path d={`M${cx+5},${cy} Q${cx+12},${cy-8} ${cx+6},${cy-16}`}
                stroke="#0a0000" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            </g>
          );
        })}
        {/* Pupil */}
        <circle cx="50" cy="50" r="12" fill="#0a0000"/>
        <circle cx="50" cy="50" r="7" fill="#cc1010"/>
        <circle cx="50" cy="50" r="3" fill="#0a0000"/>
        {/* Light reflection */}
        <circle cx="42" cy="42" r="4" fill="rgba(255,255,255,0.12)"/>
        <circle cx="58" cy="46" r="2" fill="rgba(255,255,255,0.06)"/>
      </svg>

      {/* Hover tooltip */}
      {hovered && !disabled && (
        <div style={{
          position: "absolute", top: -32,
          background: "rgba(0,0,0,0.85)", border: "1px solid rgba(200,0,0,0.3)",
          color: "rgba(255,200,200,0.8)", fontSize: 9, letterSpacing: 2,
          padding: "3px 10px", borderRadius: 6, whiteSpace: "nowrap",
          animation: "fadeInUp 0.2s ease-out",
          pointerEvents: "none",
        }}>RELEASE JUTSU</div>
      )}
    </button>
  );
}

// ─── Uchiha fan ───────────────────────────────────────────────────
function UchihaFan({ size = 22, opacity = 0.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity, flexShrink: 0 }}>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#cc0000" strokeWidth="4"/>
      <path d="M50 50 L50 4 A46 46 0 0 1 96 50 Z" fill="#cc0000"/>
      <circle cx="50" cy="50" r="10" fill="#0a0000"/>
      <circle cx="50" cy="50" r="6"  fill="#cc0000"/>
    </svg>
  );
}

// ─── AI Avatar with hover Sharingan glow ──────────────────────────
function AIAvatar({ size = 36 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", width: size, height: size, flexShrink: 0,
      }}
    >
      <img src={avatarImg} alt="AI"
        style={{
          width: size, height: size, borderRadius: "50%", objectFit: "cover",
          border: `2px solid rgba(200,0,0,${hovered ? 0.9 : 0.6})`,
          boxShadow: hovered
            ? "0 0 24px rgba(200,0,0,0.8), 0 0 4px rgba(0,0,0,0.8)"
            : "0 0 16px rgba(200,0,0,0.5), 0 0 4px rgba(0,0,0,0.8)",
          transition: "box-shadow 0.3s, border-color 0.3s",
          animation: "avatarPop 0.45s cubic-bezier(.16,1,.3,1)",
        }}
      />
      {/* Sharingan ring on hover */}
      {hovered && (
        <div style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          border: "1.5px dashed rgba(220,0,0,0.5)",
          animation: "ring1Spin 2s linear infinite",
          pointerEvents: "none",
        }}/>
      )}
    </div>
  );
}

// ─── Thinking Sharingan — spinning eye while loading ──────────────
function ThinkingSharingan() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "8px 4px",
    }}>
      <svg width={28} height={28} viewBox="0 0 100 100"
        style={{ animation: "sharinganSpin 1s linear infinite", flexShrink: 0 }}
      >
        <defs>
          <radialGradient id="thinkIris" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ff2020"/>
            <stop offset="100%" stopColor="#5a0000"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#thinkIris)" stroke="#2a0000" strokeWidth="3"/>
        {[0, 120, 240].map(deg => {
          const r = (deg - 90) * Math.PI / 180;
          return <circle key={deg} cx={50 + 26 * Math.cos(r)} cy={50 + 26 * Math.sin(r)} r={6} fill="#0a0000"/>;
        })}
        <circle cx="50" cy="50" r="11" fill="#0a0000"/>
        <circle cx="50" cy="50" r="6" fill="#cc1010"/>
      </svg>
      <div style={{
        display: "flex", flexDirection: "column", gap: 3,
      }}>
        <span style={{
          color: "rgba(200,100,100,0.6)", fontSize: 11, letterSpacing: 2,
          animation: "chakraPulseText 1.5s ease-in-out infinite",
        }}>Analyzing with Sharingan...</span>
        {/* Chakra flow bar */}
        <div style={{
          width: 120, height: 2, borderRadius: 1,
          background: "rgba(60,0,0,0.4)",
          overflow: "hidden",
        }}>
          <div style={{
            width: "40%", height: "100%",
            background: "linear-gradient(90deg, transparent, #cc0000, transparent)",
            animation: "chakraFlowBar 1.2s ease-in-out infinite",
          }}/>
        </div>
      </div>
    </div>
  );
}

// ─── Bubble ───────────────────────────────────────────────────────
function Bubble({ children, side, style }) {
  return (
    <div style={{
      ...style,
      animation: side === "right"
        ? "msgRight 0.42s cubic-bezier(.16,1,.3,1)"
        : "msgLeft 0.42s cubic-bezier(.16,1,.3,1)",
    }}>{children}</div>
  );
}

// ─── User Bubble with hover effects ──────────────────────────────
function UserBubble({ text }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "linear-gradient(135deg, rgba(140,0,0,0.9), rgba(70,0,0,0.85))",
        color: "#fff0f0", padding: "12px 18px",
        borderRadius: "18px 18px 4px 18px",
        maxWidth: "65%", fontSize: 14, lineHeight: 1.7,
        boxShadow: hovered
          ? "0 6px 28px rgba(160,0,0,0.55), 0 0 40px rgba(180,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.07)"
          : "0 6px 28px rgba(160,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
        border: `1px solid rgba(200,0,0,${hovered ? 0.5 : 0.25})`,
        transition: "box-shadow 0.3s, border-color 0.3s, transform 0.2s",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      {text}
      {/* Tomoe decoration on hover */}
      {hovered && (
        <div style={{
          position: "absolute", top: -3, right: -3, width: 10, height: 10,
          borderRadius: "50%", background: "#0a0000",
          boxShadow: "0 0 6px rgba(200,0,0,0.8)",
          animation: "avatarPop 0.3s ease-out",
        }}/>
      )}
    </div>
  );
}

// ─── CSS keyframes ────────────────────────────────────────────────
const GLOBAL_CSS = `
  /* Splash */
  @keyframes splashEnter { 0%{opacity:0;transform:scale(0.88)} 100%{opacity:1;transform:scale(1)} }
  @keyframes titleFadeUp { 0%{opacity:0;transform:translateY(28px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes clickHint   { 0%,100%{opacity:0.22;letter-spacing:4px} 50%{opacity:0.75;letter-spacing:8px} }
  @keyframes runeFloat   { 0%,100%{transform:translateY(0);opacity:0.1} 50%{transform:translateY(-14px);opacity:0.26} }

  /* Orb idle */
  @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.025)} }
  @keyframes orbHalo  { 0%,100%{opacity:0.35;transform:scale(1)} 50%{opacity:0.75;transform:scale(1.2)} }
  @keyframes ring1Spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes ring2Spin { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
  @keyframes ring3Spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes outerRingGlow {
    0%,100%{box-shadow:0 0 20px rgba(200,0,0,0.25),0 0 55px rgba(180,0,0,0.1)}
    50%    {box-shadow:0 0 40px rgba(220,0,0,0.55),0 0 100px rgba(200,0,0,0.2)}
  }

  /* Kamui inner vortex */
  @keyframes splashFadeOut { 0%{opacity:1} 100%{opacity:0} }
  @keyframes ringFadeCollapse { 0%{transform:rotate(0deg);opacity:1} 100%{transform:rotate(360deg);opacity:0} }
  @keyframes innerVortexImg {
    0%   { transform:scale(1) rotate(0deg); opacity:1; filter:blur(0px); }
    100% { transform:scale(0) rotate(1080deg); opacity:0; filter:blur(8px); }
  }
  @keyframes innerRingSuck {
    0%   { transform:rotate(0deg) scale(1); opacity:0.6; }
    100% { transform:rotate(540deg) scale(0); opacity:0; }
  }
  @keyframes innerVoid {
    0%   { transform:translate(-50%,-50%) scale(0); opacity:0; }
    100% { transform:translate(-50%,-50%) scale(1.5); opacity:1; }
  }
  @keyframes shimmerWarp {
    0%   { opacity:0.5; transform:rotate(0deg) scale(1); }
    100% { opacity:0; transform:rotate(180deg) scale(0); }
  }

  /* Blackout */
  @keyframes kamuiBlackoutFade { 0%{opacity:1} 100%{opacity:0;pointer-events:none} }

  /* Background */
  @keyframes bgDrift { 0%,100%{transform:scale(1.12) translate(0,0)} 33%{transform:scale(1.14) translate(-8px,-6px)} 66%{transform:scale(1.13) translate(6px,-4px)} }
  @keyframes bgFlashIn {
    0%   { filter:brightness(0.05) saturate(0.3); }
    15%  { filter:brightness(0.65) saturate(1.1); }
    100% { filter:brightness(0.28) saturate(0.75) contrast(1.15); }
  }

  /* Chat reveal */
  @keyframes chatReveal { 0%{opacity:0} 100%{opacity:1} }
  @keyframes slideDown  { 0%{transform:translateY(-110%);opacity:0} 100%{transform:translateY(0);opacity:1} }
  @keyframes slideUp    { 0%{transform:translateY(110%);opacity:0}  100%{transform:translateY(0);opacity:1} }
  @keyframes fadeInUp   { 0%{opacity:0;transform:translateY(24px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes glowIn     { 0%{opacity:0;box-shadow:0 0 30px rgba(200,0,0,0.5)} 100%{opacity:1;box-shadow:none} }

  /* Messages */
  @keyframes msgRight {
    0%   { opacity:0; transform:translateX(44px) scale(0.92) rotate(1deg); }
    100% { opacity:1; transform:translateX(0) scale(1) rotate(0deg); }
  }
  @keyframes msgLeft {
    0%   { opacity:0; transform:translateX(-44px) scale(0.92) rotate(-1deg); }
    100% { opacity:1; transform:translateX(0) scale(1) rotate(0deg); }
  }
  @keyframes avatarPop {
    0%   { opacity:0; transform:scale(0.5) rotate(-15deg); }
    60%  { transform:scale(1.1) rotate(3deg); }
    100% { opacity:1; transform:scale(1) rotate(0deg); }
  }
  @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* Particles */
  @keyframes particleFloat {
    0%,100% { transform:translate(0,0); opacity:0; }
    8%  { opacity:0.8; }
    50% { transform:translate(var(--drift,30px),-90px); opacity:0.5; }
    92% { opacity:0; }
  }

  /* Sharingan spin */
  @keyframes sharinganSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  /* ── Black Mist effect ── */
  @keyframes mistTendril {
    0%   { transform:translate(var(--tx,0),var(--ty,0)) scale(0); opacity:0.7; }
    60%  { opacity:0.5; }
    100% { transform:translate(var(--tx,0),var(--ty,0)) scale(1.5); opacity:0; }
  }
  @keyframes mistFlash {
    0%   { transform:scale(0); opacity:0; }
    30%  { transform:scale(2); opacity:1; }
    100% { transform:scale(4); opacity:0; }
  }

  /* ── Amaterasu flame flicker ── */
  @keyframes amaterasuFlicker {
    0%   { background-position:0% 0%; opacity:0.6; }
    25%  { opacity:0.9; }
    50%  { background-position:0% 100%; opacity:0.5; }
    75%  { opacity:0.8; }
    100% { background-position:0% 200%; opacity:0.6; }
  }

  /* ── Chakra flow in input ── */
  @keyframes chakraGlow {
    0%,100% { box-shadow:0 0 0 1px rgba(200,0,0,0.1); }
    50%     { box-shadow:0 0 0 2px rgba(200,0,0,0.3), 0 0 20px rgba(180,0,0,0.1); }
  }
  @keyframes chakraFlowBar {
    0%   { transform:translateX(-100%); }
    100% { transform:translateX(350%); }
  }
  @keyframes chakraPulseText {
    0%,100% { opacity:0.4; }
    50%     { opacity:0.8; }
  }

  /* ── Header breathing glow ── */
  @keyframes headerBreath {
    0%,100% { border-bottom-color:rgba(180,0,0,0.12); }
    50%     { border-bottom-color:rgba(200,0,0,0.35); }
  }

  /* ── Status indicator pulse ── */
  @keyframes statusPulse {
    0%,100% { box-shadow:0 0 8px rgba(200,0,0,0.2); opacity:0.7; }
    50%     { box-shadow:0 0 16px rgba(220,0,0,0.5); opacity:1; }
  }

  /* ── Scroll tomoe indicator ── */
  @keyframes tomoeFloat {
    0%,100% { transform:translateY(0) rotate(0deg); opacity:0.15; }
    50%     { transform:translateY(-8px) rotate(180deg); opacity:0.35; }
  }

  /* ── Input fire border ── */
  @keyframes fireBorder {
    0%   { background-position:0% 50%; }
    50%  { background-position:100% 50%; }
    100% { background-position:0% 50%; }
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(180,0,0,0.35); border-radius:4px; }
  .chat-input:focus {
    border-color:rgba(200,0,0,0.6) !important;
    box-shadow:0 0 0 3px rgba(180,0,0,0.13), 0 0 20px rgba(180,0,0,0.08) !important;
  }
  .chat-input:focus + .fire-underline {
    opacity:1 !important;
  }
  input::placeholder { color:rgba(200,150,150,0.22); }


`;

// ──────────────────────────────────────────────────────────────────
function App() {
  const [phase, setPhase]           = useState("splash");
  const [message, setMessage]       = useState("");
  const [chat, setChat]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [sendAnim, setSendAnim]     = useState(false);
  const [mistActive, setMistActive] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  const [fileTooltip, setFileTooltip] = useState(null);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const bgRef     = useRef(null);
  const mousePos  = useRef({ x: 0, y: 0 });
  const rafRef    = useRef(null);
  const prevPos   = useRef({ x: 0, y: 0 });

  // Mouse parallax
  const handleMouseMove = useCallback((e) => {
    mousePos.current = {
      x: (e.clientX / window.innerWidth  - 0.5) * 24,
      y: (e.clientY / window.innerHeight - 0.5) * 16,
    };
  }, []);

  useEffect(() => {
    if (phase !== "chat") return;
    const animate = () => {
      if (bgRef.current) {
        prevPos.current.x += (mousePos.current.x - prevPos.current.x) * 0.06;
        prevPos.current.y += (mousePos.current.y - prevPos.current.y) * 0.06;
        bgRef.current.style.transform = `scale(1.14) translate(${prevPos.current.x}px, ${prevPos.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [phase, handleMouseMove]);


  // Close file dropdown on any outside click
  useEffect(() => {
    if (!fileDropdownOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-file-dropdown]')) {
        setFileDropdownOpen(false);
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [fileDropdownOpen]);

  // Fetch available files when entering chat
  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/files/`);
      const data = await res.json();
      setAvailableFiles(data.files || []);
    } catch { /* ignore */ }
  }, []);

  const activate = () => {
    if (phase !== "splash") return;
    setPhase("kamui");
    // Vortex plays ~1.6s, blackout covers the seam, chat fades in under it
    setTimeout(() => setPhase("blackout"), 1500);
    setTimeout(() => { setPhase("chat"); fetchFiles(); }, 1700);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    // Fire black mist
    setSendAnim(true);
    setMistActive(true);
    setTimeout(() => { setSendAnim(false); setMistActive(false); }, 900);

    const userMsg = message;
    const newChat = [...chat, { user: userMsg }];
    setChat(newChat);
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          chat_history: chat
            .filter(c => c.assistant)
            .map(c => ({ user: c.user, assistant: c.assistant })),
          selected_files: selectedFiles.length > 0 ? selectedFiles : null,
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      let sources = [];
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "token") {
              answer += parsed.data;
              setLoading(false);
              const updated = [...newChat];
              updated[updated.length - 1].assistant = answer;
              updated[updated.length - 1].streamed = true;
              setChat([...updated]);
            }
            if (parsed.type === "sources") {
              sources = parsed.data;
              const updated = [...newChat];
              updated[updated.length - 1].sources = sources;
              setChat([...updated]);
            }
          } catch (e) {
            // Skip malformed lines
          }
        }
      }
    } catch {
      const updated = [...newChat];
      updated[updated.length - 1].assistant = "Could not reach the server.";
      setChat(updated);
    }
    setLoading(false);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/upload/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadMsg({ type: "success", text: data.message || `${file.name} uploaded successfully` });
      fetchFiles();
    } catch {
      setUploadMsg({ type: "error", text: "Upload failed. Check if server is running." });
    }
    setUploading(false);
    fileInputRef.current.value = "";
    setTimeout(() => setUploadMsg(null), 5000);
  };

  const isKamui    = phase === "kamui";
  const isBlackout = phase === "blackout";
  const isSplash   = phase === "splash";
  const showSplash = isSplash || isKamui;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* ── Background ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <div ref={bgRef} style={{
          position: "absolute", inset: "-8%",
          backgroundImage: `url(${uchinaBg})`,
          backgroundSize: "cover", backgroundPosition: "center",
          transformOrigin: "center",
          transition: showSplash ? "filter 2s ease" : "none",
          filter: phase === "chat"
            ? "brightness(0.28) saturate(0.75) contrast(1.15)"
            : "brightness(0.1) saturate(0.5)",
          animation: phase === "chat" ? "bgFlashIn 1.5s ease-out" : "bgDrift 20s ease-in-out infinite",
        }}/>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 40%, rgba(30,0,0,0.25) 0%, rgba(0,0,0,0.84) 75%)",
        }}/>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(160,0,0,0.015) 3px, rgba(160,0,0,0.015) 4px)",
          pointerEvents: "none",
        }}/>
      </div>

      <Particles/>

      {/* ═══ SPLASH ═══ */}
      {showSplash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          animation: isKamui
            ? "splashFadeOut 1.5s ease-in forwards"
            : "splashEnter 1.2s ease-out",
        }}>
          {/* Kanji */}
          {[
            { text: "うちは一族",      pos: { left: "5%", top: "15%" },    delay: "0.2s" },
            { text: "炎遁・豪火球の術", pos: { left: "5%", bottom: "15%" }, delay: "1.6s" },
            { text: "万華鏡写輪眼",    pos: { right: "5%", top: "15%" },   delay: "0.9s" },
            { text: "天照・黒炎",      pos: { right: "5%", bottom: "15%" },delay: "2.3s" },
          ].map((k, i) => (
            <div key={i} style={{
              position: "absolute", ...k.pos,
              writingMode: "vertical-rl",
              color: "rgba(200,0,0,0.18)",
              fontSize: 13, letterSpacing: 12, fontWeight: 700,
              animation: isKamui ? "none" : `runeFloat 6s ease-in-out ${k.delay} infinite`,
            }}>{k.text}</div>
          ))}

          {/* Title */}
          <div style={{
            textAlign: "center", marginBottom: 52,
            animation: "titleFadeUp 1s ease-out 0.3s both",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12,
            }}>
              <UchihaFan size={18} opacity={0.6}/>
              <span style={{
                color: "#cc0000", fontSize: 10, letterSpacing: 10,
                textTransform: "uppercase", fontWeight: 700, opacity: 0.8,
              }}>うちは · Uchiha Clan</span>
              <UchihaFan size={18} opacity={0.6}/>
            </div>
            <div style={{
              color: "rgba(255,255,255,0.95)", fontSize: 36, fontWeight: 900,
              letterSpacing: 2,
              textShadow: "0 0 60px rgba(220,0,0,0.6), 0 0 22px rgba(180,0,0,0.3), 0 3px 16px rgba(0,0,0,0.9)",
            }}>Knowledge System</div>
            <div style={{
              color: "rgba(210,155,155,0.35)", fontSize: 10, letterSpacing: 7,
              marginTop: 12, textTransform: "uppercase",
            }}>Sharingan Intelligence Engine</div>
          </div>

          {/* Avatar orb */}
          <div onClick={activate} style={{
            position: "relative", width: 280, height: 280,
            cursor: isSplash ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: isSplash ? "orbFloat 4.5s ease-in-out infinite" : "none",
          }}>
            <div style={{
              position: "absolute", width: "175%", height: "175%", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(220,0,0,0.3) 0%, rgba(140,0,0,0.06) 50%, transparent 72%)",
              animation: isKamui ? "none" : "orbHalo 3s ease-in-out infinite",
              transition: "opacity 0.8s", opacity: isKamui ? 0 : 1, pointerEvents: "none",
            }}/>
            <div style={{
              position: "absolute", width: "120%", height: "120%", borderRadius: "50%",
              border: "2px dashed rgba(200,0,0,0.45)",
              animation: isKamui ? "ringFadeCollapse 1.2s ease-in forwards" : "ring1Spin 6s linear infinite, outerRingGlow 3s ease-in-out infinite",
              pointerEvents: "none",
            }}><div style={{ position: "absolute", top: -5, left: "calc(50% - 4px)", width: 8, height: 8, borderRadius: "50%", background: "#cc0000", boxShadow: "0 0 12px rgba(220,0,0,0.9)" }}/></div>
            <div style={{
              position: "absolute", width: "138%", height: "138%", borderRadius: "50%",
              border: "1.5px solid rgba(160,0,0,0.3)",
              animation: isKamui ? "ringFadeCollapse 1.0s ease-in 0.1s forwards" : "ring2Spin 9s linear infinite",
              pointerEvents: "none",
            }}><div style={{ position: "absolute", bottom: -4, left: "calc(50% - 3px)", width: 6, height: 6, borderRadius: "50%", background: "rgba(200,0,0,0.7)", boxShadow: "0 0 8px rgba(200,0,0,0.7)" }}/></div>
            <div style={{
              position: "absolute", width: "155%", height: "155%", borderRadius: "50%",
              border: "1px solid rgba(130,0,0,0.2)", transform: "rotateX(72deg)",
              animation: isKamui ? "ringFadeCollapse 0.8s ease-in 0.2s forwards" : "ring3Spin 12s linear infinite",
              pointerEvents: "none",
            }}/>
            <div style={{ position: "absolute", bottom: "-8%", left: "10%", right: "10%", height: "15%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(180,0,0,0.35) 0%, transparent 70%)", filter: "blur(12px)", pointerEvents: "none" }}/>

            {/* Inner bubble with vortex */}
            <div style={{
              position: "relative", width: "100%", height: "100%", borderRadius: "50%",
              overflow: "hidden", border: "3px solid rgba(200,0,0,0.65)",
              boxShadow: "0 0 0 6px rgba(120,0,0,0.12), 0 0 45px rgba(220,0,0,0.5), 0 0 90px rgba(180,0,0,0.2), inset 0 0 40px rgba(0,0,0,0.55)",
            }}>
              <img src={avatarImg} alt="AI" style={{
                width: "100%", height: "100%", objectFit: "cover",
                animation: isKamui ? "innerVortexImg 1.5s ease-in forwards" : "none",
              }}/>
              {isKamui && Array.from({ length: 7 }, (_, i) => {
                const size = 90 - i * 11;
                return (
                  <div key={i} style={{
                    position: "absolute", top: `${(100-size)/2}%`, left: `${(100-size)/2}%`,
                    width: `${size}%`, height: `${size}%`, borderRadius: "50%",
                    border: `${2.5 - i*0.2}px solid rgba(${200 - i*10},0,0,${0.8 - i*0.08})`,
                    borderTopColor: "transparent", borderLeftColor: "transparent",
                    transform: `rotate(${i * 35}deg)`,
                    animation: `innerRingSuck ${1.6 - i*0.08}s ease-in ${i*0.05}s forwards`,
                  }}/>
                );
              })}
              {isKamui && (
                <div style={{
                  position: "absolute", top: "50%", left: "50%", width: "100%", height: "100%",
                  borderRadius: "50%", background: "radial-gradient(circle, #000 0%, rgba(0,0,0,0.95) 40%, rgba(20,0,0,0.8) 70%, transparent 100%)",
                  transform: "translate(-50%,-50%) scale(0)",
                  animation: "innerVoid 1.5s ease-in forwards",
                }}/>
              )}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.22) 100%)",
                pointerEvents: "none", animation: isKamui ? "shimmerWarp 1.2s ease-in forwards" : "none",
              }}/>
            </div>
          </div>

          <div style={{
            marginTop: 48, fontSize: 10, letterSpacing: 6, color: "rgba(200,0,0,0.4)",
            textTransform: "uppercase",
            animation: isSplash ? "clickHint 2.8s ease-in-out 2s infinite" : "none",
            opacity: isKamui ? 0 : 1, transition: "opacity 0.2s",
          }}>◆ &nbsp; Awaken the Sharingan &nbsp; ◆</div>
        </div>
      )}

      {(isBlackout || phase === "chat") && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 30, background: "#000",
          animation: phase === "chat" ? "kamuiBlackoutFade 0.8s ease-out forwards" : "none",
          opacity: isBlackout ? 1 : undefined,
          pointerEvents: "none",
        }}/>
      )}

      {/* Black mist overlay */}
      <BlackMist active={mistActive}/>

      {/* File name tooltip — rendered outside header stacking context */}
      {fileTooltip && (
        <div style={{
          position: "fixed",
          left: fileTooltip.x,
          top: fileTooltip.y,
          background: "rgba(0,0,0,0.94)",
          border: "1px solid rgba(200,0,0,0.35)",
          color: "rgba(255,200,200,0.9)",
          fontSize: 11, letterSpacing: 0.3,
          padding: "5px 12px", borderRadius: 6,
          whiteSpace: "nowrap", pointerEvents: "none",
          zIndex: 9999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.7)",
        }}>{fileTooltip.text}</div>
      )}

      {/* ═══ CHAT ═══ */}
      {phase === "chat" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          animation: "chatReveal 0.6s ease-out",
        }}>

          {/* ── Header with breathing glow ── */}
          <div style={{
            padding: "13px 28px",
            borderBottom: "1px solid rgba(180,0,0,0.16)",
            display: "flex", alignItems: "center", gap: 14,
            background: "rgba(4,0,0,0.88)",
            backdropFilter: "blur(24px)", zIndex: 20,
            animation: "slideDown 0.65s cubic-bezier(.16,1,.3,1) 0.05s both, headerBreath 4s ease-in-out infinite",
            boxShadow: "0 1px 0 rgba(180,0,0,0.1), 0 4px 24px rgba(0,0,0,0.55)",
          }}>
            <AIAvatar size={42}/>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{
                  color: "#ffffff", fontSize: 17, fontWeight: 900,
                  letterSpacing: 2, margin: 0,
                  textShadow: "0 0 28px rgba(220,0,0,0.55)",
                }}>UCHIHA &nbsp; KNOWLEDGE &nbsp; SYSTEM</p>
                <UchihaFan size={16} opacity={0.45}/>
              </div>
              <p style={{
                color: "rgba(200,140,140,0.36)", fontSize: 10,
                letterSpacing: 4, textTransform: "uppercase", margin: 0,
              }}>Sharingan Intelligence · うちは一族</p>
            </div>
            {/* Animated status with spinning tomoe */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(140,0,0,0.14)",
              border: "1px solid rgba(180,0,0,0.25)",
              color: "#ee4444", fontSize: 10,
              padding: "5px 14px", borderRadius: 20, letterSpacing: 2,
              animation: "statusPulse 3s ease-in-out infinite",
            }}>
              <svg width={12} height={12} viewBox="0 0 100 100"
                style={{ animation: "sharinganSpin 3s linear infinite" }}>
                <circle cx="50" cy="50" r="40" fill="#cc0000" stroke="#600" strokeWidth="4"/>
                {[0, 120, 240].map(deg => {
                  const r = (deg - 90) * Math.PI / 180;
                  return <circle key={deg} cx={50 + 22 * Math.cos(r)} cy={50 + 22 * Math.sin(r)} r={8} fill="#0a0000"/>;
                })}
                <circle cx="50" cy="50" r="10" fill="#0a0000"/>
              </svg>
              Active
            </div>
            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.eml,.msg,.png,.jpg,.jpeg,.tiff,.bmp"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(140,0,0,0.14)",
                border: "1px solid rgba(180,0,0,0.25)",
                color: uploading ? "rgba(200,140,140,0.4)" : "#ee4444",
                fontSize: 10, padding: "5px 14px", borderRadius: 20,
                letterSpacing: 2, cursor: uploading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {uploading ? "Indexing..." : "📄 Upload File"}
            </button>
            {/* File selector dropdown */}
            {availableFiles.length > 0 && (
              <div data-file-dropdown style={{ position: "relative" }}>
                <button
                  onClick={() => setFileDropdownOpen(o => !o)}
                  style={{
                    background: "rgba(140,0,0,0.14)",
                    border: "1px solid rgba(180,0,0,0.25)",
                    color: "#ee4444", fontSize: 10,
                    padding: "5px 12px", borderRadius: 20,
                    letterSpacing: 1, cursor: "pointer",
                    transition: "all 0.2s", whiteSpace: "nowrap",
                  }}
                >
                  {selectedFiles.length === 0
                    ? "📂 All Files ▾"
                    : `📂 ${selectedFiles.length} selected ▾`}
                </button>
                {fileDropdownOpen && (
                  <div
                    style={{
                      position: "absolute", top: "calc(100% + 6px)", right: 0,
                      background: "rgba(10,0,0,0.95)",
                      border: "1px solid rgba(180,0,0,0.25)",
                      borderRadius: 10, minWidth: 220, zIndex: 100,
                      backdropFilter: "blur(16px)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
                    }}>
                    {availableFiles.map((f, i) => {
                      const checked = selectedFiles.includes(f);
                      return (
                        <div
                          key={f}
                          onClick={() => setSelectedFiles(prev =>
                            prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
                          )}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 14px",
                            borderBottom: i < availableFiles.length - 1 ? "1px solid rgba(180,0,0,0.1)" : "none",
                            background: checked ? "rgba(140,0,0,0.2)" : "transparent",
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                        >
                          <div style={{
                            width: 13, height: 13, borderRadius: 3, flexShrink: 0,
                            border: `1.5px solid ${checked ? "#cc0000" : "rgba(180,0,0,0.4)"}`,
                            background: checked ? "#cc0000" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                          }}>
                            {checked && <span style={{ color: "#fff", fontSize: 9, lineHeight: 1 }}>✓</span>}
                          </div>
                          <span
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setFileTooltip({ text: f, x: rect.left, y: rect.bottom + 6 });
                            }}
                            onMouseLeave={() => setFileTooltip(null)}
                            style={{
                            color: checked ? "#ff8888" : "rgba(220,160,160,0.7)",
                            fontSize: 11, letterSpacing: 0.5,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            maxWidth: 160,
                          }}>{f}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload status toast */}
          {uploadMsg && (
            <div style={{
              position: "absolute", top: 70, right: 28, zIndex: 50,
              background: uploadMsg.type === "success" ? "rgba(0,60,0,0.85)" : "rgba(80,0,0,0.85)",
              border: `1px solid ${uploadMsg.type === "success" ? "rgba(0,180,0,0.3)" : "rgba(200,0,0,0.3)"}`,
              color: uploadMsg.type === "success" ? "rgba(150,255,150,0.9)" : "rgba(255,150,150,0.9)",
              padding: "8px 16px", borderRadius: 10, fontSize: 12,
              backdropFilter: "blur(12px)",
              animation: "fadeInUp 0.3s ease-out",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}>
              {uploadMsg.text}
            </div>
          )}

          {/* ── Chat area ── */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "36px 13%",
            display: "flex", flexDirection: "column", gap: 24,
            zIndex: 2, animation: "fadeInUp 0.7s ease-out 0.35s both",
          }}>
            {/* Empty state */}
            {chat.length === 0 && (
              <div style={{
                textAlign: "center", marginTop: 55,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
                animation: "fadeInUp 0.9s ease-out 0.55s both",
              }}>
                <div style={{ position: "relative", width: 92, height: 92 }}>
                  <div style={{
                    position: "absolute", inset: -12, borderRadius: "50%",
                    border: "1.5px dashed rgba(180,0,0,0.35)",
                    animation: "ring1Spin 8s linear infinite",
                  }}/>
                  {/* Floating tomoe decorations */}
                  {[0, 120, 240].map((deg, i) => {
                    const r = (deg - 90) * Math.PI / 180;
                    return (
                      <div key={i} style={{
                        position: "absolute",
                        top: `calc(50% + ${Math.sin(r) * 54}px - 4px)`,
                        left: `calc(50% + ${Math.cos(r) * 54}px - 4px)`,
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#0a0000", boxShadow: "0 0 8px rgba(200,0,0,0.6)",
                        animation: `tomoeFloat 3s ease-in-out ${i * 0.4}s infinite`,
                      }}/>
                    );
                  })}
                  <img src={avatarImg} alt="AI" style={{
                    width: 92, height: 92, borderRadius: "50%", objectFit: "cover",
                    border: "2px solid rgba(200,0,0,0.5)",
                    boxShadow: "0 0 32px rgba(200,0,0,0.4), 0 0 8px rgba(0,0,0,0.8)",
                  }}/>
                </div>
                <div style={{
                  color: "rgba(220,170,170,0.35)", fontSize: 14,
                  lineHeight: 2.2, letterSpacing: 0.4,
                }}>
                  The Uchiha Clan's knowledge is now at your command.<br/>
                  Speak, and the Sharingan shall illuminate the truth.
                </div>
                {/* Decorative kanji watermark */}
                <div style={{
                  color: "rgba(200,0,0,0.06)", fontSize: 48, fontWeight: 900,
                  letterSpacing: 12, userSelect: "none",
                }}>写輪眼</div>
              </div>
            )}

            {/* Messages */}
            {chat.map((c, i) => {
              const isLast = i === chat.length - 1;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* User message */}
                  <Bubble side="right" style={{ display: "flex", justifyContent: "flex-end" }}>
                    <UserBubble text={c.user}/>
                  </Bubble>
                  {/* AI response */}
                  {c.assistant && (
                    <>
                      <Bubble side="left" style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <AIAvatar size={34}/>
                        <AIBubble text={c.assistant} isLast={isLast && !loading} streamed={!!c.streamed} onType={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}/>
                      </Bubble>
                      <Sources sources={c.sources}/>
                    </>
                  )}
                </div>
              );
            })}

            {/* Loading — Sharingan analysis */}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12,
                animation: "msgLeft 0.38s cubic-bezier(.16,1,.3,1)" }}>
                <AIAvatar size={34}/>
                <div style={{
                  background: "rgba(6,0,0,0.75)",
                  border: "1px solid rgba(160,0,0,0.18)",
                  padding: "12px 18px", borderRadius: "4px 18px 18px 18px",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
                }}>
                  <ThinkingSharingan/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* ── Input bar ── */}
          <div style={{
            padding: "13px 13%",
            borderTop: "1px solid rgba(160,0,0,0.14)",
            display: "flex", gap: 14, alignItems: "center",
            background: "rgba(4,0,0,0.88)", backdropFilter: "blur(24px)", zIndex: 2,
            animation: "slideUp 0.65s cubic-bezier(.16,1,.3,1) 0.1s both",
            boxShadow: "0 -1px 0 rgba(180,0,0,0.08), 0 -4px 20px rgba(0,0,0,0.45)",
          }}>
            {/* Input wrapper with fire underline */}
            <div style={{ flex: 1, position: "relative" }}>
              <input
                className="chat-input"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Channel your chakra... (Enter to send)"
                style={{
                  width: "100%",
                  background: "rgba(120,0,0,0.06)",
                  border: "1px solid rgba(160,0,0,0.18)",
                  borderRadius: 12, padding: "13px 18px",
                  color: "rgba(248,228,228,0.92)", fontSize: 14,
                  outline: "none", fontFamily: "inherit",
                  transition: "border-color 0.25s, box-shadow 0.25s",
                  animation: inputFocused ? "chakraGlow 2s ease-in-out infinite" : "none",
                }}
              />
              {/* Fire underline */}
              <div className="fire-underline" style={{
                position: "absolute", bottom: 0, left: 12, right: 12, height: 2,
                borderRadius: 1,
                background: "linear-gradient(90deg, transparent, #cc0000, #ff4400, #cc0000, transparent)",
                backgroundSize: "200% 100%",
                animation: "fireBorder 2s linear infinite",
                opacity: inputFocused ? 0.7 : 0,
                transition: "opacity 0.3s",
              }}/>
              {/* Typing kanji watermark */}
              {message.length > 0 && (
                <div style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  color: "rgba(200,0,0,0.08)", fontSize: 22, fontWeight: 900,
                  pointerEvents: "none", userSelect: "none",
                }}>火</div>
              )}
            </div>

            {/* ── Sharingan Eye Send Button ── */}
            <SharinganSendEye
              size={50}
              spinning={loading || sendAnim}
              onClick={sendMessage}
              disabled={loading}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
