import { createSupabaseServiceClient } from "@/lib/supabase/server";
import VerificationsClient from "./verifications-client";

export const dynamic = "force-dynamic";

export type VerificationRow = {
  id: string;
  user_id: string;
  university: string | null;
  department: string | null;
  student_id: string | null;
  id_card_url: string | null;
  status: "pending" | "verified" | "rejected";
  rejection_reason: string | null;
  created_at: string;
  profile: { first_name: string; last_name: string; email: string; phone: string } | null;
};

export default async function VerificationsPage() {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("verifications")
    .select(
      "id, user_id, university, department, student_id, id_card_url, status, rejection_reason, created_at, profile:profiles(first_name, last_name, email, phone)"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return <VerificationsClient initialVerifications={(data ?? []) as unknown as VerificationRow[]} />;
}
