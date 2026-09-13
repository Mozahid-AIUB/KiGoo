import { supabase } from '../lib/supabase';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type Verification = {
  id: string;
  university: string | null;
  department: string | null;
  student_id: string | null;
  id_card_url: string | null;
  status: VerificationStatus;
  rejection_reason: string | null;
};

export async function fetchVerification(userId: string): Promise<Verification | null> {
  const { data } = await supabase
    .from('verifications')
    .select('id, university, department, student_id, id_card_url, status, rejection_reason')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function submitVerification(params: {
  userId: string;
  university: string;
  department: string;
  studentId: string;
  idCardUrl: string;
  existingId?: string;
}) {
  const { userId, university, department, studentId, idCardUrl, existingId } = params;

  if (existingId) {
    return supabase
      .from('verifications')
      .update({
        university,
        department,
        student_id: studentId,
        id_card_url: idCardUrl,
        status: 'pending',
        rejection_reason: null,
      })
      .eq('id', existingId);
  }

  return supabase.from('verifications').insert({
    user_id: userId,
    university,
    department,
    student_id: studentId,
    id_card_url: idCardUrl,
    status: 'pending',
  });
}

export async function uploadIdCard(userId: string, localUri: string): Promise<string> {
  const ext = localUri.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from('id-cards')
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;

  const { data } = await supabase.storage.from('id-cards').createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? '';
}
