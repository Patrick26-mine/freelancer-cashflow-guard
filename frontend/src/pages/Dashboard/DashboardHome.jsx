// src/pages/Dashboard/DashboardHome.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useNavigate } from "react-router-dom";

import { getDashboardReminderSuggestions } from "../../reminders/reminderEngine";
import ReminderDetailPanel from "../../components/dashboard/ReminderDetailPanel";

/* ======================================================
   DASHBOARD HOME — OPTION B BACKGROUND FIX
   ✅ Only UI background updated (removed white blocks)
====================================================== */

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const colors = useThemeStore((s) => s.colors);
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [reminderHistory, setReminderHistory] = useState([]);
  const [payments, setPayments] = useState([]);

  const [stats, setStats] = useState({
    unpaidCount: 0,
    outstanding: 0,
    overdueAmount: 0,
    lateCount: 0,
    oldestOverdueDays: 0,
    paidThisMonth: 0,
    unpaidInvoiceIds: [],
    overdueInvoiceIds: [],
    paidInvoiceIds: [],
  });

  const [activeReminder, setActiveReminder] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user]);

  async function fetchDashboard() {
    const { data: invoiceData } = await supabase
      .from("invoice")
      .select(
        "invoice_id, invoice_number, balance, due_date, clients(client_name, email)"
      );

    const { data: reminderData } = await supabase
      .from("invoice_reminders")
      .select("invoice_id, sent_at");

    const { data: paymentData } = await supabase
      .from("payment")
      .select("invoice_id, amount_paid, payment_date");

    setInvoices(invoiceData || []);
    setReminderHistory(reminderData || []);
    setPayments(paymentData || []);

    computeStats(invoiceData || [], paymentData || []);
  }

  function computeStats(invoiceData, paymentData) {
    const today = new Date();

    let unpaidCount = 0;
    let outstanding = 0;
    let overdueAmount = 0;
    let lateCount = 0;
    let oldestOverdueDays = 0;

    const unpaidInvoiceIds = [];
    const overdueInvoiceIds = [];
    const paidInvoiceIds = [];

    invoiceData.forEach((inv) => {
      if (inv.balance > 0) {
        unpaidCount++;
        outstanding += inv.balance;
        unpaidInvoiceIds.push(inv.invoice_id);

        const diffDays =
          (today - new Date(inv.due_date)) / (1000 * 60 * 60 * 24);

        if (diffDays > 7) {
          overdueAmount += inv.balance;
          lateCount++;
          overdueInvoiceIds.push(inv.invoice_id);
          oldestOverdueDays = Math.max(oldestOverdueDays, diffDays);
        }
      }
    });

    let paidThisMonth = 0;
    const m = today.getMonth();
    const y = today.getFullYear();

    paymentData.forEach((p) => {
      const d = new Date(p.payment_date);
      if (d.getMonth() === m && d.getFullYear() === y) {
        paidThisMonth += p.amount_paid;
        if (p.invoice_id) paidInvoiceIds.push(p.invoice_id);
      }
    });

    setStats({
      unpaidCount,
      outstanding,
      overdueAmount,
      lateCount,
      oldestOverdueDays,
      paidThisMonth,
      unpaidInvoiceIds,
      overdueInvoiceIds,
      paidInvoiceIds,
    });
  }

  /* ================= REMINDERS ================= */

  const suggestions = getDashboardReminderSuggestions(
    invoices,
    reminderHistory
  )
    .filter((r) => r.overdueDays >= 7)
    .filter((r) => r.decision.allowed);

  function openInvoicesWithHighlight(ids) {
    navigate("/invoices", {
      state: { highlightInvoiceIds: ids },
    });
  }

  function openPaymentsWithHighlight(ids) {
    navigate("/payments", {
      state: { highlightInvoiceIds: ids },
    });
  }

  /* ================= UI ================= */

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui",
        background: "transparent", // ✅ removes white overlay
        padding: 0,
      }}
    >
      <h2 style={titleStyle}>Dashboard</h2>
      <p style={subText}>
        A quick snapshot of your cash flow and outstanding payments.
      </p>

      {/* ================= KPI ================= */}
      <div style={kpiGrid}>
        <KpiCard
          title="Total Outstanding"
          value={`₹${stats.outstanding}`}
          linkText={`${stats.unpaidCount} unpaid invoices`}
          color="#ef4444"
          onClick={() => openInvoicesWithHighlight(stats.unpaidInvoiceIds)}
        />

        <KpiCard
          title="Overdue Amount"
          value={`₹${stats.overdueAmount}`}
          linkText={`Oldest overdue: ${stats.oldestOverdueDays} days`}
          color="#f97316"
          onClick={() => openInvoicesWithHighlight(stats.overdueInvoiceIds)}
        />

        <KpiCard
          title="Paid This Month"
          value={`₹${stats.paidThisMonth}`}
          linkText="View payments"
          color="#22c55e"
          onClick={() => openPaymentsWithHighlight(stats.paidInvoiceIds)}
        />

        <KpiCard
          title="Invoices At Risk"
          value={stats.lateCount}
          linkText="Needs intervention"
          color="#6366f1"
          onClick={() => openInvoicesWithHighlight(stats.overdueInvoiceIds)}
        />
      </div>

      {/* ================= REMINDERS ================= */}
      <h3 style={sectionTitle}>Suggested Reminders</h3>

      {suggestions.length === 0 ? (
        <div style={emptyLine}>No reminders available (cooldowns active).</div>
      ) : (
        <div style={reminderWrap}>
          {suggestions.map((r) => (
            <div key={r.invoice_id} style={reminderCard}>
              <div style={reminderHeader}>
                <strong>{r.invoice_number}</strong>
                <span style={toneBadge(r.tone)}>{r.tone}</span>
              </div>

              <p style={reminderMsg}>{r.message.slice(0, 140)}…</p>

              <div style={ctaRow}>
                <button
                  style={secondaryBtn}
                  onClick={() => openInvoicesWithHighlight([r.invoice_id])}
                >
                  View Invoice
                </button>

                <button
                  style={primaryBtn}
                  onClick={() => {
                    setActiveReminder(r);
                    setPanelOpen(true);
                  }}
                >
                  View / Send
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReminderDetailPanel
        open={panelOpen}
        reminder={activeReminder}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}

/* ================= HELPERS ================= */

function KpiCard({ title, value, linkText, color, onClick }) {
  return (
    <div style={card}>
      <div style={cardTitle}>{title}</div>
      <div style={{ ...cardValue, color }}>{value}</div>
      <span style={kpiLink} onClick={onClick}>
        {linkText}
      </span>
    </div>
  );
}

/* ================= STYLES ================= */

const titleStyle = { fontSize: 26, fontWeight: 700 };
const subText = { color: "#64748b", marginBottom: 20 };

const sectionTitle = {
  fontSize: 20,
  fontWeight: 700,
  margin: "28px 0 12px",
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
  marginBottom: 32,
};

const card = {
  background: "#fffaf0", // ✅ soft pastel card instead of pure white
  border: "1px solid #f1e5d0",
  borderRadius: 16,
  padding: 24,
};

const cardTitle = { fontWeight: 600, color: "#64748b" };
const cardValue = { fontSize: 28, fontWeight: 800, margin: "8px 0" };

const kpiLink = {
  fontSize: 13,
  color: "#2563eb",
  cursor: "pointer",
  textDecoration: "underline",
};

const emptyLine = { fontSize: 14, color: "#94a3b8" };
const reminderWrap = { display: "grid", gap: 16 };

const reminderCard = {
  background: "#fffaf0", // ✅ matches Option B theme
  border: "1px solid #fecaca",
  borderRadius: 14,
  padding: 16,
};

const reminderHeader = {
  display: "flex",
  justifyContent: "space-between",
};

const reminderMsg = { fontSize: 14, color: "#475569" };
const ctaRow = { display: "flex", gap: 10 };

const primaryBtn = {
  background: "#6366f1",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "6px 12px",
};

const secondaryBtn = {
  border: "1px solid #6366f1",
  background: "#eef2ff",
  color: "#4338ca",
  borderRadius: 8,
  padding: "6px 12px",
};

function toneBadge(tone) {
  const map = {
    Gentle: "#22c55e",
    Firm: "#f97316",
    Escalation: "#ef4444",
  };
  return {
    padding: "4px 10px",
    borderRadius: 999,
    background: map[tone],
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
  };
}
