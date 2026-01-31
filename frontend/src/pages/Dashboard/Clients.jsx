import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";

import { Users } from "lucide-react";

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

  async function handleAdd(e) {
    e.preventDefault();

    const { error } = await supabase.from("clients").insert({
      ...form,
      user_id: user.id,
    });

    if (error) return alert("Failed to add client");

    setForm({
      client_name: "",
      email: "",
      company_name: "",
      phone: "",
    });

    fetchClients();
  }

  return (
    <div className="page-surface">
      {/* TITLE */}
      <h2 style={titleStyle}>
        <Users size={26} />
        Clients
      </h2>

      {/* ENTRY FORM */}
      <form onSubmit={handleAdd} className="mobile-form-bar">
        <input
          placeholder="Client name"
          value={form.client_name}
          onChange={(e) =>
            setForm({ ...form, client_name: e.target.value })
          }
          required
          style={inputStyle}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          style={inputStyle}
        />

        <input
          placeholder="Company"
          value={form.company_name}
          onChange={(e) =>
            setForm({ ...form, company_name: e.target.value })
          }
          style={inputStyle}
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={inputStyle}
        />

        <button style={primaryBtn(colors)}>Add</button>
      </form>

      {/* SEARCH */}
      <input
        placeholder="Search clients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ ...inputStyle, marginTop: 18 }}
      />

      {/* TABLE */}
      <div className="table-wrap">
        <table style={tableStyle}>
          <thead>
            <tr>
              {["Name", "Email", "Company", "Phone"].map((h) => (
                <th key={h} style={thStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan="4" style={emptyStyle}>
                  No clients yet
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.client_id}>
                  <td style={tdStyle}>{c.client_name}</td>
                  <td style={tdStyle}>{c.email}</td>
                  <td style={tdStyle}>{c.company_name}</td>
                  <td style={tdStyle}>{c.phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

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

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "650px",
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

const emptyStyle = {
  padding: 20,
  color: "#64748b",
};
