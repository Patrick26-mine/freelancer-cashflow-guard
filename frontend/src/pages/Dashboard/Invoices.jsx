import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";

import { FileText } from "lucide-react";

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

  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);

  const [reminderHistory, setReminderHistory] = useState([]);
  const [activeReminder, setActiveReminder] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const [form, setForm] = useState({
    client_id: "",
    issue_date: "",
    due_date: "",
    amount: "",
  });

  /* ================= FETCH ================= */

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
         clients ( client_name )`
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

  useEffect(() => {
    if (!user) return;
    fetchInvoices();
    fetchClients();
    fetchReminderHistory();
  }, [user]);

  /* ================= ADD INVOICE ================= */

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

  /* ================= REMINDER PANEL ================= */

  function openReminderPanel(inv) {
    const suggestion = getDashboardReminderSuggestions(
      [inv],
      reminderHistory
    )[0];

    if (!suggestion) return alert("No reminder available.");

    setActiveReminder(suggestion);
    setPanelOpen(true);
  }

  /* ================= UI ================= */

  return (
    <div className="page-surface">
      {/* TITLE */}
      <h2 style={titleStyle}>
        <FileText size={26} />
        Invoices
      </h2>

      {/* ✅ ENTRY FORM (Premium Mobile Bar) */}
      <form onSubmit={handleAdd} className="mobile-form-bar">
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

      {/* ✅ TABLE SCROLL PREMIUM */}
      <div className="table-wrap">
        <table style={tableStyle}>
          <thead>
            <tr>
              {[
                "Invoice",
                "Client",
                "Due",
                "Amount",
                "Balance",
                "Status",
                "Action",
              ].map((h) => (
                <th key={h} style={thStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" style={emptyStyle}>
                  No invoices yet
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const risk = getInvoiceRisk(inv.due_date, inv.balance);

                return (
                  <tr key={inv.invoice_id}>
                    <td style={tdStyle}>{inv.invoice_number}</td>
                    <td style={tdStyle}>{inv.clients?.client_name}</td>
                    <td style={tdStyle}>{inv.due_date}</td>
                    <td style={tdStyle}>₹{inv.amount}</td>
                    <td style={tdStyle}>₹{inv.balance}</td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...statusBadge,
                          background: risk.color,
                        }}
                      >
                        {risk.label}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <button
                        style={secondaryBtn}
                        onClick={() => openReminderPanel(inv)}
                      >
                        Reminder
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* REMINDER MODAL */}
      <ReminderDetailPanel
        open={panelOpen}
        reminder={activeReminder}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}

/* ================= STYLES ================= */

const titleStyle = {
  fontSize: 26,
  fontWeight: 700,
  marginBottom: 18,
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const inputStyle = {
  height: 40,
  borderRadius: 12,
  border: "1px solid rgba(203,213,245,0.8)",
  padding: "0 12px",
  fontSize: 14,
  background: "rgba(255,255,255,0.65)",
};

const primaryBtn = (colors) => ({
  background: colors.primary,
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "10px 18px",
  fontWeight: 700,
  cursor: "pointer",
});

const secondaryBtn = {
  background: "rgba(238,242,255,0.7)",
  border: "1px solid rgba(99,102,241,0.5)",
  color: "#4338ca",
  borderRadius: 12,
  padding: "8px 14px",
  fontWeight: 600,
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "750px",
};

const thStyle = {
  padding: 14,
  fontWeight: 700,
  textAlign: "left",
};

const tdStyle = {
  padding: 14,
  borderTop: "1px solid rgba(229,231,235,0.6)",
  whiteSpace: "nowrap",
};

const statusBadge = {
  padding: "6px 12px",
  borderRadius: 999,
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
};

const emptyStyle = {
  padding: 20,
  color: "#64748b",
};
