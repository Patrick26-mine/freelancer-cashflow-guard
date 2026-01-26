/* ======================================================
   REMINDER RULES — SINGLE SOURCE OF TRUTH
====================================================== */

/*
RULES OVERVIEW

- Only unpaid invoices are considered
- Invoice must be late >= 7 days
- Escalation path:
  Gentle → Firm → Escalation
- Cooldown applies ONLY if a reminder was actually sent
*/

export const REMINDER_RULES = {
  MIN_DAYS_LATE: 7,

  COOLDOWN_DAYS: {
    Gentle: 3,
    Firm: 5,
    Escalation: 7,
  },

  TONE_BY_OVERDUE_DAYS: [
    { min: 7, max: 14, tone: "Gentle" },
    { min: 15, max: 30, tone: "Firm" },
    { min: 31, max: Infinity, tone: "Escalation" },
  ],
};
