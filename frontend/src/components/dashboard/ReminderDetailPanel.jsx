import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { SEND_CHANNELS, sendReminder } from "../../reminders/sendChannels";

/* ======================================================
   REMINDER DETAIL PANEL — UI SAME + CLEAN ALERTS
====================================================== */

export default function ReminderDetailPanel({ open, reminder, onClose }) {
  if (!open || !reminder) return null;

  const hasEmail = Boolean(reminder.client_email);

  /* ===== MODE STATE ===== */
  const [mode, setMode] = useState(SEND_CHANNELS.MANUAL);

  /* ===== LOCAL SENT TIMER ===== */
  const [lastSentAtLocal, setLastSentAtLocal] = useState(null);
  const [now, setNow] = useState(Date.now());

  /* ===== STATUS MESSAGE ===== */
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const effectiveLastSentAt =
    lastSentAtLocal || reminder.decision?.lastSentAt;

  /* ===== COOLDOWN ===== */
  const COOLDOWN_DAYS = 5;
  let isCooldown = false;
  let cooldownDaysLeft = 0;

  if (effectiveLastSentAt) {
    const daysSinceLast = Math.floor(
      (now - new Date(effectiveLastSentAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSinceLast < COOLDOWN_DAYS) {
      isCooldown = true;
      cooldownDaysLeft = COOLDOWN_DAYS - daysSinceLast;
    }
  }

  /* ================= ACTIONS ================= */

  async function markAsSent(channel) {
    const sentAt = new Date().toISOString();

    const { error } = await supabase.from("invoice_reminders").insert({
      invoice_id: reminder.invoice_id,
      tone: reminder.tone,
      message: reminder.message,
      channel,
      state: "sent",
      sent_at: sentAt,
    });

    if (!error) {
      setLastSentAtLocal(sentAt);
    }
  }

  async function handleManualSend() {
    if (isCooldown) return;

    await markAsSent(SEND_CHANNELS.MANUAL);

    setStatusMsg("✅ Marked as sent manually.");
    setTimeout(() => setStatusMsg(""), 2500);
  }

  async function handleEmailSend() {
    if (!hasEmail || isCooldown) return;

    setStatusMsg("Opening Gmail draft...");

    // ✅ Option B: Open Gmail Compose (NOT auto-send)
    const result = await sendReminder({
      channel: SEND_CHANNELS.EMAIL,
      reminder,
    });

    if (!result.success) {
      setStatusMsg("❌ " + result.error);
      setTimeout(() => setStatusMsg(""), 4000);
      return;
    }

    // ✅ Mark reminder as sent (user will click Send in Gmail)
    await markAsSent(SEND_CHANNELS.EMAIL);

    setStatusMsg("✅ Gmail opened. Click Send inside Gmail.");
    setTimeout(() => setStatusMsg(""), 4000);
  }

  function copyMessage() {
    navigator.clipboard.writeText(reminder.message);
    setStatusMsg("📋 Message copied.");
    setTimeout(() => setStatusMsg(""), 2000);
  }

  function openEmailThread() {
    const q = encodeURIComponent(reminder.invoice_number);
    window.open(`https://mail.google.com/mail/u/0/#search/${q}`, "_blank");
  }

  /* ================= UI ================= */

  return (
    <div style={overlay}>
      <div style={panel}>
        {/* HEADER */}
        <div style={header}>
          <div>
            <h3 style={title}>Reminder Preview</h3>
            <div style={subTitle}>
              Invoice <strong>{reminder.invoice_number}</strong>{" "}
              <span style={toneBadge(reminder.tone)}>{reminder.tone}</span>
            </div>
          </div>
          <button onClick={onClose} style={closeBtn}>
            ×
          </button>
        </div>

        {/* ✅ STATUS */}
        {statusMsg && <div style={statusBox}>{statusMsg}</div>}

        {/* META */}
        <div style={metaGrid}>
          <Meta label="Client" value={reminder.client_name} />
          <Meta label="Amount Due" value={`₹${reminder.balance}`} />
          <Meta label="Overdue" value={`${reminder.overdueDays} days`} />
          <Meta
            label="Last Reminder"
            value={
              effectiveLastSentAt
                ? formatRelativeTime(effectiveLastSentAt, now)
                : "Not sent yet"
            }
          />
        </div>

        {/* SEND VIA */}
        <div style={sendViaWrap}>
          <div style={sendViaLabel}>
            Click the mode by which you want to send the reminder
          </div>

          <div style={sendViaOptions}>
            <span
              style={
                mode === SEND_CHANNELS.MANUAL
                  ? sendViaActive
                  : sendViaOption
              }
              onClick={() => setMode(SEND_CHANNELS.MANUAL)}
            >
              Manual
            </span>

            <span
              style={
                hasEmail
                  ? mode === SEND_CHANNELS.EMAIL
                    ? sendViaActive
                    : sendViaOption
                  : sendViaDisabled
              }
              onClick={hasEmail ? () => setMode(SEND_CHANNELS.EMAIL) : undefined}
            >
              Email
            </span>

            <span style={sendViaDisabled}>WhatsApp (soon)</span>
          </div>

          {/* EMAIL STATUS */}
          {effectiveLastSentAt && (
            <div style={emailCooldownBox} onClick={openEmailThread}>
              <strong>Last reminder sent</strong>{" "}
              {formatRelativeTime(effectiveLastSentAt, now)} ·
              <span style={emailLink}> View email</span>
            </div>
          )}
        </div>

        {/* MESSAGE */}
        <label style={msgLabel}>Message to be sent</label>
        <textarea style={messageBox} value={reminder.message} readOnly />

        {/* MODE INFO */}
        <div style={cooldownBox}>
          {isCooldown ? (
            <>
              <strong>Cooldown active</strong>
              <br />
              You can send the next reminder in{" "}
              <strong>{cooldownDaysLeft} days</strong>.
            </>
          ) : mode === SEND_CHANNELS.MANUAL ? (
            "You have chosen to send this reminder manually."
          ) : (
            "Clicking “Open Gmail” will open a ready-to-send draft in Gmail for the client."
          )}
        </div>

        {/* FOOTER */}
        <div style={footer}>
          <button onClick={copyMessage} style={ghostBtn}>
            Copy message
          </button>

          {!isCooldown && mode === SEND_CHANNELS.MANUAL && (
            <button onClick={handleManualSend} style={primaryBtn}>
              Mark as Sent
            </button>
          )}

          {!isCooldown && mode === SEND_CHANNELS.EMAIL && (
            <button onClick={handleEmailSend} style={primaryBtn}>
              Open Gmail
            </button>
          )}

          <button onClick={onClose} style={ghostBtn}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Meta({ label, value }) {
  return (
    <div>
      <div style={metaLabel}>{label}</div>
      <div style={metaValue}>{value}</div>
    </div>
  );
}

function formatRelativeTime(date, nowMs) {
  const diff = Math.floor((nowMs - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} days ago`;
}

/* ================= STYLES (UNCHANGED UI) ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 100,
};

const panel = {
  background: "#fff",
  borderRadius: 18,
  padding: 26,
  width: 600,
  boxShadow: "0 25px 70px rgba(0,0,0,.25)",
};

const header = { display: "flex", justifyContent: "space-between" };
const title = { fontSize: 20, fontWeight: 700 };
const subTitle = { fontSize: 13, color: "#64748b" };
const closeBtn = { fontSize: 24, border: "none", background: "transparent" };

const statusBox = {
  marginTop: 12,
  padding: "10px 14px",
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  fontSize: 13,
  fontWeight: 600,
};

const metaGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 14,
  marginBottom: 18,
};

const metaLabel = { fontSize: 12, color: "#64748b" };
const metaValue = { fontWeight: 600 };

const sendViaWrap = { marginBottom: 16 };
const sendViaLabel = { fontSize: 13, fontWeight: 600 };
const sendViaOptions = { display: "flex", gap: 8 };

const sendViaActive = {
  padding: "6px 12px",
  borderRadius: 999,
  border: "1px solid #6366f1",
  color: "#6366f1",
  fontSize: 12,
  fontWeight: 600,
};

const sendViaOption = {
  padding: "6px 12px",
  borderRadius: 999,
  border: "1px solid #16a34a",
  color: "#16a34a",
  cursor: "pointer",
};

const sendViaDisabled = {
  padding: "6px 12px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  color: "#94a3b8",
};

const emailCooldownBox = {
  marginTop: 10,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 13,
  color: "#9a3412",
  cursor: "pointer",
};

const emailLink = {
  marginLeft: 4,
  textDecoration: "underline",
  fontWeight: 600,
};

const msgLabel = { fontSize: 13, fontWeight: 600 };
const messageBox = {
  width: "100%",
  height: 150,
  padding: 14,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
};

const footer = {
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
  marginTop: 20,
};

const primaryBtn = {
  background: "#6366f1",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontWeight: 600,
};

const ghostBtn = {
  background: "transparent",
  border: "1px solid #cbd5f5",
  borderRadius: 10,
  padding: "10px 16px",
};

const cooldownBox = {
  background: "#f8fafc",
  border: "1px dashed #cbd5f5",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  color: "#475569",
};

function toneBadge(tone) {
  const map = {
    Gentle: "#22c55e",
    Firm: "#f97316",
    Escalation: "#ef4444",
  };
  return {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background: map[tone],
    color: "#fff",
  };
}
