import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

/* ======================================================
   REMINDER HISTORY — FILTERABLE + MESSAGE VIEW
====================================================== */

export default function ReminderHistory() {
  const navigate = useNavigate();

  const [reminders, setReminders] = useState([]);
  const [filtered, setFiltered] = useState([]);

  /* FILTER STATES */
  const [clientFilter, setClientFilter] = useState("all");
  const [toneFilter, setToneFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* MESSAGE MODAL */
  const [openMessage, setOpenMessage] = useState(null);

  /* LOAD DATA */
  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    const { data } = await supabase
      .from("invoice_reminders")
      .select(`
        id,
        invoice_id,
        tone,
        message,
        sent_at,
        invoice:invoice_id (
          invoice_number,
          balance,
          clients ( client_name )
        )
      `)
      .eq("state", "sent")
      .order("sent_at", { ascending: false });

    setReminders(data || []);
    setFiltered(data || []);
  }

  /* UNIQUE FILTER OPTIONS */
  const clients = useMemo(() => {
    const set = new Set();
    reminders.forEach((r) => {
      const name = r.invoice?.clients?.client_name;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [reminders]);

  const tones = useMemo(() => {
    const set = new Set();
    reminders.forEach((r) => r.tone && set.add(r.tone));
    return Array.from(set);
  }, [reminders]);

  /* APPLY FILTERS (BUTTON-BASED) */
  function applyFilters() {
    let result = [...reminders];

    if (clientFilter !== "all") {
      result = result.filter(
        (r) => r.invoice?.clients?.client_name === clientFilter
      );
    }

    if (toneFilter !== "all") {
      result = result.filter((r) => r.tone === toneFilter);
    }

    if (fromDate) {
      result = result.filter(
        (r) => r.sent_at.split("T")[0] >= fromDate
      );
    }

    if (toDate) {
      result = result.filter(
        (r) => r.sent_at.split("T")[0] <= toDate
      );
    }

    setFiltered(result);
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui" }}>
      <h2 style={title}>Reminder History</h2>
      <p style={subtitle}>A complete log of all reminders you’ve sent.</p>

      {/* FILTER BAR */}
      <div style={filterBar}>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          style={filterInput}
        >
          <option value="all">All clients</option>
          {clients.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={toneFilter}
          onChange={(e) => setToneFilter(e.target.value)}
          style={filterInput}
        >
          <option value="all">All tones</option>
          {tones.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={filterInput}
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={filterInput}
        />

        <button onClick={applyFilters} style={applyBtn}>
          Apply
        </button>
      </div>

      {/* TABLE */}
      <div style={table}>
        <div style={thead}>
          <span>Invoice</span>
          <span>Client</span>
          <span>Amount</span>
          <span>Tone</span>
          <span>Sent On</span>
          <span>Actions</span>
        </div>

        {filtered.map((r) => (
          <div key={r.id} style={row}>
            <span>{r.invoice?.invoice_number}</span>
            <span>{r.invoice?.clients?.client_name}</span>
            <span>₹{r.invoice?.balance}</span>
            <span>
              <span style={pill}>{r.tone}</span>
            </span>
            <span>{new Date(r.sent_at).toLocaleDateString()}</span>
            <span style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setOpenMessage(r)} style={linkBtn}>
                View message
              </button>
              <button
                onClick={() =>
                  navigate("/invoices", {
                    state: { highlightInvoiceId: r.invoice_id },
                  })
                }
                style={linkBtn}
              >
                View invoice
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* MESSAGE MODAL */}
      {openMessage && (
        <div style={overlay}>
          <div style={modal}>
            <h3>{openMessage.invoice?.invoice_number}</h3>
            <p style={{ fontSize: 13, color: "#64748b" }}>
              {openMessage.invoice?.clients?.client_name} • {openMessage.tone}
            </p>

            <textarea
              readOnly
              value={openMessage.message}
              style={textarea}
            />

            <button onClick={() => setOpenMessage(null)} style={closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const title = { fontSize: 24, fontWeight: 700 };
const subtitle = { color: "#64748b", marginBottom: 16 };

const filterBar = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: 16,
  background: "#f1f5ff",
  borderRadius: 14,
  marginBottom: 16,
};

const filterInput = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #c7d2fe",
};

const applyBtn = {
  padding: "8px 16px",
  borderRadius: 10,
  background: "#6366f1",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const table = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  overflow: "hidden",
};

const thead = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1.5fr",
  padding: 14,
  fontWeight: 700,
  background: "#f8fafc",
};

const row = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1.5fr",
  padding: 14,
  borderTop: "1px solid #e5e7eb",
  alignItems: "center",
};

const pill = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
};

const linkBtn = {
  background: "none",
  border: "none",
  color: "#6366f1",
  cursor: "pointer",
  fontSize: 13,
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal = {
  background: "#fff",
  width: 520,
  borderRadius: 16,
  padding: 20,
};

const textarea = {
  width: "100%",
  height: 200,
  marginTop: 12,
  padding: 12,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  resize: "none",
};

const closeBtn = {
  marginTop: 12,
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
};
