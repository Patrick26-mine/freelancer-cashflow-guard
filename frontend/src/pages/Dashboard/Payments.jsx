import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useLocation } from "react-router-dom";

export default function Payments() {
  const user = useAuthStore((s) => s.user);
  const colors = useThemeStore((s) => s.colors);
  const location = useLocation();

  /* 🔑 HIGHLIGHT IDS FROM DASHBOARD */
  const highlightInvoiceIds = location.state?.highlightInvoiceIds || [];

  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [form, setForm] = useState({
    invoice_id: "",
    payment_date: "",
    amount_paid: "",
    method: "UPI",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */

  async function fetchData() {
    const { data: inv } = await supabase
      .from("invoice")
      .select(
        `
        invoice_id,
        invoice_number,
        balance,
        clients ( client_name )
      `
      )
      .eq("user_id", user.id)
      .gt("balance", 0);

    const { data: pay } = await supabase
      .from("payment")
      .select(
        `
        payment_id,
        payment_date,
        amount_paid,
        method,
        invoice (
          invoice_id,
          invoice_number,
          clients ( client_name )
        )
      `
      )
      .order("payment_date", { ascending: false });

    setInvoices(inv || []);
    setPayments(pay || []);
  }

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const canAdd =
    form.invoice_id && form.payment_date && Number(form.amount_paid) > 0;

  /* ================= ADD ================= */

  async function handleAdd() {
    if (!canAdd || adding) return;
    setAdding(true);

    await supabase.from("payment").insert({
      invoice_id: form.invoice_id,
      payment_date: form.payment_date,
      amount_paid: Number(form.amount_paid),
      method: form.method,
    });

    setForm({
      invoice_id: "",
      payment_date: "",
      amount_paid: "",
      method: "UPI",
    });

    await fetchData();
    setAdding(false);
  }

  /* ================= EDIT ================= */

  function startEdit(p) {
    setEditingId(p.payment_id);
    setEditForm({
      payment_date: p.payment_date,
      amount_paid: p.amount_paid,
      method: p.method,
    });
  }

  async function saveEdit(id) {
    if (saving) return;
    setSaving(true);

    await supabase
      .from("payment")
      .update({
        payment_date: editForm.payment_date,
        amount_paid: Number(editForm.amount_paid),
        method: editForm.method,
      })
      .eq("payment_id", id);

    setEditingId(null);
    setEditForm({});
    await fetchData();
    setSaving(false);
  }

  /* ================= DELETE ================= */

  async function handleDelete(id) {
    if (!confirm("Delete payment? Balance will revert.")) return;
    await supabase.from("payment").delete().eq("payment_id", id);
    fetchData();
  }

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui",
        background: "transparent", // ✅ FIX: remove white layer
      }}
    >
      <h2 style={titleStyle}>Payments</h2>
      <p style={helperText}>
        Record payments received and keep invoice balances accurate.
      </p>

      {/* ADD FORM — OPTION B */}
      <div style={formCard}>
        <div style={formGrid}>
          <Field label="Invoice">
            <select
              value={form.invoice_id}
              onChange={(e) =>
                setForm({ ...form, invoice_id: e.target.value })
              }
              style={inputStyle}
            >
              <option value="">Select invoice</option>
              {invoices.map((i) => (
                <option key={i.invoice_id} value={i.invoice_id}>
                  {i.invoice_number} — {i.clients?.client_name} — ₹{i.balance}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Payment Date">
            <input
              type="date"
              value={form.payment_date}
              onChange={(e) =>
                setForm({ ...form, payment_date: e.target.value })
              }
              style={inputStyle}
            />
          </Field>

          <Field label="Amount Paid">
            <input
              type="number"
              value={form.amount_paid}
              onChange={(e) =>
                setForm({ ...form, amount_paid: e.target.value })
              }
              style={inputStyle}
            />
          </Field>

          <Field label="Method">
            <select
              value={form.method}
              onChange={(e) =>
                setForm({ ...form, method: e.target.value })
              }
              style={inputStyle}
            >
              <option>UPI</option>
              <option>Bank</option>
              <option>Cash</option>
            </select>
          </Field>

          <button
            onClick={handleAdd}
            disabled={!canAdd || adding}
            style={{
              ...primaryBtn(colors),
              opacity: !canAdd || adding ? 0.6 : 1,
            }}
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {/* TABLE — OPTION B */}
      <TableCard>
        <thead>
          <tr>
            {["Invoice", "Client", "Date", "Amount", "Method", "Actions"].map(
              (h) => (
                <th key={h} style={thStyle}>
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan="6" style={emptyStyle}>
                No payments recorded yet.
              </td>
            </tr>
          ) : (
            payments.map((p) => {
              const isHighlighted = highlightInvoiceIds.includes(
                p.invoice?.invoice_id
              );

              return (
                <tr
                  key={p.payment_id}
                  style={
                    isHighlighted
                      ? {
                          background: "#fff7ed",
                          borderLeft: "4px solid #fb923c",
                        }
                      : undefined
                  }
                >
                  <td style={monoCell}>{p.invoice?.invoice_number}</td>
                  <td style={tdStyle}>{p.invoice?.clients?.client_name}</td>

                  {editingId === p.payment_id ? (
                    <>
                      <td style={tdStyle}>
                        <input
                          type="date"
                          value={editForm.payment_date}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              payment_date: e.target.value,
                            })
                          }
                          style={inputStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          type="number"
                          value={editForm.amount_paid}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              amount_paid: e.target.value,
                            })
                          }
                          style={inputStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <select
                          value={editForm.method}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              method: e.target.value,
                            })
                          }
                          style={inputStyle}
                        >
                          <option>UPI</option>
                          <option>Bank</option>
                          <option>Cash</option>
                        </select>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => saveEdit(p.payment_id)}
                          disabled={saving}
                          style={{
                            ...successBtn,
                            opacity: saving ? 0.6 : 1,
                          }}
                        >
                          Save
                        </button>{" "}
                        <button
                          onClick={() => setEditingId(null)}
                          style={secondaryBtn}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={tdStyle}>{p.payment_date}</td>
                      <td style={tdStyle}>₹{p.amount_paid}</td>
                      <td style={tdStyle}>{p.method}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => startEdit(p)}
                          style={editBtn}
                        >
                          Edit
                        </button>{" "}
                        <button
                          onClick={() => handleDelete(p.payment_id)}
                          style={dangerBtn}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </TableCard>
    </div>
  );
}

/* ===== UI HELPERS ===== */

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function TableCard({ children }) {
  return (
    <table style={tableStyle}>
      {children}
    </table>
  );
}

/* ===== OPTION B STYLES ===== */

const titleStyle = { fontSize: 26, fontWeight: 700 };
const helperText = { color: "#64748b", marginBottom: 20 };
const labelStyle = { fontWeight: 600, marginBottom: 6, display: "block" };

const formCard = {
  background: "#fffaf3", // ✅ Cream
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
  gap: 30,
  alignItems: "end",
};

const inputStyle = {
  height: 38,
  borderRadius: 6,
  border: "1px solid #cbd5f5",
  padding: "0 10px",
  fontSize: 14,
  width: "100%",
};

const primaryBtn = (colors) => ({
  height: 44,
  background: colors.primary,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  padding: "0 20px",
});

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fffaf3", // ✅ Cream table
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  overflow: "hidden",
  textAlign: "center",
};

const thStyle = {
  padding: 14,
  background: "#fef3c7", // ✅ Soft header
  fontWeight: 700,
};

const tdStyle = {
  padding: 14,
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 500,
};

const monoCell = { ...tdStyle, fontFamily: "monospace" };

const editBtn = {
  background: "#6366f1",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  fontWeight: 600,
};

const successBtn = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  fontWeight: 600,
};

const secondaryBtn = {
  background: "#e5e7eb",
  color: "#111",
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  fontWeight: 600,
};

const dangerBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  fontWeight: 600,
};

const emptyStyle = { padding: 20, color: "#64748b" };
