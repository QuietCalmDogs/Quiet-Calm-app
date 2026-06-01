import React, { useState } from "react";

// ─────────────────────────────────────────────
// DESIGN TOKENS — all colours live here
// ─────────────────────────────────────────────
const C = {
  dark:  "#1e1509",
  warm:  "#2e2318",
  clay:  "#8b5e3c",
  sand:  "#c9a87c",
  parch: "#f5f0e8",
  cream: "#faf8f3",
  sage:  "#5d6e52",
  gold:  "#c4922a",
  rust:  "#b85c38",
  blue:  "#3d6a8a",
  white: "#ffffff",
  ink:   "#1a1410",
  mid:   "#6a5848",
  light: "#a89880",
};

// ─────────────────────────────────────────────
// GLOBAL CSS — injected into the page once
// ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400&family=DM+Sans:wght@300;400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #faf8f3; color: #1a1410; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #c9a87c; border-radius: 2px; }
  button { cursor: pointer; border: none; background: none; font-family: inherit; }
  input, textarea { font-family: inherit; }
  textarea { resize: none; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes bark { 0%,100%{ transform:scale(1); } 20%{ transform:scale(1.18); } 40%{ transform:scale(0.95); } 60%{ transform:scale(1.1); } 80%{ transform:scale(0.98); } }
  .fade-up { animation: fadeUp 0.4s ease both; }
  .spin { animation: spin 1s linear infinite; }
`;

function injectStyles() {
  if (document.getElementById("qc-styles")) return;
  const s = document.createElement("style");
  s.id = "qc-styles";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────
// AI CALL — sends a message to Claude and returns the text response
// ─────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage, maxTokens = 900) {
  const res = await fetch("/api/assess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("") || "";
}


// ─────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────

function NavBar({ screen, setScreen }) {
  const tabs = [
    { id: "home",    icon: "🏠", label: "Home"    },
    { id: "assess",  icon: "🔍", label: "Assess"  },
    { id: "log",     icon: "📋", label: "Log"     },
    { id: "train",   icon: "🎓", label: "Train"   },
    { id: "routine", icon: "📅", label: "Routine" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: C.warm,
      display: "flex",
      borderTop: "1px solid rgba(201,168,124,0.15)",
      zIndex: 100,
      boxShadow: "0 -4px 24px rgba(0,0,0,0.18)",
    }}>
      {tabs.map((t) => {
        const active = screen === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setScreen(t.id)}
            style={{
              flex: 1, padding: "10px 4px 8px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: active ? "rgba(196,146,42,0.12)" : "transparent",
              borderTop: active ? `2px solid ${C.gold}` : "2px solid transparent",
              transition: "all 0.18s",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              color: active ? C.sand : "rgba(201,168,124,0.45)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.white, borderRadius: 12,
      padding: "20px", marginBottom: 16,
      boxShadow: "0 2px 12px rgba(30,21,9,0.07)",
      border: "1px solid rgba(139,94,60,0.1)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled = false, style = {} }) {
  const base = {
    padding: "12px 20px", borderRadius: 8,
    fontSize: 14, letterSpacing: "0.02em",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", gap: 8,
    cursor: disabled ? "not-allowed" : "pointer",
  };
  const variants = {
    primary:   { background: C.gold,  color: C.dark,  fontWeight: 700, border: "none" },
    secondary: { background: "transparent", color: C.clay, border: `1.5px solid ${C.clay}`, fontWeight: 600 },
    dark:      { background: C.warm,  color: C.sand,  fontWeight: 600, border: "none" },
    ghost:     { background: C.parch, color: C.clay,  fontWeight: 500, border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Tag({ children, color = C.clay }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 600,
      letterSpacing: "0.1em", textTransform: "uppercase",
      color: C.white, background: color,
      padding: "3px 10px", borderRadius: 20,
    }}>
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "32px 0" }}>
      <div className="spin" style={{
        width: 32, height: 32, borderRadius: "50%",
        border: `3px solid ${C.parch}`, borderTopColor: C.gold,
      }} />
      <span style={{ fontSize: 13, color: C.light, fontStyle: "italic" }}>
        Thinking about your dog…
      </span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: 22, fontWeight: 800, color: C.warm,
      marginBottom: 4, letterSpacing: "-0.01em",
    }}>
      {children}
    </h2>
  );
}

function SubTitle({ children }) {
  return (
    <p style={{ fontSize: 14, color: C.mid, marginBottom: 20, lineHeight: 1.6 }}>
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────
// SCREEN: HOME
// ─────────────────────────────────────────────
function HomeScreen({ dogName, setDogName, setScreen, logs, assessments }) {
  const [editing, setEditing] = useState(!dogName);
  const [nameInput, setNameInput] = useState(dogName || "");

  const save = () => {
    if (nameInput.trim()) {
      setDogName(nameInput.trim());
      setEditing(false);
    }
  };

  const recentAssess = assessments[assessments.length - 1];

  return (
    <div style={{ paddingBottom: 80 }}>

      {/* HERO BANNER */}
      <div style={{
        background: C.warm, padding: "48px 24px 36px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,146,42,0.18), transparent 60%)",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(201,168,124,0.55)", marginBottom: 8 }}>
            Your Dog Wellness Companion
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 34, fontWeight: 800, color: "#f2ebe0",
            lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 8,
          }}>
            <em style={{ color: C.sand }}>Quiet</em> &amp; Calm
          </h1>
          <p style={{ fontSize: 15, color: "rgba(242,235,224,0.55)", fontStyle: "italic", lineHeight: 1.6 }}>
            Science-backed help for barking &amp; anxiety
          </p>
        </div>
      </div>

      <div style={{ padding: "24px 20px 0" }}>

        {/* DOG NAME CARD */}
        <Card style={{ background: C.parch, border: "1px solid rgba(196,146,42,0.2)" }}>
          {editing ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.clay, marginBottom: 10 }}>
                What is your dog's name?
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && save()}
                  placeholder="e.g. Buddy, Luna, Max…"
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 8,
                    border: `1.5px solid ${C.sand}`, background: C.white,
                    fontSize: 16, color: C.ink, outline: "none",
                  }}
                  autoFocus
                />
                <Btn onClick={save}>Save</Btn>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: C.light, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>Working with</div>
                <div style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.warm }}>
                  🐾 {dogName}
                </div>
              </div>
              <Btn variant="ghost" onClick={() => setEditing(true)} style={{ padding: "8px 14px", fontSize: 13 }}>
                Edit
              </Btn>
            </div>
          )}
        </Card>

        {/* STATS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <Card style={{ margin: 0, textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 800, color: C.gold }}>{logs.length}</div>
            <div style={{ fontSize: 12, color: C.mid, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>Barks Logged</div>
          </Card>
          <Card style={{ margin: 0, textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 800, color: C.sage }}>{assessments.length}</div>
            <div style={{ fontSize: 12, color: C.mid, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>Assessments</div>
          </Card>
        </div>

        {/* QUICK ACTIONS */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.clay, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
            Where would you like to start?
          </div>
          {[
            { icon: "🔍", label: "Get an AI Assessment",      sub: "Describe what is happening and get a personalised diagnosis", screen: "assess", color: C.gold },
            { icon: "📋", label: "Log a Barking Episode",      sub: "Track patterns to understand your dog's triggers",            screen: "log",    color: C.sage },
            { icon: "🎓", label: "Browse Training Protocols",  sub: "Step-by-step guides for barking and anxiety",                 screen: "train",  color: C.blue },
            { icon: "📅", label: "Build a Calming Routine",    sub: "Create a daily structure that reduces anxiety",               screen: "routine", color: C.clay },
          ].map((a) => (
            <button
              key={a.screen}
              onClick={() => setScreen(a.screen)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 14,
                padding: "14px 0", borderBottom: `1px solid ${C.parch}`,
                background: "none", textAlign: "left", transition: "opacity 0.15s",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${a.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>
                {a.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.4 }}>{a.sub}</div>
              </div>
              <span style={{ color: C.light, fontSize: 18, flexShrink: 0 }}>›</span>
            </button>
          ))}
        </Card>

        {/* LATEST ASSESSMENT SUMMARY */}
        {recentAssess && (
          <Card style={{ background: "#fdf8f2", border: "1px solid rgba(196,146,42,0.2)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
              Latest Assessment
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.warm, marginBottom: 6 }}>{recentAssess.barkType}</div>
            <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.6 }}>{recentAssess.summary}</div>
            <div style={{ marginTop: 8, fontSize: 11, color: C.light }}>{recentAssess.date}</div>
          </Card>
        )}

        {/* SCIENCE FACT */}
        <Card style={{ background: C.warm, border: "none" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(201,168,124,0.55)", marginBottom: 8 }}>
            Did You Know?
          </div>
          <p style={{ fontSize: 14, color: "rgba(242,235,224,0.75)", lineHeight: 1.7, fontStyle: "italic", fontFamily: "'Source Serif 4', serif" }}>
            "Up to 72% of dogs show anxiety-related behaviours at some point in their lives — yet most are never properly treated. With the right approach, the vast majority improve significantly."
          </p>
          <div style={{ fontSize: 11, color: "rgba(201,168,124,0.4)", marginTop: 8 }}>— Tiira et al., Scientific Reports (2016)</div>
        </Card>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCREEN: AI ASSESSMENT
// ─────────────────────────────────────────────
const ASSESS_SYSTEM = `You are a certified canine behaviour expert for the Quiet & Calm app. Assess the owner's description and respond in this EXACT JSON structure with no extra text outside the JSON:
{
  "barkType": "Short label e.g. Alert Barking, Separation Anxiety, Fear-Based Barking, Boredom Barking, Demand Barking, Noise Aversion",
  "confidence": "High or Medium or Low",
  "summary": "2-3 sentence plain-language summary of what is happening and why",
  "rootCause": "1-2 sentences on the underlying emotional cause",
  "immediateSteps": ["Step 1", "Step 2", "Step 3"],
  "trainingApproach": "2-3 sentences on the best training strategy for this specific case",
  "redFlags": null,
  "encouragement": "One warm honest sentence of encouragement for the owner"
}
Be specific. Use plain English. Explain any scientific terms in brackets immediately after using them.`;

function AssessScreen({ dogName, onSave }) {
  const [step, setStep]     = useState(0); // 0=form, 1=loading, 2=result
  const [desc, setDesc]     = useState("");
  const [age, setAge]       = useState("");
  const [breed, setBreed]   = useState("");
  const [when, setWhen]     = useState("");
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");

  const name = dogName || "your dog";

  const whenOptions = [
    "When left alone", "At strangers / visitors", "At other dogs",
    "During storms / fireworks", "At all times / randomly", "When I am home but in another room",
  ];

  const run = async () => {
    if (!desc.trim()) { setError("Please describe what is happening."); return; }
    setError("");
    setStep(1);
    const prompt = `Dog name: ${name}\nBreed: ${breed || "not specified"}\nAge: ${age || "not specified"}\nMain trigger: ${when || "not specified"}\nOwner description: ${desc}\n\nPlease assess this dog's barking and anxiety behaviour.`;
    try {
      const raw    = await callClaude(ASSESS_SYSTEM, prompt, 800);
      const clean  = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      onSave({ ...parsed, date: new Date().toLocaleDateString(), dog: name });
      setStep(2);
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setStep(0);
    }
  };

  const reset = () => { setStep(0); setDesc(""); setResult(null); };

  const confidenceColor = { High: C.sage, Medium: C.gold, Low: C.rust };

  if (step === 1) return <div style={{ padding: "48px 20px" }}><Spinner /></div>;

  if (step === 2 && result) return (
    <div style={{ padding: "24px 20px 100px" }} className="fade-up">
      <SectionTitle>Assessment for {name}</SectionTitle>
      <SubTitle>{result.date}</SubTitle>

      {/* BARK TYPE */}
      <Card style={{ background: C.warm, border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(201,168,124,0.55)" }}>
            Identified As
          </div>
          <Tag color={confidenceColor[result.confidence] || C.clay}>
            {result.confidence} Confidence
          </Tag>
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: C.sand, marginBottom: 8 }}>
          {result.barkType}
        </div>
        <p style={{ fontSize: 14, color: "rgba(242,235,224,0.7)", lineHeight: 1.7, fontStyle: "italic", fontFamily: "'Source Serif 4', serif" }}>
          {result.summary}
        </p>
      </Card>

      {/* ROOT CAUSE */}
      <Card style={{ background: "#f4faf4", border: "1px solid rgba(93,110,82,0.2)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.sage, marginBottom: 8 }}>
          🔬 Root Cause
        </div>
        <p style={{ fontSize: 15, color: "#2a4a2a", lineHeight: 1.75 }}>{result.rootCause}</p>
      </Card>

      {/* IMMEDIATE STEPS */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.clay, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
          ✅ Do These First
        </div>
        {result.immediateSteps?.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: C.gold, color: C.dark,
              fontWeight: 700, fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: 1,
            }}>
              {i + 1}
            </div>
            <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.7, flex: 1 }}>{s}</p>
          </div>
        ))}
      </Card>

      {/* TRAINING APPROACH */}
      <Card style={{ background: "#f0f5fa", border: "1px solid rgba(61,106,138,0.2)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.blue, marginBottom: 8 }}>
          🎓 Training Approach
        </div>
        <p style={{ fontSize: 15, color: "#1a3a5a", lineHeight: 1.75 }}>{result.trainingApproach}</p>
      </Card>

      {/* RED FLAGS */}
      {result.redFlags && (
        <Card style={{ background: "#fdf0ec", border: "1px solid rgba(184,92,56,0.25)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.rust, marginBottom: 8 }}>
            ⚠️ Worth Noting
          </div>
          <p style={{ fontSize: 15, color: "#5a2010", lineHeight: 1.7 }}>{result.redFlags}</p>
        </Card>
      )}

      {/* ENCOURAGEMENT */}
      <Card style={{ background: C.parch, border: "1px solid rgba(196,146,42,0.2)" }}>
        <p style={{ fontSize: 16, fontFamily: "'Source Serif 4', serif", fontStyle: "italic", color: C.clay, lineHeight: 1.7 }}>
          🐾 "{result.encouragement}"
        </p>
      </Card>

      <Btn onClick={reset} variant="secondary" style={{ width: "100%", justifyContent: "center" }}>
        New Assessment
      </Btn>
    </div>
  );

  // ASSESSMENT FORM
  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <SectionTitle>AI Assessment</SectionTitle>
      <SubTitle>Describe what is happening with {name} and get a personalised analysis based on veterinary science.</SubTitle>

      {error && (
        <div style={{ background: "#fdf0ec", border: `1px solid ${C.rust}`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: C.rust }}>
          {error}
        </div>
      )}

      <Card>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.clay, display: "block", marginBottom: 8 }}>Breed (optional)</label>
        <input
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="e.g. Labrador, Collie, Mixed breed"
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${C.parch}`, fontSize: 15, marginBottom: 16, color: C.ink, outline: "none", background: C.cream }}
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: C.clay, display: "block", marginBottom: 8 }}>Age (optional)</label>
        <input
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="e.g. 3 years, 8 months"
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${C.parch}`, fontSize: 15, marginBottom: 16, color: C.ink, outline: "none", background: C.cream }}
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: C.clay, display: "block", marginBottom: 10 }}>When does it mainly happen?</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {whenOptions.map((o) => (
            <button
              key={o}
              onClick={() => setWhen(when === o ? "" : o)}
              style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                background: when === o ? C.gold : C.parch,
                color: when === o ? C.dark : C.mid,
                border: when === o ? "none" : "1px solid rgba(139,94,60,0.2)",
                transition: "all 0.15s",
              }}
            >
              {o}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: C.clay, display: "block", marginBottom: 8 }}>Describe what is happening *</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={`Describe ${name}'s barking or anxiety in as much detail as you can. What does it look like? How long does it last? What makes it better or worse?`}
          rows={6}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 8,
            border: `1.5px solid ${desc ? C.sand : C.parch}`,
            fontSize: 15, color: C.ink, lineHeight: 1.7,
            outline: "none", background: C.cream,
            transition: "border-color 0.2s",
          }}
        />
      </Card>

      <Btn onClick={run} disabled={!desc.trim()} style={{ width: "100%", justifyContent: "center", padding: "15px 20px", fontSize: 16 }}>
        🔍 Get My Assessment
      </Btn>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCREEN: BARK LOG
// ─────────────────────────────────────────────
function LogScreen({ dogName, logs, setLogs }) {
  const [showForm, setShowForm]       = useState(false);
  const [trigger, setTrigger]         = useState("");
  const [duration, setDuration]       = useState("");
  const [intensity, setIntensity]     = useState(3);
  const [notes, setNotes]             = useState("");
  const [animatingBtn, setAnimatingBtn] = useState(false);

  const name = dogName || "Your dog";

  const triggers = [
    "Doorbell / knock", "Stranger outside", "Other dog",
    "Alone / separation", "Loud noise", "Car / traffic", "Unknown / random", "Other",
  ];

  const save = () => {
    const entry = {
      id: Date.now(),
      trigger: trigger || "Not specified",
      duration: duration || "Unknown",
      intensity,
      notes,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setLogs((prev) => [...prev, entry]);
    setTrigger(""); setDuration(""); setIntensity(3); setNotes("");
    setShowForm(false);
  };

  const del = (id) => setLogs((prev) => prev.filter((l) => l.id !== id));

  const intensityColors = ["", C.sage, "#8bc48a", C.gold, "#e07a30", C.rust];
  const intensityLabels = ["", "Very Mild", "Mild", "Moderate", "Strong", "Severe"];

  // Find the most common trigger for pattern detection
  const triggerCounts = logs.reduce((acc, l) => { acc[l.trigger] = (acc[l.trigger] || 0) + 1; return acc; }, {});
  const topTrigger    = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <SectionTitle>Bark Log</SectionTitle>
      <SubTitle>Track episodes to find patterns. Even a week of data reveals what is really driving the behaviour.</SubTitle>

      {/* BIG LOG BUTTON */}
      <button
        onClick={() => { setAnimatingBtn(true); setTimeout(() => { setAnimatingBtn(false); setShowForm(true); }, 300); }}
        style={{
          width: "100%", padding: "18px",
          background: C.warm, borderRadius: 12,
          border: "1px solid rgba(201,168,124,0.2)",
          marginBottom: 20, cursor: "pointer",
          animation: animatingBtn ? "bark 0.3s ease" : "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        }}
      >
        <span style={{ fontSize: 28 }}>🔊</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.sand }}>
          Log a Barking Episode
        </span>
      </button>

      {/* LOG ENTRY FORM */}
      {showForm && (
        <Card className="fade-up">
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: C.warm, marginBottom: 16 }}>
            New Entry
          </div>

          <label style={{ fontSize: 13, fontWeight: 600, color: C.clay, display: "block", marginBottom: 8 }}>What triggered it?</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {triggers.map((t) => (
              <button
                key={t}
                onClick={() => setTrigger(trigger === t ? "" : t)}
                style={{
                  padding: "6px 12px", borderRadius: 16, fontSize: 13,
                  background: trigger === t ? C.gold : C.parch,
                  color: trigger === t ? C.dark : C.mid,
                  border: trigger === t ? "none" : "1px solid rgba(139,94,60,0.15)",
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 13, fontWeight: 600, color: C.clay, display: "block", marginBottom: 8 }}>How long did it last?</label>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 5 minutes, 30 seconds"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${C.parch}`, fontSize: 15, marginBottom: 16, color: C.ink, outline: "none", background: C.cream }}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: C.clay, display: "block", marginBottom: 10 }}>
            Intensity: <span style={{ color: intensityColors[intensity] }}>{intensityLabels[intensity]}</span>
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setIntensity(n)}
                style={{
                  flex: 1, height: 36, borderRadius: 6,
                  background: intensity >= n ? intensityColors[n] : C.parch,
                  border: "none", transition: "all 0.15s",
                }}
              />
            ))}
          </div>

          <label style={{ fontSize: 13, fontWeight: 600, color: C.clay, display: "block", marginBottom: 8 }}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What happened before, during, or after…"
            rows={3}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${C.parch}`, fontSize: 15, color: C.ink, outline: "none", background: C.cream, marginBottom: 16 }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={save} style={{ flex: 1, justifyContent: "center" }}>Save Entry</Btn>
            <Btn onClick={() => setShowForm(false)} variant="ghost" style={{ padding: "12px 16px" }}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* PATTERN INSIGHT — shows after 3+ logs */}
      {logs.length >= 3 && topTrigger && (
        <Card style={{ background: "#fdf8f2", border: "1px solid rgba(196,146,42,0.2)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
            📊 Pattern Detected
          </div>
          <p style={{ fontSize: 15, color: C.warm, lineHeight: 1.65 }}>
            <strong>{name}'s most common trigger</strong> is{" "}
            <strong style={{ color: C.clay }}>"{topTrigger[0]}"</strong> — logged {topTrigger[1]} times.
            This pattern helps target your training more precisely.
          </p>
        </Card>
      )}

      {/* LOG ENTRIES LIST */}
      {logs.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "36px 20px", background: C.parch }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <p style={{ color: C.mid, fontSize: 15 }}>No episodes logged yet.<br />Tap the button above to start tracking.</p>
        </Card>
      ) : (
        [...logs].reverse().map((l) => (
          <Card key={l.id} style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <Tag color={intensityColors[l.intensity]}>{intensityLabels[l.intensity]}</Tag>
                  <span style={{ fontSize: 12, color: C.light }}>{l.date} · {l.time}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.warm, marginBottom: 2 }}>{l.trigger}</div>
                {l.duration && <div style={{ fontSize: 13, color: C.mid }}>Duration: {l.duration}</div>}
                {l.notes && <div style={{ fontSize: 13, color: C.mid, marginTop: 4, fontStyle: "italic" }}>"{l.notes}"</div>}
              </div>
              <button onClick={() => del(l.id)} style={{ color: "#ccc", fontSize: 18, padding: "4px 8px", flexShrink: 0 }}>×</button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SCREEN: TRAINING PROTOCOLS
// ─────────────────────────────────────────────
const PROTOCOLS = [
  {
    id: "quiet",
    icon: "🤫",
    title: "The Quiet Command",
    tag: "Barking",
    tagColor: C.rust,
    summary: "Teach a reliable verbal cue to stop barking on command — one of the most practical tools any owner can have.",
    steps: [
      { title: "Prepare your setup", body: "Gather high-value treats — pea-sized pieces of cooked chicken or cheese. Choose a trigger you can control, such as a doorbell recording on your phone. Keep every session to 5 minutes maximum." },
      { title: "Trigger, then interrupt", body: "Trigger the bark intentionally. Allow 2 to 3 barks. Then move toward your dog with a treat in a closed fist near their nose. The moment they stop barking to sniff, say Quiet in a calm clear voice." },
      { title: "Mark and reward the silence", body: "The instant your dog goes quiet — even for just 1 second — say Yes and deliver the treat immediately. Timing is everything: the reward must arrive within 2 seconds of the silence starting." },
      { title: "Extend the duration gradually", body: "Over multiple sessions, require slightly longer silence before rewarding. Start at 1 second, build to 3, then 5, then 10. Use a variable reward schedule once the behaviour is solid — sometimes reward at 5 seconds, sometimes 8, sometimes 3." },
      { title: "Fade the treat lure", body: "Once your dog quiets reliably on cue, stop showing the treat before asking. Ask for Quiet, wait for silence, then reward from your pocket. The goal is a dog responding to the word, not the sight of food." },
      { title: "Generalise the command", body: "Practise in different rooms, at different times, with different triggers. Dogs do not automatically generalise — you must teach that Quiet means the same thing everywhere. This is what makes it reliable in real life." },
    ],
  },
  {
    id: "sa",
    icon: "🚪",
    title: "Graduated Departure Protocol",
    tag: "Separation Anxiety",
    tagColor: C.blue,
    summary: "The evidence-based treatment for dogs that bark, howl, or panic when left alone. Works by building alone-time tolerance in tiny, carefully managed steps.",
    steps: [
      { title: "Find the anxiety threshold", body: "Establish exactly how long your dog can be alone before showing any distress. For some dogs this is 2 minutes; for severe cases it may be 30 seconds. This is your starting point — never exceed it during training sessions." },
      { title: "Practise departure cues without departing", body: "Pick up your keys, then put them down. Walk to the door, then return without leaving. Put your shoes on, then take them off. Repeat these 10 to 15 times until they produce zero anxiety response. You are teaching your dog that departure cues do not always predict being left alone." },
      { title: "Begin micro-absences", body: "Step outside for 5 seconds. Return calmly before any distress begins. No emotional goodbye and no big greeting when you return — keep everything calm and matter-of-fact. Repeat 8 to 10 times per session." },
      { title: "Introduce the departure anchor", body: "Give a high-value long-lasting chew or frozen food toy only when you leave. This creates a positive association with your departure. Remove it when you return. Over time your leaving begins to predict something wonderful rather than something frightening." },
      { title: "Extend duration in small increments", body: "Progress slowly: 30 seconds, then 1 minute, then 2, then 3, then 5, then 8, then 12. Only increase once your dog is completely calm at the current duration. Never rush this — one premature exposure above threshold can undo multiple sessions of careful work." },
      { title: "Never return to a distressed dog", body: "If your dog has been distressed during a session, you went too far too fast. Go back to the previous successful duration and rebuild from there. Reset without judgment and continue." },
    ],
  },
  {
    id: "dscc",
    icon: "🧠",
    title: "Desensitisation and Counter-Conditioning",
    tag: "Anxiety and Fear",
    tagColor: C.sage,
    summary: "The most powerful technique in animal behaviour for changing how a dog feels about something frightening. Changes the emotional association — not just the behaviour.",
    steps: [
      { title: "Identify the trigger and threshold distance", body: "Find the exact distance at which your dog notices the trigger — another dog, a stranger, traffic — but does not yet react with barking, lunging, or freezing. This is your working zone. Always stay here or below it." },
      { title: "Pair trigger appearance with high-value food", body: "The moment your dog notices the trigger — not after they bark, but at the instant of noticing — begin delivering treats continuously. Stop delivering treats the moment the trigger disappears. The sequence must be trigger appears then treats flow, trigger gone then treats stop." },
      { title: "Watch for the emotional shift", body: "You are watching for the moment your dog sees the trigger and then looks back at you with expectation rather than alarm. This check-in behaviour is a critical milestone — it signals that the emotional association is beginning to change from threat to treats incoming." },
      { title: "Only reduce distance when completely calm", body: "After multiple sessions where your dog is relaxed and happy at the current working distance, decrease the distance slightly — roughly 10 to 15 percent. Never proceed on a day your dog is already aroused or unwell." },
      { title: "Keep sessions short and positive", body: "5 to 10 minutes maximum. Always end before your dog shows any stress. A dozen successful sub-threshold exposures is worth more than one accidental above-threshold encounter." },
      { title: "Build gradually to real-world situations", body: "Eventually you will be able to work at close range, in varied environments, with different versions of the trigger. Each new environment requires rebuilding from a greater distance initially." },
    ],
  },
  {
    id: "enrichment",
    icon: "🧩",
    title: "Enrichment for Calm",
    tag: "Anxiety Reduction",
    tagColor: C.clay,
    summary: "Mental stimulation reduces cortisol, lowers baseline anxiety, and gives the brain healthy outlets for energy — making barking less likely and calm more natural.",
    steps: [
      { title: "Replace the food bowl with foraging", body: "Instead of feeding from a bowl, scatter kibble on the grass, use a snuffle mat, stuff a Kong toy and freeze it, or use a lick mat with wet food. This activates the brain's seeking system — associated with calm focused exploration — rather than bolting food in 30 seconds and remaining under-stimulated." },
      { title: "Introduce daily sniff walks", body: "On at least one walk per day, let your dog lead and stop at every smell for as long as they want. Research shows 5 minutes of active sniffing is as cognitively tiring as 20 minutes of regular walking. A tired nose means a calmer dog." },
      { title: "Try nose work and scent games", body: "Hide treats around the room or garden and let your dog find them. This taps into the dog's most powerful sense and produces measurable reductions in anxiety indicators." },
      { title: "Add short training sessions daily", body: "Two 5-minute training sessions per day — practising anything at all — build communication, confidence, and the bond between you. A dog that is successfully learning and receiving positive feedback is neurologically more resilient to stress." },
      { title: "Rotate and vary the enrichment", body: "Dogs habituate to the same activity quickly. Keep a rotating schedule of different enrichment formats — puzzle feeders, sniff walks, scatter feeding, training, and play — so the novelty remains genuinely engaging." },
    ],
  },
];

function TrainScreen() {
  const [selected, setSelected]           = useState(null);
  const [activeStep, setActiveStep]       = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});

  const toggleStep = (protocolId, stepIdx) => {
    const key = `${protocolId}-${stepIdx}`;
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // PROTOCOL DETAIL VIEW
  if (selected) {
    const p         = PROTOCOLS.find((x) => x.id === selected);
    const doneCount = p.steps.filter((_, i) => completedSteps[`${p.id}-${i}`]).length;

    return (
      <div style={{ padding: "24px 20px 100px" }} className="fade-up">
        <button
          onClick={() => setSelected(null)}
          style={{ color: C.clay, fontSize: 14, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Back to Protocols
        </button>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>{p.icon}</span>
          <div>
            <Tag color={p.tagColor}>{p.tag}</Tag>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: C.warm, marginTop: 6, lineHeight: 1.2 }}>
              {p.title}
            </h2>
          </div>
        </div>
        <p style={{ fontSize: 15, color: C.mid, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic", fontFamily: "'Source Serif 4', serif" }}>
          {p.summary}
        </p>

        {/* PROGRESS BAR */}
        <div style={{ background: C.parch, borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: C.clay, marginBottom: 8 }}>
            <span>Progress</span>
            <span>{doneCount} / {p.steps.length} steps</span>
          </div>
          <div style={{ height: 6, background: "rgba(139,94,60,0.15)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(doneCount / p.steps.length) * 100}%`,
              background: `linear-gradient(90deg, ${C.sage}, ${C.gold})`,
              borderRadius: 3, transition: "width 0.4s ease",
            }} />
          </div>
        </div>

        {/* STEP CARDS */}
        {p.steps.map((s, i) => {
          const done = !!completedSteps[`${p.id}-${i}`];
          const open = activeStep === i;
          return (
            <Card
              key={i}
              style={{
                padding: 0, overflow: "hidden",
                border: done ? "1px solid rgba(93,110,82,0.35)" : "1px solid rgba(139,94,60,0.1)",
                background: done ? "#f4faf4" : C.white,
              }}
            >
              <button
                onClick={() => setActiveStep(open ? -1 : i)}
                style={{ width: "100%", padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, background: "none", textAlign: "left" }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: done ? C.sage : open ? C.gold : C.parch,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700,
                  color: done || open ? C.white : C.mid,
                  transition: "all 0.2s",
                }}>
                  {done ? "✓" : i + 1}
                </div>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 15, color: done ? C.sage : C.warm }}>{s.title}</span>
                <span style={{ color: C.light, fontSize: 16 }}>{open ? "▾" : "›"}</span>
              </button>
              {open && (
                <div style={{ padding: "0 18px 18px 18px" }} className="fade-up">
                  <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.8, marginBottom: 14 }}>{s.body}</p>
                  <button
                    onClick={() => toggleStep(p.id, i)}
                    style={{
                      padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                      background: done ? "#fdf0ec" : C.sage,
                      color: done ? C.rust : C.white,
                      border: "none", transition: "all 0.15s",
                    }}
                  >
                    {done ? "Mark Incomplete" : "Mark Complete ✓"}
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  // PROTOCOL LIST VIEW
  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <SectionTitle>Training Protocols</SectionTitle>
      <SubTitle>Evidence-based step-by-step guides for every type of barking and anxiety. Tap any protocol to begin.</SubTitle>

      {PROTOCOLS.map((p) => (
        <button
          key={p.id}
          onClick={() => { setSelected(p.id); setActiveStep(0); }}
          style={{
            width: "100%", textAlign: "left", background: C.white,
            borderRadius: 12, padding: "20px",
            border: "1px solid rgba(139,94,60,0.1)",
            boxShadow: "0 2px 12px rgba(30,21,9,0.07)",
            marginBottom: 14, transition: "all 0.18s", display: "block",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
              background: `${p.tagColor}18`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}>
              {p.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 6 }}><Tag color={p.tagColor}>{p.tag}</Tag></div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: C.warm, marginBottom: 6, lineHeight: 1.2 }}>
                {p.title}
              </div>
              <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.6 }}>{p.summary}</p>
              <div style={{ fontSize: 13, color: C.light, marginTop: 8, fontWeight: 500 }}>{p.steps.length} steps →</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// SCREEN: DAILY ROUTINE BUILDER
// ─────────────────────────────────────────────
const ROUTINE_ITEMS = [
  { id: "morningwalk", time: "Morning",   icon: "🌅", label: "Morning sniff walk",       desc: "Before any alone time. 20 minutes with free sniffing allowed.",        category: "exercise"   },
  { id: "breakfast",   time: "Morning",   icon: "🍽️", label: "Foraging breakfast",        desc: "Scatter feed, snuffle mat, or frozen Kong instead of a bowl.",          category: "enrichment" },
  { id: "training1",   time: "Morning",   icon: "🎓", label: "Training session 1",        desc: "5 minutes. Any command. Positive reinforcement only.",                  category: "training"   },
  { id: "safespace",   time: "Morning",   icon: "🛏️", label: "Safe space rest period",    desc: "Guided settle in their designated calm zone.",                          category: "calm"       },
  { id: "departure",   time: "Midday",    icon: "🚪", label: "Calm departure routine",    desc: "Low-key goodbye. Departure anchor if separation anxiety is present.",   category: "anxiety"    },
  { id: "enrichment",  time: "Midday",    icon: "🧩", label: "Enrichment activity",       desc: "Puzzle feeder, nose work, or hide-and-seek with treats.",               category: "enrichment" },
  { id: "afternoon",   time: "Afternoon", icon: "🦮", label: "Afternoon walk",            desc: "Physical exercise. Breed-appropriate duration.",                        category: "exercise"   },
  { id: "training2",   time: "Afternoon", icon: "🎓", label: "Training session 2",        desc: "5 minutes. Focus on the day's key skill.",                              category: "training"   },
  { id: "lickmat",     time: "Evening",   icon: "😋", label: "Evening lick mat",          desc: "Calming activity that activates the parasympathetic nervous system.",   category: "calm"       },
  { id: "winddown",    time: "Evening",   icon: "🌙", label: "Evening wind-down",         desc: "Dim lights, lower noise, guided settle 30 minutes before bed.",         category: "calm"       },
];

const categoryColors = {
  exercise: C.sage, enrichment: C.gold, training: C.blue, calm: C.clay, anxiety: C.rust,
};

function RoutineScreen({ dogName }) {
  const [selected, setSelected]       = useState(new Set(["morningwalk", "breakfast", "training1", "winddown"]));
  const [generated, setGenerated]     = useState(false);
  const [aiTip, setAiTip]             = useState("");
  const [loadingTip, setLoadingTip]   = useState(false);

  const name   = dogName || "your dog";
  const times  = ["Morning", "Midday", "Afternoon", "Evening"];

  const toggle = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const getTip = async () => {
    setLoadingTip(true);
    const selectedItems = ROUTINE_ITEMS.filter((i) => selected.has(i.id)).map((i) => i.label).join(", ");
    const tip = await callClaude(
      "You are a concise canine behaviour expert. Give a 2-3 sentence practical tip about implementing this specific daily routine for a dog with barking and anxiety. Be specific, warm, and science-grounded. Write flowing prose with no lists.",
      `The owner has built this routine for ${name}: ${selectedItems}. Give one key implementation tip.`,
      200
    );
    setAiTip(tip);
    setLoadingTip(false);
    setGenerated(true);
  };

  const itemsByTime = (time) => ROUTINE_ITEMS.filter((i) => i.time === time && selected.has(i.id));

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <SectionTitle>Daily Routine Builder</SectionTitle>
      <SubTitle>Predictability is one of the most powerful anti-anxiety tools available. Build {name}'s ideal calming day.</SubTitle>

      {/* ACTIVITY SELECTOR */}
      {times.map((time) => (
        <div key={time} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.light, marginBottom: 10 }}>
            {time}
          </div>
          {ROUTINE_ITEMS.filter((i) => i.time === time).map((item) => {
            const active = selected.has(item.id);
            const col    = categoryColors[item.category];
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{
                  width: "100%", textAlign: "left",
                  background: active ? `${col}12` : C.white,
                  borderRadius: 10, padding: "14px 16px", marginBottom: 8,
                  border: active ? `1.5px solid ${col}` : "1px solid rgba(139,94,60,0.1)",
                  display: "flex", gap: 14, alignItems: "flex-start",
                  transition: "all 0.18s",
                  boxShadow: active ? `0 2px 10px ${col}22` : "none",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 9, flexShrink: 0,
                  background: active ? `${col}22` : C.parch,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, transition: "all 0.18s",
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: active ? col : C.warm, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: active ? col : "transparent",
                  border: `2px solid ${active ? col : "#ddd"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.white, fontSize: 12, fontWeight: 700,
                  transition: "all 0.18s",
                }}>
                  {active && "✓"}
                </div>
              </button>
            );
          })}
        </div>
      ))}

      {/* ROUTINE SUMMARY */}
      <Card style={{ background: C.warm, border: "none" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(201,168,124,0.55)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
          {name}'s Routine — {selected.size} activities selected
        </div>
        {times.map((t) => {
          const items = itemsByTime(t);
          if (!items.length) return null;
          return (
            <div key={t} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: C.sand, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{t}</div>
              {items.map((i) => (
                <div key={i.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{i.icon}</span>
                  <span style={{ fontSize: 14, color: "rgba(242,235,224,0.75)" }}>{i.label}</span>
                </div>
              ))}
            </div>
          );
        })}
        {selected.size === 0 && (
          <p style={{ color: "rgba(242,235,224,0.4)", fontSize: 14, fontStyle: "italic" }}>
            Select activities above to build your routine.
          </p>
        )}
      </Card>

      {/* AI TIP BUTTON — only shows when 3+ activities selected */}
      {selected.size >= 3 && (
        <div>
          <Btn
            onClick={getTip}
            disabled={loadingTip}
            style={{ width: "100%", justifyContent: "center", padding: "14px 20px", marginBottom: 14 }}
          >
            {loadingTip ? "Getting tip…" : "✨ Get AI Implementation Tip"}
          </Btn>
          {loadingTip && <Spinner />}
          {generated && aiTip && (
            <Card style={{ background: "#f4faf4", border: "1px solid rgba(93,110,82,0.25)" }} className="fade-up">
              <div style={{ fontSize: 11, fontWeight: 700, color: C.sage, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
                🌿 Tip for Your Routine
              </div>
              <p style={{ fontSize: 15, color: "#2a4a2a", lineHeight: 1.8, fontFamily: "'Source Serif 4', serif", fontStyle: "italic" }}>
                {aiTip}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT APP — ties all screens together
// ─────────────────────────────────────────────
export default function App() {
  injectStyles();

  const [screen,      setScreen]      = useState("home");
  const [dogName,     setDogName]     = useState("");
  const [logs,        setLogs]        = useState([]);
  const [assessments, setAssessments] = useState([]);

  const screens = {
    home:    <HomeScreen    dogName={dogName} setDogName={setDogName} setScreen={setScreen} logs={logs} assessments={assessments} />,
    assess:  <AssessScreen  dogName={dogName} onSave={(a) => setAssessments((prev) => [...prev, a])} />,
    log:     <LogScreen     dogName={dogName} logs={logs} setLogs={setLogs} />,
    train:   <TrainScreen />,
    routine: <RoutineScreen dogName={dogName} />,
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.cream, position: "relative" }}>
      <div key={screen} className="fade-up">
        {screens[screen]}
      </div>
      <NavBar screen={screen} setScreen={setScreen} />
    </div>
  );
}
