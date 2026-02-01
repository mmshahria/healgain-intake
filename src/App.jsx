import { useState, useEffect } from "react";

const SECTIONS = [
  "IDENTITY & DIAGNOSTICS",
  "VIABILITY SCAN",
  "FEATURE EXTRACTION",
  "VISUAL DNA",
  "OPERATIONAL AGREEMENT",
];

const FEATURES = [
  "User Profiles (Upload photo, bio)",
  "Admin Dashboard (See all users/stats)",
  "Stripe Payments (Credit Cards)",
  "File Uploads (PDFs, Images)",
  "AI Generation (Chat with GPT/Claude)",
  "Real-Time Chat (User to User messaging)",
  "Calendar / Booking System",
  "Video Hosting / Streaming",
  "Push Notifications",
];

const VIBES = [
  { label: "Clinical & Clean", desc: "White space · Medical · Trustworthy" },
  { label: "Dark & Futuristic", desc: "Cyberpunk · SaaS · High-Tech" },
  { label: "Playful & Soft", desc: "Rounded · Pastels · Consumer" },
  { label: "Corporate & Serious", desc: "Navy · Greys · Data-heavy" },
];

export default function HealGainIntake() {
  const [section, setSection] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [rejection, setRejection] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [errors, setErrors] = useState([]);
  const [form, setForm] = useState({
    operatorName: "",
    entityName: "",
    email: "",
    pitch: "",
    platform: null,
    hardware: null,
    financialFlow: null,
    dataStatus: null,
    coreLoop: "",
    authProtocol: null,
    features: [],
    designAgreement: null,
    vibe: null,
    logo: null,
    logoName: "",
    feedbackLoop: null,
    sanityCheck: "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggle = (key, val) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val)
        ? f[key].filter((v) => v !== val)
        : [...f[key], val],
    }));

  // Trigger rejection logic
  useEffect(() => {
    setRejection(null);
    setWarnings([]);
    if (form.platform === "mobile")
      setRejection({
        field: "Platform Target",
        msg: "We only build Web Apps (PWAs). Native apps require 60+ days.",
      });
    else if (form.platform === "desktop")
      setRejection({
        field: "Platform Target",
        msg: "Desktop software is outside the scope of our 30-day sprint.",
      });
    if (form.hardware === "yes")
      setRejection({
        field: "Hardware Dependencies",
        msg: "Projects requiring hardware integration cannot be completed in 30 days.",
      });
    if (form.financialFlow === "escrow")
      setRejection({
        field: "Financial Flow",
        msg: "Escrow logic requires legal/banking compliance outside our 30-day scope.",
      });
    if (form.designAgreement === "decline")
      setRejection({
        field: "Design Philosophy",
        msg: "You need a custom Design Agency, not an MVP Accelerator.",
      });
    if (form.feedbackLoop === "no")
      setRejection({
        field: "Feedback Commitment",
        msg: "We cannot accept you for this month's cohort.",
      });

    const w = [];
    if (form.financialFlow === "marketplace")
      w.push(
        "High Complexity: Marketplace payments require Stripe Connect setup."
      );
    if (form.dataStatus === "old_db")
      w.push(
        "Data Migration Warning: Migrating an existing database will consume significant timeline."
      );
    if (form.authProtocol === "sms")
      w.push("SMS OTP incurs per-login costs via providers like Twilio.");
    setWarnings(w);
  }, [form]);

  const validate = () => {
    const e = [];
    if (section === 0) {
      if (!form.operatorName.trim()) e.push("Operator Name");
      if (!form.entityName.trim()) e.push("Entity Name");
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
        e.push("Valid Email");
      if (!form.pitch.trim()) e.push("One-Sentence Pitch");
    }
    if (section === 1) {
      if (!form.platform) e.push("Platform Target");
      if (!form.hardware) e.push("Hardware Dependencies");
      if (!form.financialFlow) e.push("Financial Flow");
      if (!form.dataStatus) e.push("Current Data Status");
    }
    if (section === 2) {
      if (!form.coreLoop.trim()) e.push("Core Loop");
      if (!form.authProtocol) e.push("Auth Protocol");
    }
    if (section === 3) {
      if (!form.designAgreement) e.push("Design Philosophy Agreement");
      if (!form.vibe) e.push("Vibe Selector");
    }
    if (section === 4) {
      if (!form.feedbackLoop) e.push("Feedback Loop Commitment");
    }
    setErrors(e);
    return e.length === 0;
  };

  const goNext = () => {
    if (!validate()) return;
    if (rejection) return;
    setSection((s) => Math.min(s + 1, 4));
  };
  const goBack = () => {
    setErrors([]);
    setSection((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (rejection) return;
    setSending(true);
    setSendError(null);
    try {
      const params = new URLSearchParams();
      params.append("operator_name", form.operatorName);
      params.append("entity_name", form.entityName);
      params.append("email", form.email);
      params.append("pitch", form.pitch);
      params.append("platform", form.platform);
      params.append("hardware", form.hardware);
      params.append("financial_flow", form.financialFlow);
      params.append("data_status", form.dataStatus);
      params.append("core_loop", form.coreLoop);
      params.append("auth_protocol", form.authProtocol);
      params.append("features", form.features.join(", "));
      params.append("design_agreement", form.designAgreement);
      params.append("vibe", form.vibe);
      params.append("logo", form.logoName || "None uploaded");
      params.append("feedback_loop", form.feedbackLoop);
      params.append("sanity_check", form.sanityCheck || "None provided");
      const res = await fetch("https://formspree.io/f/mgozalpq", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: params.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        let detail = "Status: " + res.status;
        try {
          const errBody = await res.json();
          detail += " — " + JSON.stringify(errBody);
        } catch (e) {}
        throw new Error(detail);
      }
      setSubmitted(true);
    } catch (err) {
      setSendError("Failed: " + err.message);
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.submitContainer}>
          <div style={styles.checkCircle}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={styles.submitTitle}>PROTOCOL ACCEPTED</h2>
          <p style={styles.submitSub}>
            Your intake has been logged. You will receive onboarding
            instructions at{" "}
            <span style={{ color: "#4ade80" }}>{form.email}</span> within 48
            hours.
          </p>
          <div style={styles.submitCard}>
            <div style={styles.submitRow}>
              <span style={styles.submitLabel}>Operator</span>
              <span style={styles.submitVal}>{form.operatorName}</span>
            </div>
            <div style={styles.submitRow}>
              <span style={styles.submitLabel}>Entity</span>
              <span style={styles.submitVal}>{form.entityName}</span>
            </div>
            <div style={styles.submitRow}>
              <span style={styles.submitLabel}>Vibe</span>
              <span style={styles.submitVal}>{form.vibe}</span>
            </div>
            <div style={styles.submitRow}>
              <span style={styles.submitLabel}>Features</span>
              <span style={styles.submitVal}>
                {form.features.length} selected
              </span>
            </div>
          </div>
          <button
            style={styles.restartBtn}
            onClick={() => {
              setSubmitted(false);
              setSection(0);
              setForm({
                operatorName: "",
                entityName: "",
                email: "",
                pitch: "",
                platform: null,
                hardware: null,
                financialFlow: null,
                dataStatus: null,
                coreLoop: "",
                authProtocol: null,
                features: [],
                designAgreement: null,
                vibe: null,
                logo: null,
                logoName: "",
                feedbackLoop: null,
                sanityCheck: "",
              });
            }}
          >
            ← Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.logo}>
            <span style={styles.logoDna}>🧬</span>
            <span style={styles.logoText}>HEALGAIN</span>
          </div>
          <span style={styles.headerTag}>INTAKE PROTOCOL v1.0</span>
        </div>
        {/* Progress Bar */}
        <div style={styles.progressTrack}>
          {SECTIONS.map((s, i) => (
            <div key={i} style={styles.progressStep}>
              <div
                style={{
                  ...styles.progressDot,
                  ...(i <= section ? styles.progressDotActive : {}),
                  ...(i === section ? styles.progressDotCurrent : {}),
                }}
              >
                {i < section ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0a0e1a"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span style={styles.progressNum}>{i + 1}</span>
                )}
              </div>
              <span
                style={{
                  ...styles.progressLabel,
                  ...(i === section ? styles.progressLabelActive : {}),
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Banner */}
      {rejection && (
        <div style={styles.rejectionBanner}>
          <div style={styles.rejectionIcon}>⛔</div>
          <div>
            <div style={styles.rejectionTitle}>
              PROTOCOL REJECTION — {rejection.field}
            </div>
            <div style={styles.rejectionMsg}>{rejection.msg}</div>
          </div>
        </div>
      )}

      {/* Warning Banners */}
      {warnings.map((w, i) => (
        <div key={i} style={styles.warningBanner}>
          <span style={styles.warningIcon}>⚠</span>
          <span style={styles.warningMsg}>{w}</span>
        </div>
      ))}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div style={styles.errorBanner}>
          <span style={styles.warningIcon}>!</span>
          <span style={styles.warningMsg}>
            Please complete: {errors.join(", ")}
          </span>
        </div>
      )}

      {/* Form Body */}
      <div style={styles.formBody}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionNum}>SECTION {section + 1}</span>
          <h1 style={styles.sectionTitle}>{SECTIONS[section]}</h1>
        </div>

        {/* SECTION 0 */}
        {section === 0 && (
          <div>
            <Field label="1. Operator Name" hint="Point of Contact">
              <input
                style={styles.input}
                value={form.operatorName}
                onChange={(e) => set("operatorName", e.target.value)}
                placeholder="John Doe"
              />
            </Field>
            <Field label="2. Entity Name" hint="Company / Project Name">
              <input
                style={styles.input}
                value={form.entityName}
                onChange={(e) => set("entityName", e.target.value)}
                placeholder="MyStartup Inc."
              />
            </Field>
            <Field
              label="3. Direct Comms Line"
              hint="Used for contracts & GitHub invites"
            >
              <input
                style={styles.input}
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@company.com"
              />
            </Field>
            <Field
              label="4. The One-Sentence Pitch"
              hint='Explain your product as if talking to a 5-year-old. E.g. "It is Airbnb for renting swimming pools."'
            >
              <textarea
                style={{ ...styles.input, ...styles.textarea }}
                value={form.pitch}
                onChange={(e) => set("pitch", e.target.value)}
                placeholder="My product is..."
                rows={3}
              />
            </Field>
          </div>
        )}

        {/* SECTION 1 */}
        {section === 1 && (
          <div>
            <Field
              label="5. Platform Target"
              hint="Which interface do you need?"
            >
              {[
                {
                  val: "web",
                  label: "Web App",
                  sub: "Accessible via browser on phone/desktop",
                  tag: "PASSED",
                  tagColor: "#4ade80",
                },
                {
                  val: "mobile",
                  label: "Mobile App",
                  sub: "Downloadable from App Store / Play Store",
                  tag: "REJECTED",
                  tagColor: "#f87171",
                },
                {
                  val: "desktop",
                  label: "Desktop Software",
                  sub: "Windows / Mac .exe",
                  tag: "REJECTED",
                  tagColor: "#f87171",
                },
              ].map((o) => (
                <RadioCard
                  key={o.val}
                  selected={form.platform === o.val}
                  onClick={() => set("platform", o.val)}
                  tag={o.tag}
                  tagColor={o.tagColor}
                >
                  <span style={styles.radioLabel}>{o.label}</span>
                  <span style={styles.radioSub}>{o.sub}</span>
                </RadioCard>
              ))}
            </Field>
            <Field
              label="6. Hardware & External Dependencies"
              hint="Does this software need to connect to physical devices?"
            >
              {[
                {
                  val: "no",
                  label: "No, it is purely digital.",
                  tag: "PASSED",
                  tagColor: "#4ade80",
                },
                {
                  val: "yes",
                  label: "Yes, it connects to hardware.",
                  tag: "REJECTED",
                  tagColor: "#f87171",
                },
              ].map((o) => (
                <RadioCard
                  key={o.val}
                  selected={form.hardware === o.val}
                  onClick={() => set("hardware", o.val)}
                  tag={o.tag}
                  tagColor={o.tagColor}
                >
                  <span style={styles.radioLabel}>{o.label}</span>
                </RadioCard>
              ))}
            </Field>
            <Field
              label="7. Financial Flow"
              hint="How does money move in your product?"
            >
              {[
                {
                  val: "simple",
                  label: "User pays Me",
                  sub: "Simple Subscription / One-time",
                  tag: "PASSED",
                  tagColor: "#4ade80",
                },
                {
                  val: "marketplace",
                  label: "User pays User",
                  sub: "Marketplace — I take a cut",
                  tag: "WARNING",
                  tagColor: "#fb923c",
                },
                {
                  val: "escrow",
                  label: "I hold money in a wallet",
                  sub: "Escrow — Release it later",
                  tag: "REJECTED",
                  tagColor: "#f87171",
                },
              ].map((o) => (
                <RadioCard
                  key={o.val}
                  selected={form.financialFlow === o.val}
                  onClick={() => set("financialFlow", o.val)}
                  tag={o.tag}
                  tagColor={o.tagColor}
                >
                  <span style={styles.radioLabel}>{o.label}</span>
                  <span style={styles.radioSub}>{o.sub}</span>
                </RadioCard>
              ))}
            </Field>
            <Field
              label="8. Current Data Status"
              hint="Do you have existing data to migrate?"
            >
              {[
                {
                  val: "fresh",
                  label: "No, we are starting fresh.",
                  tag: "PASSED",
                  tagColor: "#4ade80",
                },
                {
                  val: "csv",
                  label: "Yes, I have a massive Excel/CSV file.",
                  tag: "OK",
                  tagColor: "#60a5fa",
                },
                {
                  val: "old_db",
                  label: "Yes, I have an old database (AWS/SQL).",
                  tag: "WARNING",
                  tagColor: "#fb923c",
                },
              ].map((o) => (
                <RadioCard
                  key={o.val}
                  selected={form.dataStatus === o.val}
                  onClick={() => set("dataStatus", o.val)}
                  tag={o.tag}
                  tagColor={o.tagColor}
                >
                  <span style={styles.radioLabel}>{o.label}</span>
                </RadioCard>
              ))}
            </Field>
          </div>
        )}

        {/* SECTION 2 */}
        {section === 2 && (
          <div>
            <Field
              label="9. The Must-Have Core Loop"
              hint='The SINGLE most important user action. E.g. "A user searches for a dentist and books a slot."'
            >
              <textarea
                style={{ ...styles.input, ...styles.textarea }}
                value={form.coreLoop}
                onChange={(e) => set("coreLoop", e.target.value)}
                placeholder="A user does X, which results in Y..."
                rows={3}
              />
            </Field>
            <Field
              label="10. Auth Protocol"
              hint="How should users log in? (Select ONE)"
            >
              {[
                { val: "email", label: "Email & Password", sub: "Standard" },
                { val: "google", label: "Google Login", sub: "Social Auth" },
                { val: "magic", label: "Magic Link", sub: "Passwordless" },
                {
                  val: "sms",
                  label: "Phone Number / SMS OTP",
                  sub: "Costs extra per login",
                  tag: "WARNING",
                  tagColor: "#fb923c",
                },
              ].map((o) => (
                <RadioCard
                  key={o.val}
                  selected={form.authProtocol === o.val}
                  onClick={() => set("authProtocol", o.val)}
                  tag={o.tag}
                  tagColor={o.tagColor}
                >
                  <span style={styles.radioLabel}>{o.label}</span>
                  <span style={styles.radioSub}>{o.sub}</span>
                </RadioCard>
              ))}
            </Field>
            <Field
              label="11. Feature Wishlist"
              hint="Be honest. We will review against the 30-day cap."
            >
              <div style={styles.checkboxGrid}>
                {FEATURES.map((f) => (
                  <label
                    key={f}
                    style={{
                      ...styles.checkboxCard,
                      ...(form.features.includes(f)
                        ? styles.checkboxCardActive
                        : {}),
                    }}
                    onClick={() => toggle("features", f)}
                  >
                    <div
                      style={{
                        ...styles.checkboxBox,
                        ...(form.features.includes(f)
                          ? styles.checkboxBoxActive
                          : {}),
                      }}
                    >
                      {form.features.includes(f) && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#0a0e1a"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span style={styles.checkboxLabel}>{f}</span>
                  </label>
                ))}
              </div>
              <div style={styles.featureCount}>
                {form.features.length} feature
                {form.features.length !== 1 ? "s" : ""} selected
              </div>
            </Field>
          </div>
        )}

        {/* SECTION 3 */}
        {section === 3 && (
          <div>
            <Field
              label="12. Design Philosophy Agreement"
              hint="HealGain uses standardized Tailwind/ShadCN UI. No custom illustrations or pixel-perfect Figma recreations at this tier."
            >
              {[
                {
                  val: "accept",
                  label: "I Accept",
                  sub: "Functionality > Aesthetics. Make it clean and professional.",
                  tag: "PASSED",
                  tagColor: "#4ade80",
                },
                {
                  val: "decline",
                  label: "I Decline",
                  sub: "I need it to look exactly like my custom design.",
                  tag: "REJECTED",
                  tagColor: "#f87171",
                },
              ].map((o) => (
                <RadioCard
                  key={o.val}
                  selected={form.designAgreement === o.val}
                  onClick={() => set("designAgreement", o.val)}
                  tag={o.tag}
                  tagColor={o.tagColor}
                >
                  <span style={styles.radioLabel}>{o.label}</span>
                  <span style={styles.radioSub}>{o.sub}</span>
                </RadioCard>
              ))}
            </Field>
            <Field
              label="13. Vibe Selector"
              hint="Which aesthetic fits your brand?"
            >
              <div style={styles.vibeGrid}>
                {VIBES.map((v) => (
                  <div
                    key={v.label}
                    style={{
                      ...styles.vibeCard,
                      ...(form.vibe === v.label ? styles.vibeCardActive : {}),
                    }}
                    onClick={() => set("vibe", v.label)}
                  >
                    <div
                      style={{
                        ...styles.vibeDot,
                        ...(form.vibe === v.label ? styles.vibeDotActive : {}),
                      }}
                    />
                    <span style={styles.vibeLabel}>{v.label}</span>
                    <span style={styles.vibeSub}>{v.desc}</span>
                  </div>
                ))}
              </div>
            </Field>
            <Field
              label="14. Brand Assets"
              hint="Upload your logo (SVG/PNG) and note your brand colors (Hex codes)"
            >
              <div
                style={styles.uploadArea}
                onClick={() => document.getElementById("logoUpload").click()}
              >
                {form.logoName ? (
                  <span style={styles.uploadedName}>✓ {form.logoName}</span>
                ) : (
                  <>
                    <span style={styles.uploadIcon}>↑</span>
                    <span style={styles.uploadLabel}>Click to upload logo</span>
                    <span style={styles.uploadSub}>SVG or PNG preferred</span>
                  </>
                )}
                <input
                  id="logoUpload"
                  type="file"
                  accept=".svg,.png,.jpg"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files[0])
                      set("logoName", e.target.files[0].name);
                  }}
                />
              </div>
            </Field>
          </div>
        )}

        {/* SECTION 4 */}
        {section === 4 && (
          <div>
            <Field
              label="15. The Feedback Loop Commitment"
              hint="If you don't reply to a review request for 4 days, we lose 15% of our timeline."
            >
              {[
                {
                  val: "yes",
                  label: "Yes, I am ready to sprint.",
                  sub: "I commit to replying within 24 hours.",
                  tag: "PASSED",
                  tagColor: "#4ade80",
                },
                {
                  val: "no",
                  label: "No, I am busy.",
                  sub: "I cannot guarantee a 24-hour response.",
                  tag: "REJECTED",
                  tagColor: "#f87171",
                },
              ].map((o) => (
                <RadioCard
                  key={o.val}
                  selected={form.feedbackLoop === o.val}
                  onClick={() => set("feedbackLoop", o.val)}
                  tag={o.tag}
                  tagColor={o.tagColor}
                >
                  <span style={styles.radioLabel}>{o.label}</span>
                  <span style={styles.radioSub}>{o.sub}</span>
                </RadioCard>
              ))}
            </Field>
            <Field
              label="16. Final Sanity Check"
              hint="Is there anything else that might kill this project? (Legal issues, co-founder disputes, API limits?)"
            >
              <textarea
                style={{ ...styles.input, ...styles.textarea }}
                value={form.sanityCheck}
                onChange={(e) => set("sanityCheck", e.target.value)}
                placeholder="Nothing comes to mind..."
                rows={3}
              />
            </Field>
          </div>
        )}

        {/* Nav */}
        <div style={styles.nav}>
          {section > 0 && (
            <button style={styles.btnBack} onClick={goBack}>
              ← Back
            </button>
          )}
          <div style={styles.navRight}>
            {section < 4 ? (
              <button
                style={{
                  ...styles.btnNext,
                  ...(rejection ? styles.btnDisabled : {}),
                }}
                onClick={goNext}
                disabled={!!rejection}
              >
                Next Section →
              </button>
            ) : (
              <>
                {sendError && (
                  <div style={styles.sendErrorBanner}>{sendError}</div>
                )}
                <button
                  style={{
                    ...styles.btnSubmit,
                    ...(rejection || sending ? styles.btnDisabled : {}),
                  }}
                  onClick={handleSubmit}
                  disabled={!!rejection || sending}
                >
                  {sending ? "Sending..." : "Submit Protocol →"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      {hint && <span style={styles.fieldHint}>{hint}</span>}
      {children}
    </div>
  );
}

function RadioCard({ selected, onClick, tag, tagColor, children }) {
  return (
    <div
      style={{
        ...styles.radioCard,
        ...(selected ? styles.radioCardActive : {}),
      }}
      onClick={onClick}
    >
      <div
        style={{
          ...styles.radioDot,
          ...(selected ? styles.radioDotActive : {}),
        }}
      />
      <div style={styles.radioContent}>{children}</div>
      {tag && (
        <span
          style={{
            ...styles.radioTag,
            backgroundColor: tagColor + "18",
            color: tagColor,
            border: `1px solid ${tagColor}40`,
          }}
        >
          {tag}
        </span>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0e1a",
    color: "#c8d0e0",
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    padding: "0 16px 60px",
  },
  header: {
    maxWidth: 720,
    margin: "0 auto",
    paddingTop: 40,
    paddingBottom: 24,
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoDna: { fontSize: 22 },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: 4,
  },
  headerTag: {
    fontSize: 10,
    color: "#4a5568",
    letterSpacing: 2,
    border: "1px solid #2a3045",
    padding: "4px 10px",
    borderRadius: 4,
  },
  progressTrack: {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
  },
  progressStep: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#1a1f33",
    border: "2px solid #2a3045",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s",
  },
  progressDotActive: {
    background: "#4ade80",
    border: "2px solid #4ade80",
  },
  progressDotCurrent: {
    background: "#fff",
    border: "2px solid #fff",
    boxShadow: "0 0 12px rgba(74,222,128,0.4)",
  },
  progressNum: { fontSize: 11, color: "#6b7280", fontWeight: 600 },
  progressLabel: {
    fontSize: 8,
    color: "#4a5568",
    textAlign: "center",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    lineHeight: 1.3,
  },
  progressLabelActive: { color: "#9ca3af" },
  formBody: {
    maxWidth: 720,
    margin: "0 auto",
  },
  sectionHeader: {
    marginBottom: 28,
    borderBottom: "1px solid #1e2438",
    paddingBottom: 16,
  },
  sectionNum: {
    fontSize: 10,
    color: "#4ade80",
    letterSpacing: 3,
    display: "block",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: 600,
    letterSpacing: 1,
    margin: 0,
  },
  field: {
    marginBottom: 28,
  },
  fieldLabel: {
    display: "block",
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: 600,
    marginBottom: 4,
  },
  fieldHint: {
    display: "block",
    fontSize: 11,
    color: "#4a5568",
    marginBottom: 10,
    lineHeight: 1.4,
  },
  input: {
    width: "100%",
    background: "#111827",
    border: "1px solid #2a3045",
    borderRadius: 6,
    padding: "10px 14px",
    color: "#e2e8f0",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  textarea: {
    resize: "vertical",
    minHeight: 80,
  },
  radioCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#111827",
    border: "1px solid #2a3045",
    borderRadius: 8,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  radioCardActive: {
    border: "1px solid #4ade80",
    background: "#111827",
    boxShadow: "0 0 0 1px #4ade8030",
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "2px solid #2a3045",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  radioDotActive: {
    border: "2px solid #4ade80",
    background: "#4ade80",
    boxShadow: "0 0 6px #4ade8050",
  },
  radioContent: { flex: 1, minWidth: 0 },
  radioLabel: {
    display: "block",
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: 500,
  },
  radioSub: { display: "block", fontSize: 11, color: "#4a5568", marginTop: 2 },
  radioTag: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1,
    padding: "3px 7px",
    borderRadius: 3,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 8,
  },
  checkboxCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#111827",
    border: "1px solid #2a3045",
    borderRadius: 6,
    padding: "10px 12px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  checkboxCardActive: {
    border: "1px solid #4ade80",
    background: "#12182a",
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: "2px solid #2a3045",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  checkboxBoxActive: {
    background: "#4ade80",
    border: "2px solid #4ade80",
  },
  checkboxLabel: { fontSize: 11, color: "#c8d0e0", lineHeight: 1.3 },
  featureCount: {
    marginTop: 12,
    fontSize: 11,
    color: "#4ade80",
    letterSpacing: 1,
  },
  vibeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
  },
  vibeCard: {
    background: "#111827",
    border: "1px solid #2a3045",
    borderRadius: 8,
    padding: "16px 14px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  vibeCardActive: {
    border: "1px solid #4ade80",
    boxShadow: "0 0 0 1px #4ade8030",
  },
  vibeDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    border: "2px solid #2a3045",
    transition: "all 0.2s",
  },
  vibeDotActive: {
    background: "#4ade80",
    border: "2px solid #4ade80",
  },
  vibeLabel: { fontSize: 13, color: "#e2e8f0", fontWeight: 600 },
  vibeSub: { fontSize: 10, color: "#4a5568" },
  uploadArea: {
    border: "1px dashed #2a3045",
    borderRadius: 8,
    padding: "32px 20px",
    textAlign: "center",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    transition: "border-color 0.2s",
  },
  uploadIcon: { fontSize: 22, color: "#4a5568" },
  uploadLabel: { fontSize: 13, color: "#9ca3af" },
  uploadSub: { fontSize: 11, color: "#4a5568" },
  uploadedName: { fontSize: 13, color: "#4ade80", fontWeight: 600 },
  rejectionBanner: {
    maxWidth: 720,
    margin: "0 auto 20px",
    background: "#1a0e0e",
    border: "1px solid #7f1d1d",
    borderRadius: 8,
    padding: "14px 18px",
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  rejectionIcon: { fontSize: 20, flexShrink: 0 },
  rejectionTitle: {
    fontSize: 11,
    color: "#f87171",
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 4,
  },
  rejectionMsg: { fontSize: 12, color: "#9ca3af", lineHeight: 1.5 },
  warningBanner: {
    maxWidth: 720,
    margin: "0 auto 10px",
    background: "#1a150e",
    border: "1px solid #78350f",
    borderRadius: 6,
    padding: "10px 14px",
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  warningIcon: { fontSize: 14, color: "#fb923c", flexShrink: 0 },
  warningMsg: { fontSize: 11, color: "#9ca3af" },
  errorBanner: {
    maxWidth: 720,
    margin: "0 auto 10px",
    background: "#1a120e",
    border: "1px solid #92400e",
    borderRadius: 6,
    padding: "10px 14px",
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 36,
    paddingTop: 24,
    borderTop: "1px solid #1e2438",
  },
  navRight: { marginLeft: "auto" },
  btnBack: {
    background: "transparent",
    border: "1px solid #2a3045",
    color: "#6b7280",
    padding: "10px 20px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "inherit",
    letterSpacing: 0.5,
  },
  btnNext: {
    background: "#4ade80",
    border: "none",
    color: "#0a0e1a",
    padding: "10px 24px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "inherit",
    letterSpacing: 0.5,
  },
  btnSubmit: {
    background: "#4ade80",
    border: "none",
    color: "#0a0e1a",
    padding: "12px 28px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "inherit",
    letterSpacing: 1,
    boxShadow: "0 0 16px #4ade8040",
  },
  btnDisabled: {
    background: "#2a3045",
    color: "#4a5568",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  sendErrorBanner: {
    fontSize: 11,
    color: "#f87171",
    background: "#1a0e0e",
    border: "1px solid #7f1d1d",
    borderRadius: 6,
    padding: "8px 12px",
    marginBottom: 10,
    textAlign: "center",
  },
  submitContainer: {
    maxWidth: 520,
    margin: "120px auto 0",
    textAlign: "center",
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "#4ade8015",
    border: "2px solid #4ade80",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
  },
  submitTitle: {
    fontSize: 22,
    color: "#fff",
    letterSpacing: 4,
    fontWeight: 700,
    margin: "0 0 12px",
  },
  submitSub: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.6,
    margin: "0 0 28px",
  },
  submitCard: {
    background: "#111827",
    border: "1px solid #2a3045",
    borderRadius: 8,
    padding: 20,
    marginBottom: 28,
    textAlign: "left",
  },
  submitRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #1e2438",
    fontSize: 12,
  },
  submitLabel: { color: "#4a5568" },
  submitVal: { color: "#e2e8f0", fontWeight: 600 },
  restartBtn: {
    background: "transparent",
    border: "1px solid #2a3045",
    color: "#6b7280",
    padding: "8px 18px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "inherit",
  },
};
