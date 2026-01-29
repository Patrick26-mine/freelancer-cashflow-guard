import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useLocation } from "react-router-dom";

import { getDashboardReminderSuggestions } from "../../reminders/reminderEngine";
import ReminderDetailPanel from "../../components/dashboard/ReminderDetailPanel";

/* ===== RISK LOGIC ===== */
function getInvoiceRisk(dueDate, balance) {
  if (balance <= 0) return { label: "Paid", color: "#22c55e" };

  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Overdue", color: "#ef4444" };
  if (diffDays <= 3) return { label: "Critical", color: "#dc2626" };
  if (diffDays <= 7) return { label: "Warning", color: "#f97316" };
  if (diffDays <= 14) return { label: "Upcoming", color: "#eab308" };

  return { label: "Scheduled", color: "#64748b" };
}

export default function Invoices() {
  const user = useAuthStore((s) => s.user);
  const colors = useThemeStore((s) => s.colors);
  const location = useLocation();

  const highlightInvoiceIds = location.state?.highlightInvoiceIds || [];

  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);

  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [timeline, setTimeline] = useState({ reminders: [], payments: [] });

  const [reminderHistory, setReminderHistory] = useState([]);
  const [activeReminder, setActiveReminder] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [form, setForm] = useState({
    client_id: "",
    issue_date: "",
    due_date: "",
    amount: "",
  });

  /* ===== FETCH ===== */
  async function fetchInvoices() {
    const { data } = await supabase
      .from("invoice")
      .select(
        `invoice_id,
         invoice_number,
         issue_date,
         due_date,
         amount,
         balance,
         clients ( client_name, email )`
      )
      .order("issue_date", { ascending: false });

    setInvoices(data || []);
  }

  async function fetchClients() {
    const { data } = await supabase
      .from("clients")
      .select("client_id, client_name")
      .order("client_name");

    setClients(data || []);
  }

  async function fetchReminderHistory() {
    const { data } = await supabase
      .from("invoice_reminders")
      .select("invoice_id, sent_at");

    setReminderHistory(data || []);
  }

  async function fetchTimeline(invoiceId) {
    const { data: reminders } = await supabase
      .from("invoice_reminders")
      .select("tone, sent_at")
      .eq("invoice_id", invoiceId)
      .order("sent_at", { ascending: true });

    const { data: payments } = await supabase
      .from("payment")
      .select("amount_paid, payment_date")
      .eq("invoice_id", invoiceId)
      .order("payment_date", { ascending: true });

    setTimeline({
      reminders: reminders || [],
      payments: payments || [],
    });
  }

  useEffect(() => {
    if (!user) return;
    fetchInvoices();
    fetchClients();
    fetchReminderHistory();
  }, [user]);

  /* ===== ADD INVOICE ===== */
  async function handleAdd(e) {
    e.preventDefault();

    const amountNumber = Number(form.amount);
    if (amountNumber <= 0) return alert("Invalid amount");

    const { error } = await supabase.from("invoice").insert({
      client_id: form.client_id,
      issue_date: form.issue_date,
      due_date: form.due_date,
      amount: amountNumber,
      balance: amountNumber,
      user_id: user.id,
    });

    if (error) return alert(error.message);

    setForm({
      client_id: "",
      issue_date: "",
      due_date: "",
      amount: "",
    });

    fetchInvoices();
  }

  function startEdit(inv) {
    setEditingId(inv.invoice_id);
    setEditForm({
      issue_date: inv.issue_date,
      due_date: inv.due_date,
      amount: inv.amount,
    });
  }

  async function saveEdit(id) {
    const { error } = await supabase
      .from("invoice")
      .update({
        issue_date: editForm.issue_date,
        due_date: editForm.due_date,
        amount: Number(editForm.amount),
        balance: Number(editForm.amount),
      })
      .eq("invoice_id", id);

    if (error) return alert(error.message);

    setEditingId(null);
    setEditForm({});
    fetchInvoices();
  }

  async function deleteInvoice(id) {
    if (!confirm("Delete this invoice?")) return;
    await supabase.from("invoice").delete().eq("invoice_id", id);
    fetchInvoices();
  }

  function toggleTimeline(invId) {
    if (expandedInvoice === invId) {
      setExpandedInvoice(null);
      return;
    }
    setExpandedInvoice(invId);
    fetchTimeline(invId);
  }

  function openReminderPanel(inv) {
    const suggestion = getDashboardReminderSuggestions(
      [inv],
      reminderHistory
    )[0];

    if (!suggestion) {
      alert("No reminder available.");
      return;
    }

    if (!suggestion.decision.allowed) {
      alert(
        `Cooldown active. You can send the next reminder in ${suggestion.decision.cooldownDays} days.`
      );
      return;
    }

    setActiveReminder(suggestion);
    setPanelOpen(true);
  }

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui",
        background: "transparent", // ✅ FIX: remove white layer
      }}
    >
      <h2 style={titleStyle}>Invoices</h2>

      {/* ===== ENTRY FORM (OPTION B SOLID CREAM) ===== */}
      <form onSubmit={handleAdd} style={formStyle}>
        <select
          value={form.client_id}
          onChange={(e) =>
            setForm({ ...form, client_id: e.target.value })
          }
          required
          style={inputStyle}
        >
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.client_id} value={c.client_id}>
              {c.client_name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.issue_date}
          onChange={(e) =>
            setForm({ ...form, issue_date: e.target.value })
          }
          required
          style={inputStyle}
        />

        <input
          type="date"
          value={form.due_date}
          onChange={(e) =>
            setForm({ ...form, due_date: e.target.value })
          }
          required
          style={inputStyle}
        />

        <input
          placeholder="₹ Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
          required
          style={inputStyle}
        />

        <button style={primaryBtn(colors)}>Add</button>
      </form>

      {/* ===== TABLE (OPTION B SOLID CREAM) ===== */}
      <div style={{ width: "100%", overflowX: "auto" }}></div>
      <table style={tableStyle}>
        <thead>
          <tr>
            {["Invoice", "Client", "Due", "Amount", "Balance", "Status", "Actions"].map(
              (h) => (
                <th key={h} style={thStyle}>
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv) => {
            const risk = getInvoiceRisk(inv.due_date, inv.balance);
            const isHighlighted = highlightInvoiceIds.includes(inv.invoice_id);

            const suggestion = getDashboardReminderSuggestions(
              [inv],
              reminderHistory
            )[0];

            const cooldownActive = suggestion && !suggestion.decision.allowed;

            return (
              <tr
                key={inv.invoice_id}
                style={isHighlighted ? highlightRow : undefined}
              >
                <td style={tdStyle}>{inv.invoice_number}</td>
                <td style={tdStyle}>{inv.clients?.client_name}</td>
                <td style={tdStyle}>{inv.due_date}</td>
                <td style={tdStyle}>₹{inv.amount}</td>
                <td style={tdStyle}>₹{inv.balance}</td>
                <td style={tdStyle}>
                  <span style={{ ...statusBadge, background: risk.color }}>
                    {risk.label}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button style={secondaryBtn} onClick={() => startEdit(inv)}>
                    Edit
                  </button>{" "}
                  <button
                    style={secondaryBtn}
                    onClick={() => deleteInvoice(inv.invoice_id)}
                  >
                    Delete
                  </button>{" "}
                  <button
                    style={secondaryBtn}
                    onClick={() => toggleTimeline(inv.invoice_id)}
                  >
                    View Timeline
                  </button>{" "}
                  {cooldownActive ? (
                    <span style={cooldownText}>
                      Cooldown {suggestion.decision.cooldownDays}d
                    </span>
                  ) : (
                    <button
                      style={secondaryBtn}
                      onClick={() => openReminderPanel(inv)}
                    >
                      Send Reminder
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ReminderDetailPanel
        open={panelOpen}
        reminder={activeReminder}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}

/* ===== OPTION B STYLES ===== */

const titleStyle = { fontSize: 26, fontWeight: 700, marginBottom: 16 };

const formStyle = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto",
  gap: 16,
  marginBottom: 24,

  background: "#fffaf3", // ✅ Cream
  padding: 20,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
};

const inputStyle = {
  height: 38,
  borderRadius: 8,
  border: "1px solid #cbd5f5",
  padding: "0 12px",
};

const primaryBtn = (colors) => ({
  background: colors.primary,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "0 18px",
  fontWeight: 600,
});

const secondaryBtn = {
  background: "#eef2ff",
  border: "1px solid #6366f1",
  color: "#4338ca",
  borderRadius: 8,
  padding: "6px 12px",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fffaf3", // ✅ Cream table
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  overflow: "hidden",
};

const thStyle = {
  padding: 14,
  background: "#fef3c7", // ✅ Soft pastel header
  fontWeight: 700,
};

const tdStyle = {
  padding: 14,
  borderBottom: "1px solid #e5e7eb",
};

const statusBadge = {
  padding: "6px 12px",
  borderRadius: 999,
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
};

const highlightRow = { background: "#fff7ed" };
const cooldownText = { fontSize: 13, fontWeight: 600, color: "#64748b" };
