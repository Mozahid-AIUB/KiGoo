"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function approveVerification(id: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("verifications")
    .update({ status: "verified", rejection_reason: null, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/verifications");
}

export async function rejectVerification(id: string, reason: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("verifications")
    .update({
      status: "rejected",
      rejection_reason: reason || "Documents could not be verified.",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/verifications");
}
