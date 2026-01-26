/* ======================================================
   Reminder Engine — SINGLE SOURCE OF TRUTH
   Purpose:
   - Decide WHICH invoices appear
   - Decide TONE
   - Enforce COOLDOWN (based on real events)
   - Channel-ready (manual / email / whatsapp)
====================================================== */

const COOLDOWN_DAYS = 5;
const UPCOMING_WINDOW_DAYS = 7;

/* ================= HELPERS ================= */

function daysBetween(a, b) {
  return Math.floor((a - b) / (1000 * 60 * 60 * 24));
}

/* ======================================================
   MAIN EXPORT
====================================================== */

export function getDashboardReminderSuggestions(
  invoices = [],
  reminderHistory = []
) {
  const today = new Date();

  return invoices
    .map((inv) => {
      /* ---------- HARD GUARDS ---------- */
      if (!inv) return null;
      if (inv.balance <= 0) return null; // Paid invoices NEVER appear

      const due = new Date(inv.due_date);
      const diffToDue = daysBetween(due, today); // +ve = future
      const overdueDays = Math.max(0, -diffToDue);

      // ❌ Hide invoices too far in the future
      if (diffToDue > UPCOMING_WINDOW_DAYS) return null;

      /* ---------- HISTORY ---------- */
      const history = reminderHistory
        .filter((r) => r.invoice_id === inv.invoice_id)
        .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));

      const lastReminder = history[0];

      let allowed = true;
      let cooldownDays = 0;

      if (lastReminder) {
        const daysSinceLast = daysBetween(
          today,
          new Date(lastReminder.sent_at)
        );

        if (daysSinceLast < COOLDOWN_DAYS) {
          allowed = false;
          cooldownDays = COOLDOWN_DAYS - daysSinceLast;
        }
      }

      /* ---------- TONE LOGIC ---------- */
      let tone = "Gentle";

      if (overdueDays > 7) tone = "Firm";
      if (overdueDays > 14) tone = "Escalation";

      /* ---------- RETURN NORMALIZED OBJECT ---------- */
      return {
        invoice_id: inv.invoice_id,
        invoice_number: inv.invoice_number,

        client_name: inv.clients?.client_name || "Client",

        // ✅ NEW (email plumbing)
        client_email: inv.clients?.email || null,

        balance: inv.balance,
        due_date: inv.due_date,
        overdueDays,

        tone,

        decision: {
          allowed,
          cooldownDays,
          lastSentAt: lastReminder?.sent_at || null,
        },

        message: buildMessage({
          tone,
          client: inv.clients?.client_name || "Client",
          invoice: inv.invoice_number,
          amount: inv.balance,
          dueDate: inv.due_date,
          overdueDays,
        }),
      };
    })
    .filter(Boolean);
}

/* ======================================================
   MESSAGE BUILDER — PSYCHOLOGICAL LADDER
   (Firm, real, non-bluffy)
====================================================== */

function buildMessage({
  tone,
  client,
  invoice,
  amount,
  dueDate,
  overdueDays,
}) {
  /* ---------- GENTLE (trust-preserving) ---------- */
  if (tone === "Gentle") {
    return `Hi ${client},

Just a quick follow-up regarding invoice ${invoice} for ₹${amount}, due on ${dueDate}.

I wanted to confirm that everything is on track for payment. Please let me know if you need anything from my side to close this smoothly.

Thanks,
Regards`;
  }

  /* ---------- FIRM (accountability trigger) ---------- */
  if (tone === "Firm") {
    return `Hi ${client},

I’m following up on invoice ${invoice} for ₹${amount}, which was due on ${dueDate} and is now overdue by ${overdueDays} days.

Could you please confirm the expected payment date? Having clarity here helps me plan work and timelines accurately.

Looking forward to your update.`;
  }

  /* ---------- ESCALATION (pressure without threat) ---------- */
  return `Hi ${client},

I’m reaching out again regarding invoice ${invoice} for ₹${amount}, which was due on ${dueDate} and remains unpaid after ${overdueDays} days.

At this point, I’ll need a clear confirmation on the payment timeline. Continued delays may impact prioritization and future scheduling.

Please treat this as a priority and share an update today so we can resolve this without further follow-ups.

Thank you.`;
}
