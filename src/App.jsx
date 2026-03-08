import { useState, useEffect, useRef } from "react";

// ── Constants ──────────────────────────────────────────────────────────────────

const DARK = {
  bgGrad: "linear-gradient(-45deg, #13110f, #1d1812, #171310, #201a13)",
  surface: "rgba(255,255,255,0.05)",
  surfaceHover: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.08)",
  text: "#f0e6d3",
  textMuted: "#8a7a65",
  accent: "#c9a96e",
  accentSoft: "rgba(201,169,110,0.15)",
  placeholder: "#3e3428",
  inputText: "#d4c4a8",
  dropdownBg: "#1e1a16",
  fadeColor: "#13110f",
};

const LIGHT = {
  bgGrad: "linear-gradient(-45deg, #F5F0E8, #EDE5D5, #F2EDE4, #E8DDD0)",
  surface: "rgba(255,255,255,0.65)",
  surfaceHover: "rgba(255,255,255,0.9)",
  border: "rgba(0,0,0,0.09)",
  text: "#1a1512",
  textMuted: "#7a6e5f",
  accent: "#8b7355",
  accentSoft: "rgba(139,115,85,0.1)",
  placeholder: "#c0ad98",
  inputText: "#2a2018",
  dropdownBg: "#ffffff",
  fadeColor: "#F5F0E8",
};

const emptySubEntry = () => ({
  id: Date.now() + Math.random(),
  time: new Date().toISOString(),
  summary: "", mood: { emoji: "", text: "" }, ideas: "", achievements: "",
});


// ── Utilities ──────────────────────────────────────────────────────────────────

const formatDate = (d) => new Date(d).toLocaleDateString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
});
const formatDateShort = (d) => new Date(d).toLocaleDateString("en-US", {
  month: "long", day: "numeric"
});
const formatTime = (d) => new Date(d).toLocaleTimeString("en-US", {
  hour: "2-digit", minute: "2-digit"
});
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  return "Good evening.";
};

// ── Hooks ──────────────────────────────────────────────────────────────────────

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
};

// ── Splash ─────────────────────────────────────────────────────────────────────

const SplashScreen = ({ onDone }) => {
  const [phase, setPhase] = useState("in");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 100);
    const t2 = setTimeout(() => setPhase("out"), 2200);
    const t3 = setTimeout(onDone, 2900);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "#13110f",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: phase === "out" ? 0 : 1,
      transition: phase === "in" ? "none" : "opacity 0.7s ease",
      pointerEvents: "none",
    }}>
      <div style={{
        textAlign: "center",
        opacity: phase === "hold" || phase === "out" ? 1 : 0,
        transform: phase === "hold" || phase === "out" ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}>
        <div style={{ fontFamily: "'Libre Bodoni', serif", fontSize: 54, fontWeight: 700, color: "#f0e6d3", letterSpacing: "-2px", marginBottom: 12 }}>
          daylog
        </div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 15, color: "#8a7a65", fontStyle: "italic", marginBottom: 28 }}>
          A quiet space for your days.
        </div>
        <div style={{ width: 48, height: 1, background: "linear-gradient(to right, transparent, #c9a96e, transparent)", margin: "0 auto" }} />
      </div>
    </div>
  );
};

// ── Screen Wrapper ─────────────────────────────────────────────────────────────

const Screen = ({ position, children }) => (
  <div style={{
    position: "fixed", inset: 0,
    transform: position === "center" ? "translateX(0)" : position === "right" ? "translateX(100%)" : "translateX(-100%)",
    transition: "transform 0.44s cubic-bezier(0.4, 0, 0.2, 1)",
    overflowY: "auto", overflowX: "hidden",
  }}>
    {children}
  </div>
);

// ── Mood Carousel ──────────────────────────────────────────────────────────────

const MOOD_META = [
  { emoji: "😊", label: "Happy",     glow: "#f5c518", bg: "rgba(245,197,24,0.18)"   },
  { emoji: "😔", label: "Sad",       glow: "#6b9bd2", bg: "rgba(107,155,210,0.18)"  },
  { emoji: "😤", label: "Frustrated",glow: "#e05c4b", bg: "rgba(224,92,75,0.18)"    },
  { emoji: "😌", label: "Calm",      glow: "#7ec8a0", bg: "rgba(126,200,160,0.18)"  },
  { emoji: "🤩", label: "Excited",   glow: "#f7b731", bg: "rgba(247,183,49,0.20)"   },
  { emoji: "😰", label: "Anxious",   glow: "#5ba8d4", bg: "rgba(91,168,212,0.18)"   },
  { emoji: "😴", label: "Tired",     glow: "#9b7ed4", bg: "rgba(155,126,212,0.18)"  },
  { emoji: "🥳", label: "Celebratory",glow:"#e87bb5", bg: "rgba(232,123,181,0.18)"  },
  { emoji: "😐", label: "Neutral",   glow: "#9a9a9a", bg: "rgba(154,154,154,0.14)"  },
  { emoji: "💪", label: "Motivated", glow: "#f0954e", bg: "rgba(240,149,78,0.18)"   },
];

const MoodCarousel = ({ entry, onChange, t, isDark }) => {
  const selectedIdx = MOOD_META.findIndex(m => m.emoji === entry.mood.emoji);
  const activeIdx = selectedIdx === -1 ? Math.floor(MOOD_META.length / 2) : selectedIdx;
  const [idx, setIdx] = useState(activeIdx);

  // Drag state
  const [dragOffset, setDragOffset] = useState(0);   // live px offset while dragging
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);                     // { x, idx } at drag start
  const STEP = 88;                                    // px per emoji slot

  const select = (i) => {
    const clamped = Math.max(0, Math.min(MOOD_META.length - 1, i));
    setIdx(clamped);
    onChange({ ...entry, mood: { ...entry.mood, emoji: MOOD_META[clamped].emoji } });
  };
  const prev = () => select(idx - 1);
  const next = () => select(idx + 1);

  // ── Pointer helpers (unified mouse + touch) ────────────────────────────────
  const getX = (e) => e.touches ? e.touches[0].clientX : e.clientX;

  const onDragStart = (e) => {
    dragStart.current = { x: getX(e), idx };
    setIsDragging(true);
    setDragOffset(0);
  };

  const onDragMove = (e) => {
    if (!dragStart.current) return;
    const delta = getX(e) - dragStart.current.x;
    setDragOffset(delta);

    // Live preview: peek at which index we'd snap to
    const steps = Math.round(-delta / STEP);
    const previewIdx = Math.max(0, Math.min(MOOD_META.length - 1, dragStart.current.idx + steps));
    if (previewIdx !== idx) setIdx(previewIdx);
  };

  const onDragEnd = () => {
    if (!dragStart.current) return;
    // Snap: already updated idx live, just clean up
    const snappedIdx = idx;
    dragStart.current = null;
    setIsDragging(false);
    setDragOffset(0);
    select(snappedIdx);
  };

  const active = MOOD_META[idx];

  return (
    <div
      style={{ position: "relative", margin: "0 -24px", overflow: "hidden", touchAction: "pan-y" }}
      onMouseDown={onDragStart}
      onMouseMove={isDragging ? onDragMove : undefined}
      onMouseUp={onDragEnd}
      onMouseLeave={isDragging ? onDragEnd : undefined}
      onTouchStart={onDragStart}
      onTouchMove={onDragMove}
      onTouchEnd={onDragEnd}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${active.bg}, transparent 70%)`,
        transition: "background 0.5s ease",
        pointerEvents: "none",
      }} />

      {/* Carousel track */}
      <div style={{ position: "relative", height: 148, display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Left arrow */}
        <button onClick={prev} disabled={idx === 0} style={{
          position: "absolute", left: 16, zIndex: 10,
          background: "transparent", border: "none",
          fontSize: 20, color: idx === 0 ? t.border : t.textMuted,
          padding: "8px", transition: "color 0.2s",
          fontFamily: "'Inter', sans-serif",
        }}>‹</button>

        {/* Emoji items */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          {MOOD_META.map((m, i) => {
            const offset = i - idx;
            const absOffset = Math.abs(offset);
            if (absOffset > 3) return null;

            // While dragging, add a fractional offset for smoothness
            const dragFrac = isDragging ? (dragOffset % STEP) / STEP : 0;
            const visualOffset = offset - dragFrac;
            const visualAbs = Math.abs(visualOffset);

            const scale   = Math.max(0.25, 1 - visualAbs * 0.2);
            const opacity = Math.max(0.15, 1 - visualAbs * 0.28);
            const fontSize = Math.max(18, 72 - visualAbs * 18);
            const translateX = visualOffset * STEP;

            return (
              <div key={m.emoji}
                onClick={() => !isDragging && select(i)}
                style={{
                  position: "absolute",
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  transition: isDragging
                    ? "opacity 0.1s ease"
                    : "transform 0.38s cubic-bezier(0.2,0,0,1), opacity 0.35s ease",
                  cursor: isDragging ? "grabbing" : absOffset === 0 ? "grab" : "pointer",
                  fontSize,
                  lineHeight: 1,
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  filter: absOffset === 0 ? `drop-shadow(0 0 18px ${active.glow})` : "none",
                  zIndex: 10 - Math.round(absOffset),
                }}
              >
                {m.emoji}
              </div>
            );
          })}
        </div>

        {/* Right arrow */}
        <button onClick={next} disabled={idx === MOOD_META.length - 1} style={{
          position: "absolute", right: 16, zIndex: 10,
          background: "transparent", border: "none",
          fontSize: 20, color: idx === MOOD_META.length - 1 ? t.border : t.textMuted,
          padding: "8px", transition: "color 0.2s",
          fontFamily: "'Inter', sans-serif",
        }}>›</button>
      </div>

      {/* Label + dots */}
      <div style={{ textAlign: "center", paddingBottom: 20, position: "relative" }}>
        <div style={{
          fontFamily: "'Lora', serif", fontStyle: "italic",
          fontSize: 14, color: active.glow,
          transition: "color 0.4s ease", marginBottom: 12,
          textShadow: isDark ? `0 0 20px ${active.glow}88` : "none",
        }}>
          {active.label}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {MOOD_META.map((_, i) => (
            <div key={i} onClick={() => select(i)} style={{
              width: i === idx ? 18 : 6, height: 6, borderRadius: 3,
              background: i === idx ? active.glow : t.border,
              transition: "all 0.3s ease", cursor: "pointer",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Home Screen ────────────────────────────────────────────────────────────────

const HomeScreen = ({ isDark, toggleTheme, onWrite, onViewEntry, entries, onDelete, onHide }) => {
  const t = isDark ? DARK : LIGHT;
  const [showAll, setShowAll] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const visible = entries.filter(e => !e.hidden);
  const displayed = showAll ? visible : visible.slice(0, 3);
  const hasMore = visible.length > 3;

  return (
    <div className="app-bg" style={{ minHeight: "100vh", background: t.bgGrad, backgroundSize: "300% 300%", paddingBottom: 100 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 44, paddingBottom: 48 }}>
          <div style={{ fontFamily: "'Libre Bodoni', serif", fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: "-0.5px" }}>
            daylog
          </div>
          <button onClick={toggleTheme} className="btn-ghost" style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 20, padding: "7px 16px",
            fontSize: 13, color: t.textMuted,
            fontFamily: "'Inter', sans-serif", backdropFilter: "blur(10px)",
          }}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: 52 }}>
          <div style={{
            fontFamily: "'Libre Bodoni', serif", fontWeight: 700,
            fontSize: "clamp(44px, 9vw, 72px)",
            color: t.text, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 14,
          }}>
            {getGreeting()}
          </div>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 15, color: t.textMuted, fontStyle: "italic" }}>
            {formatDate(new Date().toISOString())}
          </div>
        </div>

        {/* Write CTA */}
        <button onClick={() => onWrite(null)} className="cta-card" style={{
          width: "100%", background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 18, padding: "26px 28px", marginBottom: 56,
          textAlign: "left", cursor: "pointer", backdropFilter: "blur(12px)",
          boxShadow: isDark ? "0 4px 40px rgba(0,0,0,0.35)" : "0 4px 24px rgba(0,0,0,0.07)",
          transition: "all 0.2s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 23, color: t.text, marginBottom: 6 }}>
                Write today's entry
              </div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 14, color: t.textMuted, fontStyle: "italic" }}>
                What happened today?
              </div>
            </div>
            <div style={{ fontSize: 22, color: t.accent }}>→</div>
          </div>
        </button>

        {/* Past Entries */}
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: t.text, marginBottom: 20 }}>
            Past Entries
          </div>

          {visible.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 24px",
              border: `1px dashed ${t.border}`, borderRadius: 14,
            }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>📖</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: t.text, marginBottom: 8 }}>
                Nothing here yet.
              </div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 14, color: t.textMuted, fontStyle: "italic" }}>
                Your saved entries will appear here.
              </div>
            </div>
          ) : (
            <>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {displayed.map(entry => {
                  const first = entry.subEntries[0];
                  return (
                    <div key={entry.id} className="entry-card" style={{
                      background: t.surface, border: `1px solid ${t.border}`,
                      borderRadius: 14, padding: "18px 20px", backdropFilter: "blur(12px)",
                      boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.04)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onViewEntry(entry)}>
                          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: t.text, marginBottom: 5 }}>
                            {formatDate(entry.date)}
                          </div>
                          <div style={{ fontFamily: "'Lora', serif", fontSize: 13, color: t.textMuted, fontStyle: "italic" }}>
                            {first.mood.emoji && <span style={{ fontStyle: "normal", marginRight: 6 }}>{first.mood.emoji}</span>}
                            {first.summary ? first.summary.slice(0, 72) + (first.summary.length > 72 ? "..." : "") : "No summary"}
                          </div>
                        </div>

                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <button
                            className="btn-dots"
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === entry.id ? null : entry.id); }}
                            style={{
                              background: "transparent", border: `1px solid ${t.border}`,
                              borderRadius: 6, padding: "2px 9px",
                              fontSize: 15, color: t.textMuted,
                              letterSpacing: "2px", fontFamily: "'Inter', sans-serif",
                            }}
                          >⋯</button>

                          {openMenu === entry.id && (
                            <div className="dropdown-menu" style={{
                              position: "absolute", bottom: "calc(100% + 6px)", right: 0,
                              background: t.dropdownBg, border: `1px solid ${t.border}`,
                              borderRadius: 10, zIndex: 10, minWidth: 150, overflow: "hidden",
                              boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)",
                            }}>
                              {[
                                { icon: "✏️", label: "Edit", action: () => { setOpenMenu(null); onWrite(entry); } },
                                { icon: "🙈", label: "Hide", action: () => { setOpenMenu(null); onHide(entry.id); } },
                                { icon: "🗑️", label: "Delete", danger: true, action: () => { setOpenMenu(null); onDelete(entry.id); } },
                              ].map(item => (
                                <button key={item.label}
                                  className={item.danger ? "dropdown-item-danger" : "dropdown-item"}
                                  onClick={(e) => { e.stopPropagation(); item.action(); }}
                                  style={{
                                    display: "block", width: "100%", background: "transparent", border: "none",
                                    padding: "11px 16px", fontSize: 13, fontFamily: "'Inter', sans-serif",
                                    color: item.danger ? "#e05c4b" : t.text, textAlign: "left", cursor: "pointer",
                                  }}
                                >{item.icon} {item.label}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!showAll && hasMore && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: 90,
                  background: `linear-gradient(to bottom, transparent, ${t.fadeColor})`,
                  pointerEvents: "none",
                }} />
              )}
            </div>

            {hasMore && (
              <button onClick={() => setShowAll(v => !v)} className="btn-ghost" style={{
                display: "block", margin: "16px auto 0",
                background: "transparent", border: `1px solid ${t.border}`,
                borderRadius: 20, padding: "8px 22px",
                fontSize: 12, fontFamily: "'Inter', sans-serif",
                color: t.textMuted, letterSpacing: "0.04em",
              }}>
                {showAll ? "Show less ▲" : `Show all ${visible.length} entries ▼`}
              </button>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Write Screen ───────────────────────────────────────────────────────────────

const WriteSection = ({ label, prompt, children, t }) => (
  <div style={{ marginBottom: 52 }}>
    <div style={{
      fontFamily: "'DM Serif Display', serif", fontStyle: "italic",
      fontSize: "clamp(26px, 5vw, 36px)",
      color: t.text, lineHeight: 1.15, marginBottom: prompt ? 6 : 18,
    }}>
      {label}
    </div>
    {prompt && (
      <div style={{ fontFamily: "'Lora', serif", fontSize: 13, color: t.textMuted, marginBottom: 16, fontStyle: "italic" }}>
        {prompt}
      </div>
    )}
    {children}
  </div>
);

const WriteScreen = ({ isDark, onBack, subEntries, setSubEntries, onSave, saved, editingEntry, onCancelEdit }) => {
  const t = isDark ? DARK : LIGHT;

  const updateSub = (i, updated) => {
    const copy = [...subEntries];
    copy[i] = updated;
    setSubEntries(copy);
  };
  const removeSub = (i) => setSubEntries(prev => prev.filter((_, idx) => idx !== i));

  const taStyle = {
    width: "100%", background: "transparent",
    border: "none", borderBottom: `1px solid ${t.border}`,
    outline: "none", fontFamily: "'Lora', serif",
    fontSize: 16, lineHeight: 1.85,
    color: t.inputText, resize: "none",
    caretColor: t.accent, paddingBottom: 10,
  };

  return (
    <div className="app-bg" style={{ minHeight: "100vh", background: t.bgGrad, backgroundSize: "300% 300%", paddingBottom: 120 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 44, marginBottom: 52 }}>
          <button onClick={onBack} className="btn-ghost" style={{
            background: "transparent", border: `1px solid ${t.border}`,
            borderRadius: 20, padding: "7px 18px",
            fontSize: 13, fontFamily: "'Inter', sans-serif", color: t.textMuted,
          }}>← Back</button>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 13, color: t.textMuted, fontStyle: "italic" }}>
            {formatDate(new Date().toISOString())}
          </div>
        </div>

        {/* Page heading */}
        <div style={{ marginBottom: 60 }}>
          <div style={{
            fontFamily: "'Libre Bodoni', serif", fontWeight: 700,
            fontSize: "clamp(52px, 11vw, 88px)",
            color: t.text, lineHeight: 0.92, letterSpacing: "-3px", marginBottom: 14,
          }}>
            {editingEntry ? "Editing." : "Today."}
          </div>
          {editingEntry && (
            <button onClick={onCancelEdit} style={{
              background: "transparent", border: "none", padding: 0,
              fontSize: 13, fontFamily: "'Inter', sans-serif",
              color: t.textMuted, fontStyle: "italic",
              cursor: "pointer", textDecoration: "underline",
            }}>Cancel editing</button>
          )}
        </div>

        {/* Sub entries */}
        {subEntries.map((sub, i) => (
          <div key={sub.id}>
            {subEntries.length > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 12, color: t.textMuted, fontStyle: "italic", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Entry {i + 1} · {formatTime(sub.time)}
                </div>
                <button onClick={() => removeSub(i)} className="btn-ghost" style={{
                  background: "transparent", border: `1px solid ${t.border}`,
                  borderRadius: 6, padding: "3px 10px",
                  fontSize: 11, fontFamily: "'Inter', sans-serif", color: t.textMuted,
                }}>Close ✕</button>
              </div>
            )}

            <WriteSection label="What happened?" prompt="Walk me through your day..." t={t}>
              <textarea style={{ ...taStyle, minHeight: 90 }} placeholder="Start writing..."
                value={sub.summary} rows={4}
                onChange={e => updateSub(i, { ...sub, summary: e.target.value })} />
            </WriteSection>

            <WriteSection label="How are you feeling?" t={t}>
              <MoodCarousel entry={sub} onChange={u => updateSub(i, u)} t={t} isDark={isDark} />
              <textarea style={{ ...taStyle, marginTop: 28, minHeight: 56 }} placeholder="Put it into words..."
                value={sub.mood.text} rows={2}
                onChange={e => updateSub(i, { ...sub, mood: { ...sub.mood, text: e.target.value } })} />
            </WriteSection>

            <WriteSection label="Any ideas?" prompt="What's been on your mind?" t={t}>
              <textarea style={{ ...taStyle, minHeight: 72 }} placeholder="Jot them down..."
                value={sub.ideas} rows={3}
                onChange={e => updateSub(i, { ...sub, ideas: e.target.value })} />
            </WriteSection>

            <WriteSection label="Wins for today." prompt="Even the small things count." t={t}>
              <textarea style={{ ...taStyle, minHeight: 72 }} placeholder="What did you accomplish?"
                value={sub.achievements} rows={3}
                onChange={e => updateSub(i, { ...sub, achievements: e.target.value })} />
            </WriteSection>

            {i < subEntries.length - 1 && (
              <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${t.border}, transparent)`, margin: "0 0 52px" }} />
            )}
          </div>
        ))}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <button
            className="btn-ghost"
            onClick={() => setSubEntries(prev => [...prev, emptySubEntry()])}
            style={{
              background: "transparent", border: `1px dashed ${t.border}`,
              borderRadius: 8, padding: "10px 18px",
              fontSize: 13, fontFamily: "'Inter', sans-serif", color: t.textMuted,
            }}
          >+ Add entry</button>

          <button onClick={onSave} className="btn-primary" style={{
            background: t.accent, color: isDark ? "#13110f" : "#fff",
            border: "none", borderRadius: 8, padding: "12px 30px",
            fontSize: 14, fontFamily: "'Inter', sans-serif", fontWeight: 600,
            letterSpacing: "0.02em",
            opacity: saved ? 0.75 : 1, transition: "opacity 0.2s",
          }}>
            {saved ? "Saved ✓" : editingEntry ? "Update" : "Save day"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Detail Screen ──────────────────────────────────────────────────────────────

const DetailScreen = ({ entry, isDark, onBack, onEdit, onDelete, onHide }) => {
  const t = isDark ? DARK : LIGHT;
  if (!entry) return null;

  return (
    <div className="app-bg" style={{ minHeight: "100vh", background: t.bgGrad, backgroundSize: "300% 300%", paddingBottom: 100 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 44, marginBottom: 52, flexWrap: "wrap", gap: 10 }}>
          <button onClick={onBack} className="btn-ghost" style={{
            background: "transparent", border: `1px solid ${t.border}`,
            borderRadius: 20, padding: "7px 18px",
            fontSize: 13, fontFamily: "'Inter', sans-serif", color: t.textMuted,
          }}>← Back</button>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "✏️ Edit", action: () => onEdit(entry), danger: false },
              { label: "🙈 Hide", action: () => { onHide(entry.id); onBack(); }, danger: false },
              { label: "🗑️", action: () => { onDelete(entry.id); onBack(); }, danger: true },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action}
                className={btn.danger ? "btn-detail-danger" : "btn-ghost"}
                style={{
                background: "transparent",
                border: `1px solid ${btn.danger ? "rgba(224,92,75,0.4)" : t.border}`,
                borderRadius: 20, padding: "7px 14px",
                fontSize: 13, fontFamily: "'Inter', sans-serif",
                color: btn.danger ? "#e05c4b" : t.textMuted,
              }}>{btn.label}</button>
            ))}
          </div>
        </div>

        {/* Date heading */}
        <div style={{ marginBottom: 60 }}>
          <div style={{
            fontFamily: "'Libre Bodoni', serif", fontWeight: 700,
            fontSize: "clamp(48px, 10vw, 80px)",
            color: t.text, lineHeight: 0.92, letterSpacing: "-3px", marginBottom: 12,
          }}>
            {formatDateShort(entry.date)}
          </div>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 14, color: t.textMuted, fontStyle: "italic" }}>
            {new Date(entry.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric" })}
          </div>
        </div>

        {/* Content */}
        {entry.subEntries.map((sub, i) => (
          <div key={sub.id}>
            {entry.subEntries.length > 1 && (
              <div style={{ fontFamily: "'Lora', serif", fontSize: 12, color: t.textMuted, fontStyle: "italic", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 28 }}>
                Entry {i + 1} · {formatTime(sub.time)}
              </div>
            )}

            {sub.summary && (
              <div style={{ marginBottom: 44 }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 24, color: t.text, marginBottom: 14 }}>What happened?</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 15, color: t.text, lineHeight: 1.85 }}>{sub.summary}</div>
              </div>
            )}

            {(sub.mood.emoji || sub.mood.text) && (
              <div style={{ marginBottom: 44 }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 24, color: t.text, marginBottom: 14 }}>Feelings</div>
                {sub.mood.emoji && <div style={{ fontSize: 30, marginBottom: 10 }}>{sub.mood.emoji}</div>}
                {sub.mood.text && <div style={{ fontFamily: "'Lora', serif", fontSize: 15, color: t.text, lineHeight: 1.85 }}>{sub.mood.text}</div>}
              </div>
            )}

            {sub.ideas && (
              <div style={{ marginBottom: 44 }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 24, color: t.text, marginBottom: 14 }}>Ideas</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 15, color: t.text, lineHeight: 1.85 }}>{sub.ideas}</div>
              </div>
            )}

            {sub.achievements && (
              <div style={{ marginBottom: 44 }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 24, color: t.text, marginBottom: 14 }}>Wins</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 15, color: t.text, lineHeight: 1.85 }}>{sub.achievements}</div>
              </div>
            )}

            {i < entry.subEntries.length - 1 && (
              <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${t.border}, transparent)`, margin: "8px 0 48px" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("daylog_theme") !== "light"; }
    catch { return true; }
  });
  const [nav, setNav] = useState("home");
  const [entries, setEntries] = useState(() => {
    try {
      const stored = localStorage.getItem("daylog_entries");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [subEntries, setSubEntries] = useState([emptySubEntry()]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [saved, setSaved] = useState(false);

  // Persist entries whenever they change
  useEffect(() => {
    try { localStorage.setItem("daylog_entries", JSON.stringify(entries)); }
    catch { /* storage full or unavailable */ }
  }, [entries]);

  // Persist theme preference
  useEffect(() => {
    try { localStorage.setItem("daylog_theme", isDark ? "dark" : "light"); }
    catch {}
  }, [isDark]);

  const t = isDark ? DARK : LIGHT;

  const pos = (screen) => {
    if (screen === nav) return "center";
    if (screen === "home") return "left";
    return "right";
  };

  const handleWrite = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setSubEntries(entry.subEntries);
    } else {
      setEditingEntry(null);
      setSubEntries([emptySubEntry()]);
    }
    setNav("write");
  };

  const handleSave = () => {
    if (editingEntry) {
      setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, subEntries } : e));
      setEditingEntry(null);
    } else {
      setEntries(prev => [{ id: Date.now(), date: new Date().toISOString(), subEntries }, ...prev]);
    }
    setSubEntries([emptySubEntry()]);
    setSaved(true);
    setTimeout(() => { setSaved(false); setNav("home"); }, 1200);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setSubEntries([emptySubEntry()]);
    setNav("home");
  };

  const handleDelete = (id) => setEntries(prev => prev.filter(e => e.id !== id));
  const handleHide   = (id) => setEntries(prev => prev.map(e => e.id === id ? { ...e, hidden: true } : e));
  const handleView   = (entry) => { setViewingEntry(entry); setNav("detail"); };

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Libre+Bodoni:ital,wght@0,400;0,700;1,400&family=DM+Serif+Display:ital@0;1&family=Lora:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        textarea { font-family: 'Lora', serif; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: ${t.placeholder}; opacity: 1; }
        button { cursor: pointer; }
        .mood-scroll::-webkit-scrollbar { display: none; }

        /* Cards */
        .entry-card {
          transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.4s ease !important;
        }
        .entry-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: ${isDark ? "0 10px 40px rgba(0,0,0,0.45)" : "0 10px 32px rgba(0,0,0,0.10)"} !important;
        }

        /* Write CTA card */
        .cta-card {
          transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.4s ease !important;
        }
        .cta-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: ${isDark ? "0 12px 48px rgba(0,0,0,0.5)" : "0 10px 36px rgba(0,0,0,0.12)"} !important;
        }

        /* Dropdown menu */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dropdown-menu {
          animation: fadeInUp 0.18s ease forwards;
        }

        /* Ghost buttons (back, theme toggle, add entry, show all, close, cancel) */
        .btn-ghost {
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease !important;
        }
        .btn-ghost:hover {
          background: ${t.surface} !important;
          color: ${t.text} !important;
        }

        /* Three-dot menu button */
        .btn-dots {
          transition: background 0.2s ease !important;
        }
        .btn-dots:hover {
          background: ${t.surface} !important;
        }

        /* Dropdown items */
        .dropdown-item {
          transition: background 0.15s ease !important;
        }
        .dropdown-item:hover {
          background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"} !important;
        }

        /* Danger dropdown item */
        .dropdown-item-danger {
          transition: background 0.15s ease !important;
        }
        .dropdown-item-danger:hover {
          background: rgba(224, 92, 75, 0.12) !important;
        }

        /* Save / primary button */
        .btn-primary {
          transition: opacity 0.2s ease, transform 0.15s ease !important;
        }
        .btn-primary:hover {
          opacity: 0.88 !important;
          transform: translateY(-1px) !important;
        }

        /* Detail action buttons */
        .btn-detail-danger {
          transition: background 0.2s ease, color 0.2s ease !important;
        }
        .btn-detail-danger:hover {
          background: rgba(224, 92, 75, 0.12) !important;
        }

        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .app-bg { animation: gradShift 18s ease infinite; }
      `}</style>

      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      <Screen position={pos("home")}>
        <HomeScreen
          isDark={isDark} toggleTheme={() => setIsDark(v => !v)}
          onWrite={handleWrite} onViewEntry={handleView}
          entries={entries} onDelete={handleDelete} onHide={handleHide}
        />
      </Screen>

      <Screen position={pos("write")}>
        <WriteScreen
          isDark={isDark} onBack={() => setNav("home")}
          subEntries={subEntries} setSubEntries={setSubEntries}
          onSave={handleSave} saved={saved}
          editingEntry={editingEntry} onCancelEdit={handleCancelEdit}
        />
      </Screen>

      <Screen position={pos("detail")}>
        <DetailScreen
          entry={viewingEntry} isDark={isDark}
          onBack={() => setNav("home")}
          onEdit={handleWrite}
          onDelete={handleDelete} onHide={handleHide}
        />
      </Screen>
    </div>
  );
}
