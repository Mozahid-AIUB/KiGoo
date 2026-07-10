export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

export type VerificationData = {
  status: VerificationStatus;
  university?: string;
  studentId?: string;
  rejectionReason?: string;
};

export const mockVerification: VerificationData = {
  status: 'none',
};

export function submitVerification(university: string, studentId: string) {
  mockVerification.status = 'pending';
  mockVerification.university = university;
  mockVerification.studentId = studentId;
}

export function approveVerification() {
  mockVerification.status = 'verified';
}
