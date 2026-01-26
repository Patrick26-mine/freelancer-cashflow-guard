import { supabase } from "../lib/supabaseClient";

/**
 * Save reminder event only if same tone
 * has NOT already been used for this invoice
 */
export async function saveReminderEvent({
  userId,
  invoiceId,
  tone,
  risk,
  urgency,
  message,
}) {
  // Check if same tone already exists
  const { data: existing } = await supabase
    .from("reminder_events")
    .select("id")
    .eq("invoice_id", invoiceId)
    .eq("tone", tone)
    .limit(1);

  if (existing && existing.length > 0) {
    return { skipped: true };
  }

  // Insert reminder event
  const { error } = await supabase.from("reminder_events").insert({
    user_id: userId,
    invoice_id: invoiceId,
    tone,
    risk,
    urgency,
    message,
    status: "copied",
  });

  if (error) throw error;

  return { saved: true };
}
