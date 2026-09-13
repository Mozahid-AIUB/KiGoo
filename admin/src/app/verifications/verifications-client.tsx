"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { approveVerification, rejectVerification } from "./actions";
import type { VerificationRow } from "./page";

const STATUS_FILTERS = ["pending", "verified", "rejected"] as const;

function statusBadgeClass(status: VerificationRow["status"]) {
  if (status === "verified") return "bg-[#E4F5EC] text-[#1B9C6E]";
  if (status === "rejected") return "bg-[#FBE9E7] text-[#D64545]";
  return "bg-[#FBF0DD] text-[#B8862E]";
}

export default function VerificationsClient({
  initialVerifications,
}: {
  initialVerifications: VerificationRow[];
}) {
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("pending");
  const [reviewing, setReviewing] = useState<VerificationRow | null>(null);

  const filtered = initialVerifications.filter((v) => v.status === filter);

  return (
    <div className="min-h-screen bg-[#F7F6FB] text-[#3D3170]">
      <header className="border-b border-[#E4E1F5] bg-white px-8 py-5">
        <p className="text-[11px] font-semibold tracking-wide text-[#6B5FD9]">KIGOO ADMIN</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#221B3D]">Student Verifications</h1>
          <nav className="flex gap-4 text-sm font-semibold text-[#7A7590]">
            <Link href="/trips" className="hover:text-[#221B3D]">
              Trips
            </Link>
            <Link href="/routes" className="hover:text-[#221B3D]">
              Routes
            </Link>
            <span className="text-[#221B3D]">Verifications</span>
            <Link href="/checkin" className="hover:text-[#221B3D]">
              Check-in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-8">
        <div className="mb-6 flex gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                filter === s
                  ? "bg-[#221B3D] text-white"
                  : "border border-[#E4E1F5] bg-white text-[#7A7590] hover:bg-[#FAFAFC]"
              }`}
            >
              {s} ({initialVerifications.filter((v) => v.status === s).length})
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E4E1F5] bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E4E1F5] bg-[#FAFAFC] text-[11px] uppercase tracking-wide text-[#7A7590]">
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">University</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Student ID</th>
                <th className="px-5 py-3 font-semibold">Submitted</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#7A7590]">
                    No {filter} verifications.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="border-b border-[#EDEBF7] last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-[#221B3D]">
                        {v.profile ? `${v.profile.first_name} ${v.profile.last_name}` : "—"}
                      </div>
                      <div className="text-xs text-[#7A7590]">{v.profile?.email}</div>
                    </td>
                    <td className="px-5 py-3">{v.university ?? "—"}</td>
                    <td className="px-5 py-3">{v.department ?? "—"}</td>
                    <td className="px-5 py-3">{v.student_id ?? "—"}</td>
                    <td className="px-5 py-3">{new Date(v.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setReviewing(v)}
                        className="text-xs font-semibold text-[#221B3D] hover:underline"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {reviewing && <ReviewModal verification={reviewing} onClose={() => setReviewing(null)} />}
    </div>
  );
}

function ReviewModal({
  verification,
  onClose,
}: {
  verification: VerificationRow;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = () => {
    startTransition(async () => {
      await approveVerification(verification.id);
      onClose();
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      await rejectVerification(verification.id, rejectReason);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#221B3D]/40 px-4 py-8">
      <div className="flex max-h-[calc(100vh-4rem)] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EDEBF7] px-6 py-4">
          <h2 className="text-lg font-bold text-[#221B3D]">Review Verification</h2>
          <button onClick={onClose} className="text-[#7A7590] hover:text-[#221B3D]" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4">
          <div className="mb-4 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusBadgeClass(
                verification.status
              )}`}
            >
              {verification.status}
            </span>
          </div>

          <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-[#7A7590]">Name</dt>
            <dd className="font-medium text-[#221B3D]">
              {verification.profile
                ? `${verification.profile.first_name} ${verification.profile.last_name}`
                : "—"}
            </dd>
            <dt className="text-[#7A7590]">Email</dt>
            <dd className="font-medium text-[#221B3D]">{verification.profile?.email ?? "—"}</dd>
            <dt className="text-[#7A7590]">Phone</dt>
            <dd className="font-medium text-[#221B3D]">{verification.profile?.phone ?? "—"}</dd>
            <dt className="text-[#7A7590]">University</dt>
            <dd className="font-medium text-[#221B3D]">{verification.university ?? "—"}</dd>
            <dt className="text-[#7A7590]">Department</dt>
            <dd className="font-medium text-[#221B3D]">{verification.department ?? "—"}</dd>
            <dt className="text-[#7A7590]">Student ID</dt>
            <dd className="font-medium text-[#221B3D]">{verification.student_id ?? "—"}</dd>
          </dl>

          {verification.id_card_url && (
            <a
              href={verification.id_card_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 block max-h-64 overflow-hidden rounded-lg border border-[#E4E1F5]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={verification.id_card_url} alt="Student ID card" className="w-full object-contain" />
            </a>
          )}

          {verification.status === "rejected" && verification.rejection_reason && (
            <p className="mb-4 rounded-lg bg-[#FBE9E7] px-3 py-2 text-sm text-[#D64545]">
              Previously rejected: {verification.rejection_reason}
            </p>
          )}
        </div>

        <div className="border-t border-[#EDEBF7] px-6 py-4">
          {showRejectForm ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (shown to the student)"
                rows={3}
                className="w-full rounded-lg border border-[#E4E1F5] bg-white px-3 py-2 text-sm text-[#3D3170] focus:outline-none focus:ring-2 focus:ring-[#6B5FD9]"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 rounded-lg border border-[#E4E1F5] py-2.5 text-sm font-semibold text-[#7A7590] hover:bg-[#FAFAFC]"
                >
                  Back
                </button>
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-[#D64545] py-2.5 text-sm font-semibold text-white hover:bg-[#B83A3A] disabled:opacity-50"
                >
                  {isPending ? "Rejecting…" : "Confirm Reject"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={isPending}
                className="flex-1 rounded-lg border border-[#D64545] py-2.5 text-sm font-semibold text-[#D64545] hover:bg-[#FBE9E7] disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={isPending || verification.status === "verified"}
                className="flex-1 rounded-lg bg-[#1B9C6E] py-2.5 text-sm font-semibold text-white hover:bg-[#16815A] disabled:opacity-50"
              >
                {isPending ? "Approving…" : "Approve"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
