import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";

export default function Clients() {
  const user = useAuthStore((s) => s.user);
  const colors = useThemeStore((s) => s.colors);

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    client_name: "",
    email: "",
    company_name: "",
    phone: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  /* ================= FETCH ================= */
  async function fetchClients() {
    if (!user) return;

    let query = supabase
      .from("clients")
      .select("*")
      .order("updated_at", { ascending: false });

    if (search) {
      query = query.or(
        `client_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data } = await query;
    setClients(data || []);
  }

  useEffect(() => {
    fetchClients();
  }, [user, search]);

  /* ================= ADD ================= */
  async function handleAdd(e) {
    e.preventDefault();

    // 🔒 GLOBAL email uniqueness check (matches DB constraint)
    const { data: existing } = await supabase
      .from("clients")
      .select("client_id, client_name")
      .eq("email", form.email)
      .limit(1);

    if (existing && existing.length > 0) {
      alert(
        `This email is already used by another client (${existing[0].client_name}).`
      );
      return;
    }

    const { error } = await supabase.from("clients").insert({
      ...form,
      user_id: user.id,
    });

    if (error) {
      alert("Failed to add client");
      return;
    }

    setForm({
      client_name: "",
      email: "",
      company_name: "",
      phone: "",
    });

    fetchClients();
  }

  /* ================= EDIT ================= */
  function startEdit(client) {
    setEditingId(client.client_id);
    setEditForm({
      client_name: client.client_name,
      email: client.email,
      company_name: client.company_name,
      phone: client.phone,
    });
  }

  async function saveEdit(id) {
    const { error } = await supabase
      .from("clients")
      .update(editForm)
      .eq("client_id", id);

    if (error) {
      alert("Failed to update client");
      return;
    }

    setEditingId(null);
    setEditForm({});
    fetchClients();
  }

  /* ================= DELETE ================= */
  async function handleDelete(id) {
    if (!confirm("Delete this client?")) return;
    await supabase.from("clients").delete().eq("client_id", id);
    fetchClients();
  }

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui",
        background: "transparent", // ✅ FIX (same as Dashboard)
      }}
    >
      <h2 style={titleStyle}>Clients</h2>

      {/* ADD FORM */}
      <form onSubmit={handleAdd} style={formGrid}>
        <Field label="Client Name">
          <input
            value={form.client_name}
            onChange={(e) =>
              setForm({ ...form, client_name: e.target.value })
            }
            required
            style={inputStyle}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={inputStyle}
          />
        </Field>

        <Field label="Company">
          <input
            value={form.company_name}
            onChange={(e) =>
              setForm({ ...form, company_name: e.target.value })
            }
            style={inputStyle}
          />
        </Field>

        <Field label="Phone">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={inputStyle}
          />
        </Field>

        <button type="submit" style={primaryBtn(colors)}>
          Add
        </button>
      </form>

      {/* SEARCH */}
      <input
        placeholder="Search clients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ ...inputStyle, margin: "16px 0" }}
      />

      {/* TABLE */}
      <div style={{ width: "100%", overflowX: "auto" }}></div>
      <TableCard>
        <thead>
          <tr>
            {[
              "ID",
              "Name",
              "Email",
              "Company",
              "Phone",
              "Updated",
              "Actions",
            ].map((h) => (
              <th key={h} style={thStyle}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {clients.length === 0 ? (
            <tr>
              <td colSpan="7" style={emptyStyle}>
                No clients yet
              </td>
            </tr>
          ) : (
            clients.map((c) => (
              <tr key={c.client_id}>
                {editingId === c.client_id ? (
                  <>
                    <ClientIdCell id={c.client_id} />
                    <td style={tdStyle}>
                      <input
                        value={editForm.client_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            client_name: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        value={editForm.company_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            company_name: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      {new Date(c.updated_at).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => saveEdit(c.client_id)}
                        style={successBtn}
                      >
                        Save
                      </button>{" "}
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        style={secondaryBtn}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <ClientIdCell id={c.client_id} />
                    <td style={tdStyle}>{c.client_name}</td>
                    <td style={tdStyle}>{c.email}</td>
                    <td style={tdStyle}>{c.company_name}</td>
                    <td style={tdStyle}>{c.phone}</td>
                    <td style={tdStyle}>
                      {new Date(c.updated_at).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        style={editBtn}
                      >
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        onClick={() => handleDelete(c.client_id)}
                        style={dangerBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </TableCard>
    </div>
  );
}

/* ===== HELPERS & STYLES ===== */

function ClientIdCell({ id }) {
  return (
    <td style={{ ...tdStyle, fontFamily: "monospace" }} title={id}>
      {id.slice(0, 8)}…
    </td>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

/* ✅ OPTION B — Solid Cream Table */
function TableCard({ children }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "#fffaf3",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {children}
    </table>
  );
}

const titleStyle = { fontSize: 26, fontWeight: 700, marginBottom: 16 };
const labelStyle = { fontWeight: 600, marginBottom: 6, display: "block" };

const inputStyle = {
  height: 38,
  borderRadius: 6,
  border: "1px solid #cbd5f5",
  padding: "0 10px",
  fontSize: 14,
  width: "100%",
};

/* ✅ OPTION B — Cream Form */
const formGrid = {
  background: "#fffaf3",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 20,
  display: "grid",
  gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr auto",
  gap: 30,
  alignItems: "end",
};

const primaryBtn = (colors) => ({
  height: 44,
  background: colors.primary,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "0 20px",
  fontWeight: 600,
});

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

const thStyle = {
  padding: 14,
  background: "#fef3c7",
  fontWeight: 700,
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle = {
  padding: 14,
  borderBottom: "1px solid #e5e7eb",
};

const emptyStyle = { padding: 20, color: "#64748b" };
