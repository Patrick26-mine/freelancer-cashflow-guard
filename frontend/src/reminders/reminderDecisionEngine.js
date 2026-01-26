import { REMINDER_RULES } from "./reminderRules";

/* ======================================================
   REMINDER DECISION ENGINE — NULL SAFE
====================================================== */

export function getReminderDecision({
  invoice,
  lastReminder,
  overdueDays,
}) {
  /* ---------- HARD GUARDS ---------- */

  if (!invoice) return null;

  if (invoice.balance <= 0) return null;

  if (overdueDays < REMINDER_RULES.MIN_DAYS_LATE) {
    return null;
  }

  /* ---------- DETERMINE TONE ---------- */

  let tone = "Gentle";

  for (const rule of REMINDER_RULES.TONE_BY_OVERDUE_DAYS) {
    if (overdueDays >= rule.min && overdueDays <= rule.max) {
      tone = rule.tone;
      break;
    }
  }

  /* ---------- COOLDOWN LOGIC ---------- */

  let allowed = true;
  let cooldownDaysRemaining = 0;

  if (lastReminder?.sent_at && lastReminder?.tone) {
    const cooldownWindow =
      REMINDER_RULES.COOLDOWN_DAYS[lastReminder.tone] ?? 0;

    const lastSent = new Date(lastReminder.sent_at);
    const now = new Date();

    const daysSinceLastReminder = Math.floor(
      (now - lastSent) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastReminder < cooldownWindow) {
      allowed = false;
      cooldownDaysRemaining =
        cooldownWindow - daysSinceLastReminder;
    }
  }

  /* ---------- FINAL DECISION ---------- */

  return {
    tone,
    allowed,
    cooldownDaysRemaining,
    overdueDays,
  };
}
