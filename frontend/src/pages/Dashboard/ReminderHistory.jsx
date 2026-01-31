import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

import { Bell } from "lucide-react";

/* ======================================================
   REMINDER HISTORY — PREMIUM RESPONSIVE VERSION
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
        sent_via,
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

  /* APPLY FILTERS */
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
      result = result.filter((r) => r.sent_at.split("T")[0] >= fromDate);
    }

    if (toDate) {
      result = result.filter((r) => r.sent_at.split("T")[0] <= toDate);
    }

    setFiltered(result);
  }

  return (
    <div className="page-surface">
      {/* TITLE */}
      <h2 style={titleStyle}>
        <Bell size={26} />
        Reminder History
      </h2>

      <p style={subtitle}>
        A complete log of all reminders you’ve sent.
      </p>

      {/* ✅ FILTER BAR (Premium Mobile Layout) */}
      <div className="mobile-form-bar">
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

      {/* ✅ TABLE SCROLL WRAPPER */}
      <div className="table-wrap">
        <table style={tableStyle}>
          <thead>
            <tr>
              {[
                "Invoice #",
                "Client",
                "Amount",
                "Tone",
                "Via",
                "Sent On",
                "Actions",
              ].map((h) => (
                <th key={h} style={thStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={emptyStyle}>
                  No reminders sent yet.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td style={monoCell}>{r.invoice?.invoice_number}</td>
                  <td style={tdStyle}>{r.invoice?.clients?.client_name}</td>
                  <td style={tdStyle}>₹{r.invoice?.balance}</td>

                  <td style={tdStyle}>
                    <span style={pill}>{r.tone}</span>
                  </td>

                  <td style={tdStyle}>
                    <span style={viaPill}>
                      {r.sent_via ? r.sent_via : "Manual"}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    {new Date(r.sent_at).toLocaleDateString()}
                  </td>

                  <td style={tdStyle}>
                    <button
                      onClick={() => setOpenMessage(r)}
                      style={linkBtn}
                    >
                      View
                    </button>{" "}
                    <button
                      onClick={() =>
                        navigate("/invoices", {
                          state: { highlightInvoiceIds: [r.invoice_id] },
                        })
                      }
                      style={linkBtn}
                    >
                      Invoice
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MESSAGE MODAL */}
      {openMessage && (
        <div style={overlay}>
          <div style={modal}>
            <h3>{openMessage.invoice?.invoice_number}</h3>

            <p style={{ fontSize: 13, color: "#64748b" }}>
              {openMessage.invoice?.clients?.client_name} •{" "}
              {openMessage.tone}
            </p>

            <textarea readOnly value={openMessage.message} style={textarea} />

            <button onClick={() => setOpenMessage(null)} style={closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= PREMIUM STYLES ================= */

const titleStyle = {
  fontSize: 26,
  fontWeight: 700,
  marginBottom: 10,
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const subtitle = { color: "#64748b", marginBottom: 18 };

const filterInput = {
  height: 40,
  borderRadius: 12,
  border: "1px solid rgba(203,213,245,0.8)",
  padding: "0 12px",
  fontSize: 14,
  background: "rgba(255,255,255,0.65)",
};

const applyBtn = {
  background: "#6366f1",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "10px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "850px",
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

const monoCell = { ...tdStyle, fontFamily: "monospace" };

const pill = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const viaPill = {
  background: "#e0f2fe",
  color: "#0369a1",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const linkBtn = {
  background: "none",
  border: "none",
  color: "#6366f1",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};

const emptyStyle = {
  padding: 20,
  color: "#64748b",
  textAlign: "center",
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
